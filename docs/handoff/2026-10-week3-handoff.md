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

- **`/auth`** redirects to `/login` from `next.config.js` (a 307 that carries the query string over). `app/auth/page.tsx` and `app/auth/layout.tsx` were deleted. It was first built as a page that redirected, which answered 200 and redirected a moment later in the browser; Part 4 replaced that. `/auth/callback` is a separate route and was not touched. Nothing in the code linked to `/auth`.
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

## Part 2: Google sign-in from a preview, the guest-purchase path and rate limits

- **Date:** 2026-10-12
- **Branch:** `preview/oct-w3-todo-sweep`. Not merged to `main`.

### The short version

1. **Google sign-in "went to the home page the first time" because it was started on the preview.** It is a Supabase setting, not a fault in production sign-in. One line of safety net was added in `middleware.ts`.
2. **The old guest-purchase path is gone** from the Stripe webhook, with the `link-pending` route and its two calls at sign-in.
3. **Twelve more routes have a rate limit.**

### Google sign-in

- **What happened.** The Supabase Auth log for 2026-10-11 15:38 to 15:41 UTC shows each first attempt asking to return to an address Supabase did not accept, so it fell back to the Site URL, `https://servebyexample.co`, and sent the visitor to the production home page with the one-time code still in the address. Nothing exchanged the code, so they looked signed out. The second attempt started on production, returned to `https://servebyexample.co/auth/callback` and worked.
- **Why.** The preview address is not on the Redirect URLs list. Only `https://servebyexample.co/**` is.
- **The setting to change.** Supabase, Authentication, URL Configuration, Redirect URLs: add `https://*.serve-by-example-ai.pages.dev/**`. It is in the to-do list. Until then Google sign-in cannot work on any preview.
- **The code change.** `middleware.ts` now sends `/?code=...` to `/auth/callback`. If the sign-in was started on the same host it completes. If it was started on another host, as from a preview, the visitor lands on `/login` with the sign-in error shown, not on a home page that says nothing.
- **Not checked.** Neither case was run in a browser.

### Guest purchases

- `handleCheckoutComplete` in `app/api/billing/webhook/route.ts` no longer looks a buyer up by email or invites them. A session with no `userId` in its metadata is logged and ignored. The site's own checkout has needed a signed-in account since 2026-10-11, and nothing in the code links to a Stripe payment link.
- `app/api/billing/link-pending/route.ts` is deleted, and `app/login/page.tsx` no longer calls it after sign-in and sign-up. That call listed Stripe customers on every sign-in.
- **Not checked.** Stripe was not reachable from this session, so whether a payment link exists in the Stripe dashboard is unknown. One would now charge the buyer without applying a plan. It is in the to-do list under Stripe.

### Rate limits

- Per signed-in user, per minute: `verify-session` 10, `onboarding/complete` 10, `profile/update-name` 10, `profile/notifications` 60 to read and 10 to change, `billing/trial/start` 5, `billing/trial/status` 60, `billing/trial/mark-modal-shown` 20, `training/diagnostic/start` and `submit` 10 each, `training/modules` 60, `training/modules/[moduleId]` 120.
- `auth/verify-redirect` is reached before sign-in, so it is limited by IP at 30 a minute.
- `training/save` was left alone: it is a retired route that only answers 410.
- The limiter is in memory on each Cloudflare node (`lib/rate-limit.ts`), as before, so these are a brake on a runaway client, not a hard cap. The WAF rule is still wanted.

### Checked

- `npm run typecheck`, `eslint` on `app/api`, `app/login` and `middleware.ts`, and `vitest` all pass.
- Not checked: no checkout was run against the changed webhook, and no route was pushed past its limit.

## Part 3: refund policy page and the dead-schema migration

- **Date:** 2026-10-12
- **Branch:** `preview/oct-w3-todo-sweep`. Not merged to `main`.

### The short version

