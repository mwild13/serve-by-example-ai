-- ============================================================
-- Modules 21–40: War Room — High-Stakes Operational Skills
-- Run BEFORE 20260511_verify_quiz_questions_part2.sql
-- ============================================================

INSERT INTO modules (id, title, description, category, subcategory, difficulty_level, required_role, created_at, updated_at)
VALUES
  -- ===== CATEGORY: THE SURVIVAL INSTINCT (Safety & Flow) =====
  (21, 'The "Behind!" Rule: Spatial Awareness & Safety',
   'Vocal commands ("Behind!", "Corner!", "Coming through!") and the compressed walk required to move safely through a crowded venue without causing a collision or a tray drop.',
   'compliance', 'safety', 1, NULL, NOW(), NOW()),

  (22, 'The "Glass in Well" Emergency: The Burn Protocol',
   'How to identify a glass break in the ice well, execute the mandatory hot-water Burn Protocol, and why using a glass to scoop ice is the leading cause of contamination.',
   'compliance', 'safety', 1, NULL, NOW(), NOW()),

  (23, 'The Swivel Head: Identifying Needs from 10 Meters',
   'Train your eyes to constantly scan the room for dead soldiers, raised hands, and the lost look on a guest''s face — seeing the problem before the guest says a word.',
   'service', 'hospitality', 1, NULL, NOW(), NOW()),

  (24, 'Ice is Food: The Sacred Rules of the Scoop',
   'Ice is a food product. This covers the hygiene of the ice well: never using bare hands, the handle-up rule for scoops, and keeping the machine lid closed to prevent contamination.',
   'compliance', 'safety', 1, NULL, NOW(), NOW()),

  (25, 'The Allergy Shield: Communicating Dietary Danger',
   'The technical protocol for marking a ticket, verbally alerting the kitchen, and double-checking the plate before it reaches the table. No room for "I think it''s okay."',
   'compliance', 'safety', 2, NULL, NOW(), NOW()),

  -- ===== CATEGORY: THE MECHANICS OF THE RUSH (Speed) =====
  (26, 'The Soda Gun: Muscle Memory & Troubleshooting',
   'Learning the button layout by feel so you can pour without looking, clearing the warm line, and what to do when the bag-in-box syrup runs out mid-service.',
   'technical', 'bar', 2, NULL, NOW(), NOW()),

  (27, 'Economy of Motion: Two Hands, One Flow',
   'Expert bartenders move less, not faster. This teaches two-handed service — grabbing the glass with one hand while hitting the gun with the other — to eliminate dead time in every movement.',
   'technical', 'operations', 2, NULL, NOW(), NOW()),

  (28, 'The Mid-Shift Reload: Mise en Place Maintenance',
   'The rush isn''t over when the tickets stop. This teaches the 3-minute reload — replenishing citrus, ice, and glassware in the tiny windows of silence between waves.',
   'technical', 'operations', 2, NULL, NOW(), NOW()),

  (29, 'Deciphering the Docket: From Printer to Plate',
   'Train staff to instantly recognise POS abbreviations (M/R for Medium Rare, G/F for Gluten Free) and prioritise the order of operations from the moment a ticket prints.',
   'service', 'operations', 2, NULL, NOW(), NOW()),

  (30, 'Taming "The Weed": Mental Fortitude Under Pressure',
   'Being in the weed is hospitality''s term for overwhelmed. This is the psychological module: acknowledge every guest, work tickets in order, and remember — slow is smooth, smooth is fast.',
   'service', 'hospitality', 2, NULL, NOW(), NOW()),

  -- ===== CATEGORY: TECHNICAL MASTERY (The Pro Level) =====
  (31, 'The 30ml Truth: Precision vs. Profit',
   'Why the jigger is the most important tool for venue survival. Covers reading the meniscus, the financial impact of a heavy hand, and why every pour must be measured.',
   'compliance', 'operations', 2, NULL, NOW(), NOW()),

  (32, 'The Waiter''s Friend: Mechanical Wine Mastery',
   'A technical breakdown of the two-step lever system, cutting the foil below the lip, and the silent extraction of the cork — so no one ever struggles with a bottle in front of a guest.',
   'technical', 'wine', 3, NULL, NOW(), NOW()),

  (33, 'The Cellar Sprint: Kegs, Gas, and Gurgles',
   'When a beer fobs the bar stops. This covers changing a coupler safely, identifying an empty gas bottle, and clearing air from the line to restore the pour.',
   'technical', 'beer', 3, NULL, NOW(), NOW()),

  (34, 'Glassware Geometry: Weight, Balance, and Grip',
   'How to carry multiple glasses without a tray using the Pinch and the Stack — physical techniques to move high volumes of glassware safely without touching the rim.',
   'technical', 'service_skills', 2, NULL, NOW(), NOW()),

  (35, 'The Golden Standard Close: Cleaning for Tomorrow',
   'Venues are won or lost in the clean-down. A checklist-based module covering the coffee machine purge, speed rail sanitisation, and dry-store layout. A perfect close is the greatest gift to the morning shift.',
   'compliance', 'operations', 2, NULL, NOW(), NOW()),

  -- ===== CATEGORY: THE GUEST EXPERIENCE (The Art) =====
  (36, 'The Two-Minute Check: The Critical Window',
   'The most important moment in a meal. Timing the check-back to the guest''s first bite allows you to catch a cold steak or a missing sauce before the guest becomes frustrated.',
   'service', 'hospitality', 1, NULL, NOW(), NOW()),

  (37, 'The Pivot: Dealing with "No" and "Out of Stock"',
   'How to tell a guest you''re out of their favourite wine without it feeling like a failure. The Pivot — instantly suggesting a similar alternative — so the guest never feels let down.',
   'service', 'sales', 2, NULL, NOW(), NOW()),

  (38, 'The Dead Soldier: Clearing & Resetting the Battlefield',
   'An empty bottle on a table is a Dead Soldier. The art of pre-bussing: constantly removing clutter so the guest always feels they are in a clean, high-end environment.',
   'service', 'hospitality', 1, NULL, NOW(), NOW()),

  (39, 'Bar-Back Synergy: The Lifeblood of the Front',
   'For the bar back: how to be invisible — refilling ice and restocking from behind without disrupting the bartender. For the bartender: how to communicate needs before you run out.',
   'technical', 'operations', 2, NULL, NOW(), NOW()),

  (40, 'The Natural Upsell: Suggesting, Not Pushing',
   'Instead of "Do you want a large?", this teaches the Power of Three — suggesting a specific premium brand or complementary side dish that makes the guest feel cared for, not sold to.',
   'service', 'sales', 3, NULL, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;
