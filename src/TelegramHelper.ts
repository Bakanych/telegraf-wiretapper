import { User } from "telegram-typings";

export function getUserName(user: User): string {
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username!;
}