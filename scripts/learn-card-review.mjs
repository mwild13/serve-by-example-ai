/**
 * scripts/learn-card-review.mjs
 *
 * Writes the owner's review sheet for Learn cards straight from the code, so
 * what is reviewed is exactly what goes live. Lists every card that is still
 * a draft (`reviewed: false`) in the given modules, with the statements each
 * card teaches.
 *
 * Usage:
 *   node scripts/learn-card-review.mjs <out.md> "<title>" <moduleId> [moduleId...]
 *   node scripts/learn-card-review.mjs "docs/Rich Update/cards-batch-1-bartending-a.md" "Cards batch 1: Bartending, part A" 1 2 3 4 5 6 7
 */
import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [out, title, ...ids] = process.argv.slice(2);
if (!out || !title || ids.length === 0) {
  console.error('Usage: node scripts/learn-card-review.mjs <out.md> "<title>" <moduleId> [moduleId...]');
  process.exit(1);
}

// Bundle the cards and the statements with server-only stubbed out, then load them.
const dir = mkdtempSync(join(tmpdir(), "sbe-cards-"));
const bundle = join(dir, "cards.mjs");
await build({
  stdin: {
    contents: 'export { LEARN_CARD_LOADERS } from "./lib/learn-cards"; export { VERIFY_QUESTIONS } from "./lib/verify-questions";',
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
const { LEARN_CARD_LOADERS, VERIFY_QUESTIONS } = await import(pathToFileURL(bundle).href);
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

let total = 0;
const sections = [];
for (const id of ids.map(Number)) {
  const load = LEARN_CARD_LOADERS[id];
  const drafts = load ? (await load()).filter((c) => !c.reviewed) : [];
  const statements = VERIFY_QUESTIONS[id] ?? [];
  total += drafts.length;
  const lines = [`## ${id}. ${MODULE_TITLES[id] ?? `Module ${id}`}`, "", `${drafts.length} cards.`, ""];
  for (const card of drafts) {
    lines.push(`### ${card.id}. ${card.title}`, "");
    lines.push(card.rule, "");
    lines.push(`*Why it matters:* ${card.why}`, "");
    const from = card.concepts.map((c) => {
      const s = statements[Number(c.slice(1))];
      return s ? `"${s.prompt}" (${s.answer})` : c;
    });
    lines.push(`From: ${from.join("; ")}`, "");
  }
  sections.push(lines.join("\n"));
}

const head = [
  `# ${title}`,
  "",
  `${total} Learn cards to review. Each module opens with these before its quiz. A card has a title, one rule, and why it matters. Under each card is the True/False statement it's written from, with that statement's answer.`,
  "",
  "Nothing here is live until you approve it.",
  "",
].join("\n");
writeFileSync(out, `${head}\n${sections.join("\n")}`);
console.log(`Wrote ${total} cards to ${out}`);
