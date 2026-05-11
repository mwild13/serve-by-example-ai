-- ============================================================
-- Module Verify — True/False Quiz Questions (Part 2)
-- 8 questions per module, 20 modules = 160 total
-- Modules 21–40 (War Room: High-Stakes Operational Skills)
-- Scenario index 200–207 per module
-- answer must be exactly 'true' or 'false' (lowercase string)
-- ============================================================

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

-- ===== MODULE 21: The "Behind!" Rule — Spatial Awareness & Safety =====
(21, 200, 'quiz', 'Calling "Behind!" before moving past someone in a narrow bar space is required.',
  jsonb_build_object('question', 'Calling "Behind!" before moving past someone in a narrow bar space is required.', 'answer', 'true', 'explanation', 'This is the most important vocal command in the industry. A single unannounced pass can cause a tray drop or serious burn injury.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'communication']),

(21, 201, 'quiz', 'You only need to call "Behind!" when carrying a full tray.',
  jsonb_build_object('question', 'You only need to call "Behind!" when carrying a full tray.', 'answer', 'false', 'explanation', 'The call is required any time you move through an occupied space — even empty-handed. Collisions can happen without a tray.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'communication']),

(21, 202, 'quiz', 'The word "Corner!" is used to warn others before stepping around a blind corner.',
  jsonb_build_object('question', 'The word "Corner!" is used to warn others before stepping around a blind corner.', 'answer', 'true', 'explanation', 'Blind corners are collision black spots in busy venues. "Corner!" gives oncoming traffic a split second to stop.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'communication']),

(21, 203, 'quiz', 'It is fine to push past a colleague without warning during a rush.',
  jsonb_build_object('question', 'It is fine to push past a colleague without warning during a rush.', 'answer', 'false', 'explanation', 'Physical contact without warning during a rush causes tray drops, spills, and injuries. The busier the venue, the more critical the call.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'communication']),

(21, 204, 'quiz', 'Compressing your body sideways when moving through a crowd reduces collision risk.',
  jsonb_build_object('question', 'Compressing your body sideways when moving through a crowd reduces collision risk.', 'answer', 'true', 'explanation', 'Turning sideways and tucking elbows in — the "compressed walk" — minimizes your physical footprint in a packed venue.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'technique']),

(21, 205, 'quiz', 'Staff should run between the bar and kitchen during busy service.',
  jsonb_build_object('question', 'Staff should run between the bar and kitchen during busy service.', 'answer', 'false', 'explanation', 'Running causes collisions and spills. Walk fast with purpose and call ahead — "Coming through!" — to clear your path.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'communication']),

(21, 206, 'quiz', '"Coming through!" is the correct call when navigating a crowded dining room.',
  jsonb_build_object('question', '"Coming through!" is the correct call when navigating a crowded dining room.', 'answer', 'true', 'explanation', 'This verbal signal tells both guests and staff to clear a path and is standard professional floor navigation.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'communication']),

(21, 207, 'quiz', 'Vocal safety commands are only used by inexperienced staff members.',
  jsonb_build_object('question', 'Vocal safety commands are only used by inexperienced staff members.', 'answer', 'false', 'explanation', 'Every seasoned professional uses these calls because collisions do not discriminate by experience. The habit is what keeps everyone safe.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'communication']),

-- ===== MODULE 22: The "Glass in Well" Emergency (The Burn Protocol) =====
(22, 200, 'quiz', 'If a glass breaks in the ice well, you must melt the entire well immediately.',
  jsonb_build_object('question', 'If a glass breaks in the ice well, you must melt the entire well immediately.', 'answer', 'true', 'explanation', 'Glass shards in ice are invisible to the eye. The only safe WHS protocol is pouring hot water to melt every last cube.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

(22, 201, 'quiz', 'You can scoop out visible glass pieces and continue using the remaining ice.',
  jsonb_build_object('question', 'You can scoop out visible glass pieces and continue using the remaining ice.', 'answer', 'false', 'explanation', 'Invisible micro-shards remain embedded in the ice. Partial clearing is not safe — the entire well must be burned.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

(22, 202, 'quiz', 'Hot water is poured into the well to melt all ice during a Burn Protocol.',
  jsonb_build_object('question', 'Hot water is poured into the well to melt all ice during a Burn Protocol.', 'answer', 'true', 'explanation', 'Hot water is the fastest and most thorough method to melt all ice and flush potential shards down the drain safely.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

(22, 203, 'quiz', 'A glass breaking in the ice well only needs to be reported, not cleaned immediately.',
  jsonb_build_object('question', 'A glass breaking in the ice well only needs to be reported, not cleaned immediately.', 'answer', 'false', 'explanation', 'The contamination is immediate. Every drink poured from that point on is potentially dangerous — the well must be burned at once.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

(22, 204, 'quiz', 'Using a glass to scoop ice is the leading cause of ice well glass contamination.',
  jsonb_build_object('question', 'Using a glass to scoop ice is the leading cause of ice well glass contamination.', 'answer', 'true', 'explanation', 'This is exactly why the scoop rule exists. Glass on glass creates chips that vanish into the ice instantly.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

(22, 205, 'quiz', 'A proper Burn Protocol can be completed in under two minutes.',
  jsonb_build_object('question', 'A proper Burn Protocol can be completed in under two minutes.', 'answer', 'false', 'explanation', 'Melting a full ice well, draining it, and confirming it is clear takes 15–20 minutes. It is a genuine service shutdown.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

(22, 206, 'quiz', 'The ice scoop must be returned to a clean holder after every single use.',
  jsonb_build_object('question', 'The ice scoop must be returned to a clean holder after every single use.', 'answer', 'true', 'explanation', 'Leaving the scoop in the ice or on the bar top risks contaminating it with bacteria or foreign objects between uses.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'ice']),

(22, 207, 'quiz', 'You can wait until the venue closes before burning a contaminated ice well.',
  jsonb_build_object('question', 'You can wait until the venue closes before burning a contaminated ice well.', 'answer', 'false', 'explanation', 'Contaminated ice must never serve another customer. Burning the well is immediate regardless of how busy the bar is.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

-- ===== MODULE 23: The Swivel Head — Identifying Needs from 10 Meters =====
(23, 200, 'quiz', 'An empty glass left on a table is known in the industry as a "dead soldier."',
  jsonb_build_object('question', 'An empty glass left on a table is known in the industry as a "dead soldier."', 'answer', 'true', 'explanation', 'This is the standard hospitality term for any finished vessel. Spotting dead soldiers from across the room is a core skill.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

(23, 201, 'quiz', 'Staff should focus exclusively on the task directly in front of them.',
  jsonb_build_object('question', 'Staff should focus exclusively on the task directly in front of them.', 'answer', 'false', 'explanation', 'The "swivel head" technique means constantly scanning the room while performing other tasks. Tunnel vision is a floor failure.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

(23, 202, 'quiz', 'A guest looking around the room while holding a menu likely needs a server.',
  jsonb_build_object('question', 'A guest looking around the room while holding a menu likely needs a server.', 'answer', 'true', 'explanation', 'The "lost look" — open menu, scanning eyes — is one of the clearest visual cues that the guest needs assistance.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

(23, 203, 'quiz', 'A raised hand from a guest can wait until you have finished your current task.',
  jsonb_build_object('question', 'A raised hand from a guest can wait until you have finished your current task.', 'answer', 'false', 'explanation', 'A raised hand means the guest has already lost patience. Drop your current task or acknowledge immediately with a nod.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

(23, 204, 'quiz', 'Scanning the room every 60 seconds helps prevent guests from feeling ignored.',
  jsonb_build_object('question', 'Scanning the room every 60 seconds helps prevent guests from feeling ignored.', 'answer', 'true', 'explanation', 'Regular visual sweeps allow you to identify needs before they become frustrations, keeping the whole room in control.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

(23, 205, 'quiz', 'Tunnel vision on your immediate task is the sign of an experienced server.',
  jsonb_build_object('question', 'Tunnel vision on your immediate task is the sign of an experienced server.', 'answer', 'false', 'explanation', 'Tunnel vision is the hallmark of an overwhelmed or inexperienced worker. Expert servers are always reading the whole room.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

(23, 206, 'quiz', 'Eye contact and a nod from across the room are enough to reassure a waiting guest.',
  jsonb_build_object('question', 'Eye contact and a nod from across the room are enough to reassure a waiting guest.', 'answer', 'true', 'explanation', 'A visible acknowledgment resets the guest''s patience clock even from 10 meters away, buying you critical time.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

(23, 207, 'quiz', 'Noticing empty glasses and guest needs is the floor manager''s job, not the server''s.',
  jsonb_build_object('question', 'Noticing empty glasses and guest needs is the floor manager''s job, not the server''s.', 'answer', 'false', 'explanation', 'Every single person on the floor shares responsibility for reading the room. Managers cannot be everywhere at once.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'awareness']),

-- ===== MODULE 24: Ice is Food — The Sacred Rules of the Scoop =====
(24, 200, 'quiz', 'Ice is classified as a food product under Australian food safety regulations.',
  jsonb_build_object('question', 'Ice is classified as a food product under Australian food safety regulations.', 'answer', 'true', 'explanation', 'Because ice enters food and drinks directly, contaminating it carries the same legal and health consequences as contaminating food.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'ice']),

(24, 201, 'quiz', 'Using bare hands to transfer ice is acceptable if you are wearing food-safe gloves.',
  jsonb_build_object('question', 'Using bare hands to transfer ice is acceptable if you are wearing food-safe gloves.', 'answer', 'false', 'explanation', 'Even gloved hands introduce warmth that melts ice and bacteria that can persist on glove surfaces. The scoop is non-negotiable.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'ice']),

(24, 202, 'quiz', 'The ice scoop handle must always be kept pointing upward, out of the ice.',
  jsonb_build_object('question', 'The ice scoop handle must always be kept pointing upward, out of the ice.', 'answer', 'true', 'explanation', 'A handle buried in ice forces the staff member to grab the scoop above the bowl, meaning their hand is directly over the ice.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'ice']),

(24, 203, 'quiz', 'The ice machine lid can be left open during service for faster access.',
  jsonb_build_object('question', 'The ice machine lid can be left open during service for faster access.', 'answer', 'false', 'explanation', 'An open lid allows airborne contaminants, insects, and moisture to enter the machine and contaminate every batch of ice produced.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'ice']),

(24, 204, 'quiz', 'A cracked or chipped ice scoop must be removed from service immediately.',
  jsonb_build_object('question', 'A cracked or chipped ice scoop must be removed from service immediately.', 'answer', 'true', 'explanation', 'A broken scoop can shed plastic fragments into the ice well, which then enters guest drinks invisibly.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'safety']),

(24, 205, 'quiz', 'You can use a pint glass to scoop ice in an emergency if the scoop is missing.',
  jsonb_build_object('question', 'You can use a pint glass to scoop ice in an emergency if the scoop is missing.', 'answer', 'false', 'explanation', 'Glass on ice causes chips and is one of the most dangerous acts behind a bar. Find the scoop or ask a colleague for one.', 'option_type', 'truefalse'),
  2, ARRAY['safety', 'ice']),

(24, 206, 'quiz', 'Ice machines must be cleaned and sanitized on a regular scheduled cycle.',
  jsonb_build_object('question', 'Ice machines must be cleaned and sanitized on a regular scheduled cycle.', 'answer', 'true', 'explanation', 'Bio-film builds up inside machines and can contaminate every batch of ice produced if the machine is not sanitized regularly.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'ice']),

(24, 207, 'quiz', 'Ice from one well can be freely transferred to another well using any clean container.',
  jsonb_build_object('question', 'Ice from one well can be freely transferred to another well using any clean container.', 'answer', 'false', 'explanation', 'Cross-well transfers must follow the same scoop-only hygiene protocol. The container must be the designated clean ice bucket.', 'option_type', 'truefalse'),
  2, ARRAY['hygiene', 'ice']),

-- ===== MODULE 25: The "Allergy Shield" — Communicating Dietary Danger =====
(25, 200, 'quiz', 'A guest''s allergy must be verbally relayed to the kitchen immediately after taking the order.',
  jsonb_build_object('question', 'A guest''s allergy must be verbally relayed to the kitchen immediately after taking the order.', 'answer', 'true', 'explanation', 'Written tickets can be missed in a rush. A direct verbal call to the chef closes the gap and creates a verbal confirmation loop.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'safety']),

(25, 201, 'quiz', '"Contains nuts" printed on a menu is sufficient and requires no further staff action.',
  jsonb_build_object('question', '"Contains nuts" printed on a menu is sufficient and requires no further staff action.', 'answer', 'false', 'explanation', 'Menu warnings are the starting point, not the endpoint. Staff must proactively confirm the allergy and alert the kitchen before placing the order.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'safety']),

(25, 202, 'quiz', 'A severe nut allergy can trigger anaphylaxis from trace amounts on shared equipment.',
  jsonb_build_object('question', 'A severe nut allergy can trigger anaphylaxis from trace amounts on shared equipment.', 'answer', 'true', 'explanation', 'Cross-contamination on a shared cutting board or pan is enough to cause a life-threatening reaction in a sensitized guest.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'safety']),

(25, 203, 'quiz', 'If you are busy, the guest can relay their own allergy directly to the kitchen.',
  jsonb_build_object('question', 'If you are busy, the guest can relay their own allergy directly to the kitchen.', 'answer', 'false', 'explanation', 'The serving staff are the communication bridge between guest and kitchen. This responsibility cannot be delegated to the guest.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'safety']),

(25, 204, 'quiz', 'The POS ticket must be clearly marked with all allergy and dietary information.',
  jsonb_build_object('question', 'The POS ticket must be clearly marked with all allergy and dietary information.', 'answer', 'true', 'explanation', 'The ticket is the kitchen''s primary instruction document. Allergy data missing from the docket is allergy data at risk.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'dockets']),

(25, 205, 'quiz', 'Asking about allergies is only required for large group bookings.',
  jsonb_build_object('question', 'Asking about allergies is only required for large group bookings.', 'answer', 'false', 'explanation', 'Every single order taken must prompt an allergy check from the server, regardless of group size.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'safety']),

(25, 206, 'quiz', 'Checking with the chef before serving a suspected allergen dish is mandatory.',
  jsonb_build_object('question', 'Checking with the chef before serving a suspected allergen dish is mandatory.', 'answer', 'true', 'explanation', 'A visual and verbal double-check with the kitchen before the plate touches the table is the final safety net.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'safety']),

(25, 207, 'quiz', 'A guest who says they are "just a little intolerant" requires no allergy protocol.',
  jsonb_build_object('question', 'A guest who says they are "just a little intolerant" requires no allergy protocol.', 'answer', 'false', 'explanation', 'The level of sensitivity varies enormously between guests. Any declared intolerance must be treated with full allergy protocol.', 'option_type', 'truefalse'),
  2, ARRAY['allergens', 'safety']),

-- ===== MODULE 26: The Soda Gun — Muscle Memory & Troubleshooting =====
(26, 200, 'quiz', 'Learning the soda gun button layout by feel allows you to pour without looking down.',
  jsonb_build_object('question', 'Learning the soda gun button layout by feel allows you to pour without looking down.', 'answer', 'true', 'explanation', 'During a rush, your eyes must be on the guest and the glass. Muscle memory on the gun eliminates the dead second of looking down.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'technique']),

(26, 201, 'quiz', 'The soda gun should be flushed with fresh soda after each use to keep it clean.',
  jsonb_build_object('question', 'The soda gun should be flushed with fresh soda after each use to keep it clean.', 'answer', 'false', 'explanation', 'The gun should be rinsed with clean water, not soda. Soda leaves sugar residue behind, feeding bacteria and clogging the nozzle.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'hygiene']),

(26, 202, 'quiz', 'A "warm" first pour from the soda gun is caused by syrup sitting in an unrefrigerated line.',
  jsonb_build_object('question', 'A "warm" first pour from the soda gun is caused by syrup sitting in an unrefrigerated line.', 'answer', 'true', 'explanation', 'Lines warm up between uses. The first few ounces should always be dispensed to waste before serving a guest.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'technique']),

(26, 203, 'quiz', 'Running out of bag-in-box syrup will shut down bar service for at least 30 minutes.',
  jsonb_build_object('question', 'Running out of bag-in-box syrup will shut down bar service for at least 30 minutes.', 'answer', 'false', 'explanation', 'Replacing a bag-in-box takes under two minutes. Knowing where the spare boxes are stored prevents any significant downtime.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'troubleshooting']),

(26, 204, 'quiz', 'Pressing the wrong button on a soda gun mid-pour means the drink must be remade.',
  jsonb_build_object('question', 'Pressing the wrong button on a soda gun mid-pour means the drink must be remade entirely.', 'answer', 'true', 'explanation', 'Accidental tonic instead of soda in a cocktail fundamentally changes the drink. It must be discarded and remade.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'technique']),

(26, 205, 'quiz', 'The soda gun nozzle cleans itself through normal use during service.',
  jsonb_build_object('question', 'The soda gun nozzle cleans itself through normal use during service.', 'answer', 'false', 'explanation', 'The nozzle must be manually cleaned daily to prevent syrup buildup that creates bacterial growth and flavour contamination.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'hygiene']),

(26, 206, 'quiz', 'Knowing which button number maps to which syrup is essential bar knowledge.',
  jsonb_build_object('question', 'Knowing which button number maps to which syrup is essential bar knowledge.', 'answer', 'true', 'explanation', 'The standard order is typically Cola, Diet, Lemon, Soda, Tonic — but every bar differs. Knowing your specific gun cold is non-negotiable.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'knowledge']),

(26, 207, 'quiz', 'You can top up a guest''s drink with the soda gun without asking first.',
  jsonb_build_object('question', 'You can top up a guest''s drink with the soda gun without asking first.', 'answer', 'false', 'explanation', 'Topping up uninvited can change the drink''s taste profile or water down a cocktail the guest is intentionally sipping slowly.', 'option_type', 'truefalse'),
  2, ARRAY['bar', 'service']),

-- ===== MODULE 27: Economy of Motion — Two Hands, One Flow =====
(27, 200, 'quiz', 'Expert bartenders eliminate "dead time" by performing two complementary actions simultaneously.',
  jsonb_build_object('question', 'Expert bartenders eliminate "dead time" by performing two complementary actions simultaneously.', 'answer', 'true', 'explanation', 'The core principle of two-handed service is never letting one hand sit idle while the other is working.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'technique']),

(27, 201, 'quiz', 'Moving faster is the main difference between a novice and an expert bartender.',
  jsonb_build_object('question', 'Moving faster is the main difference between a novice and an expert bartender.', 'answer', 'false', 'explanation', 'Expert bartenders move less, not faster. They eliminate unnecessary steps through planning, not by rushing.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'technique']),

(27, 202, 'quiz', 'Grabbing a glass with one hand while hitting the soda gun with the other is two-handed service.',
  jsonb_build_object('question', 'Grabbing a glass with one hand while hitting the soda gun with the other is two-handed service.', 'answer', 'true', 'explanation', 'This simultaneous action is the textbook example of economy of motion — both hands working toward a single drink.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'technique']),

(27, 203, 'quiz', 'Pre-building garnishes before service begins is a waste of valuable prep time.',
  jsonb_build_object('question', 'Pre-building garnishes before service begins is a waste of valuable prep time.', 'answer', 'false', 'explanation', 'Pre-building garnishes is classic mise en place. It eliminates the deadly fumble with a knife during a live rush.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'mise-en-place']),

(27, 204, 'quiz', 'Walking to the same destination twice because you forgot something wastes critical service time.',
  jsonb_build_object('question', 'Walking to the same destination twice because you forgot something wastes critical service time.', 'answer', 'true', 'explanation', '"Two birds, one stone" thinking is core to economy of motion — never make a trip without carrying something in both directions.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'technique']),

(27, 205, 'quiz', 'The most efficient bartenders are the ones who tackle the most tasks at once.',
  jsonb_build_object('question', 'The most efficient bartenders are the ones who tackle the most tasks at once.', 'answer', 'false', 'explanation', 'Stacking too many tasks causes errors. Economy of motion is about deliberate double-actions, not chaotic multitasking.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'technique']),

(27, 206, 'quiz', 'Positioning the next glass under the gun before the first is finished poured saves real time.',
  jsonb_build_object('question', 'Positioning the next glass under the gun before the first is finished poured saves real time.', 'answer', 'true', 'explanation', 'Queuing the next glass in advance cuts the dead movement of reaching for it from scratch, compounding over hundreds of drinks a night.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'technique']),

(27, 207, 'quiz', 'Economy of motion habits only matter during a peak rush period.',
  jsonb_build_object('question', 'Economy of motion habits only matter during a peak rush period.', 'answer', 'false', 'explanation', 'Efficient movement must be practiced constantly in quiet periods so that it becomes fully automatic when pressure hits.', 'option_type', 'truefalse'),
  2, ARRAY['efficiency', 'technique']),

-- ===== MODULE 28: The Mid-Shift Reload — Mise en Place Maintenance =====
(28, 200, 'quiz', 'Mise en place means having everything in its correct place before service begins.',
  jsonb_build_object('question', 'Mise en place means having everything in its correct place before service begins.', 'answer', 'true', 'explanation', 'This French culinary principle applies equally to the bar, floor, and kitchen. Setup determines the quality of the service.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'efficiency']),

(28, 201, 'quiz', 'You should restock your station once, at the start of the shift, and that is sufficient.',
  jsonb_build_object('question', 'You should restock your station once, at the start of the shift, and that is sufficient.', 'answer', 'false', 'explanation', 'Stations deplete fast under pressure. Continuous reloading in the micro-gaps between service waves is essential to maintain flow.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'efficiency']),

(28, 202, 'quiz', 'Running out of garnish mid-rush is a visible service failure caused by station mismanagement.',
  jsonb_build_object('question', 'Running out of garnish mid-rush is a visible service failure caused by station mismanagement.', 'answer', 'true', 'explanation', 'A bartender visibly searching for a lime wedge mid-order telegraphs poor preparation to the entire room.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'efficiency']),

(28, 203, 'quiz', 'A 3-minute reload window is impossible to achieve in a real service environment.',
  jsonb_build_object('question', 'A 3-minute reload window is impossible to achieve in a real service environment.', 'answer', 'false', 'explanation', 'Expert staff identify the brief lulls between waves and use them to refill citrus, ice, and glassware before the next rush arrives.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'efficiency']),

(28, 204, 'quiz', 'A tidy, fully-stocked station signals professionalism to your colleagues and management.',
  jsonb_build_object('question', 'A tidy, fully-stocked station signals professionalism to your colleagues and management.', 'answer', 'true', 'explanation', 'How your station looks mid-service communicates your standards. A stocked, organized station says you are in control.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'professionalism']),

(28, 205, 'quiz', 'Asking a colleague to cover for 90 seconds while you restock is bad teamwork.',
  jsonb_build_object('question', 'Asking a colleague to cover for 90 seconds while you restock is bad teamwork.', 'answer', 'false', 'explanation', 'A quick cover request is exactly how a coordinated team operates. Silent suffering until you run out is what breaks service.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'teamwork']),

(28, 206, 'quiz', 'Ice levels should be checked and topped up during every available quiet moment.',
  jsonb_build_object('question', 'Ice levels should be checked and topped up during every available quiet moment.', 'answer', 'true', 'explanation', 'Running low on ice mid-rush is one of the most common avoidable disasters behind a bar. Top up constantly.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'ice']),

(28, 207, 'quiz', 'The end of a wave is the wrong time to reset your mise en place.',
  jsonb_build_object('question', 'The end of a wave is the wrong time to reset your mise en place.', 'answer', 'false', 'explanation', 'The brief quiet after a wave is the perfect window. You must be ready before the next wave arrives, not scrambling during it.', 'option_type', 'truefalse'),
  2, ARRAY['mise-en-place', 'efficiency']),

-- ===== MODULE 29: Deciphering the Docket — From Printer to Plate =====
(29, 200, 'quiz', '"M/R" on a POS docket means the steak must be cooked to Medium Rare.',
  jsonb_build_object('question', '"M/R" on a POS docket means the steak must be cooked to Medium Rare.', 'answer', 'true', 'explanation', 'This is a universal POS abbreviation used in venues across Australia. Misreading it means an incorrect steak and an angry table.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'dockets']),

(29, 201, 'quiz', 'A docket with no special instructions confirms the table has no allergies.',
  jsonb_build_object('question', 'A docket with no special instructions confirms the table has no allergies.', 'answer', 'false', 'explanation', 'Guests sometimes forget to mention allergies at order time. Always confirm verbally with the server if you are unsure.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'allergens']),

(29, 202, 'quiz', 'Food tickets are prioritized by the time they are printed, not by table number.',
  jsonb_build_object('question', 'Food tickets are prioritized by the time they are printed, not by table number.', 'answer', 'true', 'explanation', 'The printer queue represents order of entry. Skipping ahead by table number disrupts the entire kitchen''s flow and makes some tables wait unfairly.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'dockets']),

(29, 203, 'quiz', '"G/F" on a docket means the dish is served with a gravy-free sauce.',
  jsonb_build_object('question', '"G/F" on a docket means the dish is served with a gravy-free sauce.', 'answer', 'false', 'explanation', '"G/F" universally stands for Gluten Free and must trigger the kitchen''s full allergen protocol immediately.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'allergens']),

(29, 204, 'quiz', '"86" or "OFF" on a kitchen note means that menu item is no longer available.',
  jsonb_build_object('question', '"86" or "OFF" on a kitchen note means that menu item is no longer available.', 'answer', 'true', 'explanation', '"86''d" is the universal hospitality term for an item that has run out. All floor staff must be briefed on 86 items immediately.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'knowledge']),

(29, 205, 'quiz', 'Runners can reorganize dockets to make carrying plates easier when food is ready.',
  jsonb_build_object('question', 'Runners can reorganize dockets to make carrying plates easier when food is ready.', 'answer', 'false', 'explanation', 'Dockets control the order of service. Reorganizing them without manager direction causes incorrect dishes to reach the wrong tables.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'dockets']),

(29, 206, 'quiz', 'Calling out a table number when placing food in the pass prevents it from sitting cold.',
  jsonb_build_object('question', 'Calling out a table number when placing food in the pass prevents it from sitting cold.', 'answer', 'true', 'explanation', 'A clear "Table 7 away!" signals the runner to collect immediately, keeping food at serving temperature for the guest.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'communication']),

(29, 207, 'quiz', 'Illegible handwritten additions to a docket can be ignored if they seem minor.',
  jsonb_build_object('question', 'Illegible handwritten additions to a docket can be ignored if they seem minor.', 'answer', 'false', 'explanation', 'Any handwritten addition must be clarified with the server immediately. It almost always contains allergy or modification information.', 'option_type', 'truefalse'),
  2, ARRAY['kitchen', 'allergens']),

-- ===== MODULE 30: Taming "The Weed" — Mental Fortitude Under Pressure =====
(30, 200, 'quiz', '"Being in the weed" is the hospitality term for being completely overwhelmed during a rush.',
  jsonb_build_object('question', '"Being in the weed" is the hospitality term for being completely overwhelmed during a rush.', 'answer', 'true', 'explanation', 'Every hospitality worker will experience being in the weed. Knowing how to escape it methodically is the defining skill.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'pressure']),

(30, 201, 'quiz', 'The best way to escape being in the weed is to speed up and stop communicating.',
  jsonb_build_object('question', 'The best way to escape being in the weed is to speed up and stop communicating.', 'answer', 'false', 'explanation', 'Speeding up causes errors and silence makes guests angrier. Acknowledge everyone, breathe, and work the tickets in order.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'pressure']),

(30, 202, 'quiz', 'Verbally acknowledging every waiting guest with "With you in a moment" prevents escalation.',
  jsonb_build_object('question', 'Verbally acknowledging every waiting guest with "With you in a moment" prevents escalation.', 'answer', 'true', 'explanation', 'Being seen and verbally acknowledged resets a guest''s patience, buying you critical time to work through the backlog.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'service']),

(30, 203, 'quiz', 'Taking on extra tables when you are already overwhelmed shows a strong work ethic.',
  jsonb_build_object('question', 'Taking on extra tables when you are already overwhelmed shows a strong work ethic.', 'answer', 'false', 'explanation', 'Overloading your section causes all your tables to suffer. Knowing your capacity limit and calling for help is the smarter move.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'pressure']),

(30, 204, 'quiz', 'Working tickets in the order they were received prevents reactive chaos during a rush.',
  jsonb_build_object('question', 'Working tickets in the order they were received prevents reactive chaos during a rush.', 'answer', 'true', 'explanation', '"Slow is smooth, smooth is fast." Orderly first-in-first-out service consistently produces better outcomes than reactive scrambling.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'efficiency']),

(30, 205, 'quiz', 'Taking a deliberate 30-second pause to assess priorities during a rush is a waste of time.',
  jsonb_build_object('question', 'Taking a deliberate 30-second pause to assess priorities during a rush is a waste of time.', 'answer', 'false', 'explanation', 'A conscious pause to identify the two or three most critical tasks is far more productive than 30 seconds of reactive panic.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'pressure']),

(30, 206, 'quiz', 'Asking a colleague for help when you are overwhelmed is a sign of good self-awareness.',
  jsonb_build_object('question', 'Asking a colleague for help when you are overwhelmed is a sign of good self-awareness.', 'answer', 'true', 'explanation', 'Good team members call for backup early. Waiting until you crash takes the whole team down and ruins the guest experience.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'teamwork']),

(30, 207, 'quiz', 'Guests are always understanding when a staff member is visibly struggling.',
  jsonb_build_object('question', 'Guests are always understanding when a staff member is visibly struggling.', 'answer', 'false', 'explanation', 'Guests are paying for a service experience. Visible distress from staff makes them uncomfortable and less likely to return or tip.', 'option_type', 'truefalse'),
  2, ARRAY['mindset', 'service']),

-- ===== MODULE 31: The 30ml Truth — Precision vs. Profit =====
(31, 200, 'quiz', 'The standard single spirit measure in an Australian venue is 30ml.',
  jsonb_build_object('question', 'The standard single spirit measure in an Australian venue is 30ml.', 'answer', 'true', 'explanation', 'This is the legal standard. Venues that use a different measure must clearly display that fact to guests.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'compliance']),

(31, 201, 'quiz', 'Free-pouring spirits is just as accurate as using a jigger if you have experience.',
  jsonb_build_object('question', 'Free-pouring spirits is just as accurate as using a jigger if you have experience.', 'answer', 'false', 'explanation', 'Studies consistently show that even experienced free-pourers over-deliver by 5–10ml per drink, destroying the bar''s gross profit margin.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'compliance']),

(31, 202, 'quiz', 'The meniscus is the slight curve of liquid at the top of a full jigger.',
  jsonb_build_object('question', 'The meniscus is the slight curve of liquid at the top of a full jigger.', 'answer', 'true', 'explanation', 'Reading the meniscus at eye level, not from above, ensures the pour is exactly 30ml and not a milliliter over.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'technique']),

(31, 203, 'quiz', 'Over-pouring spirits by 5ml per drink is too small an amount to affect the venue''s profit.',
  jsonb_build_object('question', 'Over-pouring spirits by 5ml per drink is too small an amount to affect the venue''s profit.', 'answer', 'false', 'explanation', 'At 200 drinks per night, 5ml over means 1 full litre of spirits given away for free daily — a devastating impact on gross profit.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'inventory']),

(31, 204, 'quiz', 'Using a jigger protects the bartender from accusations of short-changing a guest.',
  jsonb_build_object('question', 'Using a jigger protects the bartender from accusations of short-changing a guest.', 'answer', 'true', 'explanation', 'A jigger is both a profit tool and a legal defense. If a guest claims they were under-poured, the jigger is the proof.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'compliance']),

(31, 205, 'quiz', 'The jigger is only required for cocktails, not for spirit-and-mixer drinks.',
  jsonb_build_object('question', 'The jigger is only required for cocktails, not for spirit-and-mixer drinks.', 'answer', 'false', 'explanation', 'Every single spirit pour, regardless of the drink''s complexity, must be measured to maintain compliance and GP consistency.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'compliance']),

(31, 206, 'quiz', 'Consistent 30ml pours ensure the venue''s stocktake aligns with actual sales data.',
  jsonb_build_object('question', 'Consistent 30ml pours ensure the venue''s stocktake aligns with actual sales data.', 'answer', 'true', 'explanation', 'If stocktake shows more spirits used than POS sales account for, over-pouring or theft is the culprit.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'inventory']),

(31, 207, 'quiz', 'Guests who ask for "a bit extra" can be accommodated as a goodwill gesture.',
  jsonb_build_object('question', 'Guests who ask for "a bit extra" can be accommodated as a goodwill gesture.', 'answer', 'false', 'explanation', 'Unauthorized over-pours are both a compliance and a theft issue. Only a manager can authorize a complimentary extra.', 'option_type', 'truefalse'),
  2, ARRAY['measures', 'compliance']),

-- ===== MODULE 32: The Waiter's Friend — Mechanical Wine Mastery =====
(32, 200, 'quiz', 'The foil on a wine bottle should be cut below the second lip for a clean presentation.',
  jsonb_build_object('question', 'The foil on a wine bottle should be cut below the second lip for a clean presentation.', 'answer', 'true', 'explanation', 'Cutting below the second lip hides the cut edge when pouring, keeping the presentation clean and professional.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'technique']),

(32, 201, 'quiz', 'Pulling a cork out in one fast, smooth motion is the professional technique.',
  jsonb_build_object('question', 'Pulling a cork out in one fast, smooth motion is the professional technique.', 'answer', 'false', 'explanation', 'The waiter''s friend uses a two-step lever system — seat the lever halfway up the bottle lip, lift, then fully up — for a controlled extraction.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'technique']),

(32, 202, 'quiz', 'The cork should be extracted silently rather than with a loud dramatic pop.',
  jsonb_build_object('question', 'The cork should be extracted silently rather than with a loud dramatic pop.', 'answer', 'true', 'explanation', 'A silent extraction maintains professionalism in the dining room and prevents carbonation loss in sparkling wines.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'technique']),

(32, 203, 'quiz', 'The foil cutter on a waiter''s friend is primarily decorative.',
  jsonb_build_object('question', 'The foil cutter on a waiter''s friend is primarily decorative.', 'answer', 'false', 'explanation', 'The integrated foil cutter produces a clean, even incision without tearing the foil or leaving a jagged edge.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'technique']),

(32, 204, 'quiz', 'Practicing the two-step lever technique prevents the cork from breaking in half.',
  jsonb_build_object('question', 'Practicing the two-step lever technique prevents the cork from breaking in half.', 'answer', 'true', 'explanation', 'A broken cork is caused by misaligning the lever or rushing the extraction. The two-step provides mechanical control.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'technique']),

(32, 205, 'quiz', 'You should twist the bottle when extracting the cork rather than the corkscrew.',
  jsonb_build_object('question', 'You should twist the bottle when extracting the cork rather than the corkscrew.', 'answer', 'false', 'explanation', 'The bottle must be held perfectly steady. Only the corkscrew and lever mechanism should move during a clean extraction.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'technique']),

(32, 206, 'quiz', 'Presenting the extracted cork to the guest allows them to check for signs of a fault.',
  jsonb_build_object('question', 'Presenting the extracted cork to the guest allows them to check for signs of a fault.', 'answer', 'true', 'explanation', 'A moist, fragrant cork is a good sign. A dry, crumbly cork suggests the wine was stored upright and may be compromised.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'service']),

(32, 207, 'quiz', 'A waiter''s friend is only necessary for expensive bottles of wine.',
  jsonb_build_object('question', 'A waiter''s friend is only necessary for expensive bottles of wine.', 'answer', 'false', 'explanation', 'Every corked bottle served at a table requires a professional tableside opening, regardless of its price point.', 'option_type', 'truefalse'),
  2, ARRAY['wine', 'service']),

-- ===== MODULE 33: The Cellar Sprint — Kegs, Gas, and Gurgles =====
(33, 200, 'quiz', 'A "fobbing" tap means the keg is producing excessive, undrinkable foam.',
  jsonb_build_object('question', 'A "fobbing" tap means the keg is producing excessive, undrinkable foam.', 'answer', 'true', 'explanation', 'Fobbing stops the bar from pouring and signals a problem — typically an empty keg, a gas issue, or a warm line.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'beer']),

(33, 201, 'quiz', 'You should remove a keg coupler without turning off the gas first.',
  jsonb_build_object('question', 'You should remove a keg coupler without turning off the gas first.', 'answer', 'false', 'explanation', 'Releasing a coupler under full gas pressure causes a dangerous blowout of gas and beer. The gas valve must always be closed first.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'safety']),

(33, 202, 'quiz', 'Air bubbles in the beer line cause the first pours to fob heavily after a keg change.',
  jsonb_build_object('question', 'Air bubbles in the beer line cause the first pours to fob heavily after a keg change.', 'answer', 'true', 'explanation', 'After any keg change, air must be purged from the line with a few wasted pours before clean service resumes.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'beer']),

(33, 203, 'quiz', 'An empty gas bottle makes no noticeable difference to the pour quality.',
  jsonb_build_object('question', 'An empty gas bottle makes no noticeable difference to the pour quality.', 'answer', 'false', 'explanation', 'Without CO2 or mixed gas pressure, the keg cannot push beer through the line at all. An empty gas bottle kills the bar.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'beer']),

(33, 204, 'quiz', 'A full keg weighs approximately 50kg and must be handled with correct manual lifting technique.',
  jsonb_build_object('question', 'A full keg weighs approximately 50kg and must be handled with correct manual lifting technique.', 'answer', 'true', 'explanation', 'Lifting a full keg incorrectly causes serious back and shoulder injuries. Slide it rather than lift it wherever possible.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'safety']),

(33, 205, 'quiz', 'Kegs from different beer brands can always share the same coupler type.',
  jsonb_build_object('question', 'Kegs from different beer brands can always share the same coupler type.', 'answer', 'false', 'explanation', 'Different brands use different coupler types (e.g., S-type, A-type, G-type). Using the wrong coupler will damage the keg valve.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'knowledge']),

(33, 206, 'quiz', 'Beer lines should be professionally cleaned at least once per week.',
  jsonb_build_object('question', 'Beer lines should be professionally cleaned at least once per week.', 'answer', 'true', 'explanation', 'Weekly line cleans remove yeast and bacteria buildup that creates off-flavors in the beer and can impact guest health.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'hygiene']),

(33, 207, 'quiz', 'A tap that is still fobbing after 5 minutes will clear itself without investigation.',
  jsonb_build_object('question', 'A tap that is still fobbing after 5 minutes will clear itself without investigation.', 'answer', 'false', 'explanation', 'Persistent fobbing indicates an ongoing gas or temperature problem that requires immediate diagnosis to restore service.', 'option_type', 'truefalse'),
  2, ARRAY['cellar', 'troubleshooting']),

-- ===== MODULE 34: Glassware Geometry — Weight, Balance, and Grip =====
(34, 200, 'quiz', 'You should never touch the rim or inside of a glass when handling or carrying it.',
  jsonb_build_object('question', 'You should never touch the rim or inside of a glass when handling or carrying it.', 'answer', 'true', 'explanation', 'The rim is where the guest''s mouth goes. Touching it transfers bacteria and is immediately visible as unhygienic.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'hygiene']),

(34, 201, 'quiz', 'Carrying five glasses stacked inside each other is an efficient and safe technique.',
  jsonb_build_object('question', 'Carrying five glasses stacked inside each other is an efficient and safe technique.', 'answer', 'false', 'explanation', 'Stacking creates a vacuum seal that locks glasses together. Pulling them apart snaps the rims and causes breakage.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'safety']),

(34, 202, 'quiz', 'The "pinch" technique involves holding a glass by the base with two fingers and a thumb.',
  jsonb_build_object('question', 'The "pinch" technique involves holding a glass by the base with two fingers and a thumb.', 'answer', 'true', 'explanation', 'This stable, rim-free grip allows for carrying multiple glasses safely in one hand without touching any contact surface.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'technique']),

(34, 203, 'quiz', 'Glasses should always be carried individually to prevent breakage.',
  jsonb_build_object('question', 'Glasses should always be carried individually to prevent breakage.', 'answer', 'false', 'explanation', 'Efficient floor service requires carrying multiple glasses by hand. The pinch and stack techniques allow safe multi-glass carrying.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'efficiency']),

(34, 204, 'quiz', 'Carrying wine glasses by the stem keeps fingerprints off the bowl and maintains temperature.',
  jsonb_build_object('question', 'Carrying wine glasses by the stem keeps fingerprints off the bowl and maintains temperature.', 'answer', 'true', 'explanation', 'Body heat from holding the bowl warms chilled white wine and leaves greasy smudges that are visible to the guest.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'technique']),

(34, 205, 'quiz', 'The heaviest glasses should be placed at the outer edge of a tray for easy access.',
  jsonb_build_object('question', 'The heaviest glasses should be placed at the outer edge of a tray for easy access.', 'answer', 'false', 'explanation', 'Heavy items belong in the center of the tray. This lowers the center of gravity and dramatically improves stability.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'trays']),

(34, 206, 'quiz', 'Wet or freshly washed glasses are significantly more likely to slip from your grip.',
  jsonb_build_object('question', 'Wet or freshly washed glasses are significantly more likely to slip from your grip.', 'answer', 'true', 'explanation', 'The film of water on a clean glass dramatically reduces grip friction. Allow glasses to drain or pat dry before carrying.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'safety']),

(34, 207, 'quiz', 'Plates and glasses can be carried together in the same hand if you are careful.',
  jsonb_build_object('question', 'Plates and glasses can be carried together in the same hand if you are careful.', 'answer', 'false', 'explanation', 'Food residue from plates transfers onto glassware and creates dangerous weight imbalance between two entirely different carrying techniques.', 'option_type', 'truefalse'),
  2, ARRAY['glassware', 'safety']),

-- ===== MODULE 35: The "Golden Standard" Close — Cleaning for Tomorrow =====
(35, 200, 'quiz', 'A perfect close is described as the greatest gift you can give the morning shift.',
  jsonb_build_object('question', 'A perfect close is described as the greatest gift you can give the morning shift.', 'answer', 'true', 'explanation', 'A clean, fully-stocked venue at close means the opening crew can begin service immediately without cleaning up the previous night first.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'teamwork']),

(35, 201, 'quiz', 'Draining the coffee machine completely overnight is unnecessary if it is used again the next morning.',
  jsonb_build_object('question', 'Draining the coffee machine completely overnight is unnecessary if it is used again the next morning.', 'answer', 'false', 'explanation', 'Stale water left in the boiler overnight ruins the flavour of the first coffees and causes scale buildup in the heating element.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'coffee']),

(35, 202, 'quiz', 'The speed rail must be sanitized and wiped completely dry every single night.',
  jsonb_build_object('question', 'The speed rail must be sanitized and wiped completely dry every single night.', 'answer', 'true', 'explanation', 'Sticky spirits on the speed rail breed bacteria overnight and attract fruit flies by morning — both a hygiene and pest issue.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'hygiene']),

(35, 203, 'quiz', 'Restocking dry goods at close is a task that can be left for the opening shift.',
  jsonb_build_object('question', 'Restocking dry goods at close is a task that can be left for the opening shift.', 'answer', 'false', 'explanation', 'The closing shift is responsible for leaving the dry store in correct order. The morning team should only need to start, not clean up.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'procedures']),

(35, 204, 'quiz', 'All glassware must be polished and correctly racked before the close checklist is signed off.',
  jsonb_build_object('question', 'All glassware must be polished and correctly racked before the close checklist is signed off.', 'answer', 'true', 'explanation', 'Spotted or dirty glasses sitting in a service rack for the next day is a mark of a poor close that embarrasses the venue.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'glassware']),

(35, 205, 'quiz', 'Leaving one mop bucket of dirty water overnight saves time for the morning shift.',
  jsonb_build_object('question', 'Leaving one mop bucket of dirty water overnight saves time for the morning shift.', 'answer', 'false', 'explanation', 'Dirty water left overnight grows dangerous bacteria levels and produces a foul smell that permeates the venue by morning.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'hygiene']),

(35, 206, 'quiz', 'A signed-off close checklist creates accountability and confirms the venue was left in a safe condition.',
  jsonb_build_object('question', 'A signed-off close checklist creates accountability and confirms the venue was left in a safe condition.', 'answer', 'true', 'explanation', 'The checklist is both the legal record and the operational standard for every close. No checklist means no accountability.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'compliance']),

(35, 207, 'quiz', 'The floor only needs to be swept, not mopped, on quiet nights.',
  jsonb_build_object('question', 'The floor only needs to be swept, not mopped, on quiet nights.', 'answer', 'false', 'explanation', 'Floor hygiene standards are constant regardless of covers. Quiet nights are in fact the easiest time to do a thorough mop.', 'option_type', 'truefalse'),
  2, ARRAY['closing', 'hygiene']),

-- ===== MODULE 36: The "Two-Minute Check" — The Critical Window =====
(36, 200, 'quiz', 'The two-minute check means returning to a table approximately two minutes after food is served.',
  jsonb_build_object('question', 'The two-minute check means returning to a table approximately two minutes after food is served.', 'answer', 'true', 'explanation', 'Two minutes is enough time for the guest to take a first bite and discover any issue, but early enough for the kitchen to fix it.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

(36, 201, 'quiz', 'Checking back on a table after food is delivered is only necessary for complicated orders.',
  jsonb_build_object('question', 'Checking back on a table after food is delivered is only necessary for complicated orders.', 'answer', 'false', 'explanation', 'Every single table requires a two-minute check, regardless of how simple the order was. Any dish can have a problem.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

(36, 202, 'quiz', 'The two-minute check must happen after the guest has taken their first bite.',
  jsonb_build_object('question', 'The two-minute check must happen after the guest has taken their first bite.', 'answer', 'true', 'explanation', 'Checking before they have eaten means they cannot yet report a problem. Timing the check to the first bite is everything.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

(36, 203, 'quiz', 'Asking "Is everything okay?" is the gold-standard two-minute check question.',
  jsonb_build_object('question', 'Asking "Is everything okay?" is the gold-standard two-minute check question.', 'answer', 'false', 'explanation', '"Okay" invites a one-word dismissal. Better: "How is the steak cooked for you?" — a specific question gets a specific, useful answer.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'communication']),

(36, 204, 'quiz', 'A cold steak discovered at the two-minute check can still be refired and saved.',
  jsonb_build_object('question', 'A cold steak discovered at the two-minute check can still be refired and saved.', 'answer', 'true', 'explanation', 'A cold steak caught at two minutes can be corrected before the guest becomes visibly frustrated or loses their appetite.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'recovery']),

(36, 205, 'quiz', 'A two-minute check interrupts the guest''s dining experience and should be kept to a minimum.',
  jsonb_build_object('question', 'A two-minute check interrupts the guest''s dining experience and should be kept to a minimum.', 'answer', 'false', 'explanation', 'A brief, professional check enhances the experience by showing attentiveness. It is neglect, not attention, that ruins a meal.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

(36, 206, 'quiz', 'Missing the two-minute window means problems are discovered only when it is too late to fix them.',
  jsonb_build_object('question', 'Missing the two-minute window means problems are discovered only when it is too late to fix them.', 'answer', 'true', 'explanation', 'A guest who has eaten half a cold meal before complaining cannot have their experience fully recovered. The window is everything.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

(36, 207, 'quiz', 'The two-minute check is only required for new or unfamiliar menu items.',
  jsonb_build_object('question', 'The two-minute check is only required for new or unfamiliar menu items.', 'answer', 'false', 'explanation', 'Every dish from every table requires this check. Kitchen errors can and do happen to the most familiar items on the menu.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

-- ===== MODULE 37: The Pivot — Dealing with "No" and "Out of Stock" =====
(37, 200, 'quiz', 'When an item is unavailable, you must always immediately suggest a specific alternative.',
  jsonb_build_object('question', 'When an item is unavailable, you must always immediately suggest a specific alternative.', 'answer', 'true', 'explanation', 'A direct suggestion ("We''re out of that, but our X is very similar") prevents the guest from feeling stranded without a path forward.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'sales']),

(37, 201, 'quiz', 'Saying "Sorry, we are out of that" and moving on is professional handling of a stock-out.',
  jsonb_build_object('question', 'Saying "Sorry, we are out of that" and moving on is professional handling of a stock-out.', 'answer', 'false', 'explanation', 'Ending the conversation at "we''re out" is a dead-end. The pivot — the alternative suggestion — is the part that saves the sale.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'sales']),

(37, 202, 'quiz', 'The pivot technique means acknowledging unavailability and immediately offering a comparable item.',
  jsonb_build_object('question', 'The pivot technique means acknowledging unavailability and immediately offering a comparable item.', 'answer', 'true', 'explanation', 'Acknowledge, redirect, and present the alternative as a genuine recommendation — this three-step pivot saves almost every stock-out situation.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'sales']),

(37, 203, 'quiz', 'Guests always prefer the cheapest alternative when their first choice is unavailable.',
  jsonb_build_object('question', 'Guests always prefer the cheapest alternative when their first choice is unavailable.', 'answer', 'false', 'explanation', 'Guests want the best equivalent experience, not the cheapest consolation. Offer the most genuinely similar product.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'sales']),

(37, 204, 'quiz', 'Deep menu knowledge is what allows you to suggest genuine alternatives with confidence.',
  jsonb_build_object('question', 'Deep menu knowledge is what allows you to suggest genuine alternatives with confidence.', 'answer', 'true', 'explanation', 'You cannot pivot to an alternative if you do not know what is comparable on the menu. Product knowledge is the foundation.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'knowledge']),

(37, 205, 'quiz', 'Apologizing excessively when an item is unavailable is the mark of good service.',
  jsonb_build_object('question', 'Apologizing excessively when an item is unavailable is the mark of good service.', 'answer', 'false', 'explanation', 'A single brief apology is professional. Over-apologizing draws more attention to the failure and makes guests feel worse, not better.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'communication']),

(37, 206, 'quiz', 'Saying "Our house red is very similar and actually pairs better with that dish" is an ideal pivot.',
  jsonb_build_object('question', 'Saying "Our house red is very similar and actually pairs better with that dish" is an ideal pivot.', 'answer', 'true', 'explanation', 'This reframes the alternative as a positive recommendation rather than a consolation prize, keeping the guest''s enthusiasm high.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'sales']),

(37, 207, 'quiz', 'Only bartenders need to know about out-of-stock items — the floor staff can improvise.',
  jsonb_build_object('question', 'Only bartenders need to know about out-of-stock items — the floor staff can improvise.', 'answer', 'false', 'explanation', 'All floor staff must be briefed on 86 items at the start of every service to avoid promising unavailable items at the table.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'communication']),

-- ===== MODULE 38: The "Dead Soldier" — Clearing & Resetting the Battlefield =====
(38, 200, 'quiz', 'A "dead soldier" is an empty bottle or glass taking up space on a guest''s table.',
  jsonb_build_object('question', 'A "dead soldier" is an empty bottle or glass taking up space on a guest''s table.', 'answer', 'true', 'explanation', 'This is the industry term for any finished vessel. Spotting and removing dead soldiers is a fundamental floor skill.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

(38, 201, 'quiz', 'You should only clear a table once the guest has completely finished their meal.',
  jsonb_build_object('question', 'You should only clear a table once the guest has completely finished their meal.', 'answer', 'false', 'explanation', 'Pre-bussing — removing finished glasses and side plates as they are done — is standard professional table management.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

(38, 202, 'quiz', 'Never walking back to the kitchen empty-handed is a core floor efficiency rule.',
  jsonb_build_object('question', 'Never walking back to the kitchen empty-handed is a core floor efficiency rule.', 'answer', 'true', 'explanation', 'Every trip to the back should clear dead soldiers; every trip to the floor should carry something fresh. No empty hands.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

(38, 203, 'quiz', 'Removing a dead soldier from a table without first asking the guest is rude.',
  jsonb_build_object('question', 'Removing a dead soldier from a table without first asking the guest is rude.', 'answer', 'false', 'explanation', 'Clearing finished glasses is part of the standard service contract. It does not require the guest''s permission.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

(38, 204, 'quiz', 'A cleared, reset table creates a psychologically cleaner environment for the guest.',
  jsonb_build_object('question', 'A cleared, reset table creates a psychologically cleaner environment for the guest.', 'answer', 'true', 'explanation', 'Accumulated empty glasses and debris subconsciously signals neglect. A clean table makes guests feel valued and comfortable.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'quality']),

(38, 205, 'quiz', 'Pre-bussing tables signals to guests that they are being asked to leave.',
  jsonb_build_object('question', 'Pre-bussing tables signals to guests that they are being asked to leave.', 'answer', 'false', 'explanation', 'Pre-bussing improves comfort and cleanliness. Only dropping the bill unsolicited or hovering pressures a guest to leave.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

(38, 206, 'quiz', 'Carrying a full arm of cleared glassware to the glass wash in one trip is expert pre-bussing.',
  jsonb_build_object('question', 'Carrying a full arm of cleared glassware to the glass wash in one trip is expert pre-bussing.', 'answer', 'true', 'explanation', 'Minimizing trips by loading up on cleared items in one pass is exactly what efficient, professional pre-bussing looks like.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

(38, 207, 'quiz', 'Dead soldiers should only be removed when the entire table has finished drinking.',
  jsonb_build_object('question', 'Dead soldiers should only be removed when the entire table has finished drinking.', 'answer', 'false', 'explanation', 'Each individual dead soldier should be removed as soon as it is available to keep the table clean throughout the experience.', 'option_type', 'truefalse'),
  2, ARRAY['service', 'efficiency']),

-- ===== MODULE 39: Bar-Back Synergy — The Lifeblood of the Front =====
(39, 200, 'quiz', 'The bar back''s primary role is to ensure the bartender never runs out of essential supplies.',
  jsonb_build_object('question', 'The bar back''s primary role is to ensure the bartender never runs out of essential supplies.', 'answer', 'true', 'explanation', 'The bar back is the invisible engine of the bar. The bartender''s entire ability to serve depends on the bar back''s support.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'teamwork']),

(39, 201, 'quiz', 'Bar backs must stay behind the bar at all times and never cross the floor.',
  jsonb_build_object('question', 'Bar backs must stay behind the bar at all times and never cross the floor.', 'answer', 'false', 'explanation', 'Delivering ice, collecting dead soldiers, and restocking adjacent areas often requires moving across the floor during service.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'teamwork']),

(39, 202, 'quiz', 'Calling out to a bartender before moving ice behind them during service prevents a collision.',
  jsonb_build_object('question', 'Calling out to a bartender before moving ice behind them during service prevents a collision.', 'answer', 'true', 'explanation', 'Moving silently behind a working bartender during a rush risks a serious collision with hot or heavy equipment.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'safety']),

(39, 203, 'quiz', 'The bar back is responsible for taking guest drink orders during a rush.',
  jsonb_build_object('question', 'The bar back is responsible for taking guest drink orders during a rush.', 'answer', 'false', 'explanation', 'Taking orders is the bartender''s role. The bar back handles supply and support to free the bartender to focus entirely on guests.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'responsibilities']),

(39, 204, 'quiz', 'Filling ice bins from the back of the bar without disrupting the bartender is a core bar-back skill.',
  jsonb_build_object('question', 'Filling ice bins from the back of the bar without disrupting the bartender is a core bar-back skill.', 'answer', 'true', 'explanation', 'Moving ice from the back rather than reaching over the bartender mid-service is a fundamental skill of bar-back invisibility.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'technique']),

(39, 205, 'quiz', 'A bar back who finishes their tasks early should stand by and wait to be asked for help.',
  jsonb_build_object('question', 'A bar back who finishes their tasks early should stand by and wait to be asked for help.', 'answer', 'false', 'explanation', 'A proactive bar back anticipates the next need — checking ice levels, replacing glassware, pre-staging bottles — without being asked.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'proactivity']),

(39, 206, 'quiz', 'The speed rail must be restocked by the bar back the moment it shows any empty slots.',
  jsonb_build_object('question', 'The speed rail must be restocked by the bar back the moment it shows any empty slots.', 'answer', 'true', 'explanation', 'An empty speed rail slot forces the bartender to pause service to locate a spirit. The bar back''s job is to prevent that moment.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'efficiency']),

(39, 207, 'quiz', 'Bar back and bartender communication should only happen during quiet moments in service.',
  jsonb_build_object('question', 'Bar back and bartender communication should only happen during quiet moments in service.', 'answer', 'false', 'explanation', 'Constant brief communication throughout the rush — a nod, a tap, a one-word call — is what keeps service flowing without interruption.', 'option_type', 'truefalse'),
  2, ARRAY['barback', 'communication']),

-- ===== MODULE 40: The Natural Upsell — Suggesting, Not Pushing =====
(40, 200, 'quiz', 'The "Power of Three" means suggesting a specific premium brand rather than asking a generic question.',
  jsonb_build_object('question', 'The "Power of Three" means suggesting a specific premium brand rather than asking a generic question.', 'answer', 'true', 'explanation', '"Would you like that with Hendrick''s?" is more effective than "Do you want premium?" because it paints a specific, inviting picture.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(40, 201, 'quiz', 'Natural upselling is about extracting maximum spend from every guest regardless of their experience.',
  jsonb_build_object('question', 'Natural upselling is about extracting maximum spend from every guest regardless of their experience.', 'answer', 'false', 'explanation', 'Natural upselling enhances the guest''s experience. The moment it feels pushy, it destroys trust, tips, and any chance of return visits.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(40, 202, 'quiz', 'Recommending a specific complementary side dish is more effective than asking "Do you want any sides?"',
  jsonb_build_object('question', 'Recommending a specific complementary side dish is more effective than asking "Do you want any sides?"', 'answer', 'true', 'explanation', '"The sweet potato fries are amazing with the chicken" removes decision fatigue and paints a picture. "Any sides?" invites a flat no.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(40, 203, 'quiz', 'Asking "Would you like a large?" is the gold standard for upselling a beer.',
  jsonb_build_object('question', 'Asking "Would you like a large?" is the gold standard for upselling a beer.', 'answer', 'false', 'explanation', '"A large" is generic and transactional. "Would you like a pint of that?" names the product and sounds like a genuine suggestion.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'beer']),

(40, 204, 'quiz', 'Knowing wine pairings transforms every upsell from a sales pitch into an expert recommendation.',
  jsonb_build_object('question', 'Knowing wine pairings transforms every upsell from a sales pitch into an expert recommendation.', 'answer', 'true', 'explanation', 'Product knowledge is the foundation. A confident pairing suggestion makes the guest feel cared for rather than sold to.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'wine']),

(40, 205, 'quiz', 'The best time to suggest a dessert is after the guest has already asked for the bill.',
  jsonb_build_object('question', 'The best time to suggest a dessert is after the guest has already asked for the bill.', 'answer', 'false', 'explanation', 'Offering the dessert menu as plates are cleared captures the impulse decision before the guest mentally checks out and says they are too full.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(40, 206, 'quiz', 'Genuine enthusiasm when suggesting a premium spirit makes the upsell feel like a recommendation, not a pitch.',
  jsonb_build_object('question', 'Genuine enthusiasm when suggesting a premium spirit makes the upsell feel like a recommendation, not a pitch.', 'answer', 'true', 'explanation', 'Tone and intent determine whether a suggestion feels like care or a sales grab. Real enthusiasm is the difference.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']),

(40, 207, 'quiz', 'Upselling techniques only work on guests who are already planning to spend a lot.',
  jsonb_build_object('question', 'Upselling techniques only work on guests who are already planning to spend a lot.', 'answer', 'false', 'explanation', 'Casual pub guests are often the most receptive to a simple, confident suggestion from a staff member they trust. Every cover is an opportunity.', 'option_type', 'truefalse'),
  2, ARRAY['sales', 'upsell']);
