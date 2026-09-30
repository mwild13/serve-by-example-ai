# To Do — 2026-09-30 Security & Scoring Audit Remediation

Running checklist for the 2026-09-30 audit: mastery engine, Manager Console ↔ staff, and the training loop. The plan file is `~/.claude/plans/pasted-content-id-70f7-you-are-purrfect-gem.md`. Finding IDs (C1–C4, H1–H5, M1–M8, L1–L8) refer to that plan.

Tick an item only once it has been **tested**, not just once it's written.

## Status

| Phase | Branch | State |
|---|---|---|
| 1. Same-day API hotfixes | `fix/audit-phase1-hotfixes` (commit `950b5be`) | Deployed to preview; **signed-in smoke tests below still open**; not merged |
| 2. RLS lockdown | `audit-remediation` (branched from phase 1) | Code done and passing locally (uncommitted). **DB migration written, not applied**: waiting on the test-environment decision below |
| 3. Server-side gating & identity | `audit-remediation` | Not started |
| 4. Atomic attempts, idempotency, server-graded quiz | `audit-remediation` | Not started |
| 5. ELO retirement & dead code | `audit-remediation` | Not started |
| 6. Polish & docs | `audit-remediation` | Not started |

Phase 1 preview: https://fix-audit-phase1-hotfixes.serve-by-example-ai.pages.dev

---

## Dashboard actions (you, no code) — still open from the 09-26 handoff

- [ ] **OpenAI → Project → Limits:** set a monthly budget and an alert threshold. Consider a separate key for the public routes (`demo/*`, `translate`).
- [ ] **Cloudflare → Security → WAF → Rate limiting rule:** `URI Path starts with /api/demo/` OR equals `/api/translate`, OR starts with `/api/contact`, `/api/book-call`, `/api/toolkit-capture`, `/api/management/join-venue`. For example 20 requests / 10 s per IP → block 60 s. The in-code limits are per isolate only; this is the hard ceiling.

---

## Phase 1 — tests (preview: `fix-audit-phase1-hotfixes`)

Already verified:
- [x] `tsc`, ESLint (`app lib components`) and `next build` are clean.
- [x] 15 quiz payloads run against the real route with stubbed auth/DB: honest streaks pass; both-answers, wrong, foreign-id, out-of-range, non-boolean, oversize, text/plain and old-score bodies are all rejected.
- [x] Arena threshold through the real `recordAttempt`: 60/70/74 → not mastered, 75/90 → mastered, Scenario Training unchanged.
- [x] Preview: `/api/training/save` without auth → 401. `/api/contact` → 429 on the 4th request in a minute.

Still to test while signed in on the preview:
- [ ] **Quiz, honest:** pass a module on desktop (ModuleVerify) and on mobile (`/mobile/quiz`). It shows as mastered, and the manager roster updates.
- [ ] **Quiz exploit:** this should return 400 or 403, and the module should not be mastered:
  ```js
  fetch("/api/training/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({moduleId:5,verifyPassed:true,answers:[0,1,2,3].flatMap(i=>[{id:`5-${i}`,answer:"true"},{id:`5-${i}`,answer:"false"}])})}).then(r=>r.status)
  ```
- [ ] **Invite:** as a manager, add staff with "send invite" ticked.
  - The response `inviteLink` is `/login`, not a `supabase.co/auth/v1/verify` link.
  - The email still has a working "Accept invitation" link.
  - A name like `<b>Test</b>` shows as literal text in the email.
- [ ] **Invite resend:** the Resend button still sends, and the response has no action link.
- [ ] **Copy-link fallback:** when an email fails, the copied `/login` link lets the staff member sign up with the invited email and get sponsored access.
- [ ] **Join venue:** a valid code still joins. The 6th attempt within a minute → 429. A venue with no free seats gives the "no free staff seats" message and leaves no roster row behind.
- [ ] **Arena:** a 60–74 attempt shows "not passed", and the manager Arena slice doesn't count it. 75+ counts.
- [ ] **Arena gating:** a free-tier account gets 403. A displaced session (signed in on another device) gets 409.
- [ ] **Regression:** Scenario Training records on desktop and mobile; Arena records for paid and sponsored users; the contact, book-call and toolkit forms still send once.
- [ ] Check Workers logs for `quiz_submit_rejected`, `join_venue_rejected`, `staff_create_rejected` and `*_rejected` lines appearing as expected.
- [ ] Merge `fix/audit-phase1-hotfixes` → `main` (production) once the above passes. **Confirm before pushing to main.**

