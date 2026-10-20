# Handoff: The Rich Update (October 2026)

The staff learning upgrade, named after Richie, our first tester, who called training repetitive. The plan, the research and every decision are in `LEARNING_UPGRADE_RESEARCH.md`, and the measures in `LEARNING_METRICS.md`. All three files live in `docs/Rich Update/`; every new document for this update goes there too. This file records what has been done, phase by phase. Other open items are in `To_do_list.md`.

- **Branch:** `preview/rich-update`, created from `main` at `069b535`.
- **Save point before any change:** the tag `pre-learning-upgrade` (`069b535`). `git checkout pre-learning-upgrade` shows the code as it was.
- **Aim:** the last product update before paid marketing starts. About 10 to 12 weeks to launch.

## Where we are

| # | Phase | Status |
|---|---|---|
| 1 | Groundwork: measures and event tracking | Done 2026-10-19 |
| 2 | Question engine | Done 2026-10-19, on `main` (`a095129`) |
| 3 | Writing and reviewing the questions | Done 2026-10-19 |
| 4 | Learn cards (text) | Done 2026-10-19 |
| 5 | Skill check and test-out | Done 2026-10-19 |
| 6 | Live Guest conversation (text) | Done 2026-10-19 |
| 7 | Guest briefs, four dials and difficulty | Done 2026-10-20 |
| 8 | Plans, manager score and retiring the old screens | Done 2026-10-20 |
| 9 | Image style and library | Parked 2026-10-20: the owner draws the parts in Claude Design later |
| 10 | Mixed drills | Done 2026-10-20 |
| 11 | Venue content | Built 2026-10-20, menu photos included, for the owner to check |
| 12 | Pre-shift drill and shift streak | Built 2026-10-20, reminders included, for the owner to check; reminders send once the VAPID keys are in Cloudflare |
| 13 | Launch check, then marketing spend starts | Claude Code's part done 2026-10-20; the owner's check and the human test are next (`launch-check.md`) |
| 14 | Live Guest voice | After marketing starts |
| 15 | Saturday Rush | After marketing starts |
| 16 | Team features | After marketing starts |

## Decisions (2026-10-19)

- Three levels: **Learn** (modules on the new question engine), **Drill** (mixed practice, venue content, pre-shift drill), **Live Guest** (the headline feature).
- Scenario Training and the AI Arena are retired as screens. Their 80 scenarios become Live Guest's guests, and their data is kept.
- The four dials (Guest, Speed, Money, Safety) live inside Live Guest.
- Live Guest is text first; voice comes after marketing starts.
- Live Guest is on Boutique, Commercial and Enterprise, venue trials and sponsored staff. Not on Pro. Pro and free users get one taster conversation, which is chosen in Phase 13.
- The question review is its own phase, done by the owner.
- No mock-ups. The owner is the expert and checks the real screens as each phase ships. One human test runs once the whole update is done (decided 2026-10-19).
- Images are their own phase, after the questions: one illustration style built from parts, AI-drafted, corrected as SVG and checked by the owner. No illustrator.
- The venue manager approves every AI-drafted venue question before staff see it.

## Phase 1: groundwork

- **Date:** 2026-10-19
- **Branch:** `preview/rich-update`. Not pushed yet.
- **Migration:** none.

### What was done

- **No new tracking code.** The plan said "add events", but the database already records what the measures need: `verify_attempts` has every quiz run with its status, and `training_activity_daily` has one row per person per day trained (filled by triggers). A separate events table would have duplicated them.
- **`supabase/queries/learning.sql`:** four read-only queries in the same style as `funnel.sql`. Quiz runs finished, days trained per active person, still training in week 4, and the training mix.
- **`LEARNING_METRICS.md`:** what each number means, and the baseline taken on 2026-10-19 from production. `docs/FUNNEL_METRICS.md` points to it.
- **Plan updated** with the last two decisions and how Phase 1 went.
- **All the update's documents moved to `docs/Rich Update/`**, so they're easy to find.

### The baseline (2026-10-19)

| Number | Today |
|---|---|
| Quiz runs finished | 11 of 22 (50%) |
| Days trained per active person | 1.0 to 1.25 a week, 1 to 4 active people a week |
| Still training in week 4 | Nobody has reached week 4 yet |
| All-time training mix | 98 quiz answers, 13 quizzes passed, 9 Scenario Training attempts, 5 AI Arena attempts |

The sample is tiny and includes our own test accounts. It's a starting point to compare against, not a benchmark.

### Still to do from Phase 1

- Live Guest's measure is added in Phase 6, and venue content's in Phase 11, once those features write their own rows.

## Phase 2: question engine

- **Date:** 2026-10-19
- **Branch:** `preview/rich-update`. Not pushed yet.
- **Migration:** `supabase/migrations/20261020_question_engine.sql` (rollback in `supabase/rollbacks/`). It only adds things, so it can run before the code goes live. **Run on production 2026-10-19.**

### What was done