1. **`/refunds` exists.** A Refund and Cancellation Policy page, to link from Stripe.
2. **The dead schema is dropped.** The migration was written here and run by the owner.
3. **The owner has Stripe payment links.** They do not work with the webhook on this branch. This has to be settled before the merge.

### `/refunds`

- `app/refunds/page.tsx` restates section 5 of `/terms` and adds nothing to it: a refund of the first subscription payment within 14 days, cancel any time with access to the end of the paid period, the Australian Consumer Law rights, and how to ask (email `info@servebyexample.co`). If the refund terms change, both pages change.
- It is in the footer, the sitemap and the marketing e2e page list, and on `publicRoutes` in `lib/geo-config.ts` so Stripe's reviewers and overseas card holders can open it.
- `/demo` still states a different guarantee (7 days). That decision is still open in the to-do list.
- Not checked: the page was not viewed in a browser.

### Dead-schema migration

- `supabase/migrations/20261012b_drop_dead_schema.sql` with `supabase/rollbacks/20261012b_drop_dead_schema_rollback.sql`. One transaction: it replaces `award_sbe_elite()` so it no longer sets `all_modules_completed`, drops `pending_invites`, then drops the eight `profiles` columns.
- Checked against production first: the only things that depend on them are that function, the indexes `idx_profiles_platform_version` and `idx_profiles_manager_id`, and the `profiles_manager_id_fkey` foreign key. No view, policy or trigger does, and no code on `main` or this branch reads or writes them.
- **Run by the owner on 2026-10-12 and confirmed:** the table and all eight columns are gone, and `award_sbe_elite()` no longer mentions `all_modules_completed`. `docs/DATABASE_SCHEMA.md` is updated.

### Payment links

Part 2 removed the guest-purchase path on the understanding that nothing was sold outside the site's own checkout. The owner has since said a few payment links exist. On `main` today such a purchase half works: a new email is invited and given the plan, an existing account gets the plan at next sign-in but no organisation. On this branch it is logged and ignored. Either the links are deactivated, or the webhook is changed to handle them properly. Do not merge until one of those is done.

## Part 4: trial chip, `/reset-password` and the `/auth` redirect

- **Date:** 2026-10-12
- **Branch:** `preview/oct-w3-todo-sweep`. Not merged to `main`.

### What changed

- **Trial prompt on the collapsed sidebar.** `TrialStatusPill` now carries a small chip (the days left, or "Trial ended") that is the only part shown while the Manager Console sidebar is an icon rail. It links to Billing like the full card. `ConsoleSidebar` no longer hides the trial slot when collapsed. Styles are next to `.mc-upgrade-card` in `app/globals.css`. The card's description also lost its em dash.
- **`/reset-password` matches `/login`.** Same split layout, brand mark and right-hand panel. The brand mark and panel moved out of `app/login/page.tsx` into `components/LoginSplitParts.tsx` so both pages share them. The form and its behaviour are unchanged.
- **`/auth` is a real redirect now**, set in `next.config.js`.
- **Database.** The dead-schema migration from Part 3 was run by the owner and confirmed.

### Checked

- Locally: `/auth?checkout=success` answers 307 to `/login?checkout=success`; `/auth/callback` is not caught by it; `/?code=...` answers 307 to `/auth/callback`; `/reset-password` was viewed at 1280px and matches `/login`.
- `/refunds` returns its content from the server, but the page could not be viewed locally: this machine has no Supabase settings, and the Navbar fails without them on every marketing page. Look at it on the preview.
- Not seen: the trial chip (needs a trial account), and `/reset-password` at phone width.
- `npm run typecheck`, `eslint` and `vitest` (57 tests) pass.

### Found on the way

The site's default page title reads "Train Hospitality Staff 3x Faster" (`app/layout.tsx`, `app/page.tsx`). "3x faster" was one of the unsourced figures thought to be gone. It is in the to-do list under Marketing copy.

## Part 5: the last Brevo emails on the shared shell

