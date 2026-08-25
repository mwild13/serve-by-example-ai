# SBE Dead Code & Efficiency Audit Plan

**Status:** Planning phase — no code changes yet
**Date:** 2026-08-24
**Trigger:** Pre-launch review, prompted by removing the redundant "+ Create New" dropdown in the
Management Console (see `docs/archive/DELETED.md`, "Management Console Header — '+ Create New'
dropdown removed"). That removal turned up a pattern worth applying systematically: UI elements and
code paths that look live but are either fully redundant with a better entry point, or silently
broken and unreachable. This doc scopes a phased pass to find more of both, plus general bloat,
across the whole site before launch.

**Goal:** Faster build, smaller bundle, less code to maintain — without breaking anything. Each
phase below should be executed and verified independently; this is a checklist to work through
incrementally, not a big-bang rewrite.

---

## Baseline

`npx knip` currently reports the codebase is fairly clean at the file/export level — 1 unused
export (`moduleStringToId` in `lib/mastery.ts`), 12 unused exported types, **no unused files**.
That means the highest-value work here is in categories knip can't see: redundant UI paths, CSS
bloat, duplicated business logic, and stale DB references. Re-run `npx knip` after each phase to
catch anything newly orphaned.

---

## Phase A — Known architectural debt (already flagged in `CLAUDE.md`, not yet executed)

These are documented, intentional tech debt — not urgent, but exactly the kind of thing to clear
out before launch rather than after:

- **Duplicated module catalogs**: `ArenaPage.tsx::MODULE_META`, `lib/diagnostic-engine.ts`, and
  `ModuleVerify.tsx` each hardcode their own module list instead of using the canonical
  `lib/module-navigator.ts` / `modules` table. Migrate each to the canonical source.
- **Duplicated scenario content**: `trainer/trainer-data.ts::SCENARIOS` vs.
  `ArenaPage.tsx::ARENA_SEED_SCENARIOS` — two separate seed sets for what should be one.
- **Dual ELO write paths**: canonical `recordAttempt()` (`lib/mastery.ts`) vs. a hand-rolled upsert
  in `app/api/arena/evaluate/route.ts`. Route the Arena write through `recordAttempt()`.
- **`--mcc-*` CSS token block** (`app/globals.css` ~line 13319, 20 tokens) — a parallel palette that
  should migrate onto `--status-*` / `--green` / `--surface`.

**Priority:** Medium — correctness risk is low (these work today), but each one is a second source
of truth that will drift further the longer it's left.

---

## Phase B — Live DB drift (P0 — correctness bug, not just cleanup)

- **`organization_members`**: dropped by migration `20260629_*`, but still referenced in 9 files
  across the membership API routes — this is the confirmed root cause of the duplicate-row bug
  already seen in staff invites. Needs a decision: restore the table, or finish migrating those 9
  call sites to the replacement table. This should be scheduled ahead of the rest of this plan —
  it's an active bug, not dead code.
- **`profiles.plan` vs `profiles.tier`**: PostgREST introspection surfaced a naming mismatch between
  what application code expects and what the live schema/introspection reports. Confirm which
  column is authoritative in production and remove references to the stale one.

**Priority:** P0 — do this phase first, independent of the rest of the plan.

---

## Phase C — CSS bloat

`app/globals.css` is ~19,500 lines. The dropdown removal (Part 1) deleted 8 orphaned rules as a
side effect of a UI cleanup — that pattern (CSS outliving the component that used it) is very
likely repeated many more times across past redesigns (Phase 5 Figma redesign, the terracotta
console theme, the four-zone dashboard restructuring, etc.).

**Approach:** a grep-based pass — for each CSS class name defined in `globals.css`, confirm at
least one `.tsx` file still references it via `className`. Do this in batches by section (marketing
pages, staff dashboard, mission-control) rather than the whole file at once, since a false-positive
deletion is easy to introduce with a huge single-pass sweep. Flag (don't delete) any class used only
via string concatenation/template literals — those won't show up in a plain grep.

**Priority:** Medium — pure bloat, no correctness risk, but the file's size is already a maintenance
cost (harder to scan, slower editor tooling).

---

## Phase D — Bundle / perf

`recharts`, `openai`, and `@fal-ai/client` are imported at module top-level in places that don't
need them on first paint (flagged in a prior mobile-build audit). Candidates for dynamic
`import()` / lazy-loading to cut initial JS, following the existing lazy-load pattern already used
for `CocktailLibrary.tsx` / `KnowledgeBase.tsx`.

**Priority:** Medium-High — directly affects the "faster" half of the user's ask; relatively
mechanical to fix once the import sites are confirmed.

---

## Phase E — Route-by-route sweep (Home / Staff Dashboard / Management Console / DB)

- **Home / marketing pages**: check for orphaned sections/components left behind by past redesigns
  documented in `docs/archive/` (e.g. `Manager-Console-UX-Overhaul-Spec.html`,
  `staff-dashboard-ux-mockups.html`) that may never have been fully removed from the live pages.
- **Staff Dashboard** (`app/dashboard/_components/`): apply the same "does this button have a real,
  non-redundant destination" check used for the Management Console dropdown (Part 1) across
  `DashboardShell.tsx`'s nav items and any secondary CTAs.
- **Management Console** (`components/mission-control/`): continue the Part 1 pattern on the
  remaining header/sidebar actions. Specifically follow up on the gap left by Part 1 — **Add
  inventory** and **Create program** are now keyboard-shortcut-only (`I` / `T`) with no click path
  anywhere in the UI. Decide whether to add a real button (e.g. inside the Inventory / Training
  sections) or keep them as intentional power-user shortcuts.
- **Database**: cross-check every table in `supabase/migrations/` against live query call sites,
  extending the `organization_members` finding (Phase B) — look for any other dropped-but-still-
  referenced tables, or created-but-never-queried ones.
- **Docs**: `docs/` has ~20 files, several clearly historical/superseded once their work landed
  (`Phase5-Mission-Control-Execution-Brief.md`, `STAFF_DASHBOARD_AUDIT_REPORT.md`,
  `staff-dashboard-a11y-audit.md`). Worth a pass to move completed ones into `docs/archive/`, the
  way `DELETED.md` already tracks removed code — keeps the live `docs/` folder scannable.

**Priority:** Medium — mostly organizational/UX cleanup, with the Add inventory/Create program
button gap being the one item with a small user-facing consequence.

---

## Suggested order

1. **Phase B** (DB drift) — active bug, do first, independent of everything else
2. **Phase D** (bundle/perf) — highest leverage for "faster," mechanical once import sites are found
3. **Phase A** (architectural debt) — clears duplicated logic before it drifts further
4. **Phase C** (CSS bloat) — safe cleanup, do in batches
5. **Phase E** (route-by-route sweep) — the long tail; can run alongside the others opportunistically

## Verification (per phase)

- `npx tsc --noEmit` after each batch of changes
- `npx knip` re-run to catch anything newly orphaned
- Manual click-through of the affected route/section in the running app
- For DB changes (Phase B): confirm against live Supabase schema before touching any call sites — do not guess at column/table names from application code alone, since the whole point of Phase B is that they've already drifted apart once
