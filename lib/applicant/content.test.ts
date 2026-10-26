import { describe, expect, it } from "vitest";
import { drawTest, parseItemKey, TRACKS } from "./blueprint";
import { CORE_MODULES, ROLE_MODULES, coreModulesFor, findSourceQuestion, trackSources } from "./content";
import { KITCHEN_BANK } from "./questions/kitchen";
import { WRITTEN_PROMPTS } from "./questions/written";
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
    for (const { id } of TRACKS) {
      expect(ROLE_MODULES[id].filter((m) => coreModulesFor(id).includes(m))).toEqual([]);
    }
  });

  it("leaves bar work out of the kitchen's core quiz", () => {
    for (const barOnly of [8, 15, 22, 24]) expect(coreModulesFor("kitchen")).not.toContain(barOnly);
    expect(coreModulesFor("kitchen").every((m) => CORE_MODULES.includes(m))).toBe(true);
  });

  it("can deal a full bar and floor test today", () => {
    for (const track of ["bar", "floor"] as const) {
      expect(drawTest(trackSources(track), seeded(1)).ok).toBe(true);
    }
  });

  it("can fill the kitchen's core quiz and ordering tasks", () => {
    const result = drawTest(trackSources("kitchen"), seeded(1));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.shortfall.map((s) => s.section).sort()).toEqual(["role", "written"]);
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

  it("has written scenarios with unique ids, known tracks and a usable marking guide", () => {
    const ids = WRITTEN_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of WRITTEN_PROMPTS) {
      expect(p.tracks.length).toBeGreaterThan(0);
      for (const t of p.tracks) expect(TRACKS.map((x) => x.id)).toContain(t);
      expect(p.rubric.length).toBeGreaterThanOrEqual(3);
      expect(p.rubric.length).toBeLessThanOrEqual(6);
      expect(p.setting.length).toBeLessThanOrEqual(400);
    }
  });

  it("can deal a full bar and floor test once the written scenarios are approved", () => {
    for (const track of ["bar", "floor"] as const) {
      const sources = trackSources(track);
      const approved = WRITTEN_PROMPTS.filter((p) => p.tracks.includes(track)).map((p) => ({ ...p, reviewed: true }));
      expect(new Set(approved.map((p) => p.concept)).size).toBeGreaterThanOrEqual(6);
      expect(drawTest({ ...sources, written: approved }, seeded(2)).ok).toBe(true);
    }
  });

  it("has well formed kitchen questions, unique by id and concept", () => {
    const ids = KITCHEN_BANK.flatMap((t) => t.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const topic of KITCHEN_BANK) {
      expect(topic.questions.length).toBeGreaterThanOrEqual(6);
      const concepts = topic.questions.map((q) => q.concept);
      expect(new Set(concepts).size).toBe(concepts.length);
      for (const q of topic.questions) {
        expect(q.format).not.toBe("true_false");
        if (q.format === "order_steps") expect(q.steps.length).toBeGreaterThanOrEqual(4);
        else if (q.format !== "number") {
          expect(q.options.map((o) => o.id)).toContain(q.answer);
          expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
        }
      }
    }
  });

  it("can deal a full kitchen test once its questions and scenarios are approved", () => {
    const sources = trackSources("kitchen");
    const bankSources = new Set(KITCHEN_BANK.map((t) => t.source));
    const role = sources.role.map((s) =>
      bankSources.has(s.source) ? { ...s, questions: KITCHEN_BANK.find((t) => t.source === s.source)?.questions.map((q) => ({ ...q, reviewed: true })) ?? [] } : s,
    );
    const written = WRITTEN_PROMPTS.filter((p) => p.tracks.includes("kitchen")).map((p) => ({ ...p, reviewed: true }));
    const result = drawTest({ ...sources, role, order: [...role, ...sources.core], written }, seeded(3));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const roleKeys = result.plan.queue.filter((k) => k.startsWith("role:"));
      expect(roleKeys.filter((k) => k.includes(":kitchen-")).length).toBeGreaterThanOrEqual(4);
      expect(result.plan.queue.filter((k) => k.startsWith("order:")).every((k) => k.includes(":kitchen-") || /^order:(6|11|16|17|18|21|25|29):/.test(k))).toBe(true);
    }
  });
});
