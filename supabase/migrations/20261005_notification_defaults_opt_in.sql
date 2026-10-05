-- Make notification emails genuinely opt-in (found 2026-10-05).
--
-- Since 2026-08-25 the app treats both notification emails as opt-in, but the
-- profiles columns still default to true, so every new account was created
-- opted in. On 2026-10-05: 88 of 90 profiles had both flags on, including
-- all 82 created after the policy. The app's `?? false` fallbacks never
-- fired because the DB never leaves the columns null.
--
-- No digest or reminder sender exists yet, so no unconsented email has gone
-- out. This must be fixed before one is built (Spam Act 2003: consent has to
-- be something the person did).
--
-- 1. Defaults -> false, so new accounts start opted out.
-- 2. Reset existing rows to false. A row set to true by the old default can't
--    be told apart from one the person switched on, and opt-in consent has
--    to be shown, so everyone starts from off. People who want the emails
--    switch them on again in Settings. Brevo contacts are left alone: no
--    send reads them yet, and the next toggle syncs them.
--
-- notif_achievement_alerts is unused (removed from the app 2026-08-25); its
-- default is corrected too so the column isn't misleading.
--
-- Safe to apply before or after the code on preview/oct-w1-phase1.
-- Rollback: supabase/rollbacks/20261005_notification_defaults_opt_in_rollback.sql
-- (restores the defaults only; the reset values can't be restored).

alter table public.profiles
  alter column notif_reminders set default false,
  alter column notif_weekly_digest set default false,
  alter column notif_achievement_alerts set default false;

update public.profiles
   set notif_reminders = false,
       notif_weekly_digest = false,
       updated_at = now()
 where notif_reminders or notif_weekly_digest;

-- Verify:
--   SELECT column_name, column_default FROM information_schema.columns
--    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name LIKE 'notif%';  -- all false
--   SELECT count(*) FROM profiles WHERE notif_reminders OR notif_weekly_digest;                 -- 0
