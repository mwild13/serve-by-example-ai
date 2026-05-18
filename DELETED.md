# Deleted Features

## Integrations (deleted May 2026)

**Planned scope:** POS & Payments (Lightspeed, Square, SwiftPOS, Ordermate, Zeller),
Order & Table Management (me&u, Doshii), and Workforce Management (Tanda, Deputy)
were listed across the platform page, pricing page, and manager dashboard as
"coming in V2 / late 2026."

**Decision:** Removed all references pre-launch to avoid setting expectations we are
not yet ready to fulfil. Will be re-introduced as a proper roadmap item when
development begins.

**Locations updated:**
- `app/platform/page.tsx` — Integrations section removed (was lines 332–378)
- `app/pricing/page.tsx` — "Management & POS Integrations" roadmap feature removed
- `components/ui/DashboardMockup.tsx` — "Integrations" removed from ADMIN sidebar mock
- `components/mission-control/ManagerControlCenter.tsx` — Integrations tab, SECTION_META entry, and render block removed
- `app/globals.css` — `.integrations-category-grid`, `.integrations-category`, `.integrations-logo-row`, `.integration-logo-chip` CSS rules removed
- `lib/management/types.ts` — `"integrations"` removed from `ManagerSection` union type

---

## Supabase root-level SQL files (deleted May 2026)

All 9 files were one-time setup scripts manually pasted into the Supabase SQL editor.
They are fully applied to the production DB and no longer needed in the repo.
Supabase CLI is not in use (no `config.toml`) so nothing was tracking them.
`supabase/reset_progress.sql` was kept as a dev utility.

| File | What it created / fixed |
|---|---|
| `training_schema.sql` | `user_training_progress`, `user_level_progress` tables |
| `mastery_schema.sql` | `scenario_mastery`, `mastery_rows`; ELO + spaced repetition columns |
| `management_schema.sql` | `venues`, `venue_staff`, `venue_inventory_items`, `training_programs` |
| `tier_session_schema.sql` | `tier_sessions`, `venue_memberships`; multi-tier + session displacement |
| `scaffolded_learning_schema.sql` | 4-level scaffolded learning + `modules`, `scenarios` tables (L2/L3 content later purged by `20260502_v3_purge_legacy_stages.sql`) |
| `pending_invites_schema.sql` | `pending_invites` table for manager-generated invite links |
| `schema_improvements.sql` | Missing indexes + email/auth debug helpers (`CREATE INDEX IF NOT EXISTS`) |
| `supplemental_fixes.sql` | Trigger permission grants + orphaned record cleanup (run after `fix_user_deletion.sql`) |
| `fix_user_deletion.sql` | Fixed "Database error deleting user" from Supabase Auth dashboard — missing cascade rules |

To recreate any table from scratch, use `git log -- supabase/<filename>` to retrieve the original SQL.

---

## Careers (deleted May 2026)

**Planned scope:** A /careers page for job listings.

**Decision:** The footer Company column linked to `/careers` but no page existed.
Removed the link until a real careers page and active job listings are ready to publish.

**Locations updated:**
- `components/Footer.tsx` — Careers link removed from Company column
