-- ============================================================
-- Shorten all 40 module titles to 2-3 words.
-- Date: 2026-08-24
--
-- Why: the Learn Hub's "All Modules" grid needs to go to 2 columns on
-- mobile, and the Practice & Scenarios tiles truncate to a single line —
-- both were unreadable with the old titles (some ran 40-56 characters,
-- e.g. `Taming "The Weed": Mental Fortitude Under Pressure`). Full mapping
-- reviewed and approved in docs/Module-Title-Renames-Proposal.md.
--
-- `modules.title` has a UNIQUE constraint (20260421_1_create_modules.sql)
-- — every new title below was checked against the full new set for
-- collisions before this migration was written.
-- ============================================================

BEGIN;

UPDATE modules SET title = 'Beer Pouring',           updated_at = NOW() WHERE id = 1;
UPDATE modules SET title = 'Wine Service',            updated_at = NOW() WHERE id = 2;
UPDATE modules SET title = 'Cocktail Fundamentals',   updated_at = NOW() WHERE id = 3;
UPDATE modules SET title = 'Barista Basics',          updated_at = NOW() WHERE id = 4;
UPDATE modules SET title = 'Tray Carrying',           updated_at = NOW() WHERE id = 5;
UPDATE modules SET title = 'Sanitation Basics',       updated_at = NOW() WHERE id = 6;
UPDATE modules SET title = 'Bar-Back Efficiency',     updated_at = NOW() WHERE id = 7;
UPDATE modules SET title = 'The Greeting',            updated_at = NOW() WHERE id = 8;
UPDATE modules SET title = 'Table Dynamics',          updated_at = NOW() WHERE id = 9;
UPDATE modules SET title = 'Anticipatory Service',    updated_at = NOW() WHERE id = 10;
UPDATE modules SET title = 'Guest Complaints',        updated_at = NOW() WHERE id = 11;
UPDATE modules SET title = 'Suggestive Selling',      updated_at = NOW() WHERE id = 12;
UPDATE modules SET title = 'VIP Management',          updated_at = NOW() WHERE id = 13;
UPDATE modules SET title = 'Phone Etiquette',         updated_at = NOW() WHERE id = 14;
UPDATE modules SET title = 'RSA Compliance',          updated_at = NOW() WHERE id = 15;
UPDATE modules SET title = 'Food Safety',             updated_at = NOW() WHERE id = 16;
UPDATE modules SET title = 'Conflict De-escalation',  updated_at = NOW() WHERE id = 17;
UPDATE modules SET title = 'Evacuation Protocols',    updated_at = NOW() WHERE id = 18;
UPDATE modules SET title = 'Opening & Closing',       updated_at = NOW() WHERE id = 19;
UPDATE modules SET title = 'Inventory Control',       updated_at = NOW() WHERE id = 20;

UPDATE modules SET title = 'Call Behind',             updated_at = NOW() WHERE id = 21;
UPDATE modules SET title = 'Ice Well Burn',           updated_at = NOW() WHERE id = 22;
UPDATE modules SET title = 'The Swivel Head',         updated_at = NOW() WHERE id = 23;
UPDATE modules SET title = 'Ice Is Food',             updated_at = NOW() WHERE id = 24;
UPDATE modules SET title = 'Allergy Shield',          updated_at = NOW() WHERE id = 25;
UPDATE modules SET title = 'Soda Gun Speed',          updated_at = NOW() WHERE id = 26;
UPDATE modules SET title = 'Two-Handed Flow',         updated_at = NOW() WHERE id = 27;
UPDATE modules SET title = 'Mid-Shift Reset',         updated_at = NOW() WHERE id = 28;
UPDATE modules SET title = 'Docket Reading',          updated_at = NOW() WHERE id = 29;
UPDATE modules SET title = 'Beating the Weed',        updated_at = NOW() WHERE id = 30;
UPDATE modules SET title = 'Jigger Precision',        updated_at = NOW() WHERE id = 31;
UPDATE modules SET title = 'Wine Opener Mastery',     updated_at = NOW() WHERE id = 32;
UPDATE modules SET title = 'Cellar & Kegs',           updated_at = NOW() WHERE id = 33;
UPDATE modules SET title = 'Tray & Glass Grip',       updated_at = NOW() WHERE id = 34;
UPDATE modules SET title = 'The Clean Close',         updated_at = NOW() WHERE id = 35;
UPDATE modules SET title = 'Two-Minute Check',        updated_at = NOW() WHERE id = 36;
UPDATE modules SET title = 'The Out-of-Stock Pivot',  updated_at = NOW() WHERE id = 37;
UPDATE modules SET title = 'Clearing Dead Soldiers',  updated_at = NOW() WHERE id = 38;
UPDATE modules SET title = 'Bar-Back Synergy',        updated_at = NOW() WHERE id = 39;
UPDATE modules SET title = 'Natural Upselling',       updated_at = NOW() WHERE id = 40;

COMMIT;
