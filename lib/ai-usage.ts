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

const HOUR_MS = 60 * 60 * 1000;

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

/**
 * The next midnight in Sydney, which is when bump_ai_usage() starts a new
 * day. Worked out from the Sydney wall clock, so it is an hour out on the two
 * days a year the clocks change.
 */
export function nextAiReset(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const elapsedMs = ((part("hour") * 60 + part("minute")) * 60 + part("second")) * 1000;
  return new Date(now.getTime() - now.getMilliseconds() + 24 * HOUR_MS - elapsedMs);
}

export function aiDailyLimitMessage(resetsAt: Date, now = new Date()): string {
  const hours = Math.ceil((resetsAt.getTime() - now.getTime()) / HOUR_MS);
  const wait = hours <= 1 ? "in under an hour" : `in about ${hours} hours`;
  return `You have reached today's AI limit. It resets ${wait}, at midnight Sydney time.`;
}

/**
 * The 429 a route returns at the limit. `resetsAt` lets the screen hold its
 * submit button until the new day (lib/use-ai-daily-limit.ts); `upgrade` is
 * true for a free account, which a paid plan would give a higher limit.
 */
export function aiDailyLimitResponse(tier?: string): Response {
  const now = new Date();
  const resetsAt = nextAiReset(now);
  return Response.json(
    {
      error: aiDailyLimitMessage(resetsAt, now),
      code: "AI_DAILY_LIMIT",
      resetsAt: resetsAt.toISOString(),
      upgrade: tier === "free",
    },
    { status: 429 },
  );
}
