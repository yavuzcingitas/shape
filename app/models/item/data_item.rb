class Item
  class DataItem < Item
    belongs_to :legend_item, class_name: 'Item::LegendItem', optional: true
    # TODO: deprecate this relationship after migrating
    # all existing DataItems to have datasets
    belongs_to :data_source, polymorphic: true, optional: true

    has_many :data_items_datasets,
             -> { ordered },
             dependent: :destroy,
             class_name: 'DataItemsDatasets',
             foreign_key: 'data_item_id'
    has_many :datasets, through: :data_items_datasets

    store_accessor :data_settings,
                   :d_measure,
                   :d_filters, # This is an optional data source (Collection or Item)
                   :d_timeframe

    validates :report_type, presence: true
    # validate :collections_and_items_validations, if: :report_type_collections_and_items?
    # validate :network_app_metric_validations, if: :report_type_network_app_metric?
    # validate :record_validations, if: :report_type_record?
    after_create :create_legend_item, if: :create_legend_item?

    delegate :selected_measures,
             to: :legend_item,
             allow_nil: true

    # VALID_MEASURES = %w[
    #   participants
    #   viewers
    #   activity
    #   content
    #   collections
    #   items
    #   records
    # ].freeze
    # VALID_TIMEFRAMES = %w[
    #   ever
    #   month
    #   week
    # ].freeze

    enum report_type: {
      report_type_collections_and_items: 0,
      report_type_network_app_metric: 1,
      report_type_record: 2,
      report_type_question_item: 3,
    }

    attr_accessor :dont_create_legend_item

    def create_legend_item(parent_collection = nil)
      parent_collection ||= parent
      builder = CollectionCardBuilder.new(
        params: {
          order: parent_collection_card.order + 1,
          width: 1,
          height: 2,
          item_attributes: {
            type: 'Item::LegendItem',
          },
        },
        parent_collection: parent_collection,
      )
      if builder.create
        update(legend_item: builder.collection_card.record)
      else
        errors.add(:legend_item, builder.errors.full_messages.join('. '))
        throw :abort
      end
    end

    # Override duplicate! so we can control legend item cloning
    def duplicate!(**args)
      self.dont_create_legend_item = true
      duplicate = super(args)
      return duplicate if duplicate.new_record? || duplicate.errors.present?

      duplicate
    end

    def title
      datasets.first&.title
    end

    def description
      datasets.first&.description
    end

    private

    # def load_datasets
    #   if report_type_record?
    #     return [] if data_content['datasets'].blank?
    #     data_content['datasets'].map do |data|
    #       Hashie::Mash.new(data)
    #     end.order_by(&:order)
    #   elsif report_type_network_app_metric?
    #     DataReport::NetworkAppMetric.call(self).map do |data|
    #       Hashie::Mash.new(data)
    #     end.order_by(&:order)
    #   else
    #     []
    #   end
    # end

    # def record_validations
    #   return if data_content.present?
    #   errors.add(:data_content, 'must be present')
    # end
    #
    # def network_app_metric_validations
    #   return if url.present?
    #   errors.add(:url, 'must be present')
    # end

    # def collections_and_items_validations
    #   if !VALID_MEASURES.include?(d_measure.to_s)
    #     errors.add(:data_settings, "measure must be one of #{VALID_MEASURES.join(', ')}")
    #   end
    #   return if VALID_TIMEFRAMES.include?(d_timeframe.to_s)
    #   errors.add(:data_settings, "timeframe must be one of #{VALID_TIMEFRAMES.join(', ')}")
    # end

    def create_legend_item?
      return false if dont_create_legend_item ||
                      report_type_network_app_metric? ||
                      report_type_collections_and_items?

      legend_item.blank? && parent_collection_card.present?
    end
  end
end
