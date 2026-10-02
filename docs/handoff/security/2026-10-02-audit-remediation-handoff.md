# Handoff: 2026-09-30 security & scoring audit remediation (Phases 1–6)

- **Date:** 2026-10-02 (Phases 1–3 written first, extended the same day for 4–6)
- **Covers:** every phase of the 2026-09-30 audit. Phases 1–5 are merged to `main` and live in production with all their migrations applied. Phase 6 (polish and docs) ships on branch `audit-phase6` together with this note and is live once that branch is merged.
- **Related docs:**
  - Running checklist with test lists and dry-run tables: `2026-09-30-audit-remediation-todo.md` (same folder).
  - Full findings and the 6-phase plan: `~/.claude/plans/pasted-content-id-70f7-you-are-purrfect-gem.md`. Finding IDs (C1–C4, H1–H5, M1–M8, L1–L8) refer to it.
  - Earlier work this builds on: `2026-09-26-ai-token-abuse-and-request-races.md`, `2026-09-26-ai-prompt-injection-audit.md`.

---

## The short version

Before this work, any signed-in user could write their own scores, tier, role, seats and roster rows straight into Supabase from the browser. They only needed the public anon key and their own login token, because the RLS policies and table grants allowed client writes. Several API routes also trusted the browser for things only the server should decide.

Now:

1. **Clients are read-only** on every table that matters. Every write goes through an API route on the service-role (admin) client.
2. **The admin client bypasses RLS, so the API route is now the security boundary.** Every `/api/management/*` handler starts with `requireManager()`. It checks identity, rate limit, session, role and plan from the database, plus ownership of any venue or staff id it's given.
3. **Identity follows `user_id`, not email.** Email is used exactly once, at sign-in, to link an account to the roster rows a manager created for it. It's an exact lowercase match.
4. **Plan limits are enforced on the server** (venue count, seat count), not just hidden in the UI.
5. **Scores can't be forged or double-counted.** The server grades everything — Scenario Training, Arena and now the verify quiz, whose answer key never reaches the browser — and each attempt is recorded once, atomically, inside a Postgres function keyed by a client attempt id.
6. **Elo is gone.** It was computed but never a reliable signal; recommendations and the manager metrics now use mastery, recency and the placement check.

If you only read one section, read "Rules for new code" below.

---

## What's live in production

| Item | Where | State |
|---|---|---|
| Phase 1 + 2 code | `main`, merge `3f316ef` (2026-10-01) | Live |
| Phase 3 code + 6-character join codes | `main`, merge `bf10a97` (2026-10-02) | Live. The first Cloudflare build failed on a temporary Google Fonts error while downloading Outfit (not caused by the code); a retry succeeded. If it recurs, self-host the fonts with `next/font/local` |
| `supabase/migrations/20260930_rls_lockdown.sql` | Production DB | Applied 2026-10-01. Verified: zero client write grants on the core tables |
| `supabase/migrations/20261001_backfill_legacy_org_rows_and_tighten_seat_trigger.sql` | Production DB | Applied 2026-10-01. Verified: 3 org rows created (35/35/15 seats), 0 owners without an org, trigger raises on NULL/0 |
| `supabase/migrations/20261001b_venue_code_alphanumeric.sql` | Production DB | Applied 2026-10-02. Verified: `venue_code` is text, no sequence default, format CHECK present |
| Phase 4 + 5 code | `main`, merge `9348cce` (2026-10-02) | Live (new quiz endpoint answering in production ~3½ min after the push). Phase 4 was smoke-tested on the `audit-phase4` preview; Phase 5 went straight to production at the owner's request |
| `20261002_atomic_attempts_and_verify_quiz.sql` | Production DB | Applied 2026-10-02. Dry-run first (16 behaviour checks, rolled back). Verified: 2 tables, 3 functions, service-role only |
| `20261003_lock_scenarios_answer_key.sql` | Production DB | Applied 2026-10-02. Verified: no policies, no client grants on `scenarios` |
| `20261003b_retire_elo_and_elite_numbers.sql` | Production DB | Applied 2026-10-02. Verified: `record_attempt` has no Elo, `award_sbe_elite` service-role only. (Not dry-run — the owner applied it directly) |
| `20261003c_drop_elo_columns_and_legacy_tables.sql` | Production DB | Applied 2026-10-02 **after** the Phase 5 deploy. Verified: 0 Elo columns, both legacy tables gone, attempts recording again. See the incident note below |
| Phase 6 code + docs | branch `audit-phase6` | Not merged at the time of writing; no migration |

