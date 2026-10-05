# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week1-handoff.md` and git history.

## Checks to finish

- [ ] **New e2e baselines.** Run the suite once with `--update-snapshots=all` to capture the Help, Report a bug, Privacy and Terms screenshots. Check that the new no-horizontal-scroll test passes on all 22 `/mobile` routes.
- [ ] **Roster unlink on account deletion.** Not exercised yet. Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

## Email

- [ ] **Re-send failed toolkit emails.** Manual for now: `select * from toolkit_leads where toolkit_delivered = false` (0 on 2026-10-05). Add a small admin action if the count grows.
- [ ] **Build the weekly digest and Sunday reminder sender.** Settings lets staff opt in, and the confirmation email promises "every Monday morning" / "every Sunday night", but nothing sends them yet (0 opted in on 2026-10-05, so no one is waiting). Cloudflare Pages has no cron, so this needs Supabase `pg_cron` plus an Edge Function, or a separate scheduled Worker. Send only to profiles with the flag true. Once it works, add a one-off, dismissible opt-in card on mobile Home linking to Settings > Notifications. Don't email people about it, since they haven't consented.
- [ ] **A `preview` env for email links.** Toolkit emails hard-code `https://servebyexample.co`, so open tracking and unsubscribe can't be tested on a preview. Low priority.

## Database cleanup

- [ ] **Drop the dead schema.** Run only after the 2026-10-06 commit that stops writing these is live in production. One migration plus a rollback file: drop the `pending_invites` table; drop `profiles` columns `avatar`, `role`, `manager_id`, `notif_achievement_alerts`, `platform_version`, `diagnostic_completed_at`, `is_founders_user` and `all_modules_completed`, with their indexes and the `manager_id` foreign key; first change `award_sbe_elite()` so it no longer sets `all_modules_completed`. Then bring `docs/DATABASE_SCHEMA.md` in line.
- [ ] **Decide on `profiles.venue_type` and `experience_level`.** Kept for now (2026-10-06). Onboarding writes them and nothing reads them (6 of 90 rows filled). Either use them for personalisation or segmenting, or drop them and the onboarding write.
- [ ] **Second pass on other tables.** Unused by code on 2026-10-06: `venues.completion_rate`, `avg_scenario_score`, `upsell_rate` (never written), `enabled_module_ids`, `force_diagnostic_on_join`, and `report_schedule` (written, never read); `venue_staff.skill_level`, `rsa_state` and `organization_member_id` (filled on 75 rows, so check before dropping). About 20 indexes have never been used. 79 of 91 accounts have never signed in; confirm whether they are seeded demo staff.
