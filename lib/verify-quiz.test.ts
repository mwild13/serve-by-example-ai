import { describe, expect, it } from "vitest";
import { buildQuestionOrder, eliteThreshold, gradeAnswer, questionCount } from "./verify-quiz";
import { VERIFY_QUESTIONS } from "./verify-questions";

describe("buildQuestionOrder", () => {
  it("asks every question once per round, three rounds", () => {
    const order = buildQuestionOrder(8);
    expect(order).toHaveLength(24);
    for (let round = 0; round < 3; round++) {
      expect([...order.slice(round * 8, round * 8 + 8)].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    }
  });

  it("never repeats a question across a round boundary", () => {
    // A random source that always returns 0 makes every round the same
    // shuffle, the worst case for a repeat at the join.
    const order = buildQuestionOrder(8, () => 0);
    for (let i = 1; i < order.length; i++) expect(order[i]).not.toBe(order[i - 1]);
  });

  it("is empty for a module with no questions", () => {
    expect(buildQuestionOrder(0)).toEqual([]);
  });
});

describe("gradeAnswer", () => {
  const moduleId = 1;
  const key = VERIFY_QUESTIONS[moduleId][0].answer;
  const wrong = key === "true" ? "false" : "true";

  it("marks the keyed answer correct and returns the explanation", () => {
    const graded = gradeAnswer(moduleId, 0, key);
    expect(graded).toMatchObject({ correct: true, correctAnswer: key });
    expect(graded?.explanation.length).toBeGreaterThan(0);
  });

  it("marks the other answer wrong", () => {
    expect(gradeAnswer(moduleId, 0, wrong)?.correct).toBe(false);
  });

  it("returns null for a question or module that doesn't exist", () => {
    expect(gradeAnswer(moduleId, questionCount(moduleId), "true")).toBeNull();
    expect(gradeAnswer(9999, 0, "true")).toBeNull();
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