---

## Phase 2 — RLS lockdown (C1, C2, C3)

### What changed from the plan (found while building)

- **A Supabase branch isn't possible as-is.** Production's migration history (`list_migrations`) starts at `20260518_badge_tracking`, which is an `ALTER`. `profiles`, `scenario_mastery`, `venues` and `venue_staff` were created in the dashboard and are in no migration, so a branch replay fails on its first migration. **Decision needed:** how to test the lockdown SQL before production (see "Open decision" below).
- **More tables were client-writable than the audit listed:** `training_programs`, `venue_inventory_items`, `staff_recognitions`, `manager_coach_sessions`, `pending_invites`, `venue_staff_certifications`, `user_challenges`. All are now in the lockdown. `modules`, `scenarios`, `diagnostic_questions`, `billing_events` and `user_access_allowlist` had write *grants* (RLS already blocked the writes); those are revoked too.
- **`diagnostic/submit` already used a service-role client.** The audit was wrong there, and no change was needed. Its dead seed upsert stays on the Phase 5 list.
- **The browser signup `profiles.upsert` calls were already failing** (profiles has no INSERT policy; the `on_auth_user_created` trigger makes the row). They were removed, with no behaviour change.
- **`getManagementSnapshot()` auto-creates a venue on read.** `snapshot`, `group-summary` and `coach` called it with the user client, which let *any* signed-in account create a venue just by calling `/api/management/snapshot`. All three are now behind `requireManager()` on the admin client.
- **Seat trigger left unchanged.** 3 of 8 live venue owners have no `organizations` row, so "NULL `seat_limit` = no seats" would block their staff from joining. The exploit (clients setting `seat_limit`) is closed by the REVOKE. Per-tier caps come in Phase 3.
- **No live Supabase action links remain in `pending_invites`** (0 unexpired rows), so no data scrub was needed.
- **`requireManager()` session semantics match `middleware.ts`:** a mismatched `sbe_session_id` gets 409, and a missing cookie is allowed (not every login path stamps one). Making it mandatory is a later decision.
- **Duty managers own no venues,** so `resolveManagerVenueId` auto-creates a "Primary Venue" for them on their first write. That is pre-existing behaviour, now limited to real duty managers. The duty-manager data scope needs a design pass (Phase 3).

### Build — done (uncommitted, branch `audit-remediation`)

- [x] `lib/management/auth.ts`: `requireManager()` (JWT via `auth.getUser`, rate limit, session, role/tier/trial from the DB mirroring the page gate, `ownerOnly`, `assertOwnsVenue`/`assertOwnsStaff` that throw 404) and `managementErrorResponse()` (generic client errors).
- [x] `lib/management/auth.test.ts`: 16 Vitest tests, all passing (`npm test`). Vitest added as a dev dependency with `vitest.config.mts`. npm held back esbuild's postinstall under your allow-scripts policy, but tests still run.
- [x] Behind `requireManager()` on the admin client:
  - `inventory`, `training-programs` (POST/DELETE)
  - `venues` (POST/PATCH/DELETE, owner-only; also fixes the dead `reportSchedule` filter, L2)
  - `staff` (POST/PATCH/DELETE; user-client → admin fallback removed; PATCH checks staff ownership)
  - `snapshot`, `group-summary`, `coach`
- [x] `resolveManagerVenueId`: naming a venue you don't own → 404 (it used to write silently to your primary venue). A manager with zero venues still gets their first venue created.
- [x] `DashboardShell` notification prefs → `PATCH /api/profile/notifications`. The route now emails only on an off → on change, so desktop saves don't re-send the confirmation.
- [x] `auth/callback`: admin client; fills `display_name` from the Google name only when it's empty.
- [x] Removed the dead browser `profiles.upsert` calls (`app/auth/page.tsx`, `app/login/page.tsx`).
- [x] Sweep: every `.insert/.update/.upsert/.delete` in `app`, `lib` and `components` now runs on a service-role client. There are no `.rpc()` writes.
- [x] `supabase/migrations/20260930_rls_lockdown.sql`: drops every client write policy, adds SELECT-only replacements with the same row scoping (no client read on `pending_invites`), and revokes INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES from `anon` and `authenticated` on 21 tables.
- [x] `supabase/rollbacks/20260930_rls_lockdown_rollback.sql`: exact restore of the captured live policies and grants. Emergency use only.
- [x] `tsc`, ESLint (`app lib components`) and `next build` are clean.