**Incident, 2026-10-02 — drop migration applied before its code.** `20261003c` (marked "do not apply until Phase 5 is live in production") was first applied while production still ran the Phase 3 code, which read the dropped columns. For roughly five hours Scenario Training and Arena attempts failed to save, staff progress pages showed 0% and the manager staff list lost its scores (the quiz still saved). It was fixed by running the rollback file (columns and tables restored empty), deploying Phases 4+5, then re-applying `20261003c`. No real progress data was lost; only the 11 legacy rows the drop was meant to remove. **Lesson: expand/contract migrations need the deploy in between — check the deployed code before running any `DROP`.**

Every migration has an exact-restore rollback in `supabase/rollbacks/` with the same name plus `_rollback`. Rollbacks are for emergencies only. Revert the app code first, because the code assumes the locked-down database.

**How migrations were tested.** Supabase branching wasn't usable, because the core tables (`profiles`, `scenario_mastery`, `venues`, `venue_staff`) were created in the dashboard and appear in no migration, so a branch replay fails. Each migration was dry-run on production inside one `DO` block:
1. Run the attacks as a real user and record the "before" result.
2. Apply the migration SQL verbatim.
3. Re-run the attacks.
4. `RAISE EXCEPTION`, so the whole block rolls back.

Catalog checks afterwards confirmed production was untouched. Use the same technique for future migrations. The user applies migrations to production themselves, in the Supabase SQL editor; Claude Code's safety classifier blocks it from applying them.

---

## Phase 1: same-day API hotfixes (commit `950b5be`)

API-only, no database change.

| Finding | Problem | Fix |
|---|---|---|
| C4 (stopgap) | `/api/training/save` accepted both "true" and "false" for the same quiz question, so one POST passed any module | Reject duplicate, conflicting or foreign question ids, any wrong answer, and more than 8 answers. Body capped at 4 KB. **Superseded by Phase 4's server-graded quiz** (`/api/training/save` is now retired) |
| H1 | `management/staff` returned a live Supabase invite link (account pre-hijack). Names went unescaped into email HTML from our domain | `inviteLink` is now just `/login`. Every interpolated value goes through `escapeHtml()` (`lib/email-template.ts`). Rate limited. Same fixes in `memberships/resend` |
| H2 (part) | `join-venue` had no rate limit, so 4-digit codes were brute-forceable | 5/min per user, 20/min per IP, 20/day per user. Insert errors now fail the request instead of being ignored |
| H5 (part) | Arena recorded a pass at 60 while the UI said 75 | `recordAttempt()` takes an explicit `passed` flag. Arena only sets `is_mastered` at 75+. Arena also gained the session and plan checks `/api/evaluate` has |
| M6 | `contact`, `book-call` and `toolkit-capture` had no rate limit (toolkit emails any address) | 3/min per IP |

**Telemetry.** Rejections log one JSON line through `console.warn`, which shows up in the Cloudflare Workers logs. Event names: `quiz_submit_rejected` (gone with the retired save route; Phase 4 logs `verify_start_rejected` / `verify_answer_rejected` and `training_save_retired_called`), `join_venue_rejected`, `contact_rejected`, `book_call_rejected`, `toolkit_capture_rejected`, plus `management_access_denied` from `requireManager()`. Lines carry no answer content and no email addresses.

