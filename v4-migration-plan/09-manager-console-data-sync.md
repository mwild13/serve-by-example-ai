# 09 — Manager Console Data Sync

## Primary Goal & UI Targets

No mobile screen owns this file directly — it's cross-cutting verification for every mobile action that writes mastery/progress data. "Done" = every V4 write path (scenario attempts, Arena roleplay, verify-quiz passes) provably reaches `venue_staff` the same way V3's dashboard does, so a manager's Mission Control view stays accurate regardless of which app (V3 desktop or V4 mobile) the staff member used.

## Diamond Extraction List

**`syncMasteryToVenueStaff(admin, userId, userEmail)`** — lives in **`lib/mastery.ts`**, not `lib/management/service.ts` (correcting an assumption from the original brief). Finds `venue_staff` row(s) by email (fallback `staff_user_id`), reads the live `modules` table for category/total counts (falls back to hardcoded `V3_MODULE_CATEGORIES`/`V3_TOTAL_MODULES` if empty), aggregates `scenario_mastery` (`scenario_index=0` = quiz-mastered, `scenario_index=40` = Arena-roleplay-passed) into `overallProgress`/`roleplayProgress`, computes the weighted `service_score` (80% quiz + 20% roleplay, per file `02`'s formula) and `product_score` (% of technical-category modules mastered), then writes those onto the matching `venue_staff` row(s).

**Confirmed call sites (3 total):**
1. `app/api/training/save/route.ts` — both branches (verify-quiz pass and scored-attempt).
2. `app/api/arena/evaluate/route.ts` — currently paired with the hand-rolled upsert file `04` is fixing; once that fix lands, `syncMasteryToVenueStaff` still fires the same way, just downstream of `recordAttempt()` instead of the old upsert.
3. `app/api/management/join-venue/route.ts` — on staff linking to a venue.

**Manager-console read path:** `lib/management/service.ts::getManagementSnapshot()` reads `venue_staff` (with legacy-schema fallbacks/notices when columns are missing) and maps rows via `mapStaff()` into the `StaffMember` shape consumed by `components/mission-control/ManagerControlCenter.tsx` and its panels.

**Correction to component names assumed in the original brief:** `StaffRosterPanel.tsx` / `StaffReadinessBoard.tsx` do not exist in this codebase. The actual roster/readiness UI lives in `components/mission-control/StaffDirectoryTable.tsx`, `RoleQualificationCard.tsx`, `SkillGapsSummaryCard.tsx`, and `NeedsAttentionCard.tsx`.

## Architecture & Cleanup Plan

- **The single choke point is calling the existing API routes, not writing new mobile-specific persistence.** Every mobile write for scenario attempts, verify-quiz passes, and Arena roleplay must go through `/api/training/save` or `/api/arena/evaluate` exactly as V3 does — never a new mobile-only write route that bypasses `syncMasteryToVenueStaff`. This is the safest way to guarantee manager-console parity without touching `lib/management/service.ts` or the manager UI at all.
- No new manager-facing code is needed for this migration — Mission Control already reads `venue_staff` correctly; the only risk is a V4 write path that updates `scenario_mastery` without also triggering the sync (which is why file `04`'s fix to the Arena route matters here too — a bypassed `recordAttempt()` call also means a differently-shaped sync).
- If a V4-specific write route is ever proposed for performance reasons, it must still call `syncMasteryToVenueStaff` itself — do not let a "faster mobile path" silently drop manager visibility.

## Step-by-Step Task Checklist

1. Audit every mobile write path built across files `02`, `04`, `05`, `08` — confirm each one is a call to `/api/training/save`, `/api/arena/evaluate`, or `/api/training/challenges/save`, never a new bespoke insert.
2. Spot-check `syncMasteryToVenueStaff`'s 3 call sites still fire correctly once file `04`'s Arena fix lands (the function itself doesn't change — only what calls it before reaching it).
3. Confirm `getManagementSnapshot()` and its 4 real consuming components (`StaffDirectoryTable.tsx`, `RoleQualificationCard.tsx`, `SkillGapsSummaryCard.tsx`, `NeedsAttentionCard.tsx`) need zero changes — this file is a verification pass, not a build task, if step 1 confirms clean reuse.
4. Manually verify end-to-end: complete a scenario on a mobile test account, confirm the corresponding `venue_staff` row updates, confirm it renders correctly in `ManagerControlCenter.tsx` within the same session (no manual refresh trickery needed beyond what V3 already requires).
