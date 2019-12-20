class ActivityAndNotificationBuilder < SimpleService
  attr_reader :errors, :activity

  def initialize(
    actor:,
    target:,
    action:,
    subject_user_ids: [],
    subject_group_ids: [],
    omit_user_ids: [],
    omit_group_ids: [],
    combine: false,
    content: nil,
    source: nil,
    destination: nil,
    organization: nil,
    should_notify: true
  )
    @actor = actor
    @target = target
    @action = action
    # "subjects" can also refer to the people meant to be notified,
    # e.g. in the case of "archive" it will be all the admins of that record
    @subject_user_ids = subject_user_ids
    @subject_group_ids = subject_group_ids
    @omit_user_ids = omit_user_ids
    @omit_group_ids = omit_group_ids
    @combine = combine
    @content = content
    @source = source
    @destination = destination
    @organization = organization || actor&.current_organization || target&.organization
    @errors = []
    @activity = nil
    @created_notifications = []
    @should_notify = should_notify
  end

  def call
    create_activity
    cache_activity_count_and_reindex
    return unless @should_notify && @activity&.should_notify?

    create_notifications_async
  end

  private

  def create_activity
    @activity = Activity.new(
      actor: @actor,
      target: @target,
      action: @action,
      organization: @organization,
      content: @content,
      source: @source,
      destination: @destination,
    )
    unless @activity.no_subjects?
      @activity.subject_user_ids = @subject_user_ids
      @activity.subject_group_ids = @subject_group_ids
    end
    @activity.save
  end

  def cache_activity_count_and_reindex
    @target.cache_activity_count!
    # reindex for boosting search results by activity_count
    Collection.where(id: [@target.id] + @target.breadcrumb).reindex
  end

  def create_notifications_async
    CreateActivityNotificationsWorker.perform_async(
      @activity.id,
      @omit_user_ids,
      @omit_group_ids,
      @combine,
    )
  end
end
