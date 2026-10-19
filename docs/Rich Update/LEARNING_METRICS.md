# Learning Metrics

The numbers for the staff learning upgrade (the Rich update: plan in `LEARNING_UPGRADE_RESEARCH.md`, progress in `the-rich-update-10-26.md`, both in this folder). Defined on 2026-10-19. The queries are in `supabase/queries/learning.sql`, and they only read, like the funnel ones in `docs/FUNNEL_METRICS.md`.

| Number | Definition | Query |
|---|---|---|
| Quiz runs finished | Runs that passed or ran out of questions, as a share of runs that are over. A run left active after its 20 minutes counts as abandoned | 1 |
| Days trained per active person | Average days with any training, among people who trained at least once that week | 2 |
| Still training in week 4 | People who trained on days 22 to 28 after their first day of training, as a share of everyone who started that week | 3 |
| Training mix | Quiz answers, quizzes passed, Scenario Training and AI Arena attempts per week | 4 |
| Live Guest in the first session | Venue trials where someone tried Live Guest in the first session | Added in Phase 6 |
| Venue content items | Items added per venue per month | Added in Phase 11 |

A day counts as trained when `training_activity_daily` has a row for it, which happens on any quiz answer, Scenario Training or Arena attempt. Challenges don't count.

## Baseline (2026-10-19, before any change)

| Number | Baseline |
|---|---|
| Quiz runs finished | 11 of 22 (50%). By week: 1 of 3 (from 5 Oct), 9 of 12 (from 12 Oct), 1 of 7 (from 19 Oct, so far) |
| Days trained per active person | 1.0 to 1.25 days a week, with 1 to 4 active people a week |
| Still training in week 4 | Too early: 5 people have trained, and none has reached week 4 yet |
| Training mix, all time | 98 quiz answers and 13 quizzes passed; 9 Scenario Training attempts; 5 AI Arena attempts |

**How to read it:** the sample is tiny and includes our own test accounts, so it's a starting point, not a benchmark. Compare against it after each phase ships. The AI Arena's 5 attempts in total back the decision to replace it with Live Guest.
