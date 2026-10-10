# Handoff: Pre-launch audit and cleanup

- **Date:** 2026-10-10
- **Branch:** `chore/pre-launch-cleanup`, cut from `preview/remove-legacy-mobile` at `98105bb`. **Local only, not pushed, not merged.**
- **Why:** the owner asked what a whole-build cleanup before launch should cover, where the most value is, and for a pre-launch record separate from the weekly handoffs.
- **Covers:** an audit of the code, the live database advisors and production responses; a ranked list of findings; the launch gate; and a progress log for the cleanup steps.
- **Related:** `To_do_list.md` (product items, which stay there), `docs/handoff/security/2026-10-02-audit-remediation-handoff.md` (security history), `docs/handoff/2026-10-week2-handoff.md` (the redesigns that left most of the dead CSS).

---

## The short version

1. **The code is in better shape than "big cleanup" suggests.** Typecheck, lint, the CSS token lint and all 46 unit tests pass. There are no `TODO`s, no `@ts-ignore`, one `any`, and very little unused TypeScript.
2. **The biggest launch risks are not cleanup.** They are a few unfinished product paths (billing for paying staff, the join link, phone checkout) and a missing safety net: until this branch there was no CI, and there is still no error tracking and no test on the payment path.
3. **The dead code is in the CSS.** About 880 of the 2,007 class names in `app/globals.css` are not referenced anywhere, and the whole file ships on every page.
4. **Security is a short list of specific items,** most of them small: five database functions open to signed-out callers, three high `npm audit` findings, and two owner dashboard actions still open from the September audit.
5. **Speed is mostly fine.** The server responds in about 110 ms. The gains are the CSS, 30 MB of large images, and a set of database access rules that run a check once per row.
6. **Accessibility has only been sampled.** The signals below say where to look; a browser pass with axe is Step 5.
7. **Steps 1 and 2 are done** (this document, and CI). Steps 3 to 5 have not started.

---

## Findings

Ranked by value to launch. "How measured" gives the command, so each number can be checked again.

### 1. Product blockers (already in `To_do_list.md`)

Not found by this audit, but they outrank everything in it.

- **Paying Pro staff cannot manage or cancel their subscription,** and account deletion is refused while a subscription is active.
- **The join link is lost at sign-in.** Most new staff are signed out when they first open it.
- **Phone checkout return skips the instant upgrade.**
- **Redesigned screens never checked behind a real login:** the Manager Console, `/login`, the narrow `/dashboard`, the demo against the live evaluator.

### 2. Safety net

| Gap | Detail |
|---|---|
| No CI | There was no `.github/workflows`. Lint, typecheck and tests ran only when someone ran them. **Fixed in Step 2.** |
| No error tracking | Nothing reports production errors. The Sentry decision is in `To_do_list.md`. |
| No test on the money path | E2E covers the `/mobile` screenshots and the marketing pages. Nothing exercises sign-up, checkout or the Stripe webhook. |
| Unit tests are thin | 46 tests in 6 files, all under `lib/`. |

### 3. Security

| Item | Detail | How measured |
|---|---|---|
| Database functions open to signed-out callers | `handle_new_user`, `handle_user_email_updated`, `apply_allowlist_role_on_signup`, `check_org_seat_limit` and `get_user_org_id` are `SECURITY DEFINER` and can be called through `/rest/v1/rpc/` by the `anon` and `authenticated` roles. The first three are trigger functions and should not be callable at all. | Supabase security advisor |
| Leaked-password protection is off | Supabase can reject passwords found in known breaches. A dashboard toggle. | Supabase security advisor |
| Five tables have RLS on and no policy | `pending_invites`, `scenarios`, `toolkit_leads`, `training_attempts`, `verify_attempts`. This is safe (only the service role can read them) and is listed so nobody "fixes" it by adding an open policy. | Supabase security advisor |
| `npm audit`: 3 high, 1 moderate | `postcss`, `sharp`, `source-map-js`. npm now reports all as fixable with `npm audit fix`. The earlier note said `postcss` needed Next 16; that has to be re-checked when the fix is run. | `npm audit --omit=dev` |
| Rate limiting is per worker instance | `lib/rate-limit.ts` keeps counts in memory, so each Cloudflare instance has its own. It slows a casual script and does not stop a determined one. The public AI routes (`/api/translate`, `/api/demo/evaluate`) depend on it. The Cloudflare WAF rule and the OpenAI monthly budget from the 2026-10-02 handoff are still open and are the real control. | Read of `lib/rate-limit.ts` |
| HTML is sent with a one-year shared cache header | Every page returns `Cache-Control: s-maxage=31536000` together with a per-request CSP nonce. Cloudflare does not cache HTML by default (`cf-cache-status: DYNAMIC`), so nothing is cached today. One "cache everything" rule would serve one person's signed-in page to another. | `curl -sI https://servebyexample.co/login` |
| `getSession()` in 24 places | The project rule is `getUser()`. Most are in client components reading the token for an API call. `app/dashboard/page.tsx` and `app/mobile/layout.tsx` need a look. | `grep -rn 'auth.getSession' app components lib` |
| Three client components read `profiles` directly | `app/auth/page.tsx`, `DashboardShell.tsx` and `ManagerControlCenter.tsx`, against the "call an API route" rule. RLS limits each to the person's own row. | grep for `.from(` in `"use client"` files |
| `/api/geo` is a public debug endpoint | Returns the caller's country. Harmless, and not needed in production. | Read of the route |

