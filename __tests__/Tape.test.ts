import { Tape } from '../src/Tape';
import { Update } from 'telegram-typings';

let tape = new Tape();

const ts = () => new Date().getTime();
let counter = 0;

const get_update = (user_id: number = 1): Update => ({
  update_id: counter++,
  message: {
    message_id: 1, date: ts(),
    chat: { id: 1, type: 'group' },
    from: { id: user_id, is_bot: false, first_name: 'any' }
  }
});

beforeEach(() => {
  tape = new Tape();
});


test('getUserMessages from empty tape returns empty array', () => {
  const messages = tape.getUserMessages(get_update());

  expect(messages).toHaveLength(0);
});

test('getUserMessages should not return own messages', () => {
  tape.save(get_update());
  const messages = tape.getUserMessages(get_update());

  expect(messages).toHaveLength(0);
});

test('getUserMessages should return only other user messages received after user last message', () => {
  tape.save(get_update());
  tape.save(get_update(42));
  const expected = get_update();
  tape.save(expected);
  const messages = tape.getUserMessages(get_update(42));

  expect(messages).toHaveLength(1);
  expect(messages[0]).toBe(expected.message);
});

test('getUserMessages should return other users messages', () => {
  const update = get_update();
  tape.save(update);
  const messages = tape.getUserMessages(get_update(2));

  expect(messages).toHaveLength(1);
  expect(messages[0]).toBe(update.message);
});