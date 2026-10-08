# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week1-handoff.md` and git history.

## Checks to finish

- [ ] **New e2e baselines.** Run the suite once with `--update-snapshots=all` to capture the Help, Report a bug, Privacy and Terms screenshots. Check that the new no-horizontal-scroll test passes on all 22 `/mobile` routes.
- [ ] **Roster unlink on account deletion.** Not exercised yet. Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

## Manager Console

- [ ] **Check the redesigned console behind a real login.** It was only viewed locally with sample data. Look at the Overview tab, the collapsed sidebar and every other tab for the font change.
- [ ] **Review the Needs Attention rule.** `lib/management/needs-attention.ts` flags anyone whose status is not "on-track", which flagged 25 of 25 staff on one live venue, including a person at 100%.
- [ ] **Store daily training activity.** Only each person's last-active date is kept, so the Overview tab cannot show a trend over time.
- [ ] **Bring the other console tabs to the new standard.** Staff, Compliance, Analytics, Reports, Training Gaps and Settings still use the older card styles and status pills.
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
- [ ] **`/security` names OpenAI.** `docs/Pages-Redesign.md` 6.2 says not to name the AI model. Kept as a provider disclosure; confirm that reading.

