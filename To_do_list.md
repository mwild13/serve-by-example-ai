# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-rich-update-handoff.md` (the Rich update, 2026-10-19 to 20), the earlier handoffs in `docs/handoff/`, and git history.

Regrouped on 2026-10-12 by who does the work and where. Background for the launch items is in `docs/handoff/2026-10-pre-launch-handoff.md`.

## 1. Code, next up

Small changes, in the order they will be done. Each goes to a preview branch first.

- [ ] **Over-limit banner after a downgrade.** A venue that switches from Commercial to Boutique in Stripe keeps all its staff, but new joins are refused ("Seat limit reached") and it drops from several venues to one, with no word to the manager. Show a banner across the Manager Console while the venue is over its plan: "Your Boutique plan includes 15 staff. You have 22. Remove 7 or move back to Commercial.", with Manage staff and Change plan buttons. Do not block sign-in or force deletions. Cover the venue count as well as seats. Stripe's portal is set to apply downgrades at the end of the billing period.

- [ ] **Record what each AI call costs** (2026-10-20). No route keeps the token counts OpenAI returns, so the cost estimate is worked out from prompt sizes, not measured. Log `usage.prompt_tokens`, `usage.prompt_tokens_details.cached_tokens` and `usage.completion_tokens` from every call (Live Guest, AI Coach, manager coach, translate) as one structured line, or into `ai_usage`, so a monthly cost per venue can be read off. Also confirms the Live Guest rules block is being cached.
- [ ] **Set a monthly spending limit on the OpenAI project** (owner, 2026-10-20). Platform settings, Limits. Estimated worst case today is about US$7 a month for a 15-person venue using Live Guest an hour a day each, so a limit of US$50 to start gives plenty of room and stops a runaway.

## 2. Marketing copy


There is still no customer data, so no outcome figures or customer proof go on a marketing page.

## 3. Owner: dashboards

Grouped by where you sign in. None of these can be done from the code.

Nothing open. Plan switching was set up in Stripe's customer portal on 2026-10-19: Boutique and Commercial, monthly and yearly; prorations invoiced at once; downgrades at the end of the billing period.

## 4. Owner: testing

Each needs something first: a real payment, an expired trial, or a Pro account in test mode.

### On an iPhone, signed in

- [ ] **Checkout return.** Buy Pro and confirm the plan shows on mobile Home at once. Needs a real payment.

### On a computer, as staff

- [ ] **Trial-ended modal.** Branch `preview/oct-w4-console-restyle`. As a manager whose trial has ended: the modal uses the console dialog style, Escape or "Not now" closes it and it does not come back after a reload, and "Add billing details" opens the billing tab.
- [ ] **Upgrade from Pro to a venue plan.** In test mode, as a Pro account, press a Boutique button on `/membership`: Stripe's page should show the prorated charge. Pay, and confirm you land on the Manager Console billing tab on Boutique with 15 seats and an organisation created.

## 5. Owner: decisions

Nothing open. The five that were here were decided on 2026-10-12 (Part 13 of the week 3 handoff). What each left for you to do is in sections 3 and 4.

## 6. Tests

- [ ] **An e2e test from sign-up through checkout.** Nothing tests the payment path.

## 7. Larger builds

- [ ] **Check and release the desktop staff redesign** (owner, 2026-10-21). Built on `preview/staff-desktop`: bottle green, brass and cream, every desktop screen (plan: `docs/STAFF_DESKTOP_REDESIGN_PLAN.md`; standard: `docs/STAFF_APP.md` section 8). Left: look through it on the preview with a real account, then release. After release, retake the staff screenshots in `public/shots/` (they still show retired screens) and add desktop baselines to the e2e suite.

## Parked

Not needed before launch. Pick up when there is a reason to.

- **Support email on the Google consent screen.** It is `info@serve-by-example.com`; the site, privacy policy and terms use `info@servebyexample.co`. Confirm the `.com` mailbox exists and is read, or change it (Google Cloud Console, Google Auth Platform, Branding).
- **AI Coach memory.** Each question is answered on its own; a follow-up such as "and what about Mia?" has no context.
- **Notifications and Training programs screens.** Both were restyled on 2026-10-12 and then hidden: no menu entry, no keyboard shortcut, and `?tab=notifications` or `?tab=training` lands on Overview. To bring them back, remove them from the hidden list in `ManagerControlCenter.tsx` and add menu entries. Neither has been seen in a browser since the restyle.
- **Google Ads.** Parked on 2026-10-18 until there is a budget to advertise. The only ad platform for now; no pixel goes in the code. Done: Ads account `398-319-6350` exists under mitch@serve-by-example.com, but shows "Setup in progress" with no payment details. `sign_up` and `trial_start` are key events in Analytics (`purchase` already was, by default). It is linked to the Analytics property (confirmed 2026-10-18, personalised advertising on). Left to do: (1) finish the Ads setup with payment details, but the guided setup left a draft campaign that goes live once payment is added, so pause or delete it straight away in Campaigns, or start a new account in Expert Mode with "Create an account without a campaign"; (2) in Google Ads, Goals, Conversions, New conversion action, Import, Google Analytics 4, Web: import `trial_start` and `purchase` as Primary (purchase value from Analytics) and `sign_up` as Secondary; (3) tag every ad with `utm_source=google&utm_medium=cpc&utm_campaign=<name>` in the campaign's Final URL suffix.
- **Check the conversion events in Google Analytics.** Added 2026-10-12, not seen. Accept cookies, open Analytics Realtime, then sign up, start a trial and press a paid plan button. `purchase` needs one real payment.
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

