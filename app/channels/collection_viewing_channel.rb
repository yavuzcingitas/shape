class CollectionViewingChannel < ApplicationCable::Channel
  # All public methods are exposed to consumers

  def subscribed
    return reject if collection.nil? || current_ability.cannot?(:read, collection)

    collection.started_viewing(current_user, dont_notify: true)
    stream_from collection.stream_name
  end

  def unsubscribed
    return reject if collection.nil?

    collection.stopped_viewing(current_user, dont_notify: true)
  end

  private

  def collection
    Collection.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    nil
  end
end
