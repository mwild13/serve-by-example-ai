-- Rollback for 20261006_profiles_admin_view.sql.
-- The view holds no data and no app code reads it, so this is safe at any time.

drop view if exists public.profiles_admin;
