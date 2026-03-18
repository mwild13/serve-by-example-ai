-- pending_invites table
-- Stores generated invite links so managers can share them if email delivery fails.
-- Run this in Supabase SQL Editor once.

create table if not exists public.pending_invites (
  id               uuid        primary key default gen_random_uuid(),
  manager_user_id  uuid        not null references auth.users(id) on delete cascade,
  venue_id         uuid        references public.venues(id) on delete set null,
  staff_name       text        not null,
  email            text        not null,
  invite_link      text        not null,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '7 days'),
  used_at          timestamptz
);

alter table public.pending_invites enable row level security;

-- Managers can see and delete their own pending invites
create policy "Managers manage their pending invites"
  on public.pending_invites
  for all
  using  (auth.uid() = manager_user_id)
  with check (auth.uid() = manager_user_id);
