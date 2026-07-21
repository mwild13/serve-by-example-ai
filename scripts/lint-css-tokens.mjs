/**
 * scripts/lint-css-tokens.mjs
 *
 * Scans app/globals.css for raw hex colour values that appear OUTSIDE any
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

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CSS_FILE = resolve("app/globals.css");
const HEX_RE = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;

let css;
try {
  css = readFileSync(CSS_FILE, "utf8");
} catch {
  console.error(`lint-css-tokens: cannot read ${CSS_FILE}`);
  process.exit(1);
}

// Remove all :root { } blocks — raw hex is allowed there (token definitions).
const withoutRoot = css.replace(/:root\s*\{[^}]*\}/gs, "/* :root REMOVED */");

const lines = withoutRoot.split("\n");
const violations = [];

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
  violations.push({ line: i + 1, content: line.trim() });
}

const PREVIEW_LIMIT = 20;

if (violations.length === 0) {
  console.log("✓  globals.css — no raw hex values outside token-definition contexts.");
} else {
  console.log(
    `\nglobals.css — ${violations.length} raw hex value(s) found outside token-definition contexts.\n` +
    `   These should be replaced with var(--token) references from app/globals.css.\n`
  );
  violations.slice(0, PREVIEW_LIMIT).forEach(({ line, content }) => {
    console.log(`  ${String(line).padStart(5)}: ${content.slice(0, 120)}`);
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
