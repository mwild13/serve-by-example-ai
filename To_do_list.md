# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week3-handoff.md` (this week), the earlier handoffs in `docs/handoff/`, and git history.

Regrouped on 2026-10-12 by who does the work and where. Background for the launch items is in `docs/handoff/2026-10-pre-launch-handoff.md`.

## 1. Code, next up

Small changes, in the order they will be done. Each goes to a preview branch first.

- [ ] **Quiz answers lag on desktop.** Raised by Richie (first paid tester, October 2026). Each True/False answer waits on three database calls in a row in `app/api/training/verify/answer/route.ts`: the sign-in check, then the session and quiz lookup, then the grading call. Cut it to two by running the session check alongside the sign-in check, or move the quiz lookup into the `advance_verify_attempt` database function. It is a security-sensitive route (audit C4), so it needs its own preview branch and a re-test of the quiz. Measured on 2026-10-17 from the Supabase logs: Postgres runs each answer in about 3 ms, but after a pause each of the three calls took 0.5 to 1.9 s at Supabase (about 3 s an answer), then dropped under 0.1 s once warm. So fewer calls helps most; Supabase Pro's dedicated compute may also cut the warm-up stalls. Checking the sign-in locally (`getClaims`, if the project uses the new JWT signing keys) would remove another call.
- [ ] **Bring the trial-ended modal onto the console standard.** `components/mission-control/TrialExpiredModal.tsx`, last changed 2026-07-22: all inline styles, from before the October redesign. It is the screen a manager sees when the trial runs out, so it is also a conversion screen (`/conversion-ui`).
- [ ] **Restyle the Add staff, Add inventory and Add program drawers.** Their forms (`ops-action-form`) and the invite link panel (`ops-invite-link-*`) still use the pre-October classes, restyled only by override rules at the end of `app/styles/management.css`.

## 2. Marketing copy

Nothing open. Closed by the owner on 2026-10-12. There is still no customer data, so no outcome figures or customer proof go on a marketing page.

## 3. Owner: dashboards

Grouped by where you sign in. None of these can be done from the code.

### Cloudflare

- [ ] **Check the rate-limit rule after the first venue session.** Created 2026-10-12 at 50 requests per 10 seconds. Look at Security, Events filtered by the rule. If staff were blocked, raise it to 80.

### Google

- [ ] **Google Ads.** The only ad platform for now. Link the Google Ads account to the Analytics property, then import `sign_up`, `trial_start` and `purchase` as conversions. They must be marked as key events first (see Parked). No pixel goes in the code. Tag every ad link with `utm_source`, `utm_medium` and `utm_campaign`.

### Stripe

- [ ] **Switch on plan switching, in test mode first.** Settings, Billing, Customer portal, "Customers can switch plans". Add the Boutique and Commercial prices, monthly and yearly, and nothing else (not Pro, not Enterprise). Set proration to "Prorate and invoice immediately", not "on next invoice". Until this is done, a Pro member who presses a venue plan sees Stripe's refusal instead of the upgrade page.

## 4. Owner: testing

Three sittings cover every unconfirmed fix.

### Laptop order for tonight

Everything under "On a computer" below can be done on a laptop. Use a normal window for the manager account and a private window for the staff account, so both stay signed in.

1. **Roster unlink** last, by deleting info@ once nothing else needs a venue-linked staff account.

### On an iPhone, signed in

