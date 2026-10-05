# Handoff: October 2026, Week 1 — To-do Phase 1 + follow-ups

- **Dates:** 2026-10-02 to 2026-10-03
- **Branch:** `preview/oct-w1-phase1` (not merged to `main` yet)
- **Covers:** Phase 1 of the `To_do_list.md` plan (account deletion, SOP toolkit lead capture, Playwright QA account) and two follow-ups found along the way (notification emails, desktop delete account).
- **Still to come:** Phase 2 (staff invites card, "How it works" claims) and Phase 3 (mobile hardening). One combined handoff will follow once all three phases are done.
- **Related:** `docs/handoff/security/2026-10-02-audit-remediation-handoff.md` (the audit this follows), `docs/DATABASE_SCHEMA.md` (updated).

---

## The short version

1. **Account deletion works.** The old route wiped training progress and then failed, leaving the account behind. It's now a single `auth.admin.deleteUser()` call, and the database's foreign keys do the cleanup. Staff can delete their own account from Settings on mobile and desktop.
2. **Toolkit signups are saved.** Every `/toolkit` signup since 2026-07-19 existed only in Brevo's send log. Leads are now written to `toolkit_leads` before the email is sent, and opens and unsubscribes are recorded.
3. **Emails no longer get dropped.** Two routes sent Brevo email without waiting for it. On Cloudflare Workers that work can be cancelled once the response returns. Both now wait for the send, with a timeout.
4. **Opt-outs reach Brevo.** Turning a notification off now sets the Brevo attribute to false. Before, opted-out contacts stayed `true`.
5. **The Playwright QA account has a provisioning script.** It hasn't been run yet (see "Open items").

---

## Where we went against the external plan, and why

| Plan said | We did | Why |
|---|---|---|
| Return 410 from `/api/profile/delete`, then build a `deleted_at` soft delete | Fixed it properly with one `deleteUser()` call | The live FK graph already cascades every per-user table from `auth.users`. A `deleted_at` column would need every query and RLS policy in the app to filter on it. Immediate deletion meets the Privacy Policy's "within 30 days". |
| Send the toolkit email from a Supabase DB webhook | Save the lead first, then wait for the email inside the route | The actual bug was the un-awaited `fetch`. A webhook adds setup without fixing it. `toolkit_delivered = false` gives us a re-send list. |
| Put the QA account in `supabase/seed.sql` | An idempotent Admin API script | `seed.sql` only runs on `supabase db reset` against a local stack. This repo has no local stack, and the e2e suite signs in against the live project. |

---

## What changed

### Account deletion

- **Route** (`app/api/profile/delete/route.ts`): checks the user, then a rate limit, then that the body is `{ "confirm": "DELETE" }`. It removes the profile photo (best effort), then calls `deleteUser()`. Logs are structured, with no email in them.
- **Refused with a 409 and a message the user sees:**
  - an active subscription (`active`, `trialing`, `past_due`, `unpaid`, `incomplete`), because otherwise Stripe would keep billing;
  - anyone who owns a venue or organization, because `venues.owner_user_id` cascades and would wipe the whole roster.
- **Migration** `20261004_account_deletion_cascade.sql`:
  - `venue_staff.staff_user_id` is now `ON DELETE SET NULL`. It was NO ACTION, which blocked deletion for any linked staff member.
  - A `BEFORE DELETE` trigger on `profiles` marks the user's `organization_members` rows `removed`, which frees the seat, and unlinks their `venue_staff` row and marks it `inactive`.
- **What's kept:** the roster row (it's the manager's record, per Privacy Policy 5.1) and billing history (it's in Stripe and `billing_events`, neither of which holds a user id).
- **UI:** a Delete Account card in mobile Settings and in desktop Settings. You have to type DELETE before the button enables.

### SOP toolkit leads

- **Migration** `20261004b_toolkit_leads.sql` re-creates the table that `phase4_drop_dead_tables` dropped as dead, adding `delivered_at`, `opened_at` and `unsubscribed_at`. Emails are stored lowercase (enforced by a check). Only the service role can access it.
- **`/api/toolkit-capture`:** upserts the lead, waits for Brevo (8s timeout), then marks it delivered. The email has `List-Unsubscribe` headers for one-click unsubscribe.
- **The lead id is no longer in the success-page URL.** It's the only thing the unsubscribe link needs, so anyone who typed in someone else's email could have unsubscribed them.
- **`/api/toolkit-open`:** records the first open, then redirects to Notion.
- **`/api/unsubscribe`:**
  - Opening the link shows a confirm button and changes nothing. Email security scanners open links, and would otherwise unsubscribe people automatically.
  - The button's POST (and a mail client's one-click unsubscribe) sets `unsubscribed_at`.
  - The response is the same whether the id exists or not.

### Notifications (`/api/profile/notifications`)

