import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Popover, Grid } from '@material-ui/core'

import v from '~/utils/variables'
import TextButton from '~/ui/global/TextButton'

const ButtonsWrapper = styled.div`
  padding: 20px 30px 15px 30px;
`

class InlineModal extends React.PureComponent {
  handleCancel = ev => {
    ev.preventDefault()
    ev.stopPropagation()
    const { onCancel } = this.props
    onCancel && onCancel()
  }

  handleConfirm = ev => {
    ev.preventDefault()
    ev.stopPropagation()
    const { onConfirm } = this.props
    onConfirm && onConfirm()
  }

  render() {
    const { children, open, leftButton, anchorElement } = this.props
    return (
      <Popover
        open={open}
        onClose={this.handleCancel}
        anchorOrigin={{ horizontal: 'center', vertical: 'center' }}
        anchorEl={anchorElement}
        anchorReference="anchorEl"
      >
        <Grid container spacing={2}>
          <Grid item xs={4}>
            {children}
          </Grid>
        </Grid>
        <ButtonsWrapper>
          <Grid container spacing={0}>
            <Grid item xs={4}>
              {leftButton}
            </Grid>
            <Grid item xs={8} style={{ textAlign: 'right' }}>
              <TextButton
                onClick={this.handleCancel}
                fontSizeEm="0.75"
                color={v.colors.black}
                style={{ marginRight: '2em' }}
              >
                Cancel
              </TextButton>
              <TextButton
                onClick={this.handleConfirm}
                fontSizeEm="0.75"
                color={v.colors.black}
              >
                OK
              </TextButton>
            </Grid>
          </Grid>
        </ButtonsWrapper>
      </Popover>
    )
  }
}

InlineModal.propTypes = {
  children: PropTypes.node,
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  maxWidth: PropTypes.string,
  backgroundColor: PropTypes.oneOf(Object.values(v.colors)),
  overrideWithLoader: PropTypes.bool,
  leftButton: PropTypes.node,
  anchorElement: PropTypes.node,
}
InlineModal.defaultProps = {
  children: null,
  maxWidth: 'xs', // 'xs' == 360px
  backgroundColor: v.colors.white,
  onConfirm: null,
  onCancel: null,
  leftButton: null,
  anchorElement: null,
  overrideWithLoader: false,
}
// all propTypes except required `children` node, to be used by Information/ConfirmationModal
const { ...childPropTypes } = InlineModal.propTypes
InlineModal.childPropTypes = childPropTypes

export default InlineModal
