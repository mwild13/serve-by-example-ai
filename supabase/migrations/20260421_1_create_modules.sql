-- Phase 1: Create modules table
-- Stores metadata for all 20 learning modules

CREATE TABLE IF NOT EXISTS modules (
  id INT PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('technical', 'service', 'compliance')),
  subcategory TEXT,
  difficulty_level INT DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  recommended_prereq_ids INT[],
  required_role TEXT,
  min_elo_for_advanced INT DEFAULT 1500,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_title ON modules(title);

-- Seed all 20 modules
INSERT INTO modules (id, title, description, category, subcategory, difficulty_level, required_role, created_at, updated_at)
VALUES
  -- TECHNICAL SKILLS (1-7)
  (1, 'Pouring the Perfect Beer', 'Master beer pouring techniques—angle, head ratio, temperature, glassware matching.', 'technical', 'beer', 2, NULL, NOW(), NOW()),
  (2, 'Wine Knowledge & Service', 'Wine classification, tasting notes, pairing, service temperature, proper pouring, upselling.', 'technical', 'wine', 3, NULL, NOW(), NOW()),
  (3, 'Cocktail Fundamentals', 'Cocktail technique, measurement, spirit knowledge, classic recipes, garnish, riffing.', 'technical', 'cocktails', 3, NULL, NOW(), NOW()),
  (4, 'Coffee/Barista Basics', 'Espresso extraction, milk steaming, latte/cappuccino ratios, grind consistency, temperature, customer preferences.', 'technical', 'coffee', 2, NULL, NOW(), NOW()),
  (5, 'Carrying Glassware & Trays', 'Proper grip, balance, tray technique, weight distribution, spill prevention, safe handling under pressure.', 'technical', 'service_skills', 1, NULL, NOW(), NOW()),
  (6, 'Cleaning & Sanitation', 'Health code compliance, cleaning schedules, proper sanitizer use, food safety, preventing contamination, speed cleaning.', 'technical', 'operations', 1, NULL, NOW(), NOW()),
  (7, 'Bar Back Efficiency', 'Stock management, ice production, supply chain, backup support during rush, coordinating with bartenders, anticipating needs.', 'technical', 'operations', 2, NULL, NOW(), NOW()),

  -- SERVICE SKILLS (8-14)
  (8, 'The Art of the Greeting', 'First impression, warmth, tone of voice, body language, speed of greeting, personalization, anticipating needs.', 'service', 'hospitality', 1, NULL, NOW(), NOW()),
  (9, 'Managing Table Dynamics', 'Reading table mood, handling different personalities, managing conflicts, keeping table energized, group dining, hosting.', 'service', 'hospitality', 3, NULL, NOW(), NOW()),
  (10, 'Anticipatory Service', 'Predicting guest needs, proactive service, refills, timing of checks, reading gestures, surprise moments, upselling naturally.', 'service', 'hospitality', 2, NULL, NOW(), NOW()),
  (11, 'Handling Guest Complaints', 'Listening without defensiveness, empathy, problem-solving, compensation authority, service recovery, turning negative to positive.', 'service', 'hospitality', 3, NULL, NOW(), NOW()),
  (12, 'Up-selling & Suggestive Sales', 'Reading guest interests, natural recommendations, suggestive selling without pressure, premium options, knowledge-based pitches, increasing check average.', 'service', 'sales', 2, NULL, NOW(), NOW()),
  (13, 'VIP/Table Management', 'Recognizing VIPs, premium service protocols, special requests, executive table assignments, loyalty building, handling high expectations.', 'service', 'hospitality', 3, NULL, NOW(), NOW()),
  (14, 'Phone Etiquette & Reservations', 'Professional phone voice, reservation taking, handling difficult requests, confirming details, managing no-shows, upselling over the phone.', 'service', 'operations', 2, NULL, NOW(), NOW()),

  -- COMPLIANCE & OPERATIONS (15-20)
  (15, 'RSA (Responsible Service of Alcohol)', 'Legal responsibilities, signs of intoxication, refusing service, intervention, driving under influence, liability, age verification.', 'compliance', 'safety', 2, NULL, NOW(), NOW()),
  (16, 'Food Safety & Hygiene', 'Temperature control, cross-contamination, allergen awareness, handwashing, HACCP principles, storage, reporting issues.', 'compliance', 'safety', 2, NULL, NOW(), NOW()),
  (17, 'Conflict De-escalation', 'Reading tension early, verbal de-escalation, body language, conflict resolution, involving security/manager, safety first.', 'compliance', 'safety', 3, NULL, NOW(), NOW()),
  (18, 'Emergency Evacuation Protocols', 'Fire evacuation, emergency exits, assembly points, assisting guests with disabilities, communication, post-emergency procedures.', 'compliance', 'safety', 1, NULL, NOW(), NOW()),
  (19, 'Opening & Closing Procedures', 'Pre-service setup, inventory, equipment checks, cash handling, closing checklists, cleaning, securing venue, handoff to next shift.', 'compliance', 'operations', 2, NULL, NOW(), NOW()),
  (20, 'Inventory & Waste Control', 'Inventory management, usage tracking, waste reduction, cost control, stock rotation, par levels, ordering, preventing theft.', 'compliance', 'operations', 2, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify insert
SELECT COUNT(*) as total_modules FROM modules;
