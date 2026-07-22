-- ============================================================
-- Security advisor remediation (Jul 22, 2026)
-- ============================================================

-- Step 1: billing_events RLS — table is intentionally admin-only
-- (webhook idempotency ledger, no user_id column, written only via
-- createSupabaseAdminClient which bypasses RLS). RLS-enabled-no-policy
-- is flagged by the linter because it can't distinguish "locked down on
-- purpose" from "forgot to add a policy". Add an explicit restrictive
-- policy so intent is documented and the advisory clears.
CREATE POLICY "billing_events_no_client_access" ON billing_events
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Step 2: harden apply_allowlist_role_on_signup's search_path.
-- Function body already fully schema-qualifies every reference
-- (auth.users, public.user_access_allowlist), so pinning search_path
-- to '' is safe and matches the pattern already used by
-- check_org_seat_limit / get_user_org_id / handle_new_user /
-- handle_user_email_updated.
ALTER FUNCTION public.apply_allowlist_role_on_signup() SET search_path = '';
