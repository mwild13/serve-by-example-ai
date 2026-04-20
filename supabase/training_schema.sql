-- ─────────────────────────────────────────────────────────────
-- training_schema.sql
-- Run this in the Supabase SQL editor after management_schema.sql
-- ─────────────────────────────────────────────────────────────

-- Per-user training progress (owned by the staff/trainee user)
create table if not exists public.user_training_progress (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  module              text not null check (module in ('bartending', 'sales', 'management')),
  scenarios_completed integer not null default 0,
  total_score_points  integer not null default 0,   -- sum of overallScore values (0–25 each)
  last_active_at      timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id, module)
);

alter table public.user_training_progress enable row level security;

create policy "Users can manage own training progress"
  on public.user_training_progress
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Link venue_staff records to actual Supabase user accounts so
-- training progress can flow back to the management console.
-- ON DELETE SET NULL: keeps the staff row (historical data) but clears
-- the auth link when the user account is deleted.
alter table public.venue_staff
  add column if not exists staff_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_venue_staff_staff_user_id on public.venue_staff(staff_user_id);
create index if not exists idx_venue_staff_email         on public.venue_staff(email);
