-- Expand L2 descriptor questions to 6 per module.
-- All modules currently have 2-4 L2 scenarios; this brings them to 6.
-- Uses ON CONFLICT DO NOTHING so this migration is safe to re-run.

-- ===== MODULE 1: POURING THE PERFECT BEER (add 3 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(1, 20, 'descriptor_l2', 'A guest wants a recommendation after only ever drinking lagers. Which two styles are the safest "next step"?',
  jsonb_build_object('prompt', 'A guest wants a recommendation after only ever drinking lagers. Which two styles are the safest "next step"?', 'descriptors', ARRAY['Session ale — light body, easy-drinking', 'Wheat beer (Hefeweizen) — soft and slightly fruity', 'Imperial Stout — very dark, high ABV', 'Sour/Gose — tart and unusual', 'Barleywine — very strong and complex'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Session ales and wheat beers are closest to lager in body and approachability — ideal for first-timers exploring new styles.'),
  2, ARRAY['beer', 'styles', 'recommendations']),
(1, 21, 'descriptor_l2', 'A customer''s beer smells and tastes "skunky". Which two causes are most likely?',
  jsonb_build_object('prompt', 'A customer''s beer smells and tastes "skunky". Which two causes are most likely?', 'descriptors', ARRAY['Beer was exposed to direct sunlight or UV light', 'Beer is past its best-before date', 'Beer was poured at the wrong angle', 'The glass was not rinsed before pouring', 'The head was too large'], 'correctIndices', ARRAY[0, 1], 'explanation', 'UV light exposure and oxidation from age are the classic causes of skunky off-flavour in beer. Swap the product immediately.'),
  2, ARRAY['beer', 'quality', 'faults']),
(1, 22, 'descriptor_l2', 'When cleaning draft beer lines, which two practices maintain beer quality?',
  jsonb_build_object('prompt', 'When cleaning draft beer lines, which two practices maintain beer quality?', 'descriptors', ARRAY['Clean lines weekly using an approved chemical solution', 'Flush thoroughly with clean water after every chemical clean', 'Only clean when beer taste noticeably changes', 'Use household bleach for a stronger clean', 'Skip cleaning if beer is selling quickly enough'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Weekly line cleaning with the correct chemical and a thorough water flush prevents bacterial build-up and off-flavours.'),
  2, ARRAY['beer', 'lines', 'maintenance'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 2: WINE KNOWLEDGE & SERVICE (add 2 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(2, 20, 'descriptor_l2', 'A guest says they want a red wine that''s "smooth and not too tannic". Which two styles fit best?',
  jsonb_build_object('prompt', 'A guest says they want a red wine that''s "smooth and not too tannic". Which two styles fit best?', 'descriptors', ARRAY['Pinot Noir — light tannins, silky finish', 'Merlot — soft, round, low-astringency', 'Cabernet Sauvignon — firm, grippy tannins', 'Barolo — highly tannic, needs aging', 'Amarone — rich, powerful, high tannin'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Pinot Noir and Merlot are classic low-tannin choices. Cab, Barolo, and Amarone are all high-tannin wines that would disappoint this guest.'),
  2, ARRAY['wine', 'red', 'recommendations']),
(2, 21, 'descriptor_l2', 'A guest''s white wine arrives too warm from the cellar. Which two fixes work without compromising wine quality?',
  jsonb_build_object('prompt', 'A guest''s white wine arrives too warm from the cellar. Which two fixes work without compromising wine quality?', 'descriptors', ARRAY['Place the bottle in an ice bucket with water and ice for 10 minutes', 'Apologise and fetch a correctly chilled bottle from the fridge', 'Add ice cubes directly to the guest''s glass', 'Pour the wine over ice in a new glass', 'Serve it anyway and hope they don''t notice'], 'correctIndices', ARRAY[0, 1], 'explanation', 'An ice bucket quickly chills a bottle without dilution. Offering a fresh chilled bottle is the best service recovery. Adding ice directly dilutes the wine and changes its character.'),
  2, ARRAY['wine', 'temperature', 'service-recovery'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 3: COCKTAIL FUNDAMENTALS (add 2 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(3, 20, 'descriptor_l2', 'A guest says their cocktail is "too sweet". Which two adjustments bring it back into balance?',
  jsonb_build_object('prompt', 'A guest says their cocktail is "too sweet". Which two adjustments bring it back into balance?', 'descriptors', ARRAY['Add a small amount of fresh citrus juice to increase acidity', 'Reduce the sweetener in the next pour', 'Add more spirit to overpower the sweetness', 'Add more ice to dilute it further', 'Change the glassware'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Sweetness and acidity are the two key levers in cocktail balance. Adding citrus or reducing sweetener directly corrects the flavour profile.'),
  2, ARRAY['cocktails', 'balance', 'technique']),
(3, 21, 'descriptor_l2', 'Which two items must always be freshly prepped at the start of a cocktail shift?',
  jsonb_build_object('prompt', 'Which two items must always be freshly prepped at the start of a cocktail shift?', 'descriptors', ARRAY['Fresh-squeezed citrus juices', 'Garnishes — mint, citrus peels, cherries, olives', 'Ice from the previous night''s service', 'Pre-made sour mix left from last shift', 'Muddled fruit from the day before'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Fresh citrus and fresh garnishes are non-negotiable. Stale juice oxidises within hours; old garnishes are a food safety risk and look unprofessional.'),
  2, ARRAY['cocktails', 'prep', 'mise-en-place'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 4: COFFEE PREPARATION (add 3 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(4, 20, 'descriptor_l2', 'A guest''s espresso tastes harsh and bitter. Which two factors are the most likely cause?',
  jsonb_build_object('prompt', 'A guest''s espresso tastes harsh and bitter. Which two factors are the most likely cause?', 'descriptors', ARRAY['Over-extraction — grind too fine or shot ran too long', 'Stale or poorly stored coffee beans', 'Under-extraction — grind too coarse', 'Clean and correctly dosed portafilter', 'Correct water temperature of 90–96°C'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Bitter espresso is almost always over-extracted or made from stale beans. Under-extraction produces sourness, not bitterness.'),
  2, ARRAY['coffee', 'espresso', 'faults']),
(4, 21, 'descriptor_l2', 'For a flat white with perfect texture, which two steps are essential?',
  jsonb_build_object('prompt', 'For a flat white with perfect texture, which two steps are essential?', 'descriptors', ARRAY['Steam milk to 60–65°C with fine, silky microfoam', 'Pour in a single steady stream from close to the surface', 'Steam milk to boiling for maximum foam volume', 'Froth milk with a whisk before steaming', 'Use skim milk for the richest texture'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Flat whites require velvety microfoam at the right temperature, poured close to the surface in one smooth pour. Oversteaming produces large bubbles and a dry foam.'),
  2, ARRAY['coffee', 'milk', 'flat-white']),
(4, 22, 'descriptor_l2', 'A guest who usually drinks tea wants to try coffee for the first time. Which two options are the best starting point?',
  jsonb_build_object('prompt', 'A guest who usually drinks tea wants to try coffee for the first time. Which two options are the best starting point?', 'descriptors', ARRAY['Latte — large milk ratio, mild coffee flavour', 'Flat white with a single shot — gentle introduction', 'Double ristretto — very intense and concentrated', 'Cold brew concentrate — very high caffeine', 'Americano — strong, minimal dilution'], 'correctIndices', ARRAY[0, 1], 'explanation', 'A latte and a single-shot flat white are the most approachable entry points — the milk softens the coffee intensity and the volume is familiar for a tea drinker.'),
  2, ARRAY['coffee', 'recommendations', 'guests'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 5: CARRYING GLASSWARE & TRAYS (add 4 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(5, 20, 'descriptor_l2', 'Carrying a loaded tray through a crowded venue, which two practices are most important for safety?',
  jsonb_build_object('prompt', 'Carrying a loaded tray through a crowded venue, which two practices are most important for safety?', 'descriptors', ARRAY['Call out "behind" or "excuse me" clearly before passing', 'Hold the tray at shoulder height and look ahead, not down', 'Walk as fast as possible to minimise time in the crowd', 'Balance all heavy glasses on one side of the tray', 'Never look up from the tray while moving'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Verbal warning and maintaining forward visibility are the two critical safety practices. Speed increases risk; tray balance requires even weight distribution.'),
  2, ARRAY['glassware', 'tray', 'safety']),
(5, 21, 'descriptor_l2', 'The tray feels unbalanced mid-carry. Which two corrective actions are correct?',
  jsonb_build_object('prompt', 'The tray feels unbalanced mid-carry. Which two corrective actions are correct?', 'descriptors', ARRAY['Slow down immediately and find a stable surface to adjust', 'Redistribute the weight of glasses before continuing', 'Speed up so you reach the table before anything falls', 'Tilt the tray sharply toward your body for control', 'Ignore it and carry on — adjusting will make it worse'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Slowing down and redistributing weight are the only safe responses to an unbalanced tray. Speeding up or tilting it makes a spill far more likely.'),
  2, ARRAY['glassware', 'tray', 'technique']),
(5, 22, 'descriptor_l2', 'You need to clear a table of 6 drinks glasses. Which two approaches are safest?',
  jsonb_build_object('prompt', 'You need to clear a table of 6 drinks glasses. Which two approaches are safest?', 'descriptors', ARRAY['Load glasses onto a tray in manageable batches', 'Hold no more than 2–3 glasses in one hand at a time', 'Stack all 6 glasses together to save time', 'Carry all 6 balanced in both hands without a tray', 'Clear one glass at a time, each trip to the bar'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Using a tray in batches and limiting hand-carries to 2–3 glasses prevents breakage and injury. Stacking glassware is a breakage and safety hazard.'),
  2, ARRAY['glassware', 'clearing', 'technique']),
(5, 23, 'descriptor_l2', 'A colleague drops a glass during service. Which two immediate responses are correct?',
  jsonb_build_object('prompt', 'A colleague drops a glass during service. Which two immediate responses are correct?', 'descriptors', ARRAY['Immediately alert nearby guests and create a safe zone', 'Inform a supervisor and ensure proper clean-up with a dustpan', 'Sweep up the glass quickly with bare hands', 'Leave the clean-up until the rush is over', 'Blame the colleague in front of guests to set expectations'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Safety first: alert guests to the hazard and use proper equipment for clean-up. Never use bare hands on broken glass and always involve a supervisor for incidents.'),
  2, ARRAY['glassware', 'incidents', 'safety'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 6: CLEANING PROCEDURES (add 3 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(6, 20, 'descriptor_l2', 'A liquid spill occurs at the bar during service. Which two immediate actions are essential?',
  jsonb_build_object('prompt', 'A liquid spill occurs at the bar during service. Which two immediate actions are essential?', 'descriptors', ARRAY['Blot and clean with the correct cleaning product for the surface', 'Dry the surface completely to eliminate slip hazard', 'Leave it until the rush is over', 'Pour water over it to dilute and walk away', 'Let it air-dry naturally — no action needed'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Cleaning with the correct product and drying the surface prevent both contamination and slip-and-fall incidents — both are safety and hygiene requirements.'),
  2, ARRAY['cleaning', 'safety', 'hygiene']),
(6, 21, 'descriptor_l2', 'When washing glassware, which two practices prevent cross-contamination?',
  jsonb_build_object('prompt', 'When washing glassware, which two practices prevent cross-contamination?', 'descriptors', ARRAY['Use the correct chemical concentration in the glasswasher', 'Rinse glasses in clean hot water and allow to air-dry rim-down', 'Stack wet glasses rim-to-rim to save storage space', 'Use the same cloth for glasses and bar surfaces', 'Only wash glasses that have visible residue'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Correct chemical concentration kills bacteria; air-drying rim-down prevents recontamination from surfaces. Stacking wet glasses and shared cloths spread contamination.'),
  2, ARRAY['cleaning', 'glassware', 'hygiene']),
(6, 22, 'descriptor_l2', 'Which two tasks must be completed as part of a thorough end-of-shift clean?',
  jsonb_build_object('prompt', 'Which two tasks must be completed as part of a thorough end-of-shift clean?', 'descriptors', ARRAY['Sanitise all food-contact surfaces with approved solution', 'Drain, clean, and restock the ice well for the next shift', 'Leave dishes for the morning team to handle', 'Skip mopping if the floor looks clean enough', 'Only wipe down areas visible to guests'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Food-contact surface sanitation and ice well maintenance are health code requirements, not optional. Cleanliness handed over to the next shift is part of professional standards.'),
  2, ARRAY['cleaning', 'end-of-shift', 'standards'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 7: BAR BACK DUTIES (add 3 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(7, 20, 'descriptor_l2', 'During service, a bartender is running low on limes. Which two bar back responses are correct?',
  jsonb_build_object('prompt', 'During service, a bartender is running low on limes. Which two bar back responses are correct?', 'descriptors', ARRAY['Restock immediately from prep without waiting to be asked', 'Check what else is running low while you''re already moving', 'Wait for a direct verbal instruction before acting', 'Ask the bartender to handle it after the current round', 'Leave it — the bartender will manage'], 'correctIndices', ARRAY[0, 1], 'explanation', 'A good bar back anticipates needs and acts proactively. Restocking and doing a broader check while you''re already moving keeps service smooth without interrupting the bartender.'),
  2, ARRAY['bar-back', 'anticipation', 'teamwork']),
(7, 21, 'descriptor_l2', 'You notice a guest''s empty glass on the bar. Which two actions are correct as bar back?',
  jsonb_build_object('prompt', 'You notice a guest''s empty glass on the bar. Which two actions are correct as bar back?', 'descriptors', ARRAY['Clear the glass promptly to free up space and improve presentation', 'Alert the serving bartender so they can offer a refill', 'Take the guest''s next drink order independently without informing staff', 'Leave it — clearing is not your role', 'Move the guest to a different seat to clean the area'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Bar backs clear and communicate — they don''t take orders. Clearing the glass and alerting the bartender is the correct support role.'),
  2, ARRAY['bar-back', 'service', 'teamwork']),
(7, 22, 'descriptor_l2', 'During a very busy shift, which two priorities should guide your bar back duties?',
  jsonb_build_object('prompt', 'During a very busy shift, which two priorities should guide your bar back duties?', 'descriptors', ARRAY['Keep the bartender''s most-needed items stocked first', 'Maintain clean and organised work areas throughout the shift', 'Focus on your personal tasks before helping the team', 'Take your scheduled break at peak service time', 'Complete one task at a time regardless of urgency'], 'correctIndices', ARRAY[0, 1], 'explanation', 'In a busy service, supporting the bartender''s immediate needs and maintaining workspace cleanliness/organisation are the two highest-value bar back priorities.'),
  2, ARRAY['bar-back', 'priorities', 'service'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 8: GREETING GUESTS (add 3 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(8, 20, 'descriptor_l2', 'A group of guests arrives at a table not assigned to you. Which two responses are correct?',
  jsonb_build_object('prompt', 'A group of guests arrives at a table not assigned to you. Which two responses are correct?', 'descriptors', ARRAY['Greet them warmly and let their assigned server know immediately', 'Acknowledge them with a smile and a "someone will be right with you"', 'Ignore them as it''s not your section', 'Point to the host stand without any greeting', 'Tell them to wait until their server is available, without acknowledging them'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Every guest who walks in deserves an immediate acknowledgement. Even if they''re not your table, greet them and ensure the right person knows they''ve arrived.'),
  2, ARRAY['greeting', 'teamwork', 'service']),
(8, 21, 'descriptor_l2', 'A regular customer walks in and you recognise them. Which two actions show quality service?',
  jsonb_build_object('prompt', 'A regular customer walks in and you recognise them. Which two actions show quality service?', 'descriptors', ARRAY['Welcome them by name if you know it — it makes them feel valued', 'Mention their usual and ask if they''d like the same today', 'Treat them exactly the same as any other guest — no personalisation', 'Push a new special without acknowledging their regular preference', 'Ask them to wait with other guests as they arrived at a busy time'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Recognising regulars by name and knowing their preferences is the hallmark of memorable hospitality. It turns a transaction into a relationship.'),
  2, ARRAY['greeting', 'regulars', 'personalisation']),
(8, 22, 'descriptor_l2', 'A guest approaches looking uncertain — they seem unsure where to go. Which two responses demonstrate hospitality?',
  jsonb_build_object('prompt', 'A guest approaches looking uncertain — they seem unsure where to go. Which two responses demonstrate hospitality?', 'descriptors', ARRAY['Approach them proactively with a warm, open expression before they have to ask', 'Ask "How can I help you today?" in a genuine, unhurried tone', 'Wait for them to find their own way — they''ll ask if they need help', 'Avoid eye contact so as not to pressure them', 'Tell them to find a manager if they need assistance'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Proactive hospitality means removing the guest''s need to feel uncomfortable or lost. Approach before they ask — a warm expression and open question signals safety and welcome.'),
  2, ARRAY['greeting', 'body-language', 'service'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 9: TABLE MANAGEMENT (add 3 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(9, 20, 'descriptor_l2', 'A table of 4 finishes their mains — all plates are empty. Which two actions signal attentive service?',
  jsonb_build_object('prompt', 'A table of 4 finishes their mains — all plates are empty. Which two actions signal attentive service?', 'descriptors', ARRAY['Clear plates promptly once all guests have finished', 'Ask if they''d like to see the dessert menu or order coffee', 'Stack plates loudly and clear as quickly as possible', 'Clear individual plates as each guest finishes, without asking', 'Wait for them to flag you down before doing anything'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Timely clearing and proactively offering the next course shows attentiveness. Waiting to be flagged down or clearing aggressively mid-meal are both service failures.'),
  2, ARRAY['table-management', 'pacing', 'service']),
(9, 21, 'descriptor_l2', 'A booking hasn''t arrived 15 minutes after their reservation time. Which two actions are appropriate?',
  jsonb_build_object('prompt', 'A booking hasn''t arrived 15 minutes after their reservation time. Which two actions are appropriate?', 'descriptors', ARRAY['Hold the table for the agreed grace period — typically 15–20 minutes', 'Check with your manager before releasing the table to walk-ins', 'Immediately seat walk-ins at the table — they''ve had enough time', 'Mark it as a no-show and move on without further checks', 'Release the table without informing anyone'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Honouring your grace period and involving a manager before releasing tables protects the business from disputes and keeps communication clear.'),
  2, ARRAY['table-management', 'reservations', 'process']),
(9, 22, 'descriptor_l2', 'Two tables are seated at the same time. How should you prioritise?',
  jsonb_build_object('prompt', 'Two tables are seated at the same time. How should you prioritise?', 'descriptors', ARRAY['Greet both tables immediately — even briefly — to set expectations', 'Take the simpler/smaller table''s drink order first if possible', 'Fully serve one table before acknowledging the other', 'Take both tables'' complete orders simultaneously to save time', 'Ask one table to wait without any explanation or acknowledgement'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Immediate acknowledgement at both tables prevents guests feeling invisible. Taking the faster order first keeps momentum without neglecting the second table.'),
  2, ARRAY['table-management', 'prioritisation', 'service'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 10: ANTICIPATORY SERVICE (add 3 L2 → total 6) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(10, 20, 'descriptor_l2', 'A family with young children sits down. Which two anticipatory moves are most appropriate?',
  jsonb_build_object('prompt', 'A family with young children sits down. Which two anticipatory moves are most appropriate?', 'descriptors', ARRAY['Bring kids'' menus and offer a high chair without being asked', 'Bring water and bread rolls immediately to keep everyone settled', 'Wait for the parents to ask for everything they need', 'Assume the children only want chips and bring those immediately', 'Focus only on the adults — kids don''t order much anyway'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Families with kids need more logistical support — menus, seating, and immediate refreshments before the children get restless. Acting before they ask signals great attentiveness.'),
  2, ARRAY['anticipatory', 'families', 'service']),
(10, 21, 'descriptor_l2', 'You notice a guest''s drink is nearly empty. Which two responses are ideal?',
  jsonb_build_object('prompt', 'You notice a guest''s drink is nearly empty. Which two responses are ideal?', 'descriptors', ARRAY['Approach proactively and offer a refill in a natural, unhurried way', 'Time the offer so it fits smoothly into your service flow', 'Wait until the glass is completely empty and they''ve had to wait', 'Ask every couple of minutes if they''re finished yet', 'Clear the glass without offering a replacement'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Offering a refill before the glass is empty — and doing so naturally — keeps the guest comfortable and signals attentiveness without being intrusive.'),
  2, ARRAY['anticipatory', 'drinks', 'timing']),
(10, 22, 'descriptor_l2', 'A guest is quietly struggling to read the wine list. Which two anticipatory actions help most?',
  jsonb_build_object('prompt', 'A guest is quietly struggling to read the wine list. Which two anticipatory actions help most?', 'descriptors', ARRAY['Approach warmly and offer to help before they have to ask', 'Ask what style or occasion they''re celebrating to personalise a suggestion', 'Wait for them to ask for help — interrupting may feel intrusive', 'Push the most expensive wine immediately', 'Hand them a drinks menu instead without explanation'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Approaching before they struggle too long removes awkwardness. A personalised question ("What kind of flavours do you enjoy?") is more helpful than a generic recommendation.'),
  2, ARRAY['anticipatory', 'wine', 'recommendations'])
ON CONFLICT (module_id, scenario_index) DO NOTHING;
