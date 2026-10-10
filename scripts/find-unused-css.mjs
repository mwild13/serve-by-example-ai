/**
 * scripts/find-unused-css.mjs
 *
 * Finds class selectors in app/globals.css that no source file can produce,
 * and optionally deletes them.
 *
 * A class counts as USED when any of these is true:
 *   1. Its name appears as a whole token anywhere in app, components, lib or
 *      content (so a class in a string, a ternary or a classList call counts).
 *   2. It starts with a prefix the source builds at run time, e.g.
 *      `badge-${tier}` or "stage-" + n keeps every .badge-* and .stage-* class.
 *   3. It ends with a suffix the source builds at run time, e.g. `${base}--on`.
 *   4. It matches KEEP below (classes set by libraries, not by our code).
 *
 * A selector is removed only when it REQUIRES an unused class. Selectors that
 * mention one inside :not(), :is(), :where() or :has() are left alone. A rule
 * goes when all of its selectors go; an at-rule goes when it is left empty;
 * a @keyframes goes when nothing animates with it any more.
 *
 * Usage:
 *   node scripts/find-unused-css.mjs                 # report only
 *   node scripts/find-unused-css.mjs --list          # report plus every unused class
 *   node scripts/find-unused-css.mjs --write         # delete from app/globals.css
 *   node scripts/find-unused-css.mjs --write --prefix=ops   # only classes named ops-* / ops
 *
 * After --write: npm run lint:css, npx next build, and look at the pages.
 * This cannot see inside a signed-in page, so read the diff.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import postcss from "postcss";

const CSS_FILE = resolve("app/globals.css");
const SOURCE_DIRS = ["app", "components", "lib", "content"];
const SOURCE_EXT = /\.(tsx?|mts|mjs|jsx?|mdx?|json|html)$/;
// Classes our code never writes but the page still gets.
const KEEP = [/^recharts-/, /^__/, /^grecaptcha/, /^StripeElement/];

const args = process.argv.slice(2);
const write = args.includes("--write");
const list = args.includes("--list");
const prefixArg = args.find((a) => a.startsWith("--prefix="))?.split("=")[1];

function readSources(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) readSources(path, out);
    else if (SOURCE_EXT.test(entry.name) && path !== "app/globals.css") out.push(readFileSync(path, "utf8"));
  }
}

const sources = [];
for (const dir of SOURCE_DIRS) readSources(dir, sources);
const source = sources.join("\n");

const tokens = new Set(source.match(/[A-Za-z0-9_-]+/g));

// Prefixes and suffixes assembled at run time: `foo-${x}`, "foo-" + x,
// `${x}-foo`, x + "-foo".
const dynamicPrefixes = new Set();
const dynamicSuffixes = new Set();
// A prefix needs a dash or underscore somewhere, so `mcc-tab${x}` counts and a
// bare word before an interpolation (`px${n}`) does not.
const PREFIX_OK = /[-_]/;
for (const m of source.matchAll(/([A-Za-z][A-Za-z0-9_-]*)\$\{/g)) if (PREFIX_OK.test(m[1])) dynamicPrefixes.add(m[1]);
for (const m of source.matchAll(/([A-Za-z][A-Za-z0-9_-]*)["'`]\s*\+/g)) if (PREFIX_OK.test(m[1])) dynamicPrefixes.add(m[1]);
for (const m of source.matchAll(/\}([-_][A-Za-z0-9_-]+)/g)) dynamicSuffixes.add(m[1]);
for (const m of source.matchAll(/\+\s*["'`]([-_][A-Za-z0-9_-]+)/g)) dynamicSuffixes.add(m[1]);

function isUsed(name) {
  if (tokens.has(name)) return true;
  if (KEEP.some((re) => re.test(name))) return true;
  for (const prefix of dynamicPrefixes) if (name.startsWith(prefix)) return true;
  for (const suffix of dynamicSuffixes) if (name.endsWith(suffix)) return true;
  return false;
}

const CLASS_RE = /\.(-?[_a-zA-Z][\w-]*)/g;
// Strip strings and attribute selectors so `[href$=".pdf"]` is not read as a class.
const stripNonClass = (selector) => selector.replace(/\[[^\]]*\]/g, "").replace(/(["']).*?\1/g, "");

const css = readFileSync(CSS_FILE, "utf8");
const root = postcss.parse(css, { from: CSS_FILE });

const allClasses = new Set();
root.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
  for (const m of stripNonClass(rule.selector).matchAll(CLASS_RE)) allClasses.add(m[1]);
});

const inScope = (name) => !prefixArg || name === prefixArg || name.startsWith(`${prefixArg}-`) || name.startsWith(`${prefixArg}_`);
const unused = new Set([...allClasses].filter((name) => !isUsed(name) && inScope(name)));

function selectorIsDead(selector) {
  const clean = stripNonClass(selector);
  const dead = [...clean.matchAll(CLASS_RE)].some((m) => unused.has(m[1]));
  if (!dead) return false;
  // A dead class inside a functional pseudo-class does not make the selector unmatchable.
  if (/:(not|is|where|has)\(/.test(clean)) return false;
  return true;
}

let removedRules = 0;
let trimmedRules = 0;
const orphanComments = new Set();

root.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
  const alive = rule.selectors.filter((selector) => !selectorIsDead(selector));
  if (alive.length === rule.selectors.length) return;
  if (alive.length === 0) {
    const prev = rule.prev();
    if (prev?.type === "comment") orphanComments.add(prev);
    rule.remove();
    removedRules++;
  } else {
    rule.selectors = alive;
    trimmedRules++;
  }
});

// Empty @media / @supports / @container / @layer blocks.
let removedAtRules = 0;
let changed = true;
while (changed) {
  changed = false;
  root.walkAtRules((atRule) => {
    if (atRule.nodes && atRule.nodes.every((node) => node.type === "comment") && !/keyframes$|font-face/.test(atRule.name)) {
      const prev = atRule.prev();
      if (prev?.type === "comment") orphanComments.add(prev);
      atRule.remove();
      removedAtRules++;
      changed = true;
    }
  });
}

// A comment that introduced a removed rule, with nothing left under it.
let removedComments = 0;
changed = true;
while (changed) {
  changed = false;
  for (const comment of orphanComments) {
    if (!comment.parent) continue;
    const next = comment.next();
    if (!next || next.type === "comment") {
      const prev = comment.prev();
      if (prev?.type === "comment") orphanComments.add(prev);
      orphanComments.delete(comment);
      comment.remove();
      removedComments++;
      changed = true;
    }
  }
}

// @keyframes nothing refers to any more.
const animationText = [];
root.walkDecls(/^animation(-name)?$/, (decl) => animationText.push(decl.value));
const animationUse = `${animationText.join(" ")} ${source}`;
let removedKeyframes = 0;
if (!prefixArg) {
  root.walkAtRules(/keyframes$/, (atRule) => {
    const name = atRule.params.trim();
    if (!new RegExp(`(^|[^\\w-])${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}($|[^\\w-])`).test(animationUse)) {
      atRule.remove();
      removedKeyframes++;
    }
  });
}

const output = root.toString().replace(/\n{4,}/g, "\n\n\n");
const beforeLines = css.split("\n").length;
const afterLines = output.split("\n").length;

const byPrefix = {};
for (const name of unused) {
  const prefix = name.split(/[-_]/)[0];
  byPrefix[prefix] = (byPrefix[prefix] ?? 0) + 1;
}

console.log(`Classes in globals.css:     ${allClasses.size}`);
console.log(`Unused${prefixArg ? ` (${prefixArg}-*)` : ""}:                     ${unused.size}`);
console.log(`Rules removed / trimmed:    ${removedRules} / ${trimmedRules}`);
console.log(`Empty at-rules removed:     ${removedAtRules}`);
console.log(`Keyframes removed:          ${removedKeyframes}`);
console.log(`Comments removed:           ${removedComments}`);
console.log(`Lines:                      ${beforeLines} -> ${afterLines}`);
console.log(`Bytes:                      ${css.length} -> ${output.length}`);
console.log(
  `By prefix: ${Object.entries(byPrefix)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([prefix, count]) => `${prefix} ${count}`)
    .join(", ")}`
);
if (list) console.log([...unused].sort().join("\n"));

if (write) {
  writeFileSync(CSS_FILE, output);
  console.log(`\nWrote ${CSS_FILE}`);
} else {
  console.log("\nReport only. Pass --write to delete.");
}
