import PropTypes from 'prop-types'
import { Element as ScrollElement } from 'react-scroll'
import { Box } from 'reflexbox'
import styled from 'styled-components'

import v from '~/utils/variables'
import {
  MarketingFooter,
  InvertMarketingLink,
  InvertMarketingLinkMail,
  MarketingFlex,
  MarketingContent,
  ResponsivePadInlineBlock,
  DesktopSpacer,
  Center,
  InvertedFixedWidth,
} from '~/ui/global/styled/marketing.js'

import poweredByIdeo from '~/assets/Powered-by-IDEO-Inverted.png'
import SubscribeEmail from '~/ui/marketing/SubscribeEmail'

const ResponsiveFooterHolder = styled(Box)`
  flex-direction: column;

  @media only screen and (min-width: ${v.responsive.medBreakpoint}px) {
    flex-direction: row;
  }
`
ResponsiveFooterHolder.displayName = 'ResponsiveFooterHolder'

class PageFooter extends React.PureComponent {
  render() {
    const { mailingList } = this.props.content
    return (
      <MarketingFooter>
        <ScrollElement name="FooterAnchor" />
        <MarketingFlex align="center" justify="center" wrap w={1}>
          <ResponsiveFooterHolder
            flex
            align={['center', 'center', 'space-between']}
            w={1}
            style={{ maxWidth: '1000px' }}
          >
            <Box w={1 / 2} style={{ textAlign: 'left' }}>
              <MarketingContent color="white">
                For general inquiries, reach us at:
              </MarketingContent>

              <InvertMarketingLinkMail
                fontSize={18}
                href="mailto:hello@shape.space"
              >
                hello@shape.space
              </InvertMarketingLinkMail>

              <MarketingContent color="white">
                For technical support, contact:
              </MarketingContent>

              <InvertMarketingLinkMail
                fontSize={18}
                href="mailto:support@shape.space"
              >
                support@shape.space
              </InvertMarketingLinkMail>
            </Box>

            <Box w={1 / 2} justify="flex-end">
              <Box mt={(0, 5)} wrap>
                <InvertedFixedWidth style={{ textAlign: 'left' }}>
                  {mailingList}
                </InvertedFixedWidth>
              </Box>
              <Box mt={[8, 0]}>
                <SubscribeEmail />
              </Box>
            </Box>
          </ResponsiveFooterHolder>

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
              2019
            </InvertMarketingLink>
          </ResponsivePadInlineBlock>
        </Center>
      </MarketingFooter>
    )
  }
}

PageFooter.propTypes = {
  content: PropTypes.object,
}

PageFooter.defaultProps = {
  content: {},
}

export default PageFooter
