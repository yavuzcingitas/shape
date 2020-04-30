import RolesSummary from '~/ui/roles/RolesSummary'

import { fakeRole, fakeUser } from '#/mocks/data'

const emptyProps = {
  roles: [],
  handleClick: jest.fn(),
  rolesMenuOpen: false,
}

const editorRole = { ...fakeRole, id: '1' }
const viewerRole = { ...fakeRole, id: '2' }
viewerRole.name = 'viewer'

const editorsAndViewersProps = {
  roles: [editorRole, viewerRole],
  rolesMenuOpen: false,
  handleClick: jest.fn(),
}

const canEditProps = {
  ...editorsAndViewersProps,
  canEdit: true,
}

let wrapper
describe('RolesSummary', () => {
  describe('with editors and viewers', () => {
    beforeEach(() => {
      wrapper = shallow(<RolesSummary {...editorsAndViewersProps} />)
    })

    it('renders editors', () => {
      expect(wrapper.find('.editor').length).toEqual(1)
    })

    it('renders viewers', () => {
      expect(wrapper.find('.viewer').length).toEqual(1)
    })

    it('does not render AddButton by default', () => {
      expect(wrapper.find('AddButton').exists()).toBe(false)
    })
  })

  describe('with only viewers', () => {
    beforeEach(() => {
      const onlyViewersProps = {
        ...emptyProps,
        roles: [viewerRole],
      }
      wrapper = shallow(<RolesSummary {...onlyViewersProps} />)
    })

    it('renders viewer and label', () => {
      expect(wrapper.find('.viewer').length).toEqual(1)
    })

    it('does not render editors', () => {
      expect(wrapper.find('.editor').exists()).toBe(false)
    })
  })

  describe('with only editors', () => {
    beforeEach(() => {
      const newProps = {
        ...emptyProps,
        roles: [editorRole],
      }
      wrapper = shallow(<RolesSummary {...newProps} />)
    })

    it('renders editor and label', () => {
      expect(wrapper.find('.editor').length).toEqual(1)
    })

    it('does not render viewers', () => {
      expect(wrapper.find('.viewer').exists()).toBe(false)
    })
  })

  describe('with more editors than should show', () => {
    beforeEach(() => {
      editorRole.users = [
        { ...fakeUser, id: '1' },
        { ...fakeUser, id: '2' },
        { ...fakeUser, id: '3' },
        { ...fakeUser, id: '4' },
        { ...fakeUser, id: '5' },
        { ...fakeUser, id: '6' },
      ]
      const newProps = {
        ...editorsAndViewersProps,
        roles: [editorRole],
      }
      wrapper = shallow(<RolesSummary {...newProps} />)
    })

    it('renders only 4 editors', () => {
      expect(wrapper.find('.editor').length).toEqual(4)
    })

    it('does not render any viewers or viewer label', () => {
      expect(wrapper.find('.viewer').exists()).toBe(false)
      expect(wrapper.render().text()).not.toMatch(/viewer/i)
    })
  })

  describe('with no viewers or editors and canEdit', () => {
    beforeEach(() => {
      wrapper = shallow(<RolesSummary {...emptyProps} canEdit />)
    })

    it('does not render editor label', () => {
      expect(wrapper.render().text()).not.toMatch(/editors/i)
    })

    it('does not render viewer label', () => {
      expect(wrapper.render().text()).not.toMatch(/viewers/i)
    })

    it('does not render editors or viewers', () => {
      expect(wrapper.find('.editor').exists()).toBe(false)
      expect(wrapper.find('.viewer').exists()).toBe(false)
    })
  })

  describe('when user canEdit', () => {
    beforeEach(() => {
      wrapper = shallow(<RolesSummary {...canEditProps} />)
    })

    it('renders manage roles button with onClick', () => {
      expect(wrapper.find('AddButton').exists()).toBe(true)
      expect(wrapper.find('AddButton').props().onClick).toEqual(
        canEditProps.handleClick
      )
    })
  })
})
