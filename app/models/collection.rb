class Collection < ApplicationRecord
  include Breadcrumbable
  include Resourceable
  include Archivable
  resourceable roles: [Role::EDITOR, Role::VIEWER],
               edit_role: Role::EDITOR,
               view_role: Role::VIEWER

  archivable as: :parent_collection_card,
             with: %i[collection_cards reference_collection_cards]
  resourcify

  has_many :collection_cards,
           -> { active },
           foreign_key: :parent_id
  # All collection cards this is linked to
  has_many :reference_collection_cards,
           -> { reference },
           class_name: 'CollectionCard',
           inverse_of: :referenced_collection
  has_many :items, through: :collection_cards
  has_many :collections, through: :collection_cards
  has_one :parent_collection_card,
          -> { primary },
          class_name: 'CollectionCard',
          inverse_of: :collection
  delegate :parent, to: :parent_collection_card, allow_nil: true

  belongs_to :organization, optional: true
  belongs_to :cloned_from, class_name: 'Collection', optional: true

  after_create :inherit_roles_from_parent

  validates :name, presence: true, if: :base_collection_type?
  validates :organization, presence: true
  before_validation :inherit_parent_organization_id, on: :create

  scope :root, -> { where.not(organization_id: nil) }
  scope :not_custom_type, -> { where(type: nil) }
  scope :user, -> { where(type: 'Collection::UserCollection') }
  scope :shared_with_me, -> { where(type: 'Collection::SharedWithMeCollection') }

  accepts_nested_attributes_for :collection_cards

  # Searchkick config
  searchkick
  # active == don't index archived collections
  # where(type: nil) == don't index User/SharedWithMe collections
  scope :search_import, -> { active.where(type: nil).includes(:items) }

  def search_data
    {
      name: name,
      content: search_content,
      organization_id: organization_id,
    }
  end

  def search_content
    # Current functionality for getting a collection's searchable "text content":
    # - go through all items in the collection
    # - for TextItems, grab the first 200 characters of their content
    # - for other items (e.g. media), grab the name
    # - join it all together into one blob of text, remove non-normal characters
    items.map do |item|
      if item.is_a? Item::TextItem
        item.plain_content.truncate(200, separator: /\s/, omission: '')
      else
        item.name
      end
    end.join(' ').gsub(/[^0-9A-Za-z\']/, ' ')
  end
  # <-- End Searchkick

  amoeba do
    enable
    exclude_association :collection_cards
    exclude_association :items
    exclude_association :collections
    exclude_association :parent_collection_card
  end

  def duplicate!(copy_parent_card: false)
    # Clones collection and all embedded items/collections
    c = amoeba_dup
    c.cloned_from = self

    if copy_parent_card && parent_collection_card.present?
      c.parent_collection_card = parent_collection_card.duplicate!(shallow: true)
      c.parent_collection_card.collection = c
    end

    collection_cards.each do |collection_card|
      c.collection_cards << collection_card.duplicate!
    end

    if c.save && c.parent_collection_card.present?
      c.parent_collection_card.save
    end

    c
  end

  def parent
    return parent_collection_card.parent if parent_collection_card.present?

    organization
  end

  def children
    (items + collections)
  end

  def subcollection?
    organization.blank?
  end

  def searchable?
    true
  end

  def should_index?
    active?
  end

  def read_only?
    false
  end

  def breadcrumb_title
    name
  end

  def collection_cards_viewable_by(cached_cards, user)
    cached_cards ||= collection_cards.includes(:items, :collections)
    cached_cards.select do |collection_card|
      collection_card.record.can_view?(user)
    end
  end

  private

  def inherit_roles_from_parent
    AddRolesToChildrenWorker.perform_async(role_ids, id, self.class.name.to_s)
  end

  def organization_blank?
    organization.blank?
  end

  def parent_collection_card_blank?
    parent_collection_card.blank?
  end

  def parent_collection
    # this first case should return e.g. when using CollectionCardBuilder
    return parent if parent_collection_card.present?
    # if the collection is in process of being built, parent_collection_card will always be nil
    # (currently mostly useful for specs, when we are creating models directly)
    if (primary = collection_cards.reject(&:reference).first)
      return primary.parent
    end
    nil
  end

  def inherit_parent_organization_id
    return true if organization.present?
    return true unless parent_collection.present?
    self.organization_id = parent_collection.organization_id
  end

  def base_collection_type?
    self.class.name == 'Collection'
  end
end
