import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The owner's rule (2026-10-20): no hospitality slang or shorthand in
// anything staff learn from. If the owner wouldn't know a term, a new staff
// member won't either. Write "sold out" or "off", "very busy", plain words.
// Trade names staff will hear on shift (bar-back, speed rail, the pass,
// fobbing, M/R and G/F on a docket) are taught and explained, so they stay.
const SLANG = /\b86\b|86'd|86ed|\bslammed\b|\bin the weeds\b|69'd/i;

const FILES = [
  ...readdirSync("lib/questions").map((f) => join("lib/questions", f)),
  ...readdirSync("lib/learn-cards").map((f) => join("lib/learn-cards", f)),
  "lib/verify-questions.ts",
  "lib/module-navigator.ts",
  "lib/live-guest/guests.ts",
  "lib/rush/moments.ts",
  "lib/rush/engine.ts",
  "lib/venue-content-shared.ts",
  "lib/knowledge-base.ts",
  "lib/cocktails.ts",
].filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

describe("learning content", () => {
  it("uses plain words, not bar slang", () => {
    for (const file of FILES) {
      // Ids stay stable, so they're not checked (for example "in-the-weeds").
      const lines = readFileSync(file, "utf8").split("\n").filter((line) => !/^\s*id: "/.test(line));
      for (const line of lines) expect(line, file).not.toMatch(SLANG);
    }
  });
});
