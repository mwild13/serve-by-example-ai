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
 *   npm run applicant:review -- --bank kitchen "docs/Applicant Testing/kitchen-bank-batch-3.md" "Kitchen questions, batch 3"
 * With no tracks, every track is listed; --unreviewed lists only prompts not yet approved.
 * --bank writes the sheet for a role question bank (lib/applicant/questions/<track>.ts) instead.
 */
import { build } from "esbuild";
import { writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const bankTrack = args[0] === "--bank" ? args[1] : null;
if (bankTrack) args.splice(0, 2);
const unreviewedOnly = args[0] === "--unreviewed";
const [out, title, ...tracks] = unreviewedOnly ? args.slice(1) : args;
if (!out || !title) {
  console.error('Usage: node scripts/applicant-review.mjs [--unreviewed] <out.md> "<title>" [track...]');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "sbe-applicant-"));
const bundle = join(dir, "written.mjs");
await build({
  stdin: {
    contents: [
      'export { WRITTEN_PROMPTS } from "./lib/applicant/questions/written";',
      'export { KITCHEN_BANK } from "./lib/applicant/questions/kitchen";',
      'export { MANAGEMENT_BANK } from "./lib/applicant/questions/management";',
    ].join("\n"),
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
const { WRITTEN_PROMPTS, KITCHEN_BANK, MANAGEMENT_BANK } = await import(pathToFileURL(bundle).href);
rmSync(dir, { recursive: true, force: true });

if (bankTrack) {
  const bank = { kitchen: KITCHEN_BANK, management: MANAGEMENT_BANK }[bankTrack];
  if (!bank) {
    console.error(`No question bank for "${bankTrack}". Use kitchen or management.`);
    process.exit(1);
  }
  const FORMAT = { best_line: "Pick the best line", multiple_choice: "Choose one", order_steps: "Put in order", spot_mistake: "Spot the mistake", number: "A number" };
  let count = 0;
  const parts = bank.map((topic) => {
    const qs = topic.questions.filter((q) => !unreviewedOnly || !q.reviewed);
    count += qs.length;
    const lines = [`## ${topic.title}`, "", `${qs.length} questions.`, ""];
    for (const q of qs) {
      lines.push(`### ${q.id}. ${FORMAT[q.format] ?? q.format}${q.reviewed ? "" : " (not live yet)"}`, "", q.prompt, "");
      if (q.format === "number") lines.push(`**Answer: ${q.answer} ${q.unit}**${q.tolerance ? `, give or take ${q.tolerance}` : ", exact"}.`);
      else if (q.format === "order_steps") q.steps.forEach((st, i) => lines.push(`${i + 1}. ${st.text}`));
      else for (const o of q.options) lines.push(o.id === q.answer ? `- **${o.text} (right)**` : `- ${o.text}`);
      lines.push("", `Explanation: ${q.explanation}`, "");
    }
    return lines.join("\n");
  });
  const head = [
    `# ${title}`,
    "",
    `${count} questions for the ${bankTrack} role quiz in applicant tests, in ${bank.length} topics. An applicant gets 8 role questions, dealt across these topics and the matching training modules, easier ones first.`,
    "",
    "Unlike the staff module questions, these bring in facts of their own, so check each fact as well as the wording. Food safety facts follow the Food Standards Code and FSANZ guidance. The right answer is marked **(right)**; options and steps are shuffled for applicants.",
    "",
    "For each one, say approve, change (and how), or drop. \"All approved\" is fine too.",
    "",
  ].join("\n");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${head}\n${parts.join("\n")}`);
  console.log(`Wrote ${count} questions to ${out}`);
  process.exit(0);
}

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
