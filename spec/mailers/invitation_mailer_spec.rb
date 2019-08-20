require 'rails_helper'

RSpec.describe InvitationMailer, type: :mailer do
  describe '#invite' do
    let(:user) { create(:user, :pending) }
    let(:invited_by) { create(:user) }
    let(:organization) { create(:organization) }
    let(:application) { nil }
    let(:mail) do
      InvitationMailer.invite(
        user_id: user.id,
        invited_by_id: invited_by.id,
        invited_to_type: invited_to.class.name,
        invited_to_id: invited_to.id,
        application: application,
      )
    end

    context 'with a collection' do
      let(:invited_to) { create(:collection) }

      it 'renders the headers' do
        expect(mail.subject).to eq("Your invitation to \"#{invited_to.name}\" on Shape")
        expect(mail.to).to eq([user.email])
      end

      it 'renders the body' do
        expect(mail.body.encoded).to match("#{invited_by.name} has invited you to join \"#{invited_to.name}\"")
      end

      context 'on staging env' do
        # this is testing logic within ApplicationMailer
        let(:group) { create(:group, id: Shape::IDEO_PRODUCTS_GROUP_ID, organization: organization) }
        let!(:shape_app) { ENV['SHAPE_APP'] }

        before do
          # this for allowing Rails.env.test to test the restriction
          ENV['SHAPE_APP'] = 'test-restriction'
        end

        after do
          ENV['SHAPE_APP'] = shape_app
        end

        context 'with user in IDEO Products group' do
          before do
            user.add_role(Role::MEMBER, group)
          end

          it 'sends the email' do
            expect(mail.to).to eq([user.email])
          end

          it 'adds the environment to the subject line' do
            expect(mail.subject).to include('[Shape test-restriction]')
          end
        end

        context 'with user not in IDEO Products group' do
          it 'skips sending the email' do
            expect(mail.to).to be_nil
          end
        end
      end
    end

    context 'with a group' do
      let(:invited_to) { create(:group, organization: organization) }

      it 'renders the headers' do
        expect(mail.subject).to eq("Your invitation to \"#{invited_to.name}\" on Shape")
        expect(mail.to).to eq([user.email])
      end

      it 'renders the body' do
        expect(mail.body.encoded).to match(
          "#{invited_by.name} has invited you to join #{organization.name}'s \"#{invited_to.name}\" group",
        )
      end

      context 'with an application' do
        let(:application) { create(:application) }

        it 'sets the from to creative difference' do
          expect(mail.from).to eq(['hello@ideocreativedifference.com'])
        end

        it 'sets the invite url to creative difference' do
          expect(mail.body.encoded).to match('https://creativedifference.ideo.com/shape')
        end
      end
    end

    context 'with Shape admin' do
      let(:invited_to_type) { Role::SHAPE_ADMIN.to_s.titleize }
      let(:mail) do
        InvitationMailer.invite(
          user_id: user.id,
          invited_by_id: invited_by.id,
          invited_to_type: invited_to_type,
        )
      end

      it 'renders the headers' do
        expect(mail.subject).to eq("Your invitation to \"#{invited_to_type}\" on Shape")
        expect(mail.to).to eq([user.email])
      end

      it 'renders the body' do
        expect(mail.body.encoded).to match("#{invited_by.name} has invited you to join \"#{invited_to_type}\"")
      end
    end
  end
end
