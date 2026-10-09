# Database Schema — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Plain-text Supabase table map: attach this whenever writing a DB query. Not a migration replay — see `supabase/migrations/` for exact DDL, and re-verify against a live migration before trusting a column name for anything security-sensitive.

## 1. Table Inventory

**Created via `CREATE TABLE` in the captured migration history** (`supabase/migrations/*.sql`):

| Table | Migration | Purpose |
|---|---|---|
| `modules` | `20260421_1_create_modules.sql` | The 40 training modules. `id INT` (1–40), `title`, `category` (`technical`/`service`/`compliance`), `subcategory`, `difficulty_level` (1–5), `recommended_prereq_ids INT[]`, `required_role`. (`min_elo_for_advanced` dropped in `20261003c`.) |
| `scenarios` | `20260421_2_create_scenarios.sql` (+`2b`/`2c` follow-ups) | Live content is the 320 verify-quiz questions (8 per module, `scenario_type = 'quiz'`) **with answers** in `content`, so clients have no access at all (`20261003_lock_scenarios_answer_key.sql`); the quiz is graded from `lib/verify-questions.ts`. Original design: `module_id` FK → `modules(id)`, `scenario_index`, `scenario_type` (`quiz`/`descriptor_l2`/`descriptor_l3`/`roleplay`), `prompt`, `content JSONB`, `difficulty`, `tags TEXT[]`. `UNIQUE(module_id, scenario_index)`. |
| `diagnostic_questions` | `20260421_2c_create_scenarios_part3.sql` | Onboarding diagnostic bank: `question_text`, `options JSONB`, `target_categories[]`, `is_active`. |
| `module_elo_baseline` | `20260421_3_create_module_elo_baseline.sql` | Placement-check result (name predates the Elo retirement). `user_id` FK → `auth.users`, `answers JSONB`, `category_scores JSONB` — percent correct per category since Phase 5 (`{technical:80,...}`); older rows are on the old 1000–1500 scale. Only the category order is used (module recommendations). `UNIQUE(user_id)`. |
| `organizations` | `20260621_organizations_and_billing.sql` | B2B billing entity. `stripe_customer_id`, `subscription_tier` (default `free`), `seat_limit`, `owner_user_id` FK → `auth.users` (`ON DELETE RESTRICT`). Later extended with `trial_tier`, `trial_started_at`/`trial_ends_at`, `trial_converted` (`20260716_trial_columns.sql`). |
| `organization_members` | `20260621_organizations_and_billing.sql` | Org ↔ user junction. `org_id` FK → `organizations` (cascade), `user_id` FK → `auth.users` (nullable — invited-but-unregistered), `staff_email`, `role` (`owner`/`admin`/`member`), `status` (`invited`/`active`/`removed`). `UNIQUE(org_id, staff_email)`. |
| `billing_events` | `20260621_organizations_and_billing.sql` | Stripe webhook idempotency ledger: `stripe_event_id` unique, `event_type`. |
| `user_challenges` | `20260630_user_challenges.sql` | Tap-based mini-game completion. `user_id` FK, `challenge_index` (0–4), `completed_at` — replaced a prior `localStorage`-only implementation. |
| `venue_staff_certifications` | `20260719_venue_staff_certifications.sql` | Custom staff certs (First Aid, Barista, RSA, etc.). `venue_staff_id` FK → `venue_staff`, `cert_name`, `cert_number`, `expiry_date`. |
| `manager_coach_sessions` | `20260719_manager_coach_sessions.sql` | AI coach chat history per manager, auto-expiring. `manager_user_id`, `venue_id` FK, `role` (`user`/`coach`), `content`. |
| `staff_recognitions` | `20260719_staff_recognitions.sql` | Manager praise messages to staff. `staff_id` FK → `venue_staff`, `from_manager_id`, `message`. **Unused since 2026-10-09:** the Recognise dialog and `/api/management/recognitions` were deleted. The table is still in the database and can be dropped once that code is live. |
| `user_access_allowlist` | `20260716_create_user_access_allowlist.sql` | Access-gating allowlist. |
| `training_attempts` | `20261002_atomic_attempts_and_verify_quiz.sql` | Idempotency ledger for Scenario Training / Arena attempts: `id` (client attempt id), `user_id`, scenario key, `score`, `result JSONB`, `evaluation JSONB` (stored feedback for retries). Written only by `record_attempt()`. No client access. |
| `verify_attempts` | `20261002_atomic_attempts_and_verify_quiz.sql` | One row per verify-quiz run: `question_order INT[]`, `position`, `streak`, `status` (`active`/`passed`/`exhausted`), `expires_at` (+20 min). Advanced only by `advance_verify_attempt()`. No client access. |

