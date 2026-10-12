# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week3-handoff.md` (this week), the earlier handoffs in `docs/handoff/`, and git history.

Regrouped on 2026-10-12 by who does the work and where. Background for the launch items is in `docs/handoff/2026-10-pre-launch-handoff.md`.

## 1. Code, next up

Small changes, in the order they will be done. Each goes to a preview branch first.

Nothing open. The last three were done on 2026-10-12 and are waiting on the checks in section 4.


## 2. Marketing copy

The unsourced figures and phrases are all gone (2026-10-12). Two owner checks are left.

- [ ] **Read the new OpenAI wording.** `/security` and the privacy policy (web and mobile) now say the Manager AI Coach sends staff names, roles and scores to OpenAI, because it does. Owner: read both once. If that is not wanted, the fix is in `app/api/management/coach/route.ts`, not in the copy.
- [ ] **Two setup times.** The hero, `/demo` and `/pricing` say "Set up in under 10 minutes"; the home page FAQ and `/vs-generic-lms` now say "set up your first venue in an afternoon". Owner: confirm both are meant (creating the account against rolling out a venue), or pick one.

## 3. Owner: dashboards

Grouped by where you sign in. None of these can be done from the code.

### Cloudflare

- [ ] **WAF rate-limit rule** on the public form and AI routes, with a threshold high enough for a whole venue behind one IP.
- [ ] **Confirm Workers Paid.** The free tier allows 10 ms of CPU per request.
- [ ] **Web Analytics.** Not set up. Google Analytics loads only after opt-in, so there are no plain visit counts. Its script needs a CSP allowance in `middleware.ts`; say when it is switched on and that goes in.

### Supabase

- [ ] **Let previews sign in with Google.** Authentication, URL Configuration, Redirect URLs: add `https://*.serve-by-example-ai.pages.dev/**`. Without it, Google sign-in started on a preview lands on the production site and fails.
- [ ] **Auth email.** Confirm Auth sends through Brevo, not the built-in mailer, and raise the hourly email limit under Authentication, Rate Limits.
- [ ] **Auth email templates.** Sign-up confirmation and email change still use Supabase's own templates. Edit them under Authentication, Emails to match the shared shell.
- [ ] **Backups.** The free plan has none. Upgrade to Pro or schedule a `pg_dump`. Pro also unlocks leaked-password protection.

### Google

- [ ] **Sign-in screen branding.** Google Cloud Console (project number `971763423157`), Google Auth Platform, Branding: app name, support email, home page, privacy policy and terms links, and `servebyexample.co` as an authorised domain. Adding a logo starts Google's brand verification, which needs the domain verified in Search Console. Then check Clients: the only authorised redirect URI should be the Supabase callback.
- [ ] **Protect the account that owns that project.** Turn on 2-step verification and add a second owner under IAM. If that one account is lost, Google sign-in cannot be changed or repaired.
- [ ] **Confirm crawlers get through.** Search Console URL Inspection on `/` and `/membership`, and Meta's Sharing Debugger. Both should show the page, not `/restricted`. This cannot be checked from Australia.

### Stripe

- [ ] **Link the refund policy.** Settings, Business, Public details (and the Checkout settings): set the refund and return policy to `https://servebyexample.co/refunds`, and the terms to `https://servebyexample.co/terms`. `/refunds` is live once the branch merges.
- [ ] **Failed-webhook emails.** Developers, Webhooks, the endpoint's settings. Until error tracking exists this is the only alert.
- [ ] **Branding.** Settings, Branding: logo, icon, brand and accent colours. Settings, Emails: support address and reply-to. Settings, Billing, Invoices: footer and business details. Set the statement descriptor so the card charge reads as Serve By Example.

### OpenAI

- [ ] **Monthly budget and alert.**
- [ ] **Rate-limit tier.** Check it covers a busy session. The client already retries a 429 twice (`lib/openai.ts`).

### GitHub

- [ ] **Protect `main`.** It has no branch protection at all (checked 2026-10-12). Require the `checks` job. Claude can set this through `gh` on request.

## 4. Owner: testing

