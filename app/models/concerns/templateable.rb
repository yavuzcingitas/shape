module Templateable
  extend ActiveSupport::Concern

  included do
    acts_as_tagger
    has_many :templated_collections,
             class_name: 'Collection',
             foreign_key: :template_id,
             inverse_of: :template
    belongs_to :template,
               class_name: 'Collection',
               optional: true

    after_create :add_template_tag, if: :master_template?, unless: :subtemplate?
    after_create :add_template_instance_tag, if: :templated?, unless: :subtemplate_instance?
  end

  def profile_template?
    return false unless master_template?

    organization.profile_template_id == id
  end

  def system_required?
    return false unless master_template?

    profile_template?
  end

  # copy all the cards from this template into a new collection
  def setup_templated_collection(for_user:, collection:, synchronous: :async)
    # important that this is first so that the collection knows it is "templated"
    collection.update(template: self)
    return if collection_cards.blank?

    CollectionCardDuplicator.call(
      to_collection: collection,
      cards: collection_cards,
      for_user: for_user,
      building_template_instance: true,
      synchronous: synchronous,
    )
  end

  # This gets called upon:
  # - template card archive (CollectionCard.archive_all!)
  # - template card unarchive (Collection.unarchive_cards!)
  # - template card create (CollectionCardBuilder)
  # - template card resize/move (CollectionUpdater)
  # - duplicate template card (CollectionCard#duplicate)
  # - move template card (CardMover)
  def queue_update_template_instances
    # no need to queue up the job for nonexistent instances
    return unless master_template? && templated_collections.active.present?

    UpdateTemplateInstancesWorker.perform_async(id)
  end

  def update_test_template_instance_types!
    return unless is_a?(Collection::TestCollection)

    templated_collections.active.each do |instance|
      instance.update(
        collection_to_test_id: collection_to_test_id.nil? ? nil : instance.parent.id,
      )
    end
  end

  def update_template_instances
    templated_collections.active.each do |instance|
      # this is an erroneous case, should not exist (and could lead to issues)
      next if instance.inside_a_master_template?

      move_cards_deleted_from_master_template(instance)
      add_cards_from_master_template(instance)
      # important that update gets called after add, that way
      # any new cards created above also adopt their new order
      update_cards_on_template_instance(instance)
      instance.reorder_cards!
      instance.touch
    end

    return unless submission_box_template_test?

    # method in test_collection to update all submissions
    update_submissions_launch_status
  end

  def add_cards_from_master_template(instance)
    cards = cards_added_to_master_template(instance).select do |card|
      if instance.is_a?(Collection::TestCollection) && card.card_question_type.blank?
        false
      elsif card.record.try(:templated?)
        # ABORT: should not allow duplicating a template instance in this manner;
        # this could lead to infinite loops. (similar to note above)
        false
      else
        true
      end
    end

    CollectionCardDuplicator.call(
      to_collection: instance,
      cards: cards,
      for_user: instance.created_by,
      building_template_instance: true,
      synchronous: :all_levels,
    )
  end

  def update_cards_on_template_instance(instance)
    master_cards = pinned_cards_by_id
    instance.collection_cards.pinned.each do |card|
      master = master_cards[card.templated_from_id]
      next if master.blank? # Blank if this card was just added

      TemplateInstanceCardUpdater.call(instance_card: card, master_card: master, master_template: self)
    end
  end

  def move_cards_deleted_from_master_template(instance)
    cards = cards_removed_from_master_template(instance)
    return unless cards.present?

    if instance.is_a?(Collection::TestCollection)
      # for tests, we just delete any pinned cards that were removed from the master
      CollectionCard.where(id: cards.pluck(:id)).destroy_all
      return
    end
    deleted_cards_coll = instance.find_or_create_deleted_cards_collection
    transaction do
      # TODO: do something here if the cards already exist in the deleted coll?
      # e.g. when template editor archives/unarchives cards
      card_mover = CardMover.new(
        from_collection: instance,
        to_collection: deleted_cards_coll,
        cards: cards,
        placement: 'end',
        card_action: 'move',
        # don't need to go through the hassle of reassigning roles,
        # the cards being moved already have the correct ones
        # reassign_permissions: false,
      )
      moved_cards = card_mover.call
      # card_mover will return false if error
      return false unless moved_cards

      # Unpin all cards so user can edit
      CollectionCard.where(
        id: moved_cards.map(&:id),
      ).update_all(pinned: false)

      # Notify that cards have been moved
      moved_cards.each do |card|
        ActivityAndNotificationBuilder.call(
          # TODO: this should really be whoever initiated the action
          actor: created_by || instance.created_by,
          organization: instance.organization,
          target: instance, # Assign as target so we can route to it
          action: :archived_from_template,
          subject_user_ids: card.record.editors[:users].pluck(:id),
          subject_group_ids: card.record.editors[:groups].pluck(:id),
          source: card.record,
        )
      end
    end
  end

  def find_or_create_deleted_cards_collection
    coll = deleted_cards_collection
    return coll if coll.present?

    builder = CollectionCardBuilder.new(
      params: {
        order: 0,
        identifier: 'deleted-from-template',
        collection_attributes: {
          name: 'Deleted From Template',
        },
      },
      parent_collection: self,
      user: created_by,
    )
    return builder.collection_card.record if builder.create
  end

  def deleted_cards_collection
    collections.find_by(name: 'Deleted From Template')
  end

  # The following methods map the difference between:
  # - pinned_cards on the master template
  # - instance cards where templated_from_id == pinned.id
  def cards_removed_from_master_template(instance)
    instance.templated_cards_by_templated_from_id.slice(
      *(instance.templated_cards_by_templated_from_id.keys - pinned_cards_by_id.keys),
    ).values
  end

  def cards_added_to_master_template(instance)
    pinned_cards_by_id.slice(
      *(pinned_cards_by_id.keys - instance.templated_cards_by_templated_from_id.keys),
    ).values
  end

  def templated_cards_by_templated_from_id
    @templated_cards_by_templated_from_id ||= collection_cards
                                              .where.not(templated_from: nil)
                                              .each_with_object({}) do |card, h|
      h[card.templated_from_id] = card
    end
  end

  def pinned_cards_by_id
    @pinned_cards_by_id ||= collection_cards
                            .pinned
                            .each_with_object({}) do |card, h|
      h[card.id] = card
    end
  end

  def add_template_tag
    # create the special #template tag
    tag(
      self,
      with: 'template',
      on: :tags,
    )
    update_cached_tag_lists
    # no good way around saving a 2nd time after_create
    save
  end

  def add_template_instance_tag
    # create the special #template tag
    tag(
      self,
      with: template.name.parameterize,
      on: :tags,
    )
    update_cached_tag_lists
    # no good way around saving a 2nd time after_create
    save
  end

  def add_submission_box_tag
    tag(
      self,
      with: 'submission-template',
      on: :tags,
    )
    update_cached_tag_lists
    save
  end

  # is this collection made from a template?
  def templated?
    template_id.present?
  end

  def convert_to_template!
    all_child_collections.update_all(master_template: true, template_id: nil)
    CollectionCard
      .where(parent_id: [id] + all_child_collections.pluck(:id))
      .update_all(pinned: true)
    update(master_template: true, template_id: nil)
  end
end
