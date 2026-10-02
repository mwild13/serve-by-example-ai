-- ROLLBACK for supabase/migrations/20261003c_drop_elo_columns_and_legacy_tables.sql
--
-- Recreates the dropped columns and tables with their captured definitions
-- (2026-10-02): types, defaults, constraints, indexes, RLS policies and
-- grants. It does NOT restore data: Elo columns come back at their defaults,
-- and the two tables come back empty.

BEGIN;

ALTER TABLE public.scenario_mastery ADD COLUMN IF NOT EXISTS elo_rating integer NOT NULL DEFAULT 1200;
ALTER TABLE public.venue_staff      ADD COLUMN IF NOT EXISTS elo_rating integer DEFAULT 1200;
ALTER TABLE public.venue_staff      ADD COLUMN IF NOT EXISTS avg_module_elo integer DEFAULT 1200;
ALTER TABLE public.modules          ADD COLUMN IF NOT EXISTS min_elo_for_advanced integer DEFAULT 1500;

CREATE TABLE IF NOT EXISTS public.user_level_progress (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module           text NOT NULL,
  current_level    integer NOT NULL DEFAULT 1 CONSTRAINT user_level_progress_current_level_check CHECK (current_level >= 1 AND current_level <= 4),
  level1_score     integer NOT NULL DEFAULT 0,
  level1_completed boolean NOT NULL DEFAULT false,
  level2_score     integer NOT NULL DEFAULT 0,
  level2_completed boolean NOT NULL DEFAULT false,
  level3_score     integer NOT NULL DEFAULT 0,
  level3_completed boolean NOT NULL DEFAULT false,
  level4_unlocked  boolean NOT NULL DEFAULT false,
  last_active_at   timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_level_progress_user_id_module_key UNIQUE (user_id, module)
);
CREATE INDEX IF NOT EXISTS idx_user_level_progress_user_module ON public.user_level_progress (user_id, module);
ALTER TABLE public.user_level_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY level_progress_select_own ON public.user_level_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public.user_level_progress FROM anon, authenticated;
GRANT SELECT ON public.user_level_progress TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public._legacy_user_training_progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module              text NOT NULL CONSTRAINT user_training_progress_module_check CHECK (module = ANY (ARRAY['bartending'::text, 'sales'::text, 'management'::text])),
  scenarios_completed integer NOT NULL DEFAULT 0,
  total_score_points  integer NOT NULL DEFAULT 0,
  last_active_at      timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_training_progress_user_id_module_key UNIQUE (user_id, module)
);
ALTER TABLE public._legacy_user_training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY legacy_progress_select_own ON public._legacy_user_training_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE ALL ON public._legacy_user_training_progress FROM anon, authenticated;
GRANT SELECT ON public._legacy_user_training_progress TO anon, authenticated;

COMMIT;
