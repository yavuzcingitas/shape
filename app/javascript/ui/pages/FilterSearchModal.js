import PropTypes from 'prop-types'
import ReactTags from 'react-tag-autocomplete'

import SearchIconRight from '~/ui/icons/SearchIconRight'
import TagIcon from '~/ui/icons/TagIcon'

import Modal from '~/ui/global/modals/Modal'
import Pill from '~/ui/global/Pill'
import StyledReactTags from '~/ui/pages/shared/StyledReactTags'

class FilterSearchModal extends React.Component {
  constructor(props) {
    super(props)
  }

  get filtersFormattedAsTags() {
    // TODO shared with FilterBar
    const { filters } = this.props
    return filters.map(filter => {
      const tag = {
        id: filter.id,
        name: filter.text,
        label: filter.text,
        symbol:
          filter.filter_type === 'tag' ? <TagIcon /> : <SearchIconRight />,
        selectable: true,
        selected: filter.selected,
        onSelect: this.onTagSelect,
      }
      tag.onDelete = this.onRemoveTag(tag)
      return tag
    })
  }

  handleModalClose = ev => {
    this.props.onModalClose()
  }

  onNewTag = tag => {
    this.props.onCreateTag(tag)
  }

  onRemoveTag = tag => ev => {
    this.props.onRemoveTag(tag)
  }

  onTagSelect = tag => {
    this.props.onSelectTag(tag)
  }

  render() {
    const { filterType, modalOpen } = this.props
    if (!modalOpen || !filterType) return null

    const title = `Filter by ${filterType}`
    const placeholder = `enter ${filterType.toLowerCase()} here`

    return (
      <Modal title={title} onClose={this.handleModalClose} open={modalOpen}>
        <StyledReactTags>
          <ReactTags
            tags={this.filtersFormattedAsTags}
            allowBackspace={false}
            delimiterChars={[',']}
            placeholder={placeholder}
            handleAddition={this.onNewTag}
            handleDelete={this.onRemoveTag}
            tagComponent={Pill}
            allowNew
          />
        </StyledReactTags>
      </Modal>
    )
  }
}

FilterSearchModal.propTypes = {
  filters: PropTypes.array.isRequired,
  onCreateTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
  onSelectTag: PropTypes.func.isRequired,
  onModalClose: PropTypes.func,
  filterType: PropTypes.oneOf(['Tags', 'Search Term', null]),
  modalOpen: PropTypes.bool,
}

FilterSearchModal.defaultProps = {
  onModalClose: () => {},
  filterType: null,
  isFilterBarActive: false,
  modalOpen: false,
}

export default FilterSearchModal
