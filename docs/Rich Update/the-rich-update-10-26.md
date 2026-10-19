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
- No mock-ups for Richie. He and other managers try the real screens as each phase ships.
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

## Next: Phase 4, Learn cards

From the plan (section 5): 4 to 6 cards per module, written from the same statements and explanations as the questions and checked by the owner in batches, the same way as Phase 3. Each card has one rule and why it matters, and leaves room for a picture, which comes in Phase 9. Done when every module opens with its cards on desktop and mobile.
