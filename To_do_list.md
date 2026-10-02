# To Do — Mobile Responsive Fix (Phase 6 follow-ups)

Deferred items from the Phase 6 mobile-responsive workstream (`preview/mobile-responsive-fix`). Plan file: `~/.claude/plans/hi-claude-how-do-swirling-wave.md`.

## Blocking — needed to actually run the new test suite

- [x] **Create a dedicated QA staff test account** in Supabase for Playwright: *(Phase 1, 2026-10-02: `scripts/e2e/provision-qa-account.mjs`, idempotent. Run it once with `node --env-file=.env.local scripts/e2e/provision-qa-account.mjs` after setting `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`. It's a script, not `seed.sql`, because there's no local Supabase stack.)*
  - Must have `onboarding_completed = true` and real module access (`allowedModules`), so `/mobile/*` screens render actual content instead of empty states or an `/onboarding` redirect.
  - Set `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` as env vars, then run `npm run e2e`.
  - `tests/e2e/global-setup.ts` will throw a clear error naming what's missing if either the env vars or the onboarding flag aren't set.

## Not blocking — explicitly deferred during Phase 6 planning

- [ ] iOS Safari's bottom-toolbar overlap (content briefly covered until the page is nudged) — known `100dvh`/WebKit quirk, left as-is per decision.
- [ ] Routing tablets into `/mobile` via `middleware.ts` — staying desktop-first for tablets; the wider Phase 4 frame remains a fallback improvement for direct links only.
- [ ] Extend Playwright visual-regression coverage beyond the initial 4 screens (Home, LearnHub, Settings, Contact) + landscape overlay to the remaining ~20 `/mobile` screens — pattern is a copy-paste of one `test(...)` block in `tests/e2e/mobile-screens.spec.ts`.
- [ ] Real-hardware Android pass — this round only covered iPhone (Safari + Chrome) on real hardware; Android was Chrome DevTools emulation only.
- [ ] `next.config.ts`'s `images.deviceSizes` still assumes `390` as the minimum (affects `next/image` srcset generation, not layout) — add `360, 375`.
- [ ] `sbe-design/no-hardcoded-mobile-px` ESLint rule (mirroring `sbe-design/no-hardcoded-hex`) to guard against regressing back to raw px in `/mobile` — worth adding once the token set (`--mobile-frame-max`, `--fs-mobile-*`, `--space-mobile-*`) has proven stable for longer.

# To Do — SOP Toolkit Lead Capture

Found 2026-09-29 while fixing stale docs (`docs/DATABASE_SCHEMA.md`). Not part of the mobile-responsive workstream above.

- [x] *(Phase 1, 2026-10-02: the table existed and was dropped as dead on 2026-07-19. `20261004b_toolkit_leads.sql` re-creates it. The route now saves the lead, then awaits the email and marks it delivered. Open-tracking and unsubscribe now write to the table, and unsubscribe has a confirm step plus one-click support. Apply the migration before deploying.)* **Wire up `app/api/toolkit-capture/route.ts` to actually persist leads.** It currently generates `targetLeadId` via `crypto.randomUUID()`, sends the delivery email, and discards the id — no lead is written to any table. Every `/toolkit` signup today is invisible outside the sent email.
  - A migration for this already exists (`supabase/migrations/20260610_toolkit_leads.sql`, `public.toolkit_leads`: `email`, `first_name`, `role`, `utm_campaign`, `toolkit_delivered`) but the table isn't present in the live Supabase project — confirm whether that migration was ever applied, or needs reapplying, before wiring the insert.
  - `app/api/toolkit-open/route.ts` and `app/api/unsubscribe/route.ts` both take a `lead_id` param that currently resolves to nothing real — worth checking whether they should look the id up in `toolkit_leads` once it's live.

# To Do — Manager Console: "Staff invites & seat management" card

Found 2026-10-02 during the Phase 3 smoke test. Layout and scaling, not security. Component: `components/mission-control/StaffDirectoryTable.tsx` (~line 731); data from `GET /api/management/memberships`.

