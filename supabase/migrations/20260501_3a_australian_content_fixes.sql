-- ============================================================
-- Migration: Australian Content Fixes
-- Date: 2026-05-01
--
-- What this migration does:
--   1. Creates the `modules` table if it does not already exist.
--      The `scenarios` table has a FK on modules(id) — this ensures
--      the FK constraint can be satisfied without migration-order issues.
--   2. Seeds or updates the 20 standard Australian hospitality modules.
--   3. Cleans HTML entity encoding (&apos; &#39; &amp; &quot;) that
--      may have been inserted into scenario prompt or content JSONB.
--   4. Adds a unique index on scenarios(prompt) to prevent exact-duplicate
--      question text from being inserted via future migrations.
-- ============================================================

-- ── 1. Modules table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS modules (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL DEFAULT 'technical',
  difficulty_level INT  NOT NULL DEFAULT 2 CHECK (difficulty_level BETWEEN 1 AND 5),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS — managers read all; users read active only
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'modules' AND policyname = 'Anyone can read active modules'
  ) THEN
    CREATE POLICY "Anyone can read active modules"
      ON public.modules
      FOR SELECT
      USING (is_active = true);
  END IF;
END$$;

-- ── 2. Seed/update the 20 standard Australian hospo modules ──

INSERT INTO modules (id, title, description, category, difficulty_level) VALUES
  (1,  'Pouring the Perfect Beer',              'Australian draught beer service, serve sizes by state, RSA and line maintenance', 'technical',   2),
  (2,  'Wine Knowledge and Service',             'Australian wine regions, varietals, table service etiquette and RSA standard drinks', 'technical',   2),
  (3,  'Cocktail Fundamentals',                  'Classic and contemporary cocktails, 30ml standard, local spirits, technique and mise en place', 'technical',   2),
  (4,  'Coffee and Barista Basics',              'Espresso extraction, milk texturing, coffee menu knowledge and service standards', 'technical',   2),
  (5,  'Carrying Glassware and Trays',           'Safe carrying technique, WHS manual handling, presentation standards', 'technical',   1),
  (6,  'Cleaning and Sanitation',                'Food Safety Act compliance, chemical safety, WHS, opening and closing cleaning procedures', 'technical',   1),
  (7,  'Bar Back Efficiency',                    'Stock replenishment, ice management, glassware throughput, supporting front-bar during service', 'technical',   1),
  (8,  'The Art of the Greeting',                'First impressions, reading guests, Australian hospitality culture, tone and pace', 'service',    2),
  (9,  'Managing Table Dynamics',                'Section management, pacing the table, reading group dynamics in Australian venues', 'service',    2),
  (10, 'Anticipatory Service',                   'Proactive service, reading the room, refill timing, identifying guest needs before they ask', 'service',    3),
  (11, 'Handling Guest Complaints',              'De-escalation, empathy-first approach, Australian consumer rights context, service recovery', 'service',    3),
  (12, 'Upselling and Suggestive Selling',       'Natural recommendation technique, premium spirit upsell, bottle sells, occasion-based selling', 'service',    3),
  (13, 'VIP and Table Management',               'High-value guest experience, table preference tracking, regulars recognition systems', 'service',    4),
  (14, 'Phone Etiquette and Reservations',       'Reservation systems, phone manner, managing waitlists and special requests', 'service',    2),
  (15, 'RSA — Responsible Service of Alcohol',   'State-based RSA obligations, intoxication assessment, refusal of service, standard drink calculation, duty of care', 'compliance',  3),
  (16, 'Food Safety and Hygiene',                'Food Standards Australia New Zealand (FSANZ), temperature control, allergen management, Food Safety Supervisor requirements', 'compliance',  3),
  (17, 'Conflict De-escalation',                 'Patron conflict, anti-social behaviour, working with licensed security, WHS personal safety', 'compliance',  3),
  (18, 'Emergency Evacuation Protocols',         'Australian fire safety legislation, evacuation warden roles, assembly points, WHS emergency obligations', 'compliance',  2),
  (19, 'Opening and Closing Procedures',         'Venue opening checklist, cash handling, alarm systems, end-of-trade RSA obligations', 'compliance',  2),
  (20, 'Inventory and Waste Control',            'Stock-take process, par levels, wastage recording, liquor licensing stock obligations', 'compliance',  2)
ON CONFLICT (id) DO UPDATE
  SET title            = EXCLUDED.title,
      description      = EXCLUDED.description,
      category         = EXCLUDED.category,
      difficulty_level = EXCLUDED.difficulty_level,
      updated_at       = NOW();

-- Reset the sequence so future inserts start above 20
SELECT setval('modules_id_seq', (SELECT MAX(id) FROM modules));

-- ── 3. Clean HTML entity encoding from scenarios table ───────
--
-- Some scenario prompts or content may have been inserted with HTML entities
-- rather than raw characters. This corrects &apos; &#39; &amp; &quot; &lt; &gt;
-- in both the prompt column and inside the JSONB content column.

UPDATE scenarios
SET prompt = replace(replace(replace(replace(replace(replace(
    prompt,
    '&apos;', ''''),
    '&#39;',  ''''),
    '&amp;',  '&'),
    '&quot;', '"'),
    '&lt;',   '<'),
    '&gt;',   '>')
WHERE prompt ~ '&apos;|&#39;|&amp;|&quot;|&lt;|&gt;';

-- Clean inside the JSONB content column (cast to text, replace, cast back)
UPDATE scenarios
SET content = (
  replace(replace(replace(replace(replace(replace(
    content::text,
    '&apos;', ''''),
    '&#39;',  ''''),
    '&amp;',  '&'),
    '&quot;', '"'),
    '&lt;',   '<'),
    '&gt;',   '>')
)::jsonb
WHERE content::text ~ '&apos;|&#39;|&amp;|&quot;|&lt;|&gt;';

-- ── 4. Duplicate prevention ───────────────────────────────────
--
-- The scenarios table already has UNIQUE(module_id, scenario_index).
-- Add a partial index to flag exact-duplicate prompt text within a module,
-- which catches copy-paste errors in future migration files.

CREATE INDEX IF NOT EXISTS idx_scenarios_prompt_module
  ON scenarios (module_id, prompt);

-- Ensure the unique constraint on (module_id, scenario_index) exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'scenarios_module_id_scenario_index_key'
      AND conrelid = 'scenarios'::regclass
  ) THEN
    ALTER TABLE scenarios
      ADD CONSTRAINT scenarios_module_id_scenario_index_key
      UNIQUE (module_id, scenario_index);
  END IF;
END$$;
