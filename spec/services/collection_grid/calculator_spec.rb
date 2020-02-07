require 'rails_helper'

RSpec.describe CollectionGrid::Calculator, type: :service do
  # this is intentionally written similar to CollectionGridCalculator frontend test
  context 'normal collection' do
    let(:collection) { create(:collection, num_cards: 8) }
    let(:cards) { collection.collection_cards }

    before do
      cards[0].update(width: 1, height: 1)
      cards[1].update(width: 2, height: 2)
      cards[2].update(width: 1, height: 2)
      cards[3].update(width: 1, height: 1)
      cards[4].update(width: 3, height: 1)
      cards[5].update(width: 2, height: 1)
      cards[6].update(width: 2, height: 2)
      cards[7].update(width: 1, height: 1)
    end
    describe '#calculate_rows_cols' do
      it 'should calculate the 4 column layout of the given cards' do
        CollectionGrid::Calculator.calculate_rows_cols(cards)
        # col, row to match x, y on frontend
        expect(cards.pluck(:col, :row)).to eq([
          [0, 0],
          [1, 0],
          [3, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [2, 3],
          [0, 4],
        ])
      end
    end
  end

  context 'foamcore collection with existing cards on the board' do
    let(:collection) { create(:board_collection, num_cards: 8) }
    let(:from_collection) { create(:board_collection) }
    let(:cards) { collection.collection_cards }

    before do
      cards[0].update(row: 0, col: 0, width: 4, height: 1)
      cards[1].update(row: 1, col: 0, width: 1, height: 2)
      cards[2].update(row: 1, col: 1, width: 1, height: 1)
      cards[3].update(row: 1, col: 2, width: 1, height: 1)
      cards[4].update(row: 1, col: 4, width: 1, height: 1)
      cards[5].update(row: 2, col: 2, width: 2, height: 1)
      cards[6].update(row: 3, col: 1, width: 1, height: 1)
      if cards.count > 7
        cards[7].update(row: 3, col: 2, width: 3, height: 1)
      end
      # board matrix
      # [[0, 0, 0, 0, _, _, _, _, _, _, _, _, _, _, _, _],
      #  [1, 2, 3, _, 4, _, _, _, _, _, _, _, _, _, _, _],
      #  [1, _, 5, 5, _, _, _, _, _, _, _, _, _, _, _, _],
      #  [_, 6, 7, 7, 7, _, _, _, _, _, _, _, _, _, _, _],
    end

    describe '#board_matrix' do
      context 'with 4-wide board' do
        let(:collection) { create(:board_collection, num_cards: 7, num_columns: 4) }

        before do
          cards[4].update(row: 3, col: 2, width: 2, height: 1)
          # board matrix
          # [[0, 0, 0, 0],
          #  [1, 2, 3, _,],
          #  [1, _, 5, 5],
          #  [_, 4, 6, 6],
        end

        it 'should generate the array of cards and blank spaces' do
          matrix = CollectionGrid::Calculator.board_matrix(collection: collection)
          expect(matrix[0]).to eq(
            [cards[0]] * 4,
          )
          expect(matrix[1]).to eq(
            [cards[1], cards[2], cards[3], nil],
          )
          expect(matrix[2]).to eq(
            [cards[1], nil, cards[5], cards[5]],
          )
        end
      end

      it 'should generate the array of cards and blank spaces' do
        matrix = CollectionGrid::Calculator.board_matrix(collection: collection)
        expect(matrix[0]).to eq(
          [cards[0]] * 4 + [nil] * 12,
        )
        expect(matrix[1]).to eq(
          [cards[1], cards[2], cards[3], nil, cards[4]] + [nil] * 11,
        )
      end

      it 'should omit moving_cards if indicated' do
        matrix = CollectionGrid::Calculator.board_matrix(
          collection: collection,
          moving_cards: [cards[1], cards[2]],
        )
        expect(matrix[1]).to eq(
          [nil, nil, cards[3], nil, cards[4]] + [nil] * 11,
        )
      end
    end

    describe '#place_cards_on_board' do
      let(:moving_cards) { create_list(:collection_card, 4) }
      let(:calculate) do
        CollectionGrid::Calculator.place_cards_on_board(
          row: placement[:row],
          col: placement[:col],
          collection: collection,
          from_collection: from_collection,
          moving_cards: moving_cards,
        )
      end

      before do
        moving_cards[0].update(row: 3, col: 5)
        moving_cards[1].update(row: 3, col: 6, width: 2)
        moving_cards[2].update(row: 3, col: 8)
        moving_cards[3].update(row: 4, col: 5, height: 2)
        # drag_map = [[0, 0], [0, 1], [0, 3], [1, 0]]
      end

      context 'at placement row: 1, col: 3' do
        let(:placement) do
          { row: 1, col: 3 }
        end

        it 'should insert cards into the layout and calculate collisions' do
          calculate
          expect(moving_cards.pluck(:row, :col, :parent_id)).to eq([
            [1, 3, collection.id],
            [1, 5, collection.id],
            [1, 7, collection.id],
            [2, 5, collection.id],
          ])
        end
      end

      context 'at placement row: 1, col: 1' do
        let(:placement) do
          { row: 1, col: 1 }
        end

        it 'should insert cards into the layout and calculate collisions' do
          calculate
          expect(moving_cards.pluck(:row, :col, :parent_id)).to eq([
            [2, 1, collection.id],
            [2, 4, collection.id],
            [1, 5, collection.id],
            [3, 0, collection.id],
          ])
        end
      end
    end

    describe '#exact_open_spot?' do
      let!(:card) { create(:collection_card_text) }

      it 'should return true if the exact spot is open' do
        card.row = 7
        card.col = 7
        result = CollectionGrid::Calculator.exact_open_spot?(card: card, collection: collection)
        expect(result).to be true
      end

      it 'should return false if the exact spot is not open' do
        card.row = 0
        card.col = 0
        result = CollectionGrid::Calculator.exact_open_spot?(card: card, collection: collection)
        expect(result).to be false

        card.row = 0
        # not valid column
        card.col = 20
        result = CollectionGrid::Calculator.exact_open_spot?(card: card, collection: collection)
        expect(result).to be false
      end
    end
  end
end
