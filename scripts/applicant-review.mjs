/**
 * scripts/applicant-review.mjs
 *
 * Writes the owner's review sheet for applicant test written scenarios
 * straight from the code (lib/applicant/questions/written.ts), so what is
 * reviewed is what applicants get.
 *
 * Usage:
 *   node scripts/applicant-review.mjs <out.md> "<title>" [track...]
 *   npm run applicant:review -- "docs/Applicant Testing/written-batch-1.md" "Written scenarios, batch 1: bar and floor" bar floor
 *   node scripts/applicant-review.mjs --unreviewed <out.md> "<title>"
 * With no tracks, every track is listed; --unreviewed lists only prompts not yet approved.
 */
import { build } from "esbuild";
import { writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const unreviewedOnly = args[0] === "--unreviewed";
const [out, title, ...tracks] = unreviewedOnly ? args.slice(1) : args;
if (!out || !title) {
  console.error('Usage: node scripts/applicant-review.mjs [--unreviewed] <out.md> "<title>" [track...]');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "sbe-applicant-"));
const bundle = join(dir, "written.mjs");
await build({
  stdin: { contents: 'export { WRITTEN_PROMPTS } from "./lib/applicant/questions/written";', resolveDir: process.cwd(), loader: "ts" },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  logLevel: "error",
  alias: { "@": process.cwd() },
});
const { WRITTEN_PROMPTS } = await import(pathToFileURL(bundle).href);
rmSync(dir, { recursive: true, force: true });

const LABEL = { bar: "Bar", floor: "Floor and front of house", kitchen: "Kitchen", management: "Management" };
const picked = WRITTEN_PROMPTS
  .filter((p) => tracks.length === 0 || p.tracks.some((t) => tracks.includes(t)))
  .filter((p) => !unreviewedOnly || !p.reviewed);

const sections = picked.map((p, i) => [
  `## ${i + 1}. ${p.tracks.map((t) => LABEL[t] ?? t).join(", ")}: ${p.concept.replace(/-/g, " ")}`,
  "",
  `*Id: \`${p.id}\`.${p.reviewed ? " Live." : " Not live yet."}*`,
  "",
  "**The applicant sees:**",
  "",
  `> ${p.setting}`,
  ">",
  `> **${p.prompt}**`,
  "",
  "**A strong answer covers** (the AI marker ticks these off; any reasonable approach that meets the point counts):",
  "",
  ...p.rubric.map((r, n) => `${n + 1}. ${r}`),
  "",
  "**Red flags** (cap the safety or judgement mark at 2 out of 5):",
  "",
  ...(p.redFlags.length ? p.redFlags.map((f) => `- ${f}`) : ["- None"]),
  "",
].join("\n"));

const head = [
  `# ${title}`,
  "",
  `${picked.length} scenarios. Each applicant gets four from their track, never two on the same topic. They answer in their own words, with no time limit.`,
  "",
  "The AI marks each answer from 1 to 5 on four things: process (sensible steps in a sensible order), guest care, safety (including the law), and judgement (when to involve a manager, staying within their authority). That becomes a score out of 100. It is told never to mark down spelling, grammar or English as a second language, and that length earns nothing.",
  "",
  "The manager sees the answer in full, which points it covered, a line on what was strong and what was missing, and a question to ask in the interview.",
  "",
  "**To approve one,** say so and it gets `reviewed: true`. To change one, mark up the wording here.",
  "",
].join("\n");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${head}\n${sections.join("\n")}`);
console.log(`Wrote ${picked.length} scenarios to ${out}`);
