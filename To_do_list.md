# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week1-handoff.md` and git history.

## Pre-launch

The audit, the launch gate and what the cleanup changed are in `docs/handoff/2026-10-pre-launch-handoff.md`. Merged to `main` on 2026-10-10 (pull request #2), together with `preview/remove-legacy-mobile`. The follow-up photo and mobile layout fixes went in on 2026-10-11 (pull request #3).

- [ ] **Owner dashboard actions.** The Cloudflare WAF rate-limit rule on the public form and AI routes, with a threshold high enough for a whole venue behind one IP; an OpenAI monthly budget and alert. Leaked-password protection needs Supabase Pro, so it waits for a plan change.
- [ ] **Make the `checks` job required on `main`** in the GitHub branch settings, now that CI has run.
- [ ] **Check the AI photo on production.** Released 2026-10-11. On an iPhone, confirm the face oval and that a saved photo shows on Home without a reload. Android was not tried at all: take a photo, save it, and check it on Home.
- [ ] **Look over the `/mobile` screens at full width.** The frame no longer leaves a strip down each side; no screen was seen behind a login after the change.
- [ ] **Re-capture the mobile e2e baselines** against production. The placeholder images were re-encoded and the mobile frame now uses the full phone width (2026-10-11), so every screenshot will differ.
- [ ] **Split `app/globals.css` by surface.** Still one 216 KB file on every page.
- [ ] **An e2e test from sign-up through checkout.** Nothing tests the payment path.

## Before any marketing spend

The audit, what was fixed on 2026-10-11 and 12, and what was checked on production are in `docs/handoff/2026-10-pre-launch-handoff.md` under "Pre-marketing blockers". What is left:

- [ ] **Confirm the reset link opens the new-password screen.** The reset email of 2026-10-12 carried `redirect_to=https://www.servebyexample.co`, the Site URL, not `/reset-password`. The owner changed Authentication, URL Configuration the same day (Site URL without `www`, and `https://servebyexample.co/**` on the redirect list). Request a reset and follow the link to confirm.
- [ ] **Google sign-in screen.** The Google app was switched from Internal to External and published on 2026-10-12, so any Google account can now sign in. Still to do in Google Cloud Console (project number `971763423157`), Google Auth Platform, Branding: app name, support email, the home page, privacy policy and terms links, and `servebyexample.co` as an authorised domain. Adding a logo starts Google's brand verification, which needs the domain verified in Search Console. Then check Clients: the only authorised redirect URI should be the Supabase callback.
- [ ] **Protect the Google account that owns that project.** Turn on 2-step verification and add a second owner under IAM. If that one account is lost, Google sign-in cannot be changed or repaired.
- [ ] **Error tracking and alerts.** Nothing reports production errors. See "Error tracking" below. At the least, be told about Stripe webhook failures and OpenAI failures. Until then, turn on Stripe's own email for failed webhook deliveries (Developers, Webhooks, the endpoint's settings).
- [ ] **Conversion events.** Only `advisory_cta_click` is tracked. Add sign-up, trial started, checkout started and purchase. A purchase event needs a real payment to test.
- [ ] **Visit counts.** Google Analytics loads only after opt-in. Cloudflare Web Analytics is not set up; its script needs a CSP allowance in `middleware.ts`.
- [ ] **Ad pixels and the CSP.** Add each platform's hosts to `connect-src` in `middleware.ts` before installing its pixel. Also accept cookies on the live site and check the browser console: `connect-src` lists only `www.google-analytics.com`, and Google Analytics sometimes sends to a regional host.
- [ ] **Define the funnel numbers before spending.** Visit to sign-up, sign-up to first scenario completed, trial to paid, and cost per paying venue. Attribution is stored (`profiles.acquisition` and Stripe metadata), so these can be SQL queries.
- [ ] **Supabase Auth email.** Confirm Auth sends through Brevo, not the built-in mailer, and raise the hourly email limit under Authentication, Rate Limits.
- [ ] **Cloudflare plan.** Confirm Workers Paid. The free tier allows 10 ms of CPU per request.
- [ ] **Backups.** The Supabase free plan has none. Upgrade to Pro or schedule a `pg_dump`.
- [ ] **Confirm crawlers get through.** Search Console URL Inspection on `/` and `/membership`, and Meta's Sharing Debugger. Both should show the page, not `/restricted`.
- [ ] **Decide the AI limits.** 30 requests a day on the free tier and 300 on paid (`lib/ai-usage.ts`), shared across grading, Arena and both coaches. The count was seen to work; what staff see at the limit was not.
- [ ] **OpenAI rate-limit tier.** Check it covers a busy session, and add one retry on a 429 in `lib/scenario-evaluator.ts`.
- [ ] **Error boundaries** for `/dashboard` and `/mobile`. Only `/management/dashboard` has its own.
- [ ] **Retire `/auth`.** A second sign-up page with the old card. Redirect it to `/login`.
- [ ] **Turnstile on previews.** The widget's hostname list could not take the `pages.dev` address, so captcha protection has to be switched off in Supabase to sign in on a preview.
- [ ] **Signed-in routes with no rate limit.** Recount them: the management routes are limited through `requireManager()`.
- [ ] **A Pro member cannot move to a venue plan.** Checkout refuses anyone with a live subscription (`app/api/billing/checkout/route.ts`), and tells them to change it from Billing. The Stripe portal only lets them cancel or change card unless plan switching is switched on there. Decide the upgrade path: plan switching in the portal, or an upgrade that replaces the Pro subscription.
- [ ] **Remove or repair the old guest-purchase path in the webhook.** New checkouts need an account, so `handleCheckoutComplete` no longer needs to find or invite a buyer by email. That branch looks the buyer up in the `auth` schema, which the API does not expose, and its fallback (`app/api/billing/link-pending/route.ts`) sets a tier without creating an organisation. Delete both once no guest checkout session can still complete, or fix the lookup to read `profiles`.

