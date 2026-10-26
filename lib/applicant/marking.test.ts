import { describe, expect, it } from "vitest";
import { parseMark, scoreFromMarks } from "./marking";
import { parseSummary, resultsBlock } from "./summary";

describe("parseMark", () => {
  it("clamps marks, keeps only real guide points, and caps the lines", () => {
    const mark = parseMark(
      { process: 9, guestCare: 0, safety: "4", judgement: 3.6, covered: [1, 3, 3, 0, 7, "2", "x"], strengths: "Clear steps — good.", gaps: "x".repeat(400), followUp: 42 },
      4,
    );
    expect(mark.marks).toEqual({ process: 5, guestCare: 1, safety: 4, judgement: 4 });
    // The model counts from 1: 1, 2 and 3 are guide points 0, 1 and 2; 0 and 7 aren't points.
    expect(mark.covered).toEqual([0, 1, 2]);
    expect(mark.strengths).toBe("Clear steps, good.");
    expect(mark.gaps.length).toBeLessThanOrEqual(220);
    expect(mark.followUp).toBe("");
  });

  it("treats a reply with nothing usable as the lowest marks", () => {
    expect(parseMark({}, 5)).toEqual({ marks: { process: 1, guestCare: 1, safety: 1, judgement: 1 }, covered: [], strengths: "", gaps: "", followUp: "" });
  });
});

describe("scoreFromMarks", () => {
  it("runs from 0 for all ones to 100 for all fives", () => {
    expect(scoreFromMarks({ process: 1, guestCare: 1, safety: 1, judgement: 1 })).toBe(0);
    expect(scoreFromMarks({ process: 5, guestCare: 5, safety: 5, judgement: 5 })).toBe(100);
    expect(scoreFromMarks({ process: 4, guestCare: 3, safety: 4, judgement: 3 })).toBe(63);
  });
});

describe("summary", () => {
  it("keeps three of each, capped and dash free", () => {
    const summary = parseSummary({
      strengths: ["One", "Two — three", "Three", "Four"],
      explore: "not a list",
      questions: ["Tell me about a time you refused service.", 7, ""],
    });
    expect(summary.strengths).toEqual(["One", "Two, three", "Three"]);
    expect(summary.explore).toEqual([]);
    expect(summary.questions).toEqual(["Tell me about a time you refused service."]);
  });

  it("gives the model the results and nothing about how answers were produced", () => {
    const block = resultsBlock({
      trackLabel: "Bar",
      sections: [{ label: "Hospitality basics", score: 80 }, { label: "What would you do?", score: null }],
      written: [{ scenario: "A guest is drunk.", answer: "I would stop serving him.", strengths: "Refused clearly.", gaps: "" }],
      missed: ["What temperature should a cool room be?"],
    });
    expect(block).toContain("Role: Bar");
    expect(block).toContain("Hospitality basics: 80 out of 100");
    expect(block).toContain("What would you do?: not scored");
    expect(block).toContain("I would stop serving him.");
    expect(block).toContain("Marker said it missed: nothing noted");
    expect(block).toContain("- What temperature should a cool room be?");
    expect(block).not.toMatch(/paste|seconds|away/i);
  });
});
