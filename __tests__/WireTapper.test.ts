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

test.each([
  ['', 0],
  ['/othercommand', 1],
  ['/othercommand@anybot', 1]
])
  ('should save any message into Tape and do not run play', (text, expected) => {
    //@ts-ignore
    const context: ContextMessageUpdate = {
      updateType: 'message',
      update: getUpdate(getMessage(1, text as string))
    };

    wireTapper.middleware()(context);

    expect(mockSave).toHaveBeenCalledTimes(expected as number);
    expect(mockGetUserMessages).not.toHaveBeenCalled();
  });


test.each([
  [`/${config.playCommand}`],
  [`/${config.playCommand}@mybot`],
  [`/${config.playCommand}@___sdhfjksldkjfskdjhf_BOt`]])
  ('should play first and then save message into Tape', (text) => {

    // @ts-ignore
    const context: ContextMessageUpdate = {
      updateType: 'message',
      update: getUpdate(getMessage(1, text))
    };

    wireTapper.middleware()(context);

    expect(callOrder).toEqual(['getUserMessages', 'save']);

  });