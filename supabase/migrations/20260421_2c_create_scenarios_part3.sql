-- Phase 1: Create scenarios - Part 3 (Modules 11-20) + Diagnostic Questions
-- Final scenarios for Complaints through Inventory & Waste Control, plus diagnostic assessment questions

-- ===== MODULE 11: HANDLING GUEST COMPLAINTS (13 scenarios) =====
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- L1: Quiz (3)
(11, 0, 'quiz', 'What should you say first when a guest complains?',
  jsonb_build_object('question', 'What should you say first when a guest complains?', 'answer', '"I\'m sorry this happened" or "Thank you for telling me" (not "That\'s not right") (correct)', 'explanation', 'Acknowledges their concern before defending.', 'option_type', 'truefalse'),
  1, ARRAY['complaints', 'empathy', 'response']),
(11, 1, 'quiz', 'If a guest complains about food temperature, what\'s your immediate action?',
  jsonb_build_object('question', 'If a guest complains about food temperature, what\'s your immediate action?', 'answer', 'Offer to remake it or provide alternatives without arguing (correct)', 'explanation', 'Solves the problem; prevents escalation.', 'option_type', 'truefalse'),
  1, ARRAY['complaints', 'food-quality', 'action']),
(11, 2, 'quiz', 'When should you involve a manager in a complaint?',
  jsonb_build_object('question', 'When should you involve a manager in a complaint?', 'answer', 'When compensation (discount, free item) is needed, or if guest is very upset (correct)', 'explanation', 'Manager has authority; shows seriousness.', 'option_type', 'truefalse'),
  1, ARRAY['complaints', 'escalation', 'management']),

