# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-22-staff-mobile-handoff.md` (the staff mobile rebuild and one-device sign-in), `docs/handoff/2026-10-21-staff-desktop-handoff.md` (the staff desktop rebuild and docs clean-up), `docs/handoff/2026-10-rich-update-handoff.md` (the Rich update, 2026-10-19 to 20), the earlier handoffs in `docs/handoff/`, and git history.

Regrouped on 2026-10-12 by who does the work and where. Background for the launch items is in `docs/handoff/2026-10-pre-launch-handoff.md`.

There is still no customer data, so no outcome figures or customer proof go on a marketing page.

## 1. Needed now (owner)

The site is live (2026-10-22). These three must be done before paid traffic or the first paying venue.

- [ ] **Real A$1 billing test in live mode.** Covers the checkout-return and purchase-event checks that each needed a real payment.
  1. In Stripe, switch to live mode and make a temporary A$1 price (or a coupon that brings a plan to A$1).
  2. Sign in as a test user and buy it.
  3. Confirm, in Stripe, Developers, Webhooks, that the events were delivered with 200.
  4. Confirm the plan shows at once on mobile Home and on the desktop.
  5. Confirm `purchase` appears in Google Analytics Realtime (accept cookies first).
  6. Cancel through the billing portal from Settings, and confirm the plan ends as the portal says.
  7. Refund the charge and archive the A$1 price.
- [ ] **Email deliverability.** Every email the app sends (trial, invite, password reset, notifications, toolkit) goes through Brevo (`lib/notifications/brevo.ts`).
  1. In Brevo, Senders, Domains, `servebyexample.co` should show SPF, DKIM and DMARC all green.
  2. Fix any that are not in Cloudflare DNS.
  3. In Supabase, Authentication, SMTP settings, check whether sign-up confirmation emails also go through Brevo. If they use Supabase's built-in sender, they are rate-limited and more likely to land in spam.
  4. Send a password reset to a Gmail address and check it reaches the inbox.
- [ ] **Database backups.** The Supabase organisation is on the Free plan (checked 2026-10-22), which has no backups at all.
  1. Buy Supabase Pro, about US$25 a month. It adds daily backups (kept 7 days) and leaked-password protection.
  2. Turn on leaked-password protection under Authentication.
  3. Check Database, Backups shows a daily backup the next day.
  4. Point-in-time recovery is a further paid add-on on top of Pro, about US$100 a month. Add it once paying venues' data is at stake.

- [ ] **Venue photo shoot** (2026-10-22, about A$150 with the photographer). Real venue photos for the marketing pages, plus one real portrait for `/advisory`. Why and where each one goes: `docs/MARKETING_IMAGERY_PLAN.md`. Drop the finished JPGs in `~/Desktop/sbe-photos/` and Claude places them.
  1. **Ask the venue.** Message to send, edit to suit:
     > Hi [name], I'm building Serve By Example, a training app for hospitality staff. I'd love to photograph your venue for an hour before service on [day] with a professional photographer. Staff working as normal, nothing staged. Your name and signage won't appear and we won't say you're a customer. You get every photo free for your own socials and website, and I'll show you the ones I pick before anything goes live. Could 3 or 4 of your team be in a few shots?
  2. **Paperwork.** A signed location release from the owner, and a model release from every staff member who appears, both covering use on the website and in marketing. The photographer usually has templates. Confirm with the photographer that the venue may use the photos too.
  3. **When.** About 4 to 5pm, an hour before opening: venue lights and candles on, warm daylight still coming in. No flash, no overhead fluorescents.
  4. **Venue set-up.** Bar polished and stocked, glasses out, stools straight, clutter and paperwork out of sight. Turn branded bottles so labels face away or sit out of focus. Hide the venue name and logo (menus, coasters, signage). Nobody drinking in any shot.
  5. **Staff set-up.** Plain black or dark tops and aprons, no logos, no name badges. Doing real jobs, never looking at the camera. A range of ages and backgrounds if the team allows.
  6. **Brief for the photographer.** Shoot RAW, deliver full-size JPGs, landscape at least 3000px wide, natural colour (no filters: Claude grades them to match the site), shallow focus. Shoot each one wider than needed so it can be cropped for phone and desktop. Three to five picks per shot.
  7. **The shots, most important first:**
     1. **Hero.** Bartender mid-pour at the back bar, side-on, bottles glowing out of focus behind. Bartender in the right third; the left two thirds darker and calm, because the headline sits there. Landscape.
     2. **Phone in hand.** A staff member's hand holding a phone square to the lens, bar blurred behind. Screen bright, showing plain white (open a blank page), wiped clean, held still. Portrait and landscape. Claude puts the app's screen into it.
     3. **Pre-shift briefing.** Four to six staff in aprons around the bar, the manager talking, one holding a phone. Landscape.
     4. **Staff at work.** Someone carrying plates or a tray through the room, side or back to camera, a little motion. Portrait.
     5. **Manager before service.** The manager at the end of the bar or the pass, checking a phone, staff setting up behind. Portrait.
     6. **Between shifts.** A staff member on a break out the back (on a keg or a step), apron on, looking at their phone. Portrait and landscape.
     7. **The empty room.** Stools, polished glasses, light through the windows, before the doors open. Landscape.
     8. **Details.** Hands polishing a glass, pouring a beer, a garnish going on. For small spaces on the site. Any orientation.
     9. **Optional, if the photographer can stay into service:** a wide shot of the venue full and busy, staff moving.
  8. **Advisory portrait (you).** Real, not posed corporate. At the same venue after the venue shots: you at the bar, mid-conversation or looking at a notepad, natural light. One landscape with you in the right third and space on the left (replaces `public/images/advisory/advisory-hero.jpg`), one portrait (for `advisory-about.jpg`). Smart casual, no logos. `/advisory` stays hidden and unlinked (faceless brand), so this is ready for when it is switched back on.

