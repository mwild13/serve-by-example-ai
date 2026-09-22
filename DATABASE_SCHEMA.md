# Database Schema — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Plain-text Supabase table map: attach this whenever writing a DB query. Not a migration replay — see `supabase/migrations/` for exact DDL, and re-verify against a live migration before trusting a column name for anything security-sensitive.

## 1. Table Inventory

**Created via `CREATE TABLE` in the captured migration history** (`supabase/migrations/*.sql`):

| Table | Migration | Purpose |
|---|---|---|
| `modules` | `20260421_1_create_modules.sql` | The 40 training modules. `id INT` (1–40), `title`, `category` (`technical`/`service`/`compliance`), `subcategory`, `difficulty_level` (1–5), `recommended_prereq_ids INT[]`, `required_role`, `min_elo_for_advanced` (default 1500). |
| `scenarios` | `20260421_2_create_scenarios.sql` (+`2b`/`2c` follow-ups) | Practice content. `module_id` FK → `modules(id)`, `scenario_index`, `scenario_type` (`quiz`/`descriptor_l2`/`descriptor_l3`/`roleplay`), `prompt`, `content JSONB`, `difficulty`, `tags TEXT[]`. `UNIQUE(module_id, scenario_index)`. |
| `diagnostic_questions` | `20260421_2c_create_scenarios_part3.sql` | Onboarding diagnostic bank: `question_text`, `options JSONB`, `target_categories[]`, `is_active`. |
| `module_elo_baseline` | `20260421_3_create_module_elo_baseline.sql` | Per-user ELO seeding from the onboarding diagnostic. `user_id` FK → `auth.users`, `answers JSONB`, `category_scores JSONB` (e.g. `{technical:1350,...}`). `UNIQUE(user_id)`. |
| `organizations` | `20260621_organizations_and_billing.sql` | B2B billing entity. `stripe_customer_id`, `subscription_tier` (default `free`), `seat_limit`, `owner_user_id` FK → `auth.users` (`ON DELETE RESTRICT`). Later extended with `trial_tier`, `trial_started_at`/`trial_ends_at`, `trial_converted` (`20260716_trial_columns.sql`). |
| `organization_members` | `20260621_organizations_and_billing.sql` | Org ↔ user junction. `org_id` FK → `organizations` (cascade), `user_id` FK → `auth.users` (nullable — invited-but-unregistered), `staff_email`, `role` (`owner`/`admin`/`member`), `status` (`invited`/`active`/`removed`). `UNIQUE(org_id, staff_email)`. |
| `billing_events` | `20260621_organizations_and_billing.sql` | Stripe webhook idempotency ledger: `stripe_event_id` unique, `event_type`. |
| `user_challenges` | `20260630_user_challenges.sql` | Tap-based mini-game completion. `user_id` FK, `challenge_index` (0–4), `completed_at` — replaced a prior `localStorage`-only implementation. |
| `venue_staff_certifications` | `20260719_venue_staff_certifications.sql` | Custom staff certs (First Aid, Barista, RSA, etc.). `venue_staff_id` FK → `venue_staff`, `cert_name`, `cert_number`, `expiry_date`. |
| `manager_coach_sessions` | `20260719_manager_coach_sessions.sql` | AI coach chat history per manager, auto-expiring. `manager_user_id`, `venue_id` FK, `role` (`user`/`coach`), `content`. |
| `staff_recognitions` | `20260719_staff_recognitions.sql` | Manager praise messages to staff. `staff_id` FK → `venue_staff`, `from_manager_id`, `message`. |
| `toolkit_leads` | `20260610_toolkit_leads.sql` | SOP toolkit lead capture. `email`, `first_name`, `role`, `utm_campaign`, `toolkit_delivered`. |
| `user_access_allowlist` | `20260716_create_user_access_allowlist.sql` | Access-gating allowlist. |