---

## Phase 2: RLS lockdown (commit `47af0a5`, migration `20260930_rls_lockdown.sql`)

Fixes C1 (client writes to `scenario_mastery`), C2 (`profiles` self-update on every column, including `tier` and `platform_role`) and C3 (client writes to org, billing and roster tables).

**Order mattered.** The guard was built first, then every write was moved server-side, and only then was the database locked. Locking first would have broken live flows.

**1. `requireManager(req, { rateKey, ownerOnly?, limit? })` in `lib/management/auth.ts`**
- Validates the JWT with `auth.getUser` (never `getSession()` or local decoding) → 401.
- Rate limit per user, and per IP at 3× → 429.
- `sbe_session_id` one-device check → 409. A *missing* cookie is allowed, matching `middleware.ts`.
- Reads role, tier and trial from the database with the admin client, never from the request body → 403.
- `ownerOnly` excludes duty managers.
- Returns `{ user, admin, profile, entitlement, assertOwnsVenue(id), assertOwnsStaff(id) }`. The ownership helpers **throw 404**: no silent fallback to "your primary venue", and no hint that a foreign id exists.
- `managementErrorResponse()` sends a generic error to the client and logs the real one on the server.
- Unit tests: `lib/management/auth.test.ts`. Vitest is set up via `vitest.config.mts` and runs with `npm test`.

**2. Every client write moved server-side**
- Management routes (`inventory`, `training-programs`, `venues`, `staff`, `snapshot`, `group-summary`, `coach`) use `requireManager()` and the admin client.
- `management/staff` lost its "user client, then admin fallback" pattern.
- `DashboardShell` notification prefs go through `PATCH /api/profile/notifications`. That route now emails only on an off → on change.
- `auth/callback` uses the admin client.
- The browser `profiles.upsert` calls in `app/auth/page.tsx` and `app/login/page.tsx` were removed. They were already failing silently, because `profiles` has no INSERT policy; the `on_auth_user_created` trigger creates the row.
- A sweep confirmed every `.insert`, `.update`, `.upsert` and `.delete` in `app`, `lib` and `components` runs on a service-role client.

**3. The migration**
- Drops every client INSERT, UPDATE, DELETE and ALL policy on 21 tables, and recreates SELECT-only policies with the same row scoping (`TO authenticated`). `pending_invites` gets no client read at all.
- Revokes INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER and REFERENCES from `anon` and `authenticated`.

**Found while building**
- `getManagementSnapshot()` **creates a venue on read.** `snapshot`, `group-summary` and `coach` called it with the user client, so any signed-in account could create a venue just by calling `/api/management/snapshot`. All three are now behind `requireManager()`.
- `venues` PATCH `reportSchedule` filtered on a column that doesn't exist (`manager_user_id`), so the weekly report toggle never saved (L2). Fixed to `owner_user_id`.
- The audit missed some client-writable tables, which are now in the lockdown: `training_programs`, `venue_inventory_items`, `staff_recognitions`, `manager_coach_sessions`, `pending_invites`, `venue_staff_certifications` and `user_challenges`.

**Unrelated bug fixed on the same branch (`9404f2d`).** The Manager Console "Save name" sent `{ name }` while the route reads `displayName`, so it never saved. It also never updated the topbar state. Both are fixed. The staff dashboard's greeting has a similar display-only staleness (it shows the old name until reload); that one isn't fixed.

---

## Phase 2.5: legacy org backfill and seat trigger (commit `0a3170d`)

`check_org_seat_limit()` treated a NULL or 0 `seat_limit` as **unlimited**. Three production venue owners predated the org/billing model and had no `organizations` row, so the trigger couldn't simply be tightened.

The migration does two things in one transaction:
1. Creates the 3 missing org rows. Each gets `subscription_tier` and `seat_limit` from that owner's real `profiles.tier`, using the app's own `TIER_SEATS` mapping.
2. Changes the trigger so NULL or 0 means **zero** seats.

