import { describe, expect, it } from "vitest";
import {
  DRILL_LENGTH,
  advanceDrill,
  drillGoal,
  drillProgress,
  drillQuestionId,
  drillSummary,
  parseDrillQuestionId,
  planDrill,
  type DrillModule,
  type DrillState,
} from "./drill";
import { liveQuestions, type Question } from "./question-bank";

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
  prompt: `Statement ${n}`, answer: "true", explanation: "Because.", reviewed: true,
});

const mc = (id: string, concept: string, difficulty: 1 | 2 | 3 = 2): Question => ({
  id, concept, difficulty, format: "multiple_choice", prompt: `Pick for ${concept}`,
  options: [{ id: "a", text: "A" }, { id: "b", text: "B" }], answer: "b",
  explanation: "Because.", reviewed: true,
});

const real = (...ids: number[]): DrillModule[] => ids.map((moduleId) => ({ moduleId, questions: liveQuestions(moduleId) }));

function moduleOf(id: string): number {
  const parsed = parseDrillQuestionId(id);
  if (!parsed) throw new Error(`bad id ${id}`);
  return parsed.moduleId;
}

describe("drill question ids", () => {
  it("round-trips a module and question id", () => {
    expect(parseDrillQuestionId(drillQuestionId(12, "q3"))).toEqual({ moduleId: 12, questionId: "q3" });
  });

  it("rejects ids without a module", () => {
    expect(parseDrillQuestionId("q3")).toBeNull();
    expect(parseDrillQuestionId(":q3")).toBeNull();
    expect(parseDrillQuestionId("x:q3")).toBeNull();
    expect(parseDrillQuestionId("4:")).toBeNull();
  });
});

describe("planDrill", () => {
  it("needs three modules with questions", () => {
    expect(planDrill(real(1, 2))).toBeNull();
    expect(planDrill([...real(1, 2), { moduleId: 3, questions: [] }])).toBeNull();
  });

  it("mixes at least three modules, never two in a row from one", () => {
    for (let seed = 1; seed <= 25; seed++) {
      const queue = planDrill(real(1, 2, 3, 15, 31), new Set(), seeded(seed));
      expect(queue).not.toBeNull();
      expect(queue).toHaveLength(DRILL_LENGTH);
      const modules = queue!.map(moduleOf);
      expect(new Set(modules).size).toBeGreaterThanOrEqual(3);
      for (let i = 1; i < modules.length; i++) expect(modules[i]).not.toBe(modules[i - 1]);
    }
  });

  it("mixes no more than five modules", () => {
    const queue = planDrill(real(1, 2, 3, 4, 5, 6, 7, 8), new Set(), seeded(3));
    expect(new Set(queue!.map(moduleOf)).size).toBeLessThanOrEqual(5);
  });

  it("asks no question twice and only one per fact in a module", () => {
    const queue = planDrill(real(1, 2, 3), new Set(), seeded(7))!;
    expect(new Set(queue).size).toBe(queue.length);
    const concepts = queue.map((id) => {
      const { moduleId, questionId } = parseDrillQuestionId(id)!;
      return `${moduleId}:${liveQuestions(moduleId).find((q) => q.id === questionId)!.concept}`;
    });
    expect(new Set(concepts).size).toBe(concepts.length);
  });

  it("leaves out True/False when a module has other questions", () => {
    const modules: DrillModule[] = [1, 2, 3].map((moduleId) => ({
      moduleId,
      questions: [tf(0), tf(1), mc("m1", "a"), mc("m2", "b"), mc("m3", "c"), mc("m4", "d")],
    }));
    const queue = planDrill(modules, new Set(), seeded(2))!;
    expect(queue.every((id) => parseDrillQuestionId(id)!.questionId.startsWith("m"))).toBe(true);
  });

  it("uses True/False when a module has nothing else", () => {
    const modules: DrillModule[] = [1, 2, 3].map((moduleId) => ({ moduleId, questions: [tf(0), tf(1), tf(2)] }));
    expect(planDrill(modules, new Set(), seeded(2))).toHaveLength(9);
  });

  it("asks the hardest variant of a fact", () => {
    const modules: DrillModule[] = [1, 2, 3].map((moduleId) => ({
      moduleId,
      questions: [mc("easy", "a", 1), mc("hard", "a", 3)],
    }));
    const queue = planDrill(modules, new Set(), seeded(4))!;
    expect(queue.map((id) => parseDrillQuestionId(id)!.questionId)).toEqual(["hard", "hard", "hard"]);
  });

  it("doesn't repeat a question from the previous drill", () => {
    const modules = real(1, 2, 3, 15, 31);
    for (let seed = 1; seed <= 10; seed++) {
      const first = planDrill(modules, new Set(), seeded(seed))!;
      const second = planDrill(modules, new Set(first), seeded(seed + 100))!;
      expect(second).toHaveLength(DRILL_LENGTH);
      expect(second.filter((id) => first.includes(id))).toEqual([]);
    }
  });

  it("is null when the previous drill used up too many modules, so the caller can retry without it", () => {
    const modules: DrillModule[] = [1, 2, 3].map((moduleId) => ({ moduleId, questions: [mc("only", "a")] }));
    const previous = new Set(modules.map((m) => drillQuestionId(m.moduleId, "only")));
    expect(planDrill(modules, previous)).toBeNull();
    expect(planDrill(modules)).toHaveLength(3);
  });
});

describe("advancing and summing up a drill", () => {
  const state: DrillState = {
    queue: ["1:a", "2:b", "1:c"],
    titles: { "1": "Beer Pouring", "2": "Wine Service" },
    results: [],
  };

  it("asks every question, then finishes", () => {
    const one = advanceDrill(state, 0, 1, true);
    expect(one.status).toBe("active");
    const two = advanceDrill(one.state, 1, 2, false);
    expect(two.status).toBe("active");
    const three = advanceDrill(two.state, 2, 1, false);
    expect(three.status).toBe("finished");
    expect(drillProgress(three.state)).toEqual({ correct: 1, formats: 0, misses: 2, owed: 0 });
    expect(state.results).toEqual([]);
  });

  it("sums up by module, in the order they came up", () => {
    const done: DrillState = {
      ...state,
      results: [
        { module: 1, correct: true },
        { module: 2, correct: false },
        { module: 1, correct: false },
      ],
    };
    expect(drillSummary(done)).toEqual({
      correct: 1,
      total: 3,
      modules: [
        { moduleId: 1, title: "Beer Pouring", correct: 1, total: 2 },
        { moduleId: 2, title: "Wine Service", correct: 0, total: 1 },
      ],
    });
  });

  it("has a goal QuizRun reads as a drill", () => {
    expect(drillGoal(state)).toEqual({ correct: 3, formats: 0, maxMisses: 4, drill: true });
  });
});
