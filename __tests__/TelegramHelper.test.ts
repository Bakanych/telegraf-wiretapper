import { User } from "telegram-typings";
import { getUserName } from "../src/TelegramHelper";

test.each([
  ['u', '--', '', 'u'],
  [undefined, 'Вася', 'Васин', 'Вася Васин'],
  ['u', ' alex ', '', 'alex'],
  ['u', ' A ', ' B ', 'A B'],
  ['u', '-', '-hello, Вася!', 'hello, Вася!'],
  ['u', 'hello world, it\'s me!', '', 'hello world, it\'s me!'],
  ['u', '! -- )))', '', 'u'],
])('get full user name', (username, first_name, last_name, expected) => {
  const user: User = {
    id: 1, is_bot: false, first_name: first_name, username: username, last_name: last_name
  }

  expect(getUserName(user, false)).toEqual(expected);

});

test.each([
  ['u', '--', '', 'u'],
  [undefined, 'Андрей', '', 'Андрей'],
  ['u', ' alex ', '', 'alex'],
  ['u', ' A ', ' B ', 'A'],
  ['u', '-', 'hello world!', 'u'],
  ['u', 'hello world, it\'s me!', '', 'hello world, it\'s me!'],
  ['u', '! -- )))', 'last name', 'u'],
])('get first user name', (username, first_name, last_name, expected) => {
  const user: User = {
    id: 1, is_bot: false, first_name: first_name, username: username, last_name: last_name
  }

  expect(getUserName(user)).toEqual(expected);

});