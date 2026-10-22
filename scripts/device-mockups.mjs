/**
 * scripts/device-mockups.mjs
 *
 * Makes the product mockups in public/shots/: captures the signed-in app with
 * Playwright, then draws phone and laptop frames around the captures and writes
 * WebP files sized for the marketing pages. Frames are drawn here in CSS, so no
 * stock mockup file (and no attribution line) is needed.
 *
 * Usage:
 *   node scripts/device-mockups.mjs login-manager [base-url]
 *   node scripts/device-mockups.mjs capture [base-url] [name ...]   default http://localhost:3000, every screen
 *   node scripts/device-mockups.mjs compose
 *
 * capture needs the saved QA session (tests/e2e/.auth/state.json, made by step 5
 * of docs/LIVE_APP_TESTING.md section 6) and, for the console screens, a manager
 * session saved to tests/e2e/.auth/manager-state.json. Raw captures go to
 * .playwright-mcp/shots-raw/ (gitignored); compose reads them from there.
 *
 * Names on screen are swapped for SHOW_NAMES just before each capture, so the
 * pictures show a believable venue without fake rows going into the database.
 */

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const ROOT = process.cwd();
const RAW = path.join(ROOT, ".playwright-mcp", "shots-raw");
const OUT = path.join(ROOT, "public", "shots");
const STAFF_STATE = path.join(ROOT, "tests", "e2e", ".auth", "state.json");
const MANAGER_STATE = path.join(ROOT, "tests", "e2e", ".auth", "manager-state.json");

// Text swapped on screen before a capture: [pattern, replacement]. Longest
// first, so "QA Playwright" goes before "QA". The demo venue's staff carry
// internal addresses that should never show in marketing.
const TEXT_SWAPS = [
  ["QA Playwright", "Sam Taylor"],
  ["\\bQA\\b", "Sam"],
  ["\\bQP\\b", "ST"],
  ["\\s*·\\s*[\\w.]+@demo\\.sbe-internal\\.example", ""],
];

// A reply typed into Live Guest ("Stacked to help") and left unsent, so the
// phone shows a staff member answering a guest. No AI call, so it also works
// on a local server with no OpenAI key.
const LIVE_GUEST_REPLY =
  "Thanks heaps, that's really kind. I'll take them from here, we keep schooners unstacked so they don't jam or chip. Can I grab you anything else?";

// A browser has no iPhone status bar, so the phone screen is captured 47px
// short and compose draws the status bar above it (STATUS_BAR).
const PHONE = { width: 390, height: 797, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 2 };

const COMPACT = { ...DESKTOP, width: 1180, height: 760 };

// The weekly-email offer is a one-off prompt, not what Home looks like day to day.
async function dismissNudge(page) {
  const close = page.locator(".sm-notice-close");
  if (await close.count()) await close.first().click();
  await page.waitForTimeout(400);
}

async function talkToGuest(page) {
  await page.getByText("Stacked to help").first().click();
  const box = page.getByPlaceholder("What do you say to the guest?");
  await box.fill(LIVE_GUEST_REPLY);
  await box.blur();
}

// name: [session, viewport, path, options]. Options: dark (mobile dark mode),
// act (steps to run on the page before the capture).
// The QA account has no training history and the demo venue's training is over
// 30 days old, so screens that would show zeros (staff progress, console
// overview) are left out in favour of ones with real content. Live Guest uses
// the manager session because the QA account's one free conversation is spent.
const CAPTURES = {
  "mobile-home": ["staff", PHONE, "/mobile/home", { act: dismissNudge }],
  "mobile-learn": ["staff", PHONE, "/mobile/learn"],
  "mobile-live-guest": ["manager", PHONE, "/mobile/live-guest", { act: talkToGuest }],
  "mobile-cocktails": ["staff", PHONE, "/mobile/cocktails"],
  "mobile-challenge-sort": ["staff", PHONE, "/mobile/challenge/three-drink-order"],
  "mobile-challenge-choice": ["staff", PHONE, "/mobile/challenge/lipstick-glass"],
  "mobile-challenge-pairs": ["staff", PHONE, "/mobile/challenge/right-glass"],
  "desktop-today": ["staff", DESKTOP, "/dashboard?nav=home"],
  "desktop-modules": ["staff", DESKTOP, "/dashboard?nav=module"],
  "console-staff": ["manager", DESKTOP, "/management/dashboard?tab=staff"],
  "console-gaps": ["manager", DESKTOP, "/management/dashboard?tab=predictive"],
  "console-gaps-compact": ["manager", COMPACT, "/management/dashboard?tab=predictive"],
  "console-teams": ["manager", DESKTOP, "/management/dashboard?tab=teams"],
  "console-compliance": ["manager", COMPACT, "/management/dashboard?tab=compliance"],
  "console-reports": ["manager", DESKTOP, "/management/dashboard?tab=reports"],
  "console-coach": ["manager", DESKTOP, "/management/dashboard?tab=aicoach"],
};