### Open decision — how to test the migration before production

- **A. Dry run on production inside a rolled-back transaction (recommended):** one `DO` block applies the migration, switches to the `authenticated` role as a real user, attempts every attack write, reports the results, then raises an error, so everything rolls back. It takes table locks for milliseconds and leaves nothing behind.
- **B. Real Supabase branch:** needs a baseline schema dump first (`supabase db dump`, which needs the DB password and Docker), committed and registered as the first migration. Most faithful, most setup.
- **C. Skip the dry run:** deploy the code, apply the migration with the rollback file ready, then run the attacker tests live.

### Deploy order (don't change it)

1. [ ] Commit, push `audit-remediation` to its own preview, and smoke-test while the DB is still unlocked. The code works with or without the lockdown.
2. [ ] Merge the Phase 1 + 2 code to `main` (**confirm before pushing to main**).
3. [ ] Dry-run the migration (per the decision above), then apply it to production (**explicit go-ahead**).
4. [ ] Re-run the tests below against production.

### Tests

- [ ] Catalog check (queries at the bottom of the migration file): zero client write grants, zero client write policies.
- [ ] **Attacker JWT via PostgREST**, where each must fail (42501 or 0 rows):
  - [ ] `scenario_mastery` upsert with `is_mastered: true`
  - [ ] `profiles.update({ tier: 'enterprise', platform_role: 'multi_venue_manager' })`
  - [ ] `organizations` insert with `trial_tier`/`seat_limit`
  - [ ] `organization_members` insert sponsoring own email
  - [ ] `venue_staff` insert into another org's `venue_id`
  - [ ] `venues` insert/update; `training_programs` / `venue_inventory_items` insert
  - [ ] `pending_invites` select returns nothing
- [ ] **Non-manager account** calling `/api/management/snapshot`, `/staff`, `/venues`, `/inventory` or `/training-programs` → 403, and no venue gets created.
- [ ] **Duty manager** calling venues POST/PATCH/DELETE → 403.
- [ ] **Cross-org ownership matrix:** the attacker manager's JWT with org B's ids (venue, staff, inventory, program, cert, membership) → 404/403, and org B's rows are unchanged.
- [ ] **Legitimate-flow smoke test** (preview first, then production after the lockdown):
  - [ ] signup + onboarding, Google sign-in (display name set)
  - [ ] desktop and mobile notification prefs (confirmation email only on first enable)
  - [ ] venue create/rename/delete and weekly report toggle (now actually saves)
  - [ ] staff add/edit/delete, inventory, training programs, AI coach
  - [ ] invite + join, Scenario Training, quiz, Arena, and the manager roster reflects attempts

## Phase 3 — Server-side gating & identity (H2 rest, H3, H4, H5 rest, M3, M7)