## Checks to finish

- [ ] **Check the legacy mobile removal.** The old mobile view inside `/dashboard` is gone from production (merged 2026-10-10); these two checks were not done. On a computer, narrow the `/dashboard` window to about 700px and 375px: the nav should sit on top as a wrapped row, every item should open, Sign out should be reachable, and nothing should scroll sideways. On a phone, signed in, open `/dashboard?join=<venue code>`: it should land on Settings, join once and drop the code from the URL.
- [ ] **Join link through sign-in, behind a real login.** Fixed 2026-10-12 and checked signed out only. Signed out, open a venue's staff sign-up link on a computer and on a phone, create an account, finish onboarding, and confirm the account ends up connected to the venue. Not covered: confirming the email on a different device from the one the link was opened on.
- [ ] **Phone checkout return.** Fixed 2026-10-12, not confirmed on a phone. Buy Pro on a phone and confirm the plan shows on mobile Home at once.
- [ ] **Mobile text fields on an iPhone.** Fixed 2026-10-12, not confirmed. In Settings, tap each field: no "rotate your device" screen. Go back to Me: the screen does not move sideways. Turn the phone on its side: the rotate screen still appears.
- [ ] **`www` redirect.** Added 2026-10-12, not seen on production. Open `https://www.servebyexample.co/membership` and confirm the address bar changes to `servebyexample.co`. Then sign in with Google once, since that return trip may pass through `www`.
- [ ] **Run the e2e suite with the new sign-in.** `tests/e2e/global-setup.ts` no longer uses the login form; it has never been run. It needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `E2E_TEST_EMAIL`.
- [ ] **New e2e baselines.** Run the suite once with `--update-snapshots=all` to capture the Help, Report a bug, Privacy and Terms screenshots. Check that the new no-horizontal-scroll test passes on all 22 `/mobile` routes.
- [ ] **Roster unlink on account deletion.** Not exercised yet. Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

- [ ] **Sign in on the redesigned `/login`.** Only its layout was checked. Sign in as staff and as a manager, create an account, use Google, and send a password reset.
- [ ] **Run the demo against the live evaluator.** `/demo` and `/demo/complaint-master` were checked with a mocked score. Submit one real answer on each and confirm the feedback text has no em dashes.
- [ ] **Run the marketing e2e suite** against production. It was not run after the 2026-10-09 changes.

## Error tracking

- [ ] **Decide on Sentry, then build it fresh.** Nothing reports production errors today. Branch `preview/sentry-error-tracking` (`55f0960`, August) adds `@sentry/nextjs` but conflicts in four files and carries an old cookie banner and analytics setup that `lib/consent.ts` has since replaced, so do not merge it. A new build needs: a Sentry DSN set in Cloudflare Pages, a check that the SDK runs under OpenNext on Cloudflare and does not push the worker over its size limit, a decision on whether it waits for cookie consent, and a line in the privacy policy naming Sentry as a processor.

## Manager Console

- [ ] **Check the redesigned console behind a real login.** It went to production on 2026-10-09 having only been viewed locally with sample data. Go through every tab, the collapsed sidebar, the account menu and Sign out, and ask the AI Coach a question then use New chat.
- [ ] **Review the Needs Attention rule.** `lib/management/needs-attention.ts` flags anyone whose status is not "on-track", which flagged 25 of 25 staff on one live venue, including a person at 100%.
- [ ] **Store daily training activity.** Only each person's last-active date is kept, so the Overview tab cannot show a trend over time.
- [ ] **Finish the last console screens.** The trial billing screen (Settings, Billing, during a trial), Notifications and Training programs still use the older cards. None is in the menu.
- [ ] **Decide whether the AI Coach should remember the conversation.** Each question is answered on its own; a follow-up such as "and what about Mia?" has no context.
- [ ] **Trial prompt in the collapsed sidebar.** The upgrade card is hidden while the sidebar is an icon rail.

## Email