- **Date:** 2026-10-12
- **Branch:** `preview/oct-w3-todo-sweep`. Not merged to `main`.

### What changed

- **Every email the app sends through Brevo now uses `brandedEmailHtml()`.** Moved in this part: the staff invite (`app/api/management/staff`), the membership invite and its resend (`app/api/management/memberships`, `memberships/resend`), the contact enquiry, the book-a-call request, and both ROI emails (the projection sent to the visitor and the lead alert sent to us).
- **Two new helpers in `lib/email-template.ts`:** `emailFieldTableHtml()` for label and value rows, which leaves out empty rows, and `emailNoteHtml()` for a boxed block of longer text. `lib/email-template.test.ts` covers both.
- **Wording.** The invites lost "You've been invited!" for "You have been invited", and the green button is now the shell's button. Subjects, recipients, reply-to addresses and the links themselves are unchanged. Empty fields in the book-a-call email read "Not given".
- **Still not on the shell:** the emails Supabase Auth sends itself (sign-up confirmation, email change). Those are edited in the Supabase dashboard and are in the to-do list.

### Checked

- `npm run typecheck`, `eslint` and `vitest` (59 tests) pass.
- Not checked: no email was sent, so none was seen in a mail client. That is in the to-do list under testing.

### Found on the way

The ROI projection email and the calculator state their assumptions as facts ("23% of replacement costs recovered", "published AU hospitality benchmarks"). The wording was kept as it was and added to the to-do list under Marketing copy.

## Part 6: terms, ROI wording, and the last three code items

- **Date:** 2026-10-12
- **Branch:** `preview/oct-w3-todo-sweep`. Not merged to `main`.

### Owner decisions recorded

- `/refunds` was checked by the owner on the preview.
- "Train Hospitality Staff 3x Faster" stays in the page title. Removed from the to-do list.
- The ROI calculator keeps its numbers. Its wording changed (below).

### What changed

- **Terms of Service (`app/terms/page.tsx`).** Dated 12 October 2026. Section 5 gained a free trial clause (14 days, no payment details, no charge when it ends, paid features stop unless you subscribe) and a link to `/refunds`. Nothing else was reworded. This has not had legal review.
- **ROI calculator and its email.** The figures and the sums are unchanged. Each line now starts "Assumes", and "Based on published AU hospitality benchmarks" became a plain statement that these are our modelling assumptions, not measured customer results. Reason: no published source could be named for them, and a claim of a source that cannot be produced is the risk, under the Australian Consumer Law more than with Google.
- **Conversion events (Google Analytics, only for visitors who accepted analytics cookies).**
  - `sign_up`: email sign-up in `app/login/page.tsx`; Google sign-up through `app/auth/callback`, which adds `?signup=google` for an account under two minutes old.
  - `trial_start`: the pricing board and the login page's trial path.
  - `begin_checkout`: the pricing board and the trial billing screen.
  - `purchase`: `components/ConversionEvents.tsx` (mounted in `app/layout.tsx`) sees the return from Stripe, asks `/api/verify-session` for the amount, and sends it once per checkout session. `/api/verify-session` now returns `value` and `currency`. A phone returning from Stripe keeps the checkout parameters when it is sent on to `/mobile/home`, so the event fires there too.
- **Staff status is now calculated, not stored.** `deriveStaffStatus()` in `lib/management/needs-attention.ts`: finished or yet to start is on track, 14 quiet days is attention, 30 is inactive. `mapStaff()` uses it and no longer reads `venue_staff.status`. The column is left in place; it can be dropped later.
- **Notifications, Training programs and the trial billing screen** are rebuilt on the shared console parts (`console-ui.tsx`). The trial billing screen keeps its four sections: countdown, real stats, consequences and pricing, call to action. It no longer names a font family, and "Annual, save 17%" now reads "2 months free" to match the pricing page. Notifications gained a "Yet to start" alert, and its wording now matches the calculated status.

### Checked

