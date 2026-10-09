import { chromium, type FullConfig } from "@playwright/test";

// Phase 6 mobile-responsive fix (2026-09-21) — authenticates once against
// the real /login flow (staff portal, the default tab — see app/login/
// page.tsx's `useState<Portal>("staff")`) using a dedicated QA test
// account, then saves the resulting cookies/localStorage so every viewport
// project in playwright.config.ts reuses the same session instead of
// re-authenticating per run.
//
// The QA account must have `onboarding_completed = true` and real module
// access in Supabase — app/mobile/layout.tsx redirects to /onboarding
// otherwise, which would make every screenshot a false "failure" against
// the wrong page. scripts/e2e/provision-qa-account.mjs creates the account in
// exactly that state (and repairs it if it drifts).
export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set before running `npm run e2e`. Create the account with: node --env-file=.env.local scripts/e2e/provision-qa-account.mjs"
    );
  }

  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:3000";

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  // Scoped to the form so only its submit button can match.
  await page.locator("form").getByRole("button", { name: "Sign in" }).click();

  // Successful staff sign-in redirects to /dashboard (or /onboarding if
  // onboarding isn't complete — treated as a setup error, not a valid
  // session to save).
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
  if (page.url().includes("/onboarding")) {
    await browser.close();
    throw new Error(
      "E2E_TEST_EMAIL account has not completed onboarding. Repair it with: node --env-file=.env.local scripts/e2e/provision-qa-account.mjs"
    );
  }

  await page.context().storageState({ path: "tests/e2e/.auth/state.json" });
  await browser.close();
}