## 2. Code, next up

Small changes, in the order they will be done. Each goes to a preview branch first.

- [ ] **Over-limit banner after a downgrade.** A venue that switches from Commercial to Boutique in Stripe keeps all its staff, but new joins are refused ("Seat limit reached") and it drops from several venues to one, with no word to the manager. Show a banner across the Manager Console while the venue is over its plan: "Your Boutique plan includes 15 staff. You have 22. Remove 7 or move back to Commercial.", with Manage staff and Change plan buttons. Do not block sign-in or force deletions. Cover the venue count as well as seats. Stripe's portal is set to apply downgrades at the end of the billing period.
- [ ] **Record what each AI call costs** (2026-10-20). No route keeps the token counts OpenAI returns, so the cost estimate is worked out from prompt sizes, not measured. Log `usage.prompt_tokens`, `usage.prompt_tokens_details.cached_tokens` and `usage.completion_tokens` from every call (Live Guest, AI Coach, manager coach, translate) as one structured line, or into `ai_usage`, so a monthly cost per venue can be read off. Also confirms the Live Guest rules block is being cached.

- [ ] **Certificate expiry emails** (on `/roadmap` as "Building now", 2026-10-23). The Compliance tab tracks RSA and FSS expiry, but nothing reaches a manager who isn't signed in. Email the venue's managers 30 and 7 days before a certificate expires, from the existing notifications cron (`app/api/cron/notifications`, Brevo), with the usual unsubscribe link. Also makes `/solutions/hotel-fb` true ("F&B managers receive alerts before any certification lapses").
- [ ] **Gaming certificates** (on `/roadmap` as "Building now"). Add RSG (Qld, Vic) and RCG (NSW) to the Compliance tab beside RSA and FSS (`components/mission-control/compliance/`), with the same expiry statuses and the emails above.
- [ ] **Menu and allergens for floor staff** (on `/roadmap` as "Building now"; Stage 3 of the role paths plan below). A module on answering a guest's allergen question: what to ask, checking with the kitchen, never guessing. Owner reviews the content.

## 3. Owner: dashboards

- [ ] **Set a monthly spending limit on the OpenAI project** (2026-10-20). Platform settings, Limits. Estimated worst case today is about US$7 a month for a 15-person venue using Live Guest an hour a day each, so a limit of US$50 to start gives plenty of room and stops a runaway.

## 4. Owner: testing

The staff mobile app was checked end to end on a Google Pixel 8 on 2026-10-22 (sign-in, every learning area, every page and sub-page): no issues. The billing checks are in section 1.