Confirmed in good order: the nonce CSP, HSTS, frame deny and nosniff headers are live; every one of the 52 API routes either checks the user or is public on purpose with a rate limit; `/api/auth/verify-redirect` only forwards to the project's own Supabase host; no model name is hard-coded outside `lib/openai.ts`.

### 4. Dead CSS

- **`app/globals.css` is 21,397 lines.** It is served as one file on every page: 353 KB, 59 KB compressed.
- **About 880 of its 2,007 class names appear nowhere** in `app`, `components`, `lib` or `content`. Up to 26 of those may be built at run time from a prefix and need checking by hand.
- **Largest groups by prefix:** `ops-` 123, `mcc-` 82, `sbe-` 65, `psh-` 40, `stage-` 36, `rfq-` 34, `ds-` 32, `progress-` 30, `phone-` 26, `mockup-` 24, `drill-` 23, `badge-` 22.
- **Cause:** the console, marketing, login and mobile redesigns each replaced markup and left the old rules.
- **How measured:** every `.class` token in the stylesheet, checked as a whole word against the source. Step 4 turns this into `scripts/find-unused-css.mjs`.

### 5. Images and repo weight

- **`public/` is 32 MB.** 33 PNG or JPG files over 300 KB add up to 30 MB. Several are 1.3 to 2 MB (`public/mobile/avatar-large.png`, `thumb-cocktail.png`, `module-cover.png`, `public/images/login-value-prop.png`).
- **13 files or folders have spaces in their names,** for example `public/mobile/New ai pictures 23 sept` and `public/24 May Jpg's`. These look like source art, not assets the site loads. Not yet confirmed file by file.
- **TypeScript is clean.** Knip reports 12 unused exports and 17 unused exported types, and no unused app files. Its 9 "unused files" are scripts and test configs it cannot see being used.

### 6. Database performance

| Item | Count | Fix |
|---|---|---|
| RLS policies that re-run `auth.uid()` for every row | 13 | Wrap the call as `(select auth.uid())` |
| Tables with two permissive SELECT policies for the same role | 2 (`modules`, `organization_members`) | Merge or drop the duplicate |
| Foreign keys without an index | 4 (2 on `pending_invites`, which is due to be dropped) | Add an index on the other 2 |
| Indexes never used | 24 | Most belong to the dead-schema drop in `To_do_list.md`; leave the rest until there is real traffic |

Source: Supabase performance advisor, 2026-10-10. None of this is felt at 91 accounts. It is cheap to fix now and tedious later.

### 7. Accessibility (signals, not an audit)

- **Focus:** 21 `outline: none` rules against 29 `:focus-visible` rules in `app/globals.css`. Some of the 21 may leave a control with no visible focus.
- **Motion:** 218 animation or transition declarations against 9 `prefers-reduced-motion` blocks.
- **Keyboard:** clickable table rows in `components/mission-control/LeaderboardBoard.tsx` and `StaffDirectoryTable.tsx` have a click handler and no keyboard path.
- **Modals:** the backdrops in `app/dashboard/_components/trainer/HelpModal.tsx` and at the end of `ManagerControlCenter.tsx` close on click; Escape and focus return are unchecked.
- **Earlier work:** `docs/staff-dashboard-a11y-audit.md` covers the staff dashboard as it was before the mobile removal.

### 8. Housekeeping

- **Docs:** about 30 files in `docs/`, several superseded (`DEAD-CODE-AUDIT-PLAN.md` from August, `STAGE_4_SUMMARY.md`, `v3-architecture.md`), plus `v4-migration-plan/` and `favicon_io/` at the repo root.
- **Branches:** 40 on the remote, 7 not merged into `main`.
- **Lint suppressions:** 50 `eslint-disable` lines, 35 of them `react-hooks/set-state-in-effect`.
- **Em dashes:** 302 lines in `app/dashboard` and `app/mobile` contain one. That count includes code comments; the to-do list estimates about 50 in visible text.

