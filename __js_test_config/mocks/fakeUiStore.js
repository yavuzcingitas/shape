const fakeUiStore = {
  gridSettings: {
    cols: 4,
    gutter: 20,
    gridW: 312,
    gridH: 250,
  },
  blankContentToolState: {
    order: null,
    width: null,
    height: null,
    replacingId: null,
  },
  dialogConfig: {
    open: null,
    prompt: null,
    onConfirm: null,
    onCancel: null,
    iconName: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    onClose: jest.fn(),
  },
  scroll: {
    scrollToTop: jest.fn(),
    scrollToBottom: jest.fn(),
  },
  closeBlankContentTool: jest.fn(),
  closeMoveMenu: jest.fn(),
  resetSelectionAndBCT: jest.fn(),
  rolesMenuOpen: false,
  isLoading: false,
  selectedCardIds: [],
  selectCardId: jest.fn(),
  setViewingCollection: jest.fn(),
  viewingCollection: null,
  movingFromCollectionId: null,
  movingCardIds: [],
  openMoveMenu: jest.fn(),
  update: jest.fn(),
  alert: jest.fn(),
  alertOk: jest.fn(),
  defaultAlertError: jest.fn(),
  confirm: jest.fn(),
  closeDialog: jest.fn(),
  cardAction: 'move',
  blurContent: false,
  organizationMenuPage: 'organizationMenuPage',
  editingName: false,
}

export default fakeUiStore
