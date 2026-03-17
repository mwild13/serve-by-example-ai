create extension if not exists pgcrypto;

create sequence if not exists public.venue_code_seq
  start with 120
  increment by 1
  minvalue 120;

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  venue_code integer unique default nextval('public.venue_code_seq'),
  name text not null,
  venue_type text default 'Cocktail bar + dining',
  staff_limit integer default 25,
  manager_permissions text default '2 managers, 1 supervisor admin',
  completion_rate integer default 0,
  avg_scenario_score integer default 0,
  upsell_rate integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venue_staff (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  manager_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  role text not null,
  progress integer not null default 0,
  service_score integer not null default 0,
  sales_score integer not null default 0,
  product_score integer not null default 0,
  last_active_at timestamptz,
  status text not null default 'on-track',
  strengths text[] not null default '{}',
  improvements text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.venue_staff add column if not exists email text;

create table if not exists public.training_programs (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  manager_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role_target text not null,
  description text not null,
  completion integer not null default 0,
  day_plan text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venue_inventory_items (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  manager_user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.venues add column if not exists venue_code integer;
alter table public.venues alter column venue_code set default nextval('public.venue_code_seq');
update public.venues
set venue_code = nextval('public.venue_code_seq')
where venue_code is null;

create unique index if not exists venues_venue_code_key on public.venues(venue_code);

alter table public.profiles
  add column if not exists management_unlocked boolean default false;

alter table public.profiles
  add column if not exists is_founders_user boolean default false;

alter table public.profiles
  add column if not exists stripe_customer_id text;

alter table public.venues enable row level security;
alter table public.venue_staff enable row level security;
alter table public.training_programs enable row level security;
alter table public.venue_inventory_items enable row level security;

drop policy if exists "Managers can manage their venues" on public.venues;
create policy "Managers can manage their venues"
on public.venues
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "Managers can manage venue staff" on public.venue_staff;
create policy "Managers can manage venue staff"
on public.venue_staff
for all
using (auth.uid() = manager_user_id)
with check (auth.uid() = manager_user_id);

drop policy if exists "Managers can manage training programs" on public.training_programs;
create policy "Managers can manage training programs"
on public.training_programs
for all
using (auth.uid() = manager_user_id)
with check (auth.uid() = manager_user_id);

drop policy if exists "Managers can manage inventory items" on public.venue_inventory_items;
create policy "Managers can manage inventory items"
on public.venue_inventory_items
for all
using (auth.uid() = manager_user_id)
with check (auth.uid() = manager_user_id);