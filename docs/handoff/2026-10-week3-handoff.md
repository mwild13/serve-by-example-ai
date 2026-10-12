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

### Still open

Google's checker very likely requests from outside Australia. The home page is Australia-only, so it would be sent to `/restricted`. Whether to open the home page to every country is the owner's decision.

