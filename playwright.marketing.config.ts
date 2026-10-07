import { defineConfig, devices } from "@playwright/test";

// Public marketing-page checks (no sign-in). Kept apart from
// playwright.config.ts, whose global setup needs the QA account.
// Run: PLAYWRIGHT_BASE_URL=<dev or preview url> npx playwright test -c playwright.marketing.config.ts
// Not `next start` on localhost: production mode geo-blocks requests with no
// Cloudflare country header.
export default defineConfig({
  testDir: "tests/e2e-marketing",
  fullyParallel: true,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "phone-375x667", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 667 } } },
    { name: "desktop-1366x850", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 850 } } },
  ],
});
