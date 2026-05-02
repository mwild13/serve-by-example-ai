# Serve By Example — V3 Architecture

> **Status:** Pillar 1–4 complete. SQL migration pending DB execution.
> Update this file as work proceeds. Every architectural decision lives here first, code second.

**Last updated:** 2026-05-03

---

## 1. The V3 Pipeline: Learn → Verify → Perform

V3 collapses the legacy 4-stage learning engine into a single, linear pipeline. Every module follows the same shape, regardless of category (Technical / Service / Compliance).

### Stage A — Learn
The staff member consumes module content (text, video, AI explanation). No scoring. No mastery state changes. This is preparation only.

### Stage B — Verify
The staff member completes a single Rapid-Fire True/False quiz (`RapidFireQuiz`) sourced from the `scenarios` table where `scenario_type = 'quiz'`.

- Pass threshold: defined in `lib/mastery.ts` (initial: ≥ 4 of 5 consecutive correct).
- Pass → module is **Mastered** (binary). Failure → user retries; no partial credit.
- All pass/fail signals flow through `POST /api/training/save`.

### Stage C — Perform (The Arena)
After a module is Mastered, the staff member can enter the **Arena** — an AI-evaluated roleplay scenario tied to the module. The Arena replaces the old Stage 4 roleplay placeholder. Arena attempts do not affect the binary Mastered state but contribute to the staff member's `service_score`, `sales_score`, or `product_score` (depending on module category).

---

## 2. Mastery Model — Binary

> **Mastery is binary per module.** A staff member is either **Mastered** or **Not Mastered** for a given `module_id`. There are no intermediate levels (no `mastery_level` 0/1/2/3).

### Database Representation
- One row per `(user_id, module_id)` in `scenario_mastery`.
- `mastery_level` field is deprecated. The single source of truth is the boolean `is_mastered` (to be added in migration).
- Legacy fields (`consecutive_correct`, `elo_rating`, `last_confidence`, etc.) remain for analytics but no longer drive UI state.
- `scenario_index` is no longer meaningful for Verify-stage saves — quiz pass writes a single mastery row keyed by `(user_id, module_id)`.

### Aggregation for Manager Dashboard
- `venue_staff.scenarios_mastered` = count of `scenario_mastery` rows with `is_mastered = true` for that user.
- `venue_staff.scenarios_attempted` = count of all `scenario_mastery` rows for that user (i.e., modules ever attempted).
- `venue_staff.progress` = `(scenarios_mastered / 20) * 100`, where 20 is the total module count.
- `service_score` / `sales_score` / `product_score` = average Arena performance per category (computed only from Arena attempts, not Verify quiz scores).

---

## 3. Arena API Contract

The Arena is a new endpoint: `POST /api/arena/evaluate`.

### Request
```ts
{
  moduleId: number;        // Required. Determines scenario context and category.
  userId: string;          // Required. Server validates against session.
  serviceScore?: number;   // Optional. Pre-existing baseline if available.
  transcript: string;      // Required. The roleplay conversation to evaluate.
  confidence: "low" | "medium" | "high"; // Required. Self-reported.
}
```

### Required Fields (Authoritative)
| Field          | Type   | Source           | Purpose |
| -------------- | ------ | ---------------- | ------- |
| `moduleId`     | number | Frontend prop    | Scoring rubric selection |
| `userId`       | string | Server-validated | Auth + result attribution |
| `serviceScore` | number | venue_staff      | Baseline for delta tracking |

### Response
```ts
{
  success: true;
  arena: {
    overallScore: number;      // 0-25 from AI evaluator
    categoryScore: number;     // 0-100 mapped to module category
    feedback: string;          // AI-generated coaching text
    deltaServiceScore: number; // Change vs. baseline
  }
}
```

### Side Effects
- Inserts a row in `arena_attempts` (new table, schema TBD in migration).
- Updates `venue_staff.{service_score|sales_score|product_score}` based on module category.
- Does **not** modify `scenario_mastery` — Arena is post-mastery and never affects mastered state.

---

## 4. Component Boundaries

