import { action, observable } from 'mobx'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import PropTypes from 'prop-types'
import AutosizeInput from 'react-input-autosize'
import styled from 'styled-components'
import _ from 'lodash'

import v from '~/utils/variables'
import { Heading1 } from '~/ui/global/styled/typography'
import ClickWrapper from '~/ui/layout/ClickWrapper'
import Truncator from '~/ui/global/Truncator'

const StyledName = styled.div`
  display: block;
  vertical-align: top;
`
StyledName.displayName = 'StyledName'

const StyledEditableName = styled.div`
  display: block;
  .input__name {
    width: 30vw;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    input {
      z-index: ${v.zIndex.aboveClickWrapper};
      position: relative;
      font-size: ${props => props.fontSize}rem;
      font-family: ${v.fonts.sans};
      font-weight: ${v.weights.medium};
      letter-spacing: 0.125rem;
      padding: 0.15rem 0 0.5rem 0;
      background-color: transparent;
      border-left: none;
      border-top: none;
      border-right: none;
      border-bottom: 1px solid ${v.colors.blackLava};
      &:focus {
        outline: 0;
      }
    }
  }
`
StyledEditableName.displayName = 'StyledEditableName'

@inject('uiStore')
@observer
class EditableName extends React.Component {
  @observable name = ''

  constructor(props) {
    super(props)
    this.saveName = _.debounce(this._saveName, 1000)
    const { name } = props
    this.setName(name)
  }

  // navigating between collections may trigger this instead of didMount
  componentWillReceiveProps({ name }) {
    this.setName(name)
  }

  componentWillUnmount() {
    const { uiStore } = this.props
    uiStore.update('editingName', false)
  }

  onNameFieldKeypress = (e) => {
    if (e.key === 'Enter') {
      this.stopEditingName()
    }
  }

  @action setName(name) {
    this.name = name
  }

  onNameChange = (e) => {
    this.setName(e.target.value)
    this.saveName()
  }

  @action startEditingName = (e) => {
    e.stopPropagation()
    const { uiStore } = this.props
    uiStore.update('editingName', true)
  }

  @action stopEditingName = () => {
    // Ensure that save is called if user presses enter
    this.saveName.flush()
    const { uiStore } = this.props
    uiStore.update('editingName', false)
  }

  _saveName = () => {
    this.props.updateNameHandler(this.name)
  }

  render() {
    const { canEdit, fontSize, uiStore } = this.props
    const { editingName } = uiStore

    let extraTruncatorSpacing = 250
    if (uiStore.windowWidth < v.responsive.smallBreakpoint) {
      extraTruncatorSpacing = 340
    } else if (uiStore.windowWidth < v.responsive.medBreakpoint) {
      extraTruncatorSpacing = 520
    } else if (uiStore.windowWidth < v.responsive.largeBreakpoint) {
      extraTruncatorSpacing = 460
    }

    if (canEdit && editingName) {
      const clickHandlers = [
        () => this.stopEditingName()
      ]
      return (
        <StyledEditableName fontSize={fontSize}>
          <AutosizeInput
            maxLength={40}
            className="input__name"
            style={{ fontSize }}
            value={this.name}
            onChange={this.onNameChange}
            onKeyPress={this.onNameFieldKeypress}
          />
          <ClickWrapper clickHandlers={clickHandlers} />
        </StyledEditableName>
      )
    }
    const nameEl = (
      <Heading1
        ref={this.textRef}
        onClick={canEdit ? this.startEditingName : null}
      >
        <Truncator
          text={this.name}
          key={this.name}
          extraSpacing={extraTruncatorSpacing}
          minWidth={Math.min((v.maxWidth - 300), uiStore.windowWidth)}
        />
      </Heading1>
    )
    return (
      <StyledName>
        {nameEl}
      </StyledName>
    )
  }
}

EditableName.propTypes = {
  name: PropTypes.string.isRequired,
  updateNameHandler: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  fontSize: PropTypes.number,
}

EditableName.wrappedComponent.propTypes = {
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

EditableName.defaultProps = {
  canEdit: false,
  fontSize: 2.25,
}

EditableName.displayName = 'EditableName'

export default EditableName
