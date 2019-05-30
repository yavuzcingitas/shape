import _ from 'lodash'
import { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Element as ScrollElement } from 'react-scroll'
import { Box } from 'reflexbox'
import {
  MarketingBack,
  MarketingProductPageHeroTitle,
  MarketingProductPageHeroSubtitle,
  MarketingProductPageHeroVideoCaption,
  MarketingFlex,
  MarketingStandaloneVideoWrapper,
  VideoDimensions,
} from '~/ui/global/styled/marketing.js'
import MarketingMenu from '~/ui/marketing/MarketingMenu'
import ContentBlock from '~/ui/marketing/ContentBlock'
import marketingFirebaseClient from '~/vendor/firebase/clients/marketingFirebaseClient'
import ReactPlayer from 'react-player'
import PageFooter from '~/ui/marketing/PageFooter.js'

class MarketingProductPage extends React.Component {
  constructor(props) {
    super(props)
    this.page = props.match.params.page
    this.state = {
      content: {},
    }
  }

  async componentDidMount() {
    const content = await marketingFirebaseClient.getCollectionField(
      'product',
      this.page
    )
    this.setState({ content: content })
  }

  get renderVideoPlayer() {
    const {
      content: { hero },
    } = this.state
    if (!hero || !hero.videoUrl) return ''
    return (
      <Fragment>
        <MarketingFlex align="center" justify="center" wrap w={1}>
          <Box mt={[12, 28, 34]}>
            <MarketingStandaloneVideoWrapper>
              <ReactPlayer
                url={hero.videoUrl}
                height={VideoDimensions.height}
                width={VideoDimensions.width}
                playing={false}
              />
            </MarketingStandaloneVideoWrapper>
          </Box>
        </MarketingFlex>
        <MarketingFlex align="center" justify="center" wrap w={1}>
          <Box
            w={[1, 0.6, 0.32]}
            mt={[8, 28, 34]}
            pr={[3, 0, 0]}
            pl={[3, 0, 0]}
          >
            <MarketingProductPageHeroVideoCaption>
              {hero.videoCaption}
            </MarketingProductPageHeroVideoCaption>
          </Box>
        </MarketingFlex>
      </Fragment>
    )
  }

  get sortedBlocks() {
    const {
      content: { blocks },
    } = this.state
    return _.sortBy(blocks, block => block.order)
  }

  render() {
    const { content } = this.state
    const { hero, footer, contact, subscription } = content
    return (
      <Fragment>
        <MarketingBack>
          <MarketingMenu />
          <MarketingFlex align="center" justify="center" wrap w={1}>
            <Box w={1} mt={[12, 28, 34]} pr={[3, 0, 0]} pl={[3, 0, 0]}>
              <MarketingProductPageHeroTitle>
                {hero && hero.title}
              </MarketingProductPageHeroTitle>
            </Box>
            <Box
              w={[1, 0.6, 0.32]}
              mt={[12, 28, 34]}
              pr={[3, 0, 0]}
              pl={[3, 0, 0]}
            >
              <MarketingProductPageHeroSubtitle>
                {hero && hero.subTitle}
              </MarketingProductPageHeroSubtitle>
            </Box>
          </MarketingFlex>
          {this.renderVideoPlayer}
          <MarketingFlex align="center" justify="center" wrap w={1}>
            <Box w={1} justify="center">
              <ScrollElement name="ContentAnchor" />
              {this.sortedBlocks.map(block => (
                <ContentBlock
                  order={block.order}
                  title={block.title}
                  content={block.content}
                  imageUrl={block.imageUrl}
                />
              ))}
            </Box>
          </MarketingFlex>
        </MarketingBack>
        <PageFooter
          footerHeader={footer && footer.header}
          footerSubheader={footer && footer.subHeader}
          footerButtons={footer && footer.buttons}
          contactHeader={contact && contact.header}
          contactHeader2={contact && contact.header2}
          subscriptionHeader={subscription && subscription.header}
        />
      </Fragment>
    )
  }
}

MarketingProductPage.propTypes = {
  match: PropTypes.object.isRequired,
}

export default MarketingProductPage
