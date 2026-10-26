import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Staff-facing copy never uses em or en dashes (AGENTS.md, section 1). This
// reads every staff screen and every piece of teaching content and fails on a
// dash outside a comment. Fix the sentence; don't add an exception.

const ROOTS = [
  "app/dashboard",
  "app/mobile",
  "components/quiz",
  "components/live-guest",
  "components/rush",
  "components/team",
  "lib/questions",
  "lib/learn-cards",
  "lib/live-guest",
  "lib/rush",
  "lib/applicant",
  "lib/knowledge-base.ts",
  "lib/cocktails.ts",
  "lib/verify-questions.ts",
  "lib/module-navigator.ts",
  "lib/challenges.ts",
  "lib/challenge-content.ts",
  "components/challenges",
  "lib/badges.ts",
  "lib/next-step.ts",
];

const DASH = /[–—]/;

function files(path: string): string[] {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name)));
}

/** Drops comments, keeping line numbers. Strings with "//" in them (URLs) are kept. */
function codeLines(source: string): string[] {
  let inBlock = false;
  return source.split("\n").map((line) => {
    let code = line;
    if (inBlock) {
      const end = code.indexOf("*/");
      if (end === -1) return "";
      inBlock = false;
      code = code.slice(end + 2);
    }
    code = code.replace(/\/\*.*?\*\//g, "").replace(/\{\s*\/\*.*?\*\/\s*\}/g, "");
    const open = code.indexOf("/*");
    if (open !== -1) {
      inBlock = true;
      code = code.slice(0, open);
    }
    const trimmed = code.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return "";
    const lineComment = code.search(/(?<![:"'`\\])\/\//);
    return lineComment === -1 ? code : code.slice(0, lineComment);
  });
}

describe("staff copy has no em or en dashes", () => {
  const sources = ROOTS.flatMap(files).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes(".test."));

  it("finds the files it checks", () => {
    expect(sources.length).toBeGreaterThan(50);
  });

  it("has none outside comments", () => {
    const found = sources.flatMap((file) =>
      codeLines(readFileSync(file, "utf8"))
        .map((code, i) => (DASH.test(code) ? `${file}:${i + 1}` : null))
        .filter((hit): hit is string => hit !== null),
    );
    expect(found).toEqual([]);
  });
});
