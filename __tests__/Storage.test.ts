import { getNewMessages, pushMessage, WireTapperModel, max_messages } from '../src/Storage';
import { getUpdate, getMessage, getContext, getSession } from '../__test_helpers/TestHelper';


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

test.each([
  [0, 1],
  [max_messages, max_messages]
])
  ('storage capacity should be less or equal to max_messages', (before, after) => {

    const context = getContext(getUpdate(), getSession());
    (context.session as WireTapperModel).messages =
      [...Array(before).keys()].map(i => getMessage(i));
    pushMessage(context);

    expect(context.session.messages.length).toEqual(after);

  });
