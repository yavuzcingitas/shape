class LimitedUserCreator < SimpleService
  attr_accessor :limited_user, :errors

  def initialize(contact_info:, user_info: {}, date_of_participation: nil)
    @contact_info = contact_info
    @user_info = user_info
    @date_of_participation = date_of_participation
    @email = nil
    @phone = nil
    @limited_user = nil
    @network_user = nil

    @errors = []
  end

  def call
    return false unless validate_contact_info
    find_or_create_network_user
    return false unless @network_user.present?
    if @network_user.errors.present?
      @errors = @network_user.errors
      return false
    end
    saved = create_user(@network_user)
    @errors = @limited_user.errors
    saved
  end

  private

  def validate_contact_info
    if contact_info_email?
      @email = @contact_info
    else
      @phone = normalize_phone_number
    end
  end

  def contact_info_email?
    @contact_info.match(URI::MailTo::EMAIL_REGEXP).present?
  end

  def normalize_phone_number
    Phony.normalize(@contact_info)
  rescue Phony::NormalizationError
    @errors << 'Contact information invalid'
    false
  end

  def find_or_create_network_user
    params = {}
    params[:email] = @email if @email
    params[:phone] = @phone if @phone

    return false if params.empty?

    # if Rails.env.development?
    #   # always look up the same user so we don't keep creating real ones
    #   params[:email] = 'test.user@shape.space'
    #   params.delete :phone
    # end

    @network_user = NetworkApi::User.where(params).first
    if @network_user.present?
      @network_user = NetworkApi::User.update(params)
      return
    end

    params[:limited_user] = true
    params.merge!(@user_info)

    @network_user = NetworkApi::User.create(params)
  end

  def create_user(network_user)
    @limited_user = User.find_or_initialize_from_network(network_user)
    @limited_user.created_at = @date_of_participation if @date_of_participation.present?
    saved = @limited_user.save

    if user.persisted? && @date_of_participation.present?
      create_test_audience_invitation(@limited_user)
    end

    saved
  end

  def create_test_audience_invitation(user)
    TestAudienceInvitation.create(user: user, created_at: @date_of_participation)
  end
end
