import { describe, expect, it } from "vitest";
import { answerFlags, formatDuration, readSignals, summaryLine, type AnswerSignals } from "./integrity";

const typed = (over: Partial<AnswerSignals> = {}): AnswerSignals => ({
  elapsedMs: 90_000, activeMs: 90_000, awayMs: 0, awayCount: 0, pasteCount: 0,
  pastedChars: 0, typingMs: 60_000, answerChars: 300, ...over,
});

describe("readSignals", () => {
  it("never lets the browser claim more time than the server saw", () => {
    const s = readSignals({ activeMs: 999_999, awayMs: 20_000, typingMs: 999_999 }, 30_000, 100);
    expect(s.awayMs).toBe(20_000);
    expect(s.activeMs).toBe(10_000);
    expect(s.typingMs).toBe(30_000);
  });

  it("treats junk as zero", () => {
    expect(readSignals({ pasteCount: "lots", pastedChars: -5, awayCount: NaN }, 5_000, 10)).toMatchObject({
      pasteCount: 0, pastedChars: 0, awayCount: 0,
    });
    expect(readSignals(null, 5_000, 10)).toMatchObject({ elapsedMs: 5_000, answerChars: 10 });
  });
});

describe("formatDuration", () => {
  it("reads like a person wrote it", () => {
    expect(formatDuration(1_000)).toBe("1 second");
    expect(formatDuration(45_000)).toBe("45 seconds");
    expect(formatDuration(240_000)).toBe("4 minutes");
    expect(formatDuration(65 * 60_000)).toBe("1 hour 5 minutes");
    expect(formatDuration(120 * 60_000)).toBe("2 hours");
  });
});

describe("answerFlags", () => {
  it("says nothing about an ordinary typed answer", () => {
    expect(answerFlags("written", typed())).toEqual([]);
  });

  it("notes a quick answer, with a lower bar for a choice", () => {
    expect(answerFlags("choice", typed({ elapsedMs: 1_000 }))).toEqual([{ kind: "quick", text: "Answered in 1 second" }]);
    expect(answerFlags("choice", typed({ elapsedMs: 3_000 }))).toEqual([]);
    expect(answerFlags("written", typed({ elapsedMs: 3_000 })).map((f) => f.kind)).toContain("quick");
  });

  it("notes a large paste into a written answer", () => {
    expect(answerFlags("written", typed({ pasteCount: 1, pastedChars: 410 }))).toEqual([{ kind: "paste", text: "Pasted 410 characters" }]);
    expect(answerFlags("written", typed({ pasteCount: 1, pastedChars: 20 }))).toEqual([]);
  });

  it("notes time away, or leaving often", () => {
    expect(answerFlags("written", typed({ awayMs: 240_000, awayCount: 1 }))).toEqual([{ kind: "away", text: "Away from the page for 4 minutes" }]);
    expect(answerFlags("choice", typed({ awayMs: 5_000, awayCount: 4 }))).toEqual([{ kind: "away", text: "Left the page 4 times" }]);
  });

  it("notes a long answer that arrived faster than anyone types", () => {
    expect(answerFlags("written", typed({ answerChars: 600, typingMs: 20_000 }))).toEqual([
      { kind: "typing", text: "600 characters appeared in 20 seconds of typing" },
    ]);
    expect(answerFlags("written", typed({ answerChars: 100, typingMs: 1_000 }))).toEqual([]);
  });
});

describe("summaryLine", () => {
  it("sums up a clean test", () => {
    const summary = summaryLine([{ kind: "written", signals: typed() }, { kind: "choice", signals: typed({ elapsedMs: 10_000 }) }]);
    expect(summary).toEqual({ line: "Answers typed, no large pastes, stayed on the page, no rushed answers.", flagCount: 0, totalMs: 100_000 });
  });

  it("counts answers, not events", () => {
    const summary = summaryLine([
      { kind: "written", signals: typed({ pastedChars: 400 }) },
      { kind: "written", signals: typed({ awayMs: 120_000 }) },
      { kind: "choice", signals: typed({ elapsedMs: 500 }) },
    ]);
    expect(summary.line).toBe("1 answer pasted or not typed, left the page during 1 answer, 1 very quick answer.");
    expect(summary.flagCount).toBe(3);
  });
});
