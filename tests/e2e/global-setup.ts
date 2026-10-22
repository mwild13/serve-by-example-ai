import { chromium, type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// Signs the dedicated QA staff account in once and saves the resulting
// cookies, so every viewport project in playwright.config.ts reuses the same
// session instead of re-authenticating per run.
//
// It does not go through the /login form. Supabase Auth has captcha
// protection on (components/TurnstileWidget.tsx), and Cloudflare Turnstile
// does not issue tokens to an automated browser, so a scripted password
// sign-in is refused. Instead the Admin API mints a one-time sign-in token
// for the QA account, which is exchanged for a session; verifying a token is
// not captcha-protected. @supabase/ssr writes that session out as the same
// cookies the app's own client would set, and they are loaded into the
// browser. The /login form itself is therefore not covered by this suite.
//
// The QA account must have `onboarding_completed = true` and real module
// access in Supabase — app/mobile/layout.tsx redirects to /onboarding
// otherwise, which would make every screenshot a false "failure" against
// the wrong page. scripts/e2e/provision-qa-account.mjs creates the account in
// exactly that state (and repairs it if it drifts).

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} must be set before running \`npm run e2e\`. The suite needs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and E2E_TEST_EMAIL. Type them into your terminal as docs/LIVE_APP_TESTING.md shows (never a .env file).`
    );
  }
  return value;
}

export default async function globalSetup(config: FullConfig) {
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const email = required("E2E_TEST_EMAIL").toLowerCase().trim();

  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:3000";

  // 1. A one-time sign-in token for the QA account. Nothing is emailed.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    throw new Error(
      `Could not create a sign-in token for ${email}: ${linkError?.message ?? "no token returned"}. Check the secret key was pasted whole (set it again as docs/LIVE_APP_TESTING.md shows), and that the QA account exists; create or repair it with scripts/e2e/provision-qa-account.mjs.`
    );
  }

  // 2. Exchange it for a session, capturing the cookies @supabase/ssr writes.
  const sessionCookies = new Map<string, string>();
  const ssr = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => [],
      setAll: (cookies) => {
        for (const cookie of cookies) {
          if (cookie.value) sessionCookies.set(cookie.name, cookie.value);
          else sessionCookies.delete(cookie.name);
        }
      },
    },
  });
  const { data: verified, error: verifyError } = await ssr.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  const accessToken = verified?.session?.access_token;
  if (verifyError || !accessToken) {
    throw new Error(`Could not sign the QA account in: ${verifyError?.message ?? "no session returned"}.`);
  }
  if (sessionCookies.size === 0) {
    throw new Error("Signed in, but @supabase/ssr wrote no session cookies. Check its version against lib/supabase.ts.");
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies(
    [...sessionCookies].map(([name, value]) => ({ name, value, url: baseURL, sameSite: "Lax" as const }))
  );

  // 3. The sign-in form also stamps the one-device session (sbe_session_id).
  //    Sent through the context so its Set-Cookie lands with the others.
  const stamp = await context.request.post(`${baseURL}/api/session/stamp`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!stamp.ok()) {
    await browser.close();
    throw new Error(`Session stamp failed with ${stamp.status()}. Is ${baseURL} using the same Supabase project as NEXT_PUBLIC_SUPABASE_URL?`);
  }

  // 4. Confirm the session works. /dashboard redirects to /onboarding when
  //    onboarding isn't complete, and to /login when the cookies were refused.
  const page = await context.newPage();
  await page.goto(`${baseURL}/dashboard`);
  await page.waitForURL(/\/(dashboard|onboarding|login)/, { timeout: 15_000 });
  const landed = new URL(page.url()).pathname;
  if (landed.startsWith("/onboarding")) {
    await browser.close();
    throw new Error(
      "E2E_TEST_EMAIL account has not completed onboarding. Repair it with scripts/e2e/provision-qa-account.mjs, as docs/LIVE_APP_TESTING.md shows."
    );
  }
  if (landed.startsWith("/login")) {
    await browser.close();
    throw new Error(`The saved session was not accepted by ${baseURL}: /dashboard redirected to /login.`);
  }

  await context.storageState({ path: "tests/e2e/.auth/state.json" });
  await browser.close();
}
