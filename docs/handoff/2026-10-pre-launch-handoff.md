# Handoff: Pre-launch audit and cleanup

- **Date:** 2026-10-10
- **Branch:** `chore/pre-launch-cleanup`, cut from `preview/remove-legacy-mobile` at `98105bb`. Eleven commits. **Local only, not pushed, not merged.**
- **Why:** the owner asked what a whole-build cleanup before launch should cover, where the most value is, and for a pre-launch record separate from the weekly handoffs.
- **Covers:** an audit of the code, the live database advisors and production responses; a ranked list of findings; the launch gate; and a progress log for the cleanup steps.
- **Related:** `To_do_list.md` (product items, which stay there), `docs/handoff/security/2026-10-02-audit-remediation-handoff.md` (security history), `docs/handoff/2026-10-week2-handoff.md` (the redesigns that left most of the dead CSS).

---

## The short version

1. **The code is in better shape than "big cleanup" suggests.** Typecheck, lint, the CSS token lint and all 46 unit tests pass. There are no `TODO`s, no `@ts-ignore`, one `any`, and very little unused TypeScript.
2. **The biggest launch risks are not cleanup.** They are a few unfinished product paths (billing for paying staff, the join link, phone checkout) and a missing safety net: until this branch there was no CI, and there is still no error tracking and no test on the payment path.
3. **The dead code is in the CSS.** About 880 of the 2,007 class names in `app/globals.css` are not referenced anywhere, and the whole file ships on every page.
4. **Security is a short list of specific items,** most of them small: five database functions open to signed-out callers, three high `npm audit` findings, and two owner dashboard actions still open from the September audit.
5. **The biggest speed problem was images, and it was found late.** Production does not resize or convert images, so the homepage hero went out as a 2 MB PNG. The oversized files are now right-sized WebP. The server itself responds in about 110 ms.
6. **Accessibility on public pages is clean.** An automated scan of 38 public pages at two widths found one fault, now fixed. Signed-in screens could not be scanned.
7. **All five steps are done on the branch.** What is left needs the owner: run one migration, do the dashboard actions, check the signed-in screens, and push.

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
| Database functions open to signed-out callers | `handle_new_user`, `handle_user_email_updated`, `apply_allowlist_role_on_signup`, `check_org_seat_limit` and `get_user_org_id` are `SECURITY DEFINER` and can be called through `/rest/v1/rpc/` by the `anon` and `authenticated` roles. Four of the five are trigger functions. Postgres refuses to run a trigger function outside a trigger, so they could not be abused; the grant is still wrong. `get_user_org_id` returns only the caller's own organisation. | Supabase security advisor |
| Leaked-password protection is off | Supabase can reject passwords found in known breaches. A dashboard toggle. | Supabase security advisor |
| Five tables have RLS on and no policy | `pending_invites`, `scenarios`, `toolkit_leads`, `training_attempts`, `verify_attempts`. This is safe (only the service role can read them) and is listed so nobody "fixes" it by adding an open policy. | Supabase security advisor |
| `npm audit`: 3 high, 1 moderate | `postcss`, `sharp`, `source-map-js`. npm now reports all as fixable with `npm audit fix`. The earlier note said `postcss` needed Next 16; that has to be re-checked when the fix is run. | `npm audit --omit=dev` |
| Rate limiting is per worker instance | `lib/rate-limit.ts` keeps counts in memory, so each Cloudflare instance has its own. It slows a casual script and does not stop a determined one. The public AI routes (`/api/translate`, `/api/demo/evaluate`) depend on it. The Cloudflare WAF rule and the OpenAI monthly budget from the 2026-10-02 handoff are still open and are the real control. | Read of `lib/rate-limit.ts` |
| Prerendered HTML is sent with a one-year shared cache header | Next sends `Cache-Control: s-maxage=31536000` for every prerendered page. Cloudflare does not cache HTML by default (`cf-cache-status: DYNAMIC`), so nothing is cached today. Checked in Step 3: the pages that render a person's data (`/dashboard`, `/mobile/*`, `/management/dashboard`) are server-rendered and already send `no-store`. Three signed-in client shells (`/onboarding`, `/dashboard/badges`, `/session-conflict`) were prerendered and carried the long header; they hold no personal data in their HTML. Lower risk than first written. | `curl -sI https://servebyexample.co/login` |
| `getSession()` in 24 places | The project rule is `getUser()`. Checked in Step 3: the two server-side uses (`app/dashboard/page.tsx`, `app/mobile/layout.tsx`) call `getUser()` first and gate on that; `getSession()` only reads the access token afterwards. The rest are client components doing the same. No change needed. | `grep -rn 'auth.getSession' app components lib` |
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

- **Production does not optimise images.** `/_next/image` on Cloudflare Pages returns the original file at full size, whatever `next.config.ts` says about AVIF and WebP. Measured on production: the homepage hero came back as a 2,025 KB PNG, and a 48px thumbnail on mobile Home as a 1,294 KB PNG. Every `<Image>` on the site was affected. Found during Step 4, not in the first audit. How measured: `curl -s -o /dev/null -w '%{content_type} %{size_download}' 'https://servebyexample.co/_next/image?url=%2Fmobile%2Fmodule-cover.png&w=96&q=75'`.

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
- [ ] `npm audit --omit=dev` reports no high findings. One remains (`postcss`) and needs the Next 16 upgrade; decide whether launch waits for it. The affected code runs at build time on our own CSS, not on visitor input.
- [ ] The database migration from Step 3 is applied and the Supabase security advisor shows no warnings for callable `SECURITY DEFINER` functions.
- [ ] Signed-in pages are not sent with a shared cache header. Done in code; confirm on the preview with the browser's network panel.
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
| 3 | Security quick wins | Done in code. The migration is written and **not yet run** |
| 4 | Dead code: CSS, exports, images, docs | Done |
| 5 | Accessibility | Done for public pages and the mechanical fixes. Signed-in screens not scanned |

Left for their own branches: the product blockers, error tracking, an e2e test from sign-up through checkout, splitting `app/globals.css` by surface, the em dashes in the staff product, the unsourced marketing figures, the dead-schema drop, and the Next 16 upgrade.

## Before and after

| Measure | Before | After |
|---|---|---|
| `app/globals.css` | 21,397 lines | 12,911 lines |
| Stylesheet sent to every page | 353 KB (59 KB compressed) | 216 KB (38 KB compressed) |
| Class names no code refers to | about 880 of 2,007 | 0 that the script can prove |
| `public/` | 33.5 MB | 5.0 MB |
| Homepage hero image | 2,025 KB PNG | 139 KB WebP |
| Mobile Home thumbnails and avatars (4 files) | 5,600 KB | 66 KB |
| Unused exports and exported types (knip) | 12 and 17 | 0 and 0 |
| `npm audit --omit=dev` | 3 high, 1 moderate | 1 high, 1 moderate |
| Accessibility faults on public pages (axe, WCAG 2.1 A and AA) | 1 | 0 |
| Files in `docs/` (top level) | 31 | 19 |

## What changed

### Step 2: CI

- **`.github/workflows/ci.yml`:** on every pull request and every push to `main`, runs `npm ci`, lint, the CSS token lint, typecheck, the unit tests and the unused-code scan on Node 24. It needs no secrets and does not deploy.
- **`npm run typecheck`** generates the Next route types, then runs `tsc`. The generate step is there because `next-env.d.ts` is not committed, so a fresh checkout has no route types.
- **`npm run knip`** runs the unused-code scan through `npx`. Knip is not a dependency: installing it moved 11 unrelated packages in the lockfile. `knip.json` now lists the scripts and the marketing e2e suite as entry points, so the scan reports clean and can fail CI on anything new.
- **`@typescript-eslint/eslint-plugin` is now listed** in `devDependencies`, pinned to `8.65.0`, the version already installed.

### Step 3: Security

- **`npm audit fix`.** `sharp` 0.35.4 to 0.35.5 and `source-map-js` 1.2.1 to 1.2.2 clear two of the three high findings. It also moved `next` 15.5.25 to 15.5.27 and `wrangler` 4.129.0 to 4.149.0, both within their existing ranges.
- **`postcss` is not fixed.** The remaining high finding needs `next@16`, as the earlier note said. The audit's first report that everything was fixable was wrong.
- **Four new lint warnings** arrived with the newer Next lint rules: `window.location.href` used for an internal page in `app/onboarding/page.tsx`, `TrialBillingSection.tsx`, `TrialExpiredModal.tsx` and `lib/use-auth-session-guard.ts`. They are warnings, not errors, and each is a deliberate full reload after a sign-in or billing change. Left as they are.
- **Migration `supabase/migrations/20261010_prelaunch_function_grants_and_rls_tuning.sql`,** with a rollback in `supabase/rollbacks/`. Written against the live definitions read on 2026-10-10. It has not been run. In one transaction it:
  - revokes `EXECUTE` on the four trigger functions from everyone, and on `get_user_org_id()` from signed-out callers (signed-in users keep it, because the `orgs_member_read` policy calls it);
  - rewrites 11 policies so `auth.uid()` is evaluated once per query, with the same conditions;
  - merges the two SELECT policies on `organization_members` into one, and scopes the active-only `modules` policy to signed-out callers, with no change to who can read which rows;
  - adds indexes on `training_programs.manager_user_id` and `venue_inventory_items.manager_user_id`.
- **`middleware.ts`:** signed-in routes (`/dashboard`, `/mobile`, `/management`, `/onboarding`, `/session-conflict`, `/payment-success`) are sent with `Cache-Control: private, no-store`.
- **`/api/geo` is deleted.** Nothing called it.

### Step 4: Dead code

- **CSS.** `scripts/find-unused-css.mjs` (`npm run lint:css:unused`) finds classes no source file can produce and, with `--write`, deletes them. 838 classes went in the first pass. The change to `app/globals.css` is 8,510 deleted lines and 7 changed ones (selector lists that lost a member). The script's header explains what it treats as "used", including class names built at run time from a prefix.
- **8 classes are still reported.** Removing the first batch exposed them. Run the script again with `--write` to clear them.
- **Exports.** 16 unused `export` keywords removed. 13 declarations deleted because nothing used them at all: `TreeConnector`, `moduleStringToId` and its lookup table, and the types `DiagnosticAnswer`, `StaffInvitePayload`, `InviteResult`, `MarkMasteredResult`, `Scenario`, `DiagnosticQuestion`, `ScenarioType`, `QuizContent`, `DescriptorContent`, `RoleplayContent`.
- **Images converted.** 20 PNGs became WebP with `scripts/optimize-images.mjs`: the 12 product screenshots in `public/shots/` (capped at 2,000px wide), the four mobile placeholders (`avatar`, `avatar-large`, `thumb-cocktail`, `module-cover`, resized to what they are shown at), and the four profile-photo backgrounds in `public/mobile/Backgrounds-ai/` (same size, higher quality, because they are composited into the saved photo). `public/cocktails/eggnog.jpg` was resized to 640px to match the other 37. 15 source files now point at the `.webp` names.
- **Files removed from `public/`.** 15 that nothing referenced: the folder `public/mobile/New ai pictures 23 sept/` (9 files, 11 MB), `images/login-value-prop.png`, `shots/Progress Bar Chart.png`, and the four default icons from the Next starter (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`). All are in git history.
- **Unreferenced but kept:** `public/downloads/` (emails already sent may link to the PDF), `images/advisory/advisory-about.jpg`, the logo marks, `og-image.svg` and the two `android-chrome` icons.
- **Docs.** 12 superseded documents moved to `docs/archive/`, listed in `docs/archive/DELETED.md`. Four links in the living docs were updated. Nothing was deleted.

### Step 5: Accessibility

- **Scan.** axe-core, WCAG 2.1 A and AA rules, on all 38 public pages at 1366px and 375px. One fault: the Sign in / Create account toggle on `/auth` claimed to be a tab list while holding plain buttons. It is now a group. A second scan found nothing.
- **Clickable table rows** in the console leaderboard and the roster table can be reached with Tab and opened with Enter or Space, and show a focus ring.
- **The venue delete confirmation** is announced as an alert dialog, closes on Escape, and puts focus on "No, keep it".
- **The trainer help panel** is announced as a dialog and takes focus. Escape already closed it.
- **Reduced motion.** A site-wide rule at the end of `app/globals.css` cuts animations and transitions to near zero for anyone whose device asks for less motion.
- **Focus rings.** All 14 rules that remove the outline were checked. Each has a visible replacement or applies to a container that only receives focus from script. No change.

## What the owner needs to do

1. **Run the migration** in the Supabase SQL editor: `supabase/migrations/20261010_prelaunch_function_grants_and_rls_tuning.sql`. It can run before or after this branch is live. Then check that a staff member and a manager can still sign in and see their data.
2. **Push the branch and open a pull request.** That gives CI its first run and Cloudflare a preview.
3. **Look at the signed-in screens on the preview:** `/dashboard`, `/mobile/home`, a training scenario, the profile photo screen, and every Manager Console tab. The CSS purge and the image swap were only verified on public pages.
4. **The dashboard actions** under "The launch gate".

## Checks run

| Check | Result |
|---|---|
| Lint | Passed, 4 warnings (described under Step 3) |
| CSS token lint | 0 raw hex values |
| Typecheck | Passed |
| Unit tests | 46 of 46 passed |
| Unused-code scan (knip) | Clean |
| Production build (`next build`) | Passed |
| Cloudflare build (`npm run build:cloudflare`) | Passed |
| CSS purge, public pages | 35 pages at two widths screenshotted before and after. 65 of 70 identical. The other 5 differ only in where the sticky navbar and the floating call button landed in the stitched image |
| CSS purge, class check | No removed class appeared in the DOM of any public page |
| Image swap | 35 public pages loaded and scrolled, 82 images, none broken or missing |
| Cache header | On a local production server, `/session-conflict` returned `private, no-store` and `/login` was unchanged |
| Accessibility scan | 0 faults on 38 public pages at two widths |
| Signed-in screens after the CSS purge and image swap | Not checked. There is no local sign-in |
| The cache header under Cloudflare | Not checked. Verified on plain Next only |
| The migration | Not run. Statements were written from the live definitions but have not been executed anywhere |
| Keyboard and dialog fixes in the console | Not checked in a browser. Typecheck and lint only |
| The CI workflow on GitHub | Not run. The branch is not pushed |
| Mobile and marketing e2e suites | Not run. Both need a deployed URL. The mobile screenshot baselines will need re-capturing, because the placeholder images were re-encoded |

## Open items

- **The 8 classes the CSS script still reports,** and anything the signed-in check turns up.
- **`postcss`** stays flagged until the Next 16 upgrade.
- **Split `app/globals.css` by surface.** It is still one 216 KB file on every page. Marketing, the staff product and the console could each load their own.
- **Images still go through `/_next/image` unoptimised.** The files are now small enough that this does not matter. If Cloudflare Images is ever turned on, nothing here needs undoing.
- **Accessibility behind a login** has only had the mechanical fixes. `docs/staff-dashboard-a11y-audit.md` is the last full look and predates the mobile removal.
- **50 `eslint-disable` lines,** 35 of them `react-hooks/set-state-in-effect`. Not touched.

## Rules for new code (added here)

- **CI must be green before merging to `main`.** If a check is wrong, fix the check in the same pull request; do not merge past it.
- **Run `npm run typecheck`, not bare `tsc`,** on a fresh checkout.
- **Images in `public/` are served as they are.** Nothing resizes them in production. Run `scripts/optimize-images.mjs` on any new PNG or JPG and commit the WebP, sized to about twice the widest it is shown.
- **When markup is replaced, delete its CSS in the same change.** `npm run lint:css:unused` lists what is left behind.
- **A table with RLS on and no policy is deliberate.** Reach it through an API route with the admin client. Do not add an open policy to silence the advisor.
- **A clickable row or card needs a keyboard path:** `tabIndex={0}`, Enter and Space, and a visible focus style.
