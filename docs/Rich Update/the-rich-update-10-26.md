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
| 4 | Learn cards (text) | Next |
| 5 | Skill check and test-out | — |
| 6 | Live Guest conversation (text) | — |
| 7 | Guest briefs, four dials and difficulty | — |
| 8 | Plans, manager score and retiring the old screens | — |
| 9 | Image style and library | — |
| 10 | Mixed drills | — |
| 11 | Venue content | — |
| 12 | Pre-shift drill and shift streak | — |
| 13 | Launch check, then marketing spend starts | — |
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
- **Batch 1 is ready for review:** 10 briefs on safety, compliance and money, in `guest-briefs-batch-1.md`. They're in the code but not offered until you approve them.
- **Where all 80 go:** `guest-briefs-plan.md`. 8 live, 10 in batch 1, 41 in batches 2 to 5, and 1 merged (the vodka upgrade into the bourbon upgrade). The 20 management scenarios are waiting on your decision: you play the manager talking to staff or the owner, and they don't fit any of the 40 modules.
- **Migration to run before testing:** `supabase/migrations/20261022_live_guest_difficulty.sql` (adds `difficulty`; additive; rollback in `supabase/rollbacks/`). The new code needs it, so Live Guest won't start on the preview until it's run.
- **Done when** every guest brief is live and the dials move in a way you agree with.