- **Six formats plus True/False:** best line, choose one, put in order, spot the mistake, a number, and which glass. Every question has a format, a difficulty and the fact it tests. They are graded on the server one answer at a time, and the answer key stays in server-only code (`lib/question-bank.ts`).
- **The server plans each run** and sends one question at a time, not the whole list. A run asks each fact once, with easier questions first, and covers every format the module has.
- **New mastery rule:** 6 right in at least 3 question types. A question answered right doesn't come back. A wrong one comes back 2 questions later in another form, and must be answered right before the run can pass. The 3rd miss ends the run.
- **Every module still works:** the 320 True/False statements are the starting bank (the plan said 296, but there are 8 in each of 40 modules). A module with only True/False passes on 6 right out of 8, because it can't offer 3 types yet. Phase 3 adds the other types.
- **Mastered modules stay mastered.** Nothing in the new engine clears a pass.
- **The picture formats** are built and switched off until Phase 9.
- **One quiz screen for both surfaces:**
  - `components/quiz/QuizRun.tsx` serves desktop and mobile, with a light and a dark theme.
  - Desktop keys: T and F, 1 to 4 for options, Enter for the next question.
  - Steps are put in order with up and down buttons, 44px targets, not by dragging.
  - `RapidFireQuiz.tsx` and its old styles are deleted.
- **Beer Pouring sample questions:** 9 questions written only from the module's own statements, in `lib/questions/module-01.ts`. Approved by the owner on 2026-10-19 and switched on: see `module-01-questions.md` in this folder. They are the first real test of the formats, and a model for Phase 3.

### Checked

- **Tests:** 131 pass, 24 of them for the quiz. They cover:
  - run planning and format coverage
  - wrong answers coming back
  - the third miss and running out of questions
  - grading each format and refusing wrong shapes
  - that the browser never gets an answer
  - every real module
- **Checks:** `tsc`, `eslint`, `knip`, the CSS checks and `next build` pass.
- **The migration ran on production inside a transaction that was rolled back.** Inside it, a test run:
  - accepted the first answer
  - refused a second answer at the same position
  - mastered the module on the passing answer
  - counted the answers in `training_activity_daily`

  Afterwards neither the column nor the function existed.
- **Owner test on the preview, 2026-10-19:** desktop and phone, every question type, wrong answers coming back, passing and the third miss. Nothing to change.
- **Not checked yet:** the mobile e2e screenshots, whose quiz baselines will need retaking.

### Release order

1. Done 2026-10-19: the owner approved all nine Beer Pouring questions as written.
2. Done 2026-10-19: `20261020_question_engine.sql` run on production.
3. Done 2026-10-19: pushed to `preview/rich-update`. The owner tested every question type on desktop and phone, and nothing needed changing.
4. Done 2026-10-19: released to `main` (`a095129`), after CI passed on the same commit.
5. Later cleanup, once the new quiz has been live a while: drop `advance_verify_attempt()` and `verify_attempts.question_order`.

**A quiz open at release time ends.** Anyone mid-quiz when the new code goes live sees "This quiz has ended. Please start again." Runs last 20 minutes at most, so this only affects a quiz open at that moment.

## Phase 3: writing and reviewing the questions

- **Started:** 2026-10-19. Bartending first, as recommended. The owner said to go ahead with it.
- **Batches:** Bartending is split into two batches of 7 modules, so each review is about 70 questions. Then Service in two batches of 7, then Compliance (12). Compliance comes last, because RSA and Food Safety need the closest check.
- **How a module file works:** each module has `lib/questions/module-NN.ts`. Every question names the True/False statement it comes from (`concept`) and adds no new facts. Drafts have `reviewed: false` and are never asked.
- **Review sheets** are made from the code with `npm run questions:review -- "<file>" "<title>" <module ids>`, so the sheet always matches what goes live. When a batch is approved, its questions are switched to `reviewed: true` and released.

| Batch | Modules | Questions | Status |
|---|---|---|---|
| Beer Pouring sample | 1 | 9 | Approved and live 2026-10-19 |
| 1. Bartending, part A | 1 (3 more), 2, 3, 4, 5, 6, 7 | 72 | Approved 2026-10-19, all as written; live on `main` (`c2ad2cd`): `batch-1-bartending-a.md` |
| 2. Bartending, part B | 26, 27, 28, 32, 33, 34, 39 | 69 | Approved 2026-10-19; two statements corrected; live on `main` (`609d8d2`): `batch-2-bartending-b.md` |
| 3. Service, part A | 8 to 14 | 61 | Approved 2026-10-19; five statements corrected; live on `main` (`83029f8`): `batch-3-service-a.md` |
| 4. Service, part B | 23, 29, 30, 36, 37, 38, 40 | 58 | Approved 2026-10-19; four statements corrected; live on `main` (`dc2fd41`): `batch-4-service-b.md` |
| 5. Compliance, part A | 15 to 20 | 48 | Approved 2026-10-19; eleven statements corrected; live on `main` (`22839fc`): `batch-5-compliance-a.md` |
| 6. Compliance, part B | 21, 22, 24, 25, 31, 35 | 47 | Approved 2026-10-19; five statements corrected: `batch-6-compliance-b.md` |

**Venue practice rule (owner, 2026-10-19):** anything that varies between venues, such as cleaning schedules, gun layouts or house specs, is tested as a principle, never as one number or frequency.

### Phase 3 result (2026-10-19)

