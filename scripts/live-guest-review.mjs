/**
 * scripts/live-guest-review.mjs
 *
 * Writes the owner's review sheet for Live Guest briefs straight from the
 * code (lib/live-guest/guests.ts), so what is reviewed is what plays.
 *
 * Usage:
 *   node scripts/live-guest-review.mjs <out.md> "<title>" [guestId...]
 *   node scripts/live-guest-review.mjs "docs/Rich Update/live-guest-briefs.md" "Live Guest: the first eight guests"
 *   node scripts/live-guest-review.mjs --unreviewed "docs/Rich Update/guest-briefs-batch-1.md" "Live Guest briefs, batch 1"
 *   node scripts/live-guest-review.mjs --reviewed "docs/Rich Update/live-guest-briefs.md" "Live Guest: the guests that are live"
 * With no ids, every guest is listed; --unreviewed lists only guests not yet
 * approved, and --reviewed only the live ones.
 */
import { build } from "esbuild";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const filter = args[0] === "--unreviewed" || args[0] === "--reviewed" ? args[0] : null;
const [out, title, ...ids] = filter ? args.slice(1) : args;
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
const picked = ids.length ? GUEST_BRIEFS.filter((g) => ids.includes(g.id)) : GUEST_BRIEFS;
const guests = filter ? picked.filter((g) => g.reviewed === (filter === "--reviewed")) : picked;
const SAFETY = { 1: "Unsafe", 2: "At risk", 3: "Watch it", 4: "Mostly safe", 5: "Safe" };
const dollars = (n) => (n > 0 ? `+$${n}` : n < 0 ? `-$${-n}` : "$0");

function dials(g) {
  const s = g.stakes;
  const per = s.moneyPer ? ` ${s.moneyPer}` : "";
  return [
    "**The dials:**",
    "",
    "- Guest: always in play (the mood).",
    `- Speed: ${s.speed ? 'in play, starts at "Steady"' : "not in play"}.`,
    `- Safety: ${s.safety === null ? "not in play" : `in play, starts at "${SAFETY[s.safety]}"`}.`,
    s.money.length === 0
      ? "- Money: not in play."
      : ["- Money: in play. What can happen:", ...s.money.map((m) => `  - ${m.label}: about ${dollars(m.dollars)}${per}${m.group ? " (one of the alternatives; only one counts)" : ""}`)].join("\n"),
    ...(s.moneyNote ? [`- Money note shown in the reveal: ${s.moneyNote}`] : []),
  ];
}

const sections = guests.map((g) => [
  `## ${g.title} (${g.name}, module ${g.moduleId})`,
  "",
  `*${LEVEL[g.level]}, starts ${MOOD[g.startMood]}. From: ${g.source}. Id: \`${g.id}\`.${g.reviewed ? "" : " Not live yet."}*`,
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
  ...dials(g),
  "",
].join("\n"));

const head = [
  `# ${title}`,
  "",
  `${guests.length} guests. Each one is a short typed conversation of 3 to 6 replies. The staff member sees the scene and the guest's first line. The AI plays the guest from the rest of the brief, which the staff member only sees in the reveal afterwards, along with what the guest was thinking at each turn.`,
  "",
  "A conversation passes at 75 out of 100. Breaking the rule that can't be broken ends it straight away and is never a pass.",
  "",
  "**The four dials** show in the reveal: the guest's mood, and speed, safety and money when the situation puts them at stake. Money counts anything given away or made again at cost, and an extra sale at menu price. The figures are rough, and each thing counts once.",
  "",
  "**How patient the guest is** follows the person's progress. A beginner gets a patient guest (starts one mood better, forgives a slip). Once the module is mastered the guest plays as written. Once the module is mastered and the guest passed before, or 10 modules are mastered, the guest is tough (starts one mood worse, pushes back once, brings the twist in early).",
  "",
].join("\n");
writeFileSync(out, `${head}\n${sections.join("\n")}`);
console.log(`Wrote ${guests.length} guests to ${out}`);
