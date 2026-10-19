/**
 * scripts/question-review.mjs
 *
 * Writes the owner's review sheet for quiz questions straight from the code,
 * so what is reviewed is exactly what goes live. Lists every question that
 * is still a draft (`reviewed: false`) in the given modules.
 *
 * Usage:
 *   node scripts/question-review.mjs <out.md> "<title>" <moduleId> [moduleId...]
 *   node scripts/question-review.mjs "docs/Rich Update/batch-1-bartending-a.md" "Batch 1: Bartending, part A" 1 2 3 4 5 6 7
 */
import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [out, title, ...ids] = process.argv.slice(2);
if (!out || !title || ids.length === 0) {
  console.error('Usage: node scripts/question-review.mjs <out.md> "<title>" <moduleId> [moduleId...]');
  process.exit(1);
}

// Bundle the bank with server-only stubbed out, then load it.
const dir = mkdtempSync(join(tmpdir(), "sbe-questions-"));
const bundle = join(dir, "bank.mjs");
await build({
  stdin: {
    contents: 'export { moduleQuestions } from "./lib/question-bank";',
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundle,
  logLevel: "error",
  alias: { "@": process.cwd() },
  plugins: [{
    name: "server-only",
    setup(b) {
      b.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only", namespace: "stub" }));
      b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "", loader: "js" }));
    },
  }],
});
const { moduleQuestions } = await import(pathToFileURL(bundle).href);
rmSync(dir, { recursive: true, force: true });

const MODULE_TITLES = {
  1: "Beer Pouring", 2: "Wine Service", 3: "Cocktail Fundamentals", 4: "Barista Basics", 5: "Tray Carrying",
  6: "Sanitation Basics", 7: "Bar-Back Efficiency", 8: "The Greeting", 9: "Table Dynamics", 10: "Anticipatory Service",
  11: "Guest Complaints", 12: "Suggestive Selling", 13: "VIP Management", 14: "Phone Etiquette", 15: "RSA Compliance",
  16: "Food Safety", 17: "Conflict De-escalation", 18: "Evacuation Protocols", 19: "Opening & Closing", 20: "Inventory Control",
  21: "Call Behind", 22: "Ice Well Burn", 23: "The Swivel Head", 24: "Ice Is Food", 25: "Allergy Shield",
  26: "Soda Gun Speed", 27: "Two-Handed Flow", 28: "Mid-Shift Reset", 29: "Docket Reading", 30: "Beating the Weed",
  31: "Jigger Precision", 32: "Wine Opener Mastery", 33: "Cellar & Kegs", 34: "Tray & Glass Grip", 35: "The Clean Close",
  36: "Two-Minute Check", 37: "The Out-of-Stock Pivot", 38: "Clearing Dead Soldiers", 39: "Bar-Back Synergy", 40: "Natural Upselling",
};
const FORMAT = {
  best_line: "Pick the best line", multiple_choice: "Choose one", order_steps: "Put in order",
  spot_mistake: "Spot the mistake", number: "A number", which_glass: "Pick the glass",
};

let total = 0;
const sections = [];
for (const id of ids.map(Number)) {
  const all = moduleQuestions(id);
  const statements = Object.fromEntries(all.filter((q) => q.format === "true_false").map((q) => [q.concept, q.prompt]));
  const drafts = all.filter((q) => !q.reviewed);
  const live = all.filter((q) => q.reviewed).length;
  total += drafts.length;
  const lines = [`## ${id}. ${MODULE_TITLES[id] ?? `Module ${id}`}`, "", `${drafts.length} new, ${live + drafts.length} in the module once approved.`, ""];
  for (const q of drafts) {
    lines.push(`### ${q.id}. ${FORMAT[q.format] ?? q.format}`);
    lines.push(`*From: "${statements[q.concept] ?? q.concept}"*`, "");
    lines.push(q.prompt, "");
    if (q.format === "number") {
      lines.push(`**Answer: ${q.answer} ${q.unit}**${q.tolerance ? `, give or take ${q.tolerance}` : ", exact"}.`);
    } else if (q.format === "order_steps") {
      q.steps.forEach((s, i) => lines.push(`${i + 1}. ${s.text}`));
    } else {
      for (const o of q.options) lines.push(o.id === q.answer ? `- **${o.text} (right)**` : `- ${o.text}`);
    }
    lines.push("", `Explanation: ${q.explanation}`, "");
  }
  sections.push(lines.join("\n"));
}

const head = `# ${title}

${total} questions in the new formats, all drafts. They are in the code (\`lib/questions/\`) but switched off until you approve them. Generated from the code by \`scripts/question-review.mjs\`, so this is exactly what staff will see.

Every question is written only from the module's existing True/False statements (shown under each one), so it adds no new facts. The places to look hardest are the wrong options and the "best line" wording, which are new.

For each one, say approve, change (and how), or drop. "All approved" is fine too. The right answer is marked **(right)**. Options are shuffled for staff, and steps are shown shuffled.

`;
writeFileSync(out, head + sections.join("\n") + "\n");
console.log(`Wrote ${total} draft questions to ${out}`);
