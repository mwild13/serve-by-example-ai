-- Phase 1: Create scenarios table
-- Stores all 238 scenarios across 20 modules (L1, L2, L3, L4)

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  scenario_index INT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('quiz', 'descriptor_l2', 'descriptor_l3', 'roleplay')),
  prompt TEXT NOT NULL,
  content JSONB NOT NULL,
  difficulty INT DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, scenario_index)
);

CREATE INDEX IF NOT EXISTS idx_scenarios_module ON scenarios(module_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_type ON scenarios(scenario_type);
CREATE INDEX IF NOT EXISTS idx_scenarios_tags ON scenarios USING GIN(tags);

-- ===== MODULE 1: POURING THE PERFECT BEER (12 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3 scenarios)
(1, 0, 'quiz', 'What is the ideal head ratio for a beer pour?',
  jsonb_build_object('question', 'What is the ideal head ratio for a beer pour?', 'answer', '1-1.5 inches (correct)', 'explanation', 'Proper head ratio releases carbonation and enhances flavor, while allowing full glass volume.', 'option_type', 'truefalse'),
  1, ARRAY['beer', 'pouring', 'technique']),
(1, 1, 'quiz', 'At what angle should you pour a beer to minimize foam?',
  jsonb_build_object('question', 'At what angle should you pour a beer to minimize foam?', 'answer', '45 degrees initially, then straighten to 90 degrees (correct)', 'explanation', 'Starting at 45° reduces turbulence; straightening builds proper head.', 'option_type', 'truefalse'),
  1, ARRAY['beer', 'pouring', 'angle']),
(1, 2, 'quiz', 'What is the standard beer serving temperature?',
  jsonb_build_object('question', 'What is the standard beer serving temperature?', 'answer', '38-55°F depending on style (correct)', 'explanation', 'Lagers 38-50°F, Ales 50-55°F to preserve flavor compounds.', 'option_type', 'truefalse'),
  1, ARRAY['beer', 'temperature', 'service']),

-- L2: Descriptor Selection (3 scenarios)
(1, 3, 'descriptor_l2', 'A customer orders a stout. Which descriptors apply to proper stout pouring?',
  jsonb_build_object('prompt', 'A customer orders a stout. Which descriptors apply to proper stout pouring?', 'descriptors', ARRAY['Slower pour to minimize overflow', '1.5-inch head to trap aromatics', 'Fast aggressive pour', 'Icy cold glassware', 'Minimal head for full glass'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Stout requires slower pours and proper head to maintain its characteristics.'),
  2, ARRAY['beer', 'stout', 'technique']),
(1, 4, 'descriptor_l2', 'When pouring a lager, which are correct?',
  jsonb_build_object('prompt', 'When pouring a lager, which are correct?', 'descriptors', ARRAY['45° angle to reduce turbulence', 'Serve at 38-45°F', 'At room temperature', 'Maximum head ratio', 'Vertical pour only'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Lagers are crisper at colder temps and require controlled pouring angle.'),
  2, ARRAY['beer', 'lager', 'temperature']),
(1, 5, 'descriptor_l2', 'A guest complains their beer is too foamy. What went wrong?',
  jsonb_build_object('prompt', 'A guest complains their beer is too foamy. What went wrong?', 'descriptors', ARRAY['Glass was dirty or wet', 'Pour was too aggressive', 'Beer was too cold', 'Head ratio was correct', 'Angle was too shallow'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Dirty glassware and aggressive pouring are the main culprits for excessive foam.'),
  2, ARRAY['beer', 'troubleshooting', 'quality']),

-- L3: Advanced Descriptors (3 scenarios)
(1, 6, 'descriptor_l3', 'Troubleshoot: A beer pours with excessive head that won''t settle. What are three factors?',
  jsonb_build_object('prompt', 'Troubleshoot: A beer pours with excessive head that won''t settle. What are three factors?', 'descriptors', ARRAY['Dirty glassware', 'Over-carbonated keg', 'Pour angle too aggressive', 'Temperature too warm', 'Beer style (stout, lager, IPA)'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Multiple factors contribute: glassware cleanliness, keg pressure, and pouring technique.'),
  3, ARRAY['beer', 'troubleshooting', 'advanced']),
(1, 7, 'descriptor_l3', 'A craft IPA should be poured to maximize hop aromatics. Which three apply?',
  jsonb_build_object('prompt', 'A craft IPA should be poured to maximize hop aromatics. Which three apply?', 'descriptors', ARRAY['Tilt glass 45° to release CO2 gradually', 'Serve at 50-55°F', '1-1.25 inch head', 'Pour into clean, dry glass', 'Chill to near-freezing'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'These techniques preserve the delicate hop oils that define IPAs.'),
  3, ARRAY['beer', 'ipa', 'aroma']),
(1, 8, 'descriptor_l3', 'For consistent beer pours across your bar, which three practices matter most?',
  jsonb_build_object('prompt', 'For consistent beer pours across your bar, which three practices matter most?', 'descriptors', ARRAY['Train all staff on angle/technique', 'Clean tap lines weekly', 'Maintain proper keg pressure', 'All beers served at same temp', 'Always use same glassware'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Staff training, equipment maintenance, and pressure control are foundational.'),
  3, ARRAY['beer', 'consistency', 'management']),

-- L4: Roleplay Scenarios (3 scenarios)
(1, 9, 'roleplay', 'A guest at the table is unhappy with their second beer, claiming the first two had too much head. Walk through how you''d pour their next one, explaining each step.',
  jsonb_build_object('prompt', 'A guest at the table is unhappy with their second beer, claiming the first two had too much head. Walk through how you''d pour their next one, explaining each step.', 'evaluation_dimensions', ARRAY['Communication', 'Problem-Solving', 'Attention to Detail', 'Professionalism']),
  4, ARRAY['beer', 'roleplay', 'service']),
(1, 10, 'roleplay', 'A busy Friday night—multiple beer orders at once. Describe your pouring sequence to maintain quality while managing speed.',
  jsonb_build_object('prompt', 'A busy Friday night—multiple beer orders at once. Describe your pouring sequence to maintain quality while managing speed.', 'evaluation_dimensions', ARRAY['Time Management', 'Consistency', 'Safe Handling', 'Communication']),
  4, ARRAY['beer', 'roleplay', 'rush']),
(1, 11, 'roleplay', 'A customer orders "a good pour" of an IPA they''ve never tried. Walk them through what makes it special.',
  jsonb_build_object('prompt', 'A customer orders "a good pour" of an IPA they''ve never tried. Walk them through what makes it special.', 'evaluation_dimensions', ARRAY['Product Knowledge', 'Enthusiasm', 'Technique Explanation', 'Guest Education']),
  4, ARRAY['beer', 'roleplay', 'upsell']);

-- ===== MODULE 2: WINE KNOWLEDGE & SERVICE (15 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (4 scenarios)
(2, 0, 'quiz', 'What is the proper serving temperature for white wine?',
  jsonb_build_object('question', 'What is the proper serving temperature for white wine?', 'answer', '45-50°F (correct)', 'explanation', 'Preserves acidity and floral notes while preventing numbing from extreme cold.', 'option_type', 'truefalse'),
  1, ARRAY['wine', 'temperature', 'service']),
(2, 1, 'quiz', 'Which wine region is known for Pinot Noir?',
  jsonb_build_object('question', 'Which wine region is known for Pinot Noir?', 'answer', 'Burgundy, France OR Willamette Valley, Oregon (correct)', 'explanation', 'Burgundy is historic birthplace; modern Oregonian Pinots rival it.', 'option_type', 'truefalse'),
  1, ARRAY['wine', 'regions', 'knowledge']),
(2, 2, 'quiz', 'What does "dry" mean in wine terminology?',
  jsonb_build_object('question', 'What does "dry" mean in wine terminology?', 'answer', 'Low residual sugar content (correct)', 'explanation', 'All natural sugars converted to alcohol during fermentation.', 'option_type', 'truefalse'),
  1, ARRAY['wine', 'terminology', 'tasting']),
(2, 3, 'quiz', 'What is the proper angle for pouring wine into a glass?',
  jsonb_build_object('question', 'What is the proper angle for pouring wine into a glass?', 'answer', '45-60 degrees to avoid foam and spills (correct)', 'explanation', 'Prevents splashing and preserves wine integrity.', 'option_type', 'truefalse'),
  1, ARRAY['wine', 'pouring', 'technique']),

-- L2: Descriptor Selection (4 scenarios)
(2, 4, 'descriptor_l2', 'A guest orders a light, crisp white for hot weather. Which descriptors match?',
  jsonb_build_object('prompt', 'A guest orders a light, crisp white for hot weather. Which descriptors match?', 'descriptors', ARRAY['Sauvignon Blanc', 'Pinot Grigio', 'Cabernet Sauvignon', 'Oaked Chardonnay', 'Fortified wine'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Light, refreshing whites are perfect for warm weather enjoyment.'),
  2, ARRAY['wine', 'pairing', 'white']),
(2, 5, 'descriptor_l2', 'When serving red wine, which practices are correct?',
  jsonb_build_object('prompt', 'When serving red wine, which practices are correct?', 'descriptors', ARRAY['Serve at 60-65°F', 'Allow wine to breathe 10-15 min if needed', 'Serve chilled like white wine', 'Cork must be synthetic', 'Always decant before serving'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Room temperature service and minimal aeration benefit most reds.'),
  2, ARRAY['wine', 'red', 'service']),
(2, 6, 'descriptor_l2', 'A customer wants wine that pairs with grilled salmon. Which work?',
  jsonb_build_object('prompt', 'A customer wants wine that pairs with grilled salmon. Which work?', 'descriptors', ARRAY['Pinot Noir', 'Sauvignon Blanc', 'Cabernet Sauvignon', 'Port wine', 'Rosé only'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Lighter reds and crisp whites complement salmon''s delicate flavors.'),
  2, ARRAY['wine', 'pairing', 'food']),
(2, 7, 'descriptor_l2', 'Which are signs of proper wine service at your table?',
  jsonb_build_object('prompt', 'Which are signs of proper wine service at your table?', 'descriptors', ARRAY['Present bottle label to guest', 'Pour from guest''s right side', 'Fill glass completely full', 'Pour for ladies first always', 'Never ask if guest wants more'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Label presentation and right-side service are professional standards.'),
  2, ARRAY['wine', 'service', 'etiquette']),

-- L3: Advanced Descriptors (4 scenarios)
(2, 8, 'descriptor_l3', 'An Australian Shiraz at $40/bottle appeals to which three guest profiles?',
  jsonb_build_object('prompt', 'An Australian Shiraz at $40/bottle appeals to which three guest profiles?', 'descriptors', ARRAY['Guests seeking bold, fruit-forward wines', 'Those trying Australian wine', 'Diners with grilled/spiced food', 'First-time wine drinkers wanting approachability', 'Minimalist palate seekers'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Shiraz is approachable, food-friendly, and offers value at mid-price points.'),
  3, ARRAY['wine', 'australia', 'upsell']),
(2, 9, 'descriptor_l3', 'To upsell wine effectively, which three elements matter?',
  jsonb_build_object('prompt', 'To upsell wine effectively, which three elements matter?', 'descriptors', ARRAY['Ask about food choice first', 'Suggest by price point', 'Tell a story about the wine', 'Offer taste before committing', 'Always push highest margin'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Personalization, storytelling, and sampling build guest confidence.'),
  3, ARRAY['wine', 'upsell', 'sales']),
(2, 10, 'descriptor_l3', 'When a wine tastes off/corky, which three actions should you take?',
  jsonb_build_object('prompt', 'When a wine tastes off/corky, which three actions should you take?', 'descriptors', ARRAY['Smell cork first to diagnose', 'Offer immediate replacement', 'Taste to confirm issue', 'Apologize without defensiveness', 'Insist nothing is wrong'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Guest satisfaction is paramount; swift action and apology matter.'),
  3, ARRAY['wine', 'quality', 'service-recovery']),
(2, 11, 'descriptor_l3', 'A guest mentions they''re allergic to sulfites in wine. How do you proceed?',
  jsonb_build_object('prompt', 'A guest mentions they''re allergic to sulfites in wine. How do you proceed?', 'descriptors', ARRAY['Take the concern seriously', 'Consult manager or wine list for information', 'Offer non-wine alternatives', 'Assure them all wines are sulfite-free (false)', 'Suggest they choose beer instead'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Sulfite sensitivity is real; acknowledge and offer options respectfully.'),
  3, ARRAY['wine', 'allergies', 'knowledge']),

-- L4: Roleplay Scenarios (3 scenarios)
(2, 12, 'roleplay', 'A guest at the table is from a wine region (e.g., Napa Valley). They order wine. Walk through how you''d interact, balancing respect for their knowledge with your expertise.',
  jsonb_build_object('prompt', 'A guest at the table is from a wine region (e.g., Napa Valley). They order wine. Walk through how you''d interact, balancing respect for their knowledge with your expertise.', 'evaluation_dimensions', ARRAY['Humility', 'Confidence', 'Product Knowledge', 'Ability to Pivot']),
  4, ARRAY['wine', 'roleplay', 'service']),
(2, 13, 'roleplay', 'A couple on a first date orders wine. One chose white, one red. Walk through service and conversation that makes both feel welcome and might lead to future visits.',
  jsonb_build_object('prompt', 'A couple on a first date orders wine. One chose white, one red. Walk through service and conversation that makes both feel welcome and might lead to future visits.', 'evaluation_dimensions', ARRAY['Attentiveness', 'Personalization', 'Wine Knowledge', 'Memorable Service']),
  4, ARRAY['wine', 'roleplay', 'experience']),
(2, 14, 'roleplay', 'A guest orders a Cabernet at $80/bottle but the wine list has a $45 option that''s better-reviewed. Walk through the recommendation without sounding pushy.',
  jsonb_build_object('prompt', 'A guest orders a Cabernet at $80/bottle but the wine list has a $45 option that''s better-reviewed. Walk through the recommendation without sounding pushy.', 'evaluation_dimensions', ARRAY['Product Knowledge', 'Tact', 'Problem-Solving', 'Sales Skill']),
  4, ARRAY['wine', 'roleplay', 'upsell']);

-- ===== MODULE 3: COCKTAIL FUNDAMENTALS (14 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Rapid-Fire Quiz (3 scenarios)
(3, 0, 'quiz', 'What is the standard jigger measurement for a cocktail spirit pour?',
  jsonb_build_object('question', 'What is the standard jigger measurement for a cocktail spirit pour?', 'answer', '1.5 oz (45ml) in Australia (correct)', 'explanation', 'Australian standard is 30ml for spirit, plus mixers/modifiers totaling 45ml drink.', 'option_type', 'truefalse'),
  1, ARRAY['cocktails', 'measurement', 'australia']),
(3, 1, 'quiz', 'When shaking a cocktail, how long should you shake?',
  jsonb_build_object('question', 'When shaking a cocktail, how long should you shake?', 'answer', '10-15 seconds (correct)', 'explanation', 'Long enough to chill, dilute, and integrate ingredients without over-diluting.', 'option_type', 'truefalse'),
  1, ARRAY['cocktails', 'technique', 'shaking']),
(3, 2, 'quiz', 'What is the proper ratio for a Margarita (spirit-forward cocktail)?',
  jsonb_build_object('question', 'What is the proper ratio for a Margarita (spirit-forward cocktail)?', 'answer', '2 parts spirit, 1 part citrus, 1 part liqueur (correct)', 'explanation', 'Classic 2:1:1 ratio; adjust to taste preference.', 'option_type', 'truefalse'),
  1, ARRAY['cocktails', 'margarita', 'ratios']),

-- L2: Descriptor Selection (4 scenarios)
(3, 3, 'descriptor_l2', 'A guest orders a Daiquiri. Which are correct preparation steps?',
  jsonb_build_object('prompt', 'A guest orders a Daiquiri. Which are correct preparation steps?', 'descriptors', ARRAY['Shake with ice, strain into coup glass', 'Measure 1.5oz rum, 0.75oz lime, 0.5oz simple syrup', 'Stir in mixing glass, no ice', 'Add Coke', 'Serve over ice'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Daiquiri is a shake-and-strain drink with precise ratios.'),
  2, ARRAY['cocktails', 'daiquiri', 'technique']),
(3, 4, 'descriptor_l2', 'When building a cocktail at the bar, which practices minimize waste and look professional?',
  jsonb_build_object('prompt', 'When building a cocktail at the bar, which practices minimize waste and look professional?', 'descriptors', ARRAY['Pre-chill glasses when possible', 'Batch similar cocktails to save ice/time', 'Free-pour without measuring', 'Remix failed drinks back into bottles', 'Ignore guest preferences'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Efficiency and consistency are hallmarks of good bar practice.'),
  2, ARRAY['cocktails', 'efficiency', 'management']),
(3, 5, 'descriptor_l2', 'A Negroni (stirred, spirit-forward) should be served:',
  jsonb_build_object('prompt', 'A Negroni (stirred, spirit-forward) should be served:', 'descriptors', ARRAY['Over ice in a rocks glass', 'With orange peel garnish', 'Shaken into coup glass', 'With cherry garnish', 'Blended'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Stirred drinks are served up or on rocks; garnish enhances flavor and presentation.'),
  2, ARRAY['cocktails', 'negroni', 'service']),
(3, 6, 'descriptor_l2', 'Which garnishes enhance flavor vs. purely visual?',
  jsonb_build_object('prompt', 'Which garnishes enhance flavor vs. purely visual?', 'descriptors', ARRAY['Citrus zest oils flavor the drink', 'Fresh herbs like mint impart taste', 'Cherry is purely decorative', 'Umbrella adds flavor', 'Straws matter to taste'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Citrus and fresh herbs are aromatic; others are mostly visual.'),
  2, ARRAY['cocktails', 'garnish', 'flavor']),

-- L3: Advanced Descriptors (4 scenarios)
(3, 7, 'descriptor_l3', 'A guest asks for a "smooth whiskey cocktail that isn''t a Manhattan." Which three options fit?',
  jsonb_build_object('prompt', 'A guest asks for a "smooth whiskey cocktail that isn''t a Manhattan." Which three options fit?', 'descriptors', ARRAY['Old Fashioned', 'Sazerac', 'Smash (whiskey, mint, fruit)', 'Whiskey Sour', 'Margarita'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'These are all smooth, whiskey-based classics with different flavor profiles.'),
  3, ARRAY['cocktails', 'whiskey', 'recommendations']),
(3, 8, 'descriptor_l3', 'To create a seasonal cocktail riff on a classic Margarita, which three modifications work?',
  jsonb_build_object('prompt', 'To create a seasonal cocktail riff on a classic Margarita, which three modifications work?', 'descriptors', ARRAY['Swap lime for passion fruit', 'Add fresh herbs like basil', 'Use aged spirits instead of blanco', 'Infuse sugar syrup with spice', 'Remove spirit entirely'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Creative variations maintain the structure while refreshing the flavor profile.'),
  3, ARRAY['cocktails', 'variations', 'creativity']),
(3, 9, 'descriptor_l3', 'When a guest requests a custom cocktail based on their flavor profile, which are pro moves?',
  jsonb_build_object('prompt', 'When a guest requests a custom cocktail based on their flavor profile, which are pro moves?', 'descriptors', ARRAY['Ask about spirit preference first', 'Suggest structure (spirit-forward vs fruity)', 'Offer to make a taster first', 'Build on classic ratios you know work', 'Guess wildly'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Structured approach to custom drinks prevents wasted ingredients and builds guest confidence.'),
  3, ARRAY['cocktails', 'custom', 'creativity']),
(3, 10, 'descriptor_l3', 'To master bartending fundamentals, which three foundational skills matter most?',
  jsonb_build_object('prompt', 'To master bartending fundamentals, which three foundational skills matter most?', 'descriptors', ARRAY['Precise measurement and pouring', 'Understanding flavor balance', 'Knowing classic cocktail structures', 'Free-pouring style', 'Using the most expensive spirits'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Precision, flavor knowledge, and classic structure are the foundation of skilled bartending.'),
  3, ARRAY['cocktails', 'fundamentals', 'mastery']),

-- L4: Roleplay Scenarios (3 scenarios)
(3, 11, 'roleplay', 'A guest at your bar has never had a cocktail. Walk through how you''d recommend one, build it, and explain what makes it special.',
  jsonb_build_object('prompt', 'A guest at your bar has never had a cocktail. Walk through how you''d recommend one, build it, and explain what makes it special.', 'evaluation_dimensions', ARRAY['Education', 'Confidence', 'Technique', 'Hospitality']),
  4, ARRAY['cocktails', 'roleplay', 'education']),
(3, 12, 'roleplay', 'Two bartenders on shift; you''re covered in orders. Describe your prioritization, batch-making strategy, and how you maintain quality under pressure.',
  jsonb_build_object('prompt', 'Two bartenders on shift; you''re covered in orders. Describe your prioritization, batch-making strategy, and how you maintain quality under pressure.', 'evaluation_dimensions', ARRAY['Time Management', 'Consistency', 'Communication', 'Professionalism']),
  4, ARRAY['cocktails', 'roleplay', 'rush']),
(3, 13, 'roleplay', 'A guest says their cocktail tastes "off"—maybe too strong, too sweet, too bitter. Walk through your diagnostic and fix without making them feel bad.',
  jsonb_build_object('prompt', 'A guest says their cocktail tastes "off"—maybe too strong, too sweet, too bitter. Walk through your diagnostic and fix without making them feel bad.', 'evaluation_dimensions', ARRAY['Problem-Solving', 'Empathy', 'Technical Skill', 'Service Recovery']),
  4, ARRAY['cocktails', 'roleplay', 'quality']);

-- Verify counts
SELECT COUNT(*) as scenario_count FROM scenarios WHERE module_id BETWEEN 1 AND 3;
