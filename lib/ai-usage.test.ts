import { describe, expect, it } from "vitest";
import { aiDailyLimitMessage, nextAiReset } from "./ai-usage";
import { readAiDailyLimit } from "./use-ai-daily-limit";

describe("nextAiReset", () => {
  it("is the next Sydney midnight in winter (UTC+10)", () => {
    // 09:30 on 1 July in Sydney.
    expect(nextAiReset(new Date("2026-06-30T23:30:00Z")).toISOString()).toBe("2026-07-01T14:00:00.000Z");
  });

  it("is the next Sydney midnight in summer (UTC+11)", () => {
    // 19:06 on 12 October in Sydney.
    expect(nextAiReset(new Date("2026-10-12T08:06:00Z")).toISOString()).toBe("2026-10-12T13:00:00.000Z");
  });
});

describe("aiDailyLimitMessage", () => {
  const now = new Date("2026-10-12T08:06:00Z");

  it("rounds the wait up to whole hours", () => {
    expect(aiDailyLimitMessage(new Date("2026-10-12T13:00:00Z"), now)).toContain("in about 5 hours");
  });

  it("says under an hour for the last hour", () => {
    expect(aiDailyLimitMessage(new Date("2026-10-12T08:40:00Z"), now)).toContain("in under an hour");
  });
});

describe("readAiDailyLimit", () => {
  it("reads the limit a route returns", () => {
    const limit = readAiDailyLimit({
      error: "Limit reached.",
      code: "AI_DAILY_LIMIT",
      resetsAt: "2026-10-12T13:00:00.000Z",
      upgrade: true,
    });
    expect(limit).toEqual({ message: "Limit reached.", resetsAt: Date.parse("2026-10-12T13:00:00.000Z"), upgrade: true });
  });

  it("ignores a burst-limit 429 and a body with no reset time", () => {
    expect(readAiDailyLimit({ error: "Too many requests." })).toBeNull();
    expect(readAiDailyLimit({ code: "AI_DAILY_LIMIT" })).toBeNull();
    expect(readAiDailyLimit(null)).toBeNull();
  });
});
