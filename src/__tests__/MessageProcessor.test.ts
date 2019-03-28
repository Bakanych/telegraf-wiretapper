import { MessageProcessor, Dialogue } from '../MessageProcessor';
import { EOL } from 'os';
import { getMessage, getDialogue } from '../__TestHelpers/TestHelper';
import { Message } from 'telegram-typings';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const mp = new MessageProcessor();
const callback = jest.fn(obj => console.log(obj));

beforeEach(() => {
  callback.mockClear();
});

test('convert single message with callback', () => {
  const message = getMessage(1, 'hi');
  const expected_dialogue: Dialogue = getDialogue(1, 'hi');

  const result = mp.convertToPlayScript([message], callback);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(expected_dialogue);
  expect(result).toEqual([expected_dialogue]);
});

test('convert empty text', () => {
  const result = mp.convertToPlayScript([getMessage()]);

  expect(result).toEqual([]);
});

test('convert single user dialogue', () => {
  const phrases = ['a', 'a)', '))'];
  const messages = phrases.map(x => getMessage(1, x));
  const expected_dialogue: Dialogue[] = [{ user_id: 1, user_name: '1', text: 'a' + EOL + 'a)' }];

  const result = mp.convertToPlayScript(messages);

  expect(result).toEqual(expected_dialogue);
});

test('convert multi user dialogue with callback', () => {

  const u1_phrases1 = ['Hi there', 'My name is Alex'];
  const u2_phrases = ['I am John'];
  const u1_phrases2 = ['Nice to meet you.', 'Whatsup?', '))'];
  const u3_phrases = ['Who is there?', '++', '%'];
  const messages =
    u1_phrases1.map(x => getMessage(1, x))
      .concat(u2_phrases.map(x => getMessage(2, x)))
      .concat(u1_phrases2.map(x => getMessage(1, x)))
      .concat(u3_phrases.map(x => getMessage(3, x)))
    ;
  const expected_dialogue: Dialogue[] = [
    { user_id: 1, user_name: '1', text: u1_phrases1.join(EOL) },
    { user_id: 2, user_name: '2', text: u2_phrases.join(EOL) },
    { user_id: 1, user_name: '1', text: u1_phrases2.slice(0, 2).join(EOL) },
    { user_id: 3, user_name: '3', text: u3_phrases[0] },
  ];

  const result = mp.convertToPlayScript(messages, callback);

  expect(result).toEqual(expected_dialogue);
  expect(callback).toHaveBeenCalledTimes(4);
  expect(callback).toHaveBeenNthCalledWith(1, { user_id: 1, user_name: '1', text: u1_phrases1.join(EOL) });
  expect(callback).toHaveBeenNthCalledWith(3, { user_id: 1, user_name: '1', text: u1_phrases2.slice(0, 2).join(EOL) });
  expect(callback).toHaveBeenNthCalledWith(4, { user_id: 3, user_name: '3', text: u3_phrases[0] });

});

test.each([
  [[getMessage(1, ')))'), getMessage(1, '😂'), getMessage(2, `${EOL} ${EOL}`)],
  [], 0],

  [[getMessage(1, 'привет'), getMessage(2, '😂')],
  [getDialogue(1, 'привет')], 1],

  [[getMessage(1, 'привет'), getMessage(1, '😂😂😂 как дела? ))))'), getMessage(2, ')))' + EOL + '😂😂😂'), getMessage(1, 'чот не смешно...')],
  [getDialogue(1, 'привет' + EOL + '😂😂😂 как дела? ))))' + EOL + 'чот не смешно...')], 1]
])
  ('do not add useless phrases into play script', (messages, expected, callCount) => {
    const dialogue = mp.convertToPlayScript(messages as Message[], callback);
    expect(dialogue).toEqual(expected);
    expect(callback).toHaveBeenCalledTimes(callCount as number);
  });