- `npm run typecheck`, `eslint` and `vitest` (61 tests) pass.
- Not checked: none of the three console screens was seen in a browser (the console needs Supabase settings this machine does not have). No conversion event was seen in Google Analytics. Both are in the to-do list under testing.

### Still blocking the merge

The four Stripe payment links (Enterprise, Commercial, Boutique, Pro Model) are active and have taken no payments. On this branch a purchase through one charges the buyer and applies no plan.

### After the owner's check (same day)

- **Notifications and Training programs are hidden.** A `?tab=` link to either now lands on Overview and the "t" shortcut is gone. The screens stay in the code. Parked in the to-do list.
- **Checking the conversion events in Google Analytics** is parked.
- **Staff status** was accepted by the owner.
- **"We could not confirm you are not a robot" on the preview** is not new: the Turnstile widget does not accept the `pages.dev` address, so email sign-in cannot work on any preview while captcha is on. Google sign-in does not use the captcha.
- **The four Stripe payment links were deactivated by the owner**, and the trial billing screen passed the owner's check on the preview. Nothing known blocks the merge.

## Part 7: Google sign-in brand verification

- **Date:** 2026-10-12
- **Released:** `preview/oct-w3-todo-sweep` was fast-forwarded onto `main` at `ad5c857` before this part. `/refunds` is live.

### The problem

Google Cloud Console refused brand verification with three findings: the privacy policy "does not have sufficient content", the home page "is behind a login page", and the home page "does not explain the purpose of your app".

### Cause found

`app/loading.tsx` at the root made every public page arrive as a "Loading" screen, with the real content in a hidden block that JavaScript swaps in. A reader that does not run JavaScript saw only "Loading". `/privacy` is open to every country, so the geo-block cannot explain that finding; this does.

### What changed

- **No root loading screen.** It moved to `components/RouteLoading.tsx` and is used by new `loading.tsx` files under `app/dashboard`, `app/management` and `app/mobile` only. Checked locally: the privacy text is now in the visible HTML of `/privacy`.
- **Privacy policy:** new section 11, "Signing In With Google" (what Google sends, how it is used, stored and removed, and the Limited Use statement). Dated 12 October 2026.
- **Footer:** the link reads "Privacy Policy" instead of "Privacy".

### Home page opened to every country

The owner chose to open the home page to every country (`'/'` added to `publicRoutes` in `lib/geo-config.ts`), because Google's checker very likely requests from outside Australia. Every other marketing page and the whole app stay Australia-only. The owner retries the verification in Google Cloud Console once this is live.

### Build failure and fix

The three pushes after `ad5c857` failed to build on Cloudflare: `useSearchParams() should be wrapped in a suspense boundary at page "/onboarding"`. The root `app/loading.tsx` had been the Suspense boundary for `/onboarding` and `/session-conflict`, and removing it was not followed by a production build. Both pages now have their own boundary, and `next build` passes locally. Production stayed on `ad5c857` throughout, so the live site was never broken. Lesson: run `next build` before releasing a change to routing or layout files; typecheck and unit tests do not catch this.

### Where the verification stands (end of 2026-10-12)

Read through an overseas reader service, `/` returns the real home page and `/privacy` the full policy with section 11, while `/pricing` still returns "Australia Only", so the home page opening works from outside Australia. The three Branding fields in Google Cloud Console were already correct. The owner removed two duplicate authorised domains and re-submitted. Google now shows the branding as under review: "Branding guidelines" passed, "Privacy policy requirements" still flagged, "Homepage requirements" pending. Parked in the to-do list.

Note to send on Google's Trust and Safety email thread:

> The home page https://servebyexample.co is public and does not require login. It describes the app (scenario-based staff training for hospitality venues) and links to the privacy policy in the footer. The privacy policy at https://servebyexample.co/privacy is public, and section 11 "Signing In With Google" explains what Google user data we receive, how we use, store and share it, and how to remove it. Until 12 October 2026 the home page redirected visitors outside Australia to a region notice; that has been removed.

