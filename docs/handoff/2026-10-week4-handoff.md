# Handoff: October 2026, Week 4

Work from 2026-10-17 onward is recorded here. Earlier work is in `docs/handoff/2026-10-week3-handoff.md`. Open items are in `To_do_list.md`.

## Part 1: fixes from the owner's laptop testing

- **Date:** 2026-10-17
- **Branches:** `preview/oct-w3-owner-decisions`, then `preview/oct-w4-tester-feedback`. The fixes below up to the reset page are on `main`.

The owner invited a new staff member and worked through the staff flow. Each fault found was fixed the same day.

- **Add staff opened Add inventory.** The Manager Console's single-letter shortcuts ran while a drawer was open, and focus starts on the close button, so typing "i" swapped the form. Shortcuts now stop while a drawer is open, and the drawer starts in its first field (`ManagerControlCenter.tsx`, `ActionDrawer.tsx`). The "unsaved changes" prompt was removed: the forms live in the parent and keep their text until a save succeeds, so closing loses nothing.
- **"Account created, check your email" for an existing account.** Supabase answers a sign-up for a registered address as if it worked and sends nothing. `/login` now says the account exists and points to Forgot password.
- **Password reset showed a black error page, then "Auth session missing".** Two faults. The email carried the whole Supabase link as one encoded value, and Brevo's click tracking decoded it, splitting off `type`. Then Supabase's `/verify` handed the session back in the URL hash, which our PKCE browser client ignores. The email now links straight to `/reset-password?token_hash=…&type=recovery`, and the page calls `verifyOtp`. `/api/auth/verify-redirect` only forwards links from older emails and can be deleted after 2026-10-18.
- **Onboarding is one step.** The venue type and experience questions were saved but read by nothing. Only the venue code remains. The skill check and reminder-time ideas are in the to-do list under Onboarding upgrades.
- **Keg question** (Bar-Back Efficiency and Cellar & Kegs): reworded for Australian cellars, where several kegs share one regulator and the coupler handle is the shut-off.
- **Cocktail library:** three new photos resized to 640 px squares. The open cocktail on desktop is a centred 720 px card with a 300 px square photo; before, the photo was cropped to a strip across the screen.
- **Quiz answers slow on desktop:** measured, not fixed. Postgres takes about 3 ms an answer; Supabase took 0.5 to 1.9 s for each of the route's three calls after a pause. The fix is in the to-do list under "Quiz answers lag".

## Part 2: weekly digest and Sunday reminder sender

- **Date:** 2026-10-17
- **Branch:** `preview/oct-w4-tester-feedback`.
- **Migration:** `supabase/migrations/20261017_notification_sender.sql` (rollback in `supabase/rollbacks/`). Not yet run on production.

### The short version

Settings has let staff opt in to two emails since August, and the confirmation email promises them, but nothing sent them. Now:

1. **pg_cron** calls `POST /api/cron/notifications` every 15 minutes on Sunday and Monday UTC, through **pg_net**, with a secret from **Vault**.
2. The route works out what is due in **Sydney time**: the digest Monday 7:00 to 11:59, the reminder Sunday 18:00 to 21:59.
3. It **claims** up to 40 opted-in people in the database, **sends** through Brevo, and **records** each send. A person never gets the same day's email twice, even if runs overlap.
4. Every email has a **signed unsubscribe link** that works without signing in, and a **one-click unsubscribe header** for Gmail and Apple Mail.
5. Mobile Home shows a **one-off card** pointing to Settings > Notifications while both emails are off. Nobody is emailed about the feature.

`docs/STAFF_APP.md` §7 has the full description.

### Why this design