### `ModuleVerify.tsx` (replaces `StageLearning.tsx`)
- **Props:** `{ moduleId: number; userId: string }` only.
- No `ModuleKey` strings. No legacy module name maps.
- Fetches scenarios from DB via `GET /api/training/modules/[moduleId]/scenarios` filtered to `scenario_type = 'quiz'`.
- Renders `RapidFireQuiz` only. No Stage 2/3/4 branches.
- On pass → calls `POST /api/training/save` → flips `is_mastered = true` → triggers `syncMasteryToVenueStaff`.

### `ManagerControlCenter.tsx`
- Replaces per-staff progress table columns with a **Mastery Micro-Grid**: 4 rows × 5 columns = 20 pips per staff member.
- Each pip represents one module (id 1–20), color-coded:
  - Locked (gray) — module not yet unlocked by tier
  - In-Progress (amber) — attempted but not mastered
  - Mastered (green) — `is_mastered = true`
- Hover state shows module title + status.

### `StaffBadges`
- Replaces single "scenarios mastered" count with two category badges:
  - **Technical** — modules 1–7 (Beer, Wine, Cocktails, Coffee, Glassware, Cleaning, Bar Back)
  - **Service** — modules 8–14 (Greeting, Tables, Anticipation, Complaints, Upsell, VIP, Phone)
  - **Compliance** — modules 15–20 (RSA, Food Safety, Conflict, Emergency, Open/Close, Inventory)
- Badge thresholds: documented in `lib/badges.ts` (TBD).

---

## 5. Migration Plan (High-Level)

| Phase | Action | File | Status |
| ----- | ------ | ---- | ------ |
| 1 | Document V3 (this file) | `docs/v3-architecture.md` | Done |
| 2 | SQL purge of legacy scenario_types + orphan cleanup | `supabase/migrations/20260502_v3_purge_legacy_stages.sql` | Written — awaiting DB execution |
| 3 | Add `is_mastered` boolean to `scenario_mastery` | Same migration | Written — awaiting DB execution |
| 4 | Add `markModuleMastered` + V3 constants to mastery engine | `lib/mastery.ts` | Done |
| 5 | Update `syncMasteryToVenueStaff` for binary 20-module aggregation | `lib/mastery.ts` | Done |
| 6 | Add `verifyPassed` branch to training save API | `app/api/training/save/route.ts` | Done |
| 7 | Create `ModuleVerify.tsx` | `components/learning-engine/ModuleVerify.tsx` | Done |
| 8 | Rewrite `RapidFirePage.tsx` to 20-module grid (Path A) | `components/learning-engine/RapidFirePage.tsx` | Done |
| 9 | Swap `DashboardShell` caller to `ModuleVerify` | `components/DashboardShell.tsx` | Done |
| 10 | Build Mastery Micro-Grid (4×5 pips) + category `StaffBadges` | `components/mission-control/manager-ui.tsx` | Done |
| 11 | Wire micro-grid into staff overview + staff table | `components/mission-control/ManagerControlCenter.tsx` | Done |
| 12 | Implement Arena endpoint + UI | `app/api/arena/evaluate/route.ts` + new components | Pending |

### Pending: `mastered_module_ids` column on `venue_staff`

The micro-grid currently fills pips left-to-right by count (`scenariosMastered`, `scenariosAttempted`). For per-module accuracy (showing exactly which modules are mastered), a future migration should add:

```sql
ALTER TABLE public.venue_staff
  ADD COLUMN IF NOT EXISTS mastered_module_ids INTEGER[] DEFAULT '{}';
```

And update `syncMasteryToVenueStaff` to write the actual module ID array. The `MasteryMicroGrid` component in `manager-ui.tsx` accepts an optional `masteredModuleIds` prop — once added to `StaffMember`, it will show exact per-module state rather than the count-based approximation.

---

## 6. Open Questions / Decisions Pending

- Pass threshold for Verify quiz: 4/5 vs 5/5 consecutive correct? (Defaulting to 4/5 for now.)
- Retry cooldown after a failed Verify attempt? (None currently — TBD.)
- Should mastery decay over time? (Out of scope for V3 initial launch — tracked but not surfaced.)
- Arena cooldown / max attempts per day? (TBD.)