**Declined from the original request:**
- Setting anyone to `enterprise`: it's sales-assisted only (`lib/trial.ts`), and doing so would have overwritten real billing tiers with no matching Stripe subscription.
- Touching the 5 owners who already had an org row.
- Deleting the Inventory feature: that's a product decision, not part of the audit.

---

## Phase 3: server-side gating and identity (commits `265f396`, `6ec7a34`)

No new migration apart from the join-code change.

**Gating (finishing H3)**
- `requireManager()` is now on every `/api/management/*` handler, reads included: `memberships` (GET/POST/DELETE, with PATCH owner-only), `memberships/resend`, `recognitions`, `compliance/certifications` and `coach/history`.
- The only exception is `join-venue`, which staff must be able to call. A comment in the file says so.
- **Check:** `grep -n "requireManager(" app/api/management/join-venue/route.ts` should match only the comment. Every other `app/api/management/**/route.ts` should call it in each handler.

**Plan limits (H3)**
- `requireManager()` returns `entitlement { tier, seatLimit, venueLimit }`, from `resolveEntitlement()`. The tier is the paid B2B tier, otherwise the active trial tier, otherwise none. Admin accounts get everything.
- **Venue caps** come from the pricing page: Boutique / `venue_single` = 1; Commercial / `venue_multi` / Enterprise = unlimited. The plan's "commercial = 5" had no source.
- `venues` POST returns 403 `VENUE_LIMIT_REACHED` at the cap.
- **Seats** come from `TIER_SEATS` (15 / 35 / 9999). The cap applies to `organization_members` rows, which is what a seat is. A `venue_staff` roster row grants no access and isn't capped.
- `memberships` POST now checks the caller owns `venueId` (404 otherwise), validates the email, and uses the seat limit from the entitlement.
- Side effect: trial managers couldn't invite before (the route read `profiles.tier`, which is `free` during a trial). Now they can.

**Identity (H4)**
- `lib/staff-link.ts` `linkStaffAccountByEmail()` is now the only place an email links to an account.
  - Exact lowercase match.
  - It only fills empty `venue_staff.staff_user_id` and `organization_members.user_id` values, so it never re-points a link.
  - It's called from `session/stamp` at sign-in, and from `training/progress` as a fallback.
- `syncMasteryToVenueStaff(admin, userId)` now syncs by `staff_user_id` only. There's no email lookup and no linking side effect.
- Every `.ilike(email)` is now `.eq(col, email.toLowerCase())`, because `_` and `%` act as wildcards in `ilike`, so `j_smith@x.com` matched `jxsmith@x.com`. `grep ilike app lib components` returns nothing.
- `session/stamp` used to build a PostgREST `.or()` filter by string-interpolating the email. It now links first, then queries by `user_id`.
- The billing webhook matches on the exact lowercase email.

**Other fixes**
- **Cross-org duty-manager demotion (new finding).** `memberships` changed `profiles.platform_role` matched by email, across all orgs, so one owner could demote another org's duty manager. Role changes now go only through the linked `user_id`. A demotion is skipped while the person holds another active duty-manager grant. Removing a duty manager now actually revokes their console access.
- **`recognitions` (new finding):** the manager's message and the staff name went unescaped into email HTML. Now escaped, rate limited and capped at 1,000 characters.
- **`compliance/certifications`:** length caps and date validation. A foreign cert now returns 404 instead of 403, so its existence isn't confirmed.
- **`coach/history`:** checks the caller owns `venueId`; at most 10 messages per save; roles limited to `user` and `coach`; 8,000 characters per message.
- **M3:** `resolveAccess()` (API routes) now delegates to `resolveTierAccess()` (pages), so the lapsed-subscription downgrade and the paused-sponsor rule apply to the API too.
- **M7:** `/dashboard` and `/management/dashboard` apply a checkout-success upgrade only when the Stripe session is paid **and** `metadata.userId` matches the signed-in user. Guest checkouts are left to the webhook.

