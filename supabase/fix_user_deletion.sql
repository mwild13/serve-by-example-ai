-- ─────────────────────────────────────────────────────────────────────────────
-- fix_user_deletion.sql
-- Fixes "Database error deleting user" when removing users from Auth dashboard.
--
-- Root causes identified in this project:
--   1. public.profiles.id → auth.users(id)   — missing ON DELETE CASCADE
--   2. public.venue_staff.staff_user_id → auth.users(id) — missing ON DELETE rule
--   3. handle_new_user trigger may use SECURITY INVOKER (breaks RLS on delete)
--
-- Run each STEP in the Supabase SQL Editor. Read all output before continuing.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1 — Diagnose: list every FK pointing at auth.users with its delete rule
-- Run this first and review the results.
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  tc.table_schema                           AS schema,
  tc.table_name                             AS "table",
  kcu.column_name                           AS "column",
  tc.constraint_name,
  rc.delete_rule                            AS on_delete
FROM information_schema.table_constraints   AS tc
JOIN information_schema.key_column_usage    AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema   = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name   = rc.constraint_name
  AND tc.table_schema     = rc.constraint_schema
JOIN information_schema.key_column_usage    AS ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema   = 'auth'
  AND ccu.table_name     = 'users'
ORDER BY tc.table_name;


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2 — Fix: public.profiles
-- Standard Supabase setup creates profiles.id → auth.users(id) with RESTRICT.
-- We need CASCADE so deleting an auth user also removes their profile row.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT tc.constraint_name
    INTO v_constraint
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema   = kcu.table_schema
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.key_column_usage ccu
      ON rc.unique_constraint_name = ccu.constraint_name
   WHERE tc.table_schema  = 'public'
     AND tc.table_name    = 'profiles'
     AND tc.constraint_type = 'FOREIGN KEY'
     AND ccu.table_schema = 'auth'
     AND ccu.table_name   = 'users'
   LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE public.profiles
         DROP CONSTRAINT %I,
         ADD  CONSTRAINT %I
              FOREIGN KEY (id)
              REFERENCES auth.users(id)
              ON DELETE CASCADE;',
      v_constraint, v_constraint
    );
    RAISE NOTICE 'profiles FK fixed: %', v_constraint;
  ELSE
    RAISE NOTICE 'profiles FK not found – already removed or table does not exist.';
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3 — Fix: public.venue_staff.staff_user_id
-- Added in training_schema.sql without a delete rule, so it defaults to
-- RESTRICT which blocks auth user deletion.
-- We use SET NULL so the venue_staff record is kept (manager still sees the
-- row) but staff_user_id is cleared when the auth account is deleted.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT tc.constraint_name
    INTO v_constraint
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema   = kcu.table_schema
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.key_column_usage ccu
      ON rc.unique_constraint_name = ccu.constraint_name
   WHERE tc.table_schema  = 'public'
     AND tc.table_name    = 'venue_staff'
     AND kcu.column_name  = 'staff_user_id'
     AND tc.constraint_type = 'FOREIGN KEY'
     AND ccu.table_schema = 'auth'
     AND ccu.table_name   = 'users'
   LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE public.venue_staff
         DROP CONSTRAINT %I,
         ADD  CONSTRAINT %I
              FOREIGN KEY (staff_user_id)
              REFERENCES auth.users(id)
              ON DELETE SET NULL;',
      v_constraint, v_constraint
    );
    RAISE NOTICE 'venue_staff.staff_user_id FK fixed: %', v_constraint;
  ELSE
    RAISE NOTICE 'venue_staff.staff_user_id FK not found – may not exist yet.';
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4 — Fix: handle_new_user trigger (SECURITY DEFINER)
-- The default Supabase trigger that inserts into public.profiles runs as the
-- calling user (SECURITY INVOKER), which can fail when the deleter is the
-- service_role key rather than the row owner.  Re-create it as SECURITY DEFINER.
--
-- If your trigger function has a different name, adjust below.
-- ─────────────────────────────────────────────────────────────────────────────

-- First, check what triggers exist on auth.users:
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table  = 'users';


-- Run this only if you have a handle_new_user function.
-- It re-creates it as SECURITY DEFINER so it can always write to public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER          -- ← This is the critical part
SET search_path = public  -- ← Prevents search_path injection
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;  -- safe to re-run
  RETURN NEW;
END;
$$;

-- Ensure the trigger still exists (no-op if it already does):
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5 — Verify: re-run the diagnostic from STEP 1 and confirm
-- all on_delete values are now CASCADE or NO ACTION (not RESTRICT).
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  tc.constraint_name,
  rc.delete_rule AS on_delete
FROM information_schema.table_constraints   AS tc
JOIN information_schema.key_column_usage    AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema   = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name   = rc.constraint_name
  AND tc.table_schema     = rc.constraint_schema
JOIN information_schema.key_column_usage    AS ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema   = 'auth'
  AND ccu.table_name     = 'users'
ORDER BY tc.table_name;
