-- Phase 1: Create scenarios - Part 2 (Modules 4-10)
-- Continuing scenario seeding for Coffee through Anticipatory Service

-- ===== MODULE 4: COFFEE/BARISTA BASICS (12 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3)
(4, 0, 'quiz', 'What is the proper ratio of espresso to milk for a cappuccino?',
  jsonb_build_object('question', 'What is the proper ratio of espresso to milk for a cappuccino?', 'answer', '1:1:1 (espresso:steamed milk:foam) (correct)', 'explanation', 'Australian tradition; creates balance between coffee and milk.', 'option_type', 'truefalse'),
  1, ARRAY['coffee', 'cappuccino', 'ratio']),
(4, 1, 'quiz', 'What temperature should milk be steamed to?',
  jsonb_build_object('question', 'What temperature should milk be steamed to?', 'answer', '60-65°C (140-150°F) (correct)', 'explanation', 'Hot enough to dissolve sugar, cool enough to avoid scalding flavor.', 'option_type', 'truefalse'),
  1, ARRAY['coffee', 'steaming', 'temperature']),
(4, 2, 'quiz', 'What does "pulling a shot" mean in espresso?',
  jsonb_build_object('question', 'What does "pulling a shot" mean in espresso?', 'answer', 'Forcing hot water through ground coffee under pressure (correct)', 'explanation', 'Creates espresso; takes 25-30 seconds for optimal extraction.', 'option_type', 'truefalse'),
  1, ARRAY['coffee', 'espresso', 'technique']),

