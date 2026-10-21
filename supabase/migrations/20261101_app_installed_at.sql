-- Staff mobile redesign (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 4.4):
-- when a person first opened SBE from their Home Screen, and on what.
--
-- app_installed_at: the first launch in standalone mode (the installed app),
--   set once by POST /api/profile/app-installed and never moved later.
-- app_install_platform: the platform that launch came from, one of the ids in
--   lib/install-platform.ts.
--
-- The funnel query in docs/FUNNEL_METRICS.md counts installs from these.
-- Additive: safe to run before the new code is live. Until it's run, the
-- route answers without saving and nothing else changes.
-- Rollback: supabase/rollbacks/20261101_app_installed_at_rollback.sql

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS app_installed_at timestamptz,
  ADD COLUMN IF NOT EXISTS app_install_platform text
    CHECK (app_install_platform IS NULL OR char_length(app_install_platform) <= 32);

CREATE INDEX IF NOT EXISTS profiles_app_installed_at_idx
  ON public.profiles (app_installed_at)
  WHERE app_installed_at IS NOT NULL;

COMMIT;
