-- To-do 2026-10-02 (Phase 1): bring back public.toolkit_leads so /toolkit
-- signups are persisted.
--
-- History: 20260610_toolkit_leads.sql created this table, but no code wrote
-- to it at the time it was audited, so phase4_drop_dead_tables (applied
-- 2026-07-19) dropped it as dead, and the capture route was cut down to
-- "send email, discard the id". Every signup since then exists only in Brevo's
-- send log.
--
-- Apply BEFORE deploying the new app/api/toolkit-capture route: that route
-- writes the lead first and returns 500 if the insert fails.
--
-- Columns added over the 2026-06-10 shape:
--   delivered_at     set when Brevo accepts the delivery email. Rows with
--                    toolkit_delivered = false are signups whose email failed
--                    and can be re-sent.
--   opened_at        first click through /api/toolkit-open.
--   unsubscribed_at  set by /api/unsubscribe. Any future nurture send must
--                    skip rows where this is not null (Spam Act 2003).
--
-- Access: service role only. RLS on with no policies, plus explicit revokes,
-- so anon/authenticated can't read the lead list even through PostgREST.
--
-- Rollback: supabase/rollbacks/20261004b_toolkit_leads_rollback.sql

create table if not exists public.toolkit_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  role text not null,
  utm_campaign text,
  toolkit_delivered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.toolkit_leads
  add column if not exists delivered_at timestamptz,
  add column if not exists opened_at timestamptz,
  add column if not exists unsubscribed_at timestamptz;

-- Emails are stored lowercased by the route; enforce it so a manual insert
-- can't create a case-variant duplicate that bypasses the unique index.
alter table public.toolkit_leads
  drop constraint if exists toolkit_leads_email_lowercase,
  add constraint toolkit_leads_email_lowercase check (email = lower(email));

alter table public.toolkit_leads enable row level security;
drop policy if exists "Service role only" on public.toolkit_leads;
revoke all on public.toolkit_leads from anon, authenticated;

-- Verify:
--   SELECT column_name FROM information_schema.columns
--    WHERE table_schema = 'public' AND table_name = 'toolkit_leads';
--   SELECT has_table_privilege('anon', 'public.toolkit_leads', 'SELECT');  -- false
