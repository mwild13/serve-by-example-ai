// Creates (or repairs) the Playwright QA staff account that
// tests/e2e/global-setup.ts signs in as. Idempotent: safe to re-run any time
// the account drifts (password changed, onboarding reset, tier downgraded).
//
//   node --env-file=.env.local scripts/e2e/provision-qa-account.mjs
// or, with no .env.local (secrets live in Cloudflare), export the four vars
// in your shell first and run:
//   node scripts/e2e/provision-qa-account.mjs
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, E2E_TEST_EMAIL
// and E2E_TEST_PASSWORD. Point it at whichever Supabase project the suite
// runs against (local `npm run dev` and Cloudflare previews both use the live
// project today).
//
// Why a script and not supabase/seed.sql: seed.sql only runs on
// `supabase db reset` against a local stack, and this repo has no local
// stack — the suite signs in against the real project. The auth user also
// has to be made through the Admin API so GoTrue hashes the password and
// the on_auth_user_created trigger creates the profile row.
//
// What the account gets, and why:
//   tier = 'pro', subscription_status = null, org_id = null
//     resolveTierAccess() (lib/session.ts) gives 'pro' all 40 modules, with no
//     seats and no Manager Console. A null status means "trust tier", and a
//     null org skips the trial gate, so access never expires.
//   onboarding_completed + diagnostic_completed = true
//     app/mobile/layout.tsx redirects to /onboarding otherwise.
//   No organization_members row
//     so it never takes up a seat or shows up in a manager's roster.
import { createClient } from "@supabase/supabase-js";

const QA_DISPLAY_NAME = "QA Playwright";

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Export it in your shell (or use node --env-file=<file>) and re-run scripts/e2e/provision-qa-account.mjs.`);
    process.exit(1);
  }
  return value;
}

const url = required("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
const email = required("E2E_TEST_EMAIL").toLowerCase().trim();
const password = required("E2E_TEST_PASSWORD");

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserId() {
  // profiles.email is kept in sync with auth.users by the
  // on_auth_user_email_updated trigger, so it's a one-query lookup.
  const { data, error } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function main() {
  let userId = await findUserId();

  if (userId) {
    const { error } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    if (error) throw error;
    console.log(`Found existing QA user ${userId}; password reset to E2E_TEST_PASSWORD.`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: QA_DISPLAY_NAME },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created QA user ${userId}.`);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      display_name: QA_DISPLAY_NAME,
      tier: "pro",
      subscription_status: null,
      org_id: null,
      manager_id: null,
      onboarding_completed: true,
      diagnostic_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (profileError) throw profileError;

  // Fail loudly if the trigger didn't create the profile row, rather than
  // letting global-setup fail later with a less obvious /onboarding redirect.
  const { data: check, error: checkError } = await admin
    .from("profiles")
    .select("tier, onboarding_completed")
    .eq("id", userId)
    .single();
  if (checkError || !check?.onboarding_completed || check.tier !== "pro") {
    throw new Error("QA profile row is missing or didn't take the update — check the on_auth_user_created trigger.");
  }

  console.log("QA account ready: tier=pro, onboarding complete. Run `npm run e2e`.");
}

main().catch((err) => {
  console.error("Provisioning failed:", err?.message ?? err);
  process.exit(1);
});
