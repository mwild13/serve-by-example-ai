// Durable per-account daily cap on OpenAI-backed requests.
//
// lib/rate-limit.ts keeps its counts in memory per worker instance, so it
// slows a burst and does not bound a day's spend. This count lives in
// Postgres (ai_usage_daily, bumped atomically by bump_ai_usage() — see
// supabase/migrations/20261012_ai_usage_and_acquisition.sql) and is shared by
// every signed-in AI route, so one account has one allowance across scenario
// grading, Arena and both coaches.

import type { SupabaseClient } from "@supabase/supabase-js";

const AI_DAILY_LIMIT_FREE = 30;
export const AI_DAILY_LIMIT_PAID = 300;

const AI_DAILY_LIMIT_MESSAGE =
  "You have reached today's AI limit. It resets at midnight, Sydney time.";

export function aiDailyLimitForTier(tier: string): number {
  return tier === "free" ? AI_DAILY_LIMIT_FREE : AI_DAILY_LIMIT_PAID;
}

/**
 * Counts one AI request against the user's allowance for today. Returns false
 * when they are over the limit. Call it last, straight before the OpenAI
 * request, so refused or replayed requests don't use the allowance.
 *
 * Fails open: if the count can't be read (database error, or the migration
 * has not been run yet) the request goes ahead and the error is logged.
 * Training should not stop because a counter did.
 */
export async function consumeAiAllowance(
  admin: SupabaseClient,
  userId: string,
  limit: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("bump_ai_usage", { p_user_id: userId, p_limit: limit });
  if (error) {
    console.error("AI daily cap: bump_ai_usage failed, allowing the request:", error.message);
    return true;
  }
  return data !== false;
}

export function aiDailyLimitResponse(): Response {
  return Response.json({ error: AI_DAILY_LIMIT_MESSAGE, code: "AI_DAILY_LIMIT" }, { status: 429 });
}
