import Recorder from '../src/Recorder';
import { getUpdate, getMessage, getContext, getSession } from '../__TestHelpers/TestHelper';

const recorder = new Recorder();

test('getUserMessages from empty tape returns empty array', () => {
  const context = getContext(getUpdate(), getSession());
  const messages = recorder.getNewMessages(context);

  expect(messages).toHaveLength(0);
});

test('getUserMessages should not return own messages', () => {
  const context = getContext(getUpdate(), getSession());
  recorder.recordMessage(context);
  const messages = recorder.getNewMessages(context);
  expect(messages).toHaveLength(0);
});

test('getUserMessages should return only other user messages received after user last message', () => {
  const context = getContext(getUpdate(), getSession());
  recorder.recordMessage(context);

  context.update.message = getMessage(2);
  recorder.recordMessage(context);

  context.update.message = getMessage();
  recorder.recordMessage(context);

  const expected_1 = context.update.message = getMessage(2);
  recorder.recordMessage(context);

  const expected_2 = context.update.message = getMessage(3);
  recorder.recordMessage(context);

  context.update.message = getMessage();
  const new_messages = recorder.getNewMessages(context);

  expect(new_messages).toHaveLength(2);
  expect(new_messages).toContain(expected_1);
  expect(new_messages).toContain(expected_2);
});
