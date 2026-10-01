# To Do — 2026-09-30 Security & Scoring Audit Remediation

Running checklist for the 2026-09-30 audit: mastery engine, Manager Console ↔ staff, and the training loop. The plan file is `~/.claude/plans/pasted-content-id-70f7-you-are-purrfect-gem.md`. Finding IDs (C1–C4, H1–H5, M1–M8, L1–L8) refer to that plan.

Tick an item only once it has been **tested**, not just once it's written.

## Status

| Phase | Branch | State |
|---|---|---|
| 1. Same-day API hotfixes | merged to `main` 2026-10-01 (`3f316ef`) | **Live in production.** Signed-in smoke tests below still open |
| 2. RLS lockdown | merged to `main` 2026-10-01 (`3f316ef`) | Code live. `20260930_rls_lockdown.sql` **applied to production 2026-10-01** (confirmed: zero client write grants on the core tables). Smoke tests still open |
| 2.5 Legacy org backfill + seat trigger | `main` | **Applied to production 2026-10-01** (confirmed: 3 org rows at 35/35/15 seats, 0 owners without an org, trigger tightened) |
| 3. Server-side gating & identity | `audit-phase3` | **Code done 2026-10-01**, preview only. Needs `20261001b_venue_code_alphanumeric.sql` applied **before** merging |
| 4. Atomic attempts, idempotency, server-graded quiz | — | Not started |
| 5. ELO retirement & dead code | — | Not started |
| 6. Polish & docs | — | Not started |

Phase 1 preview: https://fix-audit-phase1-hotfixes.serve-by-example-ai.pages.dev
Phase 1 + 2 preview: https://audit-remediation.serve-by-example-ai.pages.dev

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

### Migration dry run — done 2026-09-30 (option A, rolled back)

