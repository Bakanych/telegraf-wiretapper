import { WireTapper, Configuration, pushMessage, getNewMessages, getOrAddUserProfile, getUserProfiles } from '../src/index';
import { getUpdate, getMessage } from '../__TestHelpers/TestHelper';
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
let wireTapper: any;

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

    expect(sc.pushMessage).toHaveBeenCalledTimes(expected as number);
    expect(sc.getNewMessages).not.toHaveBeenCalled();
  });


test.each([
  [`/${config.playCommand}`],
  [`/${config.playCommand}@mybot`]
])
  ('should play first and then save message into Tape', async (text) => {


    const context: any = {
      session: {
        user_profiles: [],
      },
      updateType: 'message',
      update: getUpdate(getMessage(1, text)),
      telegram: mockTelegram,
      reply: reply
    };

    await wireTapper.middleware()(context);

    expect(callOrder.indexOf(getNewMessages.name)).toBeLessThan(callOrder.indexOf(pushMessage.name));

  });