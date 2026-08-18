// Arena (AI Arena / Live Arena) roleplay scenario content — situation /
// context / task triples keyed by module id, for modules 1-20 only. This is
// the same content `ArenaPage.tsx` (desktop) previously kept as a private
// inline `ARENA_SEED_SCENARIOS` const; extracted here 2026-08-19 so mobile's
// `ArenaScreen`/`ScenarioTrainingScreen` can link into a real per-module
// scenario instead of only ever offering the one hardcoded "Wine Cork
// Complaint" scenario (module 11). Desktop's `ArenaPage.tsx` now imports
// from here too — one copy, two call sites, per CLAUDE.md's "do not expand
// duplication, migrate toward canonical when touching these files" rule for
// scenario content. Modules 21-40 have no Arena roleplay content yet (V3
// never built it for the newer modules either) — callers must handle a
// missing lookup, not assume every module id is present.
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
};

/** Formats a seed scenario into the single scenario string the Arena evaluate API expects. */
export function formatArenaScenario(seed: ArenaSeedScenario): string {
  return `Situation: ${seed.situation}\nContext: ${seed.context}\nTask: ${seed.task}`;
}
