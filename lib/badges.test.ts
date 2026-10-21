import { describe, expect, it } from "vitest";
import { badgeProgressText, badgesFromProgress, nextBadge } from "./badges";

const progress = {
  allModules: [
    { id: 1, category: "technical" },
    { id: 2, category: "service" },
  ],
  moduleProgress: { 1: { mastery: 90, scenariosAttempted: 3 } },
  mastery: { bartending: 60, sales: 0, management: 0 },
  bestCorrectStreak: 4,
  sbeEliteNumber: 0,
};

describe("badgesFromProgress", () => {
  it("puts earned badges first", () => {
    const badges = badgesFromProgress(progress, 0);
    const firstUnearned = badges.findIndex((b) => !b.earned);
    expect(badges.slice(0, firstUnearned).every((b) => b.earned)).toBe(true);
    expect(badges.slice(firstUnearned).every((b) => !b.earned)).toBe(true);
    expect(badges.filter((b) => b.earned).map((b) => b.id)).toEqual(["tech-starter", "tech-skilled"]);
  });

  it("copes with no progress yet", () => {
    const badges = badgesFromProgress(null, 0);
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.every((b) => !b.earned)).toBe(true);
  });

  it("counts the visit streak toward the streak badges", () => {
    expect(badgesFromProgress(progress, 3).find((b) => b.id === "streak-3")?.earned).toBe(true);
  });
});

describe("nextBadge", () => {
  it("picks one already under way over one not started", () => {
    expect(nextBadge(badgesFromProgress(progress, 0))?.id).toBe("tech-expert");
  });

  it("is null once every badge is earned", () => {
    expect(nextBadge([{ id: "a", label: "A", description: "", category: "special", earned: true }])).toBeNull();
  });
});

describe("badgeProgressText", () => {
  it("reads percentages and counts", () => {
    expect(badgeProgressText({ current: 42, required: 50, unit: "% avg mastery" })).toBe("42% of 50% avg mastery");
    expect(badgeProgressText({ current: 2, required: 7, unit: "day streak" })).toBe("2 of 7 day streak");
  });
});
