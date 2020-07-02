import PropTypes from 'prop-types'
import Icon from '~/ui/icons/Icon'

const AcceleratorIcon = ({ size }) => (
  <Icon fill>
    {size === 'lg' && (
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3.9C9.3 3.9 3.9 9.3 3.9 16S9.4 28.2 16 28.2c6.7 0 12.2-5.5 12.2-12.2S22.7 3.9 16 3.9zm0 22.9c-5.8 0-10.5-4.5-10.8-10.2h1.6c.4 0 .6-.3.6-.6s-.3-.6-.6-.6H5.2c.1-2.5 1.1-4.7 2.6-6.4l1.3 1.3c.1.1.3.2.5.2s.3-.1.5-.2c.3-.3.3-.7 0-.9L8.7 8c1.8-1.6 4.1-2.7 6.6-2.8v1.7c0 .4.3.6.6.6s.6-.3.6-.6V5.2c2.5.2 4.8 1.2 6.6 2.8l-1.4 1.4c-.3.3-.3.7 0 .9.1.1.3.2.5.2s.3-.1.5-.2l1.4-1.4c1.5 1.8 2.5 4 2.7 6.5h-1.7c-.4 0-.7.3-.7.6s.3.6.7.6h1.7c-.3 5.7-5 10.2-10.8 10.2z" />
        <path d="M21.8 13.6l-5.2 1.3c-.2-.1-.4-.2-.7-.2-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3c.6 0 1-.4 1.2-.9L22 14c.2-.1 0-.5-.2-.4z" />
      </svg>
    )}
    {size === 'xxl' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">
        <path d="M320 180.4v-.4c0-76.9-62.6-139.5-139.5-139.5h-.4-.1-.1C103.3 40.8 41 103.3 41 180v.6c.3 76.7 62.8 138.9 139.5 138.9S319.7 257.2 320 180.6v-.2c0 .1 0 .1 0 0zM180.5 309.5c-69.6 0-126.5-55.1-129.4-124H74c2.8 0 5-2.2 5-5s-2.2-5-5-5H51.1c1.1-31.6 13.5-60.4 33.4-82.3l17.3 17.3c1 1 2.3 1.5 3.5 1.5s2.6-.5 3.5-1.5c2-2 2-5.1 0-7.1L91.5 86c22-20.8 51.2-34 83.5-35.4v22.9c0 2.8 2.2 5 5 5s5-2.2 5-5V50.6c32.4 1.1 61.9 14.2 84 35l-17.7 17.8c-1.9 2-1.9 5.1 0 7.1 1 1 2.3 1.5 3.5 1.5 1.3 0 2.6-.5 3.5-1.5l17.6-17.7c20.1 22 32.7 51 33.8 82.8H287c-2.8 0-5 2.2-5 5s2.2 5 5 5h22.9c-2.9 68.8-59.8 123.9-129.4 123.9z" />
        <path d="M249 152.1l-60.6 15.2c-2.5-1.8-5.6-2.8-8.9-2.8-8.6 0-15.5 6.9-15.5 15.5s6.9 15.5 15.5 15.5c7.1 0 13.1-4.8 14.9-11.4l56.4-27c2.1-1 .5-5.6-1.8-5z" />
      </svg>
    )}
  </Icon>
)

AcceleratorIcon.propTypes = {
  size: PropTypes.string,
}

AcceleratorIcon.defaultProps = {
  size: 'lg',
}

export default AcceleratorIcon