## Part 8: marketing claims, one guarantee, seat limits and the `/security` wording

- **Date:** 2026-10-12
- **Released:** `main` was fast-forwarded to `bcebe74` on 2026-10-12.

### The short version

Every unsourced percentage is off the marketing pages, the site states one guarantee, the seat numbers match what the code enforces, and `/security` now describes what is actually sent to OpenAI.

### What changed

- **Outcome figures removed.** "90%+ completion rates", "reduces turnover by 20–23%" and "20–30% for video-based LMS courses" are gone from `/platform`, `/for-venues` and `/vs-generic-lms`. The owner's wording replaces them: "industry-leading completion rates" and "proven to reduce early turnover".
- **Industry figures removed.** "3–9% net profit margins" is now "razor-thin hospitality margins"; "39% of FOH and 42% of BOH staff quit" is now "high 90-day turnover".
- **Stat tiles.** The `/platform` tiles "90% mobile completion", "3× faster onboarding" and "+15% avg upsell improvement" and the `/vs-generic-lms` tile "90%+" were the same kind of claim in large type. They now show product facts: the 3-stage path, 5 scored dimensions, the 14-day trial. The `/platform` section title changed from "What the platform is built to move" to "What is in the platform".
- **One guarantee.** `/demo` said "No-Brainer Guarantee ... within 7 days, you pay $0". It now carries the same 14-Day Performance Guarantee wording as the home page, pricing and the solution pages.
- **Competitor claim.** "while the incumbents are still in the planning phase" on `/platform` is now "with a platform built for hospitality, not corporate desks".
- **Seat limits.** The code enforces 15 seats on Venue, 35 on Group and no limit on Franchise, with no venue cap on Group or Franchise (`TIER_SEATS` in `lib/session.ts`). No plan has ever had a 125-seat or 5-venue limit, so "125 staff across 5 venues" was wrong, and changing "500" to "125" would have added a third wrong number. `/solutions/franchise-systems` now reads "Scales from 5 staff to unlimited seats"; `/solutions/pub-groups` and `/vs-generic-lms` state 35 on Group and unlimited on Franchise.
- **"5 dimensions" confirmed.** The evaluator scores exactly five categories (`lib/scenario-evaluator.ts`), so that count stays.

### `/security` and OpenAI

Naming OpenAI stays. `docs/Pages-Redesign.md` 6.2 is about not naming the model in marketing copy; a security page that hid the provider would be worse, and the privacy policy already names it.

The page was wrong in a different way. It said no venue names, staff names or operational data are sent to OpenAI, and that menu specs are never shared with model providers. That is true of scenario evaluation. It is not true of the Manager AI Coach, which sends the venue name, every staff member's name, role and scores, and the inventory list with each question (`app/api/management/coach/route.ts`). The page now says so in its own item, and the privacy policy's OpenAI line (web and `app/mobile/_components/PrivacyScreen.tsx`) names coaching and translation and the staff data.

### Checked

Typecheck and lint pass. No page was opened in a browser.

### Second pass, same day

The owner chose wording that states intent, not results, and had the "no credit card" lines replaced.

- **"Proven" and "industry-leading" removed.** Now "designed to boost staff retention in the first 90 days" (`/for-venues`, `/vs-generic-lms`) and "built for fast completion between shifts" (`/platform`, `/vs-generic-lms` twice).
- **Setup time.** "1 day average setup time" and "Most venues are fully set up within a day" are now "Zero complex onboarding. Set up your first venue in an afternoon" (`/vs-generic-lms` tile and table, home page FAQ). The owner's wording had an em dash; it is a full stop here, as the site uses none.
- **"No credit card" removed everywhere it described the trial or demo.** The trial lines read "14-day free trial. Cancel anytime." (`app/page.tsx`, `components/HeroSection.tsx`, `app/pricing/page.tsx`). The demo lines on `/vs-generic-lms`, `/solutions/pub-groups` and the home page FAQ lost the phrase too. The toolkit page keeps its line, which is about the free download.

