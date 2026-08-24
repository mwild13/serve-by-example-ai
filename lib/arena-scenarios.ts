// Arena (AI Arena / Live Arena) roleplay scenario content — situation /
// context / task triples keyed by module id, for all 40 modules. Modules
// 1-20 are the content `ArenaPage.tsx` (desktop) previously kept as a
// private inline `ARENA_SEED_SCENARIOS` const; extracted here 2026-08-19 so
// mobile's `ArenaScreen`/`ScenarioTrainingScreen` can link into a real
// per-module scenario instead of only ever offering the one hardcoded
// "Wine Cork Complaint" scenario (module 11). Desktop's `ArenaPage.tsx` now
// imports from here too — one copy, two call sites, per CLAUDE.md's "do not
// expand duplication, migrate toward canonical when touching these files"
// rule for scenario content.
//
// Modules 21-40 (2026-08-19): written fresh against the real module
// catalog in lib/module-navigator.ts (title/description/category per
// module — modules 21-40 never had Arena content in V3 or V4 before this).
// Same situation/context/task shape and Australian-hospitality voice as
// 1-20, one scenario per module, matched to that module's actual subject
// rather than a generic reuse. Callers should still treat this as a lookup
// that can miss (defensive, not because a gap is expected anymore) rather
// than assume every 1-40 module id is guaranteed present.
//
// `lib/verify-questions.ts` (True/False quiz bank) and
// `app/dashboard/_components/trainer/trainer-data.ts` (Stage 4 descriptor
// scenarios) are separate scenario stores for different scenario types —
// out of scope for this extraction, not touched.

export type ArenaSeedScenario = {
  situation: string;
  context: string;
  task: string;
};

