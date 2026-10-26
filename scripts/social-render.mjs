/**
 * scripts/social-render.mjs
 *
 * Turns a social post HTML file into PNGs: every element with class "slide"
 * becomes one image at its own size (1080 x 1440 for feed, 1080 x 1920 for
 * stories). Start from docs/socials/slide-template.html; the rules for what
 * goes on a slide are in AGENTS_SOCIALS.md.
 *
 * Usage:
 *   node scripts/social-render.mjs <post.html> [out-dir] [prefix]
 *
 * out-dir defaults to the HTML file's folder and prefix to its file name, so
 * p9.html writes p9-1.png, p9-2.png and so on. Paths like "public/brand/..."
 * resolve from the repo root wherever the HTML file lives, and the brand fonts
 * load from app/fonts, so a render needs no network.
 */

import { mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = process.cwd();
const [input, outArg, prefixArg] = process.argv.slice(2);

if (!input) {
  console.error("Usage: node scripts/social-render.mjs <post.html> [out-dir] [prefix]");
  process.exit(1);
}

const htmlPath = path.resolve(input);
const outDir = path.resolve(outArg ?? path.dirname(htmlPath));
const prefix = prefixArg ?? path.basename(htmlPath, path.extname(htmlPath));
const font = (file) => pathToFileURL(path.join(ROOT, "app", "fonts", file)).href;

// The same files next/font/local serves on the site, so slides match it exactly.
const FONT_FACES = `
@font-face { font-family: "Newsreader"; src: url("${font("newsreader-latin-variable.woff2")}") format("woff2"); font-weight: 400 700; font-style: normal; }
@font-face { font-family: "Newsreader"; src: url("${font("newsreader-italic-latin-variable.woff2")}") format("woff2"); font-weight: 400 700; font-style: italic; }
@font-face { font-family: "Inter"; src: url("${font("inter-latin-variable.woff2")}") format("woff2"); font-weight: 100 900; }
`;

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href);
await page.evaluate((root) => {
  document.querySelector("base")?.remove();
  const base = document.createElement("base");
  base.href = root;
  document.head.prepend(base);
  // Re-set every src so images resolve against the new base.
  document.querySelectorAll("img").forEach((img) => { img.src = img.getAttribute("src"); });
}, pathToFileURL(ROOT + path.sep).href);
await page.addStyleTag({ content: FONT_FACES });
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState("networkidle");

const slides = await page.locator(".slide").all();
if (slides.length === 0) {
  console.error(`No .slide elements in ${input}`);
  process.exitCode = 1;
}
for (const [i, slide] of slides.entries()) {
  const file = path.join(outDir, `${prefix}-${i + 1}.png`);
  await slide.screenshot({ path: file });
  console.log(path.relative(ROOT, file));
}
await browser.close();
