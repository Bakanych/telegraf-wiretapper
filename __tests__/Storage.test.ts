import { getNewMessages, pushMessage } from '../src/Storage';
import { getUpdate, getMessage, getContext, getSession } from '../__TestHelpers/TestHelper';


test('getUserMessages from empty tape returns empty array', () => {
  const context = getContext(getUpdate(), getSession());
  const messages = getNewMessages(context);

  expect(messages).toHaveLength(0);
});

test('getUserMessages should not return own messages', () => {
  const context = getContext(getUpdate(), getSession());
  pushMessage(context);
  const messages = getNewMessages(context);
  expect(messages).toHaveLength(0);
});

test('getUserMessages should return only other user messages received after user last message', () => {
  const context = getContext(getUpdate(), getSession());
  pushMessage(context);

  context.update.message = getMessage(2);
  pushMessage(context);

  context.update.message = getMessage();
  pushMessage(context);

  const expected_1 = context.update.message = getMessage(2);
  pushMessage(context);

  const expected_2 = context.update.message = getMessage(3);
  pushMessage(context);

  context.update.message = getMessage();
  const new_messages = getNewMessages(context);

  expect(new_messages).toHaveLength(2);
  expect(new_messages).toContain(expected_1);
  expect(new_messages).toContain(expected_2);
});
