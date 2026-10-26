import { describe, expect, it } from "vitest";
import {
  MIN_ROLE_SOURCES,
  SECTIONS,
  drawTest,
  isTrack,
  itemKey,
  parseItemKey,
  progressAt,
  type QuizSource,
  type TrackSources,
  type WrittenPrompt,
} from "./blueprint";
import type { Question } from "@/lib/question-bank";

/** Repeatable "random" numbers for tests. */
function seeded(seed: number): () => number {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2 ** 31;
    return x / 2 ** 31;
  };
}

const mc = (id: string, difficulty: 1 | 2 | 3 = 2, concept = id): Question => ({
  id, concept, difficulty, format: "multiple_choice", prompt: `Q ${id}`,
  options: [{ id: "a", text: "A" }, { id: "b", text: "B" }], answer: "a", explanation: "Because.", reviewed: true,
});
const tf = (id: string): Question => ({
  id, concept: id, difficulty: 1, format: "true_false", prompt: `S ${id}`, answer: "true", explanation: "Because.", reviewed: true,
});
const order = (id: string): Question => ({
  id, concept: id, difficulty: 2, format: "order_steps", prompt: `Order ${id}`,
  steps: [{ id: "1", text: "One" }, { id: "2", text: "Two" }, { id: "3", text: "Three" }], explanation: "Because.", reviewed: true,
});
const written = (id: string, concept = id): WrittenPrompt => ({
  id, tracks: ["bar"], concept, setting: "A bar.", prompt: "What would you do?", rubric: ["Safety"], redFlags: [], reviewed: true,
});

function source(name: string, n: number, extras: Question[] = []): QuizSource {
  return { source: name, questions: [...Array.from({ length: n }, (_, i) => mc(`${name}q${i}`, ((i % 3) + 1) as 1 | 2 | 3)), ...extras] };
}

function fullSources(): TrackSources {
  const core = Array.from({ length: 10 }, (_, i) => source(`${i + 1}`, 3, [tf(`${i + 1}s`)]));
  const role = [source("31", 3, [order("o31")]), source("33", 3), source("26", 3)];
  return {
    core,
    role,
    order: [...role, ...core.slice(0, 2).map((s) => ({ ...s, questions: [...s.questions, order(`o${s.source}`)] }))],
    written: [written("w1"), written("w2"), written("w3"), written("w4")],
    guests: ["last-schooner", "heavy-hand"],
  };
}

describe("item keys", () => {
  it("round trips every section", () => {
    for (const ref of [
      { section: "core", source: "15", questionId: "mc3" },
      { section: "role", source: "kitchen", questionId: "k1" },
      { section: "order", source: "22", questionId: "o1" },
      { section: "written", promptId: "bar-w1" },
      { section: "guest", guestId: "cold-parmy" },
    ] as const) {
      expect(parseItemKey(itemKey(ref))).toEqual(ref);
    }
  });

  it("rejects malformed keys", () => {
    for (const key of ["", "core", "core:15", "core::x", "quiz:1:a", "written:", "guest:a:b"]) {
      expect(parseItemKey(key)).toBeNull();
    }
  });

  it("knows the tracks", () => {
    expect(isTrack("kitchen")).toBe(true);
    expect(isTrack("chef")).toBe(false);
  });
});

