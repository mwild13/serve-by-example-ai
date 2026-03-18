-- ─────────────────────────────────────────────────────────────────────────────
-- supplemental_fixes.sql
-- Run AFTER fix_user_deletion.sql and schema_improvements.sql.
-- Covers: trigger permission grants, orphaned record cleanup, auth log query.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- PART A — Grant permissions so the auth trigger can write to public.profiles
-- supabase_auth_admin is the role Supabase uses internally when running
-- auth hooks.  Without these grants, handle_new_user fails silently.
-- ─────────────────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL   ON public.profiles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Also grant to the anon/authenticated roles so RLS-based inserts work:
GRANT USAGE ON SCHEMA public TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- PART B — Orphaned record cleanup
-- ─────────────────────────────────────────────────────────────────────────────

-- B1: Auth users that have no profile row (could cause issues on login)
SELECT au.id, au.email, au.created_at AS auth_created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- B2: Fill any gaps found above
INSERT INTO public.profiles (id, email, created_at)
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- B3: Profile rows with no matching auth user (ghost rows — safe to delete)
-- Review the output before uncommenting the DELETE.
SELECT p.id, p.email
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- ↓ Uncomment once you've reviewed the output above and confirmed it is safe.
-- DELETE FROM public.profiles
-- WHERE id NOT IN (SELECT id FROM auth.users);


-- ─────────────────────────────────────────────────────────────────────────────
-- PART C — Auth log query for password reset / invite email debugging
-- Requires "Schema & Logs" enabled in Supabase (Dashboard → Settings → Auth)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  created_at,
  payload ->> 'action'        AS action,
  payload ->> 'email'         AS email
FROM auth.audit_log_entries
WHERE payload ->> 'action' IN (
  'user_recovery_requested',
  'user_invited',
  'password_recovery',
  'user_signedup'
)
ORDER BY created_at DESC
LIMIT 20;


-- ─────────────────────────────────────────────────────────────────────────────
-- PART D — Final verification: confirm no RESTRICT rules remain on auth.users FKs
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema   = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name   = tc.constraint_name
  AND rc.constraint_schema = tc.table_schema
JOIN information_schema.key_column_usage AS ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema   = 'auth'
  AND ccu.table_name     = 'users'
ORDER BY tc.table_name;
-- Expected: all rows show CASCADE or SET NULL. None should show RESTRICT or NO ACTION.
