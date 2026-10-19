/**
 * scripts/live-guest-review.mjs
 *
 * Writes the owner's review sheet for Live Guest briefs straight from the
 * code (lib/live-guest/guests.ts), so what is reviewed is what plays.
 *
 * Usage:
 *   node scripts/live-guest-review.mjs <out.md> "<title>" [guestId...]
 *   node scripts/live-guest-review.mjs "docs/Rich Update/live-guest-briefs.md" "Live Guest: the first eight guests"
 * With no ids, every guest is listed.
 */
import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [out, title, ...ids] = process.argv.slice(2);
if (!out || !title) {
  console.error('Usage: node scripts/live-guest-review.mjs <out.md> "<title>" [guestId...]');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "sbe-guests-"));
const bundle = join(dir, "guests.mjs");
await build({
  stdin: { contents: 'export { GUEST_BRIEFS } from "./lib/live-guest/guests";', resolveDir: process.cwd(), loader: "ts" },
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
const { GUEST_BRIEFS } = await import(pathToFileURL(bundle).href);
rmSync(dir, { recursive: true, force: true });

const MOOD = { 1: "fuming", 2: "annoyed", 3: "neutral", 4: "happy", 5: "delighted" };
const LEVEL = { 1: "gentle", 2: "tricky", 3: "hard" };
const guests = ids.length ? GUEST_BRIEFS.filter((g) => ids.includes(g.id)) : GUEST_BRIEFS;

const sections = guests.map((g) => [
  `## ${g.title} (${g.name}, module ${g.moduleId})`,
  "",
  `*${LEVEL[g.level]}, starts ${MOOD[g.startMood]}. Id: \`${g.id}\`.*`,
  "",
  "**Staff see before they start:**",
  "",
  `- The scene: ${g.setting}`,
  `- ${g.name} opens with: "${g.opening}"`,
  "",
  "**Hidden until the reveal:**",
  "",
  `- **Who:** ${g.who}`,
  `- **Wants:** ${g.wants}`,
  "- **Calms them:**",
  ...g.calms.map((c) => `  - ${c}`),
  "- **Sets them off:**",
  ...g.setsOff.map((c) => `  - ${c}`),
  `- **Twist (2nd or 3rd reply):** ${g.twist}`,
  `- **Rule that can't be broken:** ${g.mustDo ?? "none"}`,
  `- **A good ending:** ${g.goodEnding}`,
  "",
].join("\n"));

const head = [
  `# ${title}`,
  "",
  `${guests.length} guests. Each one is a short typed conversation of 3 to 6 replies. The staff member sees the scene and the guest's first line. The AI plays the guest from the rest of the brief, which the staff member only sees in the reveal afterwards, along with what the guest was thinking at each turn.`,
  "",
  "A conversation passes at 75 out of 100. Breaking the rule that can't be broken ends it straight away and is never a pass.",
  "",
].join("\n");
writeFileSync(out, `${head}\n${sections.join("\n")}`);
console.log(`Wrote ${guests.length} guests to ${out}`);
