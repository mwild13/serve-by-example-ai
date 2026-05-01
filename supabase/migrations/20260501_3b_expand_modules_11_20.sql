-- ============================================================
-- Migration: Expand L2/L3 for Modules 11–20
-- Date: 2026-05-01
--
-- Brings every module to the minimum thresholds required
-- by StageLearning.tsx (MIN_L2 = 6, MIN_L3 = 7).
--
-- Module 11: +3 L2 (→6) +3 L3 (→7)   indices 13-18
-- Module 12: +3 L2 (→6) +4 L3 (→7)   indices 12-18
-- Modules 13-20: +6 L2 +7 L3 each     L2 at 20-25, L3 at 30-36
-- ============================================================

-- ===== MODULE 11: HANDLING GUEST COMPLAINTS — top-up =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(11, 13, 'descriptor_l2', 'A guest complains about noise at a neighbouring table. Which TWO actions are most appropriate?',
  jsonb_build_object('prompt', 'A guest complains about noise at a neighbouring table. Which TWO actions are most appropriate?',
    'descriptors', ARRAY['Acknowledge their discomfort sincerely and offer to move them to a quieter area', 'Speak discreetly with the noisy table if their behaviour is genuinely disruptive', 'Tell the complaining guest that nothing can be done about other customers', 'Ignore the complaint since it is not related to your service', 'Ask the noisy table to leave immediately without warning'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Offering a relocation addresses the complaining guest''s immediate need. If the other table is genuinely disruptive, a discreet word is reasonable — but never blame or dismiss the guest raising the concern.'),
  2, ARRAY['complaints', 'noise', 'guest-experience']),

(11, 14, 'descriptor_l2', 'A guest leaves without saying anything but posts a negative review online the same night. Which TWO responses from management are most appropriate?',
  jsonb_build_object('prompt', 'A guest leaves without saying anything but posts a negative review online the same night. Which TWO responses from management are most appropriate?',
    'descriptors', ARRAY['Respond to the review promptly, acknowledge their experience, and invite them to return', 'Investigate internally to understand what may have gone wrong during their visit', 'Ignore it — online reviews do not matter for the business', 'Post a defensive reply explaining why the guest was wrong', 'Delete the review if the platform allows it'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A prompt, genuine public response shows you take feedback seriously and can win back trust with other readers. Internal investigation prevents the same issue recurring — both actions are essential.'),
  2, ARRAY['complaints', 'online-reviews', 'recovery']),

(11, 15, 'descriptor_l2', 'An entire table complains simultaneously about slow service. Which TWO responses are most effective?',
  jsonb_build_object('prompt', 'An entire table complains simultaneously about slow service. Which TWO responses are most effective?',
    'descriptors', ARRAY['Apologise sincerely, give an honest update on timing, and offer a small gesture while they wait', 'Alert your supervisor or kitchen immediately so the issue can be addressed at its source', 'Blame the kitchen in front of the table to deflect responsibility', 'Tell the guests other tables are also waiting and walk away', 'Offer them a refund before understanding the extent of the delay'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A sincere apology with an honest update manages expectations on the floor. Escalating to the kitchen tackles the root cause — the two responses work together rather than separately.'),
  2, ARRAY['complaints', 'service-delay', 'table-management']),

-- Module 11 L3 top-up

(11, 16, 'descriptor_l3', 'A complaint is made about something that was entirely beyond your control (e.g. a power outage affected the kitchen). Which THREE responses are most professional?',
  jsonb_build_object('prompt', 'A complaint is made about something that was entirely beyond your control (e.g. a power outage affected the kitchen). Which THREE responses are most professional?',
    'descriptors', ARRAY['Acknowledge the guest''s frustration without making excuses', 'Explain the situation honestly and briefly without over-justifying', 'Offer a genuine gesture — comp, discount, or priority next visit', 'Insist the situation was not your fault to set the record straight', 'Promise it will never happen again even if you cannot guarantee that'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Even when the cause is external, professional service means acknowledging the impact on the guest, being honest without making excuses, and offering a tangible gesture. Defensiveness or false promises damage trust further.'),
  3, ARRAY['complaints', 'external-factors', 'service-recovery']),

(11, 17, 'descriptor_l3', 'After resolving a complaint, which THREE follow-up actions strengthen the guest relationship?',
  jsonb_build_object('prompt', 'After resolving a complaint, which THREE follow-up actions strengthen the guest relationship?',
    'descriptors', ARRAY['Check back with the guest before they leave to confirm they are satisfied', 'Note the complaint and resolution in your venue''s system so it is on record', 'Inform your team of what happened so they are aware and can follow up if the guest returns', 'Avoid mentioning it again to prevent awkwardness', 'Offer the same complimentary item they received next time as a standard practice'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Checking in before they leave confirms the issue is truly resolved. Recording it creates institutional memory. Briefing your team ensures consistent follow-through if the guest returns — three actions that turn a complaint into loyalty.'),
  3, ARRAY['complaints', 'follow-up', 'loyalty']),

(11, 18, 'descriptor_l3', 'A guest claims the complaint they raised last visit was never followed up on. Which THREE actions address this professionally?',
  jsonb_build_object('prompt', 'A guest claims the complaint they raised last visit was never followed up on. Which THREE actions address this professionally?',
    'descriptors', ARRAY['Apologise sincerely for the follow-up not happening — regardless of who was at fault', 'Listen to their account of the original complaint without interrupting', 'Take ownership of resolving it now, in this visit', 'Tell them they should have called to follow up themselves', 'Explain that the staff member responsible no longer works there'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'A repeat complaint is a failure of your system, not the guest. Apologise unconditionally, listen fully, and resolve it now — shifting blame to the guest or absent staff destroys the relationship entirely.'),
  3, ARRAY['complaints', 'follow-up', 'accountability'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 12: UPSELLING AND SUGGESTIVE SELLING — top-up =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(12, 12, 'descriptor_l2', 'A guest asks for "your cheapest beer". Which TWO responses offer a natural upsell without pressure?',
  jsonb_build_object('prompt', 'A guest asks for "your cheapest beer". Which TWO responses offer a natural upsell without pressure?',
    'descriptors', ARRAY['Confirm the cheapest option, then briefly mention one mid-tier with a genuine description ("our most popular is only $2 more — a lot of regulars prefer it")','Ask what style they enjoy — that opens the door to a craft option at a similar price point', 'Tell them the cheap option is not worth ordering', 'Ignore their stated preference and push the premium option', 'Respond with only the cheapest option and say nothing else'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Honouring the guest''s starting point builds trust. A brief value-add mention or a style question creates an upsell opportunity that feels like genuine service — not sales pressure.'),
  3, ARRAY['upselling', 'beer', 'natural-sell']),

(12, 13, 'descriptor_l2', 'A group arrives and mentions they are celebrating a birthday. Which TWO upsell moments are most natural?',
  jsonb_build_object('prompt', 'A group arrives and mentions they are celebrating a birthday. Which TWO upsell moments are most natural?',
    'descriptors', ARRAY['Suggest a sparkling wine or cocktail round to kick off the celebration', 'Mention a bottle option for the table that offers better value per glass than individual orders', 'Push the most expensive item on the menu immediately', 'Ignore the occasion — it is not relevant to service', 'Wait until they have already ordered everything before mentioning options'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Occasions are natural upsell triggers. A celebratory round suggestion and a bottle value proposition both align with what the group wants to do anyway — spend on a good night. Timing and framing make it feel generous, not pushy.'),
  3, ARRAY['upselling', 'occasions', 'bottle-service']),

(12, 14, 'descriptor_l2', 'A guest orders a house spirit. Which TWO approaches create a premium upsell opportunity?',
  jsonb_build_object('prompt', 'A guest orders a house spirit. Which TWO approaches create a premium upsell opportunity?',
    'descriptors', ARRAY['Ask if they have a preference for a particular style or brand — their answer often opens the door naturally', 'Mention a premium alternative briefly: "We also have [X] which is really popular for this style — want to try it?"', 'Tell them the house spirit is low quality to push the upgrade', 'Serve the house spirit without saying anything', 'List every premium option available at length before they answer'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A preference question and a single brief recommendation are the two most natural premium upsell techniques — both invite the guest into a conversation rather than delivering a sales pitch.'),
  3, ARRAY['upselling', 'spirits', 'premium']),

-- Module 12 L3 top-up

(12, 15, 'descriptor_l3', 'A guest declines your upsell suggestion. Which THREE responses maintain the relationship?',
  jsonb_build_object('prompt', 'A guest declines your upsell suggestion. Which THREE responses maintain the relationship?',
    'descriptors', ARRAY['Accept their decision immediately and without visible disappointment', 'Deliver their original order with the same attentiveness as if they had accepted', 'Make a note mentally so you do not push the same upsell again this visit', 'Repeat the suggestion in case they did not hear it properly', 'Show less enthusiasm for the rest of the table''s service'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Accepting a "no" gracefully, maintaining full service quality, and not repeating the push are the three fundamentals of upselling without damaging the guest relationship. A guest who feels respected comes back — and sometimes says yes next time.'),
  3, ARRAY['upselling', 'rejection', 'relationship']),

(12, 16, 'descriptor_l3', 'You want to upsell a food pairing to complement drinks already ordered. Which THREE techniques feel most natural?',
  jsonb_build_object('prompt', 'You want to upsell a food pairing to complement drinks already ordered. Which THREE techniques feel most natural?',
    'descriptors', ARRAY['Reference the drink they ordered: "That gin pairs really well with our charcuterie — a lot of guests order it together"', 'Mention that a small plate is popular during the early evening window they''re in', 'Ask if they''re planning to eat — then tailor your suggestion to their answer', 'List the full menu without a specific recommendation', 'Tell them they should eat something with alcohol for health reasons'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Pairing references, timing cues, and a simple "are you eating?" question all create organic openings for food upsells — specific, genuine, and connected to what the guest already has in front of them.'),
  3, ARRAY['upselling', 'food-pairing', 'suggestive-selling']),

(12, 17, 'descriptor_l3', 'You identify the decision-maker at a table of four. Which THREE techniques guide your upsell strategy?',
  jsonb_build_object('prompt', 'You identify the decision-maker at a table of four. Which THREE techniques guide your upsell strategy?',
    'descriptors', ARRAY['Direct your recommendation to the table as a whole but make brief eye contact with the decision-maker', 'Phrase the recommendation as a question ("Would you like to start with a round?") so the group can respond naturally', 'Give the decision-maker space to consult their group rather than expecting an immediate answer', 'Only speak to the person who spoke first', 'Repeat the upsell to each person individually until someone says yes'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Inclusive eye contact, a question format, and giving space for group consultation are the three techniques that respect social dynamics at a table — the decision-maker feels acknowledged, not singled out.'),
  3, ARRAY['upselling', 'table-dynamics', 'decision-maker']),

(12, 18, 'descriptor_l3', 'During a quiet mid-week service, which THREE upselling approaches are most effective?',
  jsonb_build_object('prompt', 'During a quiet mid-week service, which THREE upselling approaches are most effective?',
    'descriptors', ARRAY['Use the relaxed pace to give personalised recommendations based on conversation with the guest', 'Suggest the chef''s pick or a lesser-known menu item that deserves more attention', 'Mention any mid-week specials or limited-availability items honestly', 'Apply the same pressure tactics as a Friday night rush', 'Avoid upselling because mid-week guests spend less anyway'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'A quieter service gives you time for genuine conversation, highlight recommendations, and honest mentions of specials — three approaches that feel like expertise, not a sales script. Mid-week guests who feel looked after become regulars.'),
  3, ARRAY['upselling', 'quiet-service', 'personalised'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 13: VIP AND TABLE MANAGEMENT =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(13, 20, 'descriptor_l2', 'A VIP guest makes a special dietary request not noted in their reservation. Which TWO actions are most appropriate?',
  jsonb_build_object('prompt', 'A VIP guest makes a special dietary request not noted in their reservation. Which TWO actions are most appropriate?',
    'descriptors', ARRAY['Confirm the request immediately and relay it to the kitchen before anything is prepared', 'Update the guest''s profile or notes so the request is recorded for future visits', 'Tell the guest they should have noted it when booking', 'Promise a dish can be modified without first checking with the kitchen', 'Serve a standard dish and hope they do not notice'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Immediate kitchen communication prevents a dietary error reaching the table. Updating the guest''s profile turns a reactive moment into a proactive one for every future visit.'),
  3, ARRAY['vip', 'dietary', 'table-management']),

(13, 21, 'descriptor_l2', 'A VIP guest seems dissatisfied but has not complained. Which TWO observation cues suggest you should check in?',
  jsonb_build_object('prompt', 'A VIP guest seems dissatisfied but has not complained. Which TWO observation cues suggest you should check in?',
    'descriptors', ARRAY['They have barely touched their food or drinks after a reasonable amount of time', 'Their body language is closed — minimal conversation, avoiding eye contact with staff', 'They ordered a second drink, which means they are enjoying themselves', 'They are speaking quietly among themselves, which is normal for a VIP', 'They have not called you over, so everything must be fine'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Untouched food and withdrawn body language are the two clearest non-verbal signals that something is wrong. VIPs often will not complain openly — proactive service means reading the room before they have to say anything.'),
  3, ARRAY['vip', 'observation', 'proactive-service']),

(13, 22, 'descriptor_l2', 'Your regular VIP''s preferred table is occupied when they arrive. Which TWO steps are most professional?',
  jsonb_build_object('prompt', 'Your regular VIP''s preferred table is occupied when they arrive. Which TWO steps are most professional?',
    'descriptors', ARRAY['Acknowledge the situation immediately, apologise, and offer the next-best available option', 'Offer a complimentary drink at the bar while a suitable table is prepared', 'Tell them someone else is sitting there and there is nothing you can do', 'Ask the occupying guests to move', 'Seat them at a random table without acknowledging the difference'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Immediate acknowledgement with a genuine alternative shows the VIP you are aware of their preference and value their comfort. A complimentary drink at the bar turns a wait into a hospitality moment.'),
  3, ARRAY['vip', 'table-management', 'service-recovery']),

(13, 23, 'descriptor_l2', 'A VIP table''s service is running behind due to kitchen delays. Which TWO actions are priorities?',
  jsonb_build_object('prompt', 'A VIP table''s service is running behind due to kitchen delays. Which TWO actions are priorities?',
    'descriptors', ARRAY['Visit the table proactively, give an honest time update, and offer to refresh drinks', 'Alert your manager immediately so the kitchen can be prioritised', 'Wait and hope the food arrives before they notice', 'Tell the table that other tables are also waiting', 'Offer a full refund before the meal has even arrived'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Proactive communication with an honest update preserves trust. Escalating to the manager and kitchen ensures the operational issue is addressed at the source — both actions together protect the VIP experience.'),
  3, ARRAY['vip', 'service-delay', 'kitchen-comms']),

(13, 24, 'descriptor_l2', 'A VIP is celebrating a milestone. Which TWO touches elevate the experience without being over-the-top?',
  jsonb_build_object('prompt', 'A VIP is celebrating a milestone. Which TWO touches elevate the experience without being over-the-top?',
    'descriptors', ARRAY['Arrange a small complimentary item — a glass of bubbles or a dessert with a personalised note', 'Brief your whole team so every touchpoint during the visit acknowledges the occasion appropriately', 'Make a large public announcement over the venue PA', 'Ignore the occasion to avoid making assumptions', 'Deliver a cake without checking if they actually want one'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A small, well-timed gesture and a briefed team both signal that you pay attention and value the guest — personalised without being performative. VIPs appreciate that the whole team knows, not just one staff member.'),
  3, ARRAY['vip', 'occasions', 'personalisation']),

(13, 25, 'descriptor_l2', 'A VIP requests something that conflicts with venue policy. Which TWO responses are most professional?',
  jsonb_build_object('prompt', 'A VIP requests something that conflicts with venue policy. Which TWO responses are most professional?',
    'descriptors', ARRAY['Acknowledge the request, explain the policy calmly, and offer an alternative that meets their underlying need', 'Escalate to the manager to determine whether an exception is appropriate in this case', 'Grant the request immediately to avoid any conflict', 'Bluntly refuse with "That''s not our policy" and walk away', 'Pretend you did not hear the request'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Explaining the policy while offering an alternative respects both the guest and your venue''s standards. Escalating to a manager for exceptions ensures the decision is made at the right level — not arbitrarily in either direction.'),
  3, ARRAY['vip', 'policy', 'escalation']),

-- Module 13 L3

(13, 30, 'descriptor_l3', 'You are managing a VIP section during a busy Friday service. Which THREE priorities guide your focus?',
  jsonb_build_object('prompt', 'You are managing a VIP section during a busy Friday service. Which THREE priorities guide your focus?',
    'descriptors', ARRAY['Maintain proactive check-ins — never let a VIP table wait to flag a need', 'Keep your kitchen and bar aware of VIP table status throughout service', 'Anticipate transitions — refills, course changes, and drink rounds before they are requested', 'Focus entirely on the highest-spending table and leave others unattended', 'Avoid communicating with the kitchen to prevent slowing down orders'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Proactive check-ins, continuous kitchen communication, and anticipating transitions are the three operational habits that define VIP section management — reactive service is not enough at this level.'),
  4, ARRAY['vip', 'section-management', 'anticipation']),

(13, 31, 'descriptor_l3', 'A guest at an adjacent non-VIP table is causing discomfort for your VIP table. Which THREE steps do you take?',
  jsonb_build_object('prompt', 'A guest at an adjacent non-VIP table is causing discomfort for your VIP table. Which THREE steps do you take?',
    'descriptors', ARRAY['Acknowledge the VIP''s discomfort privately and reassure them you are handling it', 'Address the disruptive guest or table discreetly and professionally', 'Offer the VIP a relocation if the disruption cannot be resolved quickly', 'Tell the VIP to ignore it — there is nothing you can do about other guests', 'Involve security immediately without attempting a direct resolution first'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Acknowledging the VIP''s discomfort, addressing the disruption discreetly, and offering relocation as a backup — these three steps show the VIP that their comfort is your priority without escalating unnecessarily.'),
  4, ARRAY['vip', 'conflict', 'relocation']),

(13, 32, 'descriptor_l3', 'A VIP shares a preference mid-visit that you want to remember for next time. Which THREE actions ensure it is captured?',
  jsonb_build_object('prompt', 'A VIP shares a preference mid-visit that you want to remember for next time. Which THREE actions ensure it is captured?',
    'descriptors', ARRAY['Note it discreetly as soon as possible — in your order pad or phone, not from memory at end of service', 'Confirm the detail with the guest if you are unsure ("Just to make sure I have this right — you prefer...")','Add it to their guest profile in your CRM or reservation system before you finish your shift', 'Trust your memory until end of shift', 'Only note preferences that relate to food and drink'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Immediate discreet noting, confirmation with the guest, and same-shift profile update are the three actions that ensure a preference is actually captured — memory and end-of-night logging both lead to data loss.'),
  4, ARRAY['vip', 'guest-profiles', 'personalisation']),

(13, 33, 'descriptor_l3', 'You need to move a VIP table mid-service due to a venue issue. Which THREE steps make the transition smooth?',
  jsonb_build_object('prompt', 'You need to move a VIP table mid-service due to a venue issue. Which THREE steps make the transition smooth?',
    'descriptors', ARRAY['Explain the reason honestly and briefly before asking them to move', 'Ensure the new table is fully set and ready before the guests rise from their seats', 'Offer a sincere apology and a small gesture — refreshed drinks, a complimentary item', 'Tell them it is a table upgrade and say nothing about the real reason', 'Ask them to move during a course rather than between courses to minimise disruption'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Honest communication, a prepared destination, and a genuine gesture together make the relocation feel managed rather than chaotic. Moving between courses (not during) and never misleading VIPs about the reason are non-negotiable.'),
  4, ARRAY['vip', 'relocation', 'service-recovery']),

(13, 34, 'descriptor_l3', 'A VIP guest''s companion is consuming alcohol rapidly and showing early signs of intoxication. Which THREE responses balance RSA obligations with VIP hospitality?',
  jsonb_build_object('prompt', 'A VIP guest''s companion is consuming alcohol rapidly and showing early signs of intoxication. Which THREE responses balance RSA obligations with VIP hospitality?',
    'descriptors', ARRAY['Slow the pace of service discreetly — space out rounds without making it obvious', 'Offer water and food proactively and naturally as part of the service experience', 'Alert your supervisor so there is shared awareness in case refusal becomes necessary', 'Continue serving at the same pace to avoid upsetting the VIP', 'Immediately refuse service and announce it to the table'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Pacing service discreetly, offering food and water, and briefing your supervisor are the three RSA-aligned responses that respect the VIP relationship while fulfilling your duty of care — abrupt refusal without these steps is a last resort.'),
  4, ARRAY['vip', 'rsa', 'duty-of-care']),

(13, 35, 'descriptor_l3', 'After a VIP visit, which THREE follow-up actions build long-term loyalty?',
  jsonb_build_object('prompt', 'After a VIP visit, which THREE follow-up actions build long-term loyalty?',
    'descriptors', ARRAY['Update their guest profile with any new preferences, requests, or observations noted during the visit', 'Send a personalised follow-up — a thank-you message or a relevant offer for their next occasion', 'Brief your team on who visited so there is shared recognition next time they arrive', 'Do nothing — VIPs expect privacy after a visit', 'Send a generic promotional email to their address'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Profile updates, personalised follow-up, and team briefing are the three actions that make the next visit better than this one — generic outreach and silence both miss the point of VIP relationship management.'),
  4, ARRAY['vip', 'follow-up', 'loyalty']),

(13, 36, 'descriptor_l3', 'Managing multiple VIP tables simultaneously during peak service. Which THREE techniques maintain consistent standards?',
  jsonb_build_object('prompt', 'Managing multiple VIP tables simultaneously during peak service. Which THREE techniques maintain consistent standards?',
    'descriptors', ARRAY['Use a mental or written rotation — check each table at defined intervals rather than responding only when flagged', 'Communicate with your support staff so they can assist with basic needs while you handle higher-touch moments', 'Prioritise by needs state, not by spend — a table about to finish a course outranks one that was just served', 'Focus all attention on the highest-value table and let others wait', 'Avoid asking for help so guests see you as the sole point of contact'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'A defined check rotation, delegating to support staff, and prioritising by needs state (not spend) are the three operational strategies that keep multiple VIP tables at a consistent standard — solo heroics and fixed hierarchies both fail under pressure.'),
  4, ARRAY['vip', 'multi-table', 'section-management'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 14: PHONE ETIQUETTE AND RESERVATIONS =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(14, 20, 'descriptor_l2', 'A caller is rude and impatient on the phone. Which TWO responses are most professional?',
  jsonb_build_object('prompt', 'A caller is rude and impatient on the phone. Which TWO responses are most professional?',
    'descriptors', ARRAY['Maintain a calm, professional tone regardless of how the caller is speaking', 'Acknowledge their frustration briefly and redirect the conversation to resolving their need', 'Match their tone to show you will not be pushed around', 'Put them on hold immediately until they calm down', 'End the call and note that they were abusive'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A steady tone and a brief acknowledgement of their frustration are the two responses that de-escalate phone conflict — matching their energy or immediately ending the call both remove any chance of a positive outcome.'),
  2, ARRAY['phone', 'difficult-callers', 'de-escalation']),

(14, 21, 'descriptor_l2', 'A caller asks about dietary options for their booking and you are unsure of the details. Which TWO responses are safe?',
  jsonb_build_object('prompt', 'A caller asks about dietary options for their booking and you are unsure of the details. Which TWO responses are safe?',
    'descriptors', ARRAY['Tell them honestly that you want to confirm the details with the kitchen and will call back within a set timeframe', 'Note the dietary requirement against their reservation so the kitchen is aware regardless', 'Guess at the answer to avoid admitting you do not know', 'Tell them all dietary needs are catered for without checking', 'Suggest they raise it when they arrive on the night'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Promising a callback with confirmed information is honest and safe. Noting the requirement immediately ensures it is on record even before the callback — guessing or deferring to arrival creates avoidable allergy risk.'),
  2, ARRAY['phone', 'dietary', 'reservations']),

(14, 22, 'descriptor_l2', 'A caller requests a booking for a large group with multiple special requests. Which TWO steps ensure accuracy?',
  jsonb_build_object('prompt', 'A caller requests a booking for a large group with multiple special requests. Which TWO steps ensure accuracy?',
    'descriptors', ARRAY['Repeat all details back to the caller before ending the call to confirm accuracy', 'Enter every request into the reservation system immediately rather than relying on notes', 'Take the requests verbally and add them later when it is quieter', 'Ask the caller to email the requests instead of taking them over the phone', 'Record only the most important requests to save time'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Reading back details catches errors before the caller hangs up. Entering everything into the system immediately ensures nothing is lost in the handover — large group bookings go wrong when details are deferred.'),
  2, ARRAY['phone', 'large-groups', 'reservations']),

(14, 23, 'descriptor_l2', 'Your reservation system is down during a busy phone period. Which TWO actions handle callers professionally?',
  jsonb_build_object('prompt', 'Your reservation system is down during a busy phone period. Which TWO actions handle callers professionally?',
    'descriptors', ARRAY['Take bookings manually on paper with full details and enter them as soon as the system is back', 'Be transparent with callers — brief them on the issue and confirm you will call back to verify their booking', 'Tell callers the venue is fully booked to avoid complications', 'Ask callers to try booking online instead without explaining why', 'Refuse to take bookings until the system is restored'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Manual recording and transparent communication are the two professional responses to a system outage — losing bookings or lying about availability both have real business and guest trust consequences.'),
  2, ARRAY['phone', 'system-outage', 'reservations']),

(14, 24, 'descriptor_l2', 'A caller wants to modify a reservation with less than 2 hours notice. Which TWO responses are appropriate?',
  jsonb_build_object('prompt', 'A caller wants to modify a reservation with less than 2 hours notice. Which TWO responses are appropriate?',
    'descriptors', ARRAY['Check availability and accommodate the change if possible — flexibility builds goodwill', 'If unable to accommodate, explain why briefly and offer the closest alternative available', 'Refuse all last-minute changes as policy regardless of the request', 'Accept the change without checking availability first', 'Tell them they should have called earlier and end the conversation'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Checking and accommodating where possible shows flexibility. When you cannot accommodate, a brief honest explanation plus an alternative gives the caller a path forward — rigid refusals and lectures both damage the relationship.'),
  2, ARRAY['phone', 'modifications', 'reservations']),

(14, 25, 'descriptor_l2', 'A caller asks detailed questions about private dining that you cannot fully answer. Which TWO responses are professional?',
  jsonb_build_object('prompt', 'A caller asks detailed questions about private dining that you cannot fully answer. Which TWO responses are professional?',
    'descriptors', ARRAY['Answer what you know confidently and offer to connect them with the right person for the rest', 'Take their contact details and commit to a specific callback timeframe with the full information', 'Make up the details to sound informed', 'Tell them to visit in person to get answers', 'Say "I don''t know" and leave the conversation there'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Answering what you know and routing them to the right person — or committing to a specific callback — are the two professional moves. Making up details or dead-ending the call both cost the venue a potential booking.'),
  2, ARRAY['phone', 'private-dining', 'enquiries']),

-- Module 14 L3

(14, 30, 'descriptor_l3', 'A large group inquiry arrives during busy service and the phone is ringing. Which THREE steps manage both priorities?',
  jsonb_build_object('prompt', 'A large group inquiry arrives during busy service and the phone is ringing. Which THREE steps manage both priorities?',
    'descriptors', ARRAY['Answer the phone and take the caller''s contact details — offer to call back within a set time rather than rushing the enquiry', 'Return the call as soon as service allows — within the timeframe you promised', 'If a colleague is available, ask them to handle one of the two while you manage the other', 'Let the phone ring out — floor service takes priority', 'Rush through the group enquiry to get back to the floor quickly'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'A callback offer, a promised timeframe, and delegation to a colleague where possible — these three allow you to respect both the caller and the floor without sacrificing either. Letting calls ring out and rushing enquiries both cost bookings.'),
  2, ARRAY['phone', 'time-management', 'delegation']),

(14, 31, 'descriptor_l3', 'A regular caller books, cancels, and rebooks three times for the same date. Which THREE communication strategies apply?',
  jsonb_build_object('prompt', 'A regular caller books, cancels, and rebooks three times for the same date. Which THREE communication strategies apply?',
    'descriptors', ARRAY['Confirm each change clearly and update the reservation system immediately every time', 'Note the booking history so your team is aware and the guest is treated consistently', 'Politely clarify your cancellation policy so they understand the implications of repeated changes', 'Refuse to accept any further changes to their booking', 'Tell them their booking will be cancelled if they change again without explaining the policy'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Accurate system updates, team awareness, and a polite policy explanation are the three professional responses to an indecisive caller — both the guest''s experience and your venue''s operational planning depend on accurate records.'),
  2, ARRAY['phone', 'cancellations', 'policy']),

(14, 32, 'descriptor_l3', 'A VIP reservation is confirmed but their preferred table is not available on the night. Which THREE steps manage this?',
  jsonb_build_object('prompt', 'A VIP reservation is confirmed but their preferred table is not available on the night. Which THREE steps manage this?',
    'descriptors', ARRAY['Contact the VIP ahead of their arrival — do not let them discover the change when they walk in', 'Offer the best available alternative and explain why the preferred table is not available', 'Arrange a gesture to acknowledge the inconvenience before they arrive', 'Seat them at the nearest table and apologise when they notice', 'Tell them the preference was never confirmed'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Proactive communication, a genuine alternative, and a pre-arrival gesture are the three steps that turn a VIP disappointment into a managed situation — discovering the change on arrival with no prior warning is the worst possible outcome.'),
  3, ARRAY['phone', 'vip', 'reservations']),

(14, 33, 'descriptor_l3', 'You realise after the call ends that you made an error in the reservation. Which THREE steps are correct?',
  jsonb_build_object('prompt', 'You realise after the call ends that you made an error in the reservation. Which THREE steps are correct?',
    'descriptors', ARRAY['Contact the guest immediately — call back and acknowledge the error directly', 'Correct the reservation in the system while you have the guest on the line or immediately after', 'Make a note for the team so they are aware and there is no further confusion on the night', 'Hope the guest does not notice and say nothing', 'Fix the system but do not contact the guest to avoid embarrassment'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Calling back immediately, correcting the system, and noting it for the team are the three actions that prevent a small error from becoming a major service failure on the night.'),
  2, ARRAY['phone', 'errors', 'reservations']),

(14, 34, 'descriptor_l3', 'Managing the waitlist on a fully booked night. Which THREE approaches work best?',
  jsonb_build_object('prompt', 'Managing the waitlist on a fully booked night. Which THREE approaches work best?',
    'descriptors', ARRAY['Give waitlisted guests an honest, conservative estimate rather than an optimistic one', 'Keep waitlisted guests updated — a 10-minute check-in when there is news either way is better than silence', 'Offer them a drink at the bar while they wait so the experience begins even before they are seated', 'Tell walk-ins there is no wait when there is, to prevent them leaving', 'Overbook the waitlist so you always have enough guests ready'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Conservative estimates, regular updates, and a drink at the bar are the three techniques that make a waitlist feel like hospitality rather than a queue — false promises and overbooking both create worse problems than the wait itself.'),
  2, ARRAY['phone', 'waitlist', 'capacity']),

(14, 35, 'descriptor_l3', 'A caller is emotionally distressed while making a reservation — they are planning a wake. Which THREE communication approaches apply?',
  jsonb_build_object('prompt', 'A caller is emotionally distressed while making a reservation — they are planning a wake. Which THREE communication approaches apply?',
    'descriptors', ARRAY['Match your tone to theirs — speak gently and at a measured pace', 'Acknowledge the occasion briefly and sincerely before moving to the practical details', 'Take thorough notes so they do not need to repeat information on the night', 'Move efficiently through all the details to not waste their time', 'Avoid acknowledging the occasion to keep the conversation professional'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Adjusting your tone, a brief sincere acknowledgement, and thorough note-taking are the three responses that respect the caller''s emotional state — efficient detachment and avoiding the occasion both feel cold and transactional at the wrong moment.'),
  2, ARRAY['phone', 'sensitive-occasions', 'empathy']),

(14, 36, 'descriptor_l3', 'A caller asks about your venue''s capacity for an event but you do not have all the figures. Which THREE steps are appropriate?',
  jsonb_build_object('prompt', 'A caller asks about your venue''s capacity for an event but you do not have all the figures. Which THREE steps are appropriate?',
    'descriptors', ARRAY['Share what you know confidently and flag what you need to confirm', 'Take their contact details and commit to a specific callback time with the remaining figures', 'Ask if they have any other questions you can answer now while you gather the capacity details', 'Make up approximate figures to avoid sounding unknowledgeable', 'Tell them to email instead so you have more time to research'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Partial confident answers, a specific callback commitment, and keeping the conversation going while you gather remaining info — these three build trust even when you do not have every detail immediately. Making up figures creates downstream problems.'),
  2, ARRAY['phone', 'event-enquiries', 'capacity'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 15: RSA — RESPONSIBLE SERVICE OF ALCOHOL =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(15, 20, 'descriptor_l2', 'A guest is showing signs of intoxication. Which TWO signs most clearly indicate you should stop service?',
  jsonb_build_object('prompt', 'A guest is showing signs of intoxication. Which TWO signs most clearly indicate you should stop service?',
    'descriptors', ARRAY['Slurred speech combined with difficulty maintaining balance', 'Significantly impaired judgement — making statements or decisions that are clearly out of character', 'They have been at the venue for more than two hours', 'They ordered a second round of shots', 'They are speaking loudly with their friends'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Slurred speech with coordination issues and clearly impaired judgement are the two most legally recognised signs of intoxication under Australian RSA law — time at the venue or ordering behaviour alone are not grounds for refusal.'),
  3, ARRAY['rsa', 'intoxication', 'refusal']),

(15, 21, 'descriptor_l2', 'You need to refuse service to an intoxicated guest. Which TWO steps minimise the risk of conflict?',
  jsonb_build_object('prompt', 'You need to refuse service to an intoxicated guest. Which TWO steps minimise the risk of conflict?',
    'descriptors', ARRAY['Speak to them privately and calmly — not in front of the group', 'Offer water and food, and suggest alternative transport if they are driving', 'Announce the refusal loudly so the rest of the table is aware', 'Tell them they are too drunk and ask them to leave immediately', 'Call security before attempting any conversation'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A private, calm approach preserves dignity and reduces the chance of a public confrontation. Offering water and a transport option fulfils your duty of care beyond just stopping drinks — announcing it publicly or leading with security both escalate unnecessarily.'),
  3, ARRAY['rsa', 'refusal', 'de-escalation']),

(15, 22, 'descriptor_l2', 'A group arrives and one member is visibly intoxicated before ordering. Which TWO responses are most appropriate?',
  jsonb_build_object('prompt', 'A group arrives and one member is visibly intoxicated before ordering. Which TWO responses are most appropriate?',
    'descriptors', ARRAY['Refuse service to the intoxicated person immediately — RSA obligations apply regardless of when they became intoxicated', 'Speak to the group privately and explain that you are unable to serve the intoxicated member, and offer water and food', 'Serve the whole group and monitor the intoxicated person carefully', 'Ask the intoxicated person to leave but serve the rest of the group', 'Serve one round and assess again'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'RSA obligations kick in regardless of where the intoxication occurred — you cannot serve someone who arrives already intoxicated. A private explanation to the group maintains respect for all involved while fulfilling your legal duty.'),
  3, ARRAY['rsa', 'pre-intoxicated', 'refusal']),

(15, 23, 'descriptor_l2', 'A guest disputes your assessment that they are intoxicated. Which TWO responses uphold your RSA obligations?',
  jsonb_build_object('prompt', 'A guest disputes your assessment that they are intoxicated. Which TWO responses uphold your RSA obligations?',
    'descriptors', ARRAY['Remain calm, state your observations factually, and maintain your decision without becoming argumentative', 'Offer to involve your supervisor or manager so the guest can raise their concern through the right channel', 'Back down and serve them one more drink to avoid conflict', 'Ask them to prove they are sober before you will reconsider', 'Apologise and reverse your decision if they become persistent enough'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Stating your observations factually and without aggression holds the RSA position professionally. Offering a supervisor gives the guest a legitimate avenue — it also protects you legally. Backing down under pressure is an RSA breach.'),
  3, ARRAY['rsa', 'refusal', 'dispute']),

(15, 24, 'descriptor_l2', 'A guest at the table tries to order on behalf of an intoxicated companion. Which TWO actions are most appropriate?',
  jsonb_build_object('prompt', 'A guest at the table tries to order on behalf of an intoxicated companion. Which TWO actions are most appropriate?',
    'descriptors', ARRAY['Decline the order for the intoxicated person regardless of who is placing it', 'Explain to the person ordering that you are unable to serve their companion further under RSA obligations', 'Serve the order since the intoxicated person is not ordering directly', 'Ask the intoxicated person themselves if they want the drink', 'Serve a lower-alcohol option without telling the companion'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'RSA obligations apply to the person who would receive the drink — proxy ordering does not override your duty. A clear, respectful explanation to the person ordering covers both your legal obligation and the guest relationship.'),
  3, ARRAY['rsa', 'proxy-ordering', 'refusal']),

(15, 25, 'descriptor_l2', 'A refused guest becomes aggressive. Which TWO immediate actions protect staff and guests?',
  jsonb_build_object('prompt', 'A refused guest becomes aggressive. Which TWO immediate actions protect staff and guests?',
    'descriptors', ARRAY['Stay calm, do not match their aggression, and maintain physical distance', 'Signal your supervisor or security immediately so backup is available', 'Argue back to assert that your refusal was correct', 'Physically restrain the guest to prevent further disturbance', 'Offer them one more drink to calm the situation'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'De-escalation through calm body language and signalling for backup are the two immediate responses that protect everyone — physical restraint and argument both escalate the risk, and offering alcohol to a refused guest is an RSA breach.'),
  3, ARRAY['rsa', 'aggression', 'security']),

-- Module 15 L3

(15, 30, 'descriptor_l3', 'A guest requests "just one more" after you have already refused service. Which THREE responses uphold RSA obligations?',
  jsonb_build_object('prompt', 'A guest requests "just one more" after you have already refused service. Which THREE responses uphold RSA obligations?',
    'descriptors', ARRAY['Restate your refusal calmly and consistently — a repeated request does not change the obligation', 'Offer water, food, or a non-alcoholic alternative to show you are still providing hospitality', 'Suggest they arrange safe transport and offer to assist with calling a rideshare', 'Agree to one more drink if they promise to leave after', 'Explain that the decision was made by management to deflect responsibility'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Restating the refusal without wavering, continuing non-alcoholic hospitality, and supporting safe transport are the three RSA-compliant responses — agreeing under persistence is a breach, and deflecting to management undermines your authority and the venue''s RSA position.'),
  3, ARRAY['rsa', 'refusal', 'persistence']),

(15, 31, 'descriptor_l3', 'You believe a guest is about to drive while intoxicated. Which THREE steps fulfil your duty of care?',
  jsonb_build_object('prompt', 'You believe a guest is about to drive while intoxicated. Which THREE steps fulfil your duty of care?',
    'descriptors', ARRAY['Offer to call a rideshare or taxi — frame it as a service, not a judgement', 'Alert your manager immediately so the response is coordinated and documented', 'If the guest insists on driving, contact venue security or if necessary the police — you have a legal duty of care', 'Tell other guests in the group to manage the situation themselves', 'Do nothing once you have stopped serving — your RSA obligation ends at refusal'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Offering transport, coordinating with your manager, and escalating to security or police if the guest proceeds are the three steps that fulfil Australian duty of care obligations — RSA does not end at the bar; it extends to ensuring the guest does not leave dangerously.'),
  3, ARRAY['rsa', 'drink-driving', 'duty-of-care']),

(15, 32, 'descriptor_l3', 'Calculating standard drinks for a complex round. Which THREE factors must you consider?',
  jsonb_build_object('prompt', 'Calculating standard drinks for a complex round. Which THREE factors must you consider?',
    'descriptors', ARRAY['The alcohol percentage (ABV) of each drink being served', 'The volume of each serve — a schooner and a pint of the same beer have different standard drink counts', 'Whether the drinks include a mixer that dilutes the ABV', 'The gender of the guest — RSA standard drinks are not gender-dependent under Australian law', 'The time they have been drinking — relevant for assessment, but not part of the standard drink calculation itself'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'ABV, serve volume, and dilution by mixer are the three factors in the standard drink formula. Standard drinks are not adjusted by gender under Australian RSA law — that is a common misconception.'),
  3, ARRAY['rsa', 'standard-drinks', 'calculation']),

(15, 33, 'descriptor_l3', 'A visibly intoxicated guest is part of a group still being served. Which THREE actions balance RSA with hospitality?',
  jsonb_build_object('prompt', 'A visibly intoxicated guest is part of a group still being served. Which THREE actions balance RSA with hospitality?',
    'descriptors', ARRAY['Refuse service specifically to the intoxicated guest while continuing to serve the rest of the table', 'Offer the intoxicated guest water, food, and a non-alcoholic option naturally as part of your service round', 'Alert your manager so the situation is on the record and backup is available if needed', 'Continue serving the whole table to avoid singling anyone out', 'Ask the group to remove the intoxicated guest before you will serve anyone'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Individual refusal, continued non-alcoholic hospitality, and manager awareness are the three responses that fulfil your RSA obligations for that guest without penalising the rest of the table — serving everyone or removing the whole group are both disproportionate.'),
  3, ARRAY['rsa', 'group-dynamics', 'refusal']),

(15, 34, 'descriptor_l3', 'RSA documentation at end of service. Which THREE records are important to maintain?',
  jsonb_build_object('prompt', 'RSA documentation at end of service. Which THREE records are important to maintain?',
    'descriptors', ARRAY['Any refusals of service — who was refused, the time, and the observable reason', 'Any incidents involving intoxicated patrons — including how they were managed and who was notified', 'Any interventions that involved security or police — including contact names and times', 'The total number of drinks served across the venue for the evening', 'The names and ages of every patron who purchased alcohol'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Refusals, incidents, and security/police interventions are the three records that matter for RSA compliance and legal protection — total drinks served and every patron''s ID are not required documentation under standard Australian RSA obligations.'),
  3, ARRAY['rsa', 'documentation', 'compliance']),

(15, 35, 'descriptor_l3', 'Training a new staff member on RSA. Which THREE key principles do you establish first?',
  jsonb_build_object('prompt', 'Training a new staff member on RSA. Which THREE key principles do you establish first?',
    'descriptors', ARRAY['RSA is a legal obligation, not a customer service choice — refusal is non-negotiable when required', 'The signs of intoxication and the difference between a merry guest and one who must be refused', 'How to refuse service in a way that is calm, respectful, and minimises conflict', 'That management will always back you up if a refusal leads to a complaint', 'That they should serve conservatively to avoid having to refuse at all'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'The legal non-negotiability of RSA, recognition of intoxication signs, and a professional refusal technique are the three foundations — without these, new staff cannot apply RSA confidently. Management support and conservative service are important but secondary to the three core competencies.'),
  3, ARRAY['rsa', 'training', 'key-principles']),

(15, 36, 'descriptor_l3', 'A guest on medication tells you they probably should not drink but orders anyway. Which THREE responses are appropriate?',
  jsonb_build_object('prompt', 'A guest on medication tells you they probably should not drink but orders anyway. Which THREE responses are appropriate?',
    'descriptors', ARRAY['Serve them — it is their choice as an adult; your RSA obligation is about intoxication, not medical advice', 'Monitor them more closely than you otherwise would — medication can accelerate intoxication', 'Mention that if they start to seem affected earlier than expected, you will need to slow service or stop', 'Refuse to serve them immediately on the basis of the medication comment', 'Ask them to sign something to confirm they accept responsibility'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Adults can make their own choices about alcohol; your RSA obligation is about observable intoxication. However, medication can significantly lower tolerance — heightened monitoring and a pre-emptive, professional heads-up are both appropriate and sensible responses to what they have told you.'),
  3, ARRAY['rsa', 'medication', 'duty-of-care'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 16: FOOD SAFETY AND HYGIENE =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(16, 20, 'descriptor_l2', 'A guest reports an allergen concern after ordering. Which TWO actions are most critical?',
  jsonb_build_object('prompt', 'A guest reports an allergen concern after ordering. Which TWO actions are most critical?',
    'descriptors', ARRAY['Stop the order immediately and confirm every ingredient in the dish with the kitchen before it is prepared', 'Inform your supervisor or Food Safety Supervisor so the response is managed at the right level', 'Tell the guest the dish is probably fine without checking', 'Ask the guest how serious their allergy is before deciding whether to act', 'Offer to substitute a different dish from the same prep area without checking for cross-contamination'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Stopping the order and verifying with the kitchen prevents the allergen reaching the guest. Involving your supervisor ensures the response is managed appropriately — minimising or guessing creates legal and life-threatening risk.'),
  3, ARRAY['food-safety', 'allergens', 'kitchen-comms']),

(16, 21, 'descriptor_l2', 'You find food stored at an incorrect temperature during your shift. Which TWO actions are immediate priorities?',
  jsonb_build_object('prompt', 'You find food stored at an incorrect temperature during your shift. Which TWO actions are immediate priorities?',
    'descriptors', ARRAY['Remove the food from service and quarantine it pending assessment by your supervisor', 'Record the discovery — time, what was found, and the temperature — in the food safety log', 'Continue serving if the food looks and smells acceptable', 'Immediately discard all the food without informing anyone', 'Lower the temperature setting without documenting what happened'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Quarantining the food stops any safety risk from reaching guests. Documenting the discovery creates the legal record required under FSANZ — discarding without documentation and continuing to serve without checking are both compliance failures.'),
  3, ARRAY['food-safety', 'temperature', 'documentation']),

(16, 22, 'descriptor_l2', 'A cross-contamination risk is identified on the pass during service. Which TWO actions do you take first?',
  jsonb_build_object('prompt', 'A cross-contamination risk is identified on the pass during service. Which TWO actions do you take first?',
    'descriptors', ARRAY['Remove the affected items from the pass immediately and do not allow them to be served', 'Alert the kitchen and your supervisor so the source is identified and corrected', 'Serve the items quickly before the contamination affects the dishes further', 'Wipe down the pass with a cloth and continue service', 'Wait until the service rush is over to address it'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Removing affected items from service and alerting the kitchen and supervisor are the two immediate actions — during service there is no time for half-measures. Serving contaminated food and deferring action both create unacceptable food safety risk.'),
  3, ARRAY['food-safety', 'cross-contamination', 'kitchen-comms']),

(16, 23, 'descriptor_l2', 'A staff member is visibly unwell and insists they are fine to work a food-handling role. Which TWO actions are appropriate?',
  jsonb_build_object('prompt', 'A staff member is visibly unwell and insists they are fine to work a food-handling role. Which TWO actions are appropriate?',
    'descriptors', ARRAY['Remove them from any food-handling role immediately — FSANZ prohibits sick staff handling food', 'Escalate to the manager so the staffing gap is covered and the decision is made at the right level', 'Allow them to work as long as they wear gloves', 'Let them decide for themselves since they know how they feel', 'Ask them to work through the shift and leave early if they get worse'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'FSANZ is clear — staff who are visibly unwell must not handle food. This is a manager-level call, not a peer conversation — escalating ensures coverage is arranged and the decision is documented.'),
  3, ARRAY['food-safety', 'sick-staff', 'compliance']),

(16, 24, 'descriptor_l2', 'You discover a product past its use-by date in the kitchen during service. Which TWO actions are correct?',
  jsonb_build_object('prompt', 'You discover a product past its use-by date in the kitchen during service. Which TWO actions are correct?',
    'descriptors', ARRAY['Remove it from use immediately and set it aside for the supervisor to assess', 'Document it in the food safety log — date, product, and what action was taken', 'Use it if it still looks and smells fine — use-by dates are conservative', 'Discard it immediately without telling anyone to avoid awkwardness', 'Continue using it until the supervisor is available at end of service'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Removing and quarantining the product prevents its use. Documentation creates the legal and operational record — using past-date products regardless of appearance is a FSANZ breach, and discarding without a record hides information the business needs.'),
  3, ARRAY['food-safety', 'use-by-date', 'documentation']),

(16, 25, 'descriptor_l2', 'A guest asks about allergens in a dish and you are not completely certain. Which TWO responses are safe?',
  jsonb_build_object('prompt', 'A guest asks about allergens in a dish and you are not completely certain. Which TWO responses are safe?',
    'descriptors', ARRAY['Tell the guest you want to confirm with the kitchen before giving them a definitive answer', 'Do not guess — if there is any uncertainty, treat it as if the allergen may be present until confirmed', 'Give your best guess based on the menu description', 'Tell them it should be fine because no one has had a reaction before', 'Offer a substitute immediately without checking whether the substitute is safe either'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Checking with the kitchen and treating uncertainty as risk are the two safe responses to an allergen question — guessing, past experience, and unverified substitutes all create the potential for a life-threatening outcome.'),
  3, ARRAY['food-safety', 'allergens', 'guest-communication']),

-- Module 16 L3

(16, 30, 'descriptor_l3', 'A guest with a severe allergy requests a safe dish. Which THREE steps ensure their safety?',
  jsonb_build_object('prompt', 'A guest with a severe allergy requests a safe dish. Which THREE steps ensure their safety?',
    'descriptors', ARRAY['Communicate the allergy directly to the kitchen — verbally and on the order ticket', 'Confirm with the kitchen which dishes are genuinely safe, including cross-contamination risk during prep', 'Return to the guest with a confirmed safe option before they finalise their order', 'Reassure them immediately that the venue can accommodate any allergy', 'Suggest they order something simple and assume it will be safe'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Kitchen communication, cross-contamination verification, and confirming with the guest before they order are the three steps that create a safe loop. Premature reassurance and assumptions both create risk — the safety chain is only as strong as its most confident untested link.'),
  3, ARRAY['food-safety', 'allergens', 'severe-allergy']),

(16, 31, 'descriptor_l3', 'A Food Safety Supervisor role during a health inspection. Which THREE actions demonstrate compliance?',
  jsonb_build_object('prompt', 'A Food Safety Supervisor role during a health inspection. Which THREE actions demonstrate compliance?',
    'descriptors', ARRAY['Have all food safety logs, temperature records, and training documentation ready and accessible', 'Accompany the inspector and answer questions accurately — do not volunteer information that is not asked for, but do not withhold relevant facts', 'Demonstrate your team''s knowledge by having staff available to answer procedure questions', 'Hide any records that show past issues before the inspector arrives', 'Tell staff not to speak with the inspector directly'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Ready documentation, accurate co-operation, and demonstrating staff knowledge are the three behaviours that build inspector confidence. Hiding records and muzzling staff are both illegal and counterproductive — inspectors are looking for a functioning food safety culture, not perfection.'),
  3, ARRAY['food-safety', 'health-inspection', 'compliance']),

(16, 32, 'descriptor_l3', 'Preventing cross-contamination on a busy kitchen pass. Which THREE practices are most important?',
  jsonb_build_object('prompt', 'Preventing cross-contamination on a busy kitchen pass. Which THREE practices are most important?',
    'descriptors', ARRAY['Keep allergen-flagged dishes physically separated on the pass and clearly labelled until they leave the kitchen', 'Use separate serving utensils for allergen-free dishes — never double-dip or reuse', 'Verbally confirm allergen status with the runner before any flagged dish leaves the pass', 'Trust that the kitchen has already managed all allergens and do not check at the pass', 'Only separate dishes if the allergy was identified as severe'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Physical separation, dedicated utensils, and verbal confirmation at the pass are the three cross-contamination controls that work together — trusting the kitchen without a pass-check and only separating "severe" allergies are both single-point failures in a multi-step risk.'),
  3, ARRAY['food-safety', 'cross-contamination', 'pass-management']),

(16, 33, 'descriptor_l3', 'Temperature danger zone management during a long service. Which THREE controls apply?',
  jsonb_build_object('prompt', 'Temperature danger zone management during a long service. Which THREE controls apply?',
    'descriptors', ARRAY['Check and record temperatures of hot and cold holding equipment at defined intervals throughout service', 'Remove and quarantine any food that has been in the danger zone (5°C–60°C) for more than 2 hours', 'Ensure hot food is kept above 60°C and cold food below 5°C throughout the service period', 'Trust that equipment maintains the right temperature without checking during a busy service', 'Cool leftover hot food at room temperature to save refrigerator space'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Regular temperature monitoring, removing food outside the safe window, and maintaining the hot/cold thresholds are the three controls required under FSANZ — relying on equipment without verification and room-temperature cooling are two of the most common food safety compliance failures.'),
  3, ARRAY['food-safety', 'temperature', 'danger-zone']),

(16, 34, 'descriptor_l3', 'Receiving a food delivery. Which THREE quality control steps are most important?',
  jsonb_build_object('prompt', 'Receiving a food delivery. Which THREE quality control steps are most important?',
    'descriptors', ARRAY['Check temperatures of refrigerated and frozen items immediately upon arrival', 'Inspect packaging for damage, contamination, or use-by date issues before accepting', 'Record the delivery details — supplier, items, temperatures, and any issues — in the receiving log', 'Accept all deliveries quickly to keep the service area clear', 'Store all items before checking them to prevent disruption to the team'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Temperature check, packaging inspection, and documented receiving are the three FSANZ-required steps at the delivery point — accepting without checking and storing before inspecting both allow contaminated or unsafe food to enter your supply chain undetected.'),
  3, ARRAY['food-safety', 'delivery', 'receiving']),

(16, 35, 'descriptor_l3', 'Identifying a food safety risk mid-service. Which THREE actions prioritise guest safety and compliance?',
  jsonb_build_object('prompt', 'Identifying a food safety risk mid-service. Which THREE actions prioritise guest safety and compliance?',
    'descriptors', ARRAY['Stop serving the affected item immediately — do not wait until the rush ends', 'Alert your supervisor and Food Safety Supervisor so the response is coordinated', 'Document what was found, when, and what action was taken in the food safety log', 'Continue serving to avoid disrupting the guest experience and deal with it after service', 'Discard the affected food quietly without telling anyone to prevent alarm'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Immediate stop, supervisor notification, and documentation are the three non-negotiable responses to a mid-service food safety risk — deferring to after-service and quiet disposal both allow the risk to continue and leave no compliance record.'),
  3, ARRAY['food-safety', 'mid-service', 'incident-response']),

(16, 36, 'descriptor_l3', 'Cleaning and sanitising food contact surfaces correctly. Which THREE steps in the correct order?',
  jsonb_build_object('prompt', 'Cleaning and sanitising food contact surfaces correctly. Which THREE steps in the correct order?',
    'descriptors', ARRAY['Remove all food debris and residue with a clean cloth or scraper before applying any chemicals', 'Apply an approved cleaning agent and allow adequate contact time before rinsing thoroughly', 'Apply an approved food-safe sanitiser after cleaning and allow it to air-dry or follow product instructions', 'Apply sanitiser directly to a surface with visible food residue — it is more efficient', 'Dry the surface with a hand towel immediately after sanitising to save time'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Debris removal, cleaning with contact time, then sanitising is the correct three-step sequence — sanitiser cannot penetrate organic matter, so skipping the clean step renders it ineffective. Air-drying is required because towel-drying recontaminates the sanitised surface.'),
  3, ARRAY['food-safety', 'cleaning', 'sanitising'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 17: CONFLICT DE-ESCALATION =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(17, 20, 'descriptor_l2', 'Two guests at adjacent tables begin arguing loudly. Which TWO immediate actions are most appropriate?',
  jsonb_build_object('prompt', 'Two guests at adjacent tables begin arguing loudly. Which TWO immediate actions are most appropriate?',
    'descriptors', ARRAY['Approach both tables calmly and quietly — address each group separately and briefly', 'Alert your supervisor immediately so there is backup awareness in case it escalates', 'Ignore it unless it becomes physical', 'Ask all other guests in the area if they are uncomfortable to draw attention to the situation', 'Tell both groups they will be asked to leave if they continue before attempting any conversation'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A calm, quiet approach to both parties separately can de-escalate before anyone doubles down publicly. Supervisor awareness ensures backup is ready — threats of ejection before attempting conversation and ignoring the situation both allow it to escalate unchecked.'),
  3, ARRAY['conflict', 'de-escalation', 'inter-table']),

(17, 21, 'descriptor_l2', 'A guest is physically intimidating a staff member. Which TWO responses immediately protect staff safety?',
  jsonb_build_object('prompt', 'A guest is physically intimidating a staff member. Which TWO responses immediately protect staff safety?',
    'descriptors', ARRAY['The staff member should create physical distance from the guest immediately', 'Signal security or a supervisor to respond — do not attempt to manage physical intimidation alone', 'The staff member should stand their ground and continue the conversation', 'Ask other guests to intervene', 'Call the police before attempting any venue-level response'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Physical distance and immediate backup are the two responses that protect staff safety — standing your ground in a physically intimidating situation escalates personal risk. Police are a last resort after venue-level response has been attempted.'),
  3, ARRAY['conflict', 'staff-safety', 'intimidation']),

(17, 22, 'descriptor_l2', 'A guest becomes verbally abusive when refused service. Which TWO de-escalation techniques are most effective?',
  jsonb_build_object('prompt', 'A guest becomes verbally abusive when refused service. Which TWO de-escalation techniques are most effective?',
    'descriptors', ARRAY['Keep your voice calm and even — do not raise it to compete with theirs', 'Acknowledge what they are feeling without reversing your decision: "I understand you''re frustrated, and my answer has to stay the same"', 'Match their volume so they feel heard', 'Apologise and reverse the refusal to end the confrontation', 'Threaten to call police immediately if they do not stop'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A steady calm voice and a formula that validates feeling without changing position are the two de-escalation tools proven to work in verbal conflict — matching volume, reversing decisions under pressure, and immediate police threats all escalate rather than resolve.'),
  3, ARRAY['conflict', 'de-escalation', 'verbal-abuse']),

(17, 23, 'descriptor_l2', 'A group is becoming increasingly disruptive and other guests are visibly uncomfortable. Which TWO approaches contain the situation?',
  jsonb_build_object('prompt', 'A group is becoming increasingly disruptive and other guests are visibly uncomfortable. Which TWO approaches contain the situation?',
    'descriptors', ARRAY['Approach the group directly and calmly, address the specific behaviour, and set a clear expectation', 'Alert your manager — a disruptive group affecting other guests requires management-level awareness', 'Continue serving them and hope they settle down naturally', 'Confront the loudest group member publicly in front of the venue', 'Seat the uncomfortable guests elsewhere without addressing the source of the disruption'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Direct calm communication with the group and manager awareness are the two approaches that address the source of the disruption — hoping it settles, public confrontation, and treating symptoms (moving other guests) while ignoring the cause all fail.'),
  3, ARRAY['conflict', 'disruptive-group', 'management']),

(17, 24, 'descriptor_l2', 'Third-party guests begin intervening in a conflict between two other tables. Which TWO actions contain the situation?',
  jsonb_build_object('prompt', 'Third-party guests begin intervening in a conflict between two other tables. Which TWO actions contain the situation?',
    'descriptors', ARRAY['Politely and firmly ask the intervening guests to return to their seats — their involvement is making resolution harder', 'Ensure your supervisor or security is already aware and moving into position', 'Let the intervening guests help since they may be able to de-escalate better than staff', 'Focus entirely on the original conflict and ignore the escalating crowd dynamic', 'Ask the venue to be cleared immediately'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Third-party involvement typically escalates conflict rather than resolving it — separating them and ensuring backup is ready are the two actions that contain a situation that is already spreading beyond two parties.'),
  3, ARRAY['conflict', 'bystander', 'crowd-control']),

(17, 25, 'descriptor_l2', 'After de-escalating a conflict successfully, which TWO follow-up actions are most important?',
  jsonb_build_object('prompt', 'After de-escalating a conflict successfully, which TWO follow-up actions are most important?',
    'descriptors', ARRAY['Document the incident — what happened, who was involved, and what was done', 'Brief your manager and any security staff on the outcome so they have context if the guest returns', 'Move on immediately and do not raise it with anyone to avoid making it a bigger deal', 'Apologise to all guests in the venue over the PA', 'Check in with the affected staff member to ensure they are okay'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Documentation creates a legal and operational record. Manager and security briefing ensures consistent handling if the guest returns or escalates. Checking on affected staff is also good practice — but documentation and briefing are the two formal post-conflict requirements.'),
  3, ARRAY['conflict', 'documentation', 'follow-up']),

-- Module 17 L3

(17, 30, 'descriptor_l3', 'A verbal conflict between two groups is escalating rapidly. Which THREE steps de-escalate it effectively?',
  jsonb_build_object('prompt', 'A verbal conflict between two groups is escalating rapidly. Which THREE steps de-escalate it effectively?',
    'descriptors', ARRAY['Physically separate the groups — even a small distance reduces the intensity of direct confrontation', 'Speak to each group individually and privately rather than addressing both at once', 'Stay calm and speak slowly — your energy is contagious in a conflict environment', 'Demand silence from both groups before any further conversation', 'Take sides with the group who appears more in the right'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Physical separation, individual engagement, and a calm regulated tone are the three evidence-based de-escalation techniques — demanding silence and taking sides both intensify conflict rather than reducing it.'),
  3, ARRAY['conflict', 'de-escalation', 'technique']),

(17, 31, 'descriptor_l3', 'A patron becomes physically aggressive after being refused service. Which THREE responses protect everyone?',
  jsonb_build_object('prompt', 'A patron becomes physically aggressive after being refused service. Which THREE responses protect everyone?',
    'descriptors', ARRAY['Signal security to respond immediately — do not attempt to physically manage aggression alone', 'Maintain distance and a calm, non-threatening posture — do not mirror the aggression', 'Contact police if the aggression continues or the person cannot be removed safely', 'Physically restrain the person to prevent further disruption', 'Offer to serve them to immediately end the aggression'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Security, physical distance with a calm posture, and police escalation if needed are the three responses that protect staff and guests — physical restraint by untrained staff and reversing a refusal under aggression are both dangerous and legally problematic.'),
  3, ARRAY['conflict', 'physical-aggression', 'security']),

(17, 32, 'descriptor_l3', 'Deciding whether to involve security or police in a conflict. Which THREE factors guide the decision?',
  jsonb_build_object('prompt', 'Deciding whether to involve security or police in a conflict. Which THREE factors guide the decision?',
    'descriptors', ARRAY['Whether the situation involves or threatens physical harm to guests or staff', 'Whether the situation has escalated beyond what venue staff can safely manage alone', 'Whether the person is refusing to comply with reasonable staff direction after multiple attempts', 'Whether the person has been loud for more than 5 minutes', 'Whether other guests are watching the situation unfold'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Physical harm risk, beyond-staff capability, and sustained non-compliance are the three decision factors for external escalation — time-in-conflict and spectator presence are not thresholds for police or security involvement.'),
  3, ARRAY['conflict', 'escalation', 'security-police']),

(17, 33, 'descriptor_l3', 'A conflict involves cultural or language differences that complicate communication. Which THREE strategies help?',
  jsonb_build_object('prompt', 'A conflict involves cultural or language differences that complicate communication. Which THREE strategies help?',
    'descriptors', ARRAY['Use simple, clear language and avoid idioms or slang that may not translate', 'Speak slowly and check for understanding — a nod does not always mean agreement', 'Look for a bilingual person in the group or nearby who can help bridge the communication gap', 'Raise your voice so the communication is clearer', 'Assume the conflict stems from cultural difference and act accordingly without first understanding the actual issue'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Simple language, deliberate pacing with comprehension checks, and finding a bilingual bridge are the three strategies that work across language barriers — raising your voice and making cultural assumptions both create more misunderstanding, not less.'),
  3, ARRAY['conflict', 'cultural-sensitivity', 'communication']),

(17, 34, 'descriptor_l3', 'Post-incident follow-up after a serious conflict at the venue. Which THREE actions are most important?',
  jsonb_build_object('prompt', 'Post-incident follow-up after a serious conflict at the venue. Which THREE actions are most important?',
    'descriptors', ARRAY['Complete a full incident report immediately while details are fresh — time, parties, actions taken, witnesses', 'Brief management so they can decide on any further steps — banning orders, insurance, police liaison', 'Check in with any staff who were directly involved to assess their wellbeing', 'Move on as quickly as possible so the team can focus on service', 'Discuss the incident with guests to get their perspective on how it was handled'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Incident report, management briefing, and staff wellbeing check are the three post-incident requirements — the report creates the legal record, management decides on escalation, and staff welfare is a WHS obligation. Moving on quickly and canvassing guest opinions are not appropriate post-incident steps.'),
  3, ARRAY['conflict', 'incident-report', 'staff-welfare']),

(17, 35, 'descriptor_l3', 'A guest is causing conflict because of a genuine misunderstanding about venue policy. Which THREE steps resolve it professionally?',
  jsonb_build_object('prompt', 'A guest is causing conflict because of a genuine misunderstanding about venue policy. Which THREE steps resolve it professionally?',
    'descriptors', ARRAY['Listen to the guest''s understanding of the situation first before explaining the policy', 'Acknowledge that the misunderstanding is understandable — do not make them feel foolish for not knowing', 'Explain the policy clearly and offer whatever flexibility genuinely exists within it', 'Tell them the policy is the policy and there is nothing more to discuss', 'Apologise for the policy itself rather than the misunderstanding'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Listening first, validating the misunderstanding, and explaining with genuine flexibility are the three responses that turn a policy conflict into a positive interaction — dismissal and apologising for the policy (rather than the confusion) both leave the guest feeling dismissed or set up for future misunderstanding.'),
  3, ARRAY['conflict', 'policy', 'misunderstanding']),

(17, 36, 'descriptor_l3', 'Training new staff on conflict de-escalation for the first time. Which THREE core principles do you establish first?',
  jsonb_build_object('prompt', 'Training new staff on conflict de-escalation for the first time. Which THREE core principles do you establish first?',
    'descriptors', ARRAY['Your own safety and the safety of other guests comes first — do not take risks to manage a situation alone', 'Calm, non-threatening body language and tone can de-escalate a situation before a word is spoken', 'Know when to escalate — recognise the signals that mean a situation is beyond your authority to manage', 'Always win the argument with the guest to establish authority', 'A personal apology for the guest''s experience resolves most conflicts quickly'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Safety first, the power of non-verbal de-escalation, and knowing your escalation threshold are the three foundations of conflict training — winning arguments creates adversarial dynamics and a personal apology often implies fault where none exists.'),
  3, ARRAY['conflict', 'training', 'principles'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 18: EMERGENCY EVACUATION PROTOCOLS =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(18, 20, 'descriptor_l2', 'The fire alarm sounds but you suspect it may be a false alarm. Which TWO actions are correct?',
  jsonb_build_object('prompt', 'The fire alarm sounds but you suspect it may be a false alarm. Which TWO actions are correct?',
    'descriptors', ARRAY['Treat every alarm as real and begin evacuation immediately — never assume it is false', 'Follow your venue''s evacuation procedure exactly as trained — do not improvise', 'Wait 60 seconds to see if the alarm stops before taking action', 'Tell guests to remain seated while you investigate the source', 'Silence the alarm first to reduce panic, then assess'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Australian fire safety legislation requires treating every alarm as real until confirmed otherwise by emergency services — delaying evacuation to investigate or waiting for the alarm to stop costs the seconds that save lives.'),
  2, ARRAY['evacuation', 'fire-alarm', 'procedure']),

(18, 21, 'descriptor_l2', 'A guest refuses to evacuate the venue during an emergency. Which TWO responses are appropriate?',
  jsonb_build_object('prompt', 'A guest refuses to evacuate the venue during an emergency. Which TWO responses are appropriate?',
    'descriptors', ARRAY['Give a clear, direct instruction — "I need you to leave now, this is an emergency" — without entering into discussion', 'Note their location and report it to emergency services when you reach the assembly point', 'Stay with them to keep them company until they are ready to leave', 'Physically drag them from the building', 'Accept their refusal and focus on evacuating other guests'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A clear direct instruction (not a request) is your first tool. If they still refuse, your obligation is to report their location to emergency services — physically removing someone is a WHS risk and outside your authority; abandoning them without reporting is a failure of duty.'),
  2, ARRAY['evacuation', 'refusal', 'emergency']),

(18, 22, 'descriptor_l2', 'You are evacuation warden sweeping the venue. Which TWO priorities guide your sweep?',
  jsonb_build_object('prompt', 'You are evacuation warden sweeping the venue. Which TWO priorities guide your sweep?',
    'descriptors', ARRAY['Check every room, bathroom, and enclosed area — people shelter in these spaces during emergencies', 'Announce clearly as you move through: "Emergency — everyone must evacuate now"', 'Move quickly through the main areas and skip the bathrooms to save time', 'Wait for all guests to self-evacuate before you begin your sweep', 'Carry as much of the venue''s property out as possible during your sweep'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Bathrooms and enclosed spaces are where people retreat in emergencies — skipping them in a sweep leaves people behind. A clear verbal announcement as you move ensures anyone who missed the alarm hears your instruction directly.'),
  2, ARRAY['evacuation', 'warden', 'sweep']),

(18, 23, 'descriptor_l2', 'The nearest exit is blocked during an evacuation. Which TWO steps ensure guests reach safety?',
  jsonb_build_object('prompt', 'The nearest exit is blocked during an evacuation. Which TWO steps ensure guests reach safety?',
    'descriptors', ARRAY['Redirect guests immediately and calmly to the next closest exit — you must know all exit routes', 'Stay calm and authoritative — your composure determines whether guests panic or follow your direction', 'Tell guests to wait while you find another way out', 'Break through the blocked exit if possible', 'Announce that there is no way out to manage guest expectations'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Knowing all exit routes so you can redirect instantly and maintaining calm authority are the two capabilities that matter when the primary exit is blocked — hesitating, breaking down exits unnecessarily, and catastrophising all prevent a controlled evacuation.'),
  2, ARRAY['evacuation', 'blocked-exit', 'routes']),

(18, 24, 'descriptor_l2', 'A guest with limited mobility is present during an emergency. Which TWO actions ensure their safety?',
  jsonb_build_object('prompt', 'A guest with limited mobility is present during an emergency. Which TWO actions ensure their safety?',
    'descriptors', ARRAY['Stay with or assign a specific staff member to assist them throughout the evacuation', 'If they cannot use stairs, guide them to the designated area of refuge and immediately report their location to emergency services', 'Ask them to wait while you evacuate other guests first', 'Carry them down the stairs yourself to get them out quickly', 'Let them manage at their own pace and check on them at the assembly point'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A dedicated staff member and the area of refuge protocol (never carry someone down stairs unless trained) are the two correct approaches — leaving them unassisted and carrying them without training both create serious injury risk.'),
  2, ARRAY['evacuation', 'accessibility', 'mobility']),

(18, 25, 'descriptor_l2', 'At the assembly point after evacuation, you need to confirm all guests have exited. Which TWO actions help?',
  jsonb_build_object('prompt', 'At the assembly point after evacuation, you need to confirm all guests have exited. Which TWO actions help?',
    'descriptors', ARRAY['Report immediately to the chief warden — share your sweep observations and any guests you were unable to locate', 'If your venue has a reservation or check-in system, use it to compare against who is at the assembly point', 'Go back into the venue to conduct another sweep without being authorised by emergency services', 'Assume all guests are out if the building looks empty from the outside', 'Ask guests to organise themselves into groups by table number for an easier headcount'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Reporting to the chief warden with your observations and using available records to cross-check attendance are the two appropriate actions — re-entering without authorisation and assuming the building is clear from the outside both create serious safety risk.'),
  2, ARRAY['evacuation', 'assembly-point', 'headcount']),

-- Module 18 L3

(18, 30, 'descriptor_l3', 'Managing a full venue evacuation on a busy Friday night. Which THREE steps are your immediate priorities?',
  jsonb_build_object('prompt', 'Managing a full venue evacuation on a busy Friday night. Which THREE steps are your immediate priorities?',
    'descriptors', ARRAY['Activate the alarm and begin verbal direction immediately — do not wait to assess the situation first', 'Direct staff to their evacuation roles without hesitation — every staff member has a pre-assigned function', 'Guide guests toward exits clearly, calmly, and without creating panic — calm authority is faster than urgency', 'Take the cash float and venue records out before guests to protect assets', 'Wait for the alarm to sound for 30 seconds before deciding to evacuate'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Immediate activation, staff role deployment, and calm authoritative guest direction are the three priorities — every second spent assessing, protecting assets, or waiting costs guest safety.'),
  2, ARRAY['evacuation', 'warden', 'busy-service']),

(18, 31, 'descriptor_l3', 'As evacuation warden, which THREE responsibilities are you accountable for?',
  jsonb_build_object('prompt', 'As evacuation warden, which THREE responsibilities are you accountable for?',
    'descriptors', ARRAY['Sweeping your designated area to ensure it is clear of guests before leaving', 'Reporting to the chief warden at the assembly point with your sweep outcome', 'Accounting for any staff assigned to your area during the evacuation', 'Managing the media and external communications about the emergency', 'Deciding whether to call the fire brigade based on your assessment'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Area sweep, chief warden report, and staff accountability are the three warden responsibilities — media management and emergency service decisions are not within the warden role; the fire brigade is called regardless of your assessment.'),
  2, ARRAY['evacuation', 'warden-role', 'accountability']),

(18, 32, 'descriptor_l3', 'After evacuation, emergency services arrive. Which THREE actions support them effectively?',
  jsonb_build_object('prompt', 'After evacuation, emergency services arrive. Which THREE actions support them effectively?',
    'descriptors', ARRAY['Report directly to the incident controller — identify yourself, your role, and your sweep findings', 'Provide the layout of the venue and locations of any guests unaccounted for', 'Keep staff and guests at the assembly point and out of the way of emergency services', 'Re-enter the venue with emergency services to guide them', 'Take charge of the emergency services team to ensure efficiency'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Identifying yourself to the incident controller, sharing venue knowledge, and keeping people clear are the three ways venue staff support emergency services effectively — re-entering the building and taking charge of emergency services both interfere with their operation.'),
  2, ARRAY['evacuation', 'emergency-services', 'incident-controller']),

(18, 33, 'descriptor_l3', 'A medical emergency occurs at the same time the fire alarm sounds. Which THREE priorities guide your response?',
  jsonb_build_object('prompt', 'A medical emergency occurs at the same time the fire alarm sounds. Which THREE priorities guide your response?',
    'descriptors', ARRAY['Evacuate all guests including the person with the medical emergency — the fire risk takes precedence', 'Assign a specific staff member to stay with and assist the affected person throughout the evacuation', 'Report both the evacuation and the medical emergency to emergency services so they can dispatch the right response', 'Pause the evacuation to manage the medical emergency first', 'Ask other guests to help with the medical emergency while staff manage the evacuation'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Evacuation continues regardless of a simultaneous medical emergency — fire is an immediate whole-venue threat. A dedicated staff member keeps the person safe within the evacuation. Emergency services need to know about both events to dispatch correctly.'),
  2, ARRAY['evacuation', 'medical-emergency', 'triage']),

(18, 34, 'descriptor_l3', 'Post-evacuation headcount shows two guests unaccounted for. Which THREE steps are immediate?',
  jsonb_build_object('prompt', 'Post-evacuation headcount shows two guests unaccounted for. Which THREE steps are immediate?',
    'descriptors', ARRAY['Report the discrepancy immediately to the chief warden and the emergency services incident controller', 'Provide the last known location of the missing guests based on your sweep or seating records', 'Keep all other guests and staff at the assembly point — do not allow anyone to re-enter to search', 'Re-enter the venue yourself to conduct a search', 'Wait 5 minutes to see if the guests appear at the assembly point before reporting'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Immediate reporting, providing last known location information, and maintaining assembly point discipline are the three correct responses — re-entering the venue and waiting before reporting both delay the emergency services response and add to the risk.'),
  2, ARRAY['evacuation', 'missing-persons', 'headcount']),

(18, 35, 'descriptor_l3', 'Training staff on emergency procedures. Which THREE elements must every drill include?',
  jsonb_build_object('prompt', 'Training staff on emergency procedures. Which THREE elements must every drill include?',
    'descriptors', ARRAY['Practical walk-through of exit routes so staff can navigate them in low visibility or under pressure', 'Each staff member practising their specific role — warden sweep, assembly point management, fire extinguisher use', 'A debrief after the drill to identify anything that did not go to plan and how to improve it', 'A written exam on emergency procedures to assess knowledge', 'A full simulation during a live service to test staff under real conditions'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Practical route familiarity, role-specific practice, and a post-drill debrief are the three elements that make a drill training rather than just a performance — written exams test recall, not execution, and live-service simulations create real risk.'),
  2, ARRAY['evacuation', 'training', 'drills']),

(18, 36, 'descriptor_l3', 'Your venue has multiple floors. Which THREE practices ensure safe multi-floor evacuation?',
  jsonb_build_object('prompt', 'Your venue has multiple floors. Which THREE practices ensure safe multi-floor evacuation?',
    'descriptors', ARRAY['Assign floor wardens for each level — evacuation cannot rely on a single warden covering multiple floors', 'Identify and brief staff on areas of refuge for guests with mobility issues on upper floors', 'Ensure all staff know which stairwells are designated evacuation routes — lifts are never used in a fire evacuation', 'Evacuate the ground floor first so upper floors have a clear path down', 'Use the lift to move mobility-impaired guests to the ground floor quickly'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Per-floor wardens, areas of refuge for mobility-impaired guests, and stairwell knowledge are the three multi-floor evacuation requirements — evacuation order is top-down in most procedures (not ground first), and lifts are explicitly prohibited in fire evacuations under Australian building codes.'),
  2, ARRAY['evacuation', 'multi-floor', 'warden'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 19: OPENING AND CLOSING PROCEDURES =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(19, 20, 'descriptor_l2', 'You arrive to open and find the alarm was triggered overnight. Which TWO steps are appropriate?',
  jsonb_build_object('prompt', 'You arrive to open and find the alarm was triggered overnight. Which TWO steps are correct?',
    'descriptors', ARRAY['Do not enter until the venue has been declared safe — contact your manager and follow the emergency protocol', 'Document the incident and report it to management before opening proceeds', 'Reset the alarm and open as normal — false alarms are common', 'Enter to check whether anything is missing before calling anyone', 'Open the venue immediately so you do not lose trading time'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Waiting for a safety clearance and documenting the incident are the two steps that protect staff and create a record — entering an unsecured venue or opening without incident reporting both expose staff and the business to real risk.'),
  2, ARRAY['opening', 'alarm', 'security']),

(19, 21, 'descriptor_l2', 'The opening cash float is incorrect when you count it. Which TWO actions do you take?',
  jsonb_build_object('prompt', 'The opening cash float is incorrect when you count it. Which TWO actions do you take?',
    'descriptors', ARRAY['Document the discrepancy immediately — exact amount, time, and who conducted the count', 'Notify your manager before opening so the discrepancy is on the record and can be investigated', 'Assume it was a counting error and start with what is there', 'Add your own money to make up the float difference', 'Open without a float and handle cash manually throughout the shift'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Documentation and manager notification before opening are non-negotiable — a discrepancy without a record creates ambiguity about when and how it occurred, and opening without resolving it embeds the error into the shift''s cash reconciliation.'),
  2, ARRAY['opening', 'cash', 'discrepancy']),

(19, 22, 'descriptor_l2', 'During opening checks, you find a product left unrefrigerated overnight. Which TWO actions apply?',
  jsonb_build_object('prompt', 'During opening checks, you find a product left unrefrigerated overnight. Which TWO actions apply?',
    'descriptors', ARRAY['Quarantine the product and do not use it until a Food Safety Supervisor has assessed it', 'Document the discovery in the food safety log — product, location, time found, and estimated time out of refrigeration', 'Return it to the fridge and use it if it still smells fine', 'Discard it immediately without telling anyone', 'Use it during the early part of service before it has been out long enough to matter'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Quarantine and documentation are the two correct FSANZ-aligned responses — both protect guests and create a record. Using it regardless and quiet disposal both either create food safety risk or hide information the business and inspectors need.'),
  2, ARRAY['opening', 'food-safety', 'temperature']),

(19, 23, 'descriptor_l2', 'A supplier arrives for delivery before you have completed opening checks. Which TWO responses balance both priorities?',
  jsonb_build_object('prompt', 'A supplier arrives for delivery before you have completed opening checks. Which TWO responses balance both priorities?',
    'descriptors', ARRAY['Complete the critical safety checks first — a brief delay to the supplier is acceptable', 'If another staff member is available, delegate the delivery to them while you continue opening checks', 'Accept the delivery immediately without checking it — opening checks can wait', 'Send the supplier away and reschedule the delivery for a better time', 'Accept the delivery and check it at end of opening'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Safety checks take precedence, and delegation to a second staff member resolves both priorities simultaneously — accepting without checking creates food safety risk, and rescheduling without reason damages supplier relationships unnecessarily.'),
  2, ARRAY['opening', 'delivery', 'prioritisation']),

(19, 24, 'descriptor_l2', 'During closing, a staff member wants to leave before procedures are complete. Which TWO responses are appropriate?',
  jsonb_build_object('prompt', 'During closing, a staff member wants to leave before procedures are complete. Which TWO responses are appropriate?',
    'descriptors', ARRAY['Explain clearly that closing procedures must be completed before anyone leaves — it is a compliance and safety requirement', 'If there is a genuine emergency, adjust task allocation so the remaining procedures are covered without that person', 'Let them go and cover their tasks yourself to avoid conflict', 'Tell them they will be disciplined immediately for asking', 'Complete only the tasks you have two people to cover and leave the rest'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'A clear explanation of the requirement and flexible task reallocation for genuine emergencies are the two professional responses — closing procedures are a compliance requirement, not optional, and covering for someone who just wants to leave early sets an unsustainable precedent.'),
  2, ARRAY['closing', 'staff-management', 'compliance']),

(19, 25, 'descriptor_l2', 'The end-of-night till reconciliation shows a discrepancy. Which TWO steps are immediate?',
  jsonb_build_object('prompt', 'The end-of-night till reconciliation shows a discrepancy. Which TWO steps are immediate?',
    'descriptors', ARRAY['Recount the till carefully before reporting — simple counting errors are the most common cause', 'Document the discrepancy fully and notify your manager before closing the register for the night', 'Ignore a small discrepancy — it will sort itself out across the week', 'Add your own cash to balance the till', 'Close the register and report it to the next shift manager tomorrow'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Recounting first eliminates the most common cause. Documenting and notifying your manager that same night ensures the record is created while all evidence is still intact — deferring to the next shift and ignoring small discrepancies both allow cumulative cash handling issues to go undetected.'),
  2, ARRAY['closing', 'cash', 'reconciliation']),

-- Module 19 L3

(19, 30, 'descriptor_l3', 'Opening after a public holiday with no handover notes from closing. Which THREE checks are most critical?',
  jsonb_build_object('prompt', 'Opening after a public holiday with no handover notes from closing. Which THREE checks are most critical?',
    'descriptors', ARRAY['Verify all refrigeration and storage temperatures — equipment can fail undetected over a closed period', 'Complete a thorough stock check — discrepancies after a closed period need to be noted before trading begins', 'Check that all safety systems are functioning — alarms, fire equipment, emergency lighting', 'Open immediately and address any issues as they arise during service', 'Call the closing manager to get a verbal handover before doing anything yourself'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Temperature check, stock verification, and safety system check are the three opening priorities when there has been a gap in operations — issues found after trading begins are harder to trace and may already have affected product or safety.'),
  2, ARRAY['opening', 'post-holiday', 'checks']),

(19, 31, 'descriptor_l3', 'Proper closing procedure at end of a high-volume Saturday night. Which THREE actions ensure safety and compliance?',
  jsonb_build_object('prompt', 'Proper closing procedure at end of a high-volume Saturday night. Which THREE actions ensure safety and compliance?',
    'descriptors', ARRAY['Complete the full cleaning checklist — high-volume nights leave surfaces and equipment that must be properly cleaned before the venue is sealed', 'Conduct a thorough check that no guests or staff remain in the venue before locking', 'Secure all cash, lock the safe, and ensure the alarm is set before the last person leaves', 'Close quickly and trust the opening manager to address any issues found in the morning', 'Skip the deep clean on a busy night — it can wait for a quieter session'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Full cleaning, guest/staff sweep, and cash and alarm security are the three closing requirements that matter most on a high-volume night — the busier the service, the more important the close, not the less.'),
  2, ARRAY['closing', 'high-volume', 'compliance']),

(19, 32, 'descriptor_l3', 'RSA obligations at close of service. Which THREE steps fulfil your legal duty?',
  jsonb_build_object('prompt', 'RSA obligations at close of service. Which THREE steps fulfil your legal duty?',
    'descriptors', ARRAY['Ensure all remaining guests are in a condition to leave safely — offer water and arrange transport for anyone who is intoxicated', 'Document any RSA refusals made during the shift before closing the record for the night', 'Confirm the venue is clear before locking — no guests should remain on the premises after close', 'Tell remaining guests the bar is closed and leave them to find their own way out', 'Serve a final round of non-alcoholic drinks to anyone still present to be hospitable'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Guest safety at departure, end-of-night RSA documentation, and venue clearance are the three legal RSA closing obligations — your duty of care extends until guests have safely left the premises, not just until the bar closes.'),
  2, ARRAY['closing', 'rsa', 'compliance']),

(19, 33, 'descriptor_l3', 'You cannot reconcile a closing cash discrepancy. Which THREE actions are correct?',
  jsonb_build_object('prompt', 'You cannot reconcile a closing cash discrepancy. Which THREE actions are correct?',
    'descriptors', ARRAY['Document the full details — amount, time, who counted, and what steps were taken to resolve it', 'Notify your manager that night — do not defer the report until the next business day', 'Secure the till as-is, with the discrepancy noted, rather than adjusting figures', 'Balance the till with your own money and report it as reconciled', 'Leave a note for the opening manager and lock up — it can be resolved in the morning'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Document, notify management immediately, and secure the till intact — these three preserve the integrity of the record and the evidence. Adjusting figures or deferring the report both obscure the audit trail and make investigation impossible.'),
  2, ARRAY['closing', 'cash', 'discrepancy']),

(19, 34, 'descriptor_l3', 'You open the venue and find signs of a break-in. Which THREE steps take priority?',
  jsonb_build_object('prompt', 'You open the venue and find signs of a break-in. Which THREE steps take priority?',
    'descriptors', ARRAY['Do not enter the venue — call the police immediately from outside', 'Contact your manager or venue owner as soon as the police have been notified', 'Preserve the scene — do not touch or move anything until police have assessed it', 'Enter to check what has been taken so you can give police an accurate report', 'Reset the alarm and open for service — the break-in happened overnight and the risk has passed'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Staying outside, notifying police and management, and preserving the scene are the three correct responses — entering the venue risks personal safety and destroys evidence. Opening for service before police have cleared the scene is never appropriate after a break-in.'),
  2, ARRAY['opening', 'security', 'break-in']),

(19, 35, 'descriptor_l3', 'A handover briefing from the closing manager to the opening team. Which THREE elements are most important to communicate?',
  jsonb_build_object('prompt', 'A handover briefing from the closing manager to the opening team. Which THREE elements are most important to communicate?',
    'descriptors', ARRAY['Any unresolved issues from the previous shift — maintenance faults, stock issues, or guest concerns', 'Staff and team notes — performance issues, injuries, or anything that affects today''s roster', 'Reservations and expected demand for the upcoming service period', 'A full inventory count so the opening team does not need to conduct their own', 'Personal opinions about how the previous shift performed'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Unresolved issues, staff notes, and upcoming service information are the three elements that give the opening team what they actually need to run the next service — a full inventory count is the opening team''s responsibility, and personal performance opinions belong in formal reviews, not handovers.'),
  2, ARRAY['opening', 'closing', 'handover']),

(19, 36, 'descriptor_l3', 'End-of-trade licensing obligations in your state. Which THREE records are legally required?',
  jsonb_build_object('prompt', 'End-of-trade licensing obligations in your state. Which THREE records are legally required?',
    'descriptors', ARRAY['A record of any RSA refusals made during the trade period — who was refused and the stated reason', 'Any incidents involving intoxicated patrons, including actions taken and who was notified', 'Documentation of the time the venue ceased serving alcohol relative to your licensed trading hours', 'A complete list of all drinks ordered during the session for licensing review', 'A signed statement from every staff member confirming they observed RSA obligations'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'RSA refusals, patron incidents, and cessation of alcohol service time are the three records that Australian state licensing authorities require at end of trade — a complete drinks list and staff declarations are not standard end-of-trade licensing requirements.'),
  2, ARRAY['closing', 'licensing', 'compliance'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;

-- ===== MODULE 20: INVENTORY AND WASTE CONTROL =====

INSERT INTO scenarios (module_id, scenario_index, scenario_type, prompt, content, difficulty, tags) VALUES

(20, 20, 'descriptor_l2', 'You discover stock is being consistently undercharged by a staff member. Which TWO actions are immediate?',
  jsonb_build_object('prompt', 'You discover stock is being consistently undercharged by a staff member. Which TWO actions are immediate?',
    'descriptors', ARRAY['Document the specific instances — dates, amounts, products, and the staff member involved — before taking any action', 'Report to your manager immediately so the response is managed at the appropriate level and through the right process', 'Confront the staff member directly in front of the team', 'Assume it is a system error and wait to see if it continues', 'Warn the staff member privately and give them a chance to fix it themselves'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Documentation and immediate manager escalation are the two correct responses — acting without evidence or confronting a staff member publicly both undermine a fair process. Undercharging is a potential theft issue and must be handled through proper channels.'),
  2, ARRAY['inventory', 'stock-control', 'theft']),

(20, 21, 'descriptor_l2', 'Weekly par levels show a spirit is running critically low mid-service. Which TWO responses are correct?',
  jsonb_build_object('prompt', 'Weekly par levels show a spirit is running critically low mid-service. Which TWO responses are correct?',
    'descriptors', ARRAY['Check backup storage immediately and move stock to the bar if available', 'If stock is unavailable, brief staff so they can recommend alternatives to guests naturally — do not wait until the product runs out', 'Continue serving without any communication and deal with it when it runs out', 'Tell guests the product is discontinued so they do not ask for it again', 'Order immediately from the supplier regardless of your venue''s ordering schedule'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Checking backup stock and proactively briefing staff on alternatives are the two actions that maintain service quality even when supply is strained — silence until the product runs out and misleading guests about availability both create poor guest experiences.'),
  2, ARRAY['inventory', 'par-levels', 'stock-management']),

(20, 22, 'descriptor_l2', 'A stock take shows a significant discrepancy in wine bottle counts. Which TWO steps investigate the cause?',
  jsonb_build_object('prompt', 'A stock take shows a significant discrepancy in wine bottle counts. Which TWO steps investigate the cause?',
    'descriptors', ARRAY['Recount the wine storage area carefully — a second count eliminates counting errors before assuming a more serious issue', 'Cross-reference the discrepancy against recent sales records, deliveries received, and any wastage logged', 'Assume theft and take immediate disciplinary action', 'Write off the discrepancy and adjust the expected count going forward', 'Ask all staff if they know where the missing bottles are'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Recounting and cross-referencing records are the two investigative steps that identify the actual cause — assuming theft without evidence leads to unfair treatment, and adjusting away the discrepancy hides a real operational or control problem.'),
  2, ARRAY['inventory', 'stock-take', 'discrepancy']),

(20, 23, 'descriptor_l2', 'A supplier delivery does not match the order in quantity or product. Which TWO actions are appropriate?',
  jsonb_build_object('prompt', 'A supplier delivery does not match the order in quantity or product. Which TWO actions are appropriate?',
    'descriptors', ARRAY['Record the discrepancy on the delivery docket before signing — never sign off on a delivery you haven''t verified', 'Contact the supplier immediately to arrange correction — short delivery or wrong product affects your par levels', 'Accept the delivery and send an email complaint next week', 'Refuse the entire delivery and send it back without keeping what was correct', 'Sign the delivery to keep the supplier relationship positive and sort it out later'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Documenting on the docket before signing and contacting the supplier immediately are the two actions that protect your business — signing off on an incorrect delivery forfeits your right to dispute it, and returning an entire delivery over a partial issue is disproportionate.'),
  2, ARRAY['inventory', 'delivery', 'supplier']),

(20, 24, 'descriptor_l2', 'Waste is significantly higher than expected this week. Which TWO actions identify the cause?',
  jsonb_build_object('prompt', 'Waste is significantly higher than expected this week. Which TWO actions identify the cause?',
    'descriptors', ARRAY['Review the wastage log in detail — look for patterns in what was wasted, when, and by whom', 'Compare against sales data to see whether high waste correlates with slow sales (over-ordering) or high service (over-pouring)', 'Accept it as normal variation and take no action', 'Discipline staff for poor performance before investigating the actual cause', 'Order less stock next week and see if waste drops naturally'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'Reviewing the wastage log and cross-referencing sales data are the two investigative actions that identify whether the cause is over-ordering, over-pouring, or something else entirely — acting before investigating leads to wrong conclusions.'),
  2, ARRAY['inventory', 'waste', 'investigation']),

(20, 25, 'descriptor_l2', 'A new staff member is not applying FIFO (first in, first out) when stocking. Which TWO responses address this?',
  jsonb_build_object('prompt', 'A new staff member is not applying FIFO (first in, first out) when stocking. Which TWO responses address this?',
    'descriptors', ARRAY['Explain FIFO clearly — what it is, why it matters, and show them the correct technique on the stock they are currently handling', 'Follow up in the next session to confirm they have applied it correctly and reinforce if needed', 'Write them up for a FIFO breach on their first offence', 'Do the stocking yourself rather than correcting their technique', 'Mention it briefly and assume they will look it up themselves'],
    'correctIndices', ARRAY[0, 1],
    'explanation', 'In-the-moment explanation and follow-up reinforcement are the two responses that actually build the habit — formal discipline for a training issue is disproportionate, and doing it yourself or a brief mention both fail to transfer the knowledge.'),
  2, ARRAY['inventory', 'fifo', 'training']),

-- Module 20 L3

(20, 30, 'descriptor_l3', 'Completing an accurate end-of-month stock take. Which THREE practices ensure accuracy?',
  jsonb_build_object('prompt', 'Completing an accurate end-of-month stock take. Which THREE practices ensure accuracy?',
    'descriptors', ARRAY['Count at a consistent time — before service opens, when the venue is quiet and stock levels are at their most static', 'Have two people count independently and then reconcile — a single count is prone to error', 'Count every location where stock is held, including behind the bar, dry storage, and cool rooms', 'Count only the high-value items — spirits and wine — to save time', 'Estimate any items that are difficult to access rather than counting them precisely'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Counting at a consistent quiet time, using two independent counters, and covering every stock location are the three practices that produce an accurate stock take — partial counts and estimates introduce errors that compound over multiple stock takes.'),
  2, ARRAY['inventory', 'stock-take', 'accuracy']),

(20, 31, 'descriptor_l3', 'A consistent variance between theoretical and actual usage is identified. Which THREE causes should you investigate?',
  jsonb_build_object('prompt', 'A consistent variance between theoretical and actual usage is identified. Which THREE causes should you investigate?',
    'descriptors', ARRAY['Over-pouring or inconsistent measures by staff — this is the most common cause of spirits variance', 'Unrecorded wastage — drinks made incorrectly and discarded without being logged', 'Unauthorised consumption — staff drinking product without authorisation or recording', 'Supplier short-delivery that was not recorded at the time of receipt', 'Normal variation — some variance is expected in a hospitality environment'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Over-pouring, unrecorded wastage, and unauthorised consumption are the three causes to investigate when variance is consistent and significant — supplier short-delivery should have been caught at receipt, and "normal variation" does not account for a consistent recurring variance.'),
  2, ARRAY['inventory', 'variance', 'investigation']),

(20, 32, 'descriptor_l3', 'Reducing waste without compromising service quality. Which THREE strategies are most effective?',
  jsonb_build_object('prompt', 'Reducing waste without compromising service quality. Which THREE strategies are most effective?',
    'descriptors', ARRAY['Use accurate par levels based on actual sales data — over-ordering is the most common driver of perishable waste', 'Train staff on correct portion and pour standards so product is not lost to over-serving', 'Implement a culture of waste logging so every discarded item is recorded and analysed', 'Order less of everything across the board to force efficiency', 'Use cheaper substitutes for products with high wastage rates'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Data-driven par levels, pour and portion training, and a waste-logging culture are the three strategies that reduce waste without affecting quality — blanket ordering cuts and cheap substitutes both compromise service quality rather than addressing the root cause of waste.'),
  2, ARRAY['inventory', 'waste', 'strategy']),

(20, 33, 'descriptor_l3', 'Receiving a large alcohol delivery. Which THREE quality control steps apply?',
  jsonb_build_object('prompt', 'Receiving a large alcohol delivery. Which THREE quality control steps apply?',
    'descriptors', ARRAY['Verify the delivery against the order — quantities, products, and prices must match before you sign', 'Inspect bottles for damage — broken seals, cracked bottles, or obvious tampering are grounds for rejection', 'Apply FIFO immediately — new stock goes behind existing stock, never in front', 'Sign the delivery docket first to keep the process moving and check later', 'Store new stock immediately to keep the delivery area clear before checking anything'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Order verification, physical inspection, and immediate FIFO application are the three quality control steps — signing before checking waives your right to dispute, and storing before inspecting means damaged or incorrect stock enters your inventory undetected.'),
  2, ARRAY['inventory', 'delivery', 'quality-control']),

(20, 34, 'descriptor_l3', 'A liquor licensing audit of your stock records. Which THREE record types must be accurate and available?',
  jsonb_build_object('prompt', 'A liquor licensing audit of your stock records. Which THREE record types must be accurate and available?',
    'descriptors', ARRAY['Purchase records — invoices and delivery dockets showing all alcohol received', 'Sales records — POS data or sales logs showing what was sold during the licensed period', 'Wastage and breakage records — what was lost and how it was recorded and written off', 'Staff personal spending accounts — drinks charged to employee tabs', 'Marketing spend on alcohol-related promotions'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Purchase records, sales records, and wastage records are the three stock-related document types a licensing inspector can request — together they allow an auditor to reconcile what came in, what was sold, and what was lost. Staff tabs and marketing spend are not primary stock audit documents.'),
  2, ARRAY['inventory', 'licensing', 'audit']),

(20, 35, 'descriptor_l3', 'Implementing FIFO in a busy bar. Which THREE practical steps ensure staff follow it?',
  jsonb_build_object('prompt', 'Implementing FIFO in a busy bar. Which THREE practical steps ensure staff follow it?',
    'descriptors', ARRAY['Label shelves and fridge sections clearly — new stock on the right or back, old stock on the left or front', 'Train every staff member on FIFO at induction and reinforce it whenever new stock is received', 'Include FIFO compliance in regular stock audits so it is consistently checked, not assumed', 'Trust experienced staff to apply it without checking — they have been doing it for years', 'Only apply FIFO to perishables — spirits and wine last long enough that rotation does not matter'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Clear labelling, consistent training, and audit inclusion are the three practical steps that make FIFO a real habit rather than a policy on paper — trusting experience without checking and limiting FIFO to perishables both create the conditions for stock rotation failures.'),
  2, ARRAY['inventory', 'fifo', 'implementation']),

(20, 36, 'descriptor_l3', 'A significant stock discrepancy raises suspicion of theft. Which THREE steps are appropriate?',
  jsonb_build_object('prompt', 'A significant stock discrepancy raises suspicion of theft. Which THREE steps are appropriate?',
    'descriptors', ARRAY['Document all evidence thoroughly before taking any action — amounts, dates, stock-take records, and any other relevant data', 'Report to management immediately — theft investigations must be handled at the right level, not by floor staff alone', 'Ensure the investigation follows your venue''s HR process and relevant employment law before any disciplinary action', 'Confront the staff member you suspect directly to give them a chance to explain', 'Increase your own monitoring of the suspected staff member without telling management'],
    'correctIndices', ARRAY[0, 1, 2],
    'explanation', 'Documentation, management escalation, and following formal HR and legal process are the three responses that protect both the venue and the employee''s rights — direct confrontation and covert personal monitoring both bypass the processes that make a theft finding defensible and lawful.'),
  2, ARRAY['inventory', 'theft', 'investigation'])

ON CONFLICT (module_id, scenario_index) DO NOTHING;
