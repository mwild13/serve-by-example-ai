# Handoff: October 2026, Week 3

Work from 2026-10-12 onward is recorded here. Earlier work is in `docs/handoff/2026-10-pre-launch-handoff.md` and `docs/handoff/2026-10-week2-handoff.md`. Open items are in `To_do_list.md`.

## Part 1: to-do list sweep and the first five fixes

- **Date:** 2026-10-12
- **Branch:** `preview/oct-w3-todo-sweep`. Not merged to `main`.
- **Preview:** https://preview-oct-w3-todo-sweep.serve-by-example-ai.pages.dev

### The short version

1. **The to-do list was checked against the code, production and the database, then regrouped.** It went from 62 items in topic sections to sections by who does the work: code, marketing copy, owner dashboards (by service), owner testing (three sittings), owner decisions, tests, larger builds and a Parked list.
2. **`/auth` now redirects to `/login`.** The second sign-in page is gone.
3. **`/dashboard` and `/mobile` have their own error screens.**
4. **A person who has finished training is no longer listed under Needs Attention.**
5. **The em dashes are out of the staff product.**
6. **The 429 retry needed no new code.** The OpenAI client already retries.

### What the sweep found

- **`www` redirect: confirmed on production.** `https://www.servebyexample.co/membership` answers 308 to `https://servebyexample.co/membership`.
- **Six flagged marketing figures were already gone from the code:** "+15% avg upsell improvement", "3x faster onboarding", "65% faster completion", "40% higher knowledge retention", "40+ training modules" and "65+ scenarios".
- **"No credit card" is on more pages than listed:** the home page (twice), `components/HeroSection.tsx` and `app/pricing/page.tsx`, as well as `/vs-generic-lms` and `/solutions/pub-groups`.
- **`main` has no branch protection.** The item said only that the `checks` job was not yet required.
- **13 signed-in routes have no rate limiter.** They are named in the to-do list.
- **`app/globals.css` is 317 KB,** not 216 KB.
- **Database, 2026-10-12:** `pending_invites` and all eight dead `profiles` columns are still there; 0 toolkit emails undelivered; `pg_cron` is not installed; 79 of 91 accounts have never signed in.
- **Crawler access is still unconfirmed.** A request with a Googlebot user-agent returned 200, but it was sent from Australia, where the geo-block does not apply.

### What changed

- **`app/auth/page.tsx`** is a server redirect to `/login` that carries the query string over. `app/auth/layout.tsx` was deleted. `/auth/callback` is a separate route and was not touched. Nothing in the code linked to `/auth`.
- **`app/dashboard/error.tsx` and `app/mobile/error.tsx`** are new. Each shows a short message and a "Try again" button in that surface's own colours. Before, a render error fell through to `app/error.tsx`.
- **`lib/management/needs-attention.ts`:** `needsAttention()` returns false for anyone at 100% progress. The reported case (25 of 25 flagged on one venue, including a person at 100%) came from the 14-day inactivity rule, not the status fallback as the to-do item said: every person on the three 25-person venues was last active more than 14 days ago. On those venues the count now drops by the 10, 12 and 2 people who have finished. `lib/management/needs-attention.test.ts` is new.
- **`lib/openai.ts`:** `maxRetries: 2` is now stated on the client. It is the SDK default, so behaviour is unchanged: a 429 or 5xx was already retried twice with backoff inside each route's timeout.
- **Em dashes:** 42 lines of visible text across 17 files in `app/dashboard` and `app/mobile` were reworded, most of them in `HelpScreen.tsx`. The empty streak value on mobile Home is now a hyphen. Em dashes in code comments were left.

### Checked

- `npm run typecheck`, `eslint` on the changed folders and `vitest` (57 tests) all pass.
- Not checked: nothing was viewed in a browser. The preview needs the three looks below.

### To check on the preview

1. Open `/auth` and `/auth?checkout=success`: both should land on `/login`, the second with the query string kept.
2. Sign in with Google once, to confirm `/auth/callback` still works.
3. In the Manager Console, open a venue: Needs Attention should no longer list anyone at 100%.
4. On a phone, open Help in `/mobile` and read it through for wording.

The error screens only appear when a screen fails, so they cannot be seen on demand.

### Left open by this part

- `venue_staff.status` is written when a person is added and never recalculated, but the rule and the status pill still read it. It is in the to-do list under "Needs Attention, second half".
- `app/management/dashboard/error.tsx` names `--font-fraunces` directly, against the font rule in `CLAUDE.md`. Not changed here.
