# Launch check (Phase 13)

What's left before the Rich update goes to `main` and marketing spend starts. Built and checked by Claude Code on 2026-10-20. Everything below the first section is yours to do or decide.

## Done in this phase

- **Privacy policy** (web and mobile, now both dated 20 October 2026): Live Guest replies and the guest's answers are listed as training data, kept with the result and deleted with the account; managers see the score and result, not what was typed. OpenAI is listed for Live Guest, venue content drafting, AI coaching and translation. Shift days are listed. The mobile copy had fallen behind the web one (it was dated 25 September); both now say the same about AI.
- **Security page:** the AI section now describes Live Guest (the guest's brief and the replies, no names) and venue content (the item's name and details only). To keep that true, the venue's name was taken out of the venue content prompt.
- **Taster conversation:** anyone not on a venue plan (Pro, free, lapsed) gets one free conversation with **Sharon, the cold parmy** (`cold-parmy`), the guest with all four dials in play in the most familiar pub complaint. One start per person, checked on the server; the picker says so and shows her as the one open guest. To pick a different guest, change `TASTER_GUEST_ID` in `lib/live-guest/taster.ts` (a test checks it's a reviewed guest with every dial).
- **Marketing copy that was wrong:** Pro no longer says "scenario training" (Pro doesn't get Live Guest); "AI Scenario Simulators" is now "Live Guest" on the home page; the platform page's "Scenario Training" item is Live Guest and its "Live Scenarios" link is "What's inside"; "rapid-fire" is "mixed drills" in the menu, the plan card and the comparison table; the complaint demo no longer mentions a Live Scenarios leaderboard that doesn't exist.
- **Measures:** three new queries in `supabase/queries/learning.sql`: venue content per venue (7), drills per week by kind (8) and pre-shift drills per week (9). Query 8 needs the pre-shift migration first.

## Run before checking

| Migration | Status |
|---|---|
| `20261023_mixed_drills.sql` | Run (confirmed 2026-10-20) |
| `20261024_venue_content.sql` | Run (the tables are there) |
| `20261025_preshift_streak.sql` | **To run** |

## Decisions for you

1. **"Five service dimensions."** The home page ("Every answer is scored on five service dimensions", and "Every session scored across 5 service dimensions") and the vs-generic-lms page say this. It described the retired Scenario Training. Live Guest shows the guest's mood and three dials (speed, safety, money), with a score out of 100. It's a locked claim, so it needs your wording. A suggestion: "Every conversation shows how the guest felt at each turn, and what it did to speed, safety and money."
2. **"Role-Based Learning Paths"** on the platform page says each role gets a targeted pathway. That isn't built (it's the major update on the to-do list). Remove it, or reword it as what exists today.
3. **The taster guest.** Sharon (cold parmy) unless you'd rather another after testing.
4. **The "Live Guest moment" in the pre-shift drill** is a link at the end, not a conversation inside the drill, so the drill costs nothing in AI. Keep it, or build a one-reply guest inside the drill.
5. **Reminders and push (Phase 12, part 2).** Needs a VAPID key pair you create and add to Cloudflare as secrets, and the cron job running daily. Say when, and Claude Code will give you the steps.
6. **Menu photos (Phase 11, part 2).** Build before launch, or after.

## Your end-to-end check

On the preview, on your phone and on desktop. Tick as you go.

**As staff, on a venue plan**
- [ ] Skill check, then open a module: Learn cards, then the quiz in its new formats. Master one.
- [ ] Test out of a module you know.
- [ ] Mixed Drill (desktop menu, mobile Learn hub). Start a second and check no question repeats.
- [ ] Mobile Home: "Ready for your shift?" Finish it; set your shift days; see the streak on Home.
- [ ] Live Guest: three guests from different areas, one of them suggested. Read the reveal and the dials.
- [ ] A question from venue content in a drill (after the manager steps below).

**As a manager**
- [ ] Venue Content: add a real cocktail spec with measures, a special with a price and an 86'd item with an alternative. Judge the drafted questions; approve some, reject one, draft one again, take one down.
- [ ] Overview and Staff: the training you did as staff shows up. Live Guest passes count in the service score.

**As a Pro or free user**
- [ ] Live Guest shows the venue plan prompt and Sharon as the one free conversation. After it, she's closed too.
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