- [ ] **Notifications card on Home.** Added 2026-10-17. With both emails off, Home shows "Want a weekly nudge?" under the warm-up. "Choose in Settings" opens Settings scrolled to Notifications; the X hides it; neither brings it back after a reload.
- [ ] **AI photo.** The face oval, and a saved photo showing on Home without a reload.
- [ ] **`/mobile` at full width.** The frame no longer leaves a strip down each side; no screen was seen behind a login after the change.
- [ ] **Text fields.** In Settings, tap each field: no "rotate your device" screen. Go back to Me: the screen does not move sideways. Turn the phone on its side: the rotate screen still appears.
- [ ] **Join link.** Signed out, open a venue's staff sign-up link, create an account, finish onboarding, and confirm the account is connected to the venue. Then, signed in, open `/dashboard?join=<venue code>`: it should land on Settings, join once and drop the code from the URL. Not covered: confirming the email on a different device.
- [ ] **Checkout return.** Buy Pro and confirm the plan shows on mobile Home at once. Needs a real payment.
- [ ] **Android.** Not tried at all: take an AI photo, save it, and check it on Home.
- [ ] **Learn and Me tab bars.** Changed 2026-10-14. On Learn and on Me the bottom nav stays on screen while scrolling, and the last section scrolls clear of it.
- [ ] **Me header.** Changed 2026-10-14. The logo sits left of your name; tap your photo on the right: Settings, Change photo and a red Log out. Each works, and a tap outside closes the menu.
- [ ] **Quiz speed.** Changed 2026-10-14. Stay on `/mobile` for over an hour, then answer True/False questions quickly: each should check in well under a second. Before, every answer first sent an expired token.
- [ ] **AI Coach on Me.** Changed 2026-10-14. Sign out and in, open Me: the coach is closed and an "AI Coach" bubble shows beside its button for five seconds. Leave and come back: no bubble. Tapping the bubble or the button opens the coach.

### On a computer, as staff

- [ ] **Open cocktail, desktop.** Changed 2026-10-17. From 640px wide the photo sits left of the recipe, and Bookmark and Close stay pinned at the bottom without scrolling.
- [ ] **Staff profile in the console.** Rebuilt 2026-10-17. Click a staff row: name and role, last trained, account state, modules passed out of 40 with a bar, scores, milestones and certificates. No Sales score, 20-square grid or boxed badges.
- [ ] **Join link** on a computer, as on the phone.
- [ ] **Upgrade from Pro to a venue plan.** Needs the Stripe setting in section 3. In test mode, as a Pro account, press a Boutique button on `/membership`: Stripe's page should show the prorated charge. Pay, and confirm you land on the Manager Console billing tab on Boutique with 15 seats and an organisation created.
- [ ] **Server errors reach Sentry.** Browser errors and the alert email were confirmed on 2026-10-16. Open one browser test error in Sentry and confirm no IP address shows, then resolve both. When a server error first occurs, confirm it arrives tagged `runtime: server`: if none ever comes from a page render, the `onRequestError` hook is not running under OpenNext and only the billing and AI routes report.
- [ ] **Roster unlink on account deletion.** Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

## 5. Owner: decisions

Nothing open. The five that were here were decided on 2026-10-12 (Part 13 of the week 3 handoff). What each left for you to do is in sections 3 and 4.

## 6. Tests

- [ ] **Run the mobile e2e suite and re-capture every baseline.** `tests/e2e/global-setup.ts` no longer uses the login form and has never been run. The mobile frame now uses the full phone width, so every screenshot will differ: run once with `--update-snapshots=all`, and check the no-horizontal-scroll test passes on all 22 `/mobile` routes. Needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `E2E_TEST_EMAIL`.
- [ ] **Run the marketing e2e suite** against production. Not run since the 2026-10-09 changes.
- [ ] **An e2e test from sign-up through checkout.** Nothing tests the payment path.

## 7. Larger builds

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

