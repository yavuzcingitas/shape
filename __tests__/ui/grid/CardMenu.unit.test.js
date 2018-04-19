import _ from 'lodash'
import CardMenu from '~/ui/grid/CardMenu'
import fakeUiStore from '#/mocks/fakeUiStore'
import {
  fakeCollection,
  fakeCollectionCard,
} from '#/mocks/data'

const card = fakeCollectionCard
const uiStore = { ...fakeUiStore, viewingCollection: fakeCollection }
const props = {
  card,
  uiStore,
  canEdit: false,
  canReplace: false,
  menuOpen: false,
}

let wrapper, allActions, actions, component
describe('CardMenu', () => {
  describe('as editor', () => {
    beforeEach(() => {
      allActions = [
        'Duplicate',
        'Move',
        'Link',
        'Add to My Collection',
        'Archive',
        'Replace',
      ]
      actions = _.without(allActions, 'Replace')
      props.canEdit = true
      wrapper = shallow(
        <CardMenu.wrappedComponent {...props} />
      )
      component = wrapper.instance()
    })

    it('creates a PopoutMenu with all editable actions', () => {
      const popout = wrapper.find('PopoutMenu').at(0)
      expect(popout.props().menuItems.length).toEqual(actions.length)
      expect(_.map(popout.props().menuItems, i => i.name)).toEqual(actions)
    })

    it('creates a PopoutMenu with editable actions including replace if canReplace', () => {
      props.canReplace = true
      wrapper = shallow(
        <CardMenu.wrappedComponent {...props} />
      )
      const popout = wrapper.find('PopoutMenu').at(0)
      expect(popout.props().menuItems.length).toEqual(allActions.length)
      expect(_.map(popout.props().menuItems, i => i.name)).toEqual(allActions)
    })

    it('calls API_duplicate on duplicateCard action', () => {
      wrapper.instance().duplicateCard()
      expect(card.API_duplicate).toHaveBeenCalled()
    })

    it('calls beginReplacing on replaceCard action', () => {
      wrapper.instance().replaceCard()
      expect(card.beginReplacing).toHaveBeenCalled()
    })

    // TODO: figure out how to test uiStore mock methods
    // it('calls selectCardId and openMoveMenu on moveCard action', () => {
    //   wrapper.instance().moveCard()
    //   expect(uiStore.selectCardId).toHaveBeenCalledWith(card.id)
    // })
  })

  describe('addToMyCollection', () => {
    beforeEach(async () => {
      component.toggleDisable = jest.fn()
      await component.addToMyCollection()
    })

    it('should close the move menu', () => {
      expect(props.uiStore.closeMoveMenu).toHaveBeenCalled()
    })

    it('should disable then re-enable the menu', () => {
      expect(component.toggleDisable).toHaveBeenCalled()
    })

    it('should call the API to link to my collection', () => {
      expect(card.API_linkToMyCollection).toHaveBeenCalled()
    })
  })

  describe('as viewer', () => {
    beforeEach(() => {
      actions = ['Duplicate', 'Link', 'Add to My Collection']
      props.canEdit = false
      props.canReplace = false
      wrapper = shallow(
        <CardMenu.wrappedComponent {...props} />
      )
    })

    it('creates a PopoutMenu with Duplicate and Link viewer actions', () => {
      const popout = wrapper.find('PopoutMenu').at(0)
      expect(popout.props().menuItems.length).toEqual(3)
      expect(_.map(popout.props().menuItems, i => i.name)).toEqual(actions)
    })
  })
})
