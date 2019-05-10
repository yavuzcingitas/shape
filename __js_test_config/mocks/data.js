import _ from 'lodash'
import { observable } from "mobx"

const fakeJsonApiAttrs = {
  assign: jest.fn(),
  assignRef: jest.fn(),
  save: jest.fn().mockReturnValue({}),
  create: jest.fn().mockReturnValue({}),
  patch: jest.fn().mockReturnValue({}),
  update: jest.fn().mockReturnValue({}),
  disableMenu: jest.fn(),
}
export const fakeCollectionCard = {
  id: '11',
  order: 1,
  height: 1,
  width: 1,
  row: 0,
  col: 1,
  maxWidth: 1,
  maxHeight: 1,
  record: {},
  item: {},
  reference: false,
  image_contain: false,
  beginReplacing: jest.fn(),
  API_create: jest.fn(),
  API_archive: jest.fn(),
  API_linkToMyCollection: jest.fn(),
  ...fakeJsonApiAttrs,
}

export const fakeTextItemAttrs = {
  id: '1',
  type: 'Item::TextItem',
  internalType: 'items',
  name: 'My Cool Item',
  data_content: {
    ops: [
      {insert: 'This is the content for the item and it contains multiple sentences. Like this one.'}
    ],
    version: 1,
  },
  breadcrumb: [['collections', 1, 'Some collection'], ['items', 1, 'my item']],
  parentPath: '/',
  can_edit: false,
  inherited_tag_list: [],
  internalType: 'items',
  fullyLoaded: true,
  parent_collection_card: fakeCollectionCard,
}

export const fakeDataset = {
  measure: 'participants',
  description: 'A description',
  timeframe: 'month',
  chart_type: 'area',
  order: 0,
  data: [
    { date: '2018-07-10', value: 10 },
    { date: '2018-08-10', value: 25 },
    { date: '2018-09-10', value: 30 },
  ],
}

export const fakeDataItemCollectionsItemsAttrs = {
  ...fakeTextItemAttrs,
  type: 'Item::DataItem',
  data_content: null,
  report_type: 'report_type_collections_and_items',
  isReportTypeCollectionsItems: true,
  isReportTypeNetworkAppMetric: false,
  isReportTypeRecord: false,
  data_settings: {
    d_measure: 'participants',
    d_timeframe: 'month'
  },
  measure: {
    name: 'Participants'
  },
  primaryDataset: fakeDataset,
  datasets: [
    fakeDataset
  ],
}

export const fakeLegendItemAttrs = {
  ...fakeTextItemAttrs,
  type: 'Item::LegendItem',
  primary_measure: {
    measure: 'Business Unit',
    order: 0,
    style: { fill: '#9874AB' }
  },
  comparison_measures: [
    {
      measure: '95th Percentile',
      order: 1
    },
    {
      measure: '75th Percentile',
      order: 2
    },
  ],
  data_settings: {
    selected_measures: observable([
      '95th Percentile'
    ])
  }
}

export const fakeLegendItem = {
  ...fakeLegendItemAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeLegendItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
  save: jest.fn().mockReturnValue(Promise.resolve({})),
}

export const fakeLegendItemCard = {
  ...fakeItemCard,
  record: fakeLegendItem
}

export const creativeDifferenceQualityDataset = {
  measure: 'Purpose',
  description:
    'The degree to which there is alignment about a meaningful change that leadership and employees want to make in the world.',
  timeframe: 'month',
  chart_type: 'area',
  single_value: 0,
  order: 0,
  style: {
    fill: '#EFEFEF',
    dashWidth: 2,
  },
  data: [
    { date: '2018-07-10', value: 10 },
    { date: '2018-08-10', value: 25 },
    { date: '2018-09-10', value: 30 },
  ],
}

