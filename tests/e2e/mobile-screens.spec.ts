import { test, expect } from "@playwright/test";

// Phase 6 mobile-responsive fix (2026-09-21) — initial visual-regression
// coverage for app/mobile/. Runs across every viewport project in
// playwright.config.ts (the same breakpoint matrix from the original
// responsive-sizing plan's Phase 5 QA table), using the authenticated
// session global-setup.ts already saved.
//
// Deliberately not all ~24 screens yet — these four (Home, LearnHub,
// Settings, Contact) plus the landscape overlay are the proven pattern.
// Extending coverage to the rest is a straight copy-paste of one of the
// `test(...)` blocks below with a different route/name — a fast-follow,
// not part of this pass.

const SCREENS: Array<{ name: string; path: string }> = [
  { name: "home", path: "/mobile/home" },
  { name: "learn-hub", path: "/mobile/learn" },
  { name: "settings", path: "/mobile/settings" },
  // Regression coverage for the Phase 6 overflow-bug fix specifically —
  // ContactSupportScreen.tsx's honeypot field used to widen the document
  // past the viewport on this route only.
  { name: "contact-support", path: "/mobile/contact" },
];

for (const screen of SCREENS) {
  test(`${screen.name} renders correctly`, async ({ page }, testInfo) => {
    // The landscape project exists only for the rotate-overlay test below —
    // skip normal screen screenshots there so a landscape-shaped viewport
    // doesn't produce a spurious "regression" against portrait baselines.
    test.skip(testInfo.project.name.includes("landscape"), "Landscape project is for the rotate-overlay test only");

    await page.goto(screen.path);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`${screen.name}.png`);
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
