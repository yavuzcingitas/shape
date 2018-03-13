import PropTypes from 'prop-types'
import { action, observable } from 'mobx'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import styled from 'styled-components'
import AddImageIcon from '~/ui/icons/AddImageIcon'
import Divider from 'material-ui/Divider';
import FilestackUpload from '~/utils/FilestackUpload'
import OrganizationAvatar from '~/ui/layout/OrganizationAvatar'
import v from '~/utils/variables'

// TODO remove duplication with GridCardBlank
const BctButton = styled.button`
`
BctButton.displayName = 'BctButton'

const StyledLabel = styled.div`
  margin-bottom: 20px;
  font-family: Gotham;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  display: block;
`

StyledLabel.displayName = 'StyledLabel'

const StyledFieldBox = styled.div`
  padding-bottom: 35px;

  label {
    margin-right: 15px;
  }
`
StyledFieldBox.displayName = 'StyledFieldBox'

const StyledTextbox = styled.input`
  width: 224px;
  padding-bottom: 6px;
  font-size: 16px;
  border: 0;
  border-bottom: 0.5px solid ${v.colors.gray};
`
StyledTextbox.displayName = 'StyledTextbox'

const StyledSubmit = styled.input`
  width: 183px;
  height: 40px;
  border-radius: 19.5px;
  border: none;
  background-color: ${v.colors.blackLava};
  text-transform: uppercase;
  font-family: Gotham;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: #ffffff;
`
StyledSubmit.displayName = 'StyledSubmit'

const StyledAddImageIcon = styled.span`
  width: 100px;
  position: relative;
  height: 100px;
  display: block;
  color: #ffffff;
  border-radius: 50%;
  background-color: ${v.colors.gray};

  span {
    position: absolute;
    font-size: 36px;
    font-weight: 300;
    left: calc(50% - 9px);
    top: calc(50% - 25px);
  }
`
StyledAddImageIcon.displayName = 'StyledAddImageIcon'

@observer
class OrganizationEdit extends React.Component {
  constructor(props) {
    super()
    const { organization } = props
    this.editingOrganization = {
      name: organization.name,
      pic_url_square: organization.pic_url_square
    }
  }

  @observable editingOrganization = null

  @action
  changeName(name) {
    this.editingOrganization.name = name
  }

  @action
  changeUrl(url) {
    this.editingOrganization.pic_url_square = url
  }

  handleNameChange = (ev) => {
    this.changeName(ev.target.value)
  }

  handleImagePick = (ev) => {
    FilestackUpload
      .pickImage()
      .then(resp => {
        if (resp.filesUploaded.length > 0) {
          const img = resp.filesUploaded[0]
          this.changeUrl(img.url)
        } else {
          console.warn('Failed to upload image:', resp.filesFailed)
        }
      })
  }

  handleSave = (ev) => {
    ev.preventDefault()
    const { organization, onSave } = this.props
    organization.name = this.editingOrganization.name
    organization.pic_url_square = this.editingOrganization.pic_url_square
    organization.save().then(() => {
      onSave && onSave()
    })
  }

  render() {
    return (
      <form>
        <StyledFieldBox>
          <StyledLabel htmlFor="organizationName">Organization Name</StyledLabel>
          <StyledTextbox
            id="organizationName"
            type="text"
            value={this.editingOrganization.name}
            onChange={this.handleNameChange}
          />
        </StyledFieldBox>
        <StyledFieldBox>
          <StyledLabel htmlFor="organizationAvatar">Organization Avatar</StyledLabel>
          <BctButton onClick={this.handleImagePick} id="organizationAvatar">
            <StyledAddImageIcon>
              <span>
                +
              </span>
            </StyledAddImageIcon>
          </BctButton>
        </StyledFieldBox>
        <StyledFieldBox style={{ textAlign: 'center' }}>
          <StyledSubmit
            onClick={this.handleSave}
            type="submit"
            value="save"
          />
        </StyledFieldBox>
      </form>
    )
  }
}

OrganizationEdit.propTypes = {
  organization: MobxPropTypes.objectOrObservableObject.isRequired,
  onSave: PropTypes.func,
}

export default OrganizationEdit