### Not measured

- JavaScript bundle size per route, and Lighthouse scores.
- Accessibility on a real device or with a screen reader.
- Whether each RLS policy is correct table by table. The September security audit covered this; this audit only read the advisor.
- Anything behind a login. There is no local sign-in.

---

## The launch gate

Launch when every line here is true. Items marked "owner" need a dashboard only the owner can open.

**Code**

- [ ] The three product blockers in Findings 1 are fixed and checked on a preview.
- [ ] `npm audit --omit=dev` reports no high findings.
- [ ] The database migration from Step 3 is applied and the Supabase security advisor shows no warnings for callable `SECURITY DEFINER` functions.
- [ ] Signed-in pages are not sent with a shared cache header.
- [ ] CI is green on `main`.
- [ ] A decision on error tracking is made, and if yes, it is live.

**Owner dashboard actions**

- [ ] Supabase: Authentication, turn on leaked-password protection.
- [ ] Cloudflare: the WAF rate-limit rule on the public form and AI routes (the route list is in the 2026-10-02 security handoff).
- [ ] OpenAI: a monthly budget and an alert.
- [ ] Stripe: the live-mode webhook points at production and its last deliveries succeeded.
- [ ] Supabase: confirm backups are on and note how far back a restore can go.
- [ ] GitHub: after CI has run once, make the `checks` job required on `main`.

**Manual checks behind a real login**

- [ ] Sign up, onboard and finish one scenario as staff, on a computer and on a phone.
- [ ] Pay for Pro with a real card, see the plan change, then cancel.
- [ ] As a manager: every console tab, invite a staff member, and have them join from the link while signed out.
- [ ] Password reset and Google sign-in on `/login`.
- [ ] One real answer on `/demo`.

---

## The plan and progress

| Step | What | Status |
|---|---|---|
| 1 | This document | Done |
| 2 | CI, and `typecheck` and `knip` scripts | Done |
| 3 | Security quick wins: `npm audit fix`; one migration (function grants, RLS rewrites, indexes) handed to the owner to run; cache header on signed-in pages; the two server-side `getSession()` calls; remove `/api/geo` | Not started |
| 4 | Dead code: the CSS purge by prefix group, knip's unused exports, unreferenced files in `public/`, superseded docs to `docs/archive/` | Not started |
| 5 | Accessibility: axe on eight screens, then the mechanical fixes | Not started |

Left for their own branches: the product blockers, error tracking, an e2e test from sign-up through checkout, splitting `app/globals.css` by surface once the purge is done, the em dashes in the staff product, the unsourced marketing figures, the dead-schema drop, and the Next 16 upgrade.

## What changed in Step 2

- **`.github/workflows/ci.yml`:** on every pull request and every push to `main`, runs `npm ci`, lint, the CSS token lint, typecheck and the unit tests on Node 24. It needs no secrets and does not deploy.
- **`package.json`:** two new scripts.
  - `npm run typecheck` generates the Next route types, then runs `tsc`. The generate step is there because `next-env.d.ts` is not committed, so a fresh checkout has no route types.
  - `npm run knip` runs the unused-code check through `npx`. Knip is not a dependency: installing it moved 11 unrelated packages in the lockfile, which is not a change to make this close to launch.
- **`@typescript-eslint/eslint-plugin` is now listed** in `devDependencies`, pinned to `8.65.0`, the version already installed. `eslint.config.mjs` imports it directly and it was only present because another package pulled it in. The lockfile changed by one line.
- **Knip is not in CI yet.** It reports the findings in Findings 5 and would fail. Add it after Step 4 clears them.

## Checks run

| Check | Result |
|---|---|
| Lint (`npm run lint`) | Passed |
| CSS token lint (`npm run lint:css`) | 0 raw hex values |
| Typecheck (`npm run typecheck`) | Passed |
| Unit tests | 46 of 46 passed |
| `npm ci --dry-run` | Lockfile in sync |
| The CI workflow on GitHub | Not run. The branch is not pushed. The first run is the test of whether `next typegen` works with no environment variables |
| Production build | Not run. Nothing in Steps 1 and 2 touches app code |

## Rules for new code (added here)

- **CI must be green before merging to `main`.** If a check is wrong, fix the check in the same pull request; do not merge past it.
- **Run `npm run typecheck`, not bare `tsc`,** on a fresh checkout.
- **A table with RLS on and no policy is deliberate.** Reach it through an API route with the admin client. Do not add an open policy to silence the advisor.
