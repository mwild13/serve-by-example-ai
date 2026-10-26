import { describe, expect, it } from "vitest";
import { computeReport, effectiveStatus, reportItems, resolveItem, type AnswerRow } from "./service";
import { liveQuestions } from "@/lib/question-bank";

const served = "2026-10-26T10:00:00.000Z";
const at = (seconds: number) => new Date(Date.parse(served) + seconds * 1000).toISOString();

function answer(over: Partial<AnswerRow>): AnswerRow {
  return {
    position: 0, item_key: "core:15:x", section: "core", answer: "a", correct: true, score: 100, evaluation: null,
    served_at: served, answered_at: at(20), active_ms: 20_000, away_ms: 0, away_count: 0,
    paste_count: 0, pasted_chars: 0, typing_ms: 0, answer_chars: 0, ...over,
  };
}

describe("effectiveStatus", () => {
  it("expires an open test past its date, and leaves a closed one as it is", () => {
    const past = "2020-01-01T00:00:00Z";
    expect(effectiveStatus({ status: "invited", expires_at: past })).toBe("expired");
    expect(effectiveStatus({ status: "started", expires_at: past })).toBe("expired");
    expect(effectiveStatus({ status: "submitted", expires_at: past })).toBe("submitted");
    expect(effectiveStatus({ status: "invited", expires_at: "2999-01-01T00:00:00Z" })).toBe("invited");
  });
});

describe("resolveItem", () => {
  it("finds a live module question and refuses unknown keys", () => {
    const question = liveQuestions(15).find((q) => q.format === "multiple_choice");
    if (!question) throw new Error("module 15 has a multiple choice question");
    expect(resolveItem(`core:15:${question.id}`)).toMatchObject({ kind: "choice", section: "core" });
    expect(resolveItem("guest:cold-parmy")).toBeNull();
    expect(resolveItem("core:15:no-such-question")).toBeNull();
    expect(resolveItem("written:no-such-prompt")).toBeNull();
    expect(resolveItem("nonsense")).toBeNull();
  });
});

describe("computeReport", () => {
  it("scores what's scored and counts what's still to be marked", () => {
    const report = computeReport([
      answer({ position: 0, score: 100 }),
      answer({ position: 1, score: 0, correct: false }),
      answer({ position: 2, section: "written", item_key: "written:w1", answer: { text: "I would..." }, score: null, correct: null, answer_chars: 300, typing_ms: 60_000, answered_at: at(90) }),
    ]);
    expect(report.sections.core).toBe(50);
    expect(report.sections.written).toBeNull();
    expect(report.overall).toBe(50);
    expect(report.band).toBe("Developing");
    expect(report.pendingScores).toBe(1);
    expect(report.signals.flagCount).toBe(0);
    expect(report.signals.totalMs).toBe(130_000);
  });

  it("carries the signals into the summary", () => {
    const report = computeReport([
      answer({ section: "written", item_key: "written:w1", score: null, pasted_chars: 400, paste_count: 1, answer_chars: 400 }),
    ]);
    expect(report.signals.line).toContain("1 answer pasted or not typed");
  });
});

describe("reportItems", () => {
  it("shows the manager the question, the answer given and the right one, as text", () => {
    const question = liveQuestions(15).find((q) => q.format === "multiple_choice");
    if (!question || question.format !== "multiple_choice") throw new Error("module 15 has a multiple choice question");
    const wrong = question.options.find((o) => o.id !== question.answer);
    if (!wrong) throw new Error("a wrong option");
    const [item] = reportItems([answer({ item_key: `core:15:${question.id}`, answer: wrong.id, correct: false, score: 0, answered_at: at(1) })]);
    expect(item.prompt).toBe(question.prompt);
    expect(item.given).toEqual([wrong.text]);
    expect(item.rightAnswer).toEqual([question.options.find((o) => o.id === question.answer)?.text]);
    expect(item.flags).toEqual([{ kind: "quick", text: "Answered in 1 second" }]);
  });
});
