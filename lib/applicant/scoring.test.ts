import { describe, expect, it } from "vitest";
import { bandFor, orderScore, overallScore, scoreQuizItem, sectionScores } from "./scoring";
import type { Question } from "@/lib/question-bank";

const steps = ["a", "b", "c", "d", "e"];

describe("orderScore", () => {
  it("gives 100 for the right order and 0 for the reverse", () => {
    expect(orderScore(steps, ["a", "b", "c", "d", "e"])).toBe(100);
    expect(orderScore(steps, ["e", "d", "c", "b", "a"])).toBe(0);
  });

  it("costs little for swapping two neighbours", () => {
    expect(orderScore(steps, ["b", "a", "c", "d", "e"])).toBe(83);
  });

  it("scores 0 for anything that isn't the full set of steps", () => {
    expect(orderScore(steps, ["a", "b", "c", "d"])).toBe(0);
    expect(orderScore(steps, ["a", "a", "c", "d", "e"])).toBe(0);
    expect(orderScore(steps, ["a", "b", "c", "d", "x"])).toBe(0);
    expect(orderScore(steps, "a,b,c,d,e")).toBe(0);
  });
});

describe("scoreQuizItem", () => {
  const choice: Question = {
    id: "q1", concept: "q1", difficulty: 1, format: "multiple_choice", prompt: "?",
    options: [{ id: "a", text: "A" }, { id: "b", text: "B" }], answer: "b", explanation: ".", reviewed: true,
  };
  const ordering: Question = {
    id: "o1", concept: "o1", difficulty: 1, format: "order_steps", prompt: "?",
    steps: steps.map((id) => ({ id, text: id })), explanation: ".", reviewed: true,
  };

  it("marks a choice right or wrong", () => {
    expect(scoreQuizItem(choice, "b")).toEqual({ score: 100, correct: true });
    expect(scoreQuizItem(choice, "a")).toEqual({ score: 0, correct: false });
  });

  it("gives part marks for an ordering task", () => {
    expect(scoreQuizItem(ordering, ["b", "a", "c", "d", "e"])).toEqual({ score: 83, correct: false });
  });
});

describe("section and overall scores", () => {
  it("averages each section and leaves out what isn't scored", () => {
    const sections = sectionScores([
      { section: "core", score: 100 },
      { section: "core", score: 0 },
      { section: "written", score: 70 },
      { section: "written", score: null },
    ]);
    expect(sections).toEqual({ core: 50, role: null, order: null, written: 70, guest: null });
  });

  it("weighs sections, renormalised over the ones scored", () => {
    // core 25 and written 30: (50 * 25 + 70 * 30) / 55
    expect(overallScore({ core: 50, role: null, order: null, written: 70, guest: null })).toBe(61);
    expect(overallScore({ core: null, role: null, order: null, written: null, guest: null })).toBeNull();
  });

  it("bands the score", () => {
    expect(bandFor(80)).toBe("Strong");
    expect(bandFor(79)).toBe("Solid");
    expect(bandFor(65)).toBe("Solid");
    expect(bandFor(50)).toBe("Developing");
    expect(bandFor(49)).toBe("Not yet");
  });
});