- **Every module is on the new engine.** All six batches were approved by the owner and are switched on. Every module has at least three live question types, so the full mastery rule (6 right across 3 types) now applies everywhere. A test checks this.
- **The bank:** 684 live questions: the 320 True/False statements plus 364 new ones. By type: 230 choose one, 50 spot the mistake, 45 best line, 25 put in order, 14 numbers.
- **15 to 20 questions per module.** That's below the plan's target of 20 to 25. Rather than pad modules, the decision was to write only questions with one clear right answer, and to leave out anything that varies by venue. More can come from venue feedback and from venue content (Phase 11).
- **27 existing statements were corrected along the way:** 2 in Bartending, 9 in Service and 16 in Compliance. Most depended on one state's rules or on venue policy. Each fix is recorded under "Decided on review" in its batch file.
- **The locked `scenarios` table** still holds the old wording of those statements. Nothing reads it, so it was left alone. It goes with the cleanup migration after Phase 8.
- **Picture questions:** none were written yet. Image briefs come with the image library in Phase 9, when the picture types are switched on.

## Phase 4: Learn cards (done 2026-10-19)

- **Built:** each module opens on 4 to 6 Learn cards, then the quiz, on desktop and mobile. One card at a time: a title, one rule and why it matters. Swipe on a phone, arrow keys or buttons on desktop, and "Skip to quiz" at any point. After a failed run, "Read the cards again" sits next to "Start a new run". The quiz run only starts once the cards are done, so the 20-minute limit doesn't run while someone reads.
- **Rule for the cards:** written only from the module's approved statements, and the venue rule applies: anything that varies between venues is taught as a principle, never as one number. A test checks that every statement is taught by a card.
- **Batches:** one or two at a time, in the same groups as Phase 3. Cards stay hidden until approved.
  - Cards batch 1, Bartending A (modules 1 to 7): 40 cards, `cards-batch-1-bartending-a.md`. Approved and live.
  - Cards batch 2, Bartending B (26, 27, 28, 32, 33, 34, 39): 36 cards, `cards-batch-2-bartending-b.md`. Approved and live.
  - Cards batch 3, Service A (8 to 14): 40 cards, `cards-batch-3-service-a.md`. Approved and live.
  - Cards batch 4, Service B (23, 29, 30, 36, 37, 38, 40): 34 cards, `cards-batch-4-service-b.md`. Approved and live.
  - Cards batch 5, Compliance A (15 to 20): 32 cards, `cards-batch-5-compliance-a.md`. Approved and live.
  - Cards batch 6, Compliance B (21, 22, 24, 25, 31, 35): 30 cards, `cards-batch-6-compliance-b.md`. Approved and live.
- **Pictures:** none yet. Each card can take one in Phase 9.
- **Result:** 212 cards across all 40 modules (4 to 6 each), all approved by the owner and live. A test checks every module keeps at least 4 approved cards.

## Phase 5: Skill check and test-out (built 2026-10-19)

- **Test-out for every module.** "Know this already? Test out" sits under the Learn cards on desktop and mobile. It's up to 8 questions, no True/False, hardest first, across at least 3 question types where the module has them. 6 right passes and masters the module; the 2nd miss ends it, with "Take the full quiz" to carry on. A test checks every module can run one.
- **The skill check now sets the starting difficulty.** It's the existing 6-question check (2 per area). Full marks in an area (Bartending, Service or Compliance) starts that area's quizzes on the harder questions. The pass rule is unchanged. Before this, the score only reordered recommendations.
- **More people can reach it.** Only 6 of 87 accounts had ever taken it: it showed only as a required pop-up on desktop for venue plans, and mobile had no way in. The mobile Learn hub now shows "Skip what you already know" until it's done. The desktop pop-up is unchanged.
- **Category map:** the check used to know categories for modules 1 to 20 only. All 40 now match the `modules` table.
- **Left for later:** managers seeing each new hire's skill check score (To_do_list.md), and the check's own six questions, which still live in the `diagnostic_questions` table rather than the reviewed question bank.
- **Done when** an experienced bartender can clear the basics in one evening: the 14 Bartending test-outs take about 2 to 3 minutes each. For the owner to check.

## Phase 6: Live Guest conversation, text (built 2026-10-19)

- **What it is:** pick a guest, then talk to them over 3 to 6 typed replies. The guest answers in character and their mood (fuming, annoyed, neutral, happy, delighted) moves with what you say, but stays hidden until the end. Then the reveal: what the guest was thinking at each turn and how their mood moved, a score with what went well and what to try next, and what the guest wanted and what would have helped. Desktop: a new "Live Guest" menu item. Mobile: `/mobile/live-guest`, from a card in the Learn hub.
- **Eight guests to start**, as planned (6 to 8): the flat schooner, one more round (RSA), the cold parmy, the nut allergy, no booking on a Friday, the Shiraz is gone, a phone booking, and someone pushed in. Briefs: `live-guest-briefs.md`, built from the code with `npm run guests:review`.
- **One AI call per reply**, with the model in `CHAT_MODEL_PARAMS`, counted against the daily AI allowance (300 a day on paid plans, so about 50 conversations). Opening a conversation costs nothing.
- **The server enforces the rules**, whatever the model returns: mood moves one step up per reply at most (two down); no ending before the 3rd reply; always an ending on the 6th; breaking the guest's must-do (serving an intoxicated guest, calling a dish allergy-safe without checking, ignoring a threat) ends it as a breach, which never passes. Tests cover each rule.
- **Safe against tampering:** the transcript is kept on the server (`live_guest_sessions`), so the browser can't rewrite what the guest said or skip ahead, and a reply sent twice is answered once. Staff text is fenced as untrusted, the same as the Arena, and can't pose as the guest brief.
- **Recorded** through `recordAttempt()` on the module's roleplay row, like the Arena. A pass already counts in the manager's service score where an Arena pass does, so Phase 8 has less to do.
- **Measures:** queries 5 (venue trials that try Live Guest in the first 24 hours) and 6 (conversations per week and how they end) in `supabase/queries/learning.sql`.
- **Access for now:** anyone whose plan includes the guest's module. Venue-plans-only gating comes in Phase 8.
- **Migration to run:** `supabase/migrations/20261021_live_guest.sql` (additive; rollback in `supabase/rollbacks/`).
- **Not yet:** the four dials and the guest getting harder as you improve (Phase 7); the privacy policy line for transcripts (Phase 13).
- **Done when** you can play a full conversation on your phone and it feels like a real guest. The prompt couldn't be tried before the preview, because there's no OpenAI key outside Cloudflare, so the first real conversations are where it gets tuned.