### Closed by the owner

- **OpenAI disclosure stays as written** on `/security` and in the privacy policy.
- **One setup line everywhere:** "Create your account in 2 minutes, launch your venue in under 10." It replaced "Set up in under 10 minutes" (hero, `/demo`, `/demo/complaint-master`, `/pricing`) and "set up your first venue in an afternoon" (home page FAQ, `/vs-generic-lms` table). The `/vs-generic-lms` tile reads "10 min to launch your venue". These times are the owner's and have not been timed against a real sign-up.

Section 2 of `To_do_list.md` has nothing open. The second and third commits were made on `fix/pre-marketing-blockers` at the owner's request and fast-forwarded into `preview/oct-w3-todo-sweep`. That old branch was already merged through PR #5 and held nothing else, so it was deleted locally and on the remote.

## Part 9: Cloudflare rate-limit rule

- **Date:** 2026-10-12
- **Where:** Cloudflare dashboard, `servebyexample.co` zone, Security, Security rules. Nothing in the code changed.

The zone had no rate limiting rule. The owner created one through Cloudflare's assistant.

- **Covers:** `/api/contact`, `/api/book-call`, `/api/toolkit-capture`, `/api/roi/email`, `/api/report-bug`, `/api/auth/forgot-password`, `/api/demo/evaluate`, `/api/evaluate`, `/api/arena/evaluate`, `/api/coach`, `/api/management/coach`, `/api/translate`.
- **Settings:** counted per IP over 10 seconds, action Block (a 429) for 10 seconds. The threshold is 50, read off the rule by the owner.
- **Limits of the Free plan:** one rule only, so the forms share the loose threshold the AI routes need for a venue of 35 on one Wi-Fi address. It cannot filter by method, so every request to these paths counts, not only POST. The period and block time are fixed at 10 seconds. Counts are kept per Cloudflare data centre. Separate strict limits for the forms need the Pro plan (two rules).
- **Why it matters:** the app's own limiter (`lib/rate-limit.ts`) keeps counts in memory, separately on each server instance, so it does not hold against a flood. This rule is the only limit applied consistently, and it stops a flood before it reaches OpenAI.
- **When adding a public form or AI route:** add its path to this rule's expression as well as calling `rateLimit` in the route.

## Part 10: Cloudflare Web Analytics was already running

- **Date:** 2026-10-12
- **Branch:** `preview/oct-w3-todo-sweep`.

### What was found

The to-do list said Web Analytics was not set up. It is: `servebyexample.co` has been registered in Cloudflare Web Analytics with automatic setup since 2026-05-18, and recorded 457 page views across 156 visits in the week to 2026-10-12. The Pages project has no separate entry.

Automatic setup works with the strict content security policy. Cloudflare inserts its beacon script at the edge and copies the page's nonce onto it, and the beacon reports to `/cdn-cgi/rum` on the site's own domain, which `connect-src 'self'` allows. Seen in the live home page HTML on 2026-10-12. The script is not inserted for a request without browser headers, so a plain `curl` does not show it.

### What changed

- **No loader in the code.** A client-side loader and two CSP hosts were written on the assumption that the inserted script would be blocked, then removed the same day once the live page showed otherwise. Loading the beacon from code as well would count every visit twice. A comment in `app/layout.tsx` says so.
- **Disclosure, kept.** Web Analytics had been running without being named. The cookies page now lists Cloudflare Web Analytics (no cookies, runs whatever the cookie settings) and Google Analytics (only after opt-in). The Cloudflare line in the privacy policy, web and mobile, adds "cookieless page visit counts".

### Good to know

- It covers the production domain only. Previews on `pages.dev` are not counted.
- "Exclude EU visitors" is on for this site.
- Visit counts are in the Cloudflare dashboard under Analytics & Logs, Web Analytics.

### Checked