- Brevo is only called when a flag actually changes. One contact update carries every changed attribute (`true` or `false`), and there's one confirmation email per opt-in. All calls are awaited with timeouts. A Brevo failure is logged and never fails the save.
- **Desktop Settings:**
  - Never-set flags now count as off. They were treated as on, so the boxes appeared ticked, and one Save opted users in without them choosing it.
  - The dead "Badge and streak alerts" checkbox is gone. It hasn't saved anything since 2026-08-25.
  - The labels now say Sunday (reminders) and Monday (digest), matching what's sent.

### Build fix: self-hosted Manager Console fonts

- The first preview build failed in `next/font/google` while downloading Outfit for `app/management/layout.tsx`. It's the same "Cannot read properties of null (reading '1')" failure that moved the root layout's fonts to local files. Lora, Outfit and DM Mono are now served from `app/fonts/` with `next/font/local`, so no layout fetches fonts from Google at build time any more. **Keep it that way: don't add `next/font/google` imports.**

### Playwright QA account

- **Script** `scripts/e2e/provision-qa-account.mjs`: creates the user or resets its password, and sets `tier = 'pro'`, `subscription_status = null`, `org_id = null`, and onboarding plus placement check complete. Re-running it is safe.
- **What that gives the account:** all 40 modules, no seat usage, no Manager Console, and nothing that expires.
- **Setup errors:** `tests/e2e/global-setup.ts` error messages now point to the script.

---

## Database state (checked 2026-10-03 against production)

| Check | Result |
|---|---|
| `venue_staff_staff_user_id_fkey` | `ON DELETE SET NULL` |
| Trigger `release_memberships_on_profile_delete` | Present and enabled. Function is `SECURITY DEFINER` with `search_path=public`; `authenticated` can't execute it |
| `toolkit_leads` columns | All 11 present |
| `toolkit_leads` access | RLS on, 0 policies. `anon` SELECT = false, `authenticated` INSERT = false |
| `toolkit_leads_email_lowercase` | Present |
| `toolkit_leads` rows | 0 (nothing captured until this branch is deployed) |

**Not verified:** the deletion cascade's actual behaviour (that a deleted staff member's seat is freed and their roster row unlinked). The rolled-back production test was declined twice. Test it on the preview instead: sign up a throwaway staff account, join a test venue with its code, delete the account from Settings, then check that the `organization_members` row is `removed` and the `venue_staff` row has `staff_user_id` null and `status = 'inactive'`.

---

## Open items

**Deploy blockers**
- [ ] Smoke-test the preview: a toolkit signup should create a row with `toolkit_delivered = true`; the email's toolkit link should set `opened_at`; unsubscribe should set `unsubscribed_at`; and the deletion test above.
- [x] QA account provisioned 2026-10-05: `mitch+qa@servebyexample.co`, checked in the DB (pro, onboarding done, no memberships). The service role key must be the `sb_secret_...` key, because the legacy JWT keys are disabled on this project.
- [ ] First e2e run against the preview with `npx playwright test --update-snapshots` to create the baselines (none exist yet). Review them, then commit them.

**Product decisions**
- [ ] How venue owners delete their accounts. They get a 409 "contact support" today. Decide what happens to the venue, roster and Stripe subscription first.
- [ ] Brevo list membership is add-only. Any future digest or reminder send must filter on `WEEKLY_DIGEST` / `SUNDAY_REMINDER = true`, not on list membership.
- [ ] Re-sending failed toolkit emails is manual: `select * from toolkit_leads where toolkit_delivered = false`.

**Notes**
- Any nurture sequence built on `toolkit_leads` must skip `unsubscribed_at IS NOT NULL` (Spam Act 2003).
- The QA account's activity will show up in any platform-wide usage numbers. Filter on display name `QA Playwright` if that matters.
- One-device enforcement: signing into the QA account by hand elsewhere invalidates the Playwright session saved in `tests/e2e/.auth/state.json`. Re-run `npm run e2e` and `global-setup` will sign in again.

---

## Rules for new code (added this week)

- **A new per-user table needs `REFERENCES auth.users(id) ON DELETE CASCADE`.** Otherwise account deletion either fails (NO ACTION) or leaves the data behind. Don't add tables to a list in the delete route; that list no longer exists.
- **On Workers, await outbound calls** (Brevo, webhooks) with `AbortSignal.timeout`. Don't fire-and-forget after the response.
- **An id that works as a credential** (unsubscribe, magic links) goes only to the person's inbox, never into a redirect URL.
- **Email links that change state** show a confirm step on GET and act on POST.

---

## Checks run

- `npm run lint`: 0 errors (whole project)
- `npx tsc --noEmit`: clean
- `npx vitest run`: 38/38 passed
- `npm run lint:css`: reports its existing hex baseline only (it doesn't fail the build yet). Nothing new from this work
- `npm run e2e`: **not run**, because the QA account isn't provisioned yet
