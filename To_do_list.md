# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week3-handoff.md` (this week), the earlier handoffs in `docs/handoff/`, and git history.

Regrouped on 2026-10-12 by who does the work and where. Background for the launch items is in `docs/handoff/2026-10-pre-launch-handoff.md`.

## 1. Code, next up

Small changes, in the order they will be done. Each goes to a preview branch first.

Nothing open. The last three were done on 2026-10-12 and are waiting on the checks in section 4.


## 2. Marketing copy

Nothing open. Closed by the owner on 2026-10-12. There is still no customer data, so no outcome figures or customer proof go on a marketing page.

## 3. Owner: dashboards

Grouped by where you sign in. None of these can be done from the code.

### Cloudflare

- [ ] **Check the rate-limit rule after the first venue session.** Created 2026-10-12 at 50 requests per 10 seconds. Look at Security, Events filtered by the rule. If staff were blocked, raise it to 80.

### Supabase

- [ ] **Let previews sign in with Google.** Authentication, URL Configuration, Redirect URLs: add `https://*.serve-by-example-ai.pages.dev/**`. Without it, Google sign-in started on a preview lands on the production site and fails.
- [ ] **Auth email.** Confirm Auth sends through Brevo, not the built-in mailer, and raise the hourly email limit under Authentication, Rate Limits.
- [ ] **Auth email templates.** Sign-up confirmation and email change still use Supabase's own templates. Edit them under Authentication, Emails to match the shared shell.
- [ ] **Backups.** The free plan has none. Upgrade to Pro or schedule a `pg_dump`. Pro also unlocks leaked-password protection.

### Google

- [ ] **Redirect URIs on the Google client.** Google Cloud Console (project number `971763423157`), Google Auth Platform, Clients: the only authorised redirect URI should be the Supabase callback.

- [ ] **Google Ads.** The only ad platform for now. Link the Google Ads account to the Analytics property, then import `sign_up`, `trial_start` and `purchase` as conversions. They must be marked as key events first (see Parked). No pixel goes in the code. Tag every ad link with `utm_source`, `utm_medium` and `utm_campaign`.

### Stripe

- [ ] **Switch on plan switching, in test mode first.** Settings, Billing, Customer portal, "Customers can switch plans". Add the Boutique and Commercial prices, monthly and yearly, and nothing else (not Pro, not Enterprise). Set proration to "Prorate and invoice immediately", not "on next invoice". Until this is done, a Pro member who presses a venue plan sees Stripe's refusal instead of the upgrade page.

### Sentry

- [ ] **Create the account and add the DSN.** Free plan, one project of type "Browser JavaScript". In the project's Security & Privacy settings switch on "Prevent Storing of IP Addresses". Copy the DSN into Cloudflare Pages as `NEXT_PUBLIC_SENTRY_DSN` for Production and Preview, then redeploy: the value is read at build time. Error reporting is off until then.

### OpenAI

- [ ] **Set a monthly budget and an alert email.** Settings, Limits. The daily limit of 30 and 300 requests bounds one account; only this bounds the bill.

## 4. Owner: testing

Three sittings cover every unconfirmed fix.

### On an iPhone, signed in

- [ ] **AI photo.** The face oval, and a saved photo showing on Home without a reload.
- [ ] **`/mobile` at full width.** The frame no longer leaves a strip down each side; no screen was seen behind a login after the change.
- [ ] **Text fields.** In Settings, tap each field: no "rotate your device" screen. Go back to Me: the screen does not move sideways. Turn the phone on its side: the rotate screen still appears.
- [ ] **Join link.** Signed out, open a venue's staff sign-up link, create an account, finish onboarding, and confirm the account is connected to the venue. Then, signed in, open `/dashboard?join=<venue code>`: it should land on Settings, join once and drop the code from the URL. Not covered: confirming the email on a different device.
- [ ] **Checkout return.** Buy Pro and confirm the plan shows on mobile Home at once. Needs a real payment.
- [ ] **Android.** Not tried at all: take an AI photo, save it, and check it on Home.
- [ ] **Learn and Me tab bars.** Changed 2026-10-14. On Learn and on Me the bottom nav stays on screen while scrolling, and the last section scrolls clear of it.
- [ ] **Me header.** Changed 2026-10-14. The logo sits left of your name; tap your photo on the right: Settings, Change photo and a red Log out. Each works, and a tap outside closes the menu.
- [ ] **AI Coach on Me.** Changed 2026-10-14. Sign out and in, open Me: the coach is closed and an "AI Coach" bubble shows beside its button for five seconds. Leave and come back: no bubble. Tapping the bubble or the button opens the coach.

