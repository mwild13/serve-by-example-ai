-- Home Screen installs. How to read them: docs/FUNNEL_METRICS.md.
--
-- Read-only. Run one query at a time in the Supabase SQL editor. Needs
-- supabase/migrations/20261101_app_installed_at.sql.
--
-- An install is counted the first time someone opens the app from their
-- Home Screen (POST /api/profile/app-installed). Weeks start on Monday,
-- Sydney time.


-- 1. Installs per week, by phone and browser.
select
  date_trunc('week', p.app_installed_at at time zone 'Australia/Sydney')::date as week_starting,
  p.app_install_platform as platform,
  count(*) as installs
from public.profiles p
where p.app_installed_at is not null
group by 1, 2
order by 1 desc, 3 desc;


-- 2. Share of accounts with the app on their Home Screen.
select
  count(*) filter (where p.app_installed_at is not null) as installed,
  count(*) as accounts,
  round(100.0 * count(*) filter (where p.app_installed_at is not null) / nullif(count(*), 0), 1) as percent
from public.profiles p
join auth.users u on u.id = p.id
where u.last_sign_in_at is not null;