- [ ] **Brand the Stripe emails and invoices.** Receipts, invoices and the billing portal still use Stripe's defaults. In Stripe, Settings, Branding: logo, icon, brand and accent colours. Settings, Emails: the support address and reply-to. Settings, Billing, Invoices: the invoice footer and business details. Set the statement descriptor so the card charge reads as Serve By Example.
- [ ] **Move every Brevo email onto the shared shell.** The shell was redesigned on 2026-10-12 (`brandedEmailHtml()`, `emailButtonHtml()` and `emailFallbackLinkHtml()` in `lib/email-template.ts`). Password reset, toolkit delivery, bug report and the notification confirmation use it. Still building their own HTML: staff invite and resend (`app/api/management/staff`, `memberships`), contact, book-a-call and the ROI email. Also the emails Supabase Auth sends itself (sign-up confirmation, email change), which use Supabase's templates until they are edited in Authentication, Emails.

- [ ] **Re-send failed toolkit emails.** Manual for now: `select * from toolkit_leads where toolkit_delivered = false` (0 on 2026-10-05). Add a small admin action if the count grows.
- [ ] **Build the weekly digest and Sunday reminder sender.** Settings lets staff opt in, and the confirmation email promises "every Monday morning" / "every Sunday night", but nothing sends them yet (0 opted in on 2026-10-05, so no one is waiting). Cloudflare Pages has no cron, so this needs Supabase `pg_cron` plus an Edge Function, or a separate scheduled Worker. Send only to profiles with the flag true. Once it works, add a one-off, dismissible opt-in card on mobile Home linking to Settings > Notifications. Don't email people about it, since they haven't consented.
- [ ] **A `preview` env for email links.** Toolkit emails hard-code `https://servebyexample.co`, so open tracking and unsubscribe can't be tested on a preview. Low priority.

## Database cleanup

- [ ] **Drop the dead schema.** The code that stopped writing these has been live since 2026-10-06, so this can run any time. Still to write: one migration plus a rollback file that drops the `pending_invites` table and the `profiles` columns `avatar`, `role`, `manager_id`, `notif_achievement_alerts`, `platform_version`, `diagnostic_completed_at`, `is_founders_user` and `all_modules_completed` (their indexes and the `manager_id` foreign key go with them). Replace `award_sbe_elite()` first so it no longer sets `all_modules_completed`. Checked 2026-10-06: nothing else depends on them. Lost for good: `role` (4 rows, all "manager") and `notif_achievement_alerts`. Afterwards remove the "pending drop" notes from `docs/DATABASE_SCHEMA.md`.
- [ ] **Decide on `profiles.venue_type` and `experience_level`.** Kept for now (2026-10-06). Onboarding writes them and nothing reads them (6 of 90 rows filled). Either use them for personalisation or segmenting, or drop them and the onboarding write.
- [ ] **Second pass on other tables.** Unused by code on 2026-10-06: `venues.completion_rate`, `avg_scenario_score`, `upsell_rate` (never written), `enabled_module_ids`, `force_diagnostic_on_join`, and `report_schedule` (written, never read); `venue_staff.skill_level`, `rsa_state` and `organization_member_id` (filled on 75 rows, so check before dropping). About 20 indexes have never been used. 79 of 91 accounts have never signed in; confirm whether they are seeded demo staff.

## Marketing copy to source or remove

Flagged during the October page redesign (`preview/marketing-redesign`). The wording was carried into the new layouts unchanged. There is no customer data behind any of these yet.

- [ ] **Outcome figures with no source.** "90%+ completion rates" (`/platform`, `/vs-generic-lms`); "+15% avg upsell improvement" and "3x faster onboarding" (`/platform`); "65% faster completion" and "40% higher knowledge retention" (`/platform/challenges`); "reduces turnover by 20 to 23%" (`/for-venues`, `/vs-generic-lms`); "20 to 30% for video-based LMS courses" (`/vs-generic-lms`). Give each a source or remove it.
- [ ] **Industry figures that need a citation.** "3 to 9% net profit margins" and "39% of FOH and 42% of BOH staff quit within 90 days" (`/for-venues`, `/vs-generic-lms`).
- [ ] **Product counts to confirm.** "40+ training modules", "65+ scenarios", "5 dims", "125 staff across 5 venues", and "Scalable from 5 to 500 staff" on `/solutions/franchise-systems`, which is above the 125 limit stated elsewhere.
- [ ] **"No credit card" lines** on `/solutions/pub-groups` and `/vs-generic-lms`. `/pricing` dropped this wording when buy-now was added.
- [ ] **Competitor claim.** The `/platform` closing band says incumbents are "still in the planning phase".
- [ ] **Two different guarantees.** `/demo` says "Our No-Brainer Guarantee: ... If your staff doesn't complete their first live scenario within 7 days, you pay $0" (`app/demo/_components/LeadCapturePane.tsx`). The rest of the site states a 14-day guarantee. Pick one.
- [ ] **Em dashes in the staff product.** The 2026-10-09 sweep covered marketing pages, emails and the login page. About 50 remain in visible text on `/dashboard` and `/mobile`.
- [ ] **`/auth` and `/reset-password` still use the old login card.** `/login` was redesigned on 2026-10-09; these two were not.
- [ ] **`/security` names OpenAI.** `docs/Pages-Redesign.md` 6.2 says not to name the AI model. Kept as a provider disclosure; confirm that reading.