- [ ] **Pricing.** He suggested $10 to $20 per user per month. Today Boutique is $79 for 15 seats (about $5.27 each) and Commercial $149 for 35 (about $4.26). Typsy lists about US$12.50 per member. Do not raise prices on one opinion; once there are more trials, test a higher price on new sign-ups only.
- [ ] **Videos in the cocktail library.** He asked for photos (done) or videos. Filming and hosting 38 drinks is a content project; leave it until a venue asks again.

### Onboarding upgrades

Onboarding was cut to the venue code alone on 2026-10-17: the venue type and experience questions were saved but nothing read them. Any question added back must change what the person sees.

- [ ] **Show the manager who has shift reminders on.** The reminders are built (Rich update, Phase 12, 2026-10-20: `shift_schedules.reminder_time` and `push_subscriptions`). A column or a line on the Staff tab would do.
- [ ] **"What should we call you?" as the first onboarding question.** Many accounts have no name, so the app and emails fall back to the email address (info@ reads "Info"). Ask for a first name at sign-up or as onboarding step one, prefilled from the email, and save it with `/api/profile/update-name`. The manager's roster shows the same name.
- [ ] **Offer the skill check at the end of onboarding.** The skill check itself was built in the Rich update (Phase 5, `/mobile/onboarding`); today it's a prompt on the mobile Learn hub. Ending onboarding on it would have a new hire training straight away, and the manager would see their starting point on day one.

## Important

Not urgent today, but each has a trigger that must not be missed.

- [ ] **Check the first server error in Sentry.** Browser errors, the alert email and IP stripping were confirmed by 2026-10-19; no server error had happened yet. When the first one arrives, confirm it is tagged `runtime: server`. If none ever comes from a page render, the `onRequestError` hook in `instrumentation.ts` is not running under OpenNext, and only the billing and AI routes report.
- [ ] **Read the AI usage numbers two weeks after the first real venue starts.** Run `supabase/queries/ai-usage.sql`. If the 90th percentile sits near 30 (free) or 300 (paid), raise that limit in `lib/ai-usage.ts`. There was one row of usage when the limits were kept on 2026-10-12.
- [ ] **Read the funnel numbers before and during any ad spend.** `docs/FUNNEL_METRICS.md` and `supabase/queries/funnel.sql`. Fix the size of the first test before it starts, and pause it if 200 paid visits produce no trial.
- [ ] **Register for GST at A$75,000 turnover.** Not registered as of 2026-10-12, so checkout charges no GST and invoices say "No GST has been charged". Registration is compulsory once turnover reaches A$75,000 in any 12 months, within 21 days of reaching it. When that happens: register with the ATO, add the registration under Stripe Tax, set the prices to tax-inclusive, switch on `automatic_tax` in `app/api/billing/checkout/route.ts`, change the invoice template to say "Tax invoice" and drop the no-GST line, and update the GST wording on `/advisory`.

## Major update: role-based learning paths

Separate paths for **Bartender**, **Kitchen** and **Gaming Attendant**, so staff are invited into the path that matches their role. Not started. Planned in four stages; each has a check that must pass before the next starts.

**Why it is on the list.** Richie (first paid tester, October 2026) wants one place for all onboarding (food, gaming and WHS as well as the bar), as the platform he used at JDA Hotels had. He also found our modules, scenarios and live scenarios repetitive. If one path feels repetitive, three will too, and they cost three times as much to write.

### Stages 1 and 2: done by the Rich update

Less repetition (the question engine, mixed drills, Live Guest) and venue content were built in the Rich update, on `main` from 2026-10-20 (`docs/handoff/2026-10-rich-update-handoff.md`). The check before Stage 3 is the human test in `docs/Rich Update/launch-check.md`: someone who hasn't seen it no longer finds it repetitive.

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
