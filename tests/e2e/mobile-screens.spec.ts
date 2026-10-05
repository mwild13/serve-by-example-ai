import { test, expect } from "@playwright/test";

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

const SCREENS: Array<{ name: string; path: string }> = [
  { name: "home", path: "/mobile/home" },
  { name: "learn-hub", path: "/mobile/learn" },
  { name: "settings", path: "/mobile/settings" },
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

// Every /mobile route except onboarding (the QA account has finished it, so
// it redirects) and ai-photo (asks for the camera).
const ALL_ROUTES = [
  "arena", "badges", "challenges", "cocktails", "contact", "help", "home",
  "knowledge", "learn", "match-pairs", "memory-test", "menu-audit", "privacy",
  "progress", "quiz", "recipe-order", "report-bug", "scenario-practice",
  "scenarios", "settings", "speed-round", "terms",
];

for (const screen of SCREENS) {
  test(`${screen.name} renders correctly`, async ({ page }, testInfo) => {
    // The landscape project exists only for the rotate-overlay test below —
    // skip normal screen screenshots there so a landscape-shaped viewport
    // doesn't produce a spurious "regression" against portrait baselines.
    test.skip(testInfo.project.name.includes("landscape"), "Landscape project is for the rotate-overlay test only");

    await page.goto(screen.path);
    await page.waitForLoadState("networkidle");
    // Elements tagged data-e2e-mask change day to day (streak count, daily
    // warm-up module, Hot Picks), so they're masked out of the comparison.
    await expect(page).toHaveScreenshot(`${screen.name}.png`, {
      mask: [page.locator("[data-e2e-mask]")],
    });
  });
}

test("landscape shows the rotate overlay, not app content", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("landscape"), "Only meaningful on the landscape project");

  await page.goto("/mobile/home");
  await page.waitForLoadState("networkidle");

  const overlay = page.locator(".mobile-landscape-guard");
  await expect(overlay).toBeVisible();
  await expect(overlay).toContainText("Rotate your device to continue");
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
