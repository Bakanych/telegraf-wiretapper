import Tape from '../src/Tape';
import { WireTapper, Configuration } from '../src/index';
import { ContextMessageUpdate } from 'telegraf';
import { getUpdate, getMessage } from '../__TestHelpers/TestHelper';

const callOrder: string[] = [];
const mockSave = jest.fn(() => callOrder.push('save'));
const mockGetUserMessages = jest.fn(() => callOrder.push('getUserMessages'));

jest.mock('../src/Tape', () => {
  return jest.fn().mockImplementation(() => {
    return {
      save: mockSave,
      getUserMessages: mockGetUserMessages
    };
  });
});

const config: Configuration = {
  playCommand: 'жги',
  yandexCloud: { accessKey: '', folderId: '' }
}

let wireTapper: any;


beforeEach(() => {

  jest.clearAllMocks();
  callOrder.length = 0;

  wireTapper = new WireTapper(config);
  expect(Tape).toHaveBeenCalledTimes(1);
});

test('should save any message into Tape and do not run play', () => {
  //@ts-ignore
  const context: ContextMessageUpdate = { updateType: 'message', update: { update_id: 1, message: '' } };

  wireTapper.middleware()(context);

  expect(mockSave).toHaveBeenCalledTimes(1);
  expect(mockGetUserMessages).not.toHaveBeenCalled();
});


test('should play first and then save message into Tape', () => {

  // @ts-ignore
  const context: ContextMessageUpdate = {
    updateType: 'message',
    update: getUpdate(getMessage(1, `/${config.playCommand}`))
  };

  wireTapper.middleware()(context);

  expect(callOrder).toEqual(['getUserMessages', 'save']);

});