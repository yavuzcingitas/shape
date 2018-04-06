class SerializableCollection < BaseJsonSerializer
  ROLES_LIMIT = 5

  type 'collections'

  attributes :id, :created_at, :name

  cached_attribute :tag_list

  cached_attribute :cover do
    CollectionCover.new(@object).generate
  end

  attribute :type do
    @object.type || @object.class.name.to_s
  end

  attribute :breadcrumb do
    Breadcrumb::ForUser.new(
      @object.breadcrumb,
      @current_user,
    ).viewable_to_api
  end

  belongs_to :organization

  has_many :collection_cards do
    data do
      @object.collection_cards_viewable_by(
        @object.collection_cards,
        @current_user,
      )
    end
  end

  attribute :can_edit do
    @current_ability.can?(:edit, @object)
  end

  has_many :roles
end