// Composed outputs. kind: "phone" (one framed phone), "screen" (a plain
// screenshot; the page's .sbe-shot class adds the radius and shadow), or
// "hero" (laptop with two phones in front).
const COMPOSE = {
  "hero-devices": { kind: "hero", laptop: "console-staff", phones: ["mobile-live-guest", "mobile-home"] },
  "console-staff": { kind: "screen", src: "console-staff" },
  "console-gaps": { kind: "screen", src: "console-gaps" },
  "console-gaps-compact": { kind: "screen", src: "console-gaps-compact" },
  "console-teams": { kind: "screen", src: "console-teams" },
  "console-compliance": { kind: "screen", src: "console-compliance" },
  "console-reports": { kind: "screen", src: "console-reports" },
  "console-coach": { kind: "screen", src: "console-coach" },
  "desktop-today": { kind: "screen", src: "desktop-today" },
  "desktop-modules": { kind: "screen", src: "desktop-modules" },
  "phone-home": { kind: "phone", src: "mobile-home" },
  "phone-learn": { kind: "phone", src: "mobile-learn" },
  "phone-cocktails": { kind: "phone", src: "mobile-cocktails" },
  "phone-challenge-sort": { kind: "phone", src: "mobile-challenge-sort" },
  "phone-challenge-choice": { kind: "phone", src: "mobile-challenge-choice" },
  "phone-challenge-pairs": { kind: "phone", src: "mobile-challenge-pairs" },
};

// ── Capture ──────────────────────────────────────────────────────────────────

async function capture(baseUrl, only) {
  mkdirSync(RAW, { recursive: true });
  const browser = await chromium.launch();
  const sessions = { staff: STAFF_STATE, manager: MANAGER_STATE };

  for (const [name, [session, viewport, route, opts = {}]] of Object.entries(CAPTURES)) {
    if (only.length && !only.includes(name)) continue;
    if (!existsSync(sessions[session])) {
      console.log(`skip ${name}: no ${session} session saved`);
      continue;
    }
    const { width, height, ...device } = viewport;
    const context = await browser.newContext({
      viewport: { width, height },
      ...device,
      storageState: sessions[session],
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(baseUrl + route, { waitUntil: "load" });
    if (new URL(page.url()).pathname.startsWith("/login")) {
      console.log(`stop: ${session} session is signed out. Run step 5 of docs/LIVE_APP_TESTING.md section 6 again.`);
      await context.close();
      break;
    }
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1200);
    if (opts.act) await opts.act(page);
    await page.evaluate(({ swaps, dark }) => {
      if (dark) document.documentElement.classList.add("sm-dark");
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        let text = node.nodeValue ?? "";
        for (const [pattern, to] of swaps) text = text.replace(new RegExp(pattern, "g"), to);
        node.nodeValue = text;
      }
      // Not part of the product: the cookie banner and the Next.js dev badge.
      document.querySelectorAll(".cookie-banner, nextjs-portal").forEach((el) => el.remove());
    }, { swaps: TEXT_SWAPS, dark: Boolean(opts.dark) });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(RAW, `${name}.png`) });
    console.log(`captured ${name}`);
    await context.close();
  }
  await browser.close();
}

// ── Compose ──────────────────────────────────────────────────────────────────

