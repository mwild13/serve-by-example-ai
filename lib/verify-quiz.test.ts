import { describe, expect, it } from "vitest";
import {
  MAX_MISSES,
  PASS_CORRECT,
  advanceRun,
  answerFits,
  eliteThreshold,
  goalFor,
  gradeAnswer,
  TEST_OUT_CORRECT,
  planRun,
  planTestOut,
  questionView,
  type RunState,
} from "./verify-quiz";
import { isLive, liveQuestions, moduleQuestions, type ChoiceQuestion, type NumberQuestion, type Question } from "./question-bank";
import { VERIFY_QUESTIONS } from "./verify-questions";
import { knowsArea } from "./diagnostic-engine";

/** Repeatable "random" numbers for tests. */
function seeded(seed: number): () => number {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2 ** 31;
    return x / 2 ** 31;
  };
}

const tf = (n: number): Question => ({
  id: `s${n}`, concept: `s${n}`, difficulty: 1, format: "true_false",
  prompt: `Statement ${n}`, answer: n % 2 === 0 ? "true" : "false", explanation: "Because.", reviewed: true,
});

const mc = (id: string, concept: string, difficulty: 1 | 2 | 3 = 2): ChoiceQuestion => ({
  id, concept, difficulty, format: "multiple_choice", prompt: `Pick for ${concept}`,
  options: [{ id: "a", text: "A" }, { id: "b", text: "B" }, { id: "c", text: "C" }], answer: "b",
  explanation: "Because.", reviewed: true,
});

const num = (id: string, concept: string): NumberQuestion => ({
  id, concept, difficulty: 3, format: "number", prompt: "How many ml?", unit: "ml",
  answer: 425, tolerance: 0, explanation: "Because.", reviewed: true,
});

const order = (id: string, concept: string): Question => ({
  id, concept, difficulty: 3, format: "order_steps", prompt: "Order these",
  steps: [{ id: "a", text: "First" }, { id: "b", text: "Second" }, { id: "c", text: "Third" }],
  explanation: "Because.", reviewed: true,
});

/** Eight statements plus variants in three other formats. */
const mixedBank: Question[] = [
  ...Array.from({ length: 8 }, (_, i) => tf(i)),
  mc("q1", "s0"), mc("q2", "s1"), num("q3", "s2"), order("q4", "s3"), mc("q5", "s4"),
];

function byId(bank: Question[], id: string): Question {
  const q = bank.find((c) => c.id === id);
  if (!q) throw new Error(`no question ${id}`);
  return q;
}

/** Answers every question right or wrong per `pattern` until the run ends. */
function play(bank: Question[], state: RunState, pattern: (position: number, q: Question) => boolean) {
  let current = state;
  for (let position = 0; position < 100; position++) {
    const q = byId(bank, current.queue[position]);
    const result = advanceRun(current, position, q, pattern(position, q), bank);
    current = result.state;
    if (result.status !== "active") return { state: current, status: result.status, asked: position + 1 };
  }
  throw new Error("run never ended");
}

