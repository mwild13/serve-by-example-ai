import { defineConfig, devices } from "@playwright/test";

// Phase 6 mobile-responsive fix (2026-09-21) — visual-regression harness for
// app/mobile/. Greenfield: no Playwright/e2e setup existed before this.
// Viewport-only projects (not full device descriptors) so we control the
// exact pixel matrix from the original responsive-sizing plan, rather than
// inheriting whatever touch/UA emulation a named device preset happens to
// carry. Auth is handled once in tests/e2e/global-setup.ts (a real /login
// flow against a dedicated QA test account) and reused via storageState
// across every project below, so tests never re-authenticate per run.
//
// Requires env vars before running `npm run e2e`:
//   E2E_TEST_EMAIL / E2E_TEST_PASSWORD — a staff account with
//     onboarding_completed = true and real module access, so /mobile/*
//     screens render actual content instead of empty/redirect states.
//   PLAYWRIGHT_BASE_URL — optional, defaults to http://localhost:3000
//     (against the local `npm run dev` server, auto-started below). Point
//     it at a Cloudflare Pages preview URL to test a deployed build instead
//     — in that case the local webServer is skipped.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const usingLocalServer = !process.env.PLAYWRIGHT_BASE_URL;

const AUTH_STATE_PATH = "tests/e2e/.auth/state.json";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }]],
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 30_000,
  expect: {
    // Baselines are generated locally on macOS. If this ever runs on a
    // different OS (e.g. Linux CI), sub-pixel font anti-aliasing
    // differences alone can otherwise fail an unchanged layout.
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  use: {
    baseURL,
    storageState: AUTH_STATE_PATH,
    trace: "retain-on-failure",
  },
  webServer: usingLocalServer
    ? {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    { name: "phone-360x800", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 800 } } },
    { name: "phone-375x667", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 667 } } },
    { name: "phone-390x844", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "phone-430x932", use: { ...devices["Desktop Chrome"], viewport: { width: 430, height: 932 } } },
    { name: "tablet-744x1024", use: { ...devices["Desktop Chrome"], viewport: { width: 744, height: 1024 } } },
    { name: "tablet-1024x1366", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 1366 } } },
    // Landscape phone — only used by the rotate-overlay test, but every
    // project shares the same spec file, so this needs to exist as its own
    // project rather than a one-off viewport override inside a test.
    { name: "phone-landscape-844x390", use: { ...devices["Desktop Chrome"], viewport: { width: 844, height: 390 } } },
  ],
});