-- L2: Descriptor Selection (3)
(4, 3, 'descriptor_l2', 'A customer orders a "strong coffee." Which options might satisfy?',
  jsonb_build_object('prompt', 'A customer orders a "strong coffee." Which options might satisfy?', 'descriptors', ARRAY['Double espresso', 'Americano with extra shot', 'Flat white (standard)', 'Iced latte', 'Decaf'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Strong means more espresso; flat white is standard milk ratio.'),
  2, ARRAY['coffee', 'strength', 'preferences']),
(4, 4, 'descriptor_l2', 'When steaming milk, which techniques create proper microfoam?',
  jsonb_build_object('prompt', 'When steaming milk, which techniques create proper microfoam?', 'descriptors', ARRAY['Insert wand 1/3 below surface', 'Maintain whirlpool motion', 'Blow hard at surface', 'Keep wand fully submerged', 'No movement needed'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Shallow wand placement and circular motion create fine, silky foam.'),
  2, ARRAY['coffee', 'steaming', 'microfoam']),
(4, 5, 'descriptor_l2', 'A guest says their coffee tastes bitter. What might have caused it?',
  jsonb_build_object('prompt', 'A guest says their coffee tastes bitter. What might have caused it?', 'descriptors', ARRAY['Over-extraction (shot pulled too long)', 'Beans too finely ground', 'Milk too warm', 'Not enough espresso', 'Cup too large'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Bitter flavors come from over-extraction or over-fine grind.'),
  2, ARRAY['coffee', 'troubleshooting', 'taste']),

-- L3: Advanced Descriptors (3)
(4, 6, 'descriptor_l3', 'To troubleshoot espresso machine issues, which three steps diagnose problems?',
  jsonb_build_object('prompt', 'To troubleshoot espresso machine issues, which three steps diagnose problems?', 'descriptors', ARRAY['Check grind consistency first', 'Observe extraction speed (should be 25-30sec)', 'Taste shots to confirm bitterness/under-extraction', 'Verify water temperature', 'Always use finer grind'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Systematic diagnosis prevents waste and identifies root causes.'),
  3, ARRAY['coffee', 'troubleshooting', 'advanced']),
(4, 7, 'descriptor_l3', 'A morning rush hits; you have 20 coffee orders in 10 minutes. Which three practices help?',
  jsonb_build_object('prompt', 'A morning rush hits; you have 20 coffee orders in 10 minutes. Which three practices help?', 'descriptors', ARRAY['Batch similar drinks (all lattes, then cappuccinos)', 'Pre-steam milk for multiple cups', 'Use grinder ahead of rush', 'Communicate with team', 'Skip milk steaming quality'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Batching, prep, and communication maintain quality under pressure.'),
  3, ARRAY['coffee', 'efficiency', 'rush']),
(4, 8, 'descriptor_l3', 'A regular customer always orders a flat white. Which three should be your service standards?',
  jsonb_build_object('prompt', 'A regular customer always orders a flat white. Which three should be your service standards?', 'descriptors', ARRAY['Remember their preference', 'Double-check milk temperature', 'Offer seasonal variations', 'Thank them for repeat business', 'Assume they always want the same'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Consistency, care, and personalization build loyalty.'),
  3, ARRAY['coffee', 'regulars', 'service']),

-- L4: Roleplay Scenarios (3)
(4, 9, 'roleplay', 'A customer orders a flat white but you notice they\'re in a hurry. Walk through your service—speed without sacrificing quality.',
  jsonb_build_object('prompt', 'A customer orders a flat white but you notice they\'re in a hurry. Walk through your service—speed without sacrificing quality.', 'evaluation_dimensions', ARRAY['Attentiveness', 'Technical Skill', 'Hospitality', 'Time Awareness']),
  4, ARRAY['coffee', 'roleplay', 'service']),
(4, 10, 'roleplay', 'A guest complains their cappuccino has too much foam. Walk through your diagnosis and remake without defensiveness.',
  jsonb_build_object('prompt', 'A guest complains their cappuccino has too much foam. Walk through your diagnosis and remake without defensiveness.', 'evaluation_dimensions', ARRAY['Problem-Solving', 'Customer Service', 'Technical Correction', 'Grace']),
  4, ARRAY['coffee', 'roleplay', 'quality']),
(4, 11, 'roleplay', 'A team member is new to espresso machines and keeps over-extracting shots. As a senior staff member, how do you coach them during a shift?',
  jsonb_build_object('prompt', 'A team member is new to espresso machines and keeps over-extracting shots. As a senior staff member, how do you coach them during a shift?', 'evaluation_dimensions', ARRAY['Leadership', 'Patience', 'Technical Knowledge', 'Teamwork']),
  4, ARRAY['coffee', 'roleplay', 'coaching']);

-- ===== MODULE 5: CARRYING GLASSWARE & TRAYS (10 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3)
(5, 0, 'quiz', 'What is the proper way to carry a single cocktail glass?',
  jsonb_build_object('question', 'What is the proper way to carry a single cocktail glass?', 'answer', 'By the stem or base, never by the bowl (correct)', 'explanation', 'Prevents fingerprints, maintains temperature, avoids breaking.', 'option_type', 'truefalse'),
  1, ARRAY['carrying', 'glassware', 'technique']),
(5, 1, 'quiz', 'When carrying multiple glasses on a tray, how should they be arranged?',
  jsonb_build_object('question', 'When carrying multiple glasses on a tray, how should they be arranged?', 'answer', 'Heaviest glasses toward center, lighter toward edges (correct)', 'explanation', 'Maintains balance and reduces tipping risk.', 'option_type', 'truefalse'),
  1, ARRAY['carrying', 'tray', 'balance']),
(5, 2, 'quiz', 'What is the maximum safe weight to carry on a service tray?',
  jsonb_build_object('question', 'What is the maximum safe weight to carry on a service tray?', 'answer', '10-15 lbs depending on tray size and personal strength (correct)', 'explanation', 'Heavy loads increase drop risk; split multiple trips if needed.', 'option_type', 'truefalse'),
  1, ARRAY['carrying', 'safety', 'weight']),

-- L2: Descriptor Selection (2)
(5, 3, 'descriptor_l2', 'Carrying a tray of 8 glasses, which practices prevent spills?',
  jsonb_build_object('prompt', 'Carrying a tray of 8 glasses, which practices prevent spills?', 'descriptors', ARRAY['Hold tray at waist level with bent elbow', 'Keep tray balanced against your body', 'Carry tray high above head', 'Fill glasses to rim', 'Carry with straight arm'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Low, stable carrying position is safest for full trays.'),
  2, ARRAY['carrying', 'technique', 'safety']),
(5, 4, 'descriptor_l2', 'A guest stands up just as you\'re arriving with drinks. What\'s your best move?',
  jsonb_build_object('prompt', 'A guest stands up just as you\'re arriving with drinks. What\'s your best move?', 'descriptors', ARRAY['Pause and wait for them to settle', 'Approach from the side they\'re not moving to', 'Push forward confidently', 'Place drinks without checking guest position', 'Ask them to sit down'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Safety first; wait and approach from a safe angle.'),
  2, ARRAY['carrying', 'situational', 'safety']),

-- L3: Advanced Descriptors (2)
(5, 5, 'descriptor_l3', 'During a busy service, you\'re carrying a full tray and a guest flags you down. Which three are safe options?',
  jsonb_build_object('prompt', 'During a busy service, you\'re carrying a full tray and a guest flags you down. Which three are safe options?', 'descriptors', ARRAY['Acknowledge them, finish delivery, return for their request', 'Politely ask them to wait 30 seconds', 'Use hand signal to flag nearby staff to help', 'Stop mid-delivery to assist', 'Ignore them'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Complete the current task safely; delegate or return after delivery.'),
  3, ARRAY['carrying', 'prioritization', 'safety']),
(5, 6, 'descriptor_l3', 'You nearly drop a tray of drinks. What\'s the professional recovery?',
  jsonb_build_object('prompt', 'You nearly drop a tray of drinks. What\'s the professional recovery?', 'descriptors', ARRAY['Regain balance calmly', 'Apologize to guests if any concern', 'Continue service without making a scene', 'Check drinks before serving to ensure quality', 'Panic visibly'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Composure, transparency, and quality checks matter most.'),
  3, ARRAY['carrying', 'recovery', 'professionalism']),

-- L4: Roleplay Scenarios (3)
(5, 7, 'roleplay', 'You\'re carrying 8 cocktails during Friday night rush. Describe your approach to the table, hand-off, and how you ensure each guest gets the right drink.',
  jsonb_build_object('prompt', 'You\'re carrying 8 cocktails during Friday night rush. Describe your approach to the table, hand-off, and how you ensure each guest gets the right drink.', 'evaluation_dimensions', ARRAY['Safety', 'Accuracy', 'Grace', 'Communication']),
  4, ARRAY['carrying', 'roleplay', 'rush']),
(5, 8, 'roleplay', 'A child runs in front of you while you\'re carrying a tray. Walk through what happens—safety first.',
  jsonb_build_object('prompt', 'A child runs in front of you while you\'re carrying a tray. Walk through what happens—safety first.', 'evaluation_dimensions', ARRAY['Risk Assessment', 'Quick Thinking', 'Professionalism', 'Composure']),
  4, ARRAY['carrying', 'roleplay', 'safety']),
(5, 9, 'roleplay', 'You spill a drink on a guest\'s clothing. Walk through your recovery—apology, compensation offer, making them feel cared for.',
  jsonb_build_object('prompt', 'You spill a drink on a guest\'s clothing. Walk through your recovery—apology, compensation offer, making them feel cared for.', 'evaluation_dimensions', ARRAY['Empathy', 'Professionalism', 'Service Recovery', 'Grace']),
  4, ARRAY['carrying', 'roleplay', 'service-recovery']);

-- ===== MODULE 6: CLEANING & SANITATION (11 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3)
(6, 0, 'quiz', 'What is the proper water temperature for washing glassware?',
  jsonb_build_object('question', 'What is the proper water temperature for washing glassware?', 'answer', '110-120°F (43-49°C) with hot water and detergent (correct)', 'explanation', 'Hot water kills bacteria; detergent removes oils and residue.', 'option_type', 'truefalse'),
  1, ARRAY['sanitation', 'washing', 'temperature']),
(6, 1, 'quiz', 'How often should tap lines be cleaned?',
  jsonb_build_object('question', 'How often should tap lines be cleaned?', 'answer', 'Weekly (correct)', 'explanation', 'Prevents bacterial growth and off-flavors in beer/cocktails.', 'option_type', 'truefalse'),
  1, ARRAY['sanitation', 'equipment', 'maintenance']),
(6, 2, 'quiz', 'What is sanitizer solution used for after washing?',
  jsonb_build_object('question', 'What is sanitizer solution used for after washing?', 'answer', 'Final rinse to kill remaining bacteria without rinsing off (correct)', 'explanation', 'Leaves protective residue; air-dry after to complete process.', 'option_type', 'truefalse'),
  1, ARRAY['sanitation', 'chemicals', 'process']),

-- L2: Descriptor Selection (3)
(6, 3, 'descriptor_l2', 'When cleaning a cocktail shaker, which steps are correct?',
  jsonb_build_object('prompt', 'When cleaning a cocktail shaker, which steps are correct?', 'descriptors', ARRAY['Wash with hot water and detergent', 'Sanitize before next use', 'Rinse with cold water', 'Use the same water for multiple shakers', 'Allow to air-dry without sanitizing'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Hot water, detergent, and sanitizing are essential; never reuse water.'),
  2, ARRAY['sanitation', 'equipment', 'process']),
(6, 4, 'descriptor_l2', 'If you drop ice on the floor, which is the right action?',
  jsonb_build_object('prompt', 'If you drop ice on the floor, which is the right action?', 'descriptors', ARRAY['Throw out and get fresh ice', 'Do not serve to guests', 'Rinse it and use anyway', 'Use it for non-edible items only', 'Assume it\'s fine'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Dropped items are contaminated; always discard.'),
  2, ARRAY['sanitation', 'food-safety', 'ice']),
(6, 5, 'descriptor_l2', 'A guest\'s glass has lipstick/residue inside. What do you do?',
  jsonb_build_object('prompt', 'A guest\'s glass has lipstick/residue inside. What do you do?', 'descriptors', ARRAY['Offer to replace the drink', 'Don\'t serve from that glass', 'Wipe glass with cloth and serve', 'Suggest they wipe it themselves', 'Assume it\'s fine'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Replace the drink; never serve from a contaminated glass.'),
  2, ARRAY['sanitation', 'service', 'quality']),

-- L3: Advanced Descriptors (2)
(6, 6, 'descriptor_l3', 'Your bar\'s hand-washing station is critical. Which three elements must be present?',
  jsonb_build_object('prompt', 'Your bar\'s hand-washing station is critical. Which three elements must be present?', 'descriptors', ARRAY['Soap and hot water', 'Paper towels', 'Trash bin', 'Sanitizer option', 'Air hand dryer only'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Complete hand-washing prevents cross-contamination.'),
  3, ARRAY['sanitation', 'hygiene', 'setup']),
(6, 7, 'descriptor_l3', 'You notice a colleague preparing food without gloves and touching their face. What do you do?',
  jsonb_build_object('prompt', 'You notice a colleague preparing food without gloves and touching their face. What do you do?', 'descriptors', ARRAY['Alert them privately', 'Remind them of health code', 'Offer gloves if unsure about availability', 'Report to manager if they refuse', 'Ignore it'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Private coaching first; escalate if behavior continues.'),
  3, ARRAY['sanitation', 'teamwork', 'health-code']),

-- L4: Roleplay Scenarios (3)
(6, 8, 'roleplay', 'During a busy night, the dishwashing station is backed up with glasses. Walk through your priorities—keep service flowing while maintaining sanitation.',
  jsonb_build_object('prompt', 'During a busy night, the dishwashing station is backed up with glasses. Walk through your priorities—keep service flowing while maintaining sanitation.', 'evaluation_dimensions', ARRAY['Multitasking', 'Health Code Knowledge', 'Problem-Solving', 'Communication']),
  4, ARRAY['sanitation', 'roleplay', 'rush']),
(6, 9, 'roleplay', 'A guest shows you a hair in their drink. Walk through your response—apology, replacement, compensation.',
  jsonb_build_object('prompt', 'A guest shows you a hair in their drink. Walk through your response—apology, replacement, compensation.', 'evaluation_dimensions', ARRAY['Accountability', 'Professionalism', 'Empathy', 'Service Recovery']),
  4, ARRAY['sanitation', 'roleplay', 'service-recovery']),
(6, 10, 'roleplay', 'You find mold in the ice well. Walk through immediate actions and reporting to management.',
  jsonb_build_object('prompt', 'You find mold in the ice well. Walk through immediate actions and reporting to management.', 'evaluation_dimensions', ARRAY['Safety Awareness', 'Urgency', 'Communication', 'Prevention Thinking']),
  4, ARRAY['sanitation', 'roleplay', 'safety']);

-- ===== MODULE 7: BAR BACK EFFICIENCY (12 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3)
(7, 0, 'quiz', 'What is a bar back\'s primary role during service?',
  jsonb_build_object('question', 'What is a bar back\'s primary role during service?', 'answer', 'Support bartenders by restocking supplies, prepping ice, keeping station clean (correct)', 'explanation', 'Allows bartenders to focus on guests and drinks.', 'option_type', 'truefalse'),
  1, ARRAY['bar-back', 'role', 'teamwork']),
(7, 1, 'quiz', 'How much ice should a bar back prep before opening?',
  jsonb_build_object('question', 'How much ice should a bar back prep before opening?', 'answer', 'Fill ice bin to capacity; have backup bin ready (correct)', 'explanation', 'Prevents ice shortages during rush.', 'option_type', 'truefalse'),
  1, ARRAY['bar-back', 'ice', 'prep']),
(7, 2, 'quiz', 'What does "running a side" mean?',
  jsonb_build_object('question', 'What does "running a side" mean?', 'answer', 'Making drinks alongside the bartender during rushes (correct)', 'explanation', 'Speeds service; bar back may make simple drinks if trained.', 'option_type', 'truefalse'),
  1, ARRAY['bar-back', 'teamwork', 'rush']),

-- L2: Descriptor Selection (3)
(7, 3, 'descriptor_l2', 'You notice a bartender is running low on clean glasses. Which actions help?',
  jsonb_build_object('prompt', 'You notice a bartender is running low on clean glasses. Which actions help?', 'descriptors', ARRAY['Prioritize glass washing immediately', 'Communicate bottle/glass status before the rush gets worse', 'Wait until they ask', 'Assume they\'ll handle it', 'Focus only on your assigned tasks'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Proactive communication prevents service disruption.'),
  2, ARRAY['bar-back', 'anticipation', 'teamwork']),
(7, 4, 'descriptor_l2', 'During Friday night rush, bartender is slammed. Which are appropriate bar back moves?',
  jsonb_build_object('prompt', 'During Friday night rush, bartender is slammed. Which are appropriate bar back moves?', 'descriptors', ARRAY['Offer to make simple drinks if trained', 'Keep ice and bottles flowing', 'Clear finished bottles/glasses', 'Go on break', 'Handle customer questions'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Support bartender by maintaining supply and removing bottlenecks.'),
  2, ARRAY['bar-back', 'rush', 'support']),
(7, 5, 'descriptor_l2', 'When stocking the bar for the shift, what\'s the right approach?',
  jsonb_build_object('prompt', 'When stocking the bar for the shift, what\'s the right approach?', 'descriptors', ARRAY['Check par levels for each spirit, beer, mixer', 'Restock before opening service', 'Only stock when bartender asks', 'Overstock every bottle', 'Assume nothing ran low from yesterday'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Par levels and pre-opening restocking are standard practice.'),
  2, ARRAY['bar-back', 'inventory', 'preparation']),

-- L3: Advanced Descriptors (3)
(7, 6, 'descriptor_l3', 'To prevent ice shortages during a packed Saturday night, which three steps matter?',
  jsonb_build_object('prompt', 'To prevent ice shortages during a packed Saturday night, which three steps matter?', 'descriptors', ARRAY['Prepare double ice at open', 'Monitor ice level constantly', 'Have backup scoop/ice bucket ready', 'Expect ice to last all night', 'Only make ice when requested'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Proactive prep and constant monitoring prevent shortages.'),
  3, ARRAY['bar-back', 'ice', 'management']),
(7, 7, 'descriptor_l3', 'A bartender calls out "Dos Equis!" while you\'re mid-task. Which is the right response?',
  jsonb_build_object('prompt', 'A bartender calls out "Dos Equis!" while you\'re mid-task. Which is the right response?', 'descriptors', ARRAY['Respond immediately', 'Know where Dos Equis is stocked', 'Deliver to bartender\'s station quickly', 'Maintain eye contact for communication', 'Take your time'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Speed and readiness are critical during service.'),
  3, ARRAY['bar-back', 'responsiveness', 'teamwork']),
(7, 8, 'descriptor_l3', 'You notice a bartender is using the wrong pour count on a well bottle. What do you do?',
  jsonb_build_object('prompt', 'You notice a bartender is using the wrong pour count on a well bottle. What do you do?', 'descriptors', ARRAY['Observe for confirmation', 'Tell them privately after shift', 'Alert supervisor if it\'s systematic', 'Don\'t call them out in front of guests', 'Ignore it'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Private feedback and escalation when needed preserve relationships.'),
  3, ARRAY['bar-back', 'communication', 'professionalism']),

-- L4: Roleplay Scenarios (3)
(7, 9, 'roleplay', 'It\'s 9 PM on a Saturday—the bar is packed. Describe your role for the next 2 hours: ice management, supply flow, how you support the bartender.',
  jsonb_build_object('prompt', 'It\'s 9 PM on a Saturday—the bar is packed. Describe your role for the next 2 hours: ice management, supply flow, how you support the bartender.', 'evaluation_dimensions', ARRAY['Anticipation', 'Communication', 'Work Ethic', 'Teamwork']),
  4, ARRAY['bar-back', 'roleplay', 'rush']),
(7, 10, 'roleplay', 'You\'re the bar back and notice you\'re running low on high-demand spirits (vodka, tequila). Walk through how you manage the shortage while keeping service flowing.',
  jsonb_build_object('prompt', 'You\'re the bar back and notice you\'re running low on high-demand spirits (vodka, tequila). Walk through how you manage the shortage while keeping service flowing.', 'evaluation_dimensions', ARRAY['Problem-Solving', 'Communication', 'Composure', 'Prioritization']),
  4, ARRAY['bar-back', 'roleplay', 'inventory']),
(7, 11, 'roleplay', 'A bartender (senior staff) is doing something against procedure. Walk through how you handle it without creating conflict.',
  jsonb_build_object('prompt', 'A bartender (senior staff) is doing something against procedure. Walk through how you handle it without creating conflict.', 'evaluation_dimensions', ARRAY['Professionalism', 'Respect', 'Communication', 'Judgment']),
  4, ARRAY['bar-back', 'roleplay', 'professionalism']);

-- ===== MODULE 8: THE ART OF THE GREETING (10 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3)
(8, 0, 'quiz', 'What is the ideal time to greet a table after they sit?',
  jsonb_build_object('question', 'What is the ideal time to greet a table after they sit?', 'answer', 'Within 1-2 minutes (correct)', 'explanation', 'Shows attentiveness; allows time to settle but not feel ignored.', 'option_type', 'truefalse'),
  1, ARRAY['greeting', 'timing', 'hospitality']),
(8, 1, 'quiz', 'What is the proper greeting posture?',
  jsonb_build_object('question', 'What is the proper greeting posture?', 'answer', 'Stand at the side of the table, open body language, smile (correct)', 'explanation', 'Approachable, warm, not looming over or backing away.', 'option_type', 'truefalse'),
  1, ARRAY['greeting', 'body-language', 'service']),
(8, 2, 'quiz', 'What should your first sentence always include?',
  jsonb_build_object('question', 'What should your first sentence always include?', 'answer', '"Welcome" or name acknowledgment + offer to help (correct)', 'explanation', 'Sets tone of hospitality and availability.', 'option_type', 'truefalse'),
  1, ARRAY['greeting', 'hospitality', 'communication']),

-- L2: Descriptor Selection (3)
(8, 3, 'descriptor_l2', 'A couple comes in on their anniversary. Which are welcoming first moves?',
  jsonb_build_object('prompt', 'A couple comes in on their anniversary. Which are welcoming first moves?', 'descriptors', ARRAY['Warmly welcome them', 'Ask if this is a special occasion', 'Immediately push drinks', 'Ignore the context', 'Treat them like any guest'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Recognition of special occasions sets memorable experience.'),
  2, ARRAY['greeting', 'special-occasions', 'service']),
(8, 4, 'descriptor_l2', 'A regular customer walks in during a busy shift. How do you greet them?',
  jsonb_build_object('prompt', 'A regular customer walks in during a busy shift. How do you greet them?', 'descriptors', ARRAY['Acknowledge them by name if you remember', 'Show genuine pleasure at seeing them', 'Ignore them during your task', 'Forget their usual', 'Make them feel like one of the crowd'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Regulars value recognition and personalized attention.'),
  2, ARRAY['greeting', 'regulars', 'personalization']),
(8, 5, 'descriptor_l2', 'A group of rowdy friends arrives. What\'s the right tone?',
  jsonb_build_object('prompt', 'A group of rowdy friends arrives. What\'s the right tone?', 'descriptors', ARRAY['Upbeat and matching their energy', 'Set expectations kindly about noise/behavior', 'Stuffy and formal', 'Immediately warn them about noise', 'Assume trouble'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Match energy while gently setting boundaries.'),
  2, ARRAY['greeting', 'group-dynamics', 'hospitality']),

-- L3: Advanced Descriptors (2)
(8, 6, 'descriptor_l3', 'To make greetings feel personal without being intrusive, which three apply?',
  jsonb_build_object('prompt', 'To make greetings feel personal without being intrusive, which three apply?', 'descriptors', ARRAY['Remember regulars\' names and drinks', 'Notice context (celebration, business meeting)', 'Use open-ended questions (not yes/no)', 'Show genuine interest, not robotic', 'Ask about their personal life immediately'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Personalization is warm but bounded by professional respect.'),
  3, ARRAY['greeting', 'personalization', 'boundaries']),
(8, 7, 'descriptor_l3', 'You overhear a first date. What\'s the right greeting approach?',
  jsonb_build_object('prompt', 'You overhear a first date. What\'s the right greeting approach?', 'descriptors', ARRAY['Keep initial greeting brief to not interrupt', 'Be warm but professional', 'Check in later once they\'re comfortable', 'Anticipate their needs (water, time to order)', 'Make comments about them being on a date'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Discretion and gradual, warm engagement build comfort.'),
  3, ARRAY['greeting', 'special-situations', 'professionalism']),

-- L4: Roleplay Scenarios (2)
(8, 8, 'roleplay', 'A large group of tourists walks in—they\'re clearly from out of town and a bit overwhelmed. Walk through your greeting and how you\'d make them feel welcomed.',
  jsonb_build_object('prompt', 'A large group of tourists walks in—they\'re clearly from out of town and a bit overwhelmed. Walk through your greeting and how you\'d make them feel welcomed.', 'evaluation_dimensions', ARRAY['Warmth', 'Clarity', 'Anticipating Needs', 'First Impression']),
  4, ARRAY['greeting', 'roleplay', 'groups']),
(8, 9, 'roleplay', 'A VIP regular (best customer) comes in. Walk through your greeting—showing appreciation without making others feel less important.',
  jsonb_build_object('prompt', 'A VIP regular (best customer) comes in. Walk through your greeting—showing appreciation without making others feel less important.', 'evaluation_dimensions', ARRAY['Professionalism', 'Personalization', 'Balance', 'Warmth']),
  4, ARRAY['greeting', 'roleplay', 'vip']);

-- ===== MODULE 9: MANAGING TABLE DYNAMICS (13 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3)
(9, 0, 'quiz', 'What is the best way to check in with a table without interrupting conversation?',
  jsonb_build_object('question', 'What is the best way to check in with a table without interrupting conversation?', 'answer', 'Pause nearby, make eye contact, wait for a natural break (correct)', 'explanation', 'Respectful, attentive, not disruptive.', 'option_type', 'truefalse'),
  1, ARRAY['table-dynamics', 'timing', 'respect']),
(9, 1, 'quiz', 'If two guests at a table seem to be arguing quietly, what should you do?',
  jsonb_build_object('question', 'If two guests at a table seem to be arguing quietly, what should you do?', 'answer', 'Keep normal service cadence; don\'t intervene unless asked (correct)', 'explanation', 'Respect privacy; be available if they need assistance.', 'option_type', 'truefalse'),
  1, ARRAY['table-dynamics', 'conflict', 'professionalism']),
(9, 2, 'quiz', 'How do you know when a table is ready to order?',
  jsonb_build_object('question', 'How do you know when a table is ready to order?', 'answer', 'They\'ve looked at menus, made eye contact, stopped discussing options (correct)', 'explanation', 'Prevents premature and repeated ordering questions.', 'option_type', 'truefalse'),
  1, ARRAY['table-dynamics', 'reading', 'service']),

-- L2: Descriptor Selection (3)
(9, 3, 'descriptor_l2', 'A table of 6 business professionals is celebrating a deal. How do you enhance the mood?',
  jsonb_build_object('prompt', 'A table of 6 business professionals is celebrating a deal. How do you enhance the mood?', 'descriptors', ARRAY['Offer champagne or special drinks', 'Acknowledge the celebration without intruding', 'Leave them alone entirely', 'Push high-margin items aggressively', 'Treat them like a regular table'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Proactive celebration support without being intrusive builds goodwill.'),
  2, ARRAY['table-dynamics', 'celebrations', 'service']),
(9, 4, 'descriptor_l2', 'Two couples are at a table and one couple seems quiet/bored. What\'s your move?',
  jsonb_build_object('prompt', 'Two couples are at a table and one couple seems quiet/bored. What\'s your move?', 'descriptors', ARRAY['Engage the quieter couple with conversation', 'Suggest shared appetizers to bring them together', 'Only focus on the loud couple', 'Assume they want to be alone', 'Seat them apart next time'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Inclusive service creates better group dynamics.'),
  2, ARRAY['table-dynamics', 'group-harmony', 'service']),
(9, 5, 'descriptor_l2', 'A large party (8+) arrives without a reservation and you\'re full. How do you handle it?',
  jsonb_build_object('prompt', 'A large party (8+) arrives without a reservation and you\'re full. How do you handle it?', 'descriptors', ARRAY['Apologize warmly', 'Offer wait time or alternative times honestly', 'Turn them away rudely', 'Overcrowd and ruin other tables\' experience', 'Offer false wait time'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Honesty and warmth turn disappointment into future opportunity.'),
  2, ARRAY['table-dynamics', 'seating', 'hospitality']),

-- L3: Advanced Descriptors (4)
(9, 6, 'descriptor_l3', 'To read a table\'s mood through body language, which three cues matter?',
  jsonb_build_object('prompt', 'To read a table\'s mood through body language, which three cues matter?', 'descriptors', ARRAY['Open vs. closed posture', 'Eye contact and engagement', 'Conversation volume and pace', 'Assumed mood based on appearance', 'How they\'re dressed'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Body language reading is learnable and essential for good service.'),
  3, ARRAY['table-dynamics', 'reading', 'body-language']),
(9, 7, 'descriptor_l3', 'A table is finishing their main and starting to look around (ready for next course). Which are good moves?',
  jsonb_build_object('prompt', 'A table is finishing their main and starting to look around (ready for next course). Which are good moves?', 'descriptors', ARRAY['Clear plates promptly', 'Offer dessert options', 'Check drink levels', 'Ask about pacing (rushing or lingering)', 'Rush them immediately'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Proactive clearing and pacing questions keep momentum smooth.'),
  3, ARRAY['table-dynamics', 'pacing', 'service']),
(9, 8, 'descriptor_l3', 'You notice a guest seems uncomfortable or upset (beyond normal). Which three steps are appropriate?',
  jsonb_build_object('prompt', 'You notice a guest seems uncomfortable or upset (beyond normal). Which three steps are appropriate?', 'descriptors', ARRAY['Check in privately if possible', 'Offer to solve the problem', 'Stay calm and professional', 'Ask loudly what\'s wrong', 'Assume it\'s about your service'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Discrete, proactive support often prevents escalation.'),
  3, ARRAY['table-dynamics', 'empathy', 'problem-solving']),
(9, 9, 'descriptor_l3', 'A large party\'s energy is dropping mid-service. How do you re-energize?',
  jsonb_build_object('prompt', 'A large party\'s energy is dropping mid-service. How do you re-energize?', 'descriptors', ARRAY['Suggest a shareable appetizer or drink special', 'Check if music/lighting feels right', 'Offer to move them to better seating', 'Smile and bring positive energy yourself', 'Leave them be'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Small interventions and your own energy can shift group mood.'),
  3, ARRAY['table-dynamics', 'engagement', 'service']),

-- L4: Roleplay Scenarios (3)
(9, 10, 'roleplay', 'A table has mixed opinions about food/drinks (some love, some don\'t). Walk through how you acknowledge and manage this without taking sides or making anyone feel bad.',
  jsonb_build_object('prompt', 'A table has mixed opinions about food/drinks (some love, some don\'t). Walk through how you acknowledge and manage this without taking sides or making anyone feel bad.', 'evaluation_dimensions', ARRAY['Diplomacy', 'Problem-Solving', 'Empathy', 'Professionalism']),
  4, ARRAY['table-dynamics', 'roleplay', 'conflict']),
(9, 11, 'roleplay', 'You notice one guest at a table is clearly upset with another—maybe a relationship issue. Walk through your approach: when to check in, how to maintain neutrality, when to step back.',
  jsonb_build_object('prompt', 'You notice one guest at a table is clearly upset with another—maybe a relationship issue. Walk through your approach: when to check in, how to maintain neutrality, when to step back.', 'evaluation_dimensions', ARRAY['Emotional Intelligence', 'Boundaries', 'Discretion', 'Professionalism']),
  4, ARRAY['table-dynamics', 'roleplay', 'boundaries']),
(9, 12, 'roleplay', 'A large group is lingering after closing time, talking loudly. Walk through how you\'d gently signal that it\'s time to wrap up without being rude.',
  jsonb_build_object('prompt', 'A large group is lingering after closing time, talking loudly. Walk through how you\'d gently signal that it\'s time to wrap up without being rude.', 'evaluation_dimensions', ARRAY['Tact', 'Communication', 'Problem-Solving', 'Firmness']),
  4, ARRAY['table-dynamics', 'roleplay', 'closing']);

-- ===== MODULE 10: ANTICIPATORY SERVICE (12 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3)
(10, 0, 'quiz', 'A guest\'s glass is half-empty and they\'re still eating. What should you do?',
  jsonb_build_object('question', 'A guest\'s glass is half-empty and they\'re still eating. What should you do?', 'answer', 'Offer a refill proactively (correct)', 'explanation', 'Anticipates need before they ask; prevents empty glass moments.', 'option_type', 'truefalse'),
  1, ARRAY['anticipatory', 'refills', 'service']),
(10, 1, 'quiz', 'You notice a guest looking at the dessert menu while eating their main. What\'s your move?',
  jsonb_build_object('question', 'You notice a guest looking at the dessert menu while eating their main. What\'s your move?', 'answer', 'Mention dessert/coffee options in 5-10 minutes when they might be ready (correct)', 'explanation', 'Gently guides them without rushing.', 'option_type', 'truefalse'),
  1, ARRAY['anticipatory', 'dessert', 'timing']),
(10, 2, 'quiz', 'When is the best time to offer the check?',
  jsonb_build_object('question', 'When is the best time to offer the check?', 'answer', 'When the table has finished eating, glances around, or says "I think we\'re done" (correct)', 'explanation', 'Wait for signals; don\'t assume.', 'option_type', 'truefalse'),
  1, ARRAY['anticipatory', 'check', 'timing']),

-- L2: Descriptor Selection (3)
(10, 3, 'descriptor_l2', 'A couple at the bar seems interested in trying new spirits. How do you anticipate this?',
  jsonb_build_object('prompt', 'A couple at the bar seems interested in trying new spirits. How do you anticipate this?', 'descriptors', ARRAY['Listen to their conversation about preferences', 'Ask open questions before suggesting', 'Push the most expensive bottle', 'Assume they want the same old drink', 'Ignore their interest'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Listening and questioning come before suggesting.'),
  2, ARRAY['anticipatory', 'listening', 'upsell']),
(10, 4, 'descriptor_l2', 'You notice a table getting loud and happy—they\'re having fun. What\'s anticipatory service?',
  jsonb_build_object('prompt', 'You notice a table getting loud and happy—they\'re having fun. What\'s anticipatory service?', 'descriptors', ARRAY['Keep energy up, refill waters/drinks without asking', 'Suggest shareable fun items (shots, appetizers)', 'Quiet them down', 'Treat them like they\'re causing trouble', 'Leave them alone'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Match and amplify positive group energy.'),
  2, ARRAY['anticipatory', 'energy', 'service']),
(10, 5, 'descriptor_l2', 'A family with young kids is dining. Which are good anticipatory moves?',
  jsonb_build_object('prompt', 'A family with young kids is dining. Which are good anticipatory moves?', 'descriptors', ARRAY['Offer high chairs if needed', 'Ask about allergies upfront', 'Time drinks/food so kids don\'t get restless', 'Assume they have everything they need', 'Rush their service'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Anticipatory service for families prevents frustration.'),
  2, ARRAY['anticipatory', 'families', 'service']),

-- L3: Advanced Descriptors (3)
(10, 6, 'descriptor_l3', 'To master anticipatory service, which three practices matter most?',
  jsonb_build_object('prompt', 'To master anticipatory service, which three practices matter most?', 'descriptors', ARRAY['Observe guest behavior constantly', 'Remember regulars\' patterns', 'Check tables proactively (every 3-5 min)', 'Train your peripheral vision', 'Wait at the host stand'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Observation, memory, and proactive checks are foundational.'),
  3, ARRAY['anticipatory', 'observation', 'practice']),
(10, 7, 'descriptor_l3', 'A guest\'s drink is nearly empty but they seem satisfied with pace. How do you anticipate?',
  jsonb_build_object('prompt', 'A guest\'s drink is nearly empty but they seem satisfied with pace. How do you anticipate?', 'descriptors', ARRAY['Ask if they\'d like another rather than assume', 'Watch their eating pace', 'Notice if they\'re savoring vs. rushing', 'Offer an alternative (water, dessert drink)', 'Always refill automatically'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Observation + asking > assumptions.'),
  3, ARRAY['anticipatory', 'drinking-pace', 'personalization']),
(10, 8, 'descriptor_l3', 'An older couple dining quietly seems happy and slow-paced. Which are anticipatory moves?',
  jsonb_build_object('prompt', 'An older couple dining quietly seems happy and slow-paced. Which are anticipatory moves?', 'descriptors', ARRAY['Don\'t rush check', 'Offer coffee/after-dinner drinks at their pace', 'Check in less frequently but warmly', 'Notice when they\'re naturally winding down', 'Speed them up'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Pacing should match guest behavior, not venue pressure.'),
  3, ARRAY['anticipatory', 'pacing', 'eldery-guests']),

-- L4: Roleplay Scenarios (3)
(10, 9, 'roleplay', 'You\'re managing 4 tables simultaneously at the bar. Walk through how you\'d anticipate needs at each table—refills, orders, pacing—without forgetting anyone.',
  jsonb_build_object('prompt', 'You\'re managing 4 tables simultaneously at the bar. Walk through how you\'d anticipate needs at each table—refills, orders, pacing—without forgetting anyone.', 'evaluation_dimensions', ARRAY['Multitasking', 'Attention', 'Memory', 'Anticipation']),
  4, ARRAY['anticipatory', 'roleplay', 'multi-table']),
(10, 10, 'roleplay', 'A guest mentions it\'s their birthday (casually). Walk through how you\'d pivot service to make this moment special without over-the-top surprise.',
  jsonb_build_object('prompt', 'A guest mentions it\'s their birthday (casually). Walk through how you\'d pivot service to make this moment special without over-the-top surprise.', 'evaluation_dimensions', ARRAY['Listening', 'Creativity', 'Warmth', 'Natural Celebration']),
  4, ARRAY['anticipatory', 'roleplay', 'special-moments']),
(10, 11, 'roleplay', 'You notice a first-time guest seems nervous/uncomfortable. Walk through how you\'d anticipate their needs and make them feel welcome.',
  jsonb_build_object('prompt', 'You notice a first-time guest seems nervous/uncomfortable. Walk through how you\'d anticipate their needs and make them feel welcome.', 'evaluation_dimensions', ARRAY['Emotional Intelligence', 'Warmth', 'Observation', 'Service Recovery']),
  4, ARRAY['anticipatory', 'roleplay', 'comfort']);

-- Verify counts
SELECT COUNT(*) as part2_count FROM scenarios WHERE module_id BETWEEN 4 AND 10;