describe("the question bank", () => {
  it("keeps every module's True/False statements live", () => {
    for (const [moduleId, statements] of Object.entries(VERIFY_QUESTIONS)) {
      const live = liveQuestions(Number(moduleId)).filter((q) => q.format === "true_false");
      expect(live).toHaveLength(statements.length);
    }
  });

  it("has unique question ids within each module", () => {
    for (const moduleId of Object.keys(VERIFY_QUESTIONS).map(Number)) {
      const ids = moduleQuestions(moduleId).map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("links every extra question to a real statement and a valid answer", () => {
    for (const moduleId of Object.keys(VERIFY_QUESTIONS).map(Number)) {
      const questions = moduleQuestions(moduleId);
      const concepts = new Set(questions.filter((q) => q.format === "true_false").map((q) => q.concept));
      for (const q of questions.filter((c) => c.format !== "true_false")) {
        expect(concepts.has(q.concept), `${moduleId}/${q.id}`).toBe(true);
        if ("options" in q) expect(q.options.some((o) => o.id === q.answer), `${moduleId}/${q.id}`).toBe(true);
        if (q.format === "order_steps") expect(q.steps.length).toBeGreaterThan(2);
      }
    }
  });

  it("gives every module at least three live question types to pass with", () => {
    for (const moduleId of Object.keys(VERIFY_QUESTIONS).map(Number)) {
      const formats = new Set(liveQuestions(moduleId).map((q) => q.format));
      expect(formats.size, `module ${moduleId}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("never asks an unreviewed or picture question", () => {
    expect(isLive({ ...tf(0), reviewed: false })).toBe(false);
    expect(isLive({ ...mc("p", "s0"), format: "which_glass" })).toBe(false);
    expect(isLive({ ...mc("p", "s0"), image: "a schooner, 1 cm short" })).toBe(false);
    expect(isLive({ ...mc("p", "s0"), image: "a schooner, 1 cm short" }, true)).toBe(true);
  });
});

describe("goalFor", () => {
  it("asks for six right across three formats when the bank has them", () => {
    expect(goalFor(mixedBank)).toEqual({ correct: 6, formats: 3, maxMisses: MAX_MISSES });
  });

  it("asks for one format when a module only has True/False so far", () => {
    expect(goalFor(Array.from({ length: 8 }, (_, i) => tf(i)))).toEqual({ correct: 6, formats: 1, maxMisses: MAX_MISSES });
  });

  it("needs at least five different facts", () => {
    expect(goalFor(Array.from({ length: 4 }, (_, i) => tf(i)))).toBeNull();
  });
});

describe("planRun", () => {
  it("asks each fact once, with easier questions first", () => {
    for (let seed = 1; seed < 30; seed++) {
      const run = planRun(mixedBank, seeded(seed));
      expect(run).not.toBeNull();
      const questions = run!.queue.map((id) => byId(mixedBank, id));
      const concepts = questions.map((q) => q.concept);
      expect(new Set(concepts).size).toBe(concepts.length);
      expect(concepts).toHaveLength(8);
      const difficulties = questions.map((q) => q.difficulty);
      expect([...difficulties].sort()).toEqual(difficulties);
    }
  });

  it("always includes enough formats to pass", () => {
    for (let seed = 1; seed < 30; seed++) {
      const run = planRun(mixedBank, seeded(seed))!;
      const formats = new Set(run.queue.map((id) => byId(mixedBank, id).format));
      expect(formats.size).toBeGreaterThanOrEqual(run.goal.formats);
    }
  });

  it("varies the questions between runs", () => {
    const runs = new Set(Array.from({ length: 10 }, (_, i) => planRun(mixedBank, seeded(i + 1))!.queue.join(",")));
    expect(runs.size).toBeGreaterThan(1);
  });

  it("works for every real module", () => {
    for (const moduleId of Object.keys(VERIFY_QUESTIONS).map(Number)) {
      expect(planRun(liveQuestions(moduleId)), `module ${moduleId}`).not.toBeNull();
    }
  });
});

describe("advanceRun", () => {
  it("passes once six are right across three formats", () => {
    for (let seed = 1; seed < 30; seed++) {
      const result = play(mixedBank, planRun(mixedBank, seeded(seed))!, () => true);
      expect(result.status).toBe("passed");
      expect(result.state.correct).toBeGreaterThanOrEqual(PASS_CORRECT);
      expect(result.state.formats.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("brings a missed fact back in another format, two questions later", () => {
    const state: RunState = {
      queue: ["s0", "s5", "s6", "s7", "s1"], correct: 0, misses: 0, formats: [], owed: [],
      goal: { correct: 6, formats: 3, maxMisses: 3 },
    };
    const { state: next, status } = advanceRun(state, 0, byId(mixedBank, "s0"), false, mixedBank);
    expect(status).toBe("active");
    expect(next.queue).toEqual(["s0", "s5", "s6", "q1", "s7", "s1"]);
    expect(next.owed).toEqual(["s0"]);
    // Answering the variant right clears the debt.
    const cleared = advanceRun(next, 3, byId(mixedBank, "q1"), true, mixedBank).state;
    expect(cleared.owed).toEqual([]);
  });

  it("doesn't pass while a missed fact is still owed", () => {
    const state: RunState = {
      queue: ["s1", "q1", "s2"], correct: 5, misses: 1, formats: ["true_false", "number", "order_steps"], owed: ["s0"],
      goal: { correct: 6, formats: 3, maxMisses: 3 },
    };
    expect(advanceRun(state, 0, byId(mixedBank, "s1"), true, mixedBank).status).toBe("active");
  });

  it("doesn't requeue a fact with no other form", () => {
    const bank = Array.from({ length: 8 }, (_, i) => tf(i));
    const state = planRun(bank, seeded(3))!;
    const { state: next } = advanceRun(state, 0, byId(bank, state.queue[0]), false, bank);
    expect(next.queue).toEqual(state.queue);
    expect(next.owed).toEqual([]);
    expect(next.misses).toBe(1);
  });

  it("ends the run on the third miss", () => {
    const result = play(mixedBank, planRun(mixedBank, seeded(5))!, () => false);
    expect(result.status).toBe("exhausted");
    expect(result.state.misses).toBe(MAX_MISSES);
    expect(result.asked).toBe(MAX_MISSES);
  });

  it("passes a True/False-only module on six right", () => {
    const bank = Array.from({ length: 8 }, (_, i) => tf(i));
    const result = play(bank, planRun(bank, seeded(9))!, (position) => position !== 1);
    expect(result.status).toBe("passed");
    expect(result.asked).toBe(7);
  });

  it("ends as exhausted when the questions run out", () => {
    const state: RunState = {
      queue: ["s0", "s1"], correct: 4, misses: 0, formats: ["true_false"], owed: [],
      goal: { correct: 6, formats: 1, maxMisses: 3 },
    };
    expect(advanceRun(state, 1, byId(mixedBank, "s1"), true, mixedBank).status).toBe("exhausted");
  });
});

describe("answers", () => {
  it("grades each format", () => {
    expect(gradeAnswer(tf(0), "true").correct).toBe(true);
    expect(gradeAnswer(tf(0), "false")).toMatchObject({ correct: false, correctAnswer: "true" });
    expect(gradeAnswer(mc("q", "s0"), "b").correct).toBe(true);
    expect(gradeAnswer(mc("q", "s0"), "a").correct).toBe(false);
    expect(gradeAnswer(num("q", "s0"), 425).correct).toBe(true);
    expect(gradeAnswer(num("q", "s0"), 420).correct).toBe(false);
    expect(gradeAnswer({ ...num("q", "s0"), answer: 1.5 }, 1.5).correct).toBe(true);
    expect(gradeAnswer(order("q", "s0"), ["a", "b", "c"]).correct).toBe(true);
    expect(gradeAnswer(order("q", "s0"), ["b", "a", "c"])).toMatchObject({ correct: false, correctAnswer: ["a", "b", "c"] });
  });

  it("refuses answers of the wrong shape", () => {
    expect(answerFits(tf(0), "b")).toBe(false);
    expect(answerFits(mc("q", "s0"), "z")).toBe(false);
    expect(answerFits(mc("q", "s0"), 2)).toBe(false);
    expect(answerFits(num("q", "s0"), "425")).toBe(false);
    expect(answerFits(order("q", "s0"), ["a", "a", "c"])).toBe(false);
    expect(answerFits(order("q", "s0"), ["a", "b"])).toBe(false);
    expect(answerFits(order("q", "s0"), ["c", "a", "b"])).toBe(true);
  });

  it("never shows the answer to the browser", () => {
    for (const q of [tf(0), mc("q", "s0"), num("q", "s0"), order("q", "s0")]) {
      const view = questionView(q, 0, seeded(1)) as Record<string, unknown>;
      expect(view).not.toHaveProperty("answer");
      expect(view).not.toHaveProperty("explanation");
      expect(view).not.toHaveProperty("tolerance");
    }
  });

  it("never shows steps already in the right order", () => {
    for (let seed = 1; seed < 50; seed++) {
      const view = questionView(order("q", "s0"), 0, seeded(seed));
      expect(view.steps?.map((s) => s.id)).not.toEqual(["a", "b", "c"]);
    }
  });
});

describe("eliteThreshold", () => {
  it("is 80% of modules, rounded up, like the badge", () => {
    expect(eliteThreshold(40)).toBe(32);
    expect(eliteThreshold(41)).toBe(33);
  });

  it("never drops below one module", () => {
    expect(eliteThreshold(0)).toBe(1);
  });
});

describe("test-out", () => {
  /** Eight statements plus ten harder questions on different facts. */
  const testOutBank: Question[] = [
    ...Array.from({ length: 8 }, (_, i) => tf(i)),
    mc("q1", "s0", 3), mc("q2", "s1", 1), num("q3", "s2"), order("q4", "s3"), mc("q5", "s4", 2),
    mc("q6", "s5", 2), mc("q7", "s6", 1), mc("q8", "s7", 2), num("q9", "s0"), order("q10", "s1"),
  ];

  it("plans a test-out for every module, with no True/False", () => {
    for (const moduleId of Object.keys(VERIFY_QUESTIONS).map(Number)) {
      const bank = liveQuestions(moduleId);
      const run = planTestOut(bank, seeded(moduleId));
      expect(run, `module ${moduleId}`).not.toBeNull();
      const asked = run!.queue.map((id) => byId(bank, id));
      expect(asked.some((q) => q.format === "true_false"), `module ${moduleId}`).toBe(false);
      expect(asked.length, `module ${moduleId}`).toBeGreaterThan(TEST_OUT_CORRECT);
      expect(asked.length, `module ${moduleId}`).toBeLessThanOrEqual(8);
      expect(new Set(asked.map((q) => q.format)).size, `module ${moduleId}`).toBeGreaterThanOrEqual(run!.goal.formats);
      expect(run!.goal.testOut).toBe(true);
    }
  });

  it("asks the hardest questions first", () => {
    const run = planTestOut(testOutBank, seeded(3))!;
    const levels = run.queue.map((id) => byId(testOutBank, id).difficulty);
    expect([...levels].sort((a, b) => b - a)).toEqual(levels);
  });

  it("passes on six right with one miss, and brings nothing back", () => {
    const start = planTestOut(testOutBank, seeded(5))!;
    const result = play(testOutBank, start, (position) => position !== 0);
    expect(result.status).toBe("passed");
    expect(result.asked).toBe(7);
    expect(result.state.owed).toEqual([]);
    expect(result.state.queue).toEqual(start.queue);
  });

  it("ends on the second miss", () => {
    const start = planTestOut(testOutBank, seeded(7))!;
    const result = play(testOutBank, start, (position) => position > 1);
    expect(result.status).toBe("exhausted");
    expect(result.asked).toBe(2);
  });

  it("refuses a module without enough harder questions", () => {
    const thin = [...Array.from({ length: 8 }, (_, i) => tf(i)), mc("q1", "s0"), mc("q2", "s1")];
    expect(planTestOut(thin)).toBeNull();
  });
});

describe("starting difficulty from the skill check", () => {
  it("puts harder questions first when the person knows the area", () => {
    const run = planRun(mixedBank, seeded(11), { hardFirst: true })!;
    const levels = run.queue.map((id) => byId(mixedBank, id).difficulty);
    expect([...levels].sort((a, b) => b - a)).toEqual(levels);
  });

  it("counts only full marks in the module's own category", () => {
    expect(knowsArea({ technical: 100, service: 50 }, 1)).toBe(true);
    expect(knowsArea({ technical: 100, service: 50 }, 8)).toBe(false);
    expect(knowsArea({ compliance: 100 }, 35)).toBe(true);
    expect(knowsArea({ technical: 1500 }, 1)).toBe(false);
    expect(knowsArea(null, 1)).toBe(false);
  });
});