const dataUri = (name) => {
  const file = path.join(RAW, `${name}.png`);
  if (!existsSync(file)) throw new Error(`missing capture ${name}.png in ${RAW}`);
  return `data:image/png;base64,${readFileSync(file).toString("base64")}`;
};

// Device frames. Sizes are CSS pixels; the page renders at 2x or 3x.
const FRAME_CSS = `
  * { box-sizing: border-box; margin: 0; }
  body { background: transparent; }
  .stage { position: relative; display: inline-block; }

  .phone { position: relative; width: 418px; height: 872px; padding: 14px; border-radius: 68px;
    background: linear-gradient(150deg, #3a3d3b 0%, #1b1d1c 40%, #0b0c0b 100%);
    box-shadow: inset 0 0 0 1.5px #6d726e, inset 0 0 0 4px #121312; }
  .phone::before { content: ""; position: absolute; inset: 9px; border-radius: 60px; background: #000; }
  .phone .screen { position: relative; width: 390px; height: 844px; border-radius: 54px; overflow: hidden; background: #000; }
  .phone .screen { display: flex; flex-direction: column; }
  .phone .screen img { width: 100%; flex: 1; min-height: 0; display: block; object-fit: cover; object-position: top; }
  .status { flex: 0 0 47px; display: flex; align-items: center; justify-content: space-between; padding: 6px 30px 0 46px;
    font: 600 16px/1 -apple-system, "SF Pro Text", "Helvetica Neue", sans-serif; letter-spacing: -0.2px; }
  .status svg { display: block; }
  .status .icons { display: flex; gap: 6px; align-items: center; }
  .phone .island { position: absolute; top: 25px; left: 50%; width: 122px; height: 35px; transform: translateX(-50%);
    border-radius: 20px; background: #000; z-index: 2; }
  .phone .btn { position: absolute; width: 4px; border-radius: 2px; background: linear-gradient(90deg, #4a4e4b, #26292a); }
  .phone .btn.l1 { left: -3px; top: 168px; height: 30px; }
  .phone .btn.l2 { left: -3px; top: 222px; height: 58px; }
  .phone .btn.l3 { left: -3px; top: 292px; height: 58px; }
  .phone .btn.r1 { right: -3px; top: 250px; height: 92px; }

  .laptop { position: relative; width: 1240px; }
  .lid { position: relative; margin: 0 70px; padding: 22px 22px 30px; border-radius: 26px 26px 6px 6px;
    background: #0d0e0d; box-shadow: inset 0 0 0 2px #2c2f2d, inset 0 0 0 6px #050505; }
  .lid .screen { position: relative; aspect-ratio: 16 / 10; overflow: hidden; border-radius: 6px; background: #fff; }
  .lid .screen img { width: 100%; height: 100%; display: block; object-fit: cover; object-position: top left; }
  .lid .cam { position: absolute; top: 9px; left: 50%; width: 6px; height: 6px; margin-left: -3px; border-radius: 50%; background: #1e2a24; }
  .base { position: relative; height: 22px; border-radius: 2px 2px 18px 18px;
    background: linear-gradient(180deg, #e9eae8 0%, #c9cbc8 45%, #9fa29e 100%);
    box-shadow: 0 30px 50px -28px rgba(0,0,0,.45); }
  .base::before { content: ""; position: absolute; top: 0; left: 50%; width: 180px; height: 9px; margin-left: -90px;
    border-radius: 0 0 10px 10px; background: linear-gradient(180deg, #a9aca8, #cfd1ce); }

  .hero { position: relative; width: 1560px; height: 960px; }
  .hero .laptop { position: absolute; left: 0; top: 40px; }
  .hero .phone { position: absolute; transform-origin: top left; filter: drop-shadow(0 34px 40px rgba(0,0,0,.35)); }
  .hero .phone.p1 { left: 930px; top: 300px; transform: scale(.72); }
  .hero .phone.p2 { left: 1250px; top: 220px; transform: scale(.72); }
`;

