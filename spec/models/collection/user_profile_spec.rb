require 'rails_helper'

describe Collection::UserProfile, type: :model do
  let(:organization) { create(:organization) }
  let(:user) { create(:user, add_to_org: organization) }
  let(:user_profile) do
    Collection::UserProfile.find_or_create_for_user(
      user: user,
      organization: organization,
    )
  end

  let(:template) do
    create(:master_template, organization: organization, num_cards: 3, pin_cards: true)
  end
  let(:profiles) { create(:global_collection, organization: organization) }

  before do
    # configure the org to set up the necessary global collections
    organization.update(
      profile_template: template,
      profile_collection: profiles,
    )
  end

  context 'callbacks' do
    describe 'update_user_cached_profiles!' do
      it 'should set the user.cached_user_profiles attribute' do
        expect(user.cached_user_profiles).not_to be nil
        expect(user.cached_user_profiles[organization.id.to_s]).to eq user_profile.id
      end
    end
  end

  describe '.find_or_create_for_user' do
    it 'should copy the cards from the org profile_template' do
      expect(user_profile.collection_cards.count).to eq 3
    end

    it 'should set the collection name to the user\'s name' do
      expect(user_profile.name).to eq user.name
    end

    it 'should set the user as editor of profile and items' do
      expect(user_profile.can_edit?(user)).to be true
      expect(user_profile.collection_cards.first.record.can_edit?(user)).to be true
    end

    it 'should copy the pinned status of the template cards' do
      expect(user_profile.collection_cards.first.pinned?).to be true
    end

    it 'should create a card in the Profiles template' do
      # need to do this to pick up collection_card relation?
      user_profile.reload
      expect(profiles.collection_cards.count).to eq 1
      expect(profiles.collection_cards.first.record).to eq user_profile
    end

    it 'should create a linked card in the user\'s My Collection' do
      # need to do this to pick up collection_card relation?
      user_profile.reload
      expect(user.current_user_collection.collection_cards.count).to eq 2
      expect(user.current_user_collection.collection_cards.last.record).to eq user_profile
      expect(
        user.current_user_collection.collection_cards.last.is_a?(CollectionCard::Link),
      ).to be true
    end

    it 'should add the #profile tag' do
      expect(user_profile.cached_owned_tag_list).to match_array(['profile'])
    end
  end
end