export const ARENA_SEED_SCENARIOS: Record<number, ArenaSeedScenario> = {
  1: { situation: "A guest sends back a schooner of draught, complaining it's 'mostly head and tastes flat.' You notice the glass feels warm to the touch.",
       context: "The pub is packed and you are mid-rush.",
       task: "Explain how you fix the drink and handle the guest professionally." },
  2: { situation: "A guest says: 'I usually like a heavy red, something like a Cabernet, but I want to try an Australian Shiraz. Is the one from the Barossa very different?'",
       context: "A couple is looking at the wine list. One is a confident heavy-red drinker curious about local varietals.",
       task: "Explain the profile difference and make a confident recommendation." },
  3: { situation: "A guest yells over the music: 'I want something sweet but strong, not too fruity, maybe with gin? But I hate tonic. Just make me something good!'",
       context: "It is 9 PM on a Saturday, the bar is three-deep, and a rowdy hens party has arrived.",
       task: "Describe what you recommend and how you handle this efficiently." },
  4: { situation: "A customer shouts their order over the grinder: 'Can I get a large skinny cap, extra hot, and a flat white on soy?'",
       context: "It is the 8 AM weekday rush and you already have five dockets on the machine.",
       task: "Explain how you confirm the order and manage the queue professionally." },
  5: { situation: "You are clearing a large table with heavy schooner glasses, wine glasses, and a half-full water jug. A guest tries to help by handing you a stack of unstable plates while you are mid-lift.",
       context: "The bistro is busy and your load is already at safe capacity.",
       task: "Describe how you respond to protect your load while keeping the guest feeling appreciated." },
  6: { situation: "While clearing the floor, you notice a broken glass and a spilled drink near the high-traffic entrance to the toilets.",
       context: "You are the only staff member on the floor and you have three drinks in your hand.",
       task: "Explain your immediate actions to secure the hazard and protect guest safety." },
  7: { situation: "The bartender yells that they are out of clean schooner glasses and the ice bin is empty.",
       context: "The main bar is getting slammed and you are currently restocking the coolroom.",
       task: "Explain how you prioritise your next 60 seconds and why." },
  8: { situation: "A local regular and a group of tourists who look lost arrive at the bar at the same time.",
       context: "You are mid-pour on a Guinness and cannot leave your station.",
       task: "Describe exactly how you acknowledge both parties within three seconds without abandoning your pour." },
  9: { situation: "Two guests at a table of eight are ready to order, but the other six are deep in conversation with their menus closed.",
       context: "The kitchen closes in 15 minutes.",
       task: "Explain how you move the table along professionally without making anyone feel rushed." },
  10: { situation: "You notice a guest in the lounge has just finished their Shiraz and is looking around the room for staff.",
        context: "You are currently heading to the bistro with another table's order.",
        task: "Describe how you handle this check-in without dropping your current task." },
  11: { situation: "A guest pushes to the front of the bar: 'Mate, we ordered our parmys 45 minutes ago. Those guys next to us sat down after we did and they are already eating. What is going on?'",
        context: "It is a busy Sunday session and the bistro is slammed.",
        task: "Explain how you empathise, investigate, and resolve this without blaming the kitchen in front of the guest." },
  12: { situation: "A guest asks: 'What lagers do you have on tap?'",
        context: "You have a standard house pour and a premium local craft lager that was just tapped, costing $2 more.",
        task: "Explain how you steer them toward the premium option naturally and without being pushy." },
  13: { situation: "A VIP regular who always spends big arrives without a booking: 'Hey, I am here for my usual booth. You know I always sit there.'",
        context: "It is a fully committed Saturday night and their usual booth is occupied by a family.",
        task: "Explain how you protect the seated guests while retaining the VIP's goodwill." },
  14: { situation: "The phone rings during the lunch rush. A guest wants to book a table for twenty people tonight.",
        context: "Your system shows you are already at full capacity for tonight.",
        task: "Explain how you deliver the bad news warmly and protect the relationship for a future booking." },
  15: { situation: "It is Friday night, 11:30 PM. A regular stumbles up, leaning heavily against the counter. He slaps a $50 note down: 'Mate, just give us one more schooner of New and a shot of JD. I am fine, I promise.'",
        context: "The guest is clearly intoxicated and other patrons are watching.",
        task: "Explain how you refuse service firmly and compassionately in compliance with RSA, without escalating or humiliating the guest." },
  16: { situation: "You are about to run a tray of food when you notice the Gluten Free burger is on the same plate as a regular bun.",
        context: "The guest is a known coeliac and the food is about to leave the pass.",
        task: "Explain what you say to the kitchen and how you manage the guest's wait without alarming them." },
  17: { situation: "A group in the TAB area are getting loud, swearing, and leaning over other patrons' tables.",
        context: "Other guests are visibly uncomfortable. You have approached to settle them down.",
        task: "Explain your approach to de-escalate without confrontation and protect the comfort of surrounding guests." },
  18: { situation: "The fire alarm starts ringing during a busy Friday night service.",
        context: "Patrons are confused, some are trying to finish their drinks, others are heading back for their bags.",
        task: "Explain how you take command of the room calmly and direct all guests to the exit without creating panic." },
  19: { situation: "You have just completed the final till count at 2 AM and you are $100 short.",
        context: "Your lift home is waiting outside and the alarm needs to be set.",
        task: "Explain the correct protocol you follow before leaving, and why skipping it is not an option." },
  20: { situation: "You notice a co-worker is consistently over-pouring spirits and forgetting to ring up staff drinks for their mates.",
        context: "This has been happening repeatedly and is hitting the venue's gross profit.",
        task: "Explain how you address this (whether directly with the co-worker or by escalating to management) and why." },
  21: { situation: "You're carrying a full tray of hot bowls through a narrow service corridor when a food runner steps backward out of the kitchen door directly into your path without looking.",
        context: "The corridor is barely one person wide and staff are crossing through it constantly during service.",
        task: "Explain what you should have called out before entering the corridor, and how you avoid a collision now." },
  22: { situation: "You hear a crunch and realise a schooner glass has just shattered into the ice well at the bar.",
        context: "The bar is three-deep with guests and another bartender is about to scoop from that same well for a waiting round.",
        task: "Explain the Burn Protocol you follow immediately, and what you say to stop your colleague scooping from that well." },
  23: { situation: "From across the room you clock a guest's hand half-raised, an empty glass at another table, and a diner glancing around for the bill — all within a few seconds of each other.",
        context: "You're mid-way through delivering a tray to a different table and can't reach all three at once.",
        task: "Explain how you prioritise and acknowledge each guest so nobody feels ignored." },
  24: { situation: "A new casual staff member reaches into the ice well with a schooner glass to scoop ice because they can't find the scoop.",
        context: "You're the senior bartender on shift and notice this mid-rush.",
        task: "Explain what you say to them on the spot, and why this matters beyond 'it's just the rule.'" },
  25: { situation: "A guest tells you they have a severe shellfish allergy while ordering a seafood linguine that's normally finished with a prawn garnish.",
        context: "The kitchen is slammed and dockets are already backed up on the pass.",
        task: "Explain exactly how you mark this on the ticket and communicate it to the kitchen so it can't be missed." },
  26: { situation: "Mid-rush, you go to pour a lemon squash and the soda gun sputters out warm, flat liquid instead of soda water.",
        context: "There's a queue three-deep at the bar waiting on drinks.",
        task: "Explain what's likely wrong and the exact steps you take to fix it without holding up the line." },
  27: { situation: "You're building three cocktails at once during a rush and keep walking back to the fridge for garnishes one at a time.",
        context: "A senior bartender pulls you aside afterward and says you're 'all speed, no economy.'",
        task: "Explain what economy of motion means here and how you'd restructure your movements to fix it." },
  28: { situation: "It's the lull between lunch and dinner service — citrus wedges are running low, the ice well is half empty, and glassware is scattered across the bar.",
        context: "You have roughly ten quiet minutes before the dinner rush hits.",
        task: "Explain how you use this window and in what order you reload your station." },
  29: { situation: "A docket prints with 'M/R,' 'G/F,' and '86 chips' all on the same ticket, and you're still new to reading kitchen shorthand.",
        context: "The chef calls out 'who's got table 12?' and needs the ticket relayed accurately right now.",
        task: "Explain what each abbreviation means and how you prioritise this ticket." },
  30: { situation: "You have six tickets stacked on the pass, two tables waving for attention, and the printer just spat out two more orders.",
        context: "You feel your focus starting to scatter and your heart rate spiking.",
        task: "Explain the mental approach and physical order of operations you use to work through this without dropping anything." },
  31: { situation: "You notice a fellow bartender free-pouring spirits without a jigger, consistently overpouring by what looks like 10-15ml per drink.",
        context: "The venue's numbers have shown unexplained liquor cost shrinkage over the past two months.",
        task: "Explain why this matters financially and legally, and how you'd raise it." },
  32: { situation: "A guest orders a $180 bottle of red and watches closely as you go to open it table-side.",
        context: "You've only practiced the two-step lever technique a handful of times and your hands are slightly unsteady.",
        task: "Explain the correct step-by-step technique you use to open and present the bottle confidently." },
  33: { situation: "Mid-service, the lager tap starts gurgling and spitting foam instead of a clean pour.",
        context: "You're the only one who can access the cellar right now and the bar queue is building.",
        task: "Explain how you diagnose whether it's an empty keg, a gas issue, or air in the line, and what you do to fix it." },
  34: { situation: "You need to clear a table of twelve empty glasses in one trip during a packed Friday night.",
        context: "The venue expects fast turnover and there's no time for multiple trips back to the table.",
        task: "Explain the technique you use to carry this load safely without touching the rims." },
  35: { situation: "It's closing time and you're keen to get out, but the coffee machine still needs purging, the speed rail needs sanitising, and the dry store is a mess from the rush.",
        context: "You're the closing shift lead and the morning team relies on how you leave the venue.",
        task: "Explain the closing routine you follow and why cutting corners here creates problems for tomorrow." },
  36: { situation: "You've just delivered a table's mains, and a couple of minutes later you notice one guest hasn't touched their steak after a single bite.",
        context: "You're about to move on to another table but something about their expression seems off.",
        task: "Explain when and how you check back in, and what you say." },
  37: { situation: "A guest orders the barramundi, but the kitchen has just told you it's sold out for the night.",
        context: "The guest has already told the rest of their table how excited they were for this specific dish.",
        task: "Explain how you deliver this news and pivot them toward an alternative they'll be happy with." },
  38: { situation: "A table has finished their entrees — empty plates, a used napkin, and a dead soldier (empty bottle) cluttering the table — while they wait on mains.",
        context: "You're walking past on your way to another section.",
        task: "Explain how you clear this without interrupting their conversation or making it feel intrusive." },
  39: { situation: "The bartender is slammed and about to run out of ice but hasn't asked for a restock yet.",
        context: "You're the bar back and can see the ice well getting low from where you're standing.",
        task: "Explain how you anticipate and act on this before it becomes a problem, without getting in the bartender's way." },
  40: { situation: "A guest orders a basic bourbon and cola.",
        context: "The venue stocks a premium small-batch bourbon at a $4 upcharge that pairs well with what they ordered.",
        task: "Explain how you suggest the upgrade in a way that feels like genuine care, not a sales pitch." },
};

/** Formats a seed scenario into the single scenario string the Arena evaluate API expects. */
export function formatArenaScenario(seed: ArenaSeedScenario): string {
  return `Situation: ${seed.situation}\nContext: ${seed.context}\nTask: ${seed.task}`;
}
