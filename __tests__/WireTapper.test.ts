import { WireTapper, Configuration, pushMessage, getNewMessages, getOrAddUserProfile, getUserProfiles } from '../src/index';
import { getUpdate, getMessage } from '../__test_helpers/TestHelper';
import { User } from 'telegram-typings';
import * as sc from '../src/Storage';
jest.mock('../src/Player');

// const mock_recordMessage = jest.fn(() => callOrder.push(recordMessage.name));
// const mock_getNewMessages = jest.fn(() => callOrder.push('getNewMessages'));

// jest.mock('../src/Recorder', () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       recordMessage: mock_recordMessage,
//       getNewMessages: mock_getNewMessages
//     };
//   });
// });

// jest.mock('../src/SessionController', () => {
//   return {
//     recordMessage: mock_recordMessage,
//     getNewMessages: () => callOrder.push(getNewMessages.name),
//     getUserSettings: () => callOrder.push(getUserSettings.name)
//   };
// });

const config: Configuration = {
  playCommand: 'жги',
  yandexCloud: { accessKey: '', folderId: '' }
}
const mockTelegram: any = {
  getMe: () => new Promise<User>(resolve => resolve({ id: 1, is_bot: true, username: 'mybot', first_name: 'mybot' }))
}
const reply = (text: string) => console.log(text);
const replyWithAudio = (audio: {}) => console.log('audio');
let wireTapper: WireTapper;

const callOrder: string[] = [];
beforeEach(() => {

  callOrder.length = 0;
  jest.clearAllMocks();

  spyOn(sc, 'pushMessage').and.callFake(() => callOrder.push(pushMessage.name));
  spyOn(sc, 'getNewMessages').and.callFake(() => callOrder.push(getNewMessages.name));
  //spyOn(sc, 'getOrAddUserProfile').and.callFake(() => callOrder.push(getOrAddUserProfile.name));
  //spyOn(sc, 'getUserProfiles').and.callFake(() => callOrder.push(getUserProfiles.name)).and.callThrough();
  wireTapper = new WireTapper(config);
});

test.each([
  ['', 0],
  ['/othercommand', 0],
  ['/othercommand@anybot', 0],
  ['test@anybot', 1],
  ['(.)(.)', 1]
])
  ('should save any message to storage (except non-play commands) and do not run play', async (text, expected) => {

    const context: any = {
      updateType: 'message',
      update: getUpdate(getMessage(1, text as string)),
      telegram: mockTelegram,
      reply: reply
    };

    await wireTapper.middleware()(context);

    expect(sc.pushMessage).toHaveBeenCalledTimes(expected as number);
    expect(sc.getNewMessages).not.toHaveBeenCalled();
  });


test.each([
  [`/${config.playCommand}`],
  [`/${config.playCommand}@mybot`]
])
  ('should play first and then save message into Tape if buffer was returned', async (text) => {

    spyOn(wireTapper.player, 'playScript').and.returnValue(Promise.resolve(Buffer.alloc(0)));
    const context: any = {
      session: {
        user_profiles: [],
      },
      updateType: 'message',
      update: getUpdate(getMessage(1, text)),
      telegram: mockTelegram,
      reply: reply,
      replyWithAudio: replyWithAudio
    };

    await wireTapper.middleware()(context);

    expect(sc.pushMessage).toHaveBeenCalled();
    expect(sc.getNewMessages).toHaveBeenCalled();
    expect(callOrder.indexOf(getNewMessages.name)).toBeLessThan(callOrder.indexOf(pushMessage.name));

  });

test('should play first and do not save message into Tape if undefined was returned', async () => {

  const context: any = {
    session: {
      user_profiles: [],
    },
    updateType: 'message',
    update: getUpdate(getMessage(1, '/' + config.playCommand)),
    telegram: mockTelegram,
    reply: reply
  };

  await wireTapper.middleware()(context);

  expect(sc.getNewMessages).toHaveBeenCalled();
  expect(sc.pushMessage).not.toHaveBeenCalled();
});