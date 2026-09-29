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

## Known duplication (partially cleaned up)

If you're touching one of these files anyway, prefer migrating it toward the canonical source over leaving it as-is — but this isn't a standalone cleanup task.

- **ELO write paths — fixed.** `app/api/arena/evaluate/route.ts` no longer hand-rolls its own upsert; it calls the canonical `recordAttempt()` (confirmed in current code, 2026-09-29). `recordAttempt()` is the only write path into `scenario_mastery` from an attempt now.
- **Module catalog** is still duplicated in more places than previously recorded here: `lib/module-navigator.ts`'s own fallback block, `lib/diagnostic-engine.ts`, `ModuleVerify.tsx`, and **three** separate `MODULE_META` constants — `app/dashboard/_components/ArenaPage.tsx`, `app/dashboard/_components/PreShiftHome.tsx`, and `app/dashboard/_components/trainer/trainer-data.ts` — in addition to the canonical `modules` DB table. Each has a different shape (different fields per module), so this isn't a copy-paste that can be collapsed mechanically.
- **Scenario content** is duplicated across the DB `scenarios` table, `trainer/trainer-data.ts::SCENARIOS` (Scenarios page), and `ArenaPage.tsx::ARENA_SEED_SCENARIOS` (Live Scenarios page). Not re-verified this pass — re-check before relying on it.

Full detail, line numbers, and a suggested cleanup process live in `staff-dashboard-codebase-audit.md` (historical — written before the ELO write-path fix above, so treat that specific item as resolved regardless of what it says).
