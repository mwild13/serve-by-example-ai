import { describe, expect, it } from "vitest";
import { CHALLENGE_LIST, pickTodaysChallenge } from "@/lib/challenge-content";
import { TOTAL_CHALLENGES } from "@/lib/challenges";

describe("challenge content", () => {
  it("has one challenge per index, in order", () => {
    expect(CHALLENGE_LIST.map((c) => c.index)).toEqual([...Array(TOTAL_CHALLENGES).keys()]);
  });

  it("has unique slugs", () => {
    expect(new Set(CHALLENGE_LIST.map((c) => c.slug)).size).toBe(CHALLENGE_LIST.length);
  });

  it("is answerable", () => {
    for (const c of CHALLENGE_LIST) {
      switch (c.kind) {
        case "sequence":
          expect([...c.shuffled].sort(), c.slug).toEqual(c.steps.map((s) => s.id).sort());
          expect(c.shuffled, c.slug).not.toEqual(c.steps.map((s) => s.id));
          break;
        case "fill":
          expect(c.parts.length, c.slug).toBe(c.answers.length + 1);
          for (const a of c.answers) expect(c.bank, c.slug).toContain(a);
          expect(new Set(c.bank).size, c.slug).toBe(c.bank.length);
          break;
        case "match":
          expect([...c.rightOrder].sort(), c.slug).toEqual(c.pairs.map((_, i) => i));
          break;
        case "spot":
          expect(c.lines.filter((l) => l.wrong), c.slug).toHaveLength(1);
          break;
        case "choice":
          expect(c.options.filter((o) => o.correct), c.slug).toHaveLength(1);
          break;
      }
    }
  });
});

describe("pickTodaysChallenge", () => {
  const day = (n: number) => new Date(n * 86_400_000 + 3_600_000);

  it("moves through the list a day at a time", () => {
    expect(pickTodaysChallenge([], day(0)).index).toBe(CHALLENGE_LIST[0].index);
    expect(pickTodaysChallenge([], day(1)).index).toBe(CHALLENGE_LIST[1].index);
  });

  it("skips the ones already done", () => {
    expect(pickTodaysChallenge([CHALLENGE_LIST[0].index, CHALLENGE_LIST[1].index], day(0)).index).toBe(CHALLENGE_LIST[2].index);
  });

  it("still picks one when every challenge is done", () => {
    const all = CHALLENGE_LIST.map((c) => c.index);
    expect(pickTodaysChallenge(all, day(3)).index).toBe(CHALLENGE_LIST[3].index);
  });
});
