-- ============================================================
-- Subscription cache columns on profiles
--
-- These three columns let app/dashboard/page.tsx read subscription
-- state from Supabase on every page load instead of making a live
-- Stripe API call. The webhook handler keeps them authoritative;
-- subscription_period_end is used as a narrow fallback trigger to
-- call Stripe only when a webhook may have been missed.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_active     BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_status     TEXT        NULL,
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ NULL;

-- Backfill: any profile already on a paid plan is presumed active
-- until the webhook handler can write the precise status.
-- This prevents existing paid users from losing access on first load
-- after the dashboard code change ships.
UPDATE profiles
SET subscription_active = true
WHERE plan IS NOT NULL
  AND plan NOT IN ('free', '');
