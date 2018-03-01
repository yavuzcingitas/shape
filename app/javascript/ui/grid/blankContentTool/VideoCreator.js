import PropTypes from 'prop-types'
import styled from 'styled-components'
import _ from 'lodash'

import StyledCover from '~/ui/grid/covers/StyledCover'
import VideoUrl from '~/utils/VideoUrl'
import { ITEM_TYPES } from '~/utils/variables'

const ValidIndicator = styled.div`
  display: inline-block;
  font-size: 20px;
  font-weight: bold;
  width: 20px;
  &.valid {
    color: green;
  }
  &.invalid {
    color: red;
  }
`

class VideoCreator extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      videoUrl: '',
      urlValid: false,
      loading: false,
      name: '',
      thumbnail_url: '',
    }
    this.lookupVideoAPI = _.debounce(this._lookupVideoAPI, 1000)
  }

  onVideoUrlChange = (e) => {
    this.setState({
      videoUrl: e.target.value,
      loading: true,
    })
    this.lookupVideoAPI(e.target.value)
  }

  _lookupVideoAPI = async (url) => {
    const { name, thumbnail_url } = await VideoUrl.getAPIdetails(url)
    this.setState({ loading: false })
    if (name && thumbnail_url) {
      this.setState({ name, thumbnail_url, urlValid: true })
    } else {
      this.setState({ urlValid: false })
    }
  }

  videoUrlIsValid = () => (
    VideoUrl.isValid(this.state.videoUrl)
  )

  createVideoItem = () => {
    if (this.videoUrlIsValid()) {
      // Get a normalized URL to make it easier to handle in our system
      const { normalizedUrl } = VideoUrl.parse(this.state.videoUrl)
      const { name, thumbnail_url } = this.state
      const attrs = {
        item_attributes: {
          type: ITEM_TYPES.VIDEO,
          url: normalizedUrl,
          name,
          thumbnail_url,
        },
      }
      this.props.createCard(attrs)
    } else {
      // console.log('invalid url')
    }
  }

  render() {
    let validIndicator = <ValidIndicator />
    const { videoUrl, urlValid, loading } = this.state

    if (videoUrl.length > 3) {
      validIndicator = (
        <ValidIndicator className={urlValid ? 'valid' : 'invalid'}>
          {!loading && (urlValid ? '✔' : 'x')}
          {loading && '...'}
        </ValidIndicator>
      )
    }

    return (
      <StyledCover>
        <input
          placeholder="Video URL"
          value={videoUrl}
          onChange={this.onVideoUrlChange}
        />
        {validIndicator}
        <input
          onClick={this.createVideoItem}
          type="submit"
          value="save"
          disabled={this.props.loading || this.state.loading}
        />
      </StyledCover>
    )
  }
}

VideoCreator.propTypes = {
  loading: PropTypes.bool.isRequired,
  createCard: PropTypes.func.isRequired,
}

export default VideoCreator
