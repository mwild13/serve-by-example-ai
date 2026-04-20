-- ─────────────────────────────────────────────────────────────
-- scaffolded_learning_schema.sql
-- 4-Level Scaffolded Learning + 101 Knowledge Base
-- Run this in the Supabase SQL editor after mastery_schema.sql
-- ─────────────────────────────────────────────────────────────

-- ── Learning Content (101 Knowledge Base) ────────────────────
-- Stores categorized reference material for Spirits, Beer, Wine,
-- Cocktails, and Non-Alcoholic knowledge.
create table if not exists public.learning_content (
  id           uuid primary key default gen_random_uuid(),
  category     text not null check (category in ('spirits', 'beer', 'wine', 'cocktails', 'non-alcoholic')),
  sub_category text not null,                           -- e.g. 'Vodka', 'Gin', 'Bourbon', 'IPA', 'Chardonnay'
  title        text not null,                           -- e.g. 'What is Bourbon?'
  content_body text not null,                           -- Rich text / markdown content
  tags         text[] not null default '{}',            -- Tags for recommender matching
  sort_order   integer not null default 0,              -- Display ordering within sub-category
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.learning_content enable row level security;

-- All authenticated users can read learning content
create policy "Anyone can read learning content"
  on public.learning_content
  for select
  using (true);

create index if not exists idx_learning_content_category
  on public.learning_content(category);

create index if not exists idx_learning_content_tags
  on public.learning_content using gin(tags);

-- ── User Level Progress ──────────────────────────────────────
-- Tracks which scaffolded level (1-4) each user has reached per module.
-- Level 1: Rapid-Fire Quiz (Recall)
-- Level 2: Descriptor Selection (Application)
-- Level 3: Advanced Descriptors (Advanced Application)
-- Level 4: Role-play Scenario (Synthesis)
create table if not exists public.user_level_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  module               text not null check (module in ('bartending', 'sales', 'management')),
  current_level        integer not null default 1 check (current_level between 1 and 4),
  level1_score         integer not null default 0,      -- consecutive correct count for L1
  level1_completed     boolean not null default false,
  level2_score         integer not null default 0,      -- correct count for L2
  level2_completed     boolean not null default false,
  level3_score         integer not null default 0,      -- correct count for L3
  level3_completed     boolean not null default false,
  level4_unlocked      boolean not null default false,
  last_active_at       timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique(user_id, module)
);

alter table public.user_level_progress enable row level security;

create policy "Users can manage own level progress"
  on public.user_level_progress
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_level_progress_user_module
  on public.user_level_progress(user_id, module);

-- ── Add skill_level to venue_staff for management control ────
alter table public.venue_staff
  add column if not exists skill_level integer not null default 1 check (skill_level between 1 and 10);
