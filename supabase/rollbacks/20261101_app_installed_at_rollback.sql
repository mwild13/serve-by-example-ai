-- Rolls back supabase/migrations/20261101_app_installed_at.sql. Forgets when
-- each person first opened SBE from their Home Screen.

BEGIN;
DROP INDEX IF EXISTS public.profiles_app_installed_at_idx;
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS app_install_platform,
  DROP COLUMN IF EXISTS app_installed_at;
COMMIT;