A single `DO` block on production ran each attack as a real non-manager user (`authenticated` role with that user's JWT claims), applied the migration SQL verbatim, re-ran the attacks, then raised an error so everything rolled back. Afterwards, catalog checks confirmed production was untouched: original policies and grants present, new policies absent, no test rows left.

| Attack | Before (live today) | After migration |
|---|---|---|
| `scenario_mastery` upsert `is_mastered=true` | ALLOWED | blocked (42501) |
| `profiles` set `tier=enterprise`, `platform_role=multi_venue_manager` | ALLOWED | blocked |
| `organizations` insert with enterprise trial and 9999 seats | ALLOWED | blocked |
| `organization_members` self-sponsor | ALLOWED | blocked |
| `venue_staff` 100%-score fake staff into another org's venue | ALLOWED | blocked |
| `venues` / `training_programs` / `venue_inventory_items` insert | ALLOWED | blocked |
| `user_challenges` / `user_level_progress` insert | ALLOWED | blocked |
| Read own profile; an owner reads own venues | works | works |

The "before" column is live confirmation that C1–C3 are exploitable in production until the migration is applied.

Preview check (unauthenticated): `snapshot`, `group-summary`, `venues`, `staff`, `inventory`, `training-programs` and `coach` all return 401.

### Deploy order (don't change it)

1. [x] Commit and push `audit-remediation` to its own preview (`47af0a5`, https://audit-remediation.serve-by-example-ai.pages.dev).
   - [ ] Signed-in smoke test on that preview while the DB is still unlocked (legitimate-flow list below). The code works with or without the lockdown.
2. [ ] Merge the Phase 1 + 2 code to `main` (**confirm before pushing to main**).
3. [x] Dry-run the migration (done, table above).
   - [ ] Apply it to production (**explicit go-ahead**), via `apply_migration` with `supabase/migrations/20260930_rls_lockdown.sql`. Rollback: `supabase/rollbacks/20260930_rls_lockdown_rollback.sql`.
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

Branch `audit-phase3` (from `main` after the Phase 1+2 merge). No DB migration needed.

### What changed from the plan (found while building)

- **Venue caps come from the pricing page, not the plan's guess.** Boutique / `venue_single` = 1 venue; Commercial / `venue_multi` / Enterprise = unlimited. The plan's "commercial = 5" was invented, and `SettingsPanel.tsx` already notes the old "5 Venues Maximum" was fabricated. Live data fits: the largest boutique owner has 1 venue, the largest commercial owner has 3.
- **No lowercase-email migration needed.** Live check: 0 mixed-case emails in `venue_staff`, `organization_members` or `profiles`. Exact `eq` on the lowercased value matches everything `ilike` matched, minus the wildcard false positives.
- **The roster row isn't a seat.** `staff` POST creates a `venue_staff` roster entry (no access granted); seats are `organization_members` rows (`memberships` POST, `join-venue`), which the seat trigger and `entitlement.seatLimit` cap. No cap was added to roster entries — the starter seed creates placeholder rows too.
- **Trial managers couldn't invite through `memberships`.** It read `profiles.tier` (`free` during a trial) and returned "your plan does not include staff seats". Seat and venue limits now come from `requireManager()`'s `entitlement` (paid B2B tier, else active trial tier).
- **New finding: cross-org duty-manager demotion.** `memberships` PATCH/POST changed `profiles.platform_role` matched **by email, globally**. An owner could list another org's duty manager as their own member, then demote them, removing their access to the other org. Role changes now apply only to the linked `organization_members.user_id`, and a demotion is skipped while another active duty-manager grant exists. Removing a duty manager's membership now also revokes their console access (it previously persisted forever).
- **New finding: `recognitions`** put the manager's message and the staff name into email HTML unescaped, with no rate limit and no length cap. All three fixed.
- **`session/stamp`** built a PostgREST `.or()` filter by string-interpolating the user's email; it now links first and queries by `user_id` only.
- **`/management/dashboard` had the same M7 flaw** as `/dashboard` (any paid `session_id` upgraded the signed-in user). Both fixed.

### Build — done 2026-10-01

- [x] `requireManager()` on `memberships` (GET/POST/PATCH/DELETE; PATCH owner-only), `memberships/resend`, `recognitions`, `compliance/certifications`, `coach/history`. Grep check passes: `join-venue` is the only route without it, documented in the file.
- [x] `lib/management/auth.ts`: `entitlement { tier, seatLimit, venueLimit }` on the context; `resolveEntitlement()` exported and unit-tested.
- [x] `venues` POST: 403 `VENUE_LIMIT_REACHED` at the tier's venue cap.
- [x] `memberships` POST: `venueId` ownership-checked (404), email validated, seat limit from entitlement, CTA link escaped.
- [x] `coach/history`: `venueId` ownership on POST, ≤10 messages per save, roles limited to `user`/`coach`, content capped at 8,000 chars, sane `limit` parsing.
- [x] `compliance/certifications`: field length caps, date format check, foreign cert → 404 (was 403, which confirmed it existed), generic errors.
- [x] `lib/staff-link.ts`: the only email→account link. Exact lowercase match, fills empty links only. Called from `session/stamp` (sign-in) and `training/progress` (fallback for sign-in paths that skip the stamp).
- [x] `syncMasteryToVenueStaff(admin, userId)`: syncs by `staff_user_id` only, no email lookup, no linking side effect. All 4 callers updated.
- [x] Every `ilike` email match → exact `eq` (join-venue, memberships, progress, webhook, `resolveAccess`, session/stamp). `grep ilike app lib components` is now empty.
- [x] M3: `resolveAccess()` (API routes) now delegates to `resolveTierAccess()` (pages). API routes now apply the lapsed-subscription downgrade and the paused-sponsor rule too.
- [x] M7: `/dashboard` and `/management/dashboard` only apply a checkout-success upgrade when `metadata.userId` matches the signed-in user. Guest checkouts are left to the webhook.
- [x] 19 Vitest tests pass; `tsc`, ESLint and `next build` clean.

### Open — your decision

- [x] **Join codes (H2 rest) — decided 2026-10-01: 6-character letters + numbers for new venues; existing 4-digit codes stay.** No manager approval step. Built:
  - `lib/venue-code.ts`: alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no 0/O, 1/I/L), crypto-random with rejection sampling, ~887M codes. `normalizeVenueCode()` accepts lower case, spaces and dashes, and old 4-digit codes. 5 Vitest tests.
  - `createVenue` / `ensureManagerVenue` generate the new codes; `join-venue` looks up by normalised string; desktop, onboarding and mobile join forms accept letters (no numeric keypad, upper-cased as typed, `e.g. K7P3QX`).
  - `supabase/migrations/20261001b_venue_code_alphanumeric.sql`: `venue_code` integer → text (existing values carry over), drops the sequential `nextval` default, adds a format CHECK. Rollback in `supabase/rollbacks/`.
  - **Dry run on production (rolled back, then confirmed untouched):** type became text; the current production code's numeric insert still stores and looks up correctly; a new `K7P3QX` inserts; lower case, look-alike characters and duplicates are rejected.
  - Remaining risk: the 12 existing venues keep guessable 4-digit codes (still rate-limited). A manager can be given a "regenerate code" button later if you want those rotated.
- [ ] **Consent for email linking (H4 rest).** Linking now happens only at sign-in, with exact matching, but still without the staff member agreeing: a manager who adds someone's real email to their roster sees that person's training progress once they sign in. A real fix is an "Accept invitation from <venue>" prompt. Live data: 0 unlinked roster rows currently match an existing account, so nothing is exposed today.
- [x] **Duty-manager data scope — decided 2026-10-01: not building it.** Duty managers keep their current access; no "inviting owner's venues" scope.

### Deploy order (Phase 3)

1. [ ] Apply `supabase/migrations/20261001b_venue_code_alphanumeric.sql` (current production code works with it).
2. [ ] Smoke test the `audit-phase3` preview.
3. [ ] Merge `audit-phase3` → `main` (**confirm before pushing to main**). Merging before step 1 breaks venue creation.

### Tests (preview, then production)

- [ ] Free / pro user POSTs to `venues` → 403; boutique owner's second venue → 403 `VENUE_LIMIT_REACHED`; commercial owner can add a 2nd and 3rd venue.
- [ ] Trial manager (free tier + active org trial) can invite through Team → Invite; seat count shows the trial tier's seats.
- [ ] `memberships` POST with another org's `venueId` → 404. Seat cap → 403 at the limit.
- [ ] Duty-manager flow: invite an existing linked account as duty manager → console access immediately; change to staff → access removed; a second org's duty-manager grant survives the first org demoting them.
- [ ] Recognition with `<b>hi</b>` arrives as literal text; 11th recognition in a minute → 429.
- [ ] A new invitee signs up with the invited email → their roster row links and the roster updates after their first attempt.
- [ ] A canceled subscriber gets 403 from `/api/evaluate` (same as the page now shows).
- [ ] A reused Stripe `session_id` from another account does not upgrade the tier.
- [ ] A duty manager gets 403 on `venues` and `memberships` PATCH.
- [ ] Join codes: a new venue shows a 6-character code; joining with it typed in lower case works; an existing 4-digit code still joins; the `?join=` sign-up link auto-joins with both kinds.

---

## Bug fix (2026-10-01) — Manager Console "Save name" never persisted

Reported as a suspected Phase 2 regression ("direct client writes to profiles were locked down, so the save handler might be failing"). It wasn't — `/api/profile/update-name` already used the admin client before Phase 2 and was never touched by it. The real, pre-existing bug, found by reading the actual code rather than assuming the report's diagnosis:

- `components/mission-control/SettingsPanel.tsx`'s Account tab form POSTed `{ name }`, but the route reads `body.displayName` — every save silently 400'd ("Name cannot be empty") and never reached the database. That's why it never persisted, and why a refresh showed the old name (there was nothing to revert from — it never saved).
- Even on a hypothetical success, the handler never called `setAccountDisplayName(...)`, so `ManagementTopbar` and the `mc-profile-name` badge — both already wired reactively to that state, confirmed by reading `ManagerControlCenter.tsx` — wouldn't have updated until a full reload re-seeded it from the server.

**Fixed:** both issues in the same handler — correct body key, `setAccountDisplayName(name)` on success, and errors now at least log to the console instead of failing silently.

**Verified:** `tsc`, ESLint and `next build` all clean.

**Related, found but not fixed (separate, smaller bug, out of the reported scope):** the *staff* dashboard's own name-save (`DashboardShell.tsx`'s `handleDisplayNameUpdate`) already sends the correct key and does persist correctly. But `displayName` there is a static prop from the server component, not state — so the Home/Progress greeting headers that show it won't reflect a save until the next full page load. There's no persistent nav bar showing the name on the staff side to "revert," so this isn't the bug that was reported, and fixing it would mean lifting `displayName` into state threaded through `DashboardShell` similarly to `accountDisplayName` in `ManagerControlCenter.tsx` — a separate, slightly more invasive change than what was asked here. Worth a small follow-up pass.

