# To Do

Open items only. Finished work is recorded in `docs/handoff/2026-10-week1-handoff.md` and git history.

## Checks to finish

- [ ] **Toolkit open tracking on production.** Do a toolkit signup, click "Open the Notion toolkit" in the email, then check `opened_at` is set in `toolkit_leads`.
- [ ] **New e2e baselines.** Run the suite once with `--update-snapshots=all` to capture the Help, Report a bug, Privacy and Terms screenshots. Check that the new no-horizontal-scroll test passes on all 22 `/mobile` routes.
- [ ] **Roster unlink on account deletion.** Not exercised yet. Delete a test staff account that is on a venue roster, then confirm its `venue_staff` row is kept with `staff_user_id` null and `organization_members` is marked `removed`.

## Mobile

- [ ] **`sbe-design/no-hardcoded-mobile-px` ESLint rule.** Can't be switched on yet: no file in `app/mobile` uses the `--fs-mobile-*` or `--space-mobile-*` tokens. There are ~340 raw `fontSize` values and ~520 raw padding/margin/gap values, so the rule would fail ~860 places. Plan:
  1. Move font sizes onto the three `--fs-mobile-*` tokens, one screen at a time.
  2. Enable the rule for `fontSize` only.
  3. Repeat for spacing.

  Overflow wider than a 360px screen, the main risk, is already caught by the no-horizontal-scroll e2e check.

## Email

- [ ] **Re-send failed toolkit emails.** Manual for now: `select * from toolkit_leads where toolkit_delivered = false` (0 on 2026-10-05). Add a small admin action if the count grows.
- [ ] **Opt-in announcement (optional).** Every account was reset to notifications off. If digest or reminder emails launch, consider a one-off in-app prompt inviting people to turn them on. Don't email them about it, since they haven't consented.
- [ ] **A `preview` env for email links.** Toolkit emails hard-code `https://servebyexample.co`, so open tracking and unsubscribe can't be tested on a preview. Low priority.
