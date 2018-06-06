import { toJS } from 'mobx'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import styled from 'styled-components'
import { EditorState, convertFromRaw } from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createMentionPlugin from 'draft-js-mention-plugin'

import v from '~/utils/variables'
import { DisplayText } from '~/ui/global/styled/typography'
import { InlineRow } from '~/ui/global/styled/layout'
import Moment from '~/ui/global/Moment'
import UserAvatar from '~/ui/users/UserAvatar'

const StyledComment = styled.div`
  padding: 10px;
  margin-bottom: 5px;
  background: ${props => (props.unread ? v.colors.activityLightBlue : v.colors.activityMedBlue)};

  transition: background 1s 0.5s ease;

  &:last-child {
    margin-bottom: 0;
  }

  .message {
    margin-top: 5px;
  }
`

class Comment extends React.Component {
  constructor(props) {
    super(props)
    this.mentionPlugin = createMentionPlugin({
      mentionComponent: (mentionProps) => (
        <strong>
          @{mentionProps.mention.handle}
        </strong>
      )
    })
    this.state = {
      editorState: EditorState.createEmpty(),
    }
  }

  componentWillMount() {
    const { comment } = this.props
    if (comment.draftjs_data) {
      const contentState = convertFromRaw(toJS(comment.draftjs_data))
      const editorState = EditorState.createWithContent(contentState)
      this.setState({ editorState })
    }
  }

  renderMessage() {
    const { comment } = this.props
    if (!comment.draftjs_data) {
      return comment.message
    }
    const plugins = [this.mentionPlugin]
    return (
      <Editor
        readOnly
        editorState={this.state.editorState}
        // NOTE: this onChange is necessary for draft-js-plugins to decorate properly!
        // see https://github.com/draft-js-plugins/draft-js-plugins/issues/530#issuecomment-258736772
        onChange={(editorState) => this.setState({ editorState })}
        plugins={plugins}
      />
    )
  }

  render() {
    const { comment } = this.props

    return (
      <StyledComment unread={comment.unread}>
        <InlineRow align="center">
          <UserAvatar
            user={comment.author}
            size={32}
            className="author-img"
          />
          <DisplayText className="author">
            { comment.author.name }
          </DisplayText>
          <span className="timestamp">
            <Moment date={comment.updated_at} />
          </span>
        </InlineRow>
        <div className="message">
          { this.renderMessage() }
        </div>
      </StyledComment>
    )
  }
}

Comment.propTypes = {
  comment: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default Comment