Three sittings cover every unconfirmed fix.

### On an iPhone, signed in

- [ ] **AI photo.** The face oval, and a saved photo showing on Home without a reload.
- [ ] **`/mobile` at full width.** The frame no longer leaves a strip down each side; no screen was seen behind a login after the change.
- [ ] **Text fields.** In Settings, tap each field: no "rotate your device" screen. Go back to Me: the screen does not move sideways. Turn the phone on its side: the rotate screen still appears.
- [ ] **Join link.** Signed out, open a venue's staff sign-up link, create an account, finish onboarding, and confirm the account is connected to the venue. Then, signed in, open `/dashboard?join=<venue code>`: it should land on Settings, join once and drop the code from the URL. Not covered: confirming the email on a different device.
- [ ] **Checkout return.** Buy Pro and confirm the plan shows on mobile Home at once. Needs a real payment.
- [ ] **Android.** Not tried at all: take an AI photo, save it, and check it on Home.

### On a computer, as staff

- [ ] **The restyled emails.** Changed 2026-10-12, not seen in an inbox. Send yourself one of each: a staff invite and a resend from the Manager Console, the contact form, the book-a-call form, and the ROI calculator's "email me this". Check them in Gmail and on a phone.
- [ ] **`/login`.** Only its layout was checked. Sign in, create an account, and use Google (that return trip may pass through `www`).
- [ ] **Password reset.** Request a reset and follow the link: it should open the new-password screen. That screen was restyled on 2026-10-12 to match `/login`; set a new password on it once. The 2026-10-12 email pointed at the Site URL; the URL Configuration was changed the same day.
- [ ] **`/dashboard` when narrow.** At about 700px and 375px: the nav sits on top as a wrapped row, every item opens, Sign out is reachable, nothing scrolls sideways.
- [ ] **Join link** on a computer, as on the phone.
- [ ] **Demo against the live evaluator.** Submit one real answer on `/demo` and `/demo/complaint-master`, and confirm the feedback has no em dashes.
- [ ] **AI limit.** 30 requests a day on the free tier, 300 on paid (`lib/ai-usage.ts`). See what staff are shown at the limit.
- [ ] **Roster unlink on account deletion.** Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

### On a computer, as a manager

- [ ] **Trial chip on the collapsed sidebar.** Added 2026-10-12, not seen. On a trial account, collapse the sidebar: a small chip with the days left should sit above Settings and open Billing.
- [ ] **Status after the recalculation.** Changed 2026-10-12. On the Staff tab, someone quiet for 14 days should read "Needs follow-up", and someone who trained this week "On track", whatever they showed before.
- [ ] **The redesigned console.** It went to production on 2026-10-09 having only been viewed with sample data. Go through every tab, the collapsed sidebar, the account menu and Sign out, and ask the AI Coach a question then use New chat.

## 5. Owner: decisions

- [ ] **Error tracking: Sentry or not.** Nothing reports production errors. If yes it is built fresh: do not merge `preview/sentry-error-tracking` (`55f0960`, August), which conflicts in four files and carries an old cookie banner. A new build needs a Sentry DSN in Cloudflare Pages, a check that the SDK runs under OpenNext and keeps the worker under its size limit, a decision on whether it waits for cookie consent, and a line in the privacy policy naming Sentry.
- [ ] **How a Pro member moves to a venue plan.** Checkout refuses anyone with a live subscription and sends them to Billing, where the Stripe portal only lets them cancel or change card. Either switch on plan switching in the portal, or build an upgrade that replaces the Pro subscription.
- [ ] **The AI limits.** Are 30 and 300 a day right, shared across grading, Arena and both coaches?
- [ ] **The funnel numbers, before any spend.** Visit to sign-up, sign-up to first scenario completed, trial to paid, and cost per paying venue. Attribution is stored (`profiles.acquisition` and Stripe metadata), so these can be SQL queries once defined.
- [ ] **Ad platforms.** Name each one before its pixel goes in: its hosts must be added to `connect-src` in `middleware.ts`. Also accept cookies on the live site and check the console, since `connect-src` lists only `www.google-analytics.com` and Google Analytics sometimes sends to a regional host.