- [ ] **Newest sign-in wins** (2026-10-22). Sign in on the laptop, then on the phone, then open any page on the laptop: it should land on sign-in with one line saying why. Then sign in with Google and start a drill: it should run.
- [ ] **Trial-ended modal**, now live. As a manager whose trial has ended: the modal uses the console dialog style, Escape or "Not now" closes it and it does not come back after a reload, and "Add billing details" opens the billing tab.
- [ ] **Upgrade from Pro to a venue plan.** In test mode, as a Pro account, press a Boutique button on `/membership`: Stripe's page should show the prorated charge. Pay, and confirm you land on the Manager Console billing tab on Boutique with 15 seats and an organisation created. Since 2026-10-22 the return page creates the organisation itself, so it should be there at once, not after the webhook.

## 5. Tests

- [ ] **An e2e test from sign-up through checkout.** Nothing tests the payment path automatically; the A$1 test in section 1 checks it once by hand.
- [ ] **Regenerate the mobile baselines for Help, Me and Settings** (2026-10-22), out of date after Sign out, the Help additions, and the email line under Sign out being removed. Command in `docs/handoff/2026-10-22-staff-mobile-handoff.md`.

## 6. Larger builds

- [ ] **Read the new content** (owner, 2026-10-21): the 70 new Knowledge Base cards (end of `lib/knowledge-base.ts`) and challenges 6 to 10 (`lib/challenge-content.ts`). Written by Claude, not yet reviewed.
- [ ] **Upgrade to Next.js 16** on its own branch, with `@opennextjs/cloudflare` bumped alongside. Clears the last npm audit finding (postcss, bundled in Next) and lets `build:cloudflare` drop `--dangerouslyUseUnsupportedNextVersion`, which is a stopgap since Next 15 passed its support date.
- [ ] **Upgrade Vitest 3 to 5** (dev only). Clears the critical and high npm audit notices in the test tools (tinypool, vite, @vitest/mocker). Nothing in them reaches the live site. Do it after the Next.js 16 upgrade.
- [ ] **Desktop baselines in the e2e suite** for Today, Modules, Challenges and My progress. Needs a fresh QA session first (`tests/e2e/.auth/state.json` is dead).

## Parked

Not needed before launch. Pick up when there is a reason to.

- **Support email on the Google consent screen.** It is `info@serve-by-example.com`; the site, privacy policy and terms use `info@servebyexample.co`. Confirm the `.com` mailbox exists and is read, or change it (Google Cloud Console, Google Auth Platform, Branding).
- **AI Coach memory.** Each question is answered on its own; a follow-up such as "and what about Mia?" has no context.
- **Notifications and Training programs screens.** Both were restyled on 2026-10-12 and then hidden: no menu entry, no keyboard shortcut, and `?tab=notifications` or `?tab=training` lands on Overview. To bring them back, remove them from the hidden list in `ManagerControlCenter.tsx` and add menu entries. Neither has been seen in a browser since the restyle.
- **Google Ads.** Parked on 2026-10-18 until there is a budget to advertise. The only ad platform for now; no pixel goes in the code. Done: Ads account `398-319-6350` exists under mitch@serve-by-example.com, but shows "Setup in progress" with no payment details. `sign_up` and `trial_start` are key events in Analytics (`purchase` already was, by default). It is linked to the Analytics property (confirmed 2026-10-18, personalised advertising on). Left to do: (1) finish the Ads setup with payment details, but the guided setup left a draft campaign that goes live once payment is added, so pause or delete it straight away in Campaigns, or start a new account in Expert Mode with "Create an account without a campaign"; (2) in Google Ads, Goals, Conversions, New conversion action, Import, Google Analytics 4, Web: import `trial_start` and `purchase` as Primary (purchase value from Analytics) and `sign_up` as Secondary; (3) tag every ad with `utm_source=google&utm_medium=cpc&utm_campaign=<name>` in the campaign's Final URL suffix.
- **Check the conversion events in Google Analytics.** Added 2026-10-12, not seen. Accept cookies, open Analytics Realtime, then sign up, start a trial and press a paid plan button. `purchase` is checked in the A$1 test (section 1).
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
