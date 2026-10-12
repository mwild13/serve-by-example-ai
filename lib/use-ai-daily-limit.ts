// Browser side of the daily AI limit (lib/ai-usage.ts). A screen that calls an
// AI route passes each failed response's body to readAiDailyLimit(); while a
// limit is held it keeps its submit button disabled, so nobody retries a
// request that cannot succeed until the new day.

import { useEffect, useState } from "react";

export type AiDailyLimit = { message: string; resetsAt: number; upgrade: boolean };

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** The limit described by a 429 body, or null when the 429 is something else (a burst limit, say). */
export function readAiDailyLimit(body: unknown): AiDailyLimit | null {
  if (!body || typeof body !== "object") return null;
  const source = body as Record<string, unknown>;
  if (source.code !== "AI_DAILY_LIMIT") return null;
  const resetsAt = typeof source.resetsAt === "string" ? Date.parse(source.resetsAt) : NaN;
  if (!Number.isFinite(resetsAt)) return null;
  return {
    message: typeof source.error === "string" ? source.error : "You have reached today's AI limit.",
    resetsAt,
    upgrade: source.upgrade === true,
  };
}

/** Holds the limit until it resets, then clears it. */
export function useAiDailyLimit() {
  const [limit, setLimit] = useState<AiDailyLimit | null>(null);

  useEffect(() => {
    if (!limit) return;
    const wait = Math.min(Math.max(limit.resetsAt - Date.now(), 0), MAX_TIMEOUT_MS);
    const timer = setTimeout(() => setLimit(null), wait);
    return () => clearTimeout(timer);
  }, [limit]);

  return [limit, setLimit] as const;
}
