require 'rails_helper'

RSpec.describe CollectionCard, type: :model do
  context 'validations' do
    it { should validate_presence_of(:parent) }
    it { should validate_presence_of(:order) }

    describe '#single_item_or_collection_is_present' do
      let(:collection_card) { build(:collection_card) }
      let(:item) { create(:text_item) }
      let(:collection) { create(:collection) }

      it 'should add error if both item and collection are present' do
        collection_card.item = item
        collection_card.collection = collection
        expect(collection_card.valid?).to be false
        expect(collection_card.errors.full_messages).to include('Only one of Item or Collection can be assigned')
      end
    end

    describe '#card_is_only_non_reference' do
      context 'with item' do
        let!(:collection_card) { create(:collection_card_item) }
        # parent_collection_card relationship gets cached without a reload
        let(:item) { collection_card.item.reload }

        it 'should add error if item already has non-reference card' do
          card = build(:collection_card_item, item: item)
          expect(card.reference?).to be false
          expect(card.valid?).to be false
          expect(card.errors[:item]).to include('already has a primary card')
        end

        it 'should be valid if using reference card' do
          card = build(:collection_card_item, :reference, item: item)
          expect(card.reference?).to be true
          expect(card.valid?).to be true
        end
      end

      context 'with collection' do
        let!(:collection_card) { create(:collection_card_collection) }
        let!(:collection) { collection_card.collection.reload }

        it 'should add error if collection already has non-reference card' do
          card = build(:collection_card_collection, collection: collection)
          expect(card.reference?).to be false
          expect(card.valid?).to be false
          expect(card.errors[:collection]).to include('already has a primary card')
        end

        it 'should be valid if using reference card' do
          card = build(:collection_card_collection, :reference, collection: collection)
          expect(card.reference?).to be true
          expect(card.valid?).to be true
        end
      end
    end
  end

  describe '#duplicate!' do
    let!(:collection_card) { create(:collection_card_item) }
    let!(:collection_card_collection) { create(:collection_card_collection) }

    it 'should create copy of card' do
      expect(collection_card.duplicate!.id).not_to eq(collection_card.id)
    end

    it 'should duplicate collection' do
      expect { collection_card_collection.duplicate! }.to change(Collection, :count).by(1)
    end

    it 'should duplicate item' do
      expect { collection_card.duplicate! }.to change(Item, :count).by(1)
    end

    it 'should not call increment_card_orders!' do
      expect_any_instance_of(CollectionCard).not_to receive(:increment_card_orders!)
      collection_card.duplicate!
    end

    context 'with shallow true' do
      it 'should not duplicate item' do
        expect { collection_card.duplicate!(shallow: true) }.not_to change(Item, :count)
      end

      it 'should not duplicate collection' do
        expect { collection_card_collection.duplicate!(shallow: true) }.not_to change(Collection, :count)
      end
    end

    context 'with update_order true' do
      it 'should call increment_card_orders!' do
        expect_any_instance_of(CollectionCard).to receive(:increment_card_orders!)
        collection_card.duplicate!(update_order: true)
      end
    end
  end

  describe '#increment_card_orders!' do
    let(:collection) { create(:collection) }
    let!(:collection_cards) { create_list(:collection_card, 5, parent: collection) }

    before do
      # Make sure cards are in sequential order
      collection_cards.each_with_index do |card, i|
        card.update_attribute(:order, i)
      end
    end

    it 'should increment all orders by 1' do
      collection_cards.first.increment_card_orders!
      order_arr = collection_cards.map(&:reload).map(&:order)
      expect(order_arr).to match_array([0, 2, 3, 4, 5])
    end

    it 'should return true if success' do
      expect(collection_cards.first.increment_card_orders!).to be true
    end

    context 'with another card created at same order as existing' do
      let(:second_card_order) { collection_cards[1].order }
      let!(:dupe_card) do
        create(:collection_card, parent: collection, order: second_card_order)
      end

      it 'should increment all cards by 1, and leave dupe card' do
        expect(dupe_card.order).to eq(second_card_order)
        dupe_card.increment_card_orders!
        order_array = collection_cards.map(&:reload).map(&:order)
        expect(dupe_card.reload.order).to eq(1)
        expect(order_array).to match_array([0, 2, 3, 4, 5])
      end
    end
  end

  describe '#decrement_card_orders!' do
    let(:collection) { create(:collection) }
    let!(:collection_cards) { create_list(:collection_card, 5, parent: collection) }

    before do
      # Make sure cards are in sequential order
      collection_cards.each_with_index do |card, i|
        card.update_attribute(:order, i)
      end
    end

    it 'should decrement all orders by 1' do
      collection_cards.last.decrement_card_orders!
      order_arr = collection_cards.map(&:reload).map(&:order)
      expect(order_arr).to match_array([-1, 0, 1, 2, 4])
    end

    it 'should return true if success' do
      expect(collection_cards.last.decrement_card_orders!).to be true
    end
  end
end