## Phase 2.5 — Legacy org backfill + seat trigger tightening (2026-10-01)

Out-of-band follow-up, requested alongside Phase 2/3. Scope was narrowed from what was originally asked (see "What was declined" below) after checking it against the live database and `lib/trial.ts`.

### What this does

`supabase/migrations/20261001_backfill_legacy_org_rows_and_tighten_seat_trigger.sql`:
1. Creates an `organizations` row for the 3 production venue owners who don't have one (`venues`/`venue_staff` predate the org/billing model). Each gets `subscription_tier` and `seat_limit` read from their own real `profiles.tier` via the same `TIER_SEATS` mapping the app already uses (`lib/session.ts`) — commercial → 35, commercial → 35, boutique → 15. Confirmed live, not guessed.
2. Tightens `check_org_seat_limit()`: a missing/zero `seat_limit` now means **zero** allowed seats, not unlimited. Combined with step 1 in one transaction, so no account is ever tightened before it's backfilled.

Rollback: `supabase/rollbacks/20261001_backfill_legacy_org_rows_and_tighten_seat_trigger_rollback.sql` (restores the original "NULL/0 = unlimited" trigger; lists the 3 owner ids if the backfilled rows themselves ever need removing — they don't need to be, since they only grant real entitlements).

### What was declined from the original ask, and why

- **Not** setting `tier`/`subscription_tier`/`trial_tier` to `'enterprise'` for anyone. `lib/trial.ts` documents `enterprise` as sales-assisted-only — never a self-serve trial value — and this would have overwritten real customers' billing tier in the DB with no matching Stripe subscription.
- **Not** applied to all 8 production venue owners — only the 3 who actually lack an `organizations` row. The other 5 already have one; touching them wasn't needed and wasn't asked for once the real scope was checked.
- **Not** deleting the Inventory feature (a separate "Task 1" in the same request) — that's a product decision unrelated to the security audit; inventory writes are already gated behind `requireManager()` as of Phase 2.

### Verification — done (dry run, rolled back)

- [x] Single `DO` block: captured "before" state, applied the migration verbatim inside the transaction, re-tested, then raised an exception so everything rolled back.
- [x] Before: a free-tier account with no venue/org row could insert an unlimited `organization_members` seat — confirms the gap existed.
- [x] After: exactly 3 `organizations` rows inserted, with the exact expected tier/seat values (commercial/35, commercial/35, boutique/15).
- [x] After: the same free-tier account is now blocked with `Seat limit reached. Upgrade your venue plan to add more staff.` — the same string `join-venue`'s Phase 1 handling already catches and turns into a friendly 409.
- [x] After: the one backfilled owner with an existing seat in use (1/35) can still add another seat — no regression.
- [x] Re-running the backfill INSERT a second time inserts 0 rows — idempotent.
- [x] Post-rollback: production `organizations` count back to 7, trigger function body back to the original "NULL/0 = unlimited" text, no probe rows left.
- [x] Broader check before writing this: no `organization_members.manager_id` exists without a matching `venues.owner_user_id` — the 3 found are the complete set.

### Still open

- [ ] **Apply the migration to production.** Writing it to the live DB was blocked by Claude Code's own auto-mode safety classifier (a local guard, not a Supabase/DB error) — it did not give a reason, and I'm not attempting another tool or channel to push it through per that guard's own instructions. **You'll need to apply it yourself**, e.g. via the Supabase SQL editor, the Supabase CLI, or by re-running it here after granting it explicitly. The migration file is on the `audit-remediation` branch, fully dry-run verified above.
- [ ] After applying: re-run the "after" checks above for real (free-tier org-less insert blocked; a real invite from one of the 3 backfilled owners still succeeds).
- [ ] Smoke test `join-venue`'s "no free staff seats" 409 message actually fires for a genuinely seat-capped account.

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
