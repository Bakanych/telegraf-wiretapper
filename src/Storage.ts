import { ContextMessageUpdate } from "telegraf";
import { Message } from "telegram-typings";
import { isBotCommand } from "./TelegramHelper";

export interface UserProfile {
  user_id: number;
  voice?: string
}

export interface WireTapperModel {
  messages: Message[];
  user_profiles: UserProfile[];
}

export function pushMessage(ctx: ContextMessageUpdate) {
  ctx.session.messages = ctx.session.messages || [];
  ctx.session.messages.push(ctx.update.message!);
}

export function getNewMessages(ctx: ContextMessageUpdate) {
  ctx.session.messages = ctx.session.messages || [];
  if (!ctx.session.messages)
    return [];

  const user_id = ctx.update.message!.from!.id;
  const user_messages = ctx.session.messages.filter(x => x.from!.id === user_id)
    .sort((x, y) => y.date - x.date);
  const user_last_message_date = (user_messages.length > 0) ? user_messages[0].date : 0;
  return ctx.session.messages.filter(x => x.date > user_last_message_date && !isBotCommand(x))
    .sort((x, y) => x.date - y.date);
}

export function upsertUserProfile(ctx: ContextMessageUpdate, user_id: number, update: (user_profile: UserProfile) => UserProfile) {
  const index = getOrAddUserProfile(ctx, user_id);
  update(ctx.session.user_profiles[index]);
}

export function getOrAddUserProfile(ctx: ContextMessageUpdate, user_id: number) {
  getUserProfiles(ctx);
  let profile = ctx.session.user_profiles.filter(x => x.user_id === user_id);
  if (profile.length === 0) {
    profile[0] = { user_id: user_id };
    ctx.session.user_profiles.push(profile[0]);
  }

  return ctx.session.user_profiles.indexOf(profile[0]);
}

export function getUserProfiles(ctx: ContextMessageUpdate) {
  return ctx.session.user_profiles = ctx.session.user_profiles || [];
}