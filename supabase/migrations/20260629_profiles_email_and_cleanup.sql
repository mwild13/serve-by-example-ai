-- Stage 1: Email Sync Trigger & Dead Column Cleanup
-- Purpose:
--   1. Add email column to profiles table
--   2. Create trigger to auto-sync email from auth.users
--   3. Drop unused avatar_url and is_founding_user columns
-- Date: 2026-06-29

-- ============================================================
-- 1. Add email column to profiles (if not exists)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT NULL;

COMMENT ON COLUMN public.profiles.email IS 'User email synced from auth.users via trigger';

-- ============================================================
-- 2. Create trigger function to sync email from auth.users
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_email_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace trigger on auth.users table
-- Fires on INSERT and UPDATE to keep profiles.email in sync
DROP TRIGGER IF EXISTS sync_email_on_auth_update ON auth.users;

CREATE TRIGGER sync_email_on_auth_update
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_from_auth();

-- ============================================================
-- 3. Backfill existing emails from auth.users
-- ============================================================

UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id
  AND p.email IS NULL;

-- ============================================================
-- 4. Drop unused columns from profiles table
-- ============================================================

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS avatar_url,
  DROP COLUMN IF EXISTS is_founding_user;

-- ============================================================
-- Verify cleanup is complete
-- ============================================================

SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