- **No Edge Function.** The emails are built in the app, on the same branded shell and helpers as every other email, and tested with Vitest. An Edge Function would have needed its own copy in Deno.
- **The schedule lives in the route, not in cron.** Sydney moves between UTC+10 and UTC+11. A fixed cron time would drift an hour twice a year; checking Sydney time in the route does not. The cron runs only on the two UTC days that can contain a send window, and a test checks that every send window falls inside them.
- **A missed window is skipped.** A "Monday morning" summary arriving in the afternoon is worse than none.
- **A send interrupted mid-way is not retried.** A row left at `sending` means Brevo may have accepted it. Missing one email is better than sending two. A send Brevo refused is released and retried on the next run.
- **Unsubscribe changes nothing on GET.** Mail scanners open every link, so the page asks first and only the POST acts.
- **The secret is made inside the database** by the migration and never passes through a file or a chat.

### Files

- `lib/notifications/schedule.ts`: Sydney time, the send windows and the date ranges.
- `lib/notifications/emails.ts`: subject and HTML for both emails.
- `lib/notifications/unsubscribe-token.ts`: HMAC tokens and URLs.
- `lib/notifications/brevo.ts`: Brevo calls, moved out of `app/api/profile/notifications/route.ts` (no change in behaviour there).
- `app/api/cron/notifications/route.ts`: the sender.
- `app/api/notifications/unsubscribe/route.ts` and `app/notifications/unsubscribe/`: unsubscribe.
- `app/mobile/_components/NotificationOptInCard.tsx`, on mobile Home; Settings scrolls to `#notifications`.
- `lib/geo-config.ts`: the unsubscribe page is open from any country.

### Checked

- `vitest`: 114 tests pass, 28 of them new (schedule across both daylight-saving states, tokens, email wording, escaping, no em dashes).
- `tsc` and `eslint` pass.
- **The migration was run on production inside a transaction that was then rolled back.** In it, the info@ test account was opted in and claimed: it returned the account's real week (1 day, 22 answers, 3 modules passed). A second claim for the same day returned nobody, the finish call marked the row sent, and the cron job and secret were created. Afterwards: no extensions, table or secret remained, and the flag was still off.
- **Not checked:** a real send through Brevo, the one-click header in Gmail, and the Home card on a phone. These need the owner steps below.
- **New e2e test** in `tests/e2e/mobile-screens.spec.ts` for the Home card (shows, links to Settings, stays dismissed). Not run: it needs the QA account. The Home screenshot test now dismisses the card first, so its baseline is unchanged.

### Owner steps to switch it on

In this order:

1. **Run the migration.** Supabase, SQL Editor, paste `supabase/migrations/20261017_notification_sender.sql`, Run.
2. **Copy the secret.** Supabase, Project Settings, Vault, `notifications_cron_secret`, reveal, copy.
3. **Add it to Cloudflare.** Cloudflare, Workers & Pages, the project, Settings, Variables and Secrets. Add `NOTIFICATIONS_SECRET` as a Secret for both Production and Preview, paste, save.
4. **Deploy.** Variables apply to new deployments only, so push to `main` (or retry the latest deployment) after step 3.
5. **Send yourself one.** Turn on the weekly digest for a staff account you own in Settings > Notifications. Then in the SQL Editor:

   ```sql
   select net.http_post(
     url := 'https://servebyexample.co/api/cron/notifications',
     headers := jsonb_build_object('Content-Type', 'application/json',
       'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notifications_cron_secret')),
     body := '{"force": "weekly_digest"}'::jsonb);
   ```

   A few seconds later, `select status_code, content from net._http_response order by id desc limit 1;` should show 200 and `"sent":1`. Use `"sunday_reminder"` for the other email. A forced run is recorded against today's date, so it does not stop Monday's real send.
6. **Unsubscribe from the email** and confirm the toggle is off in Settings.

Until steps 1 to 4 are done, nothing sends. Before step 3, the cron calls get a 503. Before step 1, nothing calls the route at all.

### Left open

- **Capacity.** 40 per call, about 700 to 800 per window, set by the Workers Free plan's 50 outbound requests per call. If the account is on Workers Paid, `BATCH_SIZE` can go up.
- **Everyone is on Sydney time.** Perth staff get each email two hours earlier by their clock (three during daylight saving), so the digest can arrive from 4:00. Profiles have no time zone yet.
- **`net._http_response`** keeps cron responses for six hours only, so check soon after a run. Sends are recorded permanently in `notification_sends`.
