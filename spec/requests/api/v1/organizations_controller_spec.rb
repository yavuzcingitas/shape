require 'rails_helper'

describe Api::V1::OrganizationsController, type: :request, json: true, auth: true do
  let(:user) { @user }

  describe 'GET #current' do
    let!(:organization) { create(:organization) }
    let(:path) { '/api/v1/organizations/current' }

    before do
      user.update_attributes(current_organization: organization)
    end

    it 'returns a 200' do
      get(path)
      expect(response.status).to eq(200)
    end

    it 'matches user.current_organization' do
      get(path)
      expect(json['data']['id'].to_i).to eq(user.current_organization_id)
    end
  end

  describe 'GET #show' do
    let!(:organization) { create(:organization) }
    let(:path) { "/api/v1/organizations/#{organization.id}" }

    it 'returns a 200' do
      get(path)
      expect(response.status).to eq(200)
    end

    it 'matches Organization schema' do
      get(path)
      expect(json['data']['attributes']).to match_json_schema('organization')
    end
  end

  describe 'POST #create' do
    let(:path) { '/api/v1/organizations/' }
    let!(:current_user) { create(:user) }
    let(:params) {
      json_api_params(
        'organizations',
        'name': 'IDEO U',
        'handle': 'ideo-u',
      )
    }

    it 'returns a 200' do
      post(path, params: params)
      expect(response.status).to eq(200)
    end

    it 'matches JSON schema' do
      post(path, params: params)
      expect(json['data']['attributes']).to match_json_schema('organization')
    end

    context 'with invalid params' do
      let(:params) {
        json_api_params(
          'organizations',
          'name': nil,
        )
      }

      it 'returns a 400 with organization errors' do
        post(path, params: params)
        expect(response.status).to eq(400)
        expect(json['errors'].first['title']).to eq 'Invalid name'
      end
    end
  end

  describe 'PATCH #update' do
    let!(:organization) { create(:organization, admin: user) }
    let(:path) { "/api/v1/organizations/#{organization.id}" }
    let(:params) {
      json_api_params(
        'organizations',
        {
          'name': 'Acme Inc 2.0',
        }
      )
    }

    it 'returns a 200' do
      patch(path, params: params)
      expect(response.status).to eq(200)
    end

    it 'matches JSON schema' do
      patch(path, params: params)
      expect(json['data']['attributes']).to match_json_schema('organization')
    end

    it 'updates the name' do
      expect(organization.name).not_to eq('Acme Inc 2.0')
      patch(path, params: params)
      expect(organization.reload.name).to eq('Acme Inc 2.0')
    end
  end
end