export const fakeDataItemRecordAttrs = {
  ...fakeTextItemAttrs,
  type: 'Item::DataItem',
  data_content: null,
  name: 'Data Item',
  report_type: 'report_type_record',
  isReportTypeCollectionsItems: false,
  isReportTypeNetworkAppMetric: false,
  isReportTypeRecord: true,
  primaryDataset: creativeDifferenceQualityDataset,
  datasets: [
    creativeDifferenceQualityDataset,
    {
      ...creativeDifferenceQualityDataset,
      measure: '95th Percentile',
      order: 1,
      chart_type: 'line'
    }
  ],
}

export const fakeTextItem = {
  ...fakeTextItemAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeTextItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
  toJSON: jest.fn().mockReturnValue(fakeTextItemAttrs),
  ...fakeJsonApiAttrs,
}
export const fakeVideoItemAttrs = {
  id: '2',
  type: 'Item::VideoItem',
  internalType: 'items',
  name: 'Crazy Honey Badger',
  url: 'https://www.youtube.com/watch?v=4r7wHMg5Yjg',
  thumbnail_url: 'https://img.youtube.com/vi/4r7wHMg5Yjg/hqdefault.jpg',
  inherited_tag_list: [],
  can_edit: false,
  parent_collection_card: fakeCollectionCard,
}
export const fakeVideoItem = {
  ...fakeVideoItemAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeTextItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
}
export const fakeImageItemAttrs = {
  id: '3',
  type: 'Item::FileItem',
  name: 'Earth from Space',
  filestack_file: {
    id: '1',
    url:
      'https://www.nasa.gov/sites/default/files/styles/full_width_feature/public/thumbnails/image/iss052e023801_0.jpg',
  },
  imageUrl: jest.fn(),
  inherited_tag_list: [],
  can_edit: false,
  parent_collection_card: fakeCollectionCard,
}
export const fakeImageItem = {
  ...fakeImageItemAttrs,
  imageUrl: jest.fn().mockReturnValue('http://fake.url/img'),
  rawAttributes: jest.fn().mockReturnValue(fakeTextItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
}
export const fakeLinkItemAttrs = {
  id: '3',
  internalType: 'items',
  type: 'Item::LinkItem',
  name: 'Independent.uk',
  content: 'The best news under the sun',
  icon_url: 'http://icon.jpg',
  thumbnail_url: 'http://thumb.jpg',
  url: 'http://independente.co.uk',
  inherited_tag_list: [],
  can_edit: false,
  parent_collection_card: fakeCollectionCard,
}
export const fakeLinkItem = {
  ...fakeLinkItemAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeLinkItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
}
export const fakeChartItemAttrs = {
  id: '5',
  type: 'Item::ChartItem',
  name: '',
  content: '',
  chart_data: {
    0: 3,
    1: 6,
    2: 1,
    3: 8,
  },
  chart_data: {
    datasets: [
      {
        label: 'Super test',
        type: 'question_items',
        total: 7,
        data: [
          { num_responses: 2, answer: 1 },
          { num_responses: 2, answer: 2 },
          { num_responses: 0, answer: 3 },
          { num_responses: 3, answer: 4 },
        ],
      },
      {
        label: 'Super Org',
        type: 'org_wide',
        total: 50,
        data: [
          { num_responses: 5, answer: 1 },
          { num_responses: 10, answer: 2 },
          { num_responses: 20, answer: 3 },
          { num_responses: 15, answer: 4 },
        ],
      },
    ],
  },
  data_source_id: 3,
  inherited_tag_list: [],
  can_edit: false,
  parent_collection_card: fakeCollectionCard,
}
export const fakeChartItem = {
  ...fakeChartItemAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeChartItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
}
export const fakeFileItemAttrs = {
  id: '3',
  type: 'Item::FileItem',
  name: '',
  filestack_file: {
    id: '1',
    url:
      'https://www.nasa.gov/sites/default/files/styles/full_width_feature/public/thumbnails/image/iss052e023801_0.ppt',
    handle: 'aaaaaa',
    mimetype: 'application/vnd.powerpoint',
  },
  inherited_tag_list: [],
  can_edit: false,
  parent_collection_card: fakeCollectionCard,
}
export const fakeFileItem = {
  ...fakeFileItemAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeTextItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
}
export const fakeQuestionItem = {
  id: '3',
  ...fakeTextItemAttrs,
  type: 'Item::QuestionItem',
  question_type: 'question_description',
  rawAttributes: jest.fn().mockReturnValue(fakeTextItemAttrs),
  getRecordType: jest.fn().mockReturnValue('items'),
  ...fakeJsonApiAttrs,
}

export const fakeQuestionAnswer = {
  answer_text: 'Great!',
  answer_number: 1,
  question_id: fakeQuestionItem.id,
}

export const fakeItemCard = {
  id: '10',
  order: 0,
  height: 1,
  width: 1,
  maxWidth: 1,
  record: fakeTextItem,
  item: fakeTextItem,
  image_contain: false,
  API_create: jest.fn(),
  API_archive: jest.fn(),
  API_linkToMyCollection: jest.fn(),
  ...fakeJsonApiAttrs,
}

export const fakeQuestionItemCard = {
  ...fakeItemCard,
  record: fakeQuestionItem,
  card_question_type: fakeQuestionItem.question_type,
}

const fakeCards = [fakeItemCard, fakeItemCard, fakeItemCard]

export const fakeCollection = {
  id: '1',
  name: 'My Workspace X',
  type: 'Collection',
  breadcrumb: [],
  roles: [],
  tag_list: ['prototype', 'blockchain'],
  inherited_tag_list: [],
  can_edit: false,
  can_edit_content: false,
  master_template: false,
  isSharedCollection: false,
  isUserCollection: false,
  isNormalCollection: true,
  num_survey_responses: 0,
  cover: {
    image_url: 'http://fake.url.net',
    text: 'Lorem ipsum blockchain boogie',
    name: 'Proto-typo',
  },
  card_order: 'order',
  collection_cards: fakeCards,
  sortedCards: fakeCards,
  parent_collection_card: fakeCollectionCard,
  // This is a computed property on the collection store
  cardIds: _.map(fakeCards, c => c.id),
  cardIdsWithinRectangle: jest.fn().mockReturnValue([]),
  API_archive: jest.fn(),
  API_updateCard: jest.fn(),
  API_updateName: jest.fn(),
  API_getNextAvailableTest: jest.fn(),
  API_clearCollectionCover: jest.fn(),
  API_fetchCards: jest.fn().mockReturnValue(Promise.resolve({})),
  API_batchUpdateCards: jest.fn().mockReturnValue(Promise.resolve({})),
  API_batchUpdateCardsWithUndo: jest.fn().mockReturnValue(Promise.resolve({})),
  checkCurrentOrg: jest.fn(),
  confirmEdit: jest.fn(),
  updateScrollBottom: jest.fn(),
  cardProperties: [],
  internalType: 'collections',
  meta: {
    snapshot: {
      can_edit: false,
    },
  },
  ...fakeJsonApiAttrs,
}
// also set parentCollection on fakeCard
fakeCollectionCard.parentCollection = { ...fakeCollection }

export const fakeGroupAttrs = {
  id: '1',
  name: 'IDEO Products',
  handle: 'ideo-products',
  internalType: 'groups',
  filestack_file_url: 'https://cdn.filestackcontent.com/i4iKADquTQCWMAvyz02R',
  roles: [],
  can_edit: true,
}
export const fakeGroup = {
  ...fakeJsonApiAttrs,
  ...fakeGroupAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeGroupAttrs),
  getRecordType: jest.fn().mockReturnValue('groups'),
}
export const fakeOrganizationAttrs = {
  id: '1',
  name: 'TestOrg',
  slug: 'test-org',
  primary_group: fakeGroup,
  guest_group: fakeGroup,
  admin_group: fakeGroup,
}
export const fakeOrganization = {
  ...fakeOrganizationAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeOrganizationAttrs),
  getRecordType: jest.fn().mockReturnValue('organization'),
}
export const fakeUserAttrs = {
  id: '1',
  first_name: 'Oprah',
  last_name: 'Winfrey',
  name: 'Oprah Winfrey',
  email: 'oprah@winfrey.com',
  pic_url_square: 'https://filestackcdn.com/abc123',
  groups: [],
  current_organization: fakeOrganization,
  type: 'users',
  terms_accepted: true,
  isCurrentUser: jest.fn(),
  switchOrganization: jest.fn(),
  API_updateCurrentUser: jest.fn(),
  API_hideHelper: jest.fn().mockReturnValue(Promise.resolve({})),
  notify_through_email: true,
  show_move_modal: false,
}
export const fakeActionCableUser = {
  id: '99',
  name: 'Oprah Winfrey',
  pic_url_square: 'https://filestackcdn.com/abc123',
}
export const fakeUser = {
  ...fakeUserAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeUserAttrs),
  getRecordType: jest.fn().mockReturnValue('users'),
}
export const fakeRoleAttrs = {
  id: '1',
  name: 'editor',
  users: [fakeUser, fakeUser],
  groups: [],
  resource: { id: '1', type: 'collection', internalType: 'collection' },
  API_delete: jest.fn().mockReturnValue(Promise.resolve({})),
}
export const fakeRole = {
  ...fakeRoleAttrs,
  rawAttributes: jest.fn().mockReturnValue(fakeRoleAttrs),
  getRecordType: jest.fn().mockReturnValue('roles'),
  canEdit: jest.fn(),
}
export const fakePosition = {
  xPos: 0,
  yPos: 0,
  height: 1,
  width: 1,
}
export const fakeComment = {
  id: '1',
  author: fakeUser,
  message:
    'This is my message to the world. Go to the source: https://www.ideo.com',
  draftjs_data: {"blocks":[{"key":"74h6f","data":{},"text":"This is my message to the world. Go to the source: https://www.ideo.com","type":"unstyled","depth":0,"entityRanges":[],"inlineStyleRanges":[]}],"entityMap":{}},
  created_at: new Date('2019-05-09T03:18:00'),
  updated_at: new Date('2019-05-09T03:18:00'),
}
export const fakeThread = {
  id: '1',
  record: fakeCollection,
  key: 'collection-1',
  unread_count: 2,
  comments: [fakeComment, fakeComment, fakeComment],
  users_thread: {
    subscribed: true,
    get currentSubscribed() {
      return this.subscribed
    }
  },
  latestUnreadComments: [fakeComment, fakeComment],
  API_saveComment: jest.fn().mockReturnValue(Promise.resolve({})),
  API_fetchComments: jest.fn().mockReturnValue(Promise.resolve({})),
  API_subscribe: jest.fn().mockReturnValue(Promise.resolve({})),
  API_unsubscribe: jest.fn().mockReturnValue(Promise.resolve({})),
}
export const fakeActivity = {
  id: '1',
  type: 'activities',
  action: 'archived',
  actor: fakeUser,
  created_at: new Date(),
  subject_users: [],
  subject_groups: [],
  target: fakeCollection,
  target_type: 'Collection',
  target_id: fakeCollection.id,
  setTarget: jest.fn(),
  ...fakeJsonApiAttrs,
}
export const fakeNotification = {
  id: '1',
  type: 'notifications',
  read: false,
  activity: fakeActivity,
  combined_actors: [],
  combined_activities_ids: [],
  user: fakeUser,
  ...fakeJsonApiAttrs,
}
export const fakeSurveyResponse = {
  id: '1',
  type: 'survey_responses',
  status: 'in_progress',
  question_answers: [],
  ...fakeJsonApiAttrs,
}
