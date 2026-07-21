/**
 * scripts/lint-css-tokens.mjs
 *
 * Scans app/globals.css for raw hex colour values that appear OUTSIDE the
 * :root {} design-token declaration block(s).
 *
 * Raw hex inside :root is correct — that IS the token definition.
 * Raw hex elsewhere should be replaced with var(--token-name).
 *
 * Usage:
 *   node scripts/lint-css-tokens.mjs          # informational report
 *   npm run lint:css
 *
 * Enforcement mode:
 *   Currently exits 0 (informational only) while a full globals.css audit
 *   is pending (Phase 5). Once the baseline reaches 0:
 *     1. Change `process.exit(0)` at the bottom to `process.exit(violations.length > 0 ? 1 : 0)`
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
// Handles multiple :root blocks and standard property declarations.
const withoutRoot = css.replace(/:root\s*\{[^}]*\}/gs, "/* :root REMOVED */");

const lines = withoutRoot.split("\n");
const violations = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  HEX_RE.lastIndex = 0;
  if (HEX_RE.test(line)) {
    violations.push({ line: i + 1, content: line.trim() });
  }
}

const PREVIEW_LIMIT = 20;

if (violations.length === 0) {
  console.log("✓  globals.css — no raw hex values outside :root blocks.");
} else {
  console.log(
    `\nglobals.css — ${violations.length} raw hex value(s) found outside :root blocks.\n` +
    `   These should be moved into :root as named tokens, then referenced via var(--token).\n`
  );
  violations.slice(0, PREVIEW_LIMIT).forEach(({ line, content }) => {
    console.log(`  ${String(line).padStart(5)}: ${content.slice(0, 120)}`);
  });
  if (violations.length > PREVIEW_LIMIT) {
    console.log(`  ... and ${violations.length - PREVIEW_LIMIT} more (run with --all to see everything)\n`);
  }
  console.log(
    `\n  Next step: audit these ${violations.length} violations, move their values into :root\n` +
    `  as named tokens, then replace usages with var(--token). When the count reaches 0,\n` +
    `  flip the exit code at the bottom of this script to enforce in CI.\n`
  );
}

// ENFORCEMENT: change to `process.exit(violations.length > 0 ? 1 : 0)` after Phase 5 cleanup
process.exit(0);
