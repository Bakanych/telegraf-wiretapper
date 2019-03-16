import Tape from '../src/Tape';
import { getUpdate, getMessage } from '../__TestHelpers/TestHelper';

let tape = new Tape();

let counter = 0;


beforeEach(() => {
  tape = new Tape();
});


test('getUserMessages from empty tape returns empty array', () => {
  const messages = tape.getUserMessages(getUpdate());

  expect(messages).toHaveLength(0);
});

test('getUserMessages should not return own messages', () => {
  tape.save(getUpdate());
  const messages = tape.getUserMessages(getUpdate());

  expect(messages).toHaveLength(0);
});

test('getUserMessages should return only other user messages received after user last message', () => {
  tape.save(getUpdate());
  tape.save(getUpdate(getMessage(42)));
  const expected = getUpdate();
  tape.save(expected);
  const messages = tape.getUserMessages(getUpdate(getMessage(42)));

  expect(messages).toHaveLength(1);
  expect(messages[0]).toBe(expected.message);
});

test('getUserMessages should return other users messages', () => {
  const update = getUpdate();
  tape.save(update);
  const messages = tape.getUserMessages(getUpdate(getMessage(42)));

  expect(messages).toHaveLength(1);
  expect(messages[0]).toBe(update.message);
});