**Join codes (H2, rest)**
- New venues get 6 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, with no look-alikes: no 0/O and no 1/I/L. That's about 887 million combinations, generated crypto-random with rejection sampling.
- `lib/venue-code.ts` has `generateVenueCode()` and `normalizeVenueCode()`. Normalising accepts lower case, spaces, dashes and old 4-digit codes.
- The desktop, onboarding and mobile join forms accept letters.
- Migration `20261001b` turns `venue_code` into text, removes the sequential default, and adds a format CHECK.
- **The 12 existing venues keep their 4-digit codes** (still rate-limited). This was accepted on 2026-10-02 because those venues are expected to be deleted soon.

---

## Phase 4: atomic attempts, idempotency, server-graded quiz (commit `c89bc0c`, migration `20261002_atomic_attempts_and_verify_quiz.sql`)

Fixes C4 properly, M1 (replays and double-submits double-counted), M2 (concurrent requests lost updates) and L3/L4.

**Attempts**
- `record_attempt()` (Postgres, `SECURITY DEFINER`, service role only) does the whole mastery update in one transaction with the row locked: claims the attempt id in `training_attempts`, applies the rules, updates the Pro-badge streak, stores the result. A repeated id returns the stored result and changes nothing; a reused id for a different scenario raises `ATTEMPT_ID_CONFLICT`.
- `recordAttempt()` in `lib/mastery.ts` is now a thin wrapper. `findRecordedAttempt()` lets `/api/evaluate` and `/api/arena/evaluate` answer a retry with the stored feedback, without a second OpenAI call.
- Clients send an `attemptId` (`lib/attempt-id.ts`: reused on retry, renewed after success). Desktop Scenario Training also has a ref-based in-flight lock against double-clicks.
- Spam-guarded attempts no longer slide the 60-minute window. Scores are clamped and rounded.
- **Found while building:** Arena sent `score / 4` (usually fractional) into `scenario_mastery`'s integer columns and never checked the upsert error, so any Arena score not divisible by 4 failed to save (the newest Arena row before the fix was from 2026-08-23). Fixed by the rounding.
- The write-only `_legacy_user_training_progress` update was removed.

**Verify quiz**
- The plan's signed-token design (HMAC, `VERIFY_TOKEN_SECRET`) didn't fit a quiz that gives feedback after every answer. Instead each run is a `verify_attempts` row holding the question order, position, streak and a 20-minute expiry; `/api/training/verify/start` returns prompts only and `/api/training/verify/answer` grades one answer at a time through `advance_verify_attempt()`. That covers every token requirement (single use, expiry, bound to user and module, no replay) with no new secret.
- 5 correct in a row masters the module (what both apps always required; the "4 of 5" copy was corrected). `lib/verify-questions.ts` is `server-only` — a client import fails the build; a search of the built bundle found no answers.
- `/api/training/save` is retired (410 with a "refresh" message for cached clients).
- **Known limitation:** the quiz reveals the right answer after each question, so a script can still learn the answers over a few runs (rate-limited: 5 starts per module per 15 minutes, held in the database). Hiding answers until the end would change the product.

**Verification:** migration dry-run on production with 16 behaviour checks (replay, spam guard, Arena rounding, archived-row reset, quiz pass/replay/closed/other-user/expiry/exhaustion, permissions), then rolled back. Preview smoke test passed (desktop and mobile quiz, Scenario Training with double-click, Arena, retired route returns 401/410).

---

## Phase 5: Elo retirement and dead code (commit `47d23af`, migrations `20261003`, `20261003b`, `20261003c`)

**Found while building — the quiz answer key was still public.** The `scenarios` table holds all 320 verify-quiz questions with answers, and its policy let any signed-in user read it straight from PostgREST, undoing Phase 4. `20261003_lock_scenarios_answer_key.sql` removes all client access, and the unused route that served it (`/api/training/modules/[moduleId]/scenarios`) was deleted.

**Elo removed** from `record_attempt()`, the progress API, the evaluate response, the manager roster sync and all types; the columns were dropped. Replacements:
- Mobile "Continue Learning": lowest-mastery in-progress module (ties: most recent), else the most foundational untouched module.
- Recommendations (`lib/module-navigator.ts`): in progress first, then the weakest placement-check category, then difficulty and id.
- The placement diagnostic now stores percentages; only the category order is used, so old Elo-scale rows still work. Its `scenario_mastery` seeding (never worked — wrong conflict key, M4) was removed.
- Marketing: the "ELO matches you to harder scenarios" claim is gone (nothing adapts difficulty — the "bridge" is a fixed hint after two misses); review intervals corrected from "1, 4, 9 and 16 days" to the real 1, 4 and 9.

**Metrics (M5)**
- Manager `module_completion_pct` could never exceed 10%; it is now modules started ÷ total.
- SBE Elite is earned on verify quizzes for 80% of modules (the rule the badge already showed) and numbered from a sequence by `award_sbe_elite()`, instead of "20 mastered rows including Arena → always #1".

**Dead code:** `user_level_progress` reads (parsed by both desktop dashboards but never displayed), the legacy-table deletes, unused Elo types in `lib/modules.ts`.

**Found, not fixed (logged in `To_do_list.md`):** `/api/profile/delete` has no UI but any signed-in user can call it — it deletes training progress, then fails on a non-existent `mastery_rows` table, leaving the account in place, and never deletes the auth user. Needs a product decision. Also three "How it works" claims to verify.

---

## Phase 6: polish and docs (branch `audit-phase6`)