- [ ] **Layout:** the fields aren't evenly spaced. Name and Staff email sit in a 2-column grid, Access level drops to its own row, and the "Invite staff member" button floats in the middle of the card. Redesign as one aligned form (a single row on desktop, stacked on mobile) with the button lined up with the fields.
- [ ] **The invite list doesn't scale:** every venue the owner has shows every invite the owner has ever sent, because `memberships` GET filters only on `manager_id`, not on venue. Large groups will end up with one very long list. Options:
  - Filter by the selected venue (invites with no `venue_id` need a home).
  - Move accepted/active staff out of this list (they're already in the staff directory) and hide removed ones.
  - Add search and paging.
- [ ] **"3 / 9999 seats used":** Enterprise should read "Unlimited". The API already returns `seatUsage.unlimited`, but this card ignores it and prints the raw `max`.

# To Do — Account deletion (`/api/profile/delete`) is broken

Found 2026-10-02 during audit Phase 5. No button in the app calls this route, but any signed-in user can call it directly.

**Fixed in Phase 1 (2026-10-02)** rather than switched to a 410: the route now makes one `auth.admin.deleteUser()` call, and the DB's FK cascades do the rest. `20261004_account_deletion_cascade.sql` must be applied first. It requires typing DELETE (also checked server-side), and refuses (409) subscribers and venue/org owners. Entry point: Me > Settings > Delete Account (mobile). Roster rows a manager owns are kept but unlinked. Billing history is kept, since Stripe holds it. Deletion is immediate, which meets the policy's "within 30 days". The boxes below are all handled by that design.

- [x] **It deletes progress, then fails before deleting the account.** It deletes from a fixed list of tables in order. `scenario_mastery` is deleted (the user's training progress is gone), then `mastery_rows` fails because that table doesn't exist, the route throws, and the account, profile and login all remain.
- [x] **Two tables in its list have no `user_id` column:** `diagnostic_questions` (shared question bank, not user data) and `venue_staff` (links via `staff_user_id`). Both would fail even after `mastery_rows` is removed.
- [x] **It never deletes the Supabase Auth user** (`auth.admin.deleteUser`), so the login survives even if everything else succeeds.
- [x] **Decide the behaviour before fixing:** what's deleted vs. kept (roster rows a manager owns, billing records — the code keeps the last 7 years, though its comment says the opposite), whether it needs a confirmation step and a UI entry point, and whether deletion should be soft (scheduled) to match the Privacy Policy's "within 30 days" wording.
- [x] Until then, consider returning 410 from the route so it can't partially wipe someone's progress.

# To Do — "How it works" page claims to verify

Found 2026-10-02 during audit Phase 5 (the Elo and "16 days" claims on the same list were already corrected). Page: `app/how-it-works/page.tsx` (~line 209), "How the system improves your score over time".

- [ ] **01 "Rated across 5 dimensions: communication, hospitality, problem-solving, professionalism and guest experience."** Check `lib/scenario-evaluator.ts` returns these five dimensions and that the UI shows them.
- [ ] **02 "The system flags dimensions where your score drops consistently, not just one-off mistakes."** Find where this happens. Spaced repetition works per scenario, not per dimension, so this may be overstated.
- [ ] **03 "Spaced repetition brings back scenarios in those areas…"** Intervals are now correct (1, 4, 9 days). "In those areas" depends on claim 02 being true.

# To Do — Follow-ups found in Phase 1 (2026-10-02)

- [x] *(Done 2026-10-03: Brevo calls are now awaited with timeouts. Opting out now also sets the Brevo attribute to false. Before this, opted-out contacts stayed `true`.)* **`app/api/profile/notifications/route.ts` sends its Brevo email without awaiting it**, the same pattern just fixed in toolkit-capture. On Cloudflare Workers, a promise still pending when the response returns can be cancelled, so opt-in confirmation emails may be dropped silently. Await it with `AbortSignal.timeout`.
- [x] *(Done 2026-10-03: a Delete account card in desktop Settings, same route and phrase. Also removed the dead "Badge and streak alerts" checkbox, corrected the reminder labels to Sunday/Monday, and fixed the desktop defaults: they were `?? true` and pre-ticked opt-in boxes.)* **Desktop has no "Delete account" entry point**: only mobile Settings has one. Add it to the desktop staff settings panel (`app/dashboard/_components/DashboardShell.tsx`), using the same route and DELETE phrase.
- [ ] **Self-service deletion for venue owners** gets a 409 ("contact support") today. Before offering it in the product, decide what happens to the venue, its roster and the Stripe subscription.
- [ ] **Re-send for failed toolkit emails:** `select * from toolkit_leads where toolkit_delivered = false`. There's no automated retry yet. Do it manually or add a small admin action if the count grows.
- [ ] **Brevo list membership is add-only.** Opting out sets the contact's attribute to false but leaves them on `BREVO_NOTIFICATIONS_LIST_ID`. Any scheduled digest or reminder send must filter on `WEEKLY_DIGEST` / `SUNDAY_REMINDER = true`, not on list membership alone.