-- L2: Descriptors (3)
(11, 3, 'descriptor_l2', 'A guest says their cocktail is too strong. How do you respond?',
  jsonb_build_object('prompt', 'A guest says their cocktail is too strong. How do you respond?', 'descriptors', ARRAY['Apologize', 'Offer to remake it with lighter pour or different spirit', 'Defend the recipe', 'Suggest they\'re not sophisticated enough', 'Ignore them'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Acknowledge and solve; never defend against complaints.'),
  2, ARRAY['complaints', 'cocktails', 'service-recovery']),
(11, 4, 'descriptor_l2', 'A guest found something in their food (not a safety issue, just an oddity). What\'s your response?',
  jsonb_build_object('prompt', 'A guest found something in their food (not a safety issue, just an oddity). What\'s your response?', 'descriptors', ARRAY['Thank them for notifying us', 'Offer replacement and apology', 'Tell them it\'s normal', 'Blame the kitchen', 'Charge them for the issue'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Thank them, replace, apologize—never defend.'),
  2, ARRAY['complaints', 'food-quality', 'response']),
(11, 5, 'descriptor_l2', 'A guest complains about wait time (they arrived without reservation). How do you handle it?',
  jsonb_build_object('prompt', 'A guest complains about wait time (they arrived without reservation). How do you handle it?', 'descriptors', ARRAY['Validate their frustration', 'Explain honestly without blaming', 'Offer compensation (free drink, discount) if appropriate', 'Tell them they should\'ve called ahead', 'Blame the kitchen'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Validation + honesty + compensation = recovery.'),
  2, ARRAY['complaints', 'wait-time', 'empathy']),

-- L3: Advanced (4)
(11, 6, 'descriptor_l3', 'A complaint escalates and guest is raising voice. Which three steps prevent further escalation?',
  jsonb_build_object('prompt', 'A complaint escalates and guest is raising voice. Which three steps prevent further escalation?', 'descriptors', ARRAY['Stay calm and lower your voice', 'Listen without interrupting', 'Validate their feeling even if you disagree', 'Offer solution immediately', 'Raise your voice back'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Calm demeanor + listening + validation defuse tension.'),
  3, ARRAY['complaints', 'escalation', 'de-escalation']),
(11, 7, 'descriptor_l3', 'You\'ve identified the problem and guest is still upset. Which three recovery moves work best?',
  jsonb_build_object('prompt', 'You\'ve identified the problem and guest is still upset. Which three recovery moves work best?', 'descriptors', ARRAY['Offer compensation (remake, discount, free item)', 'Explain what you\'ll do to prevent it next time', 'Follow up after resolution', 'Dismiss their feelings', 'Don\'t follow up'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Compensation + explanation + follow-up = trust restored.'),
  3, ARRAY['complaints', 'recovery', 'management']),
(11, 8, 'descriptor_l3', 'To handle a complaint about staff behavior (rudeness, slowness), which three approaches work?',
  jsonb_build_object('prompt', 'To handle a complaint about staff behavior (rudeness, slowness), which three approaches work?', 'descriptors', ARRAY['Listen without defending the staff member', 'Acknowledge the experience', 'Apologize on behalf of the team', 'Offer to speak with staff + compensation', 'Blame the staff member loudly'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Listen + acknowledge + apologize + action = recovery.'),
  3, ARRAY['complaints', 'staff-behavior', 'accountability']),
(11, 9, 'descriptor_l3', 'A regular customer complains about something minor after years of positive visits. How do you approach?',
  jsonb_build_object('prompt', 'A regular customer complains about something minor after years of positive visits. How do you approach?', 'descriptors', ARRAY['Express appreciation for their loyalty first', 'Take the complaint seriously despite history', 'Assume something\'s genuinely wrong (maybe a bad day)', 'Offer extra gesture of goodwill', 'Minimize complaint because they\'re a regular'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Loyalty + concern + extra care = relationship preserved.'),
  3, ARRAY['complaints', 'regulars', 'loyalty']),

-- L4: Roleplay (3)
(11, 10, 'roleplay', 'A guest\'s food arrived cold. Walk through your response: acknowledgment, solution, compensation, ensuring they feel the issue was taken seriously.',
  jsonb_build_object('prompt', 'A guest\'s food arrived cold. Walk through your response: acknowledgment, solution, compensation, ensuring they feel the issue was taken seriously.', 'evaluation_dimensions', ARRAY['Empathy', 'Problem-Solving', 'Authority', 'Grace']),
  4, ARRAY['complaints', 'roleplay', 'food-quality']),
(11, 11, 'roleplay', 'A guest claims they were overcharged. You check the receipt and they\'re right—staff made an error. Walk through your handling: apology, correction, compensation.',
  jsonb_build_object('prompt', 'A guest claims they were overcharged. You check the receipt and they\'re right—staff made an error. Walk through your handling: apology, correction, compensation.', 'evaluation_dimensions', ARRAY['Accountability', 'Fairness', 'Problem-Solving', 'Trust-Building']),
  4, ARRAY['complaints', 'roleplay', 'billing']),
(11, 12, 'roleplay', 'A guest had a genuinely bad experience (multiple issues) and is considering never returning. Walk through your comprehensive recovery—how do you win them back?',
  jsonb_build_object('prompt', 'A guest had a genuinely bad experience (multiple issues) and is considering never returning. Walk through your comprehensive recovery—how do you win them back?', 'evaluation_dimensions', ARRAY['Empathy', 'Accountability', 'Compensation Judgment', 'Follow-Up Thinking']),
  4, ARRAY['complaints', 'roleplay', 'recovery']);

-- ===== MODULES 12-20: Summary inserts (focusing on key L4 scenarios) =====
-- Module 12: Up-selling & Sales (12 total) - Abbreviated
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(12, 0, 'quiz', 'What is the difference between upselling and pushy sales?',
  jsonb_build_object('question', 'What is the difference between upselling and pushy sales?', 'answer', 'Upselling: recommend based on guest preference; Pushy: sell what benefits restaurant (correct)', 'explanation', 'Upselling feels helpful; pushy feels self-serving.', 'option_type', 'truefalse'),
  1, ARRAY['upselling', 'sales', 'ethics']),
(12, 1, 'quiz', 'When is the best time to suggest a premium drink option?',
  jsonb_build_object('question', 'When is the best time to suggest a premium drink option?', 'answer', 'After asking what they like, not before taking the order (correct)', 'explanation', 'Recommendation feels personal, not scripted.', 'option_type', 'truefalse'),
  1, ARRAY['upselling', 'timing', 'personalization']),
(12, 2, 'quiz', 'What should you say when upselling?',
  jsonb_build_object('question', 'What should you say when upselling?', 'answer', '"Based on what you just said, you might like..." (correct)', 'explanation', 'Connects recommendation to guest\'s stated preference.', 'option_type', 'truefalse'),
  1, ARRAY['upselling', 'language', 'technique']),
(12, 3, 'descriptor_l2', 'A guest orders "whatever red wine." How do you suggest upselling?',
  jsonb_build_object('prompt', 'A guest orders "whatever red wine." How do you suggest upselling?', 'descriptors', ARRAY['Ask what they like in wine (dry, fruity, bold)', 'Recommend a mid-tier option they might love', 'Push the most expensive bottle', 'Give them the house pour', 'Assume all reds are the same to them'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Ask first, recommend personalized, never push.'),
  2, ARRAY['upselling', 'wine', 'personalization']),
(12, 4, 'descriptor_l2', 'Someone orders a beer. You notice they mentioned bold flavors. How do you upsell?',
  jsonb_build_object('prompt', 'Someone orders a beer. You notice they mentioned bold flavors. How do you upsell?', 'descriptors', ARRAY['Suggest a craft IPA or stout based on preference', 'Mention why it pairs well', 'Push whatever\'s high-margin', 'Suggest something opposite of what they said', 'Don\'t mention other options'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Listen, match preferences, explain pairing.'),
  2, ARRAY['upselling', 'beer', 'listening']),
(12, 5, 'descriptor_l2', 'A guest orders a cocktail. What\'s a natural upsell moment?',
  jsonb_build_object('prompt', 'A guest orders a cocktail. What\'s a natural upsell moment?', 'descriptors', ARRAY['Offer premium spirit upgrade', 'Suggest a shareable appetizer to complement', 'Immediately push a second cocktail', 'Suggest dessert before they\'ve started eating', 'Don\'t acknowledge their order'], 'correctIndices', ARRAY[0, 1], 'explanation', 'Premium spirit or pairing = natural upsell.'),
  2, ARRAY['upselling', 'cocktails', 'pairings']),
(12, 6, 'descriptor_l3', 'To upsell without sounding salesy, which three techniques work?',
  jsonb_build_object('prompt', 'To upsell without sounding salesy, which three techniques work?', 'descriptors', ARRAY['Ask questions first (listen to preferences)', 'Make recommendation about taste, not price', 'Offer "special" or "chef\'s choice" framing', 'Use storytelling (origin, craftsmanship)', 'Always push top-margin item'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Listen, focus on taste, tell stories.'),
  3, ARRAY['upselling', 'technique', 'authenticity']),
(12, 7, 'descriptor_l3', 'You notice a guest ordered a cocktail and seems enjoying the experience. Which upsells feel natural?',
  jsonb_build_object('prompt', 'You notice a guest ordered a cocktail and seems enjoying the experience. Which upsells feel natural?', 'descriptors', ARRAY['Suggest a food pairing', 'Offer a premium spirit riff on the same drink', 'Mention an after-dinner option in 15 min', 'Ask if they\'d like to try a house specialty', 'Push three items aggressively'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Build on momentum; suggest complementary items.'),
  3, ARRAY['upselling', 'pacing', 'pairing']),
(12, 8, 'descriptor_l3', 'A table of budget-conscious guests (they asked for specials). How do you upsell with respect?',
  jsonb_build_object('prompt', 'A table of budget-conscious guests (they asked for specials). How do you upsell with respect?', 'descriptors', ARRAY['Recommend the best VALUE option, not priciest', 'Offer shareable items at good price point', 'Suggest premium experience without it feeling expensive', 'Respect if they decline', 'Push expensive items anyway'], 'correctIndices', ARRAY[0, 1, 2], 'explanation', 'Value-focused upselling respects guest budget.'),
  3, ARRAY['upselling', 'budget', 'respect']),
(12, 9, 'roleplay', 'A couple on a first date orders modest drinks/food. Walk through how you\'d naturally enhance their experience (premium pairings, special touches) without making them uncomfortable.',
  jsonb_build_object('prompt', 'A couple on a first date orders modest drinks/food. Walk through how you\'d naturally enhance their experience (premium pairings, special touches) without making them uncomfortable.', 'evaluation_dimensions', ARRAY['Sensitivity', 'Sales Skill', 'Hospitality', 'Comfort Assessment']),
  4, ARRAY['upselling', 'roleplay', 'first-date']),
(12, 10, 'roleplay', 'A regular customer who always orders the same thing comes in. Walk through how you\'d introduce them to something new they\'d genuinely love, without implying their usual choice was wrong.',
  jsonb_build_object('prompt', 'A regular customer who always orders the same thing comes in. Walk through how you\'d introduce them to something new they\'d genuinely love, without implying their usual choice was wrong.', 'evaluation_dimensions', ARRAY['Product Knowledge', 'Personalization', 'Subtlety', 'Loyalty-Building']),
  4, ARRAY['upselling', 'roleplay', 'regulars']),
(12, 11, 'roleplay', 'A guest ordered a $30 bottle of wine. You notice a $60 option that\'s a significant upgrade in quality. Walk through how you\'d offer it without sounding greedy.',
  jsonb_build_object('prompt', 'A guest ordered a $30 bottle of wine. You notice a $60 option that\'s a significant upgrade in quality. Walk through how you\'d offer it without sounding greedy.', 'evaluation_dimensions', ARRAY['Product Knowledge', 'Tact', 'Judgment', 'Premium Positioning']),
  4, ARRAY['upselling', 'roleplay', 'wine']);

-- ===== MODULE 13-20: Core Scenarios (abbreviated, focusing on critical L1/L4) =====
-- Module 13: VIP/Table Management (12 total) - 1 L1, 3 L4
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(13, 0, 'quiz', 'What defines a VIP guest in your venue?',
  jsonb_build_object('question', 'What defines a VIP guest in your venue?', 'answer', 'Regular customers with high spend, influencers, celebrities, special occasions (correct)', 'explanation', 'Different venues have different VIPs.', 'option_type', 'truefalse'),
  1, ARRAY['vip', 'recognition', 'management']),
(13, 9, 'roleplay', 'A VIP celebrity quietly arrives with a companion and requests privacy (no photos, low-key). Walk through how you\'d honor this while providing excellent service.',
  jsonb_build_object('prompt', 'A VIP celebrity quietly arrives with a companion and requests privacy (no photos, low-key). Walk through how you\'d honor this while providing excellent service.', 'evaluation_dimensions', ARRAY['Discretion', 'Professionalism', 'Privacy/Attention Balance', 'Teamwork']),
  4, ARRAY['vip', 'roleplay', 'celebrity']),
(13, 10, 'roleplay', 'A VIP makes a special request that your venue hasn\'t done before. Walk through how you\'d problem-solve with kitchen/manager.',
  jsonb_build_object('prompt', 'A VIP makes a special request that your venue hasn\'t done before. Walk through how you\'d problem-solve with kitchen/manager.', 'evaluation_dimensions', ARRAY['Creativity', 'Can-Do Attitude', 'Stakeholder Management', 'Hospitality']),
  4, ARRAY['vip', 'roleplay', 'customization']),
(13, 11, 'roleplay', 'A regular customer who\'s usually high-maintenance seems upset. Walk through your approach to turning it around.',
  jsonb_build_object('prompt', 'A regular customer who\'s usually high-maintenance seems upset. Walk through your approach to turning it around.', 'evaluation_dimensions', ARRAY['Empathy', 'Recognition', 'Service Recovery', 'Loyalty-Building']),
  4, ARRAY['vip', 'roleplay', 'high-maintenance']);

-- Modules 14-20: Minimal seeding (1 L1 + 2 L4 per module for brevity)
-- Module 14: Phone Etiquette
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
(14, 0, 'quiz', 'What should you say when answering the phone?',
  jsonb_build_object('question', 'What should you say when answering the phone?', 'answer', '"[Venue name], how can I help you?" or "[Venue], this is [name], how may I assist?" (correct)', 'explanation', 'Professional, welcoming, clear.', 'option_type', 'truefalse'),
  1, ARRAY['phone', 'etiquette', 'greeting']),
(14, 9, 'roleplay', 'A caller requests a reservation but your venue is fully booked. Walk through how you\'d handle their disappointment—alternative options, follow-up.',
  jsonb_build_object('prompt', 'A caller requests a reservation but your venue is fully booked. Walk through how you\'d handle their disappointment—alternative options, follow-up.', 'evaluation_dimensions', ARRAY['Problem-Solving', 'Empathy', 'Business Thinking', 'Loyalty-Building']),
  4, ARRAY['phone', 'roleplay', 'reservations']),
(14, 10, 'roleplay', 'A regular calls for a reservation and mentions they\'re celebrating something. Walk through your service from phone to arrival.',
  jsonb_build_object('prompt', 'A regular calls for a reservation and mentions they\'re celebrating something. Walk through your service from phone to arrival.', 'evaluation_dimensions', ARRAY['Attention to Detail', 'Follow-Through', 'Personalization', 'Consistency']),
  4, ARRAY['phone', 'roleplay', 'celebrations']);

-- Modules 15-20 (Compliance): Targeted L1 + L4 seeding
INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES
-- Module 15: RSA
(15, 0, 'quiz', 'What is the legal drinking age in Australia?',
  jsonb_build_object('question', 'What is the legal drinking age in Australia?', 'answer', '18 years (correct)', 'explanation', 'Serve alcohol only to 18+; ask for ID if appearance suggests under-25.', 'option_type', 'truefalse'),
  1, ARRAY['rsa', 'legal', 'australia']),
(15, 10, 'roleplay', 'A friend of a regular customer is getting intoxicated and becoming belligerent. The regular asks you to keep serving them "just one more." Walk through how you\'d handle this professionally.',
  jsonb_build_object('prompt', 'A friend of a regular customer is getting intoxicated and becoming belligerent. The regular asks you to keep serving them "just one more." Walk through how you\'d handle this professionally.', 'evaluation_dimensions', ARRAY['Firmness', 'Empathy', 'Legal Knowledge', 'Conflict Management']),
  4, ARRAY['rsa', 'roleplay', 'intoxication']),
(15, 11, 'roleplay', 'You refuse service to someone and they get angry, claiming you\'re discriminating. Walk through your response—professional, factual, not defensive.',
  jsonb_build_object('prompt', 'You refuse service to someone and they get angry, claiming you\'re discriminating. Walk through your response—professional, factual, not defensive.', 'evaluation_dimensions', ARRAY['Confidence', 'Composure', 'Communication', 'Legal Standing']),
  4, ARRAY['rsa', 'roleplay', 'refusal']),

-- Module 16: Food Safety
(16, 0, 'quiz', 'What is the safe temperature for cooked chicken/meat?',
  jsonb_build_object('question', 'What is the safe temperature for cooked chicken/meat?', 'answer', '75°C (165°F) internal temperature (correct)', 'explanation', 'Kills harmful bacteria; measured with food thermometer.', 'option_type', 'truefalse'),
  1, ARRAY['food-safety', 'temperature', 'cooking']),
(16, 8, 'roleplay', 'A guest orders a dish but mentions a severe shellfish allergy at the last minute. Walk through how you\'d communicate this to the kitchen and ensure absolute safety.',
  jsonb_build_object('prompt', 'A guest orders a dish but mentions a severe shellfish allergy at the last minute. Walk through how you\'d communicate this to the kitchen and ensure absolute safety.', 'evaluation_dimensions', ARRAY['Urgency', 'Clarity', 'Follow-Through', 'Risk Awareness']),
  4, ARRAY['food-safety', 'roleplay', 'allergies']),
(16, 9, 'roleplay', 'You notice food that\'s been left out during service. Walk through how you\'d address it—education vs. enforcement.',
  jsonb_build_object('prompt', 'You notice food that\'s been left out during service. Walk through how you\'d address it—education vs. enforcement.', 'evaluation_dimensions', ARRAY['Professionalism', 'Knowledge', 'Teamwork', 'Safety Priority']),
  4, ARRAY['food-safety', 'roleplay', 'temperature']),

-- Module 17: Conflict De-escalation
(17, 0, 'quiz', 'What is the first sign of potential conflict to watch for?',
  jsonb_build_object('question', 'What is the first sign of potential conflict to watch for?', 'answer', 'Raised voices, clenched fists, aggressive body language (correct)', 'explanation', 'Early intervention prevents escalation.', 'option_type', 'truefalse'),
  1, ARRAY['conflict', 'de-escalation', 'observation']),
(17, 9, 'roleplay', 'Two guests are debating politics loudly; voices are rising. Walk through how you\'d read the situation and de-escalate before it affects other tables.',
  jsonb_build_object('prompt', 'Two guests are debating politics loudly; voices are rising. Walk through how you\'d read the situation and de-escalate before it affects other tables.', 'evaluation_dimensions', ARRAY['Observation', 'Timing', 'Tact', 'Intervention Skill']),
  4, ARRAY['conflict', 'roleplay', 'debate']),
(17, 10, 'roleplay', 'Security/police might need to be involved because a guest is refusing to leave. Walk through the handoff—your role, communication, supporting the guest where possible.',
  jsonb_build_object('prompt', 'Security/police might need to be involved because a guest is refusing to leave. Walk through the handoff—your role, communication, supporting the guest where possible.', 'evaluation_dimensions', ARRAY['Recognition of Limits', 'Communication', 'Teamwork', 'Safety Priority']),
  4, ARRAY['conflict', 'roleplay', 'escalation']),

-- Module 18: Emergency Evacuation
(18, 0, 'quiz', 'What is your first action if the fire alarm sounds?',
  jsonb_build_object('question', 'What is your first action if the fire alarm sounds?', 'answer', 'Alert guests calmly and begin orderly evacuation (correct)', 'explanation', 'Prevent panic; follow emergency procedures.', 'option_type', 'truefalse'),
  1, ARRAY['evacuation', 'fire', 'safety']),
(18, 8, 'roleplay', 'Fire alarm sounds during a packed Friday night. Walk through your immediate actions: alerting guests, assisting evacuees, reaching assembly point.',
  jsonb_build_object('prompt', 'Fire alarm sounds during a packed Friday night. Walk through your immediate actions: alerting guests, assisting evacuees, reaching assembly point.', 'evaluation_dimensions', ARRAY['Composure', 'Procedure Knowledge', 'Leadership', 'Care']),
  4, ARRAY['evacuation', 'roleplay', 'rush']),
(18, 9, 'roleplay', 'Post-evacuation headcount shows someone missing. Walk through reporting and next steps.',
  jsonb_build_object('prompt', 'Post-evacuation headcount shows someone missing. Walk through reporting and next steps.', 'evaluation_dimensions', ARRAY['Accountability', 'Urgency', 'Communication', 'Procedure Knowledge']),
  4, ARRAY['evacuation', 'roleplay', 'accountability']),

-- Module 19: Opening & Closing
(19, 0, 'quiz', 'What is the standard opening checklist for the bar?',
  jsonb_build_object('question', 'What is the standard opening checklist for the bar?', 'answer', 'Check equipment, stock supplies, ensure glassware is clean, verify ice levels, test POS system (correct)', 'explanation', 'Ensures readiness for service.', 'option_type', 'truefalse'),
  1, ARRAY['opening', 'closing', 'preparation']),
(19, 10, 'roleplay', 'You\'re opening and discover significant damage from last night (broken glass, scattered bottles). Walk through your assessment and next steps.',
  jsonb_build_object('prompt', 'You\'re opening and discover significant damage from last night (broken glass, scattered bottles). Walk through your assessment and next steps.', 'evaluation_dimensions', ARRAY['Problem-Solving', 'Safety', 'Communication', 'Accountability']),
  4, ARRAY['opening', 'roleplay', 'damage']),
(19, 11, 'roleplay', 'You\'re closing on Friday night and the kitchen is still running behind, but you need to close the bar. Walk through how you\'d navigate this with kitchen staff.',
  jsonb_build_object('prompt', 'You\'re closing on Friday night and the kitchen is still running behind, but you need to close the bar. Walk through how you\'d navigate this with kitchen staff.', 'evaluation_dimensions', ARRAY['Communication', 'Flexibility', 'Teamwork', 'Respect for Schedules']),
  4, ARRAY['closing', 'roleplay', 'kitchen']),

-- Module 20: Inventory & Waste
(20, 0, 'quiz', 'What does "FIFO" mean in inventory management?',
  jsonb_build_object('question', 'What does "FIFO" mean in inventory management?', 'answer', 'First In, First Out—use oldest stock first (correct)', 'explanation', 'Prevents spoilage and expired products.', 'option_type', 'truefalse'),
  1, ARRAY['inventory', 'waste', 'management']),
(20, 9, 'roleplay', 'A regular customer always gets "extra" in their drink from a bartender. You suspect this is happening. Walk through how you\'d investigate and address it.',
  jsonb_build_object('prompt', 'A regular customer always gets "extra" in their drink from a bartender. You suspect this is happening. Walk through how you\'d investigate and address it.', 'evaluation_dimensions', ARRAY['Discretion', 'Problem-Solving', 'Fairness', 'Professionalism']),
  4, ARRAY['inventory', 'roleplay', 'overpouring']),
(20, 10, 'roleplay', 'End-of-month inventory shows a $3,000 discrepancy. Walk through how you\'d present this to management and discuss solutions.',
  jsonb_build_object('prompt', 'End-of-month inventory shows a $3,000 discrepancy. Walk through how you\'d present this to management and discuss solutions.', 'evaluation_dimensions', ARRAY['Data Analysis', 'Communication', 'Problem-Solving', 'Accountability']),
  4, ARRAY['inventory', 'roleplay', 'discrepancy']);

-- Create diagnostic_questions table
CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  target_categories TEXT[] NOT NULL,
  explanation TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_active ON diagnostic_questions(is_active);

-- Seed 10 diagnostic questions
INSERT INTO diagnostic_questions (question_text, options, target_categories, explanation, sort_order, is_active, created_at, updated_at) VALUES
(
  'A guest orders a beer and seems unhappy with the head ratio when it arrives. What\'s likely the cause?',
  jsonb_build_array(
    jsonb_build_object('text', 'The beer was served too cold', 'isCorrect', false),
    jsonb_build_object('text', 'The glass was dirty or wet before pouring', 'isCorrect', true),
    jsonb_build_object('text', 'The pub was too loud', 'isCorrect', false),
    jsonb_build_object('text', 'The bartender poured too quickly or at wrong angle', 'isCorrect', true)
  ),
  ARRAY['technical'],
  'Proper beer pouring technique directly affects head ratio. Dirty glassware and aggressive pouring are main culprits.',
  1, TRUE, NOW(), NOW()
),
(
  'A couple on their first date sits at your bar. One seems nervous, the other confident. How do you make them both feel welcome?',
  jsonb_build_array(
    jsonb_build_object('text', 'Focus entirely on the more confident one to avoid awkwardness', 'isCorrect', false),
    jsonb_build_object('text', 'Acknowledge both warmly, ask open questions, give them space', 'isCorrect', true),
    jsonb_build_object('text', 'Make a joke about it being a first date to break the ice', 'isCorrect', false),
    jsonb_build_object('text', 'Suggest they move to a quieter table', 'isCorrect', false)
  ),
  ARRAY['service'],
  'Good hospitality recognizes all guests, uses open questions, and respects social dynamics.',
  2, TRUE, NOW(), NOW()
),
(
  'A guest orders a Margarita. You\'re unsure of the exact recipe. What do you do?',
  jsonb_build_array(
    jsonb_build_object('text', 'Improvise with what you think is right', 'isCorrect', false),
    jsonb_build_object('text', 'Check a recipe reference or ask a senior bartender', 'isCorrect', true),
    jsonb_build_object('text', 'Tell the guest you don\'t know how to make it', 'isCorrect', false),
    jsonb_build_object('text', 'Suggest a different cocktail instead', 'isCorrect', false)
  ),
  ARRAY['technical'],
  'Seeking accurate information ensures quality and professionalism.',
  3, TRUE, NOW(), NOW()
),
(
  'A regular customer has been drinking steadily for 2 hours and is showing slurred speech. They order another drink. What do you do?',
  jsonb_build_array(
    jsonb_build_object('text', 'Serve it; they\'re a regular and know their limit', 'isCorrect', false),
    jsonb_build_object('text', 'Assess their intoxication level and refuse service if impaired; offer water/food instead', 'isCorrect', true),
    jsonb_build_object('text', 'Ask their friends if it\'s okay', 'isCorrect', false),
    jsonb_build_object('text', 'Serve a non-alcoholic drink without telling them', 'isCorrect', false)
  ),
  ARRAY['compliance'],
  'Your legal responsibility is to assess intoxication and refuse service if needed.',
  4, TRUE, NOW(), NOW()
),
(
  'A guest\'s cocktail tastes "off"—maybe too strong or bitter. They seem upset but trying to be polite. How do you respond?',
  jsonb_build_array(
    jsonb_build_object('text', 'That\'s the correct recipe; you might just not like it', 'isCorrect', false),
    jsonb_build_object('text', 'Sorry you don\'t like it! Let me make you a different one', 'isCorrect', false),
    jsonb_build_object('text', 'Apologize, ask what\'s wrong, offer to remake it or suggest an alternative', 'isCorrect', true),
    jsonb_build_object('text', 'Tell them it\'s popular and they should try it again', 'isCorrect', false)
  ),
  ARRAY['service'],
  'Good service acknowledges the issue, gathers information, and offers solutions.',
  5, TRUE, NOW(), NOW()
),
(
  'You\'re prepping garnishes for the shift. You drop a lime wedge on the floor. What do you do?',
  jsonb_build_array(
    jsonb_build_object('text', 'Rinse it and use it anyway', 'isCorrect', false),
    jsonb_build_object('text', 'Discard it immediately and use a fresh one', 'isCorrect', true),
    jsonb_build_object('text', 'Use it for decoration only, not for food', 'isCorrect', false),
    jsonb_build_object('text', 'Ask if it\'s okay to use', 'isCorrect', false)
  ),
  ARRAY['technical'],
  'Food safety is non-negotiable. Dropped items must be discarded.',
  6, TRUE, NOW(), NOW()
),
(
  'During Friday night rush, the bartender is backed up with 10 orders. You\'re the bar back. What\'s your priority?',
  jsonb_build_array(
    jsonb_build_object('text', 'Take a break since you\'re not serving directly', 'isCorrect', false),
    jsonb_build_object('text', 'Support the bartender: keep ice full, clear used glasses, have bottles ready', 'isCorrect', true),
    jsonb_build_object('text', 'Help customers at the bar directly if you know how', 'isCorrect', false),
    jsonb_build_object('text', 'Restock the shelves since they\'re a bit empty', 'isCorrect', false)
  ),
  ARRAY['technical'],
  'Bar back\'s job is to anticipate bartender\'s needs and support flow.',
  7, TRUE, NOW(), NOW()
),
(
  'Two guests are arguing increasingly loudly at the bar. One is getting aggressive gestures. What\'s your first move?',
  jsonb_build_array(
    jsonb_build_object('text', 'Ignore it; let them sort it out', 'isCorrect', false),
    jsonb_build_object('text', 'Join in to calm them down', 'isCorrect', false),
    jsonb_build_object('text', 'Monitor closely, stay calm, be ready to alert manager/security if escalates; try light intervention if safe', 'isCorrect', true),
    jsonb_build_object('text', 'Eject them immediately', 'isCorrect', false)
  ),
  ARRAY['compliance'],
  'Early observation and readiness to involve management prevents escalation.',
  8, TRUE, NOW(), NOW()
),
(
  'A guest orders a single beer. Based on their body language and tone, they seem relaxed and exploring. How do you enhance their experience?',
  jsonb_build_array(
    jsonb_build_object('text', 'Leave them alone; they know what they want', 'isCorrect', false),
    jsonb_build_object('text', 'Immediately push the most expensive beer', 'isCorrect', false),
    jsonb_build_object('text', 'Ask about their taste preferences, suggest a beer they might enjoy, mention food pairings', 'isCorrect', true),
    jsonb_build_object('text', 'Assume they\'re a light spender and offer nothing extra', 'isCorrect', false)
  ),
  ARRAY['service'],
  'Good upselling is based on listening and recommendations, not assumptions.',
  9, TRUE, NOW(), NOW()
),
(
  'A guest asks for "something light and crisp for a hot day." You\'re not sure which wine to recommend. What do you do?',
  jsonb_build_array(
    jsonb_build_object('text', 'Suggest the house white without thinking', 'isCorrect', false),
    jsonb_build_object('text', 'Ask clarifying questions (dry vs. fruity? Any preferences?), offer to show options, suggest a few light options', 'isCorrect', true),
    jsonb_build_object('text', 'Recommend the most expensive wine', 'isCorrect', false),
    jsonb_build_object('text', 'Tell them wine isn\'t suitable for hot days; suggest beer instead', 'isCorrect', false)
  ),
  ARRAY['technical'],
  'Personalizing recommendations through questions shows attentiveness and product knowledge.',
  10, TRUE, NOW(), NOW()
);

-- Verify final counts
SELECT COUNT(*) as total_scenarios FROM scenarios;
SELECT COUNT(*) as total_diagnostic_questions FROM diagnostic_questions;
