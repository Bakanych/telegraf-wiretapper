import { ContextMessageUpdate } from "telegraf";
import { Message } from "telegram-typings";
import { getBotCommand } from "./TelegramHelper";
import { Voice } from "./Synthesizer";

export interface UserProfile {
  user_id: number;
  voice?: Voice
}

export interface WireTapperModel {
  messages: Message[];
  user_profiles: UserProfile[];
}

export const max_messages = 5000;

export function pushMessage(ctx: ContextMessageUpdate) {
  ctx.session.messages = ctx.session.messages || [];
  ctx.session.messages.push(ctx.update.message!);

  ctx.session.messages.splice(max_messages - 1, ctx.session.messages.length - max_messages);
}

export function updateMessage(ctx: ContextMessageUpdate) {
  const edited_message = ctx.update.edited_message!;
  const original_message = ctx.session.messages.filter(x => x.message_id === edited_message.message_id);
  if (original_message) {
    ctx.session.messages[ctx.session.messages.indexOf(original_message[0])] = edited_message;
  }
}

export function getNewMessages(ctx: ContextMessageUpdate) {
  ctx.session.messages = ctx.session.messages || [];
  if (!ctx.session.messages)
    return [];

  const user_id = ctx.update.message!.from!.id;
  const user_messages = ctx.session.messages.filter(x => x.from!.id === user_id)
    .sort((x, y) => y.date - x.date);
  const user_last_message_date = (user_messages.length > 0) ? user_messages[0].date : 0;
  return ctx.session.messages.filter(x => x.date > user_last_message_date && !getBotCommand(x))
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