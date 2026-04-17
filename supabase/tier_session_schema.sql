-- tier_session_schema.sql
-- Adds multi-tier support, session displacement, venue memberships,
-- and performance indexes for scaling to 100k+ users.

-- ══════════════════════════════════════════════════════════════
-- 1. Profiles Extension — tier + session tracking
-- ══════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists current_session_id uuid,
  add column if not exists tier text default 'free',
  add column if not exists manager_id uuid;

-- We cannot add a foreign key on manager_id to auth.users via
-- ALTER TABLE ADD CONSTRAINT IF NOT EXISTS (PG 15+ only).
-- Use DO block to safely skip if already present.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name  = 'profiles'
      and constraint_name = 'profiles_manager_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_manager_id_fkey
      foreign key (manager_id) references auth.users(id) on delete set null;
  end if;
end $$;

-- ══════════════════════════════════════════════════════════════
-- 2. Venue Memberships ("Sponsorship" table)
-- ══════════════════════════════════════════════════════════════

create table if not exists public.venue_memberships (
  id          uuid primary key default gen_random_uuid(),
  manager_id  uuid not null references auth.users(id) on delete cascade,
  staff_email text not null,
  venue_id    uuid references public.venues(id) on delete set null,
  status      text not null default 'invited'
    check (status in ('invited', 'active', 'removed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Unique within a manager — same staff email not invited twice
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where indexname = 'venue_memberships_manager_email_unique'
  ) then
    create unique index venue_memberships_manager_email_unique
      on public.venue_memberships(manager_id, staff_email);
  end if;
end $$;

alter table public.venue_memberships enable row level security;

drop policy if exists "Managers can manage their memberships" on public.venue_memberships;
create policy "Managers can manage their memberships"
  on public.venue_memberships for all
  using  (auth.uid() = manager_id)
  with check (auth.uid() = manager_id);

-- Staff can read their own membership row
drop policy if exists "Staff can read own membership" on public.venue_memberships;
create policy "Staff can read own membership"
  on public.venue_memberships for select
  using (staff_email = (select email from auth.users where id = auth.uid()));

-- ══════════════════════════════════════════════════════════════
-- 3. Performance Indexes
-- ══════════════════════════════════════════════════════════════

create index if not exists idx_profiles_session
  on public.profiles(current_session_id);

create index if not exists idx_profiles_tier
  on public.profiles(tier);

create index if not exists idx_profiles_stripe_customer
  on public.profiles(stripe_customer_id);

create index if not exists idx_memberships_email
  on public.venue_memberships(staff_email);

create index if not exists idx_memberships_manager
  on public.venue_memberships(manager_id);

create index if not exists idx_memberships_venue
  on public.venue_memberships(venue_id);

-- venue_staff lookups (management console)
create index if not exists idx_venue_staff_venue_id
  on public.venue_staff(venue_id);

create index if not exists idx_venue_staff_email
  on public.venue_staff(email);

-- scenario_mastery user lookups (already have user_module index, add user-only)
create index if not exists idx_scenario_mastery_user
  on public.scenario_mastery(user_id);

-- venues owner lookup
create index if not exists idx_venues_owner
  on public.venues(owner_user_id);
