import Tape from '../src/Tape';
import { WireTapper, Configuration } from '../src/index';
import { getUpdate, getMessage } from '../__TestHelpers/TestHelper';
import { User } from 'telegram-typings';

jest.mock('../src/Player');

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

const mockTelegram: any = {
  getMe: () => new Promise<User>(resolve => resolve({ id: 1, is_bot: true, username: 'mybot', first_name: 'mybot' }))
}

const reply = (text: string) => console.log(text);

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
  ('should save any message into Tape and do not run play', async (text, expected) => {

    const context: any = {
      updateType: 'message',
      update: getUpdate(getMessage(1, text as string)),
      telegram: mockTelegram,
      reply: reply
    };

    await wireTapper.middleware()(context);

    expect(mockSave).toHaveBeenCalledTimes(expected as number);
    expect(mockGetUserMessages).not.toHaveBeenCalled();
  });


test.each([
  [`/${config.playCommand}`],
  [`/${config.playCommand}@mybot`]
])
  ('should play first and then save message into Tape', async (text) => {


    const context: any = {
      updateType: 'message',
      update: getUpdate(getMessage(1, text)),
      telegram: mockTelegram,
      reply: reply
    };

    await wireTapper.middleware()(context);

    expect(callOrder).toEqual(['getUserMessages', 'save']);

  });