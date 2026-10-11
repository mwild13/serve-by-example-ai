# Handoff: Pre-launch audit and cleanup

- **Date:** 2026-10-10
- **Branch:** `chore/pre-launch-cleanup`, cut from `preview/remove-legacy-mobile` at `98105bb`. **Merged to `main` on 2026-10-10 through pull request #2,** after the owner checked the preview. Because of where it was cut, the merge also brought in the legacy mobile removal (week 2 handoff, Part 8).
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
7. **All five steps are done, the migration has been run and the branch is merged.** The owner approved the signed-in screens on the preview. What is left is the remaining dashboard actions and the open items below.

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
- [x] The database migration from Step 3 is applied (2026-10-10). The security advisor shows one remaining warning, `get_user_org_id()` for signed-in users, which is intended.
- [ ] Signed-in pages are not sent with a shared cache header. Done in code; confirm on the preview with the browser's network panel.
- [ ] CI is green on `main`. It was green on pull request #2 before the merge; confirm the run on `main`.
- [ ] A decision on error tracking is made, and if yes, it is live.

**Owner dashboard actions**

- [ ] Supabase: Authentication, turn on leaked-password protection. **Not available: it needs the Supabase Pro plan and the project is on the free plan.** Turn it on if the plan changes. Until then the advisor warning stays, and the password rules in Supabase Auth settings (minimum length, required characters) are the only control.
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
| 3 | Security quick wins | Done. The migration was run on production on 2026-10-10 and checked |
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
- **Migration `supabase/migrations/20261010_prelaunch_function_grants_and_rls_tuning.sql`,** with a rollback in `supabase/rollbacks/`. Written against the live definitions read on 2026-10-10. **The owner ran it the same day.** Checked afterwards against the live database: the security advisor no longer lists the four trigger functions and reports nothing callable by signed-out visitors; the merged `organization_members` policy, the `modules` policy for signed-out callers, the rewritten conditions and both indexes are in place. One advisor warning remains on purpose: `get_user_org_id()` is callable by signed-in users, which the `orgs_member_read` policy needs. In one transaction it:
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

## What the owner did, and what is left

- **Done 2026-10-10:** ran the migration; checked the signed-in screens and the staff and manager data on the preview and approved them; approved the merge.
- **Left:** the dashboard actions under "The launch gate" other than leaked-password protection, which the free Supabase plan does not offer; and making the `checks` job required on `main` in the GitHub branch settings.

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
| Signed-in screens after the CSS purge and image swap | Checked and approved by the owner on the preview. Not checked by the author: there is no local sign-in |
| The cache header under Cloudflare | Not checked. Verified on plain Next only |
| The migration | Run by the owner on production, 2026-10-10. Advisor, policies and indexes checked afterwards and correct. Staff and manager sign-in approved by the owner on the preview |
| Keyboard and dialog fixes in the console | Not checked in a browser. Typecheck and lint only |
| The CI workflow on GitHub | Passed on its first run (pull request #2, 1 min 9 s), including typecheck with no environment variables |
| Cloudflare Pages preview build | Passed |
| Mobile and marketing e2e suites | Not run. Both need a deployed URL. The mobile screenshot baselines will need re-capturing, because the placeholder images were re-encoded |

## Follow-up fixes, 2026-10-11

Problems the owner found on a phone the day after the merge. All of them went to `main` on 2026-10-11 through pull request #3 (`dda3a3b`). After the deploy, production served the photo backgrounds, a cocktail JPG and the homepage hero WebP directly, and CI passed on `main`.

- **AI photo backgrounds returned 404.** Step 4 converted the four backgrounds in `public/mobile/Backgrounds-ai/` from PNG to WebP. The files were never deleted. The cause is `_routes.json`, written by the `build:cloudflare` script in `package.json`: it listed `/*.png` and `/*.svg` as files Cloudflare serves directly, and not `.webp` or `.jpg`, so those requests went to the worker and came back 404. Images drawn through `next/image` kept working because the worker fetches them itself; the photo screen loads its backgrounds directly onto a canvas, so it failed. `/*.webp`, `/*.jpg` and `/*.jpeg` are now in the list. The local check in Step 4 used `next start`, which serves every file in `public/`, so it could not catch this.
- **The staff mobile screens had a strip down both sides.** `--mobile-frame-max` was `clamp(360px, 92vw, 520px)` since 2026-09-21, so on a phone the frame was 92% of the screen width and the Home carousel was cut off before the edge. It is now `520px`: phones use the full width and tablets keep a centred 520px column. This affects every `/mobile` screen.

- **Saving a profile photo failed on every iPhone with "Invalid photo."** This is the failure the owner had seen for weeks. Every iOS browser is WebKit, and its canvas returns a PNG when asked for WebP. The save route only accepted WebP. `exportCompositeBlob` in `lib/photo-composite.ts` now falls back to JPEG, and `app/api/profile-photo/save/route.ts` accepts WebP or JPEG, checks the file's first bytes match, and stores it as `profile-photo.webp` or `profile-photo.jpg`. It removes the copy in the other format, and account deletion removes both. The `profile-photos` bucket only allowed `image/webp`, so the first test of this still failed with "Failed to save your photo"; `supabase/migrations/20261011_profile_photos_allow_jpeg.sql` adds `image/jpeg`. The owner ran it on 2026-10-11 and then saved a photo from an iPhone on the preview.
- **The selfie camera felt reversed.** The preview was not mirrored. It now is, like a phone's own camera, and the captured photo is mirrored to match what was framed.
- **The framing guide was an oval labelled "head and shoulders".** A head-and-shoulders outline was tried and dropped as harder to fit. It is now a face-only oval, with the line "Fit your face inside the oval".
- **A saved photo did not show on Home until a reload.** The save screen now puts the new URL into the shared mobile session (`setProfilePhotoUrl` in `app/mobile/_lib/mobile-session-context.tsx`) before it navigates, so Home and Me show it at once.

Not verified: the face oval and the instant photo update on Home were not run on a phone before the release, and the mobile screens at the new width were not seen behind a login.

## Pre-marketing blockers, 2026-10-11 and 12

The owner asked for an audit of what would break under paid traffic, then for the blockers to be fixed. All of this is on `main`. Open work from it is in `To_do_list.md` under "Before any marketing spend".

### What changed

- **Daily AI cap.** `lib/ai-usage.ts` counts each account's AI requests in Postgres (`ai_usage_daily`, bumped by `bump_ai_usage()`): 30 a day on the free tier, 300 on paid, shared by scenario grading, Arena and both coaches. It fails open if the count cannot be read. Migration `20261012_ai_usage_and_acquisition.sql`, run by the owner on 2026-10-11.
- **No IP limits on signed-in routes.** A venue's staff share one IP on the venue Wi-Fi. Sign-in (`/api/session/stamp`, 10 a minute per IP), grading, joining a venue and saving a photo all limited by IP and would have locked a team out. They now limit by user only.
- **Stripe webhook.** Every database write in `app/api/billing/webhook/route.ts` throws on failure, so Stripe gets a 500 and retries. Before, a failed write answered 200 and a paying customer stayed on the free tier. `checkout.session.completed` also stores the subscription status and renewal date, which were never saved because the subscription's own events arrive before the profile is linked to the Stripe customer.
- **Checkout needs an account.** `/api/billing/checkout` answers 401 when signed out. `/membership` sends the visitor to `/login?intent=checkout&plan=...`, and after sign-in by password, email confirmation or Google they return to `/membership?checkout_plan=...`, which starts checkout. A second checkout is refused while a subscription is live.
- **Crawlers through the geo-block.** `lib/geo-config.ts` lets search, ad-review and link-preview crawlers read marketing pages from outside Australia, by user-agent. It never opens the product or account screens, because a user-agent can be faked.
- **Campaign attribution.** `middleware.ts` keeps the first `utm_*`, `gclid` or `fbclid` a visitor arrives with in the `sbe_attr` cookie (first-party, HttpOnly, 90 days, set without consent by the owner's decision and declared on `/cookies`). It is saved to `profiles.acquisition` at first sign-in and to Stripe metadata at checkout.
- **Captcha.** Cloudflare Turnstile on password sign-in and sign-up (`components/TurnstileWidget.tsx`), invisible unless Cloudflare asks for a tick. Supabase Auth enforces it. The password-reset request is checked by our own route (`lib/turnstile.ts`, `TURNSTILE_SECRET_KEY`). Google sign-in is not behind it.
- **Staff billing.** Staff with their own Stripe customer get "Manage billing" in Settings on `/dashboard` and `/mobile`. The portal route returns them to the screen they came from.
- **Join link.** A code on `/dashboard?join=CODE` is parked in the `sbe_join` cookie when the visitor is signed out and put back on the URL at their first signed-in request, so it survives sign-in and onboarding.
- **Phone checkout return.** `middleware.ts` no longer redirects `/dashboard?checkout=success` to the mobile app before the payment is verified. `app/dashboard/page.tsx` verifies, then sends a phone to `/mobile/home`.
- **Site address.** `NEXT_PUBLIC_SITE_URL` was set without `https://`, so Stripe refused the billing portal's return address for staff and managers alike. `lib/site-url.ts` adds the scheme, and the reset, invite and portal links all use it. The owner has since corrected the variable.
- **Mobile fields.** The "rotate your device" screen appeared when the keyboard opened, and iOS zoomed the page on focus and left the next screen draggable sideways. The guard now needs 500px of width and never shows over a focused field; fields on `/mobile` use 16px text.
- **Email shell.** `brandedEmailHtml()` in `lib/email-template.ts` was redesigned: logo and name on parchment, a gold rule, a serif heading, one button style and a boxed fallback link. The reset email was rebuilt on it and now escapes the address.
- **e2e sign-in.** Turnstile does not issue tokens to an automated browser, so `tests/e2e/global-setup.ts` mints a session for the QA account through the Supabase Admin API. The login form is no longer covered by e2e.

### Checked on production by the owner, 2026-10-12

A real Pro purchase with a new account, started from `/membership?utm_source=test&utm_campaign=launchcheck`:

| Check | Result |
|---|---|
| Signed out, pick a plan, create an account, reach Stripe | Passed |
| Plan applied after payment | Passed. Database: `tier = pro`, status active |
| Attribution saved | Passed. `profiles.acquisition` held the test campaign and landing page |
| AI counter | Passed. One scenario graded, `ai_usage_daily` at 1 |
| Second checkout refused | Passed |
| Stripe receipt to the customer, payment notice to the owner, webhook deliveries | Passed |
| Account deletion refused while subscribed | Passed |
| Manage billing | Failed twice, then passed on two devices after the site address fix |
| Renewal date | Empty after purchase (bought before the fix). Filled when the plan was cancelled: 2026-11-11 |
| Sign-in with captcha protection on | Passed. Supabase refuses a sign-in with no token |
| Password reset email | Arrived. Its link pointed at the Site URL, not `/reset-password`; see `To_do_list.md` |

Not checked: the join link behind a login, the phone checkout return, the two mobile field fixes on a phone, the e2e suite, and crawler access from outside Australia.

### Rules for new code (added here)

- **Check `error` on every supabase-js write that matters.** It returns the error; it does not throw.
- **Limit signed-in routes by user, not by IP.** A whole venue can sit behind one address.
- **Build outside links with `siteOrigin()`** (`lib/site-url.ts`), not from the environment variable directly.
- **Build emails on `brandedEmailHtml()`** with `emailButtonHtml()` and `emailFallbackLinkHtml()`, and escape anything a person typed.
- **Fields on `/mobile` are 16px.** Smaller text makes iOS zoom the page.
- **Do not answer the browser with a 502.** Its body may not arrive. Use a 4xx with the reason.

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
- **A new file type in `public/` must be added to the `_routes.json` exclude list** in the `build:cloudflare` script, or production returns 404 for it. Check a direct URL on the Cloudflare preview, not on `next start`.
- **When markup is replaced, delete its CSS in the same change.** `npm run lint:css:unused` lists what is left behind.
- **A table with RLS on and no policy is deliberate.** Reach it through an API route with the admin client. Do not add an open policy to silence the advisor.
- **A clickable row or card needs a keyboard path:** `tabIndex={0}`, Enter and Space, and a visible focus style.
