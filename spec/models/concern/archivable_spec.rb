require 'rails_helper'

describe Archivable, type: :concern do
  it 'should have concern included' do
    expect(Item.ancestors).to include(Archivable)
    expect(Collection.ancestors).to include(Archivable)
    expect(CollectionCard.ancestors).to include(Archivable)
  end

  describe 'scopes' do
    let!(:collection) { create(:collection, num_cards: 3) }
    let!(:collection_card) { create(:collection_card, collection: collection) }

    it 'should be active by default' do
      expect(collection.active?).to be true
    end

    it 'should have a default scope that only finds active objects' do
      expect {
        collection.archive!
      }.to change(Collection, :count).by(-1)
    end

    it 'should use default active scope when looking up related objects' do
      expect {
        collection.collection_cards.first.archive!
      }.to change(collection.collection_cards, :count).by(-1)
    end
  end

  describe 'methods' do
    describe '#archive!' do
      let(:collection_card) { create(:collection_card_collection) }
      let!(:collection) { create(:collection, num_cards: 3, parent_collection_card: collection_card) }
      let!(:subcollection) { create(:collection, parent_collection_card: collection.collection_cards.last) }

      it 'can be archived' do
        collection_card.archive!
        expect(collection_card.active?).to be false
        expect(collection_card.archived?).to be true
      end

      it 'should archive related items/collections' do
        collection_card.archive!
        expect(collection_card.archived?).to be true
        expect(collection_card.collection.archived?).to be true
      end

      it 'should archive the parent card with the collection' do
        collection.archive!
        expect(collection.archived?).to be true
        expect(collection_card.archived?).to be true
      end

      it 'should recursively archive everything within a collection' do
        # archiving from the parent card
        collection_card.archive!
        # should archive the collection
        expect(collection.archived?).to be true
        # and that collection's card(s)
        expect(collection.collection_cards.first.archived?).to be true
        # including each card's items/collections...
        expect(collection.collection_cards.first.item.archived?).to be true
        expect(subcollection.archived?).to be true
      end
    end
  end
end