## 6. Tests

- [ ] **Run the mobile e2e suite and re-capture every baseline.** `tests/e2e/global-setup.ts` no longer uses the login form and has never been run. The mobile frame now uses the full phone width, so every screenshot will differ: run once with `--update-snapshots=all`, and check the no-horizontal-scroll test passes on all 22 `/mobile` routes. Needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `E2E_TEST_EMAIL`.
- [ ] **Run the marketing e2e suite** against production. Not run since the 2026-10-09 changes.
- [ ] **An e2e test from sign-up through checkout.** Nothing tests the payment path.

## 7. Larger builds

- [ ] **Weekly digest and Sunday reminder sender.** Settings lets staff opt in and the confirmation email promises "every Monday morning" / "every Sunday night", but nothing sends them (0 opted in on 2026-10-05). Cloudflare Pages has no cron and `pg_cron` is not installed, so this needs `pg_cron` plus an Edge Function, or a scheduled Worker. Send only to profiles with the flag true. Once it works, add a one-off, dismissible opt-in card on mobile Home linking to Settings > Notifications. Don't email people about it, since they haven't consented.
- [ ] **Store daily training activity.** Only each person's last-active date is kept, so the Overview tab cannot show a trend.
- [ ] **Split `app/globals.css` by surface.** One 317 KB file on every page.

## Parked

Not needed before launch. Pick up when there is a reason to.

- **Google sign-in brand verification.** Under review at Google since 2026-10-12. "Branding guidelines" passed; "Privacy policy requirements" still reads "does not have sufficient content"; "Homepage requirements" not yet reviewed. The site side is done: the home page is open to every country, `/privacy` is sent whole and has section 11 on Google sign-in, and both were read correctly from overseas on 2026-10-12. Next move is Google's: when the Trust and Safety email arrives, reply on that thread with the note in Part 7 of `docs/handoff/2026-10-week3-handoff.md`. Google sign-in works without verification; users see the Supabase address on the consent screen instead of the app name and logo.
- **Support email on the Google consent screen.** It is `info@serve-by-example.com`; the site, privacy policy and terms use `info@servebyexample.co`. Confirm the `.com` mailbox exists and is read, or change it (Google Cloud Console, Google Auth Platform, Branding).
- **AI Coach memory.** Each question is answered on its own; a follow-up such as "and what about Mia?" has no context.
- **Notifications and Training programs screens.** Both were restyled on 2026-10-12 and then hidden: no menu entry, no keyboard shortcut, and `?tab=notifications` or `?tab=training` lands on Overview. To bring them back, remove them from the hidden list in `ManagerControlCenter.tsx` and add menu entries. Neither has been seen in a browser since the restyle.
- **Check the conversion events in Google Analytics.** Added 2026-10-12, not seen. Accept cookies, open Analytics Realtime, then sign up, start a trial and press a paid plan button. `purchase` needs one real payment. Once they show, mark `sign_up`, `trial_start` and `purchase` as key events under Admin, Events.
- **Turnstile on previews.** The widget's hostname list could not take the `pages.dev` address, so captcha protection has to be switched off in Supabase to sign in on a preview.
- **A `preview` env for email links.** Toolkit emails hard-code `https://servebyexample.co`, so open tracking and unsubscribe can't be tested on a preview.
- **Failed toolkit emails.** `select * from toolkit_leads where toolkit_delivered = false` returned 0 on 2026-10-12. Add an admin action only if that grows.
- **`profiles.venue_type` and `experience_level`.** Onboarding writes them and nothing reads them. Use them or drop them.
- **Second pass on other tables.** Unused by code on 2026-10-06: `venues.completion_rate`, `avg_scenario_score`, `upsell_rate` (never written), `enabled_module_ids`, `force_diagnostic_on_join`, and `report_schedule` (written, never read); `venue_staff.skill_level`, `rsa_state` and `organization_member_id` (filled on 75 rows, so check before dropping). About 20 indexes have never been used. 79 of 91 accounts have never signed in; the three 25-person venues look like seeded demo staff.
