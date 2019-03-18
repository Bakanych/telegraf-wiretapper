import { User } from "telegram-typings";

export function getUserName(user: User, only_first_name = true): string {
  const user_regex = /[\wа-я]+.*/gi
  const first_name = (user.first_name.match(user_regex) || [''])[0].trim();
  const last_name = (user.last_name && !only_first_name) ? (user.last_name.match(user_regex) || [''])[0].trim() : '';
  return `${first_name} ${last_name}`.trim() || user.username!;
}