**Re-created 2026-10-02 (pending apply):**

| Table | Migration | Status |
|---|---|---|
| `toolkit_leads` | `20260610_toolkit_leads.sql`, then `20261004b_toolkit_leads.sql` | SOP-toolkit signups from `/toolkit`. The 2026-06-10 table was dropped as dead by `phase4_drop_dead_tables` (2026-07-19) because nothing wrote to it at the time. `20261004b` brings it back with `delivered_at`, `opened_at`, `unsubscribed_at`. Written by `app/api/toolkit-capture` (upsert on lowercased `email`, before the email is sent), `app/api/toolkit-open` (first `opened_at`), and `app/api/unsubscribe` (`unsubscribed_at`). `toolkit_delivered = false` marks a signup whose delivery email failed. Service role only: RLS with no policies, and `anon`/`authenticated` revoked. Any future nurture send must skip `unsubscribed_at IS NOT NULL`. |

**Not `CREATE TABLE`'d anywhere in the captured migration history** — these tables predate the migration set (base schema was created outside these files) and only ever appear as `ALTER TABLE IF EXISTS`:

| Table | What we know from `ALTER TABLE` calls |
|---|---|
| `venues` | `enabled_module_ids INT[]`, `force_diagnostic_on_join BOOLEAN` (default true), `venue_code` (rotated in `20260514_rotate_venue_codes.sql`), report-schedule columns (`20260719_venues_report_schedule.sql`). |
| `venue_staff` | `venue_id`, `manager_user_id`, `module_completion_pct REAL`, `module_mastery_pct REAL`, `manager_notes` (`20260718_staff_manager_notes.sql`), RSA-state + Australian-state compliance columns (`20260629_compliance_tracking.sql`). |
| `profiles` | `id` (== `auth.users.id`, 1:1), `platform_version`, `platform_role`, `diagnostic_completed`, `org_id` FK → `organizations` (`ON DELETE SET NULL`, added `20260621`), badge/streak columns, `trial_grace_modal_shown`, `profile_photo_url` (`20260818_profile_photo_url.sql`) — points at a `profile-photos` Storage bucket object (`20260923_profile_photos_bucket.sql`), not a static/fal.media URL — plus `profile_photo_generations_today`/`_reset_at` (`20260825_profile_photo_daily_cap.sql`), `sbe_elite_number` (assigned once from `sbe_elite_number_seq` by `award_sbe_elite()`), `all_modules_completed`, `current_session_id` (one-device session enforcement — see `/session-conflict` in `CLAUDE.md`'s App Pages table). **Unused, pending drop** (no code reads or writes them since 2026-10-06; see `To_do_list.md`): `avatar`, `role`, `manager_id`, `notif_achievement_alerts`, `platform_version`, `diagnostic_completed_at`, `is_founders_user`, `all_modules_completed` (still set by `award_sbe_elite()`, never read). Don't build on these. `venue_type` and `experience_level` are written by onboarding and not read yet. For browsing accounts in the dashboard use the `profiles_admin` view (`20261006_profiles_admin_view.sql`): name, email, role, tier, subscription status, created at, id — `security_invoker`, no `anon`/`authenticated` access, not read by app code. |
| `scenario_mastery` | The canonical mastery table — see §3. |
| `pending_invites` | **Dead, pending drop** (see `To_do_list.md`). 0 rows and never recorded an insert; the only writer, an insert in `app/api/management/staff/route.ts`, was removed 2026-10-06 and nothing ever read it. Staff invites run through `organization_members` (`status = 'invited'`). Columns: `manager_user_id`, `venue_id`, `staff_name`, `email`, `invite_link`, `expires_at`, `used_at`. |

**Retired — zero code references, kept here only so it isn't rediscovered and assumed live**:

| Table | Status |
|---|---|
| `venue_memberships` | Not present in the live Supabase project (verified 2026-09-29 via `list_tables` — 21 public tables, this isn't one) and zero references anywhere in `app/`, `lib/`, or `supabase/migrations/`. Prior versions of this doc described it as the "older model" in the dual-model bridge below (§4) — that appears to be fully retired now, not merely legacy-but-present. If you're resolving "does this user have access," `organizations`/`organization_members`/`venue_staff` is the live path; don't go looking for `venue_memberships`. |

**Dropped in audit Phase 5** (`20261003c_drop_elo_columns_and_legacy_tables.sql`): `user_level_progress` (legacy 3-stage tracking) and `_legacy_user_training_progress` (write-only), plus the Elo columns `scenario_mastery.elo_rating`, `venue_staff.elo_rating`, `venue_staff.avg_module_elo`, `modules.min_elo_for_advanced`.

**Not live schema** — two one-off backup tables created during the V3 legacy-stage purge (`20260502_v3_purge_legacy_stages.sql`): `public._v3_backup_scenarios_20260502`, `public._v3_backup_scenario_mastery_20260502`. Never query these; they're a rollback snapshot, not part of the application schema.

## 2. Terminology Reference — Database vs. Domain Language

The database schema is logically correct — no renames needed. This table documents how user-facing terms map to database reality.

| Domain Concept | Database Table | Database Column / Value | Notes |
|----------------|----------------|-------------------------|-------|
| Module | `modules` | `id` (1–40) | Training module identifier |
| Scenario (generic) | `scenarios` | `*` | Any question/exercise in the scenarios table |
| Quiz (L1) | `scenarios` | `scenario_type = 'quiz'` | Rapid-fire true/false; used in rapid-fire mode |
| Descriptor (L2) | `scenarios` | `scenario_type = 'descriptor_l2'` | Pick 2 of 5; used in Stage 4 |
| Descriptor (L3) | `scenarios` | `scenario_type = 'descriptor_l3'` | Pick 3 of 5; used in Stage 4 |
| AI Scenario (Arena) | `scenarios` | `scenario_type = 'roleplay'` | AI-evaluated roleplay; internal code uses `'ai_roleplay'` for clarity |
| Challenge | `user_challenges` | `*` | Tap-based mini-game; entirely separate from the scenarios table |

## 3. `scenario_mastery` — Canonical Mastery Table

Not a `CREATE TABLE` in the captured history (pre-existing), but it's the single most important table in the schema. **It is written only by the `record_attempt()` and `mark_module_mastered()` Postgres functions** (called through `lib/mastery.ts` and `advance_verify_attempt()`) — never add a second mastery formula elsewhere. See `docs/MASTERY_ENGINE.md` and `lib/mastery.ts` for the actual scoring logic; this doc only covers the table shape.

**Composite key**: `UNIQUE (user_id, module, scenario_type, scenario_index)` — constraint name `scenario_mastery_user_module_type_index_key`, added by `20260820_scenario_mastery_scenario_type.sql`. Also carries a `module_id` FK → `modules(id)` (added post-hoc in `20260421_4_extend_existing_tables.sql`) and an `is_mastered BOOLEAN` column.

**Why `scenario_type` had to be added** (real incident, worth knowing before touching this table): the key used to be just `(user_id, module, scenario_index)`. Three structurally different write paths share that key space — Quiz (`markModuleMastered()`, always `scenario_index = 0`), Scenario Training (`recordAttempt()`, real content index 0–9/0–19), and AI Arena (`recordAttempt()`, always `scenario_index = 40`). For modules 1–3, Quiz's index-0 row collided with Scenario Training's real index-0 scenario — whichever wrote last stomped the other's `mastery_level`/`total_attempts`/`consecutive_correct`. `scenario_type` was added specifically to let all three coexist without corrupting each other.

## 4. The `organizations` / `venue_memberships` Dual-Model Bridge (historical — `venue_memberships` now retired)

Two overlapping B2B access models existed, added at different times, bridged only by a one-off data-migration `INSERT`, not a live foreign key. As of 2026-09-29, `venue_memberships` has zero code references and isn't in the live schema (see the Retired table in §1) — this section is kept for history and because the backfill pattern below is still a useful reference for `venue_staff`/`organization_member_id` linking, not because the old model is still live:

- **Older model (retired)**: `venue_memberships` (staff invited via a venue code) → `venue_staff` (per-staff row scoped by `manager_user_id`/`venue_id`).
- **Current model** (added `20260621_organizations_and_billing.sql`): `organizations` (Stripe-billed entity, `owner_user_id`) → `organization_members` (`org_id` + `user_id`/`staff_email` + `role`/`status`) → `profiles.org_id` (nullable FK, `ON DELETE SET NULL`). `venue_staff.organization_member_id` (FK → `organization_members`) is the live link between a roster row and its org membership.

The bridge is a backfill query inside `20260621_organizations_and_billing.sql`:

```sql
-- Migrate active/invited venue_memberships into organization_members.
INSERT INTO organization_members (org_id, user_id, staff_email, role, status, created_at, updated_at)
SELECT p.org_id, ...
FROM venue_memberships vm
JOIN profiles p ON p.id = vm.manager_id
WHERE p.org_id IS NOT NULL
ON CONFLICT (org_id, staff_email) DO NOTHING;
```

**Historical gotcha, now moot**: at the time this ran, a row could exist in `venue_memberships`/`venue_staff` without ever having been backfilled into `organization_members`. Since `venue_memberships` is retired (§1), a new access-check query today only needs the current model — trace the read path an existing feature already uses (e.g. `lib/management/service.ts`, `lib/session.ts`) rather than re-deriving it, since `venue_staff` linkage goes through `organization_member_id`, `manager_user_id`, and `staff_user_id`. Email is matched exactly once, at sign-in, by `linkStaffAccountByEmail()` (`lib/staff-link.ts`, exact lowercase match, fills empty links only); `syncMasteryToVenueStaff()` follows `staff_user_id` only.

## 5. RLS Model — Clients Are Read-Only

Since the audit Phase 2 lockdown (`20260930_rls_lockdown.sql`, applied 2026-10-01), **browsers can read their own rows but cannot write any application table.** Every insert, update and delete goes through an API route on the service-role client (`createSupabaseAdminClient()`), which bypasses RLS — so the API route's own checks (`requireManager()` for management routes, `getUserFromRequest()` + explicit ownership filters elsewhere) are the real authorization. See `docs/MANAGER_CONSOLE.md` §3.

What the lockdown did, on 21 tables (including `profiles`, `scenario_mastery`, `organizations`, `organization_members`, `venues`, `venue_staff`, `training_programs`, `venue_inventory_items`, `staff_recognitions`, `manager_coach_sessions`, `venue_staff_certifications`, `user_challenges`, `pending_invites`):

- dropped every client INSERT/UPDATE/DELETE/ALL policy;
- recreated SELECT-only policies with the same row scoping, `TO authenticated` (none on `pending_invites`);
- revoked INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER and REFERENCES from `anon` and `authenticated`.

The read policies still follow the three historical patterns: own-row `auth.uid() = user_id`; organization ownership via the `SECURITY DEFINER` helper `get_user_org_id()` (avoids recursive RLS between `organizations` ↔ `organization_members`); and manager scoping through `venue_staff.manager_user_id` or a direct `manager_user_id` column.

Tables with **no client access at all**: `pending_invites`, `scenarios` (holds the quiz answer key), `training_attempts`, `verify_attempts`. Postgres functions that write (`record_attempt`, `mark_module_mastered`, `advance_verify_attempt`, `award_sbe_elite`) are `SECURITY DEFINER` with `EXECUTE` granted to `service_role` only.

The seat trigger `check_org_seat_limit()` treats a NULL/0 `seat_limit` as **zero** seats (`20261001_backfill_legacy_org_rows_and_tighten_seat_trigger.sql`); only the service role writes `seat_limit`, `subscription_tier` and `trial_*`.

**Before adding a table:** enable RLS, add SELECT policies only, `REVOKE ALL ... FROM anon, authenticated` and grant back only `SELECT`, and do writes from an API route. Verify with `information_schema.role_table_grants` — RLS coverage was historically incomplete (`scenario_mastery` had no policies until `20260628`), so check per table rather than assuming.

**Testing migrations:** Supabase branching doesn't work for this project (the core tables aren't in the migration history). The audit dry-ran each migration on production inside one `DO` block that applies it, re-runs the checks and then raises an exception so everything rolls back — see `docs/handoff/security/2026-10-02-audit-remediation-handoff.md`.

## Known Gaps / Drift

- **`venue_memberships` is retired** (§1, §4) — no live table, no code references. Don't resurrect it as an assumption when reading older docs, commits, or comments that mention it.
- **`toolkit_leads` is re-created by `20261004b`** (§1). Until that migration is applied, `/api/toolkit-capture` returns 500.
- **Account deletion relies on the FK graph** (`20261004_account_deletion_cascade.sql`). `app/api/profile/delete` calls `auth.admin.deleteUser()` and nothing else: every per-user table cascades from `auth.users`, and a `BEFORE DELETE` trigger on `profiles` marks the user's `organization_members` rows `removed` and unlinks (keeps) their `venue_staff` row. **A new per-user table needs `REFERENCES auth.users(id) ON DELETE CASCADE`**, or deletion will either fail (NO ACTION) or leave the data behind.
- **`pending_invites` and eight `profiles` columns are dead but still present** (§1). The code stopped writing them on 2026-10-06; the drop migration is an open job in `To_do_list.md`. `organization_members.status = 'invited'` is the only invite path.
- **RLS coverage was historically incomplete** (§5) — verify grants and policies per table rather than assuming.
- **`module_elo_baseline` keeps its old name** although it now stores placement-check percentages (§1).
- **Five core tables have no `CREATE TABLE` anywhere in this repo's migration history**: `venues`, `venue_staff`, `profiles`, `scenario_mastery`, and (historically) `venue_memberships`. Their base schema was created outside the captured migration set — treat their columns as "known from `ALTER TABLE` calls," not as a complete list.
- **`scenario_mastery`'s key collision bug** (§3) is fixed as of `20260820_scenario_mastery_scenario_type.sql`, but any code still assuming the old 3-part key `(user_id, module, scenario_index)` would silently corrupt data across write paths — always match the write path (`mark_module_mastered` / `record_attempt`) to the correct `scenario_type`.

## Related Docs

- `docs/SCHEMA_BLUEPRINT.md` — `profiles` table column-layout blueprint (historical, do not duplicate here)
- `docs/Updates/database_blueprint.md` — broader schema blueprint (historical)
- `lib/mastery.ts` + `docs/MASTERY_ENGINE.md` — mastery scoring logic; this doc only covers the table shape, not the formula