## Phase 7: guest briefs, four dials and difficulty (in progress, 2026-10-19)

- **The four dials:** the reveal now shows four dials: the guest's mood, speed, safety and money. Each brief says which are in play: a nut allergy puts safety at stake but not money; a flat schooner puts speed and money at stake but not safety. Each reply moves speed and safety one step at most. Money counts anything given away or made again at cost, and an extra sale at menu price, in dollars from the brief, never from the AI. Each item counts once. Some briefs add the bigger number, for example "12ml over on 200 drinks a night is about $500 a week". Each turn in the reveal shows what that reply moved.
- **The guest gets harder as you improve:** patient for a beginner (starts one mood better, forgives a slip), as written once the module is mastered, and tough once the module is mastered and the guest passed before, or 10 modules are mastered (starts one mood worse, pushes back once, brings the twist in early). The picker suggests up to 3 guests at the person's level: gentle ones for a beginner, harder ones later. Every guest stays open. The chat shows how patient the guest is and why.
- **The person can be a colleague:** when a scenario is about the team, you talk to the head chef, another bartender or a new casual instead of a guest.
- **The 8 live guests** now have dial settings, for your review in `live-guest-briefs.md`.
- **Batch 1 approved and live (2026-10-19):** 10 briefs on safety, compliance and money, in `guest-briefs-batch-1.md`, along with the dial settings for the first 8. 18 guests are live.
- **Batch 2 approved and live (2026-10-19):** 11 briefs on the floor, in `guest-briefs-batch-2.md`, including "Backing the junior" from the management scenarios. 29 guests are live.
- **Batch 3 approved and live (2026-10-19):** 11 briefs behind the bar, in `guest-briefs-batch-3.md`.
- **Batches 4 and 5 written and live on the preview (2026-10-19):** 9 cocktail guests and 11 selling guests, in `guest-briefs-batch-4.md` and `guest-briefs-batch-5.md`. You asked for both at once and trusted them without a review round; the sheets are there if you want to read them. **All 60 guest briefs are live: every Arena scenario and every guest-facing Scenario Training situation.**
- **Either-or money items:** where a guest can choose one thing or another (a glass each, or a bottle), the items share a group and only the first one counts, so the dollars can't double up.
- **The picker is grouped by area:** suggested guests first, then the rest by Behind the bar (23), Service and sales (23) and Safety and compliance (14), one area at a time, so 60 guests aren't one long scroll.
- **Suggestions now put the hardest guest within reach first**, then modules the person has mastered. With more guests live, the old order filled every slot with easy guests from mastered modules.
- **Where all 80 go:** `guest-briefs-plan.md`. 60 live, and 1 merged (the vodka upgrade into the bourbon upgrade). Management (decided): number 17 joins the guests; the gaming room one is held until there's a gaming module; the other 18 wait for a later manager phase.
- **Migration:** `supabase/migrations/20261022_live_guest_difficulty.sql`, run on production (confirmed 2026-10-20) (adds `difficulty`; additive; rollback in `supabase/rollbacks/`). The new code needs it, so Live Guest won't start on the preview until it's run.
- **Done when** every guest brief is live and the dials move in a way you agree with. **Passed by the owner on 2026-10-20.**
- **Desktop layout (2026-10-20):** the guest list fills the page in a grid lined up with the page header, instead of a narrow centred column, and during a conversation the scene sits in a side column that stays in view.

## Phase 8: plans, manager score and retiring the old screens (built 2026-10-20)