Typecheck and lint pass.

## Part 11: crawlers confirmed, and two things the check turned up

- **Date:** 2026-10-12

### Result

Crawlers get through the geo-block. Checked by the owner with tools that fetch from outside Australia:

- **Google Search Console, Test live URL:** `/` and `/membership` both render the real page.
- **Meta Sharing Debugger:** `/membership` returns 200, fetched as `/membership`, with the share image and title. Its `fb:app_id` warning can be ignored; that property is only for Facebook's own page statistics.

### Blank home page in Google's render, fixed

Google's first screenshot of `/` showed the navbar and then only dark background. The first section (`.sbe-mkt-fold`) had a minimum height of the full screen, and Google's renderer uses a screen many thousands of pixels tall, so the section stretched and the headline sat thousands of pixels down. Reproduced in a 9,000 pixel tall browser: the section was 8,935 pixels and the headline 4,281 pixels from the top. The minimum height is now capped at 60rem (`app/globals.css`), which puts the headline 294 pixels down in the same test. Phones and laptops are unchanged. Released at `df77e00`; the owner's re-test showed page content. This matters for Google's pending "Homepage requirements" review.

Other rules in `app/globals.css` also use a full-screen height. Any page that looks empty in Search Console's screenshot has the same cause and the same fix.

### Every share pointed at the home page, fixed

The Meta result listed the canonical URL of `/membership` as the home page. The root layout set `og:url` to the site address and every page inherited it, so a share of any page was counted and linked as the home page. The fixed `og:url` is removed; Facebook and LinkedIn now use the address that was shared. Every page still shares with the home page's title, description and image, since no page sets its own.

## Part 12: share image, Google account, Stripe and GST

- **Date:** 2026-10-12

### Share image redrawn

The card shown when a page is shared was the old green design. It is now a navy card on the marketing standard (`docs/Pages-Redesign.md`): logo, a gold kicker, one Newsreader headline, a hairline and the site address. The source is `scripts/og-image.html`, with regeneration steps in its header; the output is `public/og-image.png`.

Facebook kept showing the old card after release because it, LinkedIn and Cloudflare cache the image by its address. The address in `app/layout.tsx` is now `/og-image.png?v=2`. Bump the number whenever the image changes. The owner confirmed the new card in Meta's Sharing Debugger.

### Google account

Two-step verification and a second way into the Google Cloud project were set up by the owner. Only the sign-in screen branding is left under Google in the to-do list, and it waits on Google's brand verification.

### Stripe dashboard, done by the owner

- **Policies:** terms, privacy and refund links were already set and show under the pay button at checkout.
- **Failed-webhook emails:** already on. The endpoint is `/api/billing/webhook`.
- **Branding:** logo, green and gold colours, support address `info@servebyexample.co`, receipts for successful payments and refunds.
- **Invoice template:** "Serve By Example default", set as the default. Memo, a footer with the ABN and support address, the ABN shown as a tax ID, A4.
- **Product name:** "Pro Model - SBE AI Training" renamed.

Checked by the owner by opening a real checkout from `/membership` and closing it without paying.

### GST: not registered

The business is not registered for GST, so none is charged. This was asked only after the invoice template had been given a "Tax Invoice" line on the assumption that it was; that line was removed again the same day.

- **Checkout** sets no tax option (`app/api/billing/checkout/route.ts`) and shows no tax line. That is correct.
- **Invoices** say "No GST has been charged" in the footer and do not say "Tax invoice". The tax rate that put a GST line on a hand-made draft invoice was switched off.
- **`/advisory`** said prices "exclude GST" in two places, which implies GST is added on top. Both now say no GST is charged (`app/advisory/page.tsx`).
- **Later:** registration is compulsory at A$75,000 turnover in any 12 months. The steps to switch GST on are in the new "Important" section at the bottom of `To_do_list.md`.

### Checked

Typecheck passes. The `/advisory` change is at `7cc2f35`.
