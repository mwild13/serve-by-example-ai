# Mastery & ELO Engine — Source of Truth

This file exists so the mastery/ELO system doesn't keep getting reinvented one page at a time. Read this before adding a field, a formula, or a module list anywhere near training progress.

## Canonical engine

`lib/mastery.ts` is the single source of truth for all mastery and ELO logic — scoring, mastery-level progression, spaced repetition, and the ELO formula itself. If you're changing how staff progress is scored or leveled up, this is the file to extend. Do not add a second ELO or mastery calculation elsewhere; several already exist from before this was written down (see "Known duplication" below), and they should shrink over time, not grow.

Key exports:

- `recordAttempt()` — canonical write path for scenario attempts (updates ELO, mastery level, streaks).
- `markModuleMastered()` — the verify-quiz path (binary pass/fail; does not touch ELO).
- `getMasteryProgress()` — aggregate per-module stats.
- `syncMasteryToVenueStaff()` — the only bridge from staff-side mastery data into manager-facing `venue_staff` rows.

## Canonical field names

Use these names in any new code. Several other names for the same concepts exist in older files — they are not canonical, don't copy them into new code:

| Concept | Canonical name | Not this |
|---|---|---|
| ELO rating | `elo_rating` | ~~`current_elo`~~, ~~`eloRating`~~, ~~`avgElo`~~ |
| Mastery percentage | `mastery` | ~~`mastery_pct`~~, ~~`mastery_status`~~, ~~`masteryStatus`~~ |

`elo_rating` is the actual DB column name (`scenario_mastery.elo_rating`, `venue_staff.elo_rating`) — matching it in application code avoids a translation layer. `mastery` matches `lib/mastery.ts::MasteryProgress` and the canonical API response shape in `app/api/training/progress/route.ts`.

Note: staff no longer see ELO anywhere in the UI (product decision) — but the engine still computes and stores it internally (e.g. it drives which modules get recommended). "Don't show ELO to staff" and "don't use `elo_rating` in new code" are different rules; this document is about the second one.

## Canonical module catalog

The `modules` database table, accessed via `lib/module-navigator.ts`, is the single source of truth for module metadata (id, title, category, difficulty). Do not hardcode a parallel module list in a new component. If a page needs module data, it should fetch through `module-navigator.ts` (or the `/api/training/modules` route it backs), not maintain its own copy.

## Known duplication (not yet cleaned up)

This is documented, not fixed. If you're touching one of these files anyway, prefer migrating it toward the canonical source over leaving it as-is — but this isn't a standalone cleanup task.

- **Module catalog** is currently duplicated in `lib/module-navigator.ts`'s own fallback block, `ArenaPage.tsx::MODULE_META`, `lib/diagnostic-engine.ts`, and `ModuleVerify.tsx`, in addition to the canonical DB table.
- **Scenario content** is duplicated across the DB `scenarios` table, `trainer/trainer-data.ts::SCENARIOS` (Scenarios page), and `ArenaPage.tsx::ARENA_SEED_SCENARIOS` (Live Scenarios page).
- **ELO write paths**: `lib/mastery.ts::recordAttempt()` (canonical) vs. `app/api/arena/evaluate/route.ts`'s own hand-rolled upsert into `scenario_mastery`.

Full detail, line numbers, and a suggested cleanup process live in `staff-dashboard-codebase-audit.md`.
