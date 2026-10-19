/**
 * scripts/picture-review.mjs
 *
 * Draws the owner's review page for the picture library straight from the
 * code (components/pictures/Picture.tsx and lib/pictures/), on the light
 * desktop and dark mobile colours, so what is reviewed is what the app shows.
 *
 * Usage:
 *   node scripts/picture-review.mjs <out.html> <samples.json> [checks.json]
 * samples.json: [{ "label": "...", "note": "...", "spec": { ...PictureSpec } }]
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [out, samplesFile] = process.argv.slice(2);
if (!out || !samplesFile) {
  console.error("Usage: node scripts/picture-review.mjs <out.html> <samples.json>");
  process.exit(1);
}
const samples = JSON.parse(readFileSync(samplesFile, "utf8"));

const dir = mkdtempSync(join(tmpdir(), "sbe-pictures-"));
const bundle = join(dir, "pictures.mjs");
await build({
  stdin: {
    contents: `
      import { renderToStaticMarkup } from "react-dom/server";
      import { createElement } from "react";
      import Picture, { pictureAlt } from "./components/pictures/Picture";
      export function draw(spec) {
        return { svg: renderToStaticMarkup(createElement(Picture, { spec })), alt: pictureAlt(spec) };
      }
    `,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  jsx: "automatic",
  outfile: bundle,
  logLevel: "error",
  alias: { "@": process.cwd() },
  // react-dom/server is CommonJS and requires Node built-ins.
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
  define: { "process.env.NODE_ENV": '"production"' },
});
const { draw } = await import(pathToFileURL(bundle).href);
rmSync(dir, { recursive: true, force: true });

// The --pic-* values as the app defines them: light from app/globals.css,
// dark from the .qz--dark block in app/styles/staff.css.
function tokens(file, selector) {
  const css = readFileSync(file, "utf8");
  const start = css.indexOf(selector);
  const block = css.slice(start, css.indexOf("}", start));
  return [...block.matchAll(/(--pic-[a-z-]+):\s*([^;]+);/g)].map(([, k, v]) => `${k}: ${v};`).join(" ");
}
const light = tokens("app/globals.css", "--pic-line");
const dark = tokens("app/styles/staff.css", ".qz--dark {").replace(/var\(--text-mobile\)/g, "#ffffff");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cards = samples
  .map(({ label, note, spec }) => {
    const { svg, alt } = draw(spec);
    return `<figure class="card">
  <div class="pair"><div class="swatch light"><p class="ground">Desktop</p>${svg}</div><div class="swatch dark"><p class="ground">Mobile</p>${svg}</div></div>
  <figcaption><strong>${esc(label)}</strong>${note ? `<span>${esc(note)}</span>` : ""}<em>Read aloud as: ${esc(alt)}</em></figcaption>
</figure>`;
  })
  .join("\n");

const checks = process.argv[4] ? JSON.parse(readFileSync(process.argv[4], "utf8")) : [];
const checkList = checks.length
  ? `<section class="checks" aria-labelledby="checks-title"><h2 id="checks-title">What to check</h2><ul>${checks.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></section>`
  : "";

// Published as a claude.ai artifact, which adds the document skeleton, so the
// file starts at <title>.
writeFileSync(
  out,
  `<title>Picture Review</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Manrope:wght@400;600;700&display=swap">
<style>
  /* Layout: a review sheet. Each picture on the app's light and dark grounds, side by side. */
  :root {
    --bg: #f5f2e9; --surface: #fffef9; --text: #172f22; --muted: #496155; --line: #ddd2ba; --accent: #1f4e37;
    --font-display: "Fraunces", Georgia, serif; --font-body: "Manrope", system-ui, sans-serif;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0f1118; --surface: #171a26; --text: #f5f2e9; --muted: #a7b0c4; --line: #2c3145; --accent: #f2af34; color-scheme: dark; } }
  :root[data-theme="dark"] { --bg: #0f1118; --surface: #171a26; --text: #f5f2e9; --muted: #a7b0c4; --line: #2c3145; --accent: #f2af34; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { background: var(--bg); color: var(--text); font: 15px/1.55 var(--font-body); }
  main { max-width: 1040px; margin: 0 auto; padding-block: 36px 72px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: flex; flex-direction: column; gap: 24px; }
  h1 { font: 600 2rem/1.15 var(--font-display); margin: 0; text-wrap: balance; }
  h2 { font: 600 1.1rem/1.3 var(--font-display); margin: 0 0 8px; }
  .lede { color: var(--muted); margin: 6px 0 0; max-width: 65ch; }
  .eyebrow { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin: 0 0 6px; }
  .checks { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 16px 20px; }
  .checks ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; max-width: 70ch; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .card { margin: 0; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .swatch { border-radius: 12px; padding: 10px; }
  .swatch.light { background: #fffef9; border: 1px solid #ece5d5; ${light} }
  .swatch.dark { background: #171a26; border: 1px solid #2c3145; ${light} ${dark} }
  .swatch svg { display: block; width: 100%; height: auto; }
  .ground { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 4px; }
  .swatch.light .ground { color: #7a9185; }
  .swatch.dark .ground { color: #8a90a6; }
  figcaption { display: flex; flex-direction: column; gap: 4px; }
  figcaption strong { font-weight: 700; }
  figcaption span { color: var(--muted); }
  figcaption em { color: var(--muted); font-size: 0.85rem; font-style: normal; }
</style>
<main>
  <header>
    <p class="eyebrow">Rich update, Phase 9</p>
    <h1>Picture review</h1>
    <p class="lede">Drawn by the app's own picture code. Each picture shows on the light desktop colours and the dark mobile colours.</p>
  </header>
  ${checkList}
  <div class="grid">
${cards}
  </div>
</main>
`,
);
console.log(`Wrote ${samples.length} pictures to ${out}`);
