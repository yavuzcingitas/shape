require 'rails_helper'

RSpec.describe CollectionCardDuplicator, type: :service do
  describe '#call' do
    let(:user) { create(:user) }
    let!(:from_collection) { create(:collection, num_cards: 3, add_viewers: [user]) }
    let(:default_moving_cards) { from_collection.collection_cards.first(2) }
    let(:moving_cards) { default_moving_cards }
    let!(:to_collection) do
      create(:collection, num_cards: 3, add_editors: [user])
    end
    let(:placement) { 'beginning' }
    let(:synchronous) { :async }
    let(:service) do
      CollectionCardDuplicator.new(
        to_collection: to_collection,
        cards: moving_cards,
        placement: placement,
        for_user: user,
        synchronous: synchronous,
      )
    end

    it 'creates Placeholder cards that point to the originals' do
      expect(moving_cards.map(&:parent_id).uniq).to match_array [from_collection.id]
      new_cards = service.call

      first_cards = to_collection.reload.collection_cards.first(2)
      # newly created cards should be duplicates
      expect(first_cards).to match_array new_cards
      # should point back to original items
      expect(first_cards.map(&:item)).to match_array moving_cards.map(&:item)
      expect(first_cards.all?(&:placeholder?)).to be true
      expect(to_collection.collection_cards.count).to eq 5
    end

    it 'calls CardDuplicatorMapperFindLinkedCardsWorker to map cards' do
      expect(CardDuplicatorMapperFindLinkedCardsWorker).to receive(:perform_async).with(
        instance_of(String), # batch id
        instance_of(Array), # new card ids
        user.id,
        false,
      )
      service.call
    end

    it 'calls CollectionCardDuplicationWorker to complete the duplication' do
      allow(CollectionCardDuplicationWorker).to receive(:perform_async).and_call_original
      new_cards = service.call
      expect(new_cards.map(&:id)).not_to match_array(moving_cards.map(&:id))
      expect(CollectionCardDuplicationWorker).to have_received(:perform_async).with(
        instance_of(String), # batch id
        new_cards.map(&:id), # new card ids
        to_collection.id,
        user.id,
        false, # system collection
        false, # synchronous
        false, # building_template_instance
      )
    end

    context 'if synchronous is all levels' do
      let!(:synchronous) { :all_levels }

      it 'calls CollectionCardDuplicationWorker synchronously' do
        expect(CollectionCardDuplicationWorker).to receive(:perform_sync).with(
          instance_of(String), # batch id
          moving_cards.map(&:id), # existing card ids
          to_collection.id,
          user.id,
          false, # system collection
          true, # synchronous
          false, # building_template_instance
        )
        service.call
      end
    end

    context 'if synchronous is first level' do
      let!(:synchronous) { :first_level }

      it 'calls CollectionCardDuplicationWorker synchronously, but async sub-processes' do
        expect(CollectionCardDuplicationWorker).to receive(:perform_sync).with(
          instance_of(String), # batch id
          moving_cards.map(&:id), # existing card ids
          to_collection.id,
          user.id,
          false, # system collection
          false, # synchronous
          false, # building_template_instance
        )
        service.call
      end
    end

    context 'with integer order' do
      let(:placement) { 1 }

      it 'duplicates cards starting at the specified order' do
        new_cards = service.call
        expect(new_cards.map(&:order)).to eq [1, 2]
        expect(to_collection.collection_cards.pluck(:type, :order)).to eq([
          ['CollectionCard::Primary', 0],
          ['CollectionCard::Placeholder', 1],
          ['CollectionCard::Placeholder', 2],
          ['CollectionCard::Primary', 3],
          ['CollectionCard::Primary', 4],
        ])
      end
    end

    context 'when to_collection is a foamcore board' do
      let!(:to_collection) { create(:board_collection, num_cards: 3, add_editors: [user]) }
      let(:new_cards) { service.call }
      let(:target_empty_row) { to_collection.empty_row_for_moving_cards }

      it 'sets row of duplicated cards 2 rows after the last non-blank row' do
        new_cards.each_with_index do |card, index|
          expect(card.parent_id).to eq to_collection.id
          expect(card.row).to eq target_empty_row
          expect(card.col).to eq index
        end
      end
    end
  end
end