### On a computer, as staff

- [ ] **The restyled emails.** Changed 2026-10-12, not seen in an inbox. Send yourself one of each: a staff invite and a resend from the Manager Console, the contact form, the book-a-call form, and the ROI calculator's "email me this". Check them in Gmail and on a phone.
- [ ] **`/login`.** Only its layout was checked. Sign in, create an account, and use Google (that return trip may pass through `www`).
- [ ] **Password reset.** Request a reset and follow the link: it should open the new-password screen. That screen was restyled on 2026-10-12 to match `/login`; set a new password on it once. The 2026-10-12 email pointed at the Site URL; the URL Configuration was changed the same day.
- [ ] **`/dashboard` when narrow.** At about 700px and 375px: the nav sits on top as a wrapped row, every item opens, Sign out is reachable, nothing scrolls sideways.
- [ ] **Join link** on a computer, as on the phone.
- [ ] **Demo against the live evaluator.** Submit one real answer on `/demo` and `/demo/complaint-master`, and confirm the feedback has no em dashes.
- [ ] **AI limit.** 30 requests a day on the free tier, 300 on paid (`lib/ai-usage.ts`). Changed 2026-10-12, not seen in a browser: at the limit the screen should say how many hours until it resets, keep the submit button disabled, and on a free account link to the plans. To reach it quickly, raise a test account's `request_count` in `ai_usage_daily` to 30.
- [ ] **Upgrade from Pro to a venue plan.** Needs the Stripe setting in section 3. In test mode, as a Pro account, press a Boutique button on `/membership`: Stripe's page should show the prorated charge. Pay, and confirm you land on the Manager Console billing tab on Boutique with 15 seats and an organisation created.
- [ ] **Error reporting.** Needs the Sentry DSN in section 3. Open the preview, cause an error, and confirm it arrives in Sentry with a stack trace and no IP address. Also confirm one server error arrives: if none does from a page render, the `onRequestError` hook is not running under OpenNext and only the billing and AI routes report.
- [ ] **Console after accepting cookies.** On the live site accept cookies and check the browser console for blocked requests. The Google hosts in `connect-src` were widened on 2026-10-12.
- [ ] **Roster unlink on account deletion.** Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

- [ ] **The staff app after the stylesheet split.** Live since 2026-10-14, checked on every public page but not behind a login. Click through each `/dashboard` screen and each `/mobile` screen and look for anything unstyled or laid out differently. Then go from the home page to `/login` to `/dashboard` without reloading and check the same.

### On a computer, as a manager

- [ ] **Trial chip on the collapsed sidebar.** Added 2026-10-12, not seen. On a trial account, collapse the sidebar: a small chip with the days left should sit above Settings and open Billing.
- [ ] **Status after the recalculation.** Changed 2026-10-12. On the Staff tab, someone quiet for 14 days should read "Needs follow-up", and someone who trained this week "On track", whatever they showed before.
- [ ] **The console after the stylesheet split.** Same check as the staff app: every tab, the drawers, the invite panel and Settings should look as they did.
- [ ] **The redesigned console.** It went to production on 2026-10-09 having only been viewed with sample data. Go through every tab, the collapsed sidebar, the account menu and Sign out, and ask the AI Coach a question then use New chat.

## 5. Owner: decisions

Nothing open. The five that were here were decided on 2026-10-12 (Part 13 of the week 3 handoff). What each left for you to do is in sections 3 and 4.

## 6. Tests

- [ ] **Run the mobile e2e suite and re-capture every baseline.** `tests/e2e/global-setup.ts` no longer uses the login form and has never been run. The mobile frame now uses the full phone width, so every screenshot will differ: run once with `--update-snapshots=all`, and check the no-horizontal-scroll test passes on all 22 `/mobile` routes. Needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `E2E_TEST_EMAIL`.
- [ ] **Run the marketing e2e suite** against production. Not run since the 2026-10-09 changes.
- [ ] **An e2e test from sign-up through checkout.** Nothing tests the payment path.

## 7. Larger builds

- [ ] **Weekly digest and Sunday reminder sender.** Settings lets staff opt in and the confirmation email promises "every Monday morning" / "every Sunday night", but nothing sends them (0 opted in on 2026-10-05). Cloudflare Pages has no cron and `pg_cron` is not installed, so this needs `pg_cron` plus an Edge Function, or a scheduled Worker. Send only to profiles with the flag true. Once it works, add a one-off, dismissible opt-in card on mobile Home linking to Settings > Notifications. Don't email people about it, since they haven't consented.
- [ ] **Store daily training activity.** Only each person's last-active date is kept, so the Overview tab cannot show a trend.

