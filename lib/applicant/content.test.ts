import { describe, expect, it } from "vitest";
import { drawTest, parseItemKey, TRACKS } from "./blueprint";
import { CORE_MODULES, ROLE_MODULES, TRACK_GUESTS, findSourceQuestion, trackSources } from "./content";
import { GUEST_BRIEFS } from "@/lib/live-guest/guests";
import { liveQuestions } from "@/lib/question-bank";

const seeded = (seed: number) => {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2 ** 31;
    return x / 2 ** 31;
  };
};

describe("applicant content", () => {
  it("uses only modules 1 to 40 that have live questions", () => {
    for (const id of [...CORE_MODULES, ...Object.values(ROLE_MODULES).flat()]) {
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(40);
      expect(liveQuestions(id).length).toBeGreaterThan(0);
    }
  });

  it("keeps role modules out of the core quiz", () => {
    for (const ids of Object.values(ROLE_MODULES)) {
      expect(ids.filter((id) => CORE_MODULES.includes(id))).toEqual([]);
    }
  });

  it("names only reviewed Live Guest briefs", () => {
    for (const id of Object.values(TRACK_GUESTS).flat()) {
      expect(GUEST_BRIEFS.find((g) => g.id === id)?.reviewed).toBe(true);
    }
  });

  it("can fill every section but the written scenarios for bar and floor today", () => {
    for (const track of ["bar", "floor"] as const) {
      const result = drawTest(trackSources(track), seeded(1));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.shortfall.map((s) => s.section)).toEqual(["written"]);
    }
  });

  it("finds the question behind every quiz and ordering key it deals", () => {
    for (const { id } of TRACKS) {
      const sources = trackSources(id);
      const keys = [...sources.core, ...sources.role].flatMap((s) => s.questions.map((q) => `core:${s.source}:${q.id}`));
      for (const key of keys) {
        const ref = parseItemKey(key);
        if (!ref || !("source" in ref)) throw new Error(key);
        expect(findSourceQuestion(ref.source, ref.questionId)).not.toBeNull();
      }
    }
    expect(findSourceQuestion("15", "no-such-question")).toBeNull();
    expect(findSourceQuestion("brand", "x")).toBeNull();
  });
});