**Not `CREATE TABLE`'d anywhere in the captured migration history** — these tables predate the migration set (base schema was created outside these files) and only ever appear as `ALTER TABLE IF EXISTS`:

| Table | What we know from `ALTER TABLE` calls |
|---|---|
| `venues` | `enabled_module_ids INT[]`, `force_diagnostic_on_join BOOLEAN` (default true), `venue_code` (rotated in `20260514_rotate_venue_codes.sql`), report-schedule columns (`20260719_venues_report_schedule.sql`). |
| `venue_staff` | `venue_id`, `manager_user_id`, `module_completion_pct REAL`, `module_mastery_pct REAL`, `avg_module_elo INT` (default 1200), `manager_notes` (`20260718_staff_manager_notes.sql`), RSA-state + Australian-state compliance columns (`20260629_compliance_tracking.sql`). |
| `venue_memberships` | Staff-invited-via-venue-code table. Columns seen in use: `manager_id`, `staff_email`, `status` (`invited`/`active`/`removed`), `org_id`-resolution logic lives in application code, not this table (see §2). |
| `profiles` | `id` (== `auth.users.id`, 1:1), `platform_version`, `platform_role`, `diagnostic_completed`, `org_id` FK → `organizations` (`ON DELETE SET NULL`, added `20260621`), badge/streak columns, `trial_grace_modal_shown`, `photo_url` (`20260818_profile_photo_url.sql`). |
| `scenario_mastery` | The canonical mastery/ELO table — see §2. |

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

## 3. `scenario_mastery` — Canonical Mastery/ELO Table

Not a `CREATE TABLE` in the captured history (pre-existing), but it's the single most important table in the schema: **`lib/mastery.ts` is the single source of truth for all reads/writes to it** — never add a second ELO calculation or mastery formula elsewhere. See `docs/MASTERY_ENGINE.md` and `lib/mastery.ts` for the actual scoring logic; this doc only covers the table shape.

**Composite key**: `UNIQUE (user_id, module, scenario_type, scenario_index)` — constraint name `scenario_mastery_user_module_type_index_key`, added by `20260820_scenario_mastery_scenario_type.sql`. Also carries a `module_id` FK → `modules(id)` (added post-hoc in `20260421_4_extend_existing_tables.sql`) and an `is_mastered BOOLEAN` column.

**Why `scenario_type` had to be added** (real incident, worth knowing before touching this table): the key used to be just `(user_id, module, scenario_index)`. Three structurally different write paths share that key space — Quiz (`markModuleMastered()`, always `scenario_index = 0`), Scenario Training (`recordAttempt()`, real content index 0–9/0–19), and AI Arena (`recordAttempt()`, always `scenario_index = 40`). For modules 1–3, Quiz's index-0 row collided with Scenario Training's real index-0 scenario — whichever wrote last stomped the other's `mastery_level`/`elo_rating`/`total_attempts`/`consecutive_correct`. `scenario_type` was added specifically to let all three coexist without corrupting each other.

## 4. The `organizations` / `venue_memberships` Dual-Model Bridge

Two overlapping B2B access models exist, added at different times, and **they are bridged only by a one-off data-migration `INSERT`, not a live foreign key**:

- **Older model**: `venue_memberships` (staff invited via a venue code) → `venue_staff` (per-staff row scoped by `manager_user_id`/`venue_id`).
- **Newer model** (added `20260621_organizations_and_billing.sql`): `organizations` (Stripe-billed entity, `owner_user_id`) → `organization_members` (`org_id` + `user_id`/`staff_email` + `role`/`status`) → `profiles.org_id` (nullable FK, `ON DELETE SET NULL`).

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

**If you're writing a new query that needs to resolve "does this user have access?", this dual-model reality is why a single JOIN won't answer it** — a row can exist in `venue_memberships`/`venue_staff` without ever having been backfilled into `organization_members`, and vice versa for anything created after the backfill ran. Check both paths, or trace the specific read path an existing feature already uses (e.g. `lib/management/service.ts`, `lib/session.ts`) rather than assuming one canonical join.