## Parked

Not needed before launch. Pick up when there is a reason to.

- **Support email on the Google consent screen.** It is `info@serve-by-example.com`; the site, privacy policy and terms use `info@servebyexample.co`. Confirm the `.com` mailbox exists and is read, or change it (Google Cloud Console, Google Auth Platform, Branding).
- **AI Coach memory.** Each question is answered on its own; a follow-up such as "and what about Mia?" has no context.
- **Notifications and Training programs screens.** Both were restyled on 2026-10-12 and then hidden: no menu entry, no keyboard shortcut, and `?tab=notifications` or `?tab=training` lands on Overview. To bring them back, remove them from the hidden list in `ManagerControlCenter.tsx` and add menu entries. Neither has been seen in a browser since the restyle.
- **Check the conversion events in Google Analytics.** Added 2026-10-12, not seen. Accept cookies, open Analytics Realtime, then sign up, start a trial and press a paid plan button. `purchase` needs one real payment. Once they show, mark `sign_up`, `trial_start` and `purchase` as key events under Admin, Events.
- **Turnstile on previews.** The widget's hostname list could not take the `pages.dev` address, so captcha protection has to be switched off in Supabase to sign in on a preview.
- **A `preview` env for email links.** Toolkit emails hard-code `https://servebyexample.co`, so open tracking and unsubscribe can't be tested on a preview.
- **Failed toolkit emails.** `select * from toolkit_leads where toolkit_delivered = false` returned 0 on 2026-10-12. Add an admin action only if that grows.
- **`profiles.venue_type` and `experience_level`.** Onboarding writes them and nothing reads them. Use them or drop them.
- **Second pass on other tables.** Unused by code on 2026-10-06: `venues.completion_rate`, `avg_scenario_score`, `upsell_rate` (never written), `enabled_module_ids`, `force_diagnostic_on_join`, and `report_schedule` (written, never read); `venue_staff.skill_level`, `rsa_state` and `organization_member_id` (filled on 75 rows, so check before dropping). About 20 indexes have never been used. 79 of 91 accounts have never signed in; the three 25-person venues look like seeded demo staff.

## Upgrades

Paid plans to decide on. None is switched on by the code; each is bought in its own dashboard. Prices are approximate, in US dollars, and should be checked before buying.

- [ ] **Cloudflare Workers Paid, about $5 a month.** First find out which plan the account is on: Cloudflare dashboard, Workers & Pages, Plans. The free plan allows 10 ms of CPU time per request and 100,000 requests a day. Every page of this site is rendered by a Worker, so a busy page can run past 10 ms and fail with error 1102. Paid raises the limit to 30 seconds and includes 10 million requests a month. If the account is on the free plan, buy it before sending paid traffic to the site. The site works today at current visitor numbers, so it is not urgent before then.
- [ ] **Cloudflare Pro, about $25 a month. Optional.** Allows a second rate-limit rule, so the public forms can have a strict limit of their own, and a challenge page instead of a plain block. Not needed for launch.
- [ ] **Supabase Pro, about $25 a month.** Covered under Supabase, Backups, in section 3: daily backups and leaked-password protection.

## Important

Not urgent today, but each has a trigger that must not be missed.

- [ ] **Read the AI usage numbers two weeks after the first real venue starts.** Run `supabase/queries/ai-usage.sql`. If the 90th percentile sits near 30 (free) or 300 (paid), raise that limit in `lib/ai-usage.ts`. There was one row of usage when the limits were kept on 2026-10-12.
- [ ] **Read the funnel numbers before and during any ad spend.** `docs/FUNNEL_METRICS.md` and `supabase/queries/funnel.sql`. Fix the size of the first test before it starts, and pause it if 200 paid visits produce no trial.
- [ ] **Register for GST at A$75,000 turnover.** Not registered as of 2026-10-12, so checkout charges no GST and invoices say "No GST has been charged". Registration is compulsory once turnover reaches A$75,000 in any 12 months, within 21 days of reaching it. When that happens: register with the ATO, add the registration under Stripe Tax, set the prices to tax-inclusive, switch on `automatic_tax` in `app/api/billing/checkout/route.ts`, change the invoice template to say "Tax invoice" and drop the no-GST line, and update the GST wording on `/advisory`.