// The status bar takes the colour of the capture's top edge, with dark or
// light glyphs to suit, so it reads as part of the app.
async function statusBar(src) {
  const { data } = await sharp(path.join(RAW, `${src}.png`))
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [r, g, b] = data;
  const ink = 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#000" : "#fff";
  return `
    <div class="status" style="background: rgb(${r}, ${g}, ${b}); color: ${ink}">
      <span>9:41</span>
      <span class="icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="${ink}"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="${ink}"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.3A10.3 10.3 0 0 0 8 .8 10.3 10.3 0 0 0 .7 3.7L2 5a8.5 8.5 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.4l1.3-1.3A6.6 6.6 0 0 0 8 4.4c-1.8 0-3.5.7-4.7 1.9l1.3 1.3c.9-.9 2.1-1.4 3.4-1.4Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.6l1.3-1.3c-.3-.3-.8-.5-1.3-.5Z"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="${ink}" opacity="0.4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="${ink}"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="${ink}" opacity="0.5"/></svg>
      </span>
    </div>`;
}

const phoneHtml = async (src, cls = "") => `
  <div class="phone ${cls}">
    <span class="btn l1"></span><span class="btn l2"></span><span class="btn l3"></span><span class="btn r1"></span>
    <div class="screen">${await statusBar(src)}<img src="${dataUri(src)}" alt=""><span class="island"></span></div>
  </div>`;

const laptopHtml = (src) => `
  <div class="laptop">
    <div class="lid"><span class="cam"></span><div class="screen"><img src="${dataUri(src)}" alt=""></div></div>
    <div class="base"></div>
  </div>`;

async function renderFramed(browser, html, scale) {
  const page = await browser.newPage({ deviceScaleFactor: scale, viewport: { width: 1600, height: 1100 } });
  await page.setContent(`<style>${FRAME_CSS}</style><div class="stage">${html}</div>`);
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
  const png = await page.locator(".stage").screenshot({ omitBackground: true });
  await page.close();
  return png;
}

async function compose() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, spec] of Object.entries(COMPOSE)) {
    let input;
    let maxWidth;
    try {
      if (spec.kind === "screen") {
        input = readFileSync(path.join(RAW, `${spec.src}.png`));
        maxWidth = 2000;
      } else if (spec.kind === "phone") {
        input = await renderFramed(browser, await phoneHtml(spec.src), 2);
        maxWidth = 836;
      } else {
        const [a, b] = spec.phones;
        input = await renderFramed(
          browser,
          `<div class="hero">${laptopHtml(spec.laptop)}${await phoneHtml(b, "p2")}${await phoneHtml(a, "p1")}</div>`,
          2,
        );
        maxWidth = 2400;
      }
    } catch (error) {
      console.log(`skip ${name}: ${error.message}`);
      continue;
    }
    const out = path.join(OUT, `${name}.webp`);
    const info = await sharp(input)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 84, alphaQuality: 90, effort: 6 })
      .toFile(out);
    console.log(`${name}.webp  ${info.width}x${info.height}  ${(info.size / 1000).toFixed(0)}K`);
  }
  await browser.close();
}

// Opens a visible browser at the sign-in page. The owner signs in as a manager
// by hand; once the console loads, the session is saved for capture.
async function loginManager(baseUrl) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`);
  console.log("Sign in as a manager in the browser window, open the Manager Console, then press Enter here.");
  await new Promise((resolve) => process.stdin.once("data", resolve));
  process.stdin.pause();
  if (!page.url().includes("/management")) {
    console.log(`The browser is on ${page.url()}, not the Manager Console. Open the console there and run this again.`);
    await browser.close();
    return;
  }
  await context.storageState({ path: MANAGER_STATE });
  console.log("Manager session saved. You can close the browser.");
  await browser.close();
}

const [command, baseUrl = "http://localhost:3000", ...only] = process.argv.slice(2);
if (command === "capture") await capture(baseUrl.replace(/\/$/, ""), only);
else if (command === "login-manager") await loginManager(baseUrl.replace(/\/$/, ""));
else if (command === "compose") await compose();
else {
  console.error("Usage: node scripts/device-mockups.mjs login-manager [base-url] | capture [base-url] | compose");
  process.exit(1);
}
