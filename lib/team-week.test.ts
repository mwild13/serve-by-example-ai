import { describe, expect, it } from "vitest";
import { addDays, correctAnswerText, isGoalKind, mostMissed, oneLine, suggestedTargets, sydneyMidnight, weekStartOf, type AnswerRow } from "./team-week";
import { weekLabel } from "./team-week-shared";
import type { Question } from "./question-bank";

describe("weeks", () => {
  it("start on the Monday", () => {
    expect(weekStartOf("2026-10-19")).toBe("2026-10-19"); // Monday
    expect(weekStartOf("2026-10-25")).toBe("2026-10-19"); // Sunday
    expect(weekStartOf("2026-10-21")).toBe("2026-10-19");
    expect(weekStartOf("2026-11-02")).toBe("2026-11-02");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(weekLabel("2026-10-19")).toBe("Week of 19 October");
  });

  it("start at midnight in Sydney, summer and winter", () => {
    expect(sydneyMidnight("2026-10-19")).toBe("2026-10-18T13:00:00.000Z"); // AEDT, +11
    expect(sydneyMidnight("2026-06-15")).toBe("2026-06-14T14:00:00.000Z"); // AEST, +10
  });
});

describe("goals", () => {
  it("suggest a round target from the team's size", () => {
    expect(suggestedTargets(9)).toEqual({ correct_answers: 180, training_days: 25, live_guest_passes: 9, rush_shifts: 20 });
    expect(suggestedTargets(0).live_guest_passes).toBe(1);
    expect(isGoalKind("correct_answers")).toBe(true);
    expect(isGoalKind("hugs")).toBe(false);
  });
});

describe("the briefing card", () => {
  const row = (user: string, q: string, correct = false): AnswerRow => ({ user_id: user, module_id: 1, question_id: q, correct });

  it("only shows a question two or more people missed, most people first", () => {
    const rows = [
      row("a", "q1"), row("a", "q1"), row("a", "q1"), // one person, three times: never shown
      row("a", "q2"), row("b", "q2"),
      row("a", "q3"), row("b", "q3"), row("c", "q3"),
      row("d", "q3", true),
      row("b", "q4"), row("c", "q4"), row("c", "q4"),
    ];
    const top = mostMissed(rows);
    expect(top.map((t) => t.questionId)).toEqual(["q3", "q4", "q2"]);
    expect(top[0]).toMatchObject({ people: 3, misses: 3 });
    expect(top.find((t) => t.questionId === "q1")).toBeUndefined();
  });

  it("puts the right answer in words", () => {
    const base = { id: "x", concept: "c", difficulty: 1 as const, explanation: "Because.", reviewed: true, prompt: "?" };
    expect(correctAnswerText({ ...base, format: "true_false", answer: "false" } as Question)).toBe("False");
    expect(correctAnswerText({ ...base, format: "number", answer: 30, unit: "ml", tolerance: 0 } as Question)).toBe("30 ml");
    expect(
      correctAnswerText({ ...base, format: "multiple_choice", answer: "b", options: [{ id: "a", text: "No" }, { id: "b", text: "Yes" }] } as Question),
    ).toBe("Yes");
    expect(
      correctAnswerText({ ...base, format: "order_steps", steps: [{ id: "1", text: "Chill" }, { id: "2", text: "Shake" }] } as Question),
    ).toBe("Chill, then Shake");
  });

  it("says one line: the first sentence of the explanation", () => {
    expect(oneLine("A schooner is 425 ml. A pot is 285 ml.")).toBe("A schooner is 425 ml.");
    expect(oneLine("No full stop here")).toBe("No full stop here");
    expect(oneLine("x".repeat(400)).length).toBeLessThanOrEqual(220);
  });
});
