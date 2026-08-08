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

---

## Management Console Header Actions (deleted June 2026)

**Context:** Streamlined the management dashboard header and quick action dropdown to reduce cognitive load
and consolidate training-related operations into the dedicated Training section.

**Deleted elements:**

1. **"→ Bulk assign" header action link**
   - Removed from the overview section header action ribbon
   - Was a shortcut to open the "Assign training" drawer
   - Training assignment now consolidated in the Training section workflow

2. **"Bulk assign" button in Role Training Matrix**
   - Removed from the role readiness card header
   - Redundant with main header action; Training section is the single source of truth

3. **"Assign training" option in "+ Create New" dropdown**
   - Training program assignment moved to the dedicated Training section
   - Reduces dropdown clutter; keeps venue-focused quick actions (Add staff, Add inventory)

4. **"Create program" option in "+ Create New" dropdown**
   - Training program creation consolidated in the Training section
   - Keyboard shortcut (T) still accessible for quick navigation to create-program in Training

**Locations updated:**
- `components/mission-control/ManagerControlCenter.tsx` — Removed 2 "Bulk assign" buttons; trimmed QUICK_ACTIONS array
- `components/mission-control/ManagementTopbar.tsx` — Removed 2 dropdown items; "+ Create New" now shows only Add staff and Add inventory
- `components/mission-control/WorkspaceHeader.tsx` — Flattened layout to display title, description, and actions on single row
- `app/globals.css` — Added `white-space: nowrap` to `.ops-health-chip` for compact inline display

**Result:** Cleaner, more focused header ribbon with venue name, date/alert, and core venue operations on one line.

---

## Management Console Dashboard Layout Restructuring (deleted June 2026)

**Context:** Reorganized the management dashboard from a scattered, whitespace-heavy layout into a disciplined four-zone hierarchy that mirrors a venue manager's workflow priorities.

**Deleted components:**

1. **Staff snapshot card** — Showed individual staff member avatars, roles, status pills, mastery grids, and last-active timestamps.
   - Rationale: Duplication of Staff section and "Needs attention" card; excessive complexity for overview level.
   - Location: Was in lower grid section (mcc-lower-grid) at line ~1908.

2. **Manager insights card** — Displayed system-generated notices and recommendations.
   - Rationale: Under-utilized; notices rarely generated; duplicate information found in alert sections.
   - Location: Was in 2-column grid (mcc-overview-grid) at line ~1776.

3. **Team summary card** — Showed total staff count and average completion percentage.
   - Rationale: Redundant with KPI strip and "Needs attention" metrics; single-use stats.
   - Location: Was in 2-column grid (mcc-overview-grid) at line ~1810.

**New four-zone architecture:**

1. **ZONE 1: THE PULSE** — 4 KPI cards + 30-day revenue banner (instant baseline)
2. **ZONE 2: THE SHIFT** — 33/67 split: Upcoming shifts (left) + Tonight's Shift Readiness roster (right)
3. **ZONE 3: THE ACTIONABLES** — 3-column grid: Operational alerts, Needs attention, AI Coaching Queue
4. **ZONE 4: THE DEEP DIVE** — Training chart (full-width) + balanced 3-column: Venue health, Training pillars, Compliance

**Locations updated:**
- `components/mission-control/ManagerControlCenter.tsx` — Restructured lines 1534–2112 into new four-zone hierarchy; removed Staff snapshot, Manager insights, Team summary; removed unused `MasteryMicroGrid` import
- `app/globals.css` — No changes (grid/flex classes remain the same)

**Result:** Dashboard now prioritizes actionable insights with clear hierarchy. Managers see health baseline (Zone 1), operational shift readiness (Zone 2), exceptions requiring immediate action (Zone 3), and trend analytics (Zone 4) in logical visual progression.
