-- ─────────────────────────────────────────────────────────────
-- mastery_schema.sql
-- Run this in the Supabase SQL editor after training_schema.sql
-- Adds per-scenario mastery tracking, spaced repetition,
-- Elo ratings, and confidence-accuracy matrix support.
-- ─────────────────────────────────────────────────────────────

-- Per-user, per-scenario mastery tracking
create table if not exists public.scenario_mastery (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  module               text not null check (module in ('bartending', 'sales', 'management')),
  scenario_index       integer not null,              -- 0-based index within the module
  mastery_level        integer not null default 0,    -- 0: unstarted, 1: seen, 2: practiced, 3: mastered
  consecutive_correct  integer not null default 0,    -- resets on incorrect
  total_attempts       integer not null default 0,
  total_score_points   integer not null default 0,    -- sum of all overallScore values for this scenario
  best_score           integer not null default 0,    -- highest overallScore achieved
  last_score           integer not null default 0,    -- most recent overallScore
  last_attempt_at      timestamptz,
  next_review_at       timestamptz default now(),     -- spaced repetition: when to resurface
  elo_rating           integer not null default 1200, -- staff skill rating for this module category
  last_confidence      text check (last_confidence in ('low', 'medium', 'high')),
  high_confidence_incorrect integer not null default 0, -- count of high confidence + wrong answers
  low_confidence_correct    integer not null default 0, -- count of low confidence + correct answers
  consecutive_fails    integer not null default 0,    -- for bridge logic (resets on correct)
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique(user_id, module, scenario_index)
);

alter table public.scenario_mastery enable row level security;

create policy "Users can manage own scenario mastery"
  on public.scenario_mastery
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes for efficient querying
create index if not exists idx_scenario_mastery_user_module
  on public.scenario_mastery(user_id, module);

create index if not exists idx_scenario_mastery_review
  on public.scenario_mastery(user_id, next_review_at);

-- Add mastery-related columns to venue_staff for management dashboard
alter table public.venue_staff
  add column if not exists mastery_status text default 'not-started',
  add column if not exists elo_rating integer default 1200,
  add column if not exists knowledge_decay_risk boolean default false,
  add column if not exists high_confidence_incorrect_ratio real default 0,
  add column if not exists scenarios_mastered integer default 0,
  add column if not exists scenarios_attempted integer default 0;
