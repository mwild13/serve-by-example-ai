import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AU_WRITING_RULES, capText, plainDashes } from "./ai-guard";
import { GUEST_SYSTEM_PROMPT } from "./live-guest/engine";

describe("plainDashes", () => {
  it("turns a dash between numbers into 'to'", () => {
    expect(plainDashes("Keep it between 5–60°C")).toBe("Keep it between 5 to 60°C");
    expect(plainDashes("Pages 2—4")).toBe("Pages 2 to 4");
  });

  it("turns any other em or en dash into a comma", () => {
    expect(plainDashes("Sorry mate — I'll pour you a fresh one.")).toBe("Sorry mate, I'll pour you a fresh one.");
    expect(plainDashes("Fresh glass–cold tap")).toBe("Fresh glass, cold tap");
  });

  it("doesn't leave stray commas", () => {
    expect(plainDashes("Right — .")).toBe("Right.");
    expect(plainDashes("— Start here")).toBe("Start here");
    expect(plainDashes("Ends here —")).toBe("Ends here");
  });

  it("leaves hyphens alone", () => {
    expect(plainDashes("A well-poured, ice-cold schooner")).toBe("A well-poured, ice-cold schooner");
  });

  it("runs on every capped model field", () => {
    expect(capText("Nice work — keep it up", 300)).toBe("Nice work, keep it up");
  });
});

describe("writing rules", () => {
  it("bans em and en dashes and asks for Australian English", () => {
    expect(AU_WRITING_RULES).toContain("Australian English, never American English");
    expect(AU_WRITING_RULES).toContain("Never use an em dash or an en dash");
    expect(AU_WRITING_RULES).not.toMatch(/[–—]/);
  });

  it("is in every prompt that writes a reply people read", () => {
    expect(GUEST_SYSTEM_PROMPT).toContain(AU_WRITING_RULES);
    for (const file of [
      "app/api/arena/evaluate/route.ts",
      "app/api/coach/route.ts",
      "app/api/management/coach/route.ts",
      "lib/scenario-evaluator.ts",
    ]) {
      expect(readFileSync(file, "utf8"), file).toContain("${AU_WRITING_RULES}");
    }
  });
});