- **Notification email capacity.** One run of `/api/cron/notifications` sends at most 40 emails (the Workers Free plan's 50 outbound requests per call), about 700 to 800 per send window. Act when opt-ins near that: buy Workers Paid (Upgrades) and raise `BATCH_SIZE` to 200.
- **Notification emails run on Sydney time.** Kept on purpose for now. Staff in other time zones get them earlier by their own clock, up to three hours in Perth. A time zone on the profile would fix it if a venue outside the east coast signs up.

## Upgrades

Paid plans to decide on, then product upgrades from tester feedback.

### Paid plans

None is switched on by the code; each is bought in its own dashboard. Prices are approximate, in US dollars, and should be checked before buying.

- [ ] **Cloudflare Workers Paid, about $5 a month.** First find out which plan the account is on: Cloudflare dashboard, Workers & Pages, Plans. The free plan allows 10 ms of CPU time per request and 100,000 requests a day. Every page of this site is rendered by a Worker, so a busy page can run past 10 ms and fail with error 1102. Paid raises the limit to 30 seconds and includes 10 million requests a month. If the account is on the free plan, buy it before sending paid traffic to the site. The site works today at current visitor numbers, so it is not urgent before then. After buying, raise `BATCH_SIZE` in `app/api/cron/notifications/route.ts` from 40 to 200: 40 keeps each notification run under the free plan's 50 outbound requests.
- [ ] **Cloudflare Pro, about $25 a month. Optional.** Allows a second rate-limit rule, so the public forms can have a strict limit of their own, and a challenge page instead of a plain block. Not needed for launch.
- [ ] **Supabase Pro, about $25 a month, for backups.** The free plan has no backups. Pro adds daily backups and leaked-password protection. The free alternative is a scheduled `pg_dump`.

### Product upgrades from tester feedback

From Richie, a venue manager with 20 years in busy venues and the first paid tester (October 2026). One person's view, so each needs a second venue to agree before a big build.

- [ ] **Venue content: the manager adds this season's drinks.** His main point: once staff finish training the app is forgotten, so it needs regular updates to justify a monthly fee. Let a manager add their own cocktail specs, new products and menu changes in the console; the app turns each into a short quiz and sends it to their staff. Builds on venue inventory linking. This keeps training fresh without us writing new content every month. Decide first: does the AI write the quiz from the spec, and does the manager approve it before staff see it?
- [ ] **Pricing.** He suggested $10 to $20 per user per month. Today Boutique is $79 for 15 seats (about $5.27 each) and Commercial $149 for 35 (about $4.26). Typsy lists about US$12.50 per member. Do not raise prices on one opinion; once there are more trials, test a higher price on new sign-ups only.
- [ ] **Videos in the cocktail library.** He asked for photos (done) or videos. Filming and hosting 38 drinks is a content project; leave it until a venue asks again.

### Onboarding upgrades

Onboarding was cut to the venue code alone on 2026-10-17: the venue type and experience questions were saved but nothing read them. Any question added back must change what the person sees.

- [ ] **"When should we remind you?"** One onboarding step: pick a daily time (for example before a shift), then a reminder to do the day's training. On a phone, follow it with the "Add to home screen" prompt, since reminders on iPhone need the installed app. A daily habit is what keeps staff coming back after the first week, which is the tester's "the app is forgotten" problem. Needs push notifications (web push for the installed app) or a reminder email first, so do not ask for a time until something sends at that time. Show the manager who has reminders on.
- [ ] **"What should we call you?" as the first onboarding question.** Many accounts have no name, so the app and emails fall back to the email address (info@ reads "Info"). Ask for a first name at sign-up or as onboarding step one, prefilled from the email, and save it with `/api/profile/update-name`. The manager's roster shows the same name.
- [ ] **Skill check of 5 to 8 questions in place of "How much experience?".** About two minutes, drawn from the start of each module. The score sets each module's starting mastery level, so an experienced bartender skips the basics and a beginner starts at the start, which works on the repetition the tester reported. The manager sees each new hire's starting score per module on day one. Ends onboarding with the person already training. Needs a way to write a starting level into the mastery engine (`docs/MASTERY_ENGINE.md`) without counting it as practice.

## Important

Not urgent today, but each has a trigger that must not be missed.

- [ ] **Read the AI usage numbers two weeks after the first real venue starts.** Run `supabase/queries/ai-usage.sql`. If the 90th percentile sits near 30 (free) or 300 (paid), raise that limit in `lib/ai-usage.ts`. There was one row of usage when the limits were kept on 2026-10-12.
- [ ] **Read the funnel numbers before and during any ad spend.** `docs/FUNNEL_METRICS.md` and `supabase/queries/funnel.sql`. Fix the size of the first test before it starts, and pause it if 200 paid visits produce no trial.
- [ ] **Register for GST at A$75,000 turnover.** Not registered as of 2026-10-12, so checkout charges no GST and invoices say "No GST has been charged". Registration is compulsory once turnover reaches A$75,000 in any 12 months, within 21 days of reaching it. When that happens: register with the ATO, add the registration under Stripe Tax, set the prices to tax-inclusive, switch on `automatic_tax` in `app/api/billing/checkout/route.ts`, change the invoice template to say "Tax invoice" and drop the no-GST line, and update the GST wording on `/advisory`.

## Major update: role-based learning paths

Separate paths for **Bartender**, **Kitchen** and **Gaming Attendant**, so staff are invited into the path that matches their role. Not started. Planned in four stages; each has a check that must pass before the next starts.

**Why it is on the list.** Richie (first paid tester, October 2026) wants one place for all onboarding (food, gaming and WHS as well as the bar), as the platform he used at JDA Hotels had. He also found our modules, scenarios and live scenarios repetitive. If one path feels repetitive, three will too, and they cost three times as much to write.

### Stage 1. Make the Bartending path less repetitive

- Find where the repetition is: which questions and scenarios a learner sees more than once, from the attempt data.
- Add question types beyond True/False: choose the right spec, put the steps in order, spot the mistake in a pour or a greeting.
- Scenarios that change with the answer, instead of the same scenario with only the names swapped.
- **Check before Stage 2:** Richie goes back through the same modules and no longer calls them repetitive.

### Stage 2. Venue content

The "Venue content" item under Upgrades. It answers his "keep it fresh" point without new paths, and the same tool later lets a venue add its own food or gaming notes.

### Stage 3. Test demand with two modules, not two paths

Built inside the current app, open to every staff member:

- **Menu and allergens for floor staff.** Every venue needs it, it fits the staff already using the app, and it is cheaper than a chef path. Covers answering a guest's allergen question, checking with the kitchen, and never guessing.
- **Gaming floor basics for pubs and clubs.** The day-to-day work around the certificate: signs of gambling harm, self-exclusion, minors in the room, payouts and cash handling. Not the certificate itself.
- **Check before Stage 4:** decide the measure before building, for example how many trial venues open each module, or a venue asking for more without being prompted.

### Stage 4. One full path, only if Stage 3 shows demand

- Pick one: Gaming if pubs and clubs respond, Kitchen if restaurants do.
- Shared core for every path: service, sales, complaint handling and RSA. Role-specific modules on top.
- Product changes: a role chosen at invite, a mastery score for each path, console filters and reports by role. One person can be on two paths (a pub bartender often works the gaming room too).
- Who writes and checks kitchen or gaming content, since the founder's expertise is bar service.

### What not to build

- **Certificate courses** (RSA, RSG in Queensland and Victoria, RCG in NSW, Food Safety Supervisor). Only approved training providers can issue these, and the rules differ by state. Point staff to a provider instead.
- **Instead, a certificate tracker in the console.** Each staff member's RSA, RSG/RCG and Food Safety Supervisor numbers and expiry dates, with a reminder before one runs out. Small to build and gives the manager the compliance view across food, gaming and bar. `venue_staff.rsa_state` already exists, unused.
- **Generic WHS training.** Widely available elsewhere. Cover it with a site induction checklist the manager ticks off, alongside the certificate tracker.

### Still to decide

- **Pricing.** All paths in every plan, or extra paths as an add-on? Check against the seat limits.
- **Marketing.** One landing page per role, or one site that names all three? This affects ad targeting.
