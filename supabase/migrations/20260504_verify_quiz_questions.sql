-- ============================================================
-- Module Verify — True/False Quiz Questions
-- 8 questions per module, 20 modules = 160 total
-- Scenario index 200–207 per module (safe above L2/L3/roleplay)
-- answer must be exactly 'true' or 'false' (lowercase string)
-- ============================================================

-- Clear any existing quiz scenarios so this file is the sole source
DELETE FROM scenarios WHERE scenario_type = 'quiz';

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

-- ===== MODULE 1: Pouring the Perfect Beer =====
(1, 200, 'quiz', 'A warm glass from the dishwasher ruins the beer''s carbonation.',
  jsonb_build_object('question', 'A warm glass from the dishwasher ruins the beer''s carbonation.', 'answer', 'true', 'explanation', 'Heat kills the CO2 in draught beer, resulting in a flat pour with excessive, unmanageable foam.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'pouring']),

(1, 201, 'quiz', 'You should dip the tap nozzle into the beer.',
  jsonb_build_object('question', 'You should dip the tap nozzle into the beer.', 'answer', 'false', 'explanation', 'Dipping the nozzle spreads bacteria and violates health codes. The tap must never touch the glass or the beer.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'hygiene']),

(1, 202, 'quiz', 'A standard schooner glass holds exactly 425ml of liquid.',
  jsonb_build_object('question', 'A standard schooner glass holds exactly 425ml of liquid.', 'answer', 'true', 'explanation', 'In most Australian states (excluding SA), a schooner is the standard 425ml draught pour.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'measures']),

(1, 203, 'quiz', 'Pouring draught beer slowly prevents excess foam from forming.',
  jsonb_build_object('question', 'Pouring draught beer slowly prevents excess foam from forming.', 'answer', 'false', 'explanation', 'Taps are designed for flow dynamics; you must open the tap fully and sharply to prevent foaming.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'pouring']),

(1, 204, 'quiz', 'The ideal head on a schooner is roughly 1.5 cm.',
  jsonb_build_object('question', 'The ideal head on a schooner is roughly 1.5 cm.', 'answer', 'true', 'explanation', 'A 1–1.5 cm head preserves the beer''s carbonation and aroma without short-changing the guest on liquid.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'quality']),

(1, 205, 'quiz', 'A dirty beer line makes the beer taste like butter.',
  jsonb_build_object('question', 'A dirty beer line makes the beer taste like butter.', 'answer', 'true', 'explanation', 'Diacetyl buildup in uncleaned draught lines creates a distinct, unpleasant buttery flavor in the beer.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'maintenance']),

(1, 206, 'quiz', 'You should always hold the glass at a 45-degree angle.',
  jsonb_build_object('question', 'You should always hold the glass at a 45-degree angle.', 'answer', 'true', 'explanation', 'Starting the pour at a 45-degree angle allows the beer to flow down the side, controlling the head.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'technique']),

(1, 207, 'quiz', 'Overflowing the beer down the sides of the glass is standard.',
  jsonb_build_object('question', 'Overflowing the beer down the sides of the glass is standard.', 'answer', 'false', 'explanation', 'This wastes expensive product, hits the venue''s GP, and leaves a sticky glass for the guest to hold.', 'option_type', 'truefalse'),
  2, ARRAY['beer', 'waste']),

-- ===== MODULE 2: Wine Knowledge & Service =====
(2, 200, 'quiz', 'Australian Shiraz is best served chilled from the fridge.',
  jsonb_build_object('question', 'Australian Shiraz is best served chilled from the fridge.', 'answer', 'false', 'explanation', 'Full-bodied reds like Shiraz should be served at room temperature, ideally between 16°C and 18°C.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'temperature']),

(2, 201, 'quiz', 'A standard glass of wine is usually 150ml in Australia.',
  jsonb_build_object('question', 'A standard glass of wine is usually 150ml in Australia.', 'answer', 'true', 'explanation', 'A standard venue pour is 150ml, which equates to roughly 1.4 to 1.6 standard drinks.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'measures']),

(2, 202, 'quiz', 'You must always present the bottle label to the guest.',
  jsonb_build_object('question', 'You must always present the bottle label to the guest.', 'answer', 'true', 'explanation', 'Presenting the label allows the guest to confirm they are receiving the correct vintage and varietal they ordered.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'service']),

(2, 203, 'quiz', 'Corked wine means there are pieces of cork in it.',
  jsonb_build_object('question', 'Corked wine means there are pieces of cork in it.', 'answer', 'false', 'explanation', 'A corked wine suffers from TCA taint, smelling like damp cardboard or a wet dog.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'faults']),

(2, 204, 'quiz', 'Sauvignon Blanc from Marlborough is a very dry, crisp white.',
  jsonb_build_object('question', 'Sauvignon Blanc from Marlborough is a very dry, crisp white.', 'answer', 'true', 'explanation', 'This is a staple in Aussie venues, known for its high acidity and dry, passionfruit-forward profile.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'knowledge']),

(2, 205, 'quiz', 'You should pop a sparkling wine cork loudly for effect.',
  jsonb_build_object('question', 'You should pop a sparkling wine cork loudly for effect.', 'answer', 'false', 'explanation', 'A proper sparkling opening should be a silent ''hiss'' to maintain carbonation and professionalism in the dining room.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'technique']),

(2, 206, 'quiz', 'A standard wine bottle holds exactly 750ml of liquid.',
  jsonb_build_object('question', 'A standard wine bottle holds exactly 750ml of liquid.', 'answer', 'true', 'explanation', 'The global standard for a wine bottle is 750ml, yielding exactly five 150ml glasses.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'measures']),

(2, 207, 'quiz', 'Red wine glasses generally have larger bowls than white glasses.',
  jsonb_build_object('question', 'Red wine glasses generally have larger bowls than white glasses.', 'answer', 'true', 'explanation', 'The larger bowl exposes more surface area to oxygen, helping bold red wines open up and release aromatics.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'glassware']),

-- ===== MODULE 3: Cocktail Fundamentals =====
(3, 200, 'quiz', 'A standard spirit pour in an Australian venue is 30ml.',
  jsonb_build_object('question', 'A standard spirit pour in an Australian venue is 30ml.', 'answer', 'true', 'explanation', 'The standard measured jigger pour across Australian bars is 30ml for a base spirit.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'measures']),

(3, 201, 'quiz', 'You must shake a Martini to make it perfectly clear.',
  jsonb_build_object('question', 'You must shake a Martini to make it perfectly clear.', 'answer', 'false', 'explanation', 'Stirring a Martini ensures it remains crystal clear and prevents harsh ice dilution and air bubbles.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'technique']),

(3, 202, 'quiz', 'Simple syrup is made of equal parts sugar and water.',
  jsonb_build_object('question', 'Simple syrup is made of equal parts sugar and water.', 'answer', 'true', 'explanation', 'This 1:1 ratio is the fundamental sweetener used to balance acidity in almost all classic cocktails.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'ingredients']),

(3, 203, 'quiz', 'Muddling mint too hard makes a Mojito taste very bitter.',
  jsonb_build_object('question', 'Muddling mint too hard makes a Mojito taste very bitter.', 'answer', 'true', 'explanation', 'Crushing the mint stems releases chlorophyll, which introduces a harsh, bitter flavor to the drink.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'technique']),

(3, 204, 'quiz', 'An Espresso Martini requires fresh hot espresso to froth properly.',
  jsonb_build_object('question', 'An Espresso Martini requires fresh hot espresso to froth properly.', 'answer', 'true', 'explanation', 'The oils from hot espresso interact with the shaking process to create the cocktail''s signature thick crema.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'espresso']),

(3, 205, 'quiz', 'You should scoop ice using the glass to save time.',
  jsonb_build_object('question', 'You should scoop ice using the glass to save time.', 'answer', 'false', 'explanation', 'Scooping with glassware is a massive WHS risk; a chip will result in burning the entire ice well.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'safety']),

(3, 206, 'quiz', 'A classic Negroni contains gin, Campari, and sweet vermouth.',
  jsonb_build_object('question', 'A classic Negroni contains gin, Campari, and sweet vermouth.', 'answer', 'true', 'explanation', 'This classic Italian aperitif is built using equal parts of these three specific ingredients.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'knowledge']),

(3, 207, 'quiz', 'All cocktails must be served in a tall highball glass.',
  jsonb_build_object('question', 'All cocktails must be served in a tall highball glass.', 'answer', 'false', 'explanation', 'Glassware dictates the drink''s profile; coupes, rocks, and highballs all serve entirely different functional purposes.', 'option_type', 'truefalse'),
  2, ARRAY['cocktails', 'glassware']),

-- ===== MODULE 4: Coffee/Barista Basics =====
(4, 200, 'quiz', 'Milk for a flat white should be boiled past 75°C.',
  jsonb_build_object('question', 'Milk for a flat white should be boiled past 75°C.', 'answer', 'false', 'explanation', 'Milk burns and loses its natural sweetness above 65°C. Boiling it ruins the coffee entirely.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'milk']),

(4, 201, 'quiz', 'A standard single espresso shot takes about 25 to 30 seconds.',
  jsonb_build_object('question', 'A standard single espresso shot takes about 25 to 30 seconds.', 'answer', 'true', 'explanation', 'This extraction window ensures the coffee oils are balanced, preventing the shot from becoming sour or bitter.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'espresso']),

(4, 202, 'quiz', 'An Australian macchiato is just a shot with a dash of milk.',
  jsonb_build_object('question', 'An Australian macchiato is just a shot with a dash of milk.', 'answer', 'true', 'explanation', 'A traditional Aussie macchiato is a single or double shot simply ''stained'' with a dash of textured milk.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'knowledge']),

(4, 203, 'quiz', 'You must purge the steam wand before and after texturing milk.',
  jsonb_build_object('question', 'You must purge the steam wand before and after texturing milk.', 'answer', 'true', 'explanation', 'Purging clears condensation before steaming and blows out trapped milk residue afterward for hygiene.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'hygiene']),

(4, 204, 'quiz', 'Dark roasted beans always produce a sweeter espresso crema.',
  jsonb_build_object('question', 'Dark roasted beans always produce a sweeter espresso crema.', 'answer', 'false', 'explanation', 'Darker roasts tend to be more bitter and robust; lighter roasts generally retain more natural sweetness and acidity.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'roasting']),

(4, 205, 'quiz', 'A cappuccino has more milk foam than a flat white.',
  jsonb_build_object('question', 'A cappuccino has more milk foam than a flat white.', 'answer', 'true', 'explanation', 'A cappuccino is defined by its thick, dense layer of foam and chocolate dusting, unlike the micro-foam of a flat white.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'knowledge']),

(4, 206, 'quiz', 'Soy milk textures exactly the same as full cream cow''s milk.',
  jsonb_build_object('question', 'Soy milk textures exactly the same as full cream cow''s milk.', 'answer', 'false', 'explanation', 'Alternative milks have lower fat and protein contents, requiring gentler aeration and lower temperatures to prevent splitting.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'alternatives']),

(4, 207, 'quiz', 'The group head must be flushed between every single coffee extraction.',
  jsonb_build_object('question', 'The group head must be flushed between every single coffee extraction.', 'answer', 'true', 'explanation', 'Flushing cleans old grounds and oils from the shower screen, preventing a burnt taste in the next coffee.', 'option_type', 'truefalse'),
  2, ARRAY['coffee', 'maintenance']),

-- ===== MODULE 5: Carrying Glassware & Trays =====
(5, 200, 'quiz', 'You should always look directly at the drinks while walking.',
  jsonb_build_object('question', 'You should always look directly at the drinks while walking.', 'answer', 'false', 'explanation', 'Looking at the drinks throws off your balance. Keep your eyes up to navigate through patrons safely.', 'option_type', 'truefalse'),
  2, ARRAY['trays', 'technique']),

(5, 201, 'quiz', 'Heavy schooner glasses should be placed in the tray''s center.',
  jsonb_build_object('question', 'Heavy schooner glasses should be placed in the tray''s center.', 'answer', 'true', 'explanation', 'Keeping the heaviest items in the center lowers the center of gravity, making the tray much more stable.', 'option_type', 'truefalse'),
  2, ARRAY['trays', 'balance']),

(5, 202, 'quiz', 'Balancing the tray on your fingertips gives the most stability.',
  jsonb_build_object('question', 'Balancing the tray on your fingertips gives the most stability.', 'answer', 'true', 'explanation', 'Fingertips provide micro-adjustments for balance; carrying it flat on the palm makes it rigid and prone to tipping.', 'option_type', 'truefalse'),
  2, ARRAY['trays', 'technique']),

(5, 203, 'quiz', 'Carrying three wine glasses by the rim is safe practice.',
  jsonb_build_object('question', 'Carrying three wine glasses by the rim is safe practice.', 'answer', 'false', 'explanation', 'Carrying by the rim is unhygienic and leaves fingerprints. Always carry stemmed glassware by the stem or base.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'hygiene']),

(5, 204, 'quiz', 'You should carry a loaded drinks tray with two hands.',
  jsonb_build_object('question', 'You should carry a loaded drinks tray with two hands.', 'answer', 'false', 'explanation', 'Using two hands locks your upper body. Use your non-dominant hand to carry, leaving the other free to navigate doors.', 'option_type', 'truefalse'),
  2, ARRAY['trays', 'technique']),

(5, 205, 'quiz', 'Clearing empty plates onto a drinks tray is highly efficient.',
  jsonb_build_object('question', 'Clearing empty plates onto a drinks tray is highly efficient.', 'answer', 'false', 'explanation', 'Drinks trays are for beverages only. Mixing food scraps and glassware creates instability and hygiene cross-contamination.', 'option_type', 'truefalse'),
  2, ARRAY['trays', 'hygiene']),

(5, 206, 'quiz', 'Keep your dominant hand free to open doors or guide people.',
  jsonb_build_object('question', 'Keep your dominant hand free to open doors or guide people.', 'answer', 'true', 'explanation', 'A free dominant hand protects the tray from sudden bumps and allows you to move chairs in the dining room.', 'option_type', 'truefalse'),
  2, ARRAY['trays', 'technique']),

(5, 207, 'quiz', 'Unloading a tray from one side causes it to flip.',
  jsonb_build_object('question', 'Unloading a tray from one side causes it to flip.', 'answer', 'true', 'explanation', 'You must unload from the outside edges evenly to maintain the weight distribution and prevent the tray from catapulting.', 'option_type', 'truefalse'),
  2, ARRAY['trays', 'technique']),

-- ===== MODULE 6: Cleaning & Sanitation =====
(6, 200, 'quiz', 'You must wash your hands after handling dirty cash.',
  jsonb_build_object('question', 'You must wash your hands after handling dirty cash.', 'answer', 'true', 'explanation', 'Money is incredibly dirty. Handwashing prevents cross-contamination before you handle garnishes or fresh glassware.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'handwashing']),

(6, 201, 'quiz', 'Spraying surface cleaner directly over the ice well is safe.',
  jsonb_build_object('question', 'Spraying surface cleaner directly over the ice well is safe.', 'answer', 'false', 'explanation', 'Chemical spray drifts instantly. This poisons the ice and forces a mandatory melting and cleaning of the entire well.', 'option_type', 'truefalse'),
  2, ARRAY['cleaning', 'safety']),

(6, 202, 'quiz', 'Broken glass in the ice well means melting the entire well.',
  jsonb_build_object('question', 'Broken glass in the ice well means melting the entire well.', 'answer', 'true', 'explanation', 'Glass in ice is invisible. The only safe WHS protocol is pouring hot water to melt the entire batch.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'whs']),

(6, 203, 'quiz', 'Mops used in the bathrooms can be used behind the bar.',
  jsonb_build_object('question', 'Mops used in the bathrooms can be used behind the bar.', 'answer', 'false', 'explanation', 'This is a massive health code violation. Bathroom equipment must be color-coded and strictly separated from food/beverage areas.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'compliance']),

(6, 204, 'quiz', 'A wet floor sign must be placed over spills immediately.',
  jsonb_build_object('question', 'A wet floor sign must be placed over spills immediately.', 'answer', 'true', 'explanation', 'Slips are the number one venue injury. The hazard must be visibly marked the second it occurs.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'whs']),

(6, 205, 'quiz', 'Warm water alone is enough to sanitize food prep areas.',
  jsonb_build_object('question', 'Warm water alone is enough to sanitize food prep areas.', 'answer', 'false', 'explanation', 'Warm water removes visible dirt, but food-grade chemical sanitizer is legally required to kill bacteria.', 'option_type', 'truefalse'),
  2, ARRAY['cleaning', 'compliance']),

(6, 206, 'quiz', 'Beer drip trays should be flushed with hot water nightly.',
  jsonb_build_object('question', 'Beer drip trays should be flushed with hot water nightly.', 'answer', 'true', 'explanation', 'Old beer turns into thick sludge that blocks drains and attracts fruit flies. Hot water dissolves the buildup.', 'option_type', 'truefalse'),
  2, ARRAY['cleaning', 'maintenance']),

(6, 207, 'quiz', 'Leaving damp bar towels on the counter breeds heavy bacteria.',
  jsonb_build_object('question', 'Leaving damp bar towels on the counter breeds heavy bacteria.', 'answer', 'true', 'explanation', 'Damp, warm cloths are perfect breeding grounds for bacteria. Towels must be rotated to the laundry frequently.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'bacteria']),

-- ===== MODULE 7: Bar Back Efficiency =====
(7, 200, 'quiz', 'Glassware must be cooled before serving draught beer in it.',
  jsonb_build_object('question', 'Glassware must be cooled before serving draught beer in it.', 'answer', 'true', 'explanation', 'Hot glasses from the washer cause beer to instantly foam, ruining the pour and destroying the venue''s keg yield.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'glassware']),

(7, 201, 'quiz', 'Replacing empty spirit bottles is the lowest priority mid-rush.',
  jsonb_build_object('question', 'Replacing empty spirit bottles is the lowest priority mid-rush.', 'answer', 'false', 'explanation', 'If a bartender has no base spirits, the entire bar grinds to a halt. The speed rail must remain stocked.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'prioritization']),

(7, 202, 'quiz', 'Ice wells should always be filled completely to the top.',
  jsonb_build_object('question', 'Ice wells should always be filled completely to the top.', 'answer', 'true', 'explanation', 'Full ice wells maintain thermal mass, keeping the ice colder for longer and preventing watery cocktails.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'ice']),

(7, 203, 'quiz', 'Changing an empty keg requires turning the gas off first.',
  jsonb_build_object('question', 'Changing an empty keg requires turning the gas off first.', 'answer', 'true', 'explanation', 'Removing a coupler under high pressure without shutting the valve can cause dangerous gas blowback or beer spray.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'safety']),

(7, 204, 'quiz', 'Bar backs are not responsible for clearing the bar top.',
  jsonb_build_object('question', 'Bar backs are not responsible for clearing the bar top.', 'answer', 'false', 'explanation', 'A bar back''s job is to maintain the battlefield. Clearing dead glassware keeps the bar turning over fast.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'responsibilities']),

(7, 205, 'quiz', 'You should rotate fresh juices so the oldest is used first.',
  jsonb_build_object('question', 'You should rotate fresh juices so the oldest is used first.', 'answer', 'true', 'explanation', 'This is First-In, First-Out (FIFO) stock rotation. It prevents fresh juice from spoiling and reduces venue wastage.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'stock']),

(7, 206, 'quiz', 'Stacking wet glasses speeds up the drying process.',
  jsonb_build_object('question', 'Stacking wet glasses speeds up the drying process.', 'answer', 'false', 'explanation', 'Stacking wet glasses creates a vacuum seal, breaking the glass and trapping dirty moisture inside.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'glassware']),

(7, 207, 'quiz', 'Constant communication with the bartender prevents service delays.',
  jsonb_build_object('question', 'Constant communication with the bartender prevents service delays.', 'answer', 'true', 'explanation', 'A quick ''behind you'' or ''more ice coming'' ensures the bartender doesn''t step backwards into you during a rush.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'communication']),

-- ===== MODULE 8: The Art of the Greeting =====
(8, 200, 'quiz', 'You must acknowledge a new guest within three seconds.',
  jsonb_build_object('question', 'You must acknowledge a new guest within three seconds.', 'answer', 'true', 'explanation', 'A rapid greeting, even non-verbal, tells the guest they are seen and drastically reduces their perceived wait time.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'greeting']),

(8, 201, 'quiz', 'Eye contact is not necessary if you are pouring drinks.',
  jsonb_build_object('question', 'Eye contact is not necessary if you are pouring drinks.', 'answer', 'false', 'explanation', 'You can easily maintain a pour while lifting your eyes to establish contact and control the bar space.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'greeting']),

(8, 202, 'quiz', 'A friendly nod counts as a valid greeting during a rush.',
  jsonb_build_object('question', 'A friendly nod counts as a valid greeting during a rush.', 'answer', 'true', 'explanation', 'When three-deep, a nod and a smile acknowledge the guest''s presence until you are free to speak.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'greeting']),

(8, 203, 'quiz', 'You should yell a greeting across a crowded dining room.',
  jsonb_build_object('question', 'You should yell a greeting across a crowded dining room.', 'answer', 'false', 'explanation', 'Shouting disrupts other guests'' dining experience. Move closer or use polite, visible body language.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'professionalism']),

(8, 204, 'quiz', 'Smiling when greeting guests sets a positive tone for service.',
  jsonb_build_object('question', 'Smiling when greeting guests sets a positive tone for service.', 'answer', 'true', 'explanation', 'A smile disarms frustrated guests and establishes immediate hospitality, setting the stage for a great tip.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'greeting']),

(8, 205, 'quiz', 'Ignoring waiting guests makes them think you are working hard.',
  jsonb_build_object('question', 'Ignoring waiting guests makes them think you are working hard.', 'answer', 'false', 'explanation', 'Ignoring guests makes them feel invisible and angry, turning a minor wait into a formal complaint.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'greeting']),

(8, 206, 'quiz', 'Saying ''I will be right with you'' is highly professional.',
  jsonb_build_object('question', 'Saying ''I will be right with you'' is highly professional.', 'answer', 'true', 'explanation', 'This phrase manages expectations and reassures the guest that they are next in the queue.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'communication']),

(8, 207, 'quiz', 'A genuine welcome encourages locals to become regular patrons.',
  jsonb_build_object('question', 'A genuine welcome encourages locals to become regular patrons.', 'answer', 'true', 'explanation', 'Aussie pub culture is built on familiarity. A warm greeting is the first step in building a local client base.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'loyalty']),

-- ===== MODULE 9: Managing Table Dynamics =====
(9, 200, 'quiz', 'You should clear entree plates while some guests are still eating.',
  jsonb_build_object('question', 'You should clear entree plates while some guests are still eating.', 'answer', 'false', 'explanation', 'Clearing half a table makes the slower eaters feel incredibly rushed and ruins the communal dining experience.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'tables']),

(9, 201, 'quiz', 'Approaching a table from the right side is standard practice.',
  jsonb_build_object('question', 'Approaching a table from the right side is standard practice.', 'answer', 'true', 'explanation', 'Traditional silver service dictates serving food from the right and clearing from the right whenever physically possible.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'technique']),

(9, 202, 'quiz', 'Dropping the bill before the guests ask is excellent service.',
  jsonb_build_object('question', 'Dropping the bill before the guests ask is excellent service.', 'answer', 'false', 'explanation', 'Unless requested, dropping the bill prematurely is a hostile move that tells the guest to get out.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'tables']),

(9, 203, 'quiz', 'Checking back two minutes after food arrives ensures quality.',
  jsonb_build_object('question', 'Checking back two minutes after food arrives ensures quality.', 'answer', 'true', 'explanation', 'This two-minute check catches undercooked steaks or missing sauces immediately, before the guest becomes angry.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

(9, 204, 'quiz', 'You must clear all empty glasses every time you visit the table.',
  jsonb_build_object('question', 'You must clear all empty glasses every time you visit the table.', 'answer', 'true', 'explanation', 'Consolidation is key. Never walk back to the kitchen or bar empty-handed; clear the dead wood.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

(9, 205, 'quiz', 'Rushing a table through their meal turns tables much faster.',
  jsonb_build_object('question', 'Rushing a table through their meal turns tables much faster.', 'answer', 'false', 'explanation', 'Guests notice when they are being rushed. It kills the tip and guarantees a negative Google review.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'tables']),

(9, 206, 'quiz', 'Engaging with every guest at the table builds better rapport.',
  jsonb_build_object('question', 'Engaging with every guest at the table builds better rapport.', 'answer', 'true', 'explanation', 'Making eye contact with the whole table, not just the loudest person, makes everyone feel valued.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'rapport']),

(9, 207, 'quiz', 'Serving children their meals first keeps the entire table happy.',
  jsonb_build_object('question', 'Serving children their meals first keeps the entire table happy.', 'answer', 'true', 'explanation', 'Hungry kids make for stressed parents. Feeding children first ensures a peaceful dining experience for the whole table.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'tables']),

-- ===== MODULE 10: Anticipatory Service =====
(10, 200, 'quiz', 'Offering a second drink before the first is empty is good.',
  jsonb_build_object('question', 'Offering a second drink before the first is empty is good.', 'answer', 'true', 'explanation', 'Anticipating the need prevents a break in service and boosts beverage sales effortlessly.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'anticipatory']),

(10, 201, 'quiz', 'You should always wait for a guest to flag you down.',
  jsonb_build_object('question', 'You should always wait for a guest to flag you down.', 'answer', 'false', 'explanation', 'If a guest has to wave you over, you have already failed at anticipatory service.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'anticipatory']),

(10, 202, 'quiz', 'Bringing extra napkins with messy finger food is anticipatory service.',
  jsonb_build_object('question', 'Bringing extra napkins with messy finger food is anticipatory service.', 'answer', 'true', 'explanation', 'Providing wet wipes or extra napkins with wings or ribs solves a messy problem before the guest asks.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'anticipatory']),

(10, 203, 'quiz', 'Anticipatory service means guessing what the guest wants to eat.',
  jsonb_build_object('question', 'Anticipatory service means guessing what the guest wants to eat.', 'answer', 'false', 'explanation', 'It means anticipating their needs (water, cutlery, clearing), not forcefully dictating their meal choices.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'anticipatory']),

(10, 204, 'quiz', 'Recognizing a regular guest and remembering their order builds loyalty.',
  jsonb_build_object('question', 'Recognizing a regular guest and remembering their order builds loyalty.', 'answer', 'true', 'explanation', 'Saying ''The usual schooner of New, mate?'' makes the guest feel like a VIP and guarantees repeat business.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'loyalty']),

(10, 205, 'quiz', 'You should top up water glasses without being asked.',
  jsonb_build_object('question', 'You should top up water glasses without being asked.', 'answer', 'true', 'explanation', 'Silent, constant water top-ups are the ultimate hallmark of high-end, attentive restaurant service.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'anticipatory']),

(10, 206, 'quiz', 'Leaving a table alone completely ensures they enjoy their privacy.',
  jsonb_build_object('question', 'Leaving a table alone completely ensures they enjoy their privacy.', 'answer', 'false', 'explanation', 'While you shouldn''t hover, you must maintain visual contact to catch subtle cues that they need assistance.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'anticipatory']),

(10, 207, 'quiz', 'Offering a dessert menu as plates are cleared increases sales.',
  jsonb_build_object('question', 'Offering a dessert menu as plates are cleared increases sales.', 'answer', 'true', 'explanation', 'Striking while the iron is hot captures impulse dessert or coffee sales before they decide they are too full.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'upsell']),

-- ===== MODULE 11: Handling Guest Complaints =====
(11, 200, 'quiz', 'You should instantly apologize and validate the guest''s frustration.',
  jsonb_build_object('question', 'You should instantly apologize and validate the guest''s frustration.', 'answer', 'true', 'explanation', 'An immediate, empathetic apology diffuses anger. They need to know you are on their side to fix the problem.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'service']),

(11, 201, 'quiz', 'Blaming the kitchen calms the guest down much faster.',
  jsonb_build_object('question', 'Blaming the kitchen calms the guest down much faster.', 'answer', 'false', 'explanation', 'Throwing chefs under the bus makes the venue look disorganized and unprofessional. Take ownership as a team.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'professionalism']),

(11, 202, 'quiz', 'Offering a free drink is a good initial service recovery step.',
  jsonb_build_object('question', 'Offering a free drink is a good initial service recovery step.', 'answer', 'true', 'explanation', 'A complimentary beer or soft drink gives them something to do while waiting for a remade meal.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'recovery']),

(11, 203, 'quiz', 'Arguing with a complaining guest proves that you are right.',
  jsonb_build_object('question', 'Arguing with a complaining guest proves that you are right.', 'answer', 'false', 'explanation', 'Even if you win the argument, you lose the customer. It escalates the situation into a public scene.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'de-escalation']),

(11, 204, 'quiz', 'Following up after fixing the issue ensures total guest satisfaction.',
  jsonb_build_object('question', 'Following up after fixing the issue ensures total guest satisfaction.', 'answer', 'true', 'explanation', 'Checking in on a remade steak proves that you genuinely care about their experience, closing the recovery loop.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'recovery']),

(11, 205, 'quiz', 'A cold parmy should be microwaved and given straight back.',
  jsonb_build_object('question', 'A cold parmy should be microwaved and given straight back.', 'answer', 'false', 'explanation', 'Microwaving ruins the food quality. A cold main meal must be completely refired by the kitchen.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'food']),

(11, 206, 'quiz', 'Listening actively without interrupting diffuses most angry guest situations.',
  jsonb_build_object('question', 'Listening actively without interrupting diffuses most angry guest situations.', 'answer', 'true', 'explanation', 'Often, guests just want to be heard. Let them finish venting before you offer a concrete solution.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'de-escalation']),

(11, 207, 'quiz', 'You must tell the manager about all serious food complaints.',
  jsonb_build_object('question', 'You must tell the manager about all serious food complaints.', 'answer', 'true', 'explanation', 'Managers must be aware of food quality trends so they can address systemic issues with the Head Chef.', 'option_type', 'truefalse'),
  2, ARRAY['complaints', 'management']),

-- ===== MODULE 12: Up-selling & Suggestive Sales =====
(12, 200, 'quiz', 'Suggesting a premium local gin instead of house pour is up-selling.',
  jsonb_build_object('question', 'Suggesting a premium local gin instead of house pour is up-selling.', 'answer', 'true', 'explanation', 'Moving a guest from a standard item to a higher-margin, premium product is the definition of up-selling.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(12, 201, 'quiz', 'Up-selling means forcing the guest to buy the most expensive item.',
  jsonb_build_object('question', 'Up-selling means forcing the guest to buy the most expensive item.', 'answer', 'false', 'explanation', 'Hard-selling ruins trust. Up-selling should be conversational and enhance their experience, not manipulate their wallet.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(12, 202, 'quiz', 'Asking if they want fries with their steak is suggestive selling.',
  jsonb_build_object('question', 'Asking if they want fries with their steak is suggestive selling.', 'answer', 'true', 'explanation', 'Suggesting complementary side dishes to attach to a main order is classic, effective suggestive selling.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(12, 203, 'quiz', 'You should never suggest a wine pairing for a meal.',
  jsonb_build_object('question', 'You should never suggest a wine pairing for a meal.', 'answer', 'false', 'explanation', 'Recommending a bold Shiraz with a ribeye elevates the meal and significantly increases the table''s spend.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'wine']),

(12, 204, 'quiz', 'Offering a larger size beer is an easy up-sell technique.',
  jsonb_build_object('question', 'Offering a larger size beer is an easy up-sell technique.', 'answer', 'true', 'explanation', 'Asking ''Make that a pint?'' instead of assuming a schooner is the easiest revenue boost in a pub.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'beer']),

(12, 205, 'quiz', 'Up-selling increases both venue revenue and your potential tips.',
  jsonb_build_object('question', 'Up-selling increases both venue revenue and your potential tips.', 'answer', 'true', 'explanation', 'Higher total bills naturally lead to higher percentage-based tips while keeping the venue highly profitable.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'revenue']),

(12, 206, 'quiz', 'Suggesting a cocktail while they read the menu wastes time.',
  jsonb_build_object('question', 'Suggesting a cocktail while they read the menu wastes time.', 'answer', 'false', 'explanation', 'Getting a round of pre-dinner drinks on the table fast keeps them happy and boosts the final bill.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'cocktails']),

(12, 207, 'quiz', 'Knowing the menu thoroughly makes up-selling feel natural.',
  jsonb_build_object('question', 'Knowing the menu thoroughly makes up-selling feel natural.', 'answer', 'true', 'explanation', 'You can''t up-sell a craft beer if you don''t know what it tastes like. Product knowledge is power.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'knowledge']),

-- ===== MODULE 13: VIP/Table Management =====
(13, 200, 'quiz', 'VIP guests can legally stay past the venue''s licensed trading hours.',
  jsonb_build_object('question', 'VIP guests can legally stay past the venue''s licensed trading hours.', 'answer', 'false', 'explanation', 'Liquor licensing laws apply equally to everyone. No VIP is worth risking a massive council fine.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'compliance']),

(13, 201, 'quiz', 'Holding a reserved table for 15 minutes is standard practice.',
  jsonb_build_object('question', 'Holding a reserved table for 15 minutes is standard practice.', 'answer', 'true', 'explanation', 'A 15-minute grace period allows for traffic or parking delays before you give the table to walk-ins.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'reservations']),

(13, 202, 'quiz', 'You should kick regular diners out to seat a walk-in VIP.',
  jsonb_build_object('question', 'You should kick regular diners out to seat a walk-in VIP.', 'answer', 'false', 'explanation', 'Evicting seated guests causes a massive scene and terrible reviews. Offer the VIP a drink at the bar instead.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'management']),

(13, 203, 'quiz', 'Remembering a VIP''s name provides a premium hospitality experience.',
  jsonb_build_object('question', 'Remembering a VIP''s name provides a premium hospitality experience.', 'answer', 'true', 'explanation', 'Personal recognition is the currency of VIP service. It makes high-spenders feel deeply valued.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'service']),

(13, 204, 'quiz', 'Double-seating a section overwhelms the staff and ruins service.',
  jsonb_build_object('question', 'Double-seating a section overwhelms the staff and ruins service.', 'answer', 'true', 'explanation', 'Seating 20 people at once in one section destroys the kitchen docket flow and overwhelms the bartender.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'management']),

(13, 205, 'quiz', 'You can ignore walk-ins if you have VIPs in the venue.',
  jsonb_build_object('question', 'You can ignore walk-ins if you have VIPs in the venue.', 'answer', 'false', 'explanation', 'Every guest must receive baseline hospitality. Ignoring standard diners builds a toxic, elitist venue reputation.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'service']),

(13, 206, 'quiz', 'Offering complimentary water while guests wait for tables is expected.',
  jsonb_build_object('question', 'Offering complimentary water while guests wait for tables is expected.', 'answer', 'true', 'explanation', 'It pacifies the guest, gives them something to do, and proves your service starts before they even sit down.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'service']),

(13, 207, 'quiz', 'A fully booked venue should still manage the door politely.',
  jsonb_build_object('question', 'A fully booked venue should still manage the door politely.', 'answer', 'true', 'explanation', 'Turning people away with a smile and an alternative suggestion protects the brand for their next visit.', 'option_type', 'truefalse'),
  2, ARRAY['vip', 'management']),

-- ===== MODULE 14: Phone Etiquette & Reservations =====
(14, 200, 'quiz', 'You should answer the venue phone within three rings.',
  jsonb_build_object('question', 'You should answer the venue phone within three rings.', 'answer', 'true', 'explanation', 'Prompt phone answering is professional and prevents the ringing from annoying guests seated near the host stand.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'professionalism']),

(14, 201, 'quiz', 'Hanging up on a rude caller without warning is acceptable.',
  jsonb_build_object('question', 'Hanging up on a rude caller without warning is acceptable.', 'answer', 'false', 'explanation', 'You must remain professional. Warn them politely that you will disconnect if the language continues, then hang up.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'professionalism']),

(14, 202, 'quiz', 'Taking a name and number is essential for a waitlist.',
  jsonb_build_object('question', 'Taking a name and number is essential for a waitlist.', 'answer', 'true', 'explanation', 'Without contact details, you cannot recall them when a table frees up, leading to empty tables and lost revenue.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'reservations']),

(14, 203, 'quiz', 'You must read back the booking details to confirm accuracy.',
  jsonb_build_object('question', 'You must read back the booking details to confirm accuracy.', 'answer', 'true', 'explanation', 'Confirming the date, time, and pax prevents disastrous double-bookings or guests showing up on the wrong night.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'reservations']),

(14, 204, 'quiz', 'Promising a specific booth is risky on a busy Saturday night.',
  jsonb_build_object('question', 'Promising a specific booth is risky on a busy Saturday night.', 'answer', 'true', 'explanation', 'Table tetris changes constantly. Note their preference, but guarantee the booking, not the specific physical table.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'reservations']),

(14, 205, 'quiz', 'You should put callers on hold for over five minutes.',
  jsonb_build_object('question', 'You should put callers on hold for over five minutes.', 'answer', 'false', 'explanation', 'If you are slammed, take their name and number and promise to call them back when the rush dies down.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'service']),

(14, 206, 'quiz', 'Smiling while speaking makes your tone sound much warmer.',
  jsonb_build_object('question', 'Smiling while speaking makes your tone sound much warmer.', 'answer', 'true', 'explanation', 'The physical act of smiling changes the shape of your vocal cords, making you sound audibly friendlier over the phone.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'communication']),

(14, 207, 'quiz', 'You should always state the venue name when answering.',
  jsonb_build_object('question', 'You should always state the venue name when answering.', 'answer', 'true', 'explanation', 'A standard greeting confirms they called the right place and immediately establishes a professional first impression.', 'option_type', 'truefalse'),
  2, ARRAY['phone', 'professionalism']),

-- ===== MODULE 15: RSA (Responsible Service of Alcohol) =====
(15, 200, 'quiz', 'You can serve an intoxicated person if they order food.',
  jsonb_build_object('question', 'You can serve an intoxicated person if they order food.', 'answer', 'false', 'explanation', 'By law, food does not override intoxication. An unduly intoxicated patron must be refused service and removed.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'compliance']),

(15, 201, 'quiz', 'Slurring words and loss of coordination are clear signs of intoxication.',
  jsonb_build_object('question', 'Slurring words and loss of coordination are clear signs of intoxication.', 'answer', 'true', 'explanation', 'These are classic physical signs that a patron has consumed too much alcohol and must be cut off.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'intoxication']),

(15, 202, 'quiz', 'A minor can legally drink alcohol if their parent buys it.',
  jsonb_build_object('question', 'A minor can legally drink alcohol if their parent buys it.', 'answer', 'false', 'explanation', 'Secondary supply to a minor on licensed premises carries massive legal fines for the venue and the bartender.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'minors']),

(15, 203, 'quiz', 'Offering free water is a mandatory RSA requirement in Australia.',
  jsonb_build_object('question', 'Offering free water is a mandatory RSA requirement in Australia.', 'answer', 'true', 'explanation', 'All licensed Australian venues must provide free, accessible drinking water to patrons at all times.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'compliance']),

(15, 204, 'quiz', 'You must legally refuse service to any unduly intoxicated patron.',
  jsonb_build_object('question', 'You must legally refuse service to any unduly intoxicated patron.', 'answer', 'true', 'explanation', 'Failing to refuse service risks massive fines, loss of your personal RSA certificate, and venue closure.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'compliance']),

(15, 205, 'quiz', 'A heavily swaying patron is fine for one last beer.',
  jsonb_build_object('question', 'A heavily swaying patron is fine for one last beer.', 'answer', 'false', 'explanation', 'There is no ''one more.'' The moment they show clear signs of undue intoxication, service ceases immediately.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'intoxication']),

(15, 206, 'quiz', 'Blaming the law is a great way to de-escalate a refusal.',
  jsonb_build_object('question', 'Blaming the law is a great way to de-escalate a refusal.', 'answer', 'true', 'explanation', 'Saying ''I could lose my job and face a massive fine'' shifts the blame from you to the government.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'de-escalation']),

(15, 207, 'quiz', 'You can accept a university ID card as proof of age.',
  jsonb_build_object('question', 'You can accept a university ID card as proof of age.', 'answer', 'false', 'explanation', 'Only government-issued ID (Driver''s License, Passport, Keypass) is legally acceptable for age verification in Australia.', 'option_type', 'truefalse'),
  2, ARRAY['rsa', 'id']),

-- ===== MODULE 16: Food Safety & Hygiene =====
(16, 200, 'quiz', 'A coeliac allergy requires entirely separate preparation equipment.',
  jsonb_build_object('question', 'A coeliac allergy requires entirely separate preparation equipment.', 'answer', 'true', 'explanation', 'Even a microscopic crumb of gluten on a shared cutting board can hospitalize a guest with true coeliac disease.', 'option_type', 'truefalse'),
  2, ARRAY['food-safety', 'allergens']),

(16, 201, 'quiz', 'Chicken can be safely stored on the top fridge shelf.',
  jsonb_build_object('question', 'Chicken can be safely stored on the top fridge shelf.', 'answer', 'false', 'explanation', 'Raw poultry must always be stored on the bottom shelf to prevent deadly salmonella juices from dripping onto cooked food.', 'option_type', 'truefalse'),
  2, ARRAY['food-safety', 'storage']),

(16, 202, 'quiz', 'Food must be kept out of the temperature danger zone.',
  jsonb_build_object('question', 'Food must be kept out of the temperature danger zone.', 'answer', 'true', 'explanation', 'The danger zone (5°C to 60°C) is where bacteria multiply rapidly. Hot food must stay hot, and cold food cold.', 'option_type', 'truefalse'),
  2, ARRAY['food-safety', 'temperature']),

(16, 203, 'quiz', 'You can use the same tongs for raw and cooked meat.',
  jsonb_build_object('question', 'You can use the same tongs for raw and cooked meat.', 'answer', 'false', 'explanation', 'This is severe cross-contamination. Raw meat tongs must never touch a steak that is ready to be plated.', 'option_type', 'truefalse'),
  2, ARRAY['food-safety', 'cross-contamination']),

(16, 204, 'quiz', 'Washing your hands takes a minimum of twenty seconds.',
  jsonb_build_object('question', 'Washing your hands takes a minimum of twenty seconds.', 'answer', 'true', 'explanation', 'A rapid rinse does nothing. Hot water, soap, and 20 seconds of friction are required to kill pathogens.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'handwashing']),

(16, 205, 'quiz', 'It is safe to defrost raw prawns on the bench overnight.',
  jsonb_build_object('question', 'It is safe to defrost raw prawns on the bench overnight.', 'answer', 'false', 'explanation', 'Bench defrosting leaves the outside of the seafood in the temperature danger zone for hours. Thaw under running cold water.', 'option_type', 'truefalse'),
  2, ARRAY['food-safety', 'defrosting']),

(16, 206, 'quiz', 'Date labels ensure a strict first-in, first-out stock rotation.',
  jsonb_build_object('question', 'Date labels ensure a strict first-in, first-out stock rotation.', 'answer', 'true', 'explanation', 'Labeling prepped food ensures older ingredients are used first, reducing venue waste and preventing food poisoning.', 'option_type', 'truefalse'),
  2, ARRAY['food-safety', 'stock']),

(16, 207, 'quiz', 'Blue band-aids must be worn over cuts in the kitchen.',
  jsonb_build_object('question', 'Blue band-aids must be worn over cuts in the kitchen.', 'answer', 'true', 'explanation', 'Blue is the only color that does not naturally occur in food, making the band-aid instantly visible if it falls off.', 'option_type', 'truefalse'),
  2, ARRAY['food-safety', 'whs']),

-- ===== MODULE 17: Conflict De-escalation =====
(17, 200, 'quiz', 'Crossing your arms shows authority when dealing with an angry patron.',
  jsonb_build_object('question', 'Crossing your arms shows authority when dealing with an angry patron.', 'answer', 'false', 'explanation', 'Crossed arms scream defensive aggression. Keep open, relaxed body language to avoid escalating the conflict physically.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'body-language']),

(17, 201, 'quiz', 'Keeping a calm and steady voice helps lower the guest''s anger.',
  jsonb_build_object('question', 'Keeping a calm and steady voice helps lower the guest''s anger.', 'answer', 'true', 'explanation', 'People naturally mirror tone. If you stay calm and speak quietly, an aggressive guest will often subconsciously lower their volume.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'de-escalation']),

(17, 202, 'quiz', 'You should stand aggressively close to an intoxicated angry patron.',
  jsonb_build_object('question', 'You should stand aggressively close to an intoxicated angry patron.', 'answer', 'false', 'explanation', 'Invading personal space triggers the fight-or-flight response. Keep a safe, two-arm-length distance.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'safety']),

(17, 203, 'quiz', 'Moving a dispute away from the main crowd is good practice.',
  jsonb_build_object('question', 'Moving a dispute away from the main crowd is good practice.', 'answer', 'true', 'explanation', 'Removing the ''audience'' stops the patron from feeling the need to show off and keeps the dining room peaceful.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'de-escalation']),

(17, 204, 'quiz', 'Arguing back loudly proves to the crowd that you are right.',
  jsonb_build_object('question', 'Arguing back loudly proves to the crowd that you are right.', 'answer', 'false', 'explanation', 'Getting into a shouting match compromises your professionalism and can quickly trigger a physical altercation.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'professionalism']),

(17, 205, 'quiz', 'Addressing the bad behavior rather than the person diffuses tension.',
  jsonb_build_object('question', 'Addressing the bad behavior rather than the person diffuses tension.', 'answer', 'true', 'explanation', 'Targeting the action, not the ego, de-personalizes the conflict and reduces the patron''s need to fight back.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'de-escalation']),

(17, 206, 'quiz', 'You must notify security or a manager if threats are made.',
  jsonb_build_object('question', 'You must notify security or a manager if threats are made.', 'answer', 'true', 'explanation', 'Verbal threats are a strict red line. Staff safety is paramount; radio management or security immediately to intervene.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'safety']),

(17, 207, 'quiz', 'Offering a simple apology can instantly de-escalate a heated complaint.',
  jsonb_build_object('question', 'Offering a simple apology can instantly de-escalate a heated complaint.', 'answer', 'true', 'explanation', 'Saying ''I am so sorry that happened'' validates their feelings and takes the wind entirely out of their aggressive sails.', 'option_type', 'truefalse'),
  2, ARRAY['conflict', 'de-escalation']),

-- ===== MODULE 18: Emergency Evacuation Protocols =====
(18, 200, 'quiz', 'The main emergency assembly point is always located inside the venue.',
  jsonb_build_object('question', 'The main emergency assembly point is always located inside the venue.', 'answer', 'false', 'explanation', 'Assembly points must be a safe distance away from the building structure, usually in a carpark or adjacent street.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'evacuation']),

(18, 201, 'quiz', 'You must instruct patrons to leave their drinks behind during evacuation.',
  jsonb_build_object('question', 'You must instruct patrons to leave their drinks behind during evacuation.', 'answer', 'true', 'explanation', 'Drinks spill, causing slip hazards in stairwells, and holding glasses prevents people from using handrails safely.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'evacuation']),

(18, 202, 'quiz', 'Elevators are the safest way to evacuate a burning building.',
  jsonb_build_object('question', 'Elevators are the safest way to evacuate a burning building.', 'answer', 'false', 'explanation', 'Elevators can lose power or open directly onto a fire floor. Always use the emergency fire stairs.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'fire']),

(18, 203, 'quiz', 'The fire warden holds total authority during an emergency evacuation.',
  jsonb_build_object('question', 'The fire warden holds total authority during an emergency evacuation.', 'answer', 'true', 'explanation', 'The designated fire warden outranks the general manager during an emergency. All staff must follow their sweeping commands.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'whs']),

(18, 204, 'quiz', 'You should check the bathrooms quickly to ensure no one remains.',
  jsonb_build_object('question', 'You should check the bathrooms quickly to ensure no one remains.', 'answer', 'true', 'explanation', 'Bathrooms are loud and closed off; intoxicated patrons often miss alarms. Staff must clear these areas on the way out.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'evacuation']),

(18, 205, 'quiz', 'Gathering your personal belongings is the top priority during a fire.',
  jsonb_build_object('question', 'Gathering your personal belongings is the top priority during a fire.', 'answer', 'false', 'explanation', 'Bags and jackets are replaceable; human life is not. Evacuate the second the primary alarm sounds.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'fire']),

(18, 206, 'quiz', 'Fire exits must never be blocked by chairs or stock boxes.',
  jsonb_build_object('question', 'Fire exits must never be blocked by chairs or stock boxes.', 'answer', 'true', 'explanation', 'A blocked fire exit is a severe WHS violation and can cause a lethal crush situation in a panicked evacuation.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'compliance']),

(18, 207, 'quiz', 'Running out of the building causes dangerous crowd panic.',
  jsonb_build_object('question', 'Running out of the building causes dangerous crowd panic.', 'answer', 'true', 'explanation', 'Staff must project calm authority. Walk swiftly and purposefully, and loudly instruct guests to do the same.', 'option_type', 'truefalse'),
  2, ARRAY['emergency', 'evacuation']),

-- ===== MODULE 19: Opening & Closing Procedures =====
(19, 200, 'quiz', 'Counting the till float exactly is the first opening duty.',
  jsonb_build_object('question', 'Counting the till float exactly is the first opening duty.', 'answer', 'true', 'explanation', 'If you don''t verify the float in the morning, you will be blamed for any cash discrepancies from the night shift.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'cash']),

(19, 201, 'quiz', 'You can leave the coffee machine on overnight to save time.',
  jsonb_build_object('question', 'You can leave the coffee machine on overnight to save time.', 'answer', 'false', 'explanation', 'Boilers left running overnight pose a fire risk and massively burn out the internal heating elements over time.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'equipment']),

(19, 202, 'quiz', 'Wiping down beer taps prevents fruit flies from breeding overnight.',
  jsonb_build_object('question', 'Wiping down beer taps prevents fruit flies from breeding overnight.', 'answer', 'true', 'explanation', 'Sugary beer residue is a magnet for bar flies. Taps must be wiped and plugged every single night.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'hygiene']),

(19, 203, 'quiz', 'Mopping the floors is best done right before the doors open.',
  jsonb_build_object('question', 'Mopping the floors is best done right before the doors open.', 'answer', 'false', 'explanation', 'Wet floors as guests walk in is a massive slip hazard. Mopping must be done at closing or early morning so it dries.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'safety']),

(19, 204, 'quiz', 'All ice must be melted and the wells wiped dry nightly.',
  jsonb_build_object('question', 'All ice must be melted and the wells wiped dry nightly.', 'answer', 'true', 'explanation', 'Stagnant water sitting overnight breeds bacteria. Dry wells ensure a sanitary start for the morning crew.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'hygiene']),

(19, 205, 'quiz', 'You should leave the safe unlocked for the morning manager.',
  jsonb_build_object('question', 'You should leave the safe unlocked for the morning manager.', 'answer', 'false', 'explanation', 'This is a fireable offense. The safe must be locked, spun, and secured every single night without exception.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'security']),

(19, 206, 'quiz', 'Emptying the glass bins at 2 AM is quiet and respectful.',
  jsonb_build_object('question', 'Emptying the glass bins at 2 AM is quiet and respectful.', 'answer', 'false', 'explanation', 'Smashing glass bins at 2 AM violates residential noise ordinances. They must be emptied in the morning.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'compliance']),

(19, 207, 'quiz', 'Setting the security alarm is the final step of closing.',
  jsonb_build_object('question', 'Setting the security alarm is the final step of closing.', 'answer', 'true', 'explanation', 'Once the till is secured and the doors are locked, setting the alarm secures the building for the night.', 'option_type', 'truefalse'),
  2, ARRAY['procedures', 'security']),

-- ===== MODULE 20: Inventory & Waste Control =====
(20, 200, 'quiz', 'Over-pouring spirits costs the venue thousands of dollars in lost GP.',
  jsonb_build_object('question', 'Over-pouring spirits costs the venue thousands of dollars in lost GP.', 'answer', 'true', 'explanation', 'A heavy hand ruins the 30ml yield. Over-pouring just 5ml every drink destroys the bar''s gross profit margin.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'waste']),

(20, 201, 'quiz', 'Giving free drinks to friends is totally fine in Australian pubs.',
  jsonb_build_object('question', 'Giving free drinks to friends is totally fine in Australian pubs.', 'answer', 'false', 'explanation', 'Unauthorized comps are legally considered theft. All free drinks must be approved and logged in the POS by a manager.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'compliance']),

(20, 202, 'quiz', 'Recording a dropped bottle in the wastage log is mandatory.',
  jsonb_build_object('question', 'Recording a dropped bottle in the wastage log is mandatory.', 'answer', 'true', 'explanation', 'Logging waste ensures the stocktake balances at the end of the month, explaining exactly where the lost inventory went.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'waste']),

(20, 203, 'quiz', 'First-in, first-out means using the oldest stock before the newest.',
  jsonb_build_object('question', 'First-in, first-out means using the oldest stock before the newest.', 'answer', 'true', 'explanation', 'This FIFO principle ensures perishables like milk, juice, and kegs are used before they expire and become waste.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'stock']),

(20, 204, 'quiz', 'You can pour leftover wine back into the bottle to save money.',
  jsonb_build_object('question', 'You can pour leftover wine back into the bottle to save money.', 'answer', 'false', 'explanation', 'This is a severe health violation. Once a liquid has touched a guest''s glass, it must be poured down the drain.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'compliance']),

(20, 205, 'quiz', 'Accurate stocktakes depend on counting every single item in the venue.',
  jsonb_build_object('question', 'Accurate stocktakes depend on counting every single item in the venue.', 'answer', 'true', 'explanation', 'From the coolroom kegs to the half-empty bottles on the speed rail, every drop must be accounted for monthly.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'stocktake']),

(20, 206, 'quiz', 'Using a jigger ensures exact measurements and perfect stock control.',
  jsonb_build_object('question', 'Using a jigger ensures exact measurements and perfect stock control.', 'answer', 'true', 'explanation', 'Free-pouring is inaccurate and often illegal depending on the venue policy. Jiggers guarantee a 30ml pour every time.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'measures']),

(20, 207, 'quiz', 'Throwing away half-full kegs is a standard weekly procedure.',
  jsonb_build_object('question', 'Throwing away half-full kegs is a standard weekly procedure.', 'answer', 'false', 'explanation', 'Kegs have a long shelf life. Throwing away a half keg is a massive financial loss and indicates terrible stock management.', 'option_type', 'truefalse'),
  2, ARRAY['inventory', 'waste']);
