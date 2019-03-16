import { MessageProcessor, Dialogue } from '../src/MessageProcessor';
import { getUserName } from '../src/TelegramHelper';
import { EOL } from 'os';
import { getMessage } from '../__TestHelpers/TestHelper';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const mp = new MessageProcessor();


test('convert single message with callback', () => {
  const callback = jest.fn();
  const message = getMessage();
  const expected_dialogue: Dialogue = { user_id: message.from!.id, user_name: getUserName(message.from!), text: message.text! };

  const result = mp.convertToPlayScript([message], callback);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expected_dialogue);
  expect(result).toEqual([expected_dialogue]);
});

test('convert empty text', () => {
  const message = getMessage();
  const expected_dialogue: Dialogue = { user_id: message.from!.id, user_name: getUserName(message.from!), text: message.text! };

  const result = mp.convertToPlayScript([message]);

  expect(result).toEqual([expected_dialogue]);
});

test('convert single user dialogue', () => {
  const phrases = ['Hi there', 'My name is Alex', '😀'];
  const messages = phrases.map(x => getMessage(1, x));
  const expected_dialogue: Dialogue[] = [{ user_id: 1, user_name: '1', text: phrases.join(EOL) }];

  const result = mp.convertToPlayScript(messages);

  expect(result).toEqual(expected_dialogue);
});

test('convert multi user dialogue with callback', () => {
  const callback = jest.fn();

  const u1_phrases1 = ['Hi there', 'My name is Alex', '😀'];
  const u2_phrases = ['I am John'];
  const u1_phrases2 = ['Nice to meet you.', 'Whatsup?'];
  const u3_phrases = ['Who is there?', ')))))'];
  const messages =
    u1_phrases1.map(x => getMessage(1, x))
      .concat(u2_phrases.map(x => getMessage(2, x)))
      .concat(u1_phrases2.map(x => getMessage(1, x)))
      .concat(u3_phrases.map(x => getMessage(3, x)))
    ;
  const expected_dialogue: Dialogue[] = [
    { user_id: 1, user_name: '1', text: u1_phrases1.join(EOL) },
    { user_id: 2, user_name: '2', text: u2_phrases.join(EOL) },
    { user_id: 1, user_name: '1', text: u1_phrases2.join(EOL) },
    { user_id: 3, user_name: '3', text: u3_phrases.join(EOL) },
  ];

  const result = mp.convertToPlayScript(messages, callback);

  expect(result).toEqual(expected_dialogue);
  expect(callback).toHaveBeenCalledTimes(4);
  expect(callback).toHaveBeenNthCalledWith(1, { user_id: 1, user_name: '1', text: u1_phrases1.join(EOL) });
  expect(callback).toHaveBeenNthCalledWith(4, { user_id: 3, user_name: '3', text: u3_phrases.join(EOL) });

});