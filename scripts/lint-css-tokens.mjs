/**
 * scripts/lint-css-tokens.mjs
 *
 * Scans the stylesheets (app/globals.css and app/styles/*.css) for raw hex colour values that appear OUTSIDE any
 * token-definition context (i.e. places where var(--token) should be used).
 *
 * Legitimate hex contexts — skipped automatically:
 *   1. :root { } blocks              — that is where tokens are defined
 *   2. --variable: value lines       — scoped token definitions (e.g. .mcc-shell, dark mode)
 *   3. var(--token, #fallback)       — hex already appears inside a var() call
 *
 * Usage:
 *   node scripts/lint-css-tokens.mjs          # informational report
 *   npm run lint:css
 *
 * Enforcement mode:
 *   Currently exits 0 (informational only). Once the baseline reaches 0:
 *     1. Change `process.exit(0)` → `process.exit(violations.length > 0 ? 1 : 0)`
 *     2. Add `lint:css` to your CI pipeline
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The shared file, then one file per surface (see "Stylesheets" in CLAUDE.md).
const CSS_FILES = ["app/globals.css", ...readdirSync("app/styles").filter((f) => f.endsWith(".css")).sort().map((f) => join("app/styles", f))];
const HEX_RE = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;

const violations = [];

for (const file of CSS_FILES) {
  let css;
  try {
    css = readFileSync(file, "utf8");
  } catch {
    console.error(`lint-css-tokens: cannot read ${file}`);
    process.exit(1);
  }

  // Blank out all :root { } blocks — raw hex is allowed there (token definitions).
  // Blanked, not removed, so the line numbers below stay true.
  const withoutRoot = css.replace(/:root\s*\{[^}]*\}/gs, (block) => block.replace(/[^\n]/g, " "));
  const lines = withoutRoot.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip CSS custom property definitions: --var-name: value
    // This covers :root overrides, dark-mode selectors, and scoped theme blocks
    // (.mcc-overview-shell, .sbe-mkt-scope, @media prefers-color-scheme, etc.)
    if (/^\s*--[\w-]+\s*:/.test(line)) continue;

    // Skip lines where the hex appears only as a var() fallback: var(--token, #hex)
    // Strip all var(…) calls and re-test for a bare hex; if none remains, skip.
    const stripped = line.replace(/var\([^)]+\)/g, "");
    HEX_RE.lastIndex = 0;
    if (!HEX_RE.test(stripped)) continue;

    // Real violation: bare hex in a rule value
    violations.push({ file, line: i + 1, content: line.trim() });
  }
}

const PREVIEW_LIMIT = 20;

if (violations.length === 0) {
  console.log(`✓  ${CSS_FILES.length} stylesheets — no raw hex values outside token-definition contexts.`);
} else {
  console.log(
    `\n${violations.length} raw hex value(s) found outside token-definition contexts.\n` +
    `   These should be replaced with var(--token) references to the tokens in app/globals.css.\n`
  );
  violations.slice(0, PREVIEW_LIMIT).forEach(({ file, line, content }) => {
    console.log(`  ${file}:${line}: ${content.slice(0, 120)}`);
  });
  if (violations.length > PREVIEW_LIMIT) {
    console.log(`  ... and ${violations.length - PREVIEW_LIMIT} more\n`);
  }
  console.log(
    `\n  Next step: replace remaining hex values with var(--token). When the count reaches 0,\n` +
    `  flip the exit code at the bottom of this script to enforce in CI.\n`
  );
}

// Enforced: fails CI when any bare hex remains outside token-definition contexts.
process.exit(violations.length > 0 ? 1 : 0);
