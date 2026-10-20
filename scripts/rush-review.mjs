/**
 * scripts/rush-review.mjs
 *
 * Writes the owner's review sheet for the Saturday Rush moments straight
 * from the code (lib/rush/moments.ts), so what is reviewed is what plays.
 * Each moment is shown once, with one example of its drinks and numbers.
 *
 * Usage: npm run rush:review
 */
import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const out = "docs/Rich Update/saturday-rush-moments.md";
const dir = mkdtempSync(join(tmpdir(), "sbe-rush-"));
const bundle = join(dir, "rush.mjs");
await build({
  stdin: {
    contents: 'export { MOMENTS } from "./lib/rush/moments"; export { playRush } from "./lib/rush/engine"; export { seededRng } from "./lib/rush/random";',
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  logLevel: "error",
  alias: { "@": process.cwd() },
});
const { MOMENTS, playRush, seededRng } = await import(pathToFileURL(bundle).href);
rmSync(dir, { recursive: true, force: true });

const VERDICT = { best: "Best", ok: "Fair", poor: "Costly", breach: "Breach (caps the score at 40)" };
const effect = (e) =>
  Object.entries(e)
    .map(([k, v]) => (k === "restock" ? `restocks ${v.join(" and ")}` : k === "serve" ? `serves ${v}` : k === "waste" ? `$${v} wasted` : k === "extra" ? `+$${v} sale` : `${k} ${v > 0 ? "+" : ""}${v}`))
    .join(", ");

const lines = [
  "# Saturday Rush: the moments",
  "",
  `${MOMENTS.length} moments. A shift is 12 of them, picked at random (with at least two about safety), from 9:30pm to 11:30pm. The drinks, numbers and the order of the choices change every run; each moment below shows one example. Built from \`lib/rush/moments.ts\` with \`npm run rush:review\`.`,
  "",
  "Check: is the best call what a good Australian bartender would do, is anything marked wrong that a good venue would accept, and does each why read right? The numbers after each choice are what it does to the dials (0 to 100).",
  "",
];
for (const t of MOMENTS) {
  const s = { ...playRush(1, []).state, queue: 6, ice: 30, glasses: 30 };
  const made = t.make(seededRng(7), s);
  const when = t.forced ? "Comes up when it happens (forced)" : t.when ? "Comes up only in some states" : "Can come up any time";
  lines.push(`## ${t.id} (${t.kind})`, "", `${when}.`, "", `**Situation:** ${made.situation}`, "");
  for (const c of made.choices) lines.push(`- **${VERDICT[c.verdict]}:** ${c.text} _(${effect(c.effect)})_`);
  lines.push("", `**Why:** ${made.why}`, "");
}
writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out}`);
