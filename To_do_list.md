# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week1-handoff.md` and git history.

## Pre-launch

The audit, the launch gate and what the cleanup changed are in `docs/handoff/2026-10-pre-launch-handoff.md`. Merged to `main` on 2026-10-10 (pull request #2), together with `preview/remove-legacy-mobile`.

- [ ] **Owner dashboard actions.** The Cloudflare WAF rate-limit rule; an OpenAI monthly budget and alert; check the Stripe live webhook; confirm Supabase backups. The list is under "The launch gate". Leaked-password protection needs Supabase Pro, so it waits for a plan change.
- [ ] **Make the `checks` job required on `main`** in the GitHub branch settings, now that CI has run.
- [ ] **Re-capture the mobile e2e baselines** against production. The placeholder images were re-encoded, so the screenshots will differ slightly.
- [ ] **Split `app/globals.css` by surface.** Still one 216 KB file on every page.
- [ ] **An e2e test from sign-up through checkout.** Nothing tests the payment path.

## Checks to finish

- [ ] **Check the legacy mobile removal on the preview.** Branch `preview/remove-legacy-mobile` deleted the old mobile view inside `/dashboard`; nothing was checked in a browser. On a computer, narrow the `/dashboard` window to about 700px and 375px: the nav should sit on top as a wrapped row, every item should open, Sign out should be reachable, and nothing should scroll sideways. On a phone, signed in, open `/dashboard?join=<venue code>`: it should land on Settings, join once and drop the code from the URL.
- [ ] **Join link is lost at sign-in.** A signed-out person who opens the staff sign-up link (`/dashboard?join=CODE`) is sent to `/login`, and after sign-in the code is dropped (`app/login/page.tsx`, `app/auth/callback/route.ts`), on desktop and phone. They only join if they type the code in onboarding or Settings. Carry `join` through login and the OAuth callback.
- [ ] **Phone checkout return skips the instant upgrade.** `/dashboard?checkout=success&session_id=...` on a phone is redirected to `/mobile/home` by `middleware.ts` before `app/dashboard/page.tsx` verifies the Stripe session, so the plan only updates when the webhook lands. Run the same check for the phone path, or exempt that URL from the redirect.
- [ ] **New e2e baselines.** Run the suite once with `--update-snapshots=all` to capture the Help, Report a bug, Privacy and Terms screenshots. Check that the new no-horizontal-scroll test passes on all 22 `/mobile` routes.
- [ ] **Roster unlink on account deletion.** Not exercised yet. Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

- [ ] **Sign in on the redesigned `/login`.** Only its layout was checked. Sign in as staff and as a manager, create an account, use Google, and send a password reset.
- [ ] **Run the demo against the live evaluator.** `/demo` and `/demo/complaint-master` were checked with a mocked score. Submit one real answer on each and confirm the feedback text has no em dashes.
- [ ] **Run the marketing e2e suite** against production. It was not run after the 2026-10-09 changes.

## Staff billing

- [ ] **Staff on Pro cannot manage or cancel their subscription.** Only the Manager Console opens the Stripe billing portal (`components/mission-control/SettingsPanel.tsx`). Account deletion is refused while a subscription is active, so a paying staff member is stuck. Add a "Manage billing" row to Settings on both `/dashboard` and `/mobile`, and let `app/api/billing/portal/route.ts` return to the screen the person came from. Branch `preview/staff-billing-portal` (`6d0d06d`) has an August attempt for `/dashboard` only; it no longer merges, so use it as a reference and rebuild. Test with a real paying Pro account before production.

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