describe("drawTest", () => {
  it("fills every section in order, with no repeats", () => {
    const result = drawTest(fullSources(), seeded(1));
    if (!result.ok) throw new Error("expected a test");
    const { queue } = result.plan;
    expect(queue).toHaveLength(SECTIONS.reduce((n, s) => n + s.count, 0));
    expect(new Set(queue).size).toBe(queue.length);
    const sections = queue.map((k) => parseItemKey(k)?.section);
    expect(sections).toEqual(SECTIONS.flatMap((s) => Array(s.count).fill(s.id)));
  });

  it("covers every core module once before any gets a second question", () => {
    const result = drawTest(fullSources(), seeded(2));
    if (!result.ok) throw new Error("expected a test");
    const coreSources = result.plan.queue.filter((k) => k.startsWith("core:")).map((k) => k.split(":")[1]);
    expect(new Set(coreSources).size).toBe(10);
  });

  it("never asks True/False or an ordering task in a quiz", () => {
    const result = drawTest(fullSources(), seeded(3));
    if (!result.ok) throw new Error("expected a test");
    const quizIds = result.plan.queue.filter((k) => /^(core|role):/.test(k)).map((k) => k.split(":")[2]);
    expect(quizIds.some((id) => id.endsWith("s") || id.startsWith("o"))).toBe(false);
  });

  it("puts easier questions first within a quiz", () => {
    const sources = fullSources();
    const byId = new Map(sources.core.flatMap((s) => s.questions).map((q) => [q.id, q.difficulty]));
    const result = drawTest(sources, seeded(4));
    if (!result.ok) throw new Error("expected a test");
    const difficulties = result.plan.queue.filter((k) => k.startsWith("core:")).map((k) => byId.get(k.split(":")[2]) ?? 0);
    expect([...difficulties].sort((a, b) => a - b)).toEqual(difficulties);
  });

  it("takes an ordering task from the role first, then from a different source", () => {
    const result = drawTest(fullSources(), seeded(5));
    if (!result.ok) throw new Error("expected a test");
    const orders = result.plan.queue.filter((k) => k.startsWith("order:"));
    expect(orders[0]).toBe("order:31:o31");
    expect(orders[1].split(":")[1]).not.toBe("31");
  });

  it("never puts two written prompts on one concept in a test", () => {
    const sources = { ...fullSources(), written: [written("a", "x"), written("b", "x"), written("c", "y"), written("d", "z")] };
    for (let seed = 1; seed <= 20; seed++) {
      const result = drawTest(sources, seeded(seed));
      if (!result.ok) throw new Error("expected a test");
      const picked = result.plan.queue.filter((k) => k.startsWith("written:"));
      expect(picked.filter((k) => k === "written:a" || k === "written:b").length).toBeLessThanOrEqual(1);
    }
  });

  it("skips unreviewed written prompts", () => {
    const sources = { ...fullSources(), written: [written("w1"), written("w2"), { ...written("w3"), reviewed: false }] };
    const result = drawTest(sources, seeded(6));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.shortfall).toContainEqual({ section: "written", have: 2, need: 3 });
  });

  it("says which sections are short", () => {
    const result = drawTest({ ...fullSources(), written: [], guests: [] }, seeded(7));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.shortfall.map((s) => s.section).sort()).toEqual(["guest", "written"]);
    }
  });

  it(`needs ${MIN_ROLE_SOURCES} role sources even when one has enough questions`, () => {
    const result = drawTest({ ...fullSources(), role: [source("kitchen", 20)] }, seeded(8));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.shortfall.map((s) => s.section)).toContain("role");
  });

  it("deals different tests to different applicants", () => {
    const a = drawTest(fullSources(), seeded(9));
    const b = drawTest(fullSources(), seeded(10));
    if (!a.ok || !b.ok) throw new Error("expected tests");
    expect(a.plan.queue).not.toEqual(b.plan.queue);
  });
});

describe("progressAt", () => {
  it("names the section and the item within it", () => {
    const result = drawTest(fullSources(), seeded(11));
    if (!result.ok) throw new Error("expected a test");
    const { queue } = result.plan;
    expect(progressAt(queue, 0)).toMatchObject({ section: "core", sectionNumber: 1, sectionCount: 5, itemNumber: 1, itemsInSection: 10 });
    expect(progressAt(queue, 11)).toMatchObject({ section: "role", sectionNumber: 2, itemNumber: 2, itemsInSection: 8 });
    expect(progressAt(queue, queue.length - 1)).toMatchObject({ section: "guest", sectionNumber: 5, itemNumber: 1 });
    expect(progressAt(queue, queue.length)).toBeNull();
  });
});
