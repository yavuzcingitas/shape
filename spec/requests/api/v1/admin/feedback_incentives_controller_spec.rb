require 'rails_helper'

describe Api::V1::Admin::FeedbackIncentivesController, type: :request, json: true, auth: true, truncate: true do
  let(:admin_user) { @user }
  let!(:test_collection) { create(:test_collection, :with_test_audience, :completed, num_cards: 1) }
  let!(:test_audience) { test_collection.test_audiences.first }
  let(:user) { create(:user) }
  let(:amount_owed) { test_audience.price_per_response }
  let(:survey_response) do
    create(
      :survey_response,
      :fully_answered,
      test_audience: test_audience,
      test_collection: test_collection,
      user: user,
    )
  end

  before do
    test_collection.launch!
    expect(survey_response.completed?).to be true
    survey_response.record_incentive_owed!
    expect(survey_response.incentive_owed?).to be true
    admin_user.add_role(Role::SHAPE_ADMIN)
  end

  describe 'GET #index' do
    let(:path) { api_v1_admin_feedback_incentives_path(format: 'csv') }

    it 'returns 200' do
      get(path)
      expect(response.status).to eq(200)
    end

    it 'returns csv' do
      get(path)
      csv = CSV.parse(response.body, headers: true)
      expect(csv[0].to_h).to eq(
        'User ID' => user.uid,
        'Name' => user.name,
        'Email' => user.email,
        'Phone' => user.phone,
        'Amount Owed' => format('%.2f', amount_owed),
      )
    end

    context 'after all have been marked as paid' do
      before do
        SurveyResponse
          .incentive_owed
          .each(&:record_incentive_paid!)
      end

      it 'returns empty csv' do
        get(path)
        csv = CSV.parse(response.body, headers: true)
        expect(csv.length).to eq(0)
      end
    end
  end

  describe 'POST #mark_all_paid' do
    let(:path) { mark_all_paid_api_v1_admin_feedback_incentives_path }

    it 'updates all responses to status of paid' do
      post(path)
      expect(survey_response.reload.incentive_paid?).to be true
    end
  end
end