## 5. RLS Policy Patterns

Three representative patterns, with real SQL from the migrations.

**Pattern 1 — plain own-row `auth.uid()`** (used for `user_challenges`, `scenario_mastery`, `module_elo_baseline`, `profiles`):

```sql
-- 20260630_user_challenges.sql
CREATE POLICY "Users can view their own challenges" ON public.user_challenges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenges" ON public.user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Pattern 2 — organization ownership via a `SECURITY DEFINER` helper** (avoids recursive RLS between `organizations` ↔ `organization_members`):

```sql
-- 20260621_organizations_and_billing.sql
CREATE OR REPLACE FUNCTION get_user_org_id() RETURNS UUID LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;
CREATE POLICY "orgs_owner_all" ON organizations FOR ALL
  USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "orgs_member_read" ON organizations FOR SELECT
  USING (auth.uid() = owner_user_id OR id = get_user_org_id());
```

**Pattern 3 — `venue_staff` manager-scoped subquery join** (used for staff-linked tables — `venue_staff_certifications`, `staff_recognitions`, `manager_coach_sessions`):

```sql
-- 20260719_venue_staff_certifications.sql
CREATE POLICY "manager_access_custom_certs" ON venue_staff_certifications
  USING (venue_staff_id IN (SELECT id FROM venue_staff WHERE manager_user_id = auth.uid()))
  WITH CHECK (venue_staff_id IN (SELECT id FROM venue_staff WHERE manager_user_id = auth.uid()));
```

`staff_recognitions`/`manager_coach_sessions` use the simpler direct-column variant of the same idea (`from_manager_id = auth.uid()` / `manager_user_id = auth.uid()`), since those tables store the manager id directly rather than requiring the `venue_staff` join.

**Historical note — don't assume RLS coverage is comprehensive, verify per table.** `scenario_mastery` had *no* RLS policies at all until a retroactive fix:

```sql
-- 20260628_rls_security_and_indexes.sql
-- Issue: scenario_mastery had no RLS policies, allowing potential data leakage
ALTER TABLE scenario_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own scenario_mastery" ON scenario_mastery ...
```

That same migration added `idx_venue_staff_manager_user_id` specifically because manager-dashboard RLS checks against `venue_staff.manager_user_id` were unindexed (see `docs/MANAGER_CONSOLE.md` §2 for how the manager dashboard actually queries this table — spoiler: it uses the admin client and scopes by application-code filtering, not RLS, for its main read path).

## Known Gaps / Drift

- **`organizations`/`venue_memberships` dual-model bridge is not a live FK** (§4) — the single most important thing to know before writing a cross-model access-check query.
- **`scenario_mastery`'s retroactive RLS fix** (§5) — a reminder that RLS coverage was historically incomplete; verify per table rather than assuming.
- **Five core tables have no `CREATE TABLE` anywhere in this repo's migration history**: `venues`, `venue_staff`, `venue_memberships`, `profiles`, `scenario_mastery`. Their base schema was created outside the captured migration set — treat their columns as "known from `ALTER TABLE` calls," not as a complete list.
- **`scenario_mastery`'s key collision bug** (§3) is fixed as of `20260820_scenario_mastery_scenario_type.sql`, but any code still assuming the old 3-part key `(user_id, module, scenario_index)` would silently corrupt data across write paths — always match the write path (`markModuleMastered` / `recordAttempt`) to the correct `scenario_type`.

## Related Docs

- `docs/SCHEMA_BLUEPRINT.md` — `profiles` table column-layout blueprint (historical, do not duplicate here)
- `docs/Updates/database_blueprint.md` — broader schema blueprint (historical)
- `lib/mastery.ts` + `docs/MASTERY_ENGINE.md` — mastery/ELO scoring logic; this doc only covers the table shape, not the formula
