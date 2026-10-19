# Handoff: The Rich Update (October 2026)

The staff learning upgrade, named after Richie, our first tester, who called training repetitive. The plan, the research and every decision are in `LEARNING_UPGRADE_RESEARCH.md`, and the measures in `LEARNING_METRICS.md`. All three files live in `docs/Rich Update/`; every new document for this update goes there too. This file records what has been done, phase by phase. Other open items are in `To_do_list.md`.

- **Branch:** `preview/rich-update`, created from `main` at `069b535`.
- **Save point before any change:** the tag `pre-learning-upgrade` (`069b535`). `git checkout pre-learning-upgrade` shows the code as it was.
- **Aim:** the last product update before paid marketing starts. About 10 to 12 weeks to launch.

## Where we are

| # | Phase | Status |
|---|---|---|
| 1 | Groundwork: measures and event tracking | Done 2026-10-19 |
| 2 | Question engine | Next |
| 3 | Writing and reviewing the questions | — |
| 4 | Learn cards (text) | — |
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

## Next: Phase 2, the question engine

From the plan (section 5):

- Six formats with a difficulty on each question, graded on the server one answer at a time. The answer key stays in server-only code (`lib/verify-questions.ts`).
- Mastery needs correct answers in at least three formats. A question answered correctly doesn't come back in the same run; one answered wrongly comes back later in another form.
- It starts with the existing 296 statements, so no module is ever empty during Phase 3.
- Modules already mastered stay mastered.
- The two picture formats are built but stay off until Phase 9.

Read first: `docs/MASTERY_ENGINE.md` (verify quiz and `advance_verify_attempt()`), `docs/STAFF_APP.md` §4, `lib/verify-quiz.ts`, `app/api/training/verify/`, `app/dashboard/_components/ModuleVerify.tsx`, `RapidFireQuiz.tsx`, `app/mobile/_components/QuizScreen.tsx`.
