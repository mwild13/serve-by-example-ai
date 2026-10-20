# Launch check (Phase 13)

What's left before the Rich update goes to `main` and marketing spend starts. Built and checked by Claude Code on 2026-10-20. Everything below the first section is yours to do or decide.

## Done in this phase

- **Privacy policy** (web and mobile, now both dated 20 October 2026): Live Guest replies and the guest's answers are listed as training data, kept with the result and deleted with the account; managers see the score and result, not what was typed. OpenAI is listed for Live Guest, venue content drafting, AI coaching and translation. Shift days are listed. The mobile copy had fallen behind the web one (it was dated 25 September); both now say the same about AI.
- **Security page:** the AI section now describes Live Guest (the guest's brief and the replies, no names) and venue content (the item's name and details only). To keep that true, the venue's name was taken out of the venue content prompt.
- **Taster conversation:** anyone not on a venue plan (Pro, free, lapsed) gets one free conversation with **Dan** (`stacked-glasses`): Friday, 10pm, a packed pub, a footy team stacking schooners to help. Every publican knows him, he's friendly, so a first try can go well, and the speed and safety dials both move. One start per person, checked on the server; the picker says so and shows him as the one open guest. To pick a different guest, change `TASTER_GUEST_ID` in `lib/live-guest/taster.ts` (a test checks it's a reviewed, gentle guest).
- **Marketing copy that was wrong:** Pro no longer says "scenario training" (Pro doesn't get Live Guest); "AI Scenario Simulators" is now "Live Guest" on the home page; the platform page's "Scenario Training" item is Live Guest and its "Live Scenarios" link is "What's inside"; "rapid-fire" is "mixed drills" in the menu, the plan card and the comparison table; the complaint demo no longer mentions a Live Scenarios leaderboard that doesn't exist.
- **Measures:** three new queries in `supabase/queries/learning.sql`: venue content per venue (7), drills per week by kind (8) and pre-shift drills per week (9). Query 8 needs the pre-shift migration first.

## Run before checking

| Migration | Status |
|---|---|
| `20261023_mixed_drills.sql` | Run (confirmed 2026-10-20) |
| `20261024_venue_content.sql` | Run (the tables are there) |
| `20261025_preshift_streak.sql` and `20261026_push_reminders.sql` | Run (confirmed 2026-10-20) |
| `20261027_live_guest_voice.sql` | Run (confirmed 2026-10-20) |
| `20261028_saturday_rush.sql` | **To run** (saving shifts and the best score; the game plays before it) |

## Decisions (made by Claude Code at the owner's request, 2026-10-20)

1. **"Five service dimensions"** is gone from the home page, vs-generic-lms and how-it-works, which described the retired Scenario Training. They now say what Live Guest shows: the guest's mood at each turn, and what each reply did to speed, safety and money, with a score out of 100. The complaint demo keeps its five dimensions, because the demo really scores them.
2. **"Role-Based Learning Paths"** on the platform page (not built) is replaced by **"Your Menu, Your Questions"**: venue content, which is built and is what a publican will want to hear.
3. **The taster guest** is Dan (above), the owner's suggestion.
4. **The Live Guest moment in the pre-shift drill** stays a link at the end. Three minutes before a shift is for quick questions; a conversation takes longer and costs an AI call.
5. **Reminders and push** are built (Phase 12, part 2). To switch them on: run `node scripts/vapid-keys.mjs` in the project folder, add the two values to Cloudflare as secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_JWK`, Production and Preview), then run the push migration.
6. **Menu photos** are built before launch (Phase 11, part 2): publicans already have a printed menu, and a photo is faster than typing every spec.

## Your end-to-end check

On the preview, on your phone and on desktop. Tick as you go.

**As staff, on a venue plan**
- [ ] Skill check, then open a module: Learn cards, then the quiz in its new formats. Master one.
- [ ] Test out of a module you know.
- [ ] Mixed Drill (desktop menu, mobile Learn hub). Start a second and check no question repeats.
- [ ] Mobile Home: "Ready for your shift?" Finish it; set your shift days; see the streak on Home.
- [ ] On the installed app, pick a reminder time a little ahead and check the notification arrives and opens the drill.
- [ ] Live Guest: three guests from different areas, one of them suggested. Read the reveal and the dials.
- [ ] Saturday Rush (desktop menu, mobile Learn hub): play two shifts. Let the ice run out once, call the bar-back once. Read the debrief. Check every moment in `saturday-rush-moments.md`.
- [ ] Live Guest voice, on your phone in a noisy bar: turn Voice on, hear the guest, tap Speak, check what's written, send. Try it with the music up.
- [ ] A question from venue content in a drill (after the manager steps below).

**As a manager**
- [ ] Venue Content: photograph your cocktail list and tick a few items. Then type a real cocktail spec with measures, a special with a price and an 86'd item with an alternative. Judge the drafted questions; approve some, reject one, draft one again, take one down.
- [ ] Overview and Staff: the training you did as staff shows up. Live Guest passes count in the service score.

**As a Pro or free user**
- [ ] Live Guest shows the venue plan prompt and Dan as the one free conversation. After it, he's closed too.
- [ ] Mixed Drill and modules work as before.

**Public pages**
- [ ] Home, platform, pricing, privacy and security read right.

## The human test (decided 2026-10-19)

One person, after your check: a venue manager or a staff member who hasn't seen it. Ask them to do the staff list above in one sitting without help, then ask:
1. Did anything feel repetitive?
2. Which part would you open before a shift?
3. Did the Live Guest feel like a real guest?
4. Anything confusing or broken?

**Done when** you're happy and the human test doesn't find it repetitive. Then the update goes to `main`, and marketing spend can start.