- **L6 — body caps everywhere.** Every route that used `req.json()` now reads through `readJsonBody()` with a byte cap (16 KB default; 128 KB coach history; just above the existing image limits on the photo routes). `readJsonBody()` gained `requireJsonContentType`: kept **on** for the five signed-out routes (`contact`, `book-call`, `toolkit-capture`, `roi/email`, `auth/forgot-password` — all their callers send JSON, and it stops cross-site form posts from triggering emails), **off** for signed-in routes (their `Authorization` header already forces a CORS preflight, and several manager-console callers don't set the header). Left alone: `onboarding/complete` (its "skip" step sends no body) and `billing/trial/start` (already wrapped).
- **Public form emails.** `contact` and `book-call` put every field into our own inbox's HTML unescaped; all fields are now validated as strings, length-capped (`formText()` in `lib/email-template.ts`) and escaped.
- **New finding — ROI email could send arbitrary HTML from our domain to anyone.** `/api/roi/email` emails whatever address is submitted, and three "number" fields were interpolated raw. They're now forced to finite numbers and the address is escaped.
- **L5 — raw errors.** `staff` POST returned Supabase codes/details/hints and the invite-link error; `memberships` GET returned the raw DB error. Both now return plain messages and log the detail.
- **L7.** `ProgressOverview.tsx` `any` typed; `RecommenderCard.tsx` emoji replaced with an inline SVG.
- **Lint.** `.agents/**` (local agent tooling) is ignored, so `npm run lint` passes for the whole repo.
- **Docs rewritten/updated:** `docs/MASTERY_ENGINE.md` (rewritten for the Postgres engine, idempotency, quiz, Elite, metrics), `docs/DATABASE_SCHEMA.md` (clients-read-only RLS model, new and dropped tables, migration dry-run method), `docs/MANAGER_CONSOLE.md` (`requireManager()` as the boundary, how to add a route), `docs/STAFF_APP.md` (real tier/seat list, sponsorship, server-graded quiz), `docs/MOBILE_BUILD.md` (retry reasoning); dated status notes on the two 2026-09-26 handoffs and `docs/DEAD-CODE-AUDIT-PLAN.md` (its Phase B "organization_members was dropped" is wrong — the table is live).

**Verification:** `tsc`, full `npm run lint`, 38 Vitest tests and `next build` all pass. Not preview-tested at the time of writing.

---

## Decisions on record

| Decision | Date |
|---|---|
| ELO is fully retired, including marketing copy, in its own phase (5) | 2026-09-30 |
| Phase 1 shipped ahead on its own hotfix branch | 2026-09-30 |
| `profiles` gets no client UPDATE at all, rather than column GRANTs; every profile write goes through an API route | 2026-09-30 |
| Venue caps follow the pricing page (1 / unlimited / unlimited) | 2026-10-01 |
| Join codes: 6 characters for new venues; existing 4-digit codes kept; no manager-approval step | 2026-10-01 / 10-02 |
| Duty managers keep Manager Console access when an owner grants it. There's no "inviting owner's venues only" data scope yet | 2026-10-02 |
| Verify quiz: database-tracked runs instead of an HMAC token; pass = 5 in a row; keep per-answer feedback (accepting that answers can be learned over several runs) | 2026-10-02 |
| Placement diagnostic kept, as percentages, only to order recommendations | 2026-10-02 |
| SBE Elite = verify quizzes for 80% of modules, numbered in order of qualifying | 2026-10-02 |
| Phase 5 previews skipped; Phases 4+5 merged to production together | 2026-10-02 |

---

## Rules for new code

1. **Never write from the browser.** Clients have no write grants, so a browser `.insert()` fails with 42501. Add an API route instead.
2. **A management route starts with `requireManager()`.**
   ```ts
   const gate = await requireManager(req, { rateKey: "mgmt-thing", ownerOnly: true, limit: 10 });
   if (!gate.ok) return gate.response;
   const { user, admin, assertOwnsVenue, entitlement } = gate.ctx;
   await assertOwnsVenue(body.venueId); // throws a 404 if it isn't theirs
   ```
   - Pass `ownerOnly` for settings and billing-type actions; duty managers are excluded.
   - Pass a lower `limit` for anything that sends email.
   - Wrap errors with `managementErrorResponse()`.
3. **Every admin-client update or delete still filters by the caller.** Add `.eq("owner_user_id" | "manager_user_id", user.id)` as a second layer even after an ownership assertion. Inserts take the owner from `user.id`, never from the body.
4. **Plan limits come from `entitlement`.** Never read `profiles.tier` directly for limits.
5. **Emails:** escape every interpolated value with `escapeHtml()`. Never return Supabase action links to the client.
6. **Email matching:** use `.eq(col, email.trim().toLowerCase())`, never `ilike`. Don't add new email→account linking; go through `linkStaffAccountByEmail()`.
7. **Telemetry:** log refused requests as one JSON `console.warn` line with `event: "<route>_rejected"`, a reason, the user id and the IP. Never log answer content or emails.
8. **Request bodies:** read them with `readJsonBody(req, maxBytes, { requireJsonContentType })`, never bare `req.json()`. Validate every field's type — on public routes use `formText()`.
9. **Scores and mastery:** only through `recordAttempt()` (with the client's `attemptId`) or the verify-quiz routes. Never accept a score, a pass flag or a list of "correct answers" from the browser, and never import `lib/verify-questions.ts` into client code.
10. **Migrations:** dry-run on production in a `DO` block that raises at the end; ship a rollback; and for anything that drops or renames, deploy the code that stops using it **first**.

---

## Still open

**Testing**
- [ ] **Phase 6 smoke test** after merging `audit-phase6`: the contact, book-call, ROI and toolkit forms still send (and a `<b>` in a field arrives as literal text); manager console add/edit/remove staff, invites, venues, inventory, programs, recognitions and AI coach still work; profile photo upload still works (largest bodies).
- [ ] **Phase 5 in production:** mobile Home "Continue Learning" and module recommendations look sensible; the manager roster's completion % moves past 10% for an active staff member.
- [ ] **Signed-in smoke tests for Phases 1 and 2 in production** were never fully run (lists in the checklist doc).

**Dashboard actions (only the owner can do these)**
- [ ] OpenAI: set a monthly budget and alert. Consider a separate key for the public routes.
- [ ] Cloudflare WAF rate-limit rule on `/api/demo/*`, `/api/translate`, `/api/contact`, `/api/book-call`, `/api/toolkit-capture`, `/api/roi/email`, `/api/auth/forgot-password` and `/api/management/join-venue`. The in-code limits are per Worker isolate only.

**Product and security follow-ups**
- [ ] **Account deletion** (`/api/profile/delete`) is broken in a way that can wipe a user's progress without deleting the account — decide the behaviour, or make it return 410 meanwhile (`To_do_list.md`).
- [ ] **Consent for email linking (H4, rest).** Linking happens at sign-in with an exact match, but without the staff member agreeing. The fix is an "Accept invitation from <venue>" prompt. As of 2026-10-02, no unlinked roster rows match an existing account.
- [ ] **Duty-manager data scope:** duty managers own no venues, so their first write auto-creates a "Primary Venue" for them. Needs a design pass.
- [ ] **`sbe_session_id` is optional** in `requireManager()`, matching middleware. Making it mandatory is a separate decision.
- [ ] **"Staff invites & seat management" card** (layout, no venue filter, "9999" seats) and **three "How it works" claims** — `To_do_list.md`.
- [ ] **Placement diagnostic answer key** is sent to the browser with the questions (`isCorrect` per option). Low stakes — it only orders recommendations — but it's the same pattern Phase 4 removed from the quiz.
- [ ] **`getAvailableModules()` lists all 40 modules** when access resolution fails (catalog only; the quiz, evaluate and Arena routes still enforce the plan).
- [ ] **`/api/translate`** is still an anonymous translator, and free-tier users still get AI grading on Scenario Training without it being recorded (product calls from the 09-26 handoff).

---

## Where things live

| Concern | File |
|---|---|
| Manager guard, entitlement | `lib/management/auth.ts` (+ `auth.test.ts`) |
| Email → account linking | `lib/staff-link.ts` |
| Roster sync | `lib/mastery.ts` → `syncMasteryToVenueStaff` |
| Access resolver (pages and API) | `lib/session.ts` → `resolveTierAccess` / `resolveAccess` |
| Join codes | `lib/venue-code.ts` (+ test), `app/api/management/join-venue/route.ts` |
| HTML escaping for email | `lib/email-template.ts` → `escapeHtml` |
| Rate limiting (per isolate) | `lib/rate-limit.ts` |
| Attempt engine (Postgres) | `supabase/migrations/20261002_…`, `20261003b_…` → `record_attempt`, `mark_module_mastered`, `advance_verify_attempt`, `award_sbe_elite` |
| Attempt wrapper, roster sync | `lib/mastery.ts` (`recordAttempt`, `findRecordedAttempt`, `resolveAttemptId`, `syncMasteryToVenueStaff`) |
| Client attempt ids | `lib/attempt-id.ts` (+ test) |
| Verify quiz | `lib/verify-quiz.ts` (+ test, server-only), `lib/verify-questions.ts` (server-only key), `lib/verify-quiz-client.ts`, `app/api/training/verify/{start,answer}` |
| Recommendations | `lib/module-navigator.ts` (+ test), `lib/diagnostic-engine.ts` |
| Request bodies | `lib/ai-guard.ts` → `readJsonBody`; `lib/email-template.ts` → `formText` |
| Domain docs | `docs/MASTERY_ENGINE.md`, `docs/DATABASE_SCHEMA.md`, `docs/MANAGER_CONSOLE.md`, `docs/STAFF_APP.md` |
| Migrations / rollbacks | `supabase/migrations/2026093*`, `20261001*`, `20261002*`, `20261003*`; `supabase/rollbacks/` |