- **Live Guest is on venue plans only:** Boutique, Commercial, Enterprise, venue trials and staff sponsored by a venue (`hasLiveGuest()` in `lib/session.ts`). The server checks it when a conversation starts and on every reply. Pro and free users still see Live Guest in the menu, with the guests listed and an upgrade prompt ("Live Guest is on venue plans ... See the plans"). The taster conversation comes in Phase 13.
- **Scenario Training and the AI Arena are gone from desktop and mobile.** Their menu items, Learn hub sections, home tracker step, progress sections and links all now point to Live Guest. Old links still work: `?nav=stage4` and `?nav=scenarios` on desktop, and `/mobile/arena`, `/mobile/scenario-practice` and `/mobile/scenarios`, all open Live Guest. Their grading routes (`/api/evaluate`, `/api/arena/evaluate`) return "refresh the page" (410) and make no AI call. Their code is deleted (it's in git history). **Their data is kept**: every result stays in `training_attempts` and `scenario_mastery`. No migration drops anything.
- **The manager's numbers still add up.** The service score was already 80% quiz mastery and 20% passes on the module's roleplay row, and Live Guest writes that same row, so Live Guest passes replace Arena passes with no formula change, and earlier Arena passes still count. A venue trial's first Live Guest conversation now also counts as the trial being activated, as a quiz does.
- **Two progress fixes found on the way:**
  - The progress screens showed the Arena's best score out of 100 when it's stored out of 25, and called a module "passed" only after three passes in a row. They now show the real score out of 100, and "passed" means a recorded pass, the same flag the manager's score uses. The home tracker's Live Guest step counts modules passed, out of 40 (it counted modules attempted, out of 20).
  - Each category ring on the mobile Me page averaged three bars, one of them the retired Scenario Practice, so nobody could get past about 66%. It's now the average of Modules and Live Guest.
- **Removed with the old screens:** the two "Scenario score" charts on desktop progress (they only plotted Scenario Training scores), and the chart library behind them.
- **Pricing and plan cards:** the Venue card lists Live Guest; the comparison table has a Live Guest row (Staff: no; Venue, Group, Franchise: yes). The Staff (Pro) card no longer mentions the AI Arena. The trial and trial-expired screens in the Manager Console list Live Guest.
- **Pro users lose AI practice:** Pro had the AI Arena and doesn't get Live Guest, as decided. The 2 Pro accounts are the owner's own testing: there are no paying customers yet (2026-10-20).
- **Left for Phase 13:** marketing pages outside pricing still describe "scenario roleplay" and "Live Scenarios" (home page, platform page, vs-generic-lms, security page and the complaint demo). On the to-do list.
- **Done when** nobody can reach the old screens and the manager's numbers still add up. **Passed by the owner on 2026-10-20.**

## Phase 9: image style and library (parked 2026-10-20)

- **Parked by the owner on 2026-10-20**, to be drawn later in Claude Design in the owner's own time, so the heavy drawing work doesn't run here. Phase 10 goes ahead without it; the picture questions stay switched off (`PICTURE_QUESTIONS_ENABLED` in `lib/question-bank.ts`) and the Learn cards work without pictures, as before.
- **The style sheet:** `image-style-sheet.md`. It holds the rules, a brief to paste into Claude Design, how to work so it doesn't burn credits, and the full list: the parts (A), one picture per Learn card (B), and the question pictures (C).
- **The first part, drafted:** the schooner, in three states (poured right with a 1.2 cm head, a short pour, empty). Standalone copies with real colours, to upload to Claude Design as the style to match: `pictures/schooner-*.svg`.
- **Code, ready for the parts:** `components/pictures/Picture.tsx` draws a picture from a short spec (glass, drink, fill, head) and writes its alt text; `lib/pictures/glasses.ts` holds the glass parts (the schooner only so far). The `--pic-*` colours are in `app/globals.css`, with dark mode in `.qz--dark` in `app/styles/staff.css`. `scripts/picture-review.mjs` builds the review page from the code. Nothing in the app uses them yet, so `knip.json` ignores the two folders until they're wired in.
- **When the parts come back:** save them in `docs/Rich Update/pictures/`, then Claude Code turns them into parts, builds the review page, adds pictures to the Learn cards and questions, and switches the picture questions on.

## Phase 10: mixed drills (built 2026-10-20)

- **What it is:** ten questions mixed from every module the person has started or mastered, at full difficulty, then a score by module and a link to go over the module missed most. Practice only: a drill never masters a module or changes mastery, so a bad drill costs nothing.
- **Where:** desktop menu item "Mixed Drill", under Modules (a premium item, like Modules), and a "Mixed drill" card at the top of the Practice section of the mobile Learn hub (`/mobile/drill`). One component for both, `components/quiz/MixedDrill.tsx`, running the questions through the same `QuizRun` as the module quiz, so all six formats work.
- **Rapid Fire is gone.** It was already out of both menus; all that was left was a desktop module picker that opened the normal module quiz. It's deleted, and old `?nav=rapid-fire` links open the drill.
- **The rules** (`lib/drill.ts`, 14 tests in `lib/drill.test.ts`):
  - At least 3 modules with questions, at most 5 in one drill, so each module gets two or more questions.
  - Questions are dealt in turns across the modules, never two in a row from the same one.
  - Full difficulty: no True/False where a module has other questions, and the hardest variant of each fact.
  - One question per fact, and none from the person's previous drill while there are others to ask.
- **Each question shows its module** above the format ("Beer Pouring · Choose one"), so staff know which topic they're in.
- **"Started" needed recording.** Nothing kept which modules someone had started (quiz runs are deleted after a day), so the new `quiz_modules_started` table records the first answer in each module, by a database trigger. It's backfilled from the runs still kept and from every mastered module.
- **Counts as training:** drill answers count towards the Manager Console's daily training numbers, the same as quiz answers.
- **Migration:** `supabase/migrations/20261023_mixed_drills.sql` (two new tables and two triggers; additive; rollback in `supabase/rollbacks/`). The drill won't start on the preview until it's run.
- **Done when** a drill mixes at least three modules and doesn't repeat questions from the previous drill. Both are checked by the tests. **Passed by the owner on 2026-10-20**, and the migration is run.

## Costing (2026-10-20)

Asked by the owner: roughly what does one 15-person venue cost us if each person uses the site for an hour a day, five days a week?

- **Only Live Guest, the AI Coach and venue content drafting use AI.** Drills, quizzes and Learn cards are database work, with no per-use cost to speak of.
- **One Live Guest conversation** (about 4 replies) sends about 9,100 tokens to the model (measured from the real prompts: the rules block is about 1,800 tokens and goes with every reply) and gets about 1,000 back. On `gpt-6-luna` at US$0.10 per million in and US$0.50 out (third-party price lists, October 2026; check OpenAI's page), that's about US$0.0014, or a seventh of a cent. With OpenAI's automatic caching of the repeated rules block it's nearer US$0.0008.
- **Worst case, the whole hour on Live Guest:** about 15 conversations an hour, so US$0.02 a person a day, US$0.32 for the venue a day, about US$1.60 a week and US$7 a month (about A$10). The plan is A$79 a month for 15 staff.
- **Realistic case:** an hour a day mostly in modules and drills, with a few Live Guest conversations: well under A$2 a month for the venue.
- **The ceiling:** the daily allowance of 300 AI requests per paid person caps one person at roughly US$0.10 a day whatever they do.
- **Fixed costs** (Cloudflare, Supabase, Sentry) don't grow with one venue's use.
- **Where it changes:** voice (Phase 14). At roughly US$0.02 to US$0.05 a minute, an hour a day of voice would be US$90 to US$225 a week for the venue, so voice needs its own cap on minutes.
- **Follow-ups on the to-do list:** record the token counts from every AI call, so the cost per venue is measured rather than estimated; set a monthly spending limit on the OpenAI project.

## Phase 11: venue content (text built 2026-10-20)

- **What it is:** a new Venue Content tab in the Manager Console, in the People group. The manager adds a cocktail or drink spec, a special, a new product or tap, an 86'd item or a venue note, with an optional last day. The AI drafts 3 to 5 questions from it in the quiz's formats (choose one, best line, true or false, put in order, a number), and the manager approves or rejects each one. **Nothing reaches staff until it's approved** (decided 2026-10-19).
- **Staff get it in their next drill.** Approved questions are in every mixed drill while there are any, newest first, one per item, under the venue's name. So an item added and approved in the evening is in staff's next drill. An item past its last day, or taken down, leaves drills.
- **The AI only uses what the manager wrote.** The prompt says never to add ingredients, measures, prices or days that aren't in the details, and to write fewer questions when the details are thin. Every question the model returns is checked (right shape, 3 or 4 distinct options, a real answer, an explanation) and dropped if it fails; the check runs again whenever a stored question is read. The manager's text is fenced off in the prompt as data, not instructions. Australian English and no dashes, like every other prompt.
- **The manager can:** approve, reject, remove an approved question, draft again (replaces the drafts not yet approved) and take an item down. Each add or redraft is one AI call against the manager's daily allowance.
- **Who gets it:** staff at the venue (`venue_staff`), and the venue's owner, so you see your own content when you test. Venue plans only, because the console is.
- **Not yet:** photographing the menu. That needs an image upload and a vision call, so it comes as the second part of this phase once the text version is approved.
- **Migration:** `supabase/migrations/20261024_venue_content.sql` (two new tables; additive; rollback in `supabase/rollbacks/`). The tab won't load on the preview until it's run.
- **Tests:** 11 in `lib/venue-content.test.ts` (the checks on drafted questions, the round trip through the database and the quiz grader, ended items, the fenced prompt, the Sydney date) and 4 more in `lib/drill.test.ts` (venue content is always in the drill, newest first, and counts as one source).
- **Done when** a manager can add an item in the evening and staff get it in their next drill. For the owner to check on the preview.

## Phase 12: pre-shift drill and shift streak (part 1 built 2026-10-20)

- **"Ready for your shift?"** replaces the Pre-Shift Warmup card on mobile Home (which only opened one module's quiz). It starts a 6-question drill, about three minutes: the venue's new approved items first, then up to two mastered modules that are due for review, then other started modules. Someone with nothing started gets the first three modules on their plan.
- **It ends with "You're ready for tonight"**, the shift streak, the days they work, and a link to warm up with one Live Guest. The plan said "one short Live Guest moment" inside the drill; for now it's that link, which keeps the drill free of AI cost. Worth deciding in Phase 13 whether a one-reply guest belongs inside the drill.
- **The shift streak counts shifts, not days.** Staff pick the days they usually work (Monday first, as a roster reads). Days off never break it. A drill on an extra shift still counts.
- **Freezes:** two. One freeze covers every shift missed in the seven days from the first miss, so a missed week costs one freeze, not one per shift; a second missed week uses the second. Five shifts kept in a row earn one back. The day itself never counts as missed, because the shift may not have started yet.
- **The Home badge** now shows the shift streak. The old daily-visit streak (kept only in the browser) still shows on the Badges screen.
- **Migration:** `supabase/migrations/20261025_preshift_streak.sql` (a `kind` column on `drill_runs` and two new tables; additive; rollback in `supabase/rollbacks/`). The pre-shift drill and the Home card's streak won't work on the preview until it's run.
- **Tests:** 11 in `lib/shift-streak.test.ts` (including the Friday to Sunday casual, a missed week, a second missed week, a third ending it, extra shifts, earning a freeze back) and 2 more in `lib/drill.test.ts`.
- **Part 2, not built:** the "When should we remind you?" step and web push on the installed app. Push needs a VAPID key pair, kept as a secret in Cloudflare, which the owner creates and adds; it also needs the cron job to run daily rather than Sunday and Monday only.
- **Done when** a casual who works Friday to Sunday can keep a streak going. The rules pass the tests for that case. For the owner to check on the preview.

## Phase 13: launch check (Claude Code's part done 2026-10-20)

- **The checklist for the owner:** `launch-check.md`, in this folder: the one migration still to run, six decisions, the end-to-end check by role, and the human test with its four questions.
- **Privacy policy:** web and mobile updated for Live Guest transcripts (kept with the result, deleted with the account, not shown to managers), venue content drafting and shift days. The mobile copy had fallen behind the web one; both now match on AI.
- **Security page:** describes what Live Guest and venue content send to OpenAI. The venue's name was taken out of the venue content prompt so the page can say only the manager's text is sent.
- **Taster conversation:** one free Live Guest conversation for anyone off a venue plan, with Dan (`stacked-glasses`, Friday 10pm in a packed pub), chosen with the owner, checked on the server (`lib/live-guest/taster.ts`, with a test).
- **Marketing copy:** the wrong mentions of the retired features are fixed (Pro's card, the home page's "AI Scenario Simulators", the platform page, "rapid-fire" in three places, the complaint demo's leaderboard). "Five service dimensions" (which described Scenario Training) is reworded to what Live Guest shows, and "Role-Based Learning Paths" (not built) is replaced by venue content. Decided with the owner's go-ahead on 2026-10-20; the six decisions are in `launch-check.md`.
- **Measures:** queries 7 to 9 in `supabase/queries/learning.sql` (venue content, drills by kind, pre-shift drills).

## Phase 11, part two: menu photos (built 2026-10-20)

- **"From a photo of the menu"** at the top of the Venue Content tab. The manager takes or chooses a photo of the cocktail list, drinks menu or specials board. The browser shrinks it (longest side 1,600 pixels) before it uploads.
- **The AI reads the items off it** (`readMenuPhoto()` in `lib/venue-content.ts`, `POST /api/management/venue-content/photo`): up to 12, each with a kind, a name and what the menu says about it. Only what can be read; nothing guessed. Nothing is saved at this step, and the photo is never stored.
- **The manager ticks the items to add.** Each one then goes through the normal add, so it gets its own drafted questions to approve. One AI call to read the photo, then one per item.
- **Privacy and security pages** say the photo is sent to read it and not kept.
- **Not tested against the live model here:** the photo reading needs the model to accept images. If the first try fails on the preview, the error says so and nothing is lost.
- **Tests:** 3 more in `lib/venue-content.test.ts` (the photo check, which items are kept, the prompt).

## Phase 12, part two: shift reminders (built 2026-10-20)

- **"When should we remind you?"** on the pre-shift finish screen: a time, every half hour from 5am to 11:30pm, on the days they work. Choosing one saves it, then asks the phone for notification permission. "No reminder" turns it off.
- **iPhone:** Safari only allows notifications for apps added to the Home Screen, so on iPhone it explains how to add it first (Share, then Add to Home Screen).
- **The reminder** says "Ready for your shift?" with "Six quick questions, about three minutes, and you're set for tonight." Tapping it opens the pre-shift drill. It goes out within the hour after their time, on shift days only, once a day, and not at all if they've already done that day's drill.
- **How it's sent:** pg_cron calls `/api/cron/reminders` every 15 minutes, every day, with the same secret as the notification emails. Each person due is marked as reminded before sending, so a retry never sends twice. The push carries no message (the service worker shows the fixed text), which keeps it simple and private. Pushes only go to the real push services (Google, Mozilla, Apple, Microsoft); any other address a browser sends is refused.
- **The service worker** (`public/sw.js`) only shows the notification and opens the drill. It caches nothing. The site's security policy now names it (`worker-src 'self'`).
- **To switch it on (owner):** run `node scripts/vapid-keys.mjs` in the project folder, put the two values into Cloudflare as secrets `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_JWK`, and run `supabase/migrations/20261026_push_reminders.sql`. Until the keys are there, people can still pick a time; nothing is sent.
- **Not built:** showing the manager who has reminders on (on the to-do list).
- **Tests:** 8 in `lib/web-push.test.ts` (the push service allowlist, the signed key checked against the public key, who's due, the Sydney clock) and 2 more in `lib/shift-streak.test.ts`.


## Live Guest tune-up, after the owner's first test (2026-10-20)

The owner's conversation with Linh (the shouted coffee order, tough) showed five gaps. What was wrong, and the fix:

- **The name was given away.** The scene said "Linh calls out her order" and every bubble said Linh, so taking a name (one of her five helps) never came up. Now a stranger's name is out of the scene for all 45 guests who are strangers, and the chat says "Guest" until the guest says their name, which they only do when asked or when it fits (a name for the order). The 15 people the staff member would know (colleagues, a housemate, Gaz the regular of twenty years) are marked `knownByName` and keep their names. The reveal always names the guest.
- **She went round in circles.** Linh asked about the wait four times. Conversations are now 3 or 4 replies (were 3 to 6), the twist comes in the 1st or 2nd reply, and the prompt bans asking for the same thing twice: once a point is answered, even roughly, the guest moves on and the mood shows whether it landed.
- **The mood ignored what helped.** Reading the order back and giving a time left her annoyed, then fuming. The model now says which calms and sets_off each reply did, and the engine holds the line: a reply that does a new calm and nothing that sets the guest off can't lower the mood, and the reverse can't raise it. The guest's words have to match the recorded mood.
- **The debrief contradicted the chat** ("read back both coffees" after they had). The debrief now gets how many calms were found, names calms done in What went well, and Try next time has to be a calm missed or the worst thing done, never something already done. Thoughts must agree with what helped.
- **The guest never opened the door.** Each guest line now gives a natural opening for one calm not yet found ("Will I even hear it over the grinder?"), plainer for patient guests and subtler for tough ones, a different one each reply. The aim is the most helps found in a few replies.
- **The reveal** ticks off What helps ("You found 3 of 5") and, under each reply, what it helped and what made it worse.
- **Cost:** shorter conversations, so about a third fewer AI calls per conversation.
- **Tests:** 7 new in `lib/live-guest/engine.test.ts` (names kept out of every stranger's scene, calms counted once, the mood rules, the name only when the model and the line agree).

## Phase 14: Live Guest voice (built 2026-10-20)

- **Push to talk, not a live call.** Turn on "Voice" in a conversation: each guest line is read aloud, and a Speak button records your reply (up to 30 seconds). It's written out into the reply box, you check it, and Send. A noisy bar can mishear you, so you always see the words before they count, and you can type instead at any point.
- **Why not OpenAI's live voice:** it would bypass the turn engine (the helps, the mood rules, the dials, the safety rule and the scoring), cost about US$0.05 a minute against about US$0.02 here, and give no chance to fix a misheard word.
- **The guest's voice:** one of OpenAI's voices per guest, picked from the brief (he, she or they) and always the same for that guest, told to use a natural Australian accent and the guest's mood at that line. Lines are always read from the stored conversation, so the route can't be used to read out anything else.
- **English practice:** the conversation stays in English even when the rest of the page is translated into the person's language, so the debrief and the guest's thoughts come in their own language (the plan's 3e).
- **Cap:** 80 clips a day per person (each recording, and each line read aloud), about ten voice conversations. Worst case about US$0.30 a person a day; a typical voice conversation costs about 1.5 US cents.
- **Privacy:** recordings go to OpenAI to be written out and are never stored; only the text is kept, as with typing. The privacy policy (web and mobile) and the security page say so.
- **Owner:** run `supabase/migrations/20261027_live_guest_voice.sql` (the cap). Voice works before it is run, without the cap.
- **Not tested here:** the live speech models (they need the OpenAI key), and recording on a real iPhone and Android phone. That's the noisy bar test on the checklist.
- **Tests:** 6 in `lib/live-guest/voice.test.ts` (recording types, a voice for every guest, pronouns, the accent and mood instructions, the transcription hint).

## Phase 15: Saturday Rush (built 2026-10-20)

- **What it is:** a Saturday night shift from 9:30pm to 11:30pm in twelve moments, 15 seconds each. The queue grows, the ice and clean glasses run down, dockets arrive. Each moment gives three or four choices: what to make first, what to say to the person waiting, what to do about the glass in the ice well. Freeze and the queue notices.
- **The bar-back:** a button you can press at any moment. Ice and glasses come back full, then the bar-back is away for three moments. Leave it too late and the well runs dry, which forces its own moment. That's the plan's "when to call the bar-back".
- **Scored on the four dials** (guests, speed, money, safety) and how many of the best calls you made, out of 100, with the takings, the waste and the guests who walked out. Serving someone intoxicated, serving minors without ID, or scooping around broken glass is a rule you can't break, and caps the score at 40.
- **The debrief:** every call, what the best call was, and why, written to principles (start the Guinness first, burn the ice well, acknowledge the queue, refuse service kindly), not one venue's way.
- **Never the same twice:** 19 moments, 12 a shift (at least two about safety), with the drinks, numbers and order of the choices random each run.
- **No AI, no cost, plays offline.** The finished shift is saved, and the server replays it from its seed to work out the score itself, so the browser can't send a made-up one. A shift counts as training activity for the manager. Your best score shows at the start.
- **Balance, from 3,000 simulated shifts per style:** always the best call scores about 86 (rarely under 75), sensible but not best about 69, random choices about 33 (they hit the breaches), the worst calls about 9, and freezing all night 11 with over 20 guests walking out.
- **Where:** desktop menu "Saturday Rush" (after Mixed Drill, a paid feature like it), mobile Learn hub card, `/mobile/rush`.
- **Owner:** run `supabase/migrations/20261028_saturday_rush.sql`. Review the moments in `docs/Rich Update/saturday-rush-moments.md`.
- **Tests:** 9 in `lib/rush/engine.test.ts`.
