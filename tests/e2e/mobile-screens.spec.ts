import { test, expect, type Page } from "@playwright/test";

// Phase 6 mobile-responsive fix (2026-09-21) — initial visual-regression
// coverage for app/mobile/. Runs across every viewport project in
// playwright.config.ts (the same breakpoint matrix from the original
// responsive-sizing plan's Phase 5 QA table), using the authenticated
// session global-setup.ts already saved.
//
// Screenshots cover the screens whose content is stable for the QA
// account. Games and practice screens draw random questions, so a
// screenshot of them would fail on content, not layout. Every route
// instead gets the no-horizontal-scroll check further down.
//
// Staff mobile redesign, phase 8 (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md): the
// browser clock is fixed for the screenshots, so Home's greeting, date,
// cocktails and fact, and today's challenge, are the same on every run.
// The screens are taken in light on every viewport, and in dark at 390 wide.
// Regenerate on purpose with --update-snapshots and check them by eye.

const SCREENS: Array<{ name: string; path: string }> = [
  { name: "home", path: "/mobile/home" },
  { name: "learn-hub", path: "/mobile/learn" },
  { name: "practise", path: "/mobile/practise" },
  { name: "me", path: "/mobile/progress" },
  { name: "badges", path: "/mobile/badges" },
  { name: "settings", path: "/mobile/settings" },
  { name: "cocktails", path: "/mobile/cocktails" },
  { name: "knowledge", path: "/mobile/knowledge" },
  // Regression coverage for the Phase 6 overflow-bug fix specifically —
  // ContactSupportScreen.tsx's honeypot field used to widen the document
  // past the viewport on this route only.
  { name: "contact-support", path: "/mobile/contact" },
  // Added 2026-10-05: static screens.
  { name: "help", path: "/mobile/help" },
  { name: "report-bug", path: "/mobile/report-bug" },
  { name: "privacy", path: "/mobile/privacy" },
  { name: "terms", path: "/mobile/terms" },
];

// Every /mobile screen. Not onboarding (the QA account has finished it, so
// it redirects), nor arena, scenarios and scenario-practice, which only
// redirect to live-guest.
const ALL_ROUTES = [
  "ai-photo", "badges", "challenges", "cocktails", "contact", "drill", "help", "home",
  "install", "knowledge", "learn", "live-guest", "match-pairs", "memory-test", "menu-audit",
  "practise", "privacy", "progress", "quiz", "recipe-order", "report-bug", "rush",
  "settings", "speed-round", "terms",
];

// Against `npm run dev` a page is built on its first visit, which can take
// longer than the default 30 seconds while other tests run alongside.
test.describe.configure({ timeout: 60_000 });

// A Tuesday evening in Sydney.
const FIXED_NOW = new Date("2026-10-20T18:30:00+11:00");

async function shoot(page: Page, screen: { name: string; path: string }, file: string) {
  await page.clock.setFixedTime(FIXED_NOW);
  // The one-off notifications card on Home shows while the QA account has
  // both emails off; it has its own test below, so keep it out of the
  // baseline.
  await page.addInitScript(() => {
    window.localStorage.setItem("sbe-notif-optin-card-dismissed", "1");
  });
  await page.goto(screen.path);
  await page.waitForLoadState("networkidle");
  // A quiet network isn't enough on a busy run: wait until every loading
  // shape has been replaced, and every photo on screen has loaded.
  await expect(page.locator(".sm-skel")).toHaveCount(0, { timeout: 20_000 });
  await page.waitForFunction(() =>
    Array.from(document.images).every((img) => {
      const box = img.getBoundingClientRect();
      const onScreen = box.bottom > 0 && box.top < window.innerHeight && box.right > 0 && box.left < window.innerWidth;
      return !onScreen || (img.complete && img.naturalWidth > 0);
    }),
  );
  // Elements tagged data-e2e-mask change day to day, so they're masked out
  // of the comparison, with their text swapped for a fixed placeholder so a
  // longer value can't push the layout down. The AI Coach's five-second
  // "AI Coach" bubble on Me is hidden for the same reason.
  await page.locator("p[data-e2e-mask], span[data-e2e-mask]").evaluateAll((els) => {
    for (const el of els) el.textContent = "masked";
  });
  await page.addStyleTag({
    content: "div[data-e2e-mask] p { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .sm-coach-hint { display: none; }",
  });
  await expect(page).toHaveScreenshot(file, {
    mask: [page.locator("[data-e2e-mask]")],
  });
}

for (const screen of SCREENS) {
  test(`${screen.name} renders correctly`, async ({ page }, testInfo) => {
    // The landscape project exists only for the rotate-overlay test below —
    // skip normal screen screenshots there so a landscape-shaped viewport
    // doesn't produce a spurious "regression" against portrait baselines.
    test.skip(testInfo.project.name.includes("landscape"), "Landscape project is for the rotate-overlay test only");
    await shoot(page, screen, `${screen.name}.png`);
  });

  test(`${screen.name} renders correctly in dark mode`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone-390x844", "Dark mode is checked at 390 wide only");
    await page.emulateMedia({ colorScheme: "dark" });
    await shoot(page, screen, `${screen.name}-dark.png`);
  });
}

test("landscape shows the rotate overlay, not app content", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("landscape"), "Only meaningful on the landscape project");

  await page.goto("/mobile/home");
  await page.waitForLoadState("networkidle");

  const overlay = page.locator(".mobile-landscape-guard");
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText("Turn your phone upright");
});

// Assumes the QA account has both notification emails off, as every account
// does until its owner turns one on.
test("the notifications card on Home links to Settings and stays dismissed", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("landscape"), "Landscape shows the rotate overlay");

  await page.goto("/mobile/home");
  await page.evaluate(() => window.localStorage.removeItem("sbe-notif-optin-card-dismissed"));
  await page.reload();
  const card = page.getByText("Want a weekly nudge?");
  // The card waits for the notification settings to load from the server.
  await expect(card).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: "Choose in Settings" })).toHaveAttribute("href", "/mobile/settings#notifications");

  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(card).toBeHidden();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(card).toBeHidden();
});

test("portrait phones never show the rotate overlay", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("landscape") || testInfo.project.name.includes("tablet"), "Portrait phones only");

  await page.goto("/mobile/home");
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".mobile-landscape-guard")).toBeHidden();
});

// The most common mobile regression is something wider than the screen
// (a fixed-width table, a long word, a hidden field), which lets the whole
// page scroll sideways. Checked on every route without a baseline.
for (const route of ALL_ROUTES) {
  test(`${route} has no horizontal scroll`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("landscape"), "Landscape shows the rotate overlay");

    await page.goto(`/mobile/${route}`);
    await page.waitForLoadState("networkidle");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, `/mobile/${route} is ${scrollWidth - clientWidth}px wider than the screen`).toBeLessThanOrEqual(clientWidth);
  });
}
