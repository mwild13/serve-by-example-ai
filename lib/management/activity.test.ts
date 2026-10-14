import { describe, expect, it } from "vitest";
import { peopleOn, recentDays, sydneyDay, totalsByDay } from "./activity";
import type { TrainingActivityDay } from "./types";

const row = (staffId: string, day: string, extra: Partial<TrainingActivityDay> = {}): TrainingActivityDay => ({
  staffId, day, quizAnswers: 0, quizzesPassed: 0, scenarios: 0, aiScenarios: 0, ...extra,
});

describe("sydneyDay", () => {
  it("uses the Sydney date, not UTC", () => {
    // 2026-10-14 14:30 UTC is 15 October 01:30 in Sydney (AEDT, UTC+11).
    expect(sydneyDay(new Date("2026-10-14T14:30:00Z"))).toBe("2026-10-15");
  });
});

describe("recentDays", () => {
  it("lists the days oldest first, ending today", () => {
    expect(recentDays(3, new Date("2026-10-14T02:00:00Z"))).toEqual(["2026-10-12", "2026-10-13", "2026-10-14"]);
  });

  it("keeps one entry per date across the October daylight-saving change", () => {
    // Clocks went forward in Sydney on 2026-10-04.
    expect(recentDays(4, new Date("2026-10-05T13:30:00Z"))).toEqual(["2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06"]);
  });
});

describe("totalsByDay", () => {
  const days = ["2026-10-13", "2026-10-14"];
  const activity = [
    row("a", "2026-10-14", { quizAnswers: 5, quizzesPassed: 1 }),
    row("b", "2026-10-14", { scenarios: 1, aiScenarios: 2 }),
    row("a", "2026-10-13", { quizAnswers: 3 }),
    row("other-venue", "2026-10-14", { quizAnswers: 50 }),
    row("a", "2026-09-01", { quizAnswers: 9 }),
  ];

  it("counts people and totals for the venue's staff only, on the listed days", () => {
    expect(totalsByDay(activity, new Set(["a", "b"]), days)).toEqual([
      { day: "2026-10-13", people: 1, quizAnswers: 3, scenarios: 0, quizzesPassed: 0 },
      { day: "2026-10-14", people: 2, quizAnswers: 5, scenarios: 3, quizzesPassed: 1 },
    ]);
  });

  it("counts a person once across several days", () => {
    expect(peopleOn(activity, new Set(["a", "b"]), days)).toBe(2);
    expect(peopleOn(activity, new Set(["a", "b"]), ["2026-10-13"])).toBe(1);
  });
});
