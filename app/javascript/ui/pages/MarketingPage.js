import { Fragment } from 'react'
import { Box } from 'reflexbox'
import { Element as ScrollElement } from 'react-scroll'
import ReactRouterPropTypes from 'react-router-prop-types'

import {
  MarketingBack,
  MarketingFooter,
  // MarketingHeavyCTA,
  InvertMarketingLink,
  InvertMarketingH1,
  InvertMarketingH1Bold,
  InvertMarketingLinkMail,
  MarketingFlex,
  MarketingHeroButtonContainer,
  ResponsivePadInlineBlock,
  DesktopSpacer,
  Center,
  MarketingTagLine,
  MarketingVideoLink,
  MarketingShapeLogo,
  MarketingVideoContainer,
  MarketingVideoWrapper,
  // MarketingBetaSticker,
  MarketingCallToAction,
  MarketingGradientTop,
  InvertedCentered,
  InvertedFixedWidth,
  VideoDimensions,
} from '~/ui/global/styled/marketing.js'
import poweredByIdeo from '~/assets/Powered-by-IDEO-Inverted.png'
import MarketingMenu from '~/ui/marketing/MarketingMenu'
import SubscribeEmail from '~/ui/marketing/SubscribeEmail'
import ProductDescriptions from '~/ui/marketing/ProductDescriptions'
import BetaSticker from '~/ui/marketing/BetaSticker'
import marketingFirebaseClient from '~/vendor/firebase/clients/marketingFirebaseClient'
import ReactPlayer from 'react-player'
//import queryString from 'query-string'

class MarketingPage extends React.Component {
  constructor(props) {
    super(props)
    const pageTexts = {}

    this.state = {
      pageTexts: pageTexts,
      videoPlaying: false,
    }

    this.toggleVideoPlaying = this.toggleVideoPlaying.bind(this)
  }

  componentDidMount() {
    marketingFirebaseClient.getObjectFromCollection('home').then(texts => {
      if (this.props.location.search) {
        const params = queryString.parse(this.props.location.search)
        if (params && params.campaign === 'alphapt7') {
          texts.footerHeader = texts.footerHeader.replace('$5', '$7')
        }
      this.setState({ pageTexts: texts })
    })
  }

  toggleVideoPlaying = () => {
    this.setState({
      videoPlaying: !this.state.videoPlaying,
    })
  }

  render() {
    const { videoPlaying, pageTexts } = this.state
    const videoPlayingButtonText = !videoPlaying
      ? pageTexts.hero && pageTexts.hero.buttons[1]
      : pageTexts.hero && pageTexts.hero.buttons[2]
    return (
      <Fragment>
        <MarketingBack>
          <MarketingGradientTop>
            <ScrollElement name="TopAnchor" />
            <MarketingMenu />
            <BetaSticker />

            <Center>
              <MarketingShapeLogo videoPlaying={videoPlaying} />
              <MarketingTagLine videoPlaying={videoPlaying}>
                {pageTexts.hero && pageTexts.hero.tagLine}
              </MarketingTagLine>
            </Center>
            <Center>
              <MarketingVideoContainer>
                <MarketingVideoWrapper videoPlaying={videoPlaying}>
                  <ReactPlayer
                    url={pageTexts.hero && pageTexts.hero.videoUrl}
                    height={videoPlaying ? VideoDimensions.height : '0px'}
                    width={videoPlaying ? VideoDimensions.width : '0px'}
                    playing={videoPlaying}
                  />
                </MarketingVideoWrapper>
              </MarketingVideoContainer>
            </Center>

            <Center>
              <MarketingHeroButtonContainer>
                <a className="get-early-access-header" href="/sign_up">
                  <MarketingCallToAction>
                    {pageTexts.hero && pageTexts.hero.buttons[0]}
                  </MarketingCallToAction>
                </a>
                <MarketingVideoLink onClick={this.toggleVideoPlaying}>
                  {videoPlayingButtonText}
                </MarketingVideoLink>
              </MarketingHeroButtonContainer>
            </Center>
          </MarketingGradientTop>

          <MarketingFlex align="center" justify="center" wrap w={1}>
            <Box w={1} justify="center">
              <ScrollElement name="ContentAnchor" />
              <ProductDescriptions />
            </Box>
          </MarketingFlex>
        </MarketingBack>

        <MarketingFooter>
          <ScrollElement name="FooterAnchor" />
          <MarketingFlex align="center" justify="center" wrap w={1}>
            <Box w={1} mb={[10, '4px']}>
              <InvertMarketingH1Bold>
                {pageTexts.footer && pageTexts.footer.header}
              </InvertMarketingH1Bold>
            </Box>
            <Box w={1}>
              <InvertMarketingH1>
                {pageTexts.footer && pageTexts.footer.subHeader}
              </InvertMarketingH1>
            </Box>
            <Box w={1} pt={[46, 65]} pb={[46, 74]} mb={[10, 0]}>
              <a className="get-early-access-footer" href="/sign_up">
                <MarketingCallToAction>
                  {pageTexts.footer && pageTexts.footer.buttons[0]}
                </MarketingCallToAction>
              </a>
            </Box>

            <ResponsivePadInlineBlock>
              <InvertedCentered>
                {pageTexts.contact && pageTexts.contact.header}
              </InvertedCentered>
            </ResponsivePadInlineBlock>
            <ResponsivePadInlineBlock>
              <InvertedCentered>
                {pageTexts.contact && pageTexts.contact.header2}
              </InvertedCentered>
            </ResponsivePadInlineBlock>

            <Box w={1}>
              <InvertMarketingLinkMail href="mailto:hello@shape.space">
                hello@shape.space
              </InvertMarketingLinkMail>
            </Box>

            <Box w={1} mt={(0, 5)} wrap>
              <InvertedFixedWidth>
                {pageTexts.subscription && pageTexts.subscription.header}
              </InvertedFixedWidth>
            </Box>

            <Box w={1} mt={[8, 0]}>
              <SubscribeEmail />
            </Box>

            <Box w={1}>
              <InvertMarketingLink
                href="https://www.ideo.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  src={poweredByIdeo}
                  alt="Powered by IDEO"
                  style={{
                    width: '95px',
                    paddingTop: '55px',
                    paddingBottom: '30px',
                  }}
                />
              </InvertMarketingLink>
            </Box>
          </MarketingFlex>

          <Center>
            <ResponsivePadInlineBlock>
              <InvertMarketingLink href="https://www.ideo.com/privacy">
                Privacy and Cookie Policy
              </InvertMarketingLink>
            </ResponsivePadInlineBlock>
          </Center>
          <Center>
            <ResponsivePadInlineBlock>
              <DesktopSpacer style={{ width: '80px' }} />
              <InvertMarketingLink href="https://www.ideo.com/">
                {/* Added span around &copy; in order to satisfy "jsx-a11y/accessible-emoji" */}
                <span role="img" aria-label="Copyright Symbol">
                  &copy;
                </span>{' '}
                2018
              </InvertMarketingLink>
            </ResponsivePadInlineBlock>
          </Center>
        </MarketingFooter>
      </Fragment>
    )
  }
}

MarketingPage.propTypes = {
  location: ReactRouterPropTypes.location.isRequired,
}
export default MarketingPage