- [ ] `requireManager()` on the remaining `/api/management/*` handlers (Phase 2 covered inventory, training-programs, venues, staff, snapshot, group-summary and coach). Still to do: `memberships`, `memberships/resend`, `recognitions`, `compliance/certifications`, `coach/history`. Grep check: every route calls it, or `join-venue` (staff-facing) is the documented exception.
- [ ] Duty-manager data scope: they own no venues, so they see an empty console and get a "Primary Venue" auto-created on first write. Design the real scope (their inviting owner's venues).
- [ ] Seat trigger: decide NULL/0 `seat_limit` handling for the 3 venue owners without an `organizations` row, then enforce per-tier caps.
- [ ] Venue cap per tier (confirm numbers against the pricing page) + seat check before any `venue_staff`/`organization_members` insert; `memberships` verifies `venueId` ownership.
- [ ] Identity linked at acceptance only; `syncMasteryToVenueStaff` by `staff_user_id` only; all email `ilike` → `eq` on lowercase; lowercase-email migration.
- [ ] Webhook and dashboard checkout-success resolve the user from Stripe metadata only (M7).
- [ ] 8-character join codes (rotation migration) + pending/approved membership.
- [ ] Single access resolver (lapsed subscription, paused sponsor, exact email).

Tests:
- [ ] Free user POSTs to `venues`/`staff` → 403; boutique owner's second venue → 403; seat cap enforced.
- [ ] A roster row with a stranger's email gets no progress until they accept.
- [ ] `j_smith@` does not match `jxsmith@` anywhere (access, sync, webhook).
- [ ] A reused Stripe `session_id` from another account does not upgrade tier.
- [ ] A duty manager can't reach billing or settings routes.

---

## Phase 4 — Atomic attempts, idempotency, server-graded quiz (C4 proper, M1, M2)

- [ ] `record_attempt` Postgres function (service role only), `training_attempts` table, `attemptId` from clients, reused on Retry.
- [ ] In-flight ref lock in `DashboardTrainer.handleSubmit`.
- [ ] Verify quiz: `verify/start` returns questions without answers + an HMAC token `{uid, moduleId, qids, nonce, iat, exp = +10 min}`. Submit checks signature, expiry, uid, module, qids and an unused nonce (persisted in `verify_attempts`). Answers are server-only.
- [ ] `VERIFY_TOKEN_SECRET` added in Cloudflare env **by you**. The value is never read or set by Claude.

Tests:
- [ ] The same `attemptId` twice → one increment; 20 parallel distinct → correct totals.
- [ ] No answer key in `.next/static` after build.
- [ ] Replayed token → 409; token older than 10 min → 410; token from user A submitted by user B → 403; tampered token → 403; token for another module → 403.
- [ ] Honest quiz still passes on desktop and mobile.

---

## Phase 5 — ELO retirement & dead code (decided: full removal)

- [ ] Replace consumers:
  - mobile Home ordering → mastery % + recency
  - `module-navigator` recommendations → mastery %; drop ELO gating
  - `PredictivePanel` → `masteryStatus`
  - remove `avgElo`/`elo`/`eloRating`/`eloDelta` from APIs and types
  - retire diagnostic seeding, or keep only `category_scores` for recommendations
- [ ] Marketing copy: `app/how-it-works/page.tsx:212` and `components/ui/CompareMatrix.tsx:85`. Truthful wording; don't claim adaptive difficulty unless `isBridge` is really used.
- [ ] Delete ELO math in `lib/mastery.ts` (`expectedScore`, `newElo`, `scenarioDifficulty`, `ELO_K`).
- [ ] A release later, a migration drops `elo_rating`, `avg_module_elo`, `min_elo_for_advanced` and `module_elo_baseline` (grep for zero references first).
- [ ] Dead code:
  - `user_level_progress` reads/types + table
  - `_legacy_user_training_progress` if unused
  - stale `retry-queue.ts` comments
  - unused `ModuleVerify` fields
  - `scenarios` route answer leak
  - `venues` reportSchedule filter (`owner_user_id`)
- [ ] Metrics (M5): completion % formula, Elite badge counts quiz only against the total module count, `sbe_elite_number` sequence or removal.

Tests:
- [ ] mobile "Continue Learning" still orders sensibly; recommendations still render; the manager Predictive panel still shows data.
- [ ] Manager roster completion % can exceed 10%.
- [ ] No `elo` references remain (grep) before the column-drop migration.

---

## Phase 6 — Polish & docs

- [ ] Generic error messages to clients (`staff`, `inventory`, `venues`), with details logged server-side.
- [ ] `readJsonBody` on the remaining routes (fix desktop `authHeaders()` Content-Type first for Arena).
- [ ] Escape form fields in the `contact` and `book-call` emails (HTML injection into our own inbox).
- [ ] `coach/history`: rate limit, length cap, `venueId` ownership.
- [ ] `ProgressOverview.tsx:108` `any`; `RecommenderCard.tsx:48` emoji → SVG.
- [ ] Pre-existing lint errors in `.agents/skills/impeccable/scripts/live-browser.js` (15 unused-var errors): ignore the path in ESLint or fix.
- [ ] Docs: `DATABASE_SCHEMA.md`, `MASTERY_ENGINE.md`, `MANAGER_CONSOLE.md`, `STAFF_APP.md`, `MOBILE_BUILD.md`, mark the 09-26 handoff items resolved, tick matching items in `docs/DEAD-CODE-AUDIT-PLAN.md`.

## Always, every phase

- [ ] `npx tsc --noEmit`, `npx eslint app lib components`, `npx next build`
- [ ] Preview smoke test: Scenario Training (desktop + mobile) → the manager roster reflects it; quiz; Arena; invite → join; venue/staff CRUD; checkout-success with a Stripe test session.
