# Funnel Metrics

The four numbers to read before and during any paid marketing. Defined on 2026-10-12. The queries are in `supabase/queries/funnel.sql`: open the Supabase SQL editor, paste one query, run it. They only read.

"Account" means an account that has signed in at least once. Seeded demo staff and invited people who never arrived are left out of every number. Weeks start on Monday, Sydney time.

| Number | Definition | Where it comes from |
|---|---|---|
| Visit to sign-up | Accounts created in a week, divided by that week's visits | Query 1 for accounts; Cloudflare dashboard, Web Analytics, for visits |
| Sign-up to first scenario | Accounts that completed a scenario within 7 days of signing up, as a share of that week's accounts | Query 2 |
| Trial to paid | Trials that became a paid plan, as a share of trials started that week | Query 3 |
| Cost per paying venue | A campaign's spend divided by the paying venues it brought | Query 4 for venues; the ad platform for spend |

## How to read them

- **Visit to sign-up is a trend, not an exact rate.** Visits and accounts are counted by two different systems. Cloudflare counts every page visit it sees, including people who were never going to sign up. Compare one week with the next; do not quote the figure.
- **The other three are exact.** They come from one database.
- **Recent weeks are still filling.** Sign-up to first scenario needs 7 days; trial to paid needs the 14-day trial to end. Query 3 shows how many trials are still open.
- **Campaign source is first touch.** `middleware.ts` keeps the `utm_*`, `gclid` and `fbclid` parameters from a visitor's first landing for 90 days, and the first sign-in copies them to `profiles.acquisition` (`lib/attribution.ts`). An account with no campaign parameters shows as `(none)`. Checkout also copies them into the Stripe subscription's metadata.
- **Query 4 counts venues, not Pro members.** A paying venue is an organisation on Boutique, Commercial or Enterprise whose owner's subscription is live.

## Before spending

No benchmark exists for this product yet, so these are starting rules, to be replaced once there are real numbers:

- Fix the size of the first test before it starts.
- Pause it if 200 paid visits produce no trial.
- Tag every ad link with `utm_source`, `utm_medium` and `utm_campaign`. An untagged link cannot be costed.

## AI usage

`supabase/queries/ai-usage.sql` shows how close accounts get to the daily AI limit (`lib/ai-usage.ts`). Read it after the first two weeks of a real venue. If the 90th percentile sits near the limit, the limit is too low for ordinary use.

## Learning

The numbers for the staff learning upgrade (the Rich update: `docs/LEARNING_UPGRADE_RESEARCH.md`, handoff in `docs/handoff/the-rich-update-10-26.md`). Defined on 2026-10-19. The queries are in `supabase/queries/learning.sql`, and they only read, like the funnel ones.

| Number | Definition | Query |
|---|---|---|
| Quiz runs finished | Runs that passed or ran out of questions, as a share of runs that are over. A run left active after its 20 minutes counts as abandoned | 1 |
| Days trained per active person | Average days with any training, among people who trained at least once that week | 2 |
| Still training in week 4 | People who trained on days 22 to 28 after their first day of training, as a share of everyone who started that week | 3 |
| Training mix | Quiz answers, quizzes passed, Scenario Training and AI Arena attempts per week | 4 |
| Live Guest in the first session | Venue trials where someone tried Live Guest in the first session | Added in Phase 6 |
| Venue content items | Items added per venue per month | Added in Phase 11 |

A day counts as trained when `training_activity_daily` has a row for it, which happens on any quiz answer, Scenario Training or Arena attempt. Challenges don't count.

### Baseline (2026-10-19, before any change)

| Number | Baseline |
|---|---|
| Quiz runs finished | 11 of 22 (50%). By week: 1 of 3 (from 5 Oct), 9 of 12 (from 12 Oct), 1 of 7 (from 19 Oct, so far) |
| Days trained per active person | 1.0 to 1.25 days a week, with 1 to 4 active people a week |
| Still training in week 4 | Too early: 5 people have trained, and none has reached week 4 yet |
| Training mix, all time | 98 quiz answers and 13 quizzes passed; 9 Scenario Training attempts; 5 AI Arena attempts |

**How to read it:** the sample is tiny and includes our own test accounts, so it's a starting point, not a benchmark. Compare against it after each phase ships. The AI Arena's 5 attempts in total back the decision to replace it with Live Guest.
