-- Weekly digest and Sunday reminder sender (2026-10-17).
--
-- Settings has let staff opt in to two emails since 2026-08-25, and the
-- confirmation email promises "every Monday morning" and "every Sunday
-- night", but nothing sent them. This adds the sender:
--
--   pg_cron (every 15 minutes, Sunday and Monday UTC)
--     -> pg_net POST https://servebyexample.co/api/cron/notifications
--        with the shared secret from Vault in the x-cron-secret header
--     -> the route works out what is due in Sydney time, claims a batch
--        here, sends through Brevo, and reports back.
--
-- The emails are built in the app (lib/notifications/), not here, so they
-- use the same branded shell as every other email.
--
-- 1. pg_cron and pg_net.
-- 2. notification_sends: one row per person, email and send day. It stops a
--    second send when runs overlap or retry, and records what went out.
-- 3. claim_notification_batch(): picks opted-in people not yet sent for the
--    day, claims them, and returns their address and week's numbers.
-- 4. finish_notification_batch(): marks the sent ones and releases the
--    failed ones so the next run retries them.
-- 5. The shared secret, created in Vault if missing. The same value must be
--    set as NOTIFICATIONS_SECRET in Cloudflare Pages (owner step, see
--    docs/handoff/2026-10-week4-handoff.md). It is never in this file.
-- 6. The cron job.
--
-- Safe to run before the code is live: until the route exists the job gets
-- a 404, and nobody is opted in until they switch a toggle on.
-- Rollback: supabase/rollbacks/20261017_notification_sender_rollback.sql

-- ── 1. Extensions ────────────────────────────────────────────────────────
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- ── 2. Send log ──────────────────────────────────────────────────────────
create table if not exists public.notification_sends (
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('weekly_digest', 'sunday_reminder')),
  -- The Sydney calendar day the email is for (a Monday or a Sunday).
  period     date not null,
  status     text not null default 'sending' check (status in ('sending', 'sent')),
  claimed_at timestamptz not null default now(),
  sent_at    timestamptz,
  primary key (user_id, kind, period)
);

comment on table public.notification_sends is
  'One row per person, notification email and send day. Written only by claim/finish_notification_batch(). A row left at sending means the run stopped mid-send; it is not retried, so nobody gets the same email twice.';

create index if not exists notification_sends_period_idx on public.notification_sends (kind, period);

-- Server only: no policies, so the anon and authenticated roles see nothing.
alter table public.notification_sends enable row level security;
revoke all on public.notification_sends from anon, authenticated;

-- ── 3. Claim a batch ─────────────────────────────────────────────────────
-- p_from and p_to are the Sydney days the numbers cover, inclusive.
create or replace function public.claim_notification_batch(
  p_kind   text,
  p_period date,
  p_from   date,
  p_to     date,
  p_limit  integer
)
returns table (
  user_id          uuid,
  email            text,
  display_name     text,
  days_trained     integer,
  quiz_answers     integer,
  quizzes_passed   integer,
  scenarios        integer,
  modules_mastered integer,
  reviews_due      integer
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if p_kind not in ('weekly_digest', 'sunday_reminder') then
    raise exception 'Unknown notification kind: %', p_kind;
  end if;

  return query
  with candidates as (
    select p.id
      from public.profiles p
      join auth.users u on u.id = p.id
     where (case p_kind when 'weekly_digest' then p.notif_weekly_digest else p.notif_reminders end)
       and u.email is not null
       and not exists (
         select 1 from public.notification_sends s
          where s.user_id = p.id and s.kind = p_kind and s.period = p_period
       )
     order by p.id
     limit greatest(least(p_limit, 500), 0)
  ),
  claimed as (
    insert into public.notification_sends (user_id, kind, period)
    select c.id, p_kind, p_period from candidates c
    on conflict do nothing
    returning notification_sends.user_id
  )
  select
    cl.user_id,
    u.email::text,
    p.display_name,
    coalesce(a.days_trained, 0)::integer,
    coalesce(a.quiz_answers, 0)::integer,
    coalesce(a.quizzes_passed, 0)::integer,
    coalesce(a.scenarios, 0)::integer,
    (select count(*) from public.scenario_mastery m
      where m.user_id = cl.user_id and m.scenario_type = 'quiz'
        and m.is_mastered and m.archived_at is null)::integer,
    -- Quiz rows are left out: a mastered quiz is stamped due straight away,
    -- so counting them would report every mastered module as a review.
    (select count(*) from public.scenario_mastery m
      where m.user_id = cl.user_id and m.scenario_type <> 'quiz'
        and m.archived_at is null and m.next_review_at <= now())::integer
  from claimed cl
  join auth.users u on u.id = cl.user_id
  join public.profiles p on p.id = cl.user_id
  left join lateral (
    select count(*) filter (where d.quiz_answers + d.quizzes_passed + d.scenarios + d.ai_scenarios > 0) as days_trained,
           sum(d.quiz_answers) as quiz_answers,
           sum(d.quizzes_passed) as quizzes_passed,
           sum(d.scenarios + d.ai_scenarios) as scenarios
      from public.training_activity_daily d
     where d.user_id = cl.user_id and d.day between p_from and p_to
  ) a on true;
end;
$$;

-- ── 4. Finish a batch ────────────────────────────────────────────────────
create or replace function public.finish_notification_batch(
  p_kind   text,
  p_period date,
  p_sent   uuid[],
  p_failed uuid[]
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.notification_sends
     set status = 'sent', sent_at = now()
   where kind = p_kind and period = p_period and user_id = any (coalesce(p_sent, '{}'));

  delete from public.notification_sends
   where kind = p_kind and period = p_period and status = 'sending'
     and user_id = any (coalesce(p_failed, '{}'));
$$;

revoke all on function public.claim_notification_batch(text, date, date, date, integer) from public, anon, authenticated;
revoke all on function public.finish_notification_batch(text, date, uuid[], uuid[]) from public, anon, authenticated;
grant execute on function public.claim_notification_batch(text, date, date, date, integer) to service_role;
grant execute on function public.finish_notification_batch(text, date, uuid[], uuid[]) to service_role;

-- ── 5. Shared secret ─────────────────────────────────────────────────────
-- Random, made here so it never passes through a file or a chat. Read it
-- once in the Supabase dashboard (Project Settings, Vault) to copy it into
-- Cloudflare Pages.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'notifications_cron_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'notifications_cron_secret',
      'x-cron-secret for /api/cron/notifications. Must match NOTIFICATIONS_SECRET in Cloudflare Pages.'
    );
  end if;
end;
$$;

-- ── 6. Cron job ──────────────────────────────────────────────────────────
-- Every 15 minutes on Sunday and Monday UTC. That covers Sunday evening and
-- Monday morning in Sydney in both AEST and AEDT; the route decides whether
-- anything is due, so most runs return at once.
select cron.unschedule('send-notification-emails')
 where exists (select 1 from cron.job where jobname = 'send-notification-emails');

select cron.schedule(
  'send-notification-emails',
  '*/15 * * * 0,1',
  $job$
  select net.http_post(
    url := 'https://servebyexample.co/api/cron/notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notifications_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $job$
);

-- Verify:
--   select jobname, schedule, active from cron.job;                          -- send-notification-emails, */15 * * * 0,1, true
--   select name from vault.secrets where name = 'notifications_cron_secret'; -- one row
--   select * from public.notification_sends limit 5;                          -- empty until a send
-- After a run:
--   select id, status_code, left(content::text, 200) from net._http_response order by id desc limit 5;
