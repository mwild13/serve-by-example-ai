# 03 — Learn Hub Integration

## Primary Goal & UI Targets

Primary target: `LearnHubScreen`. "Done" = the 4 category pills and module grid are backed by the real `modules` table (via `lib/module-navigator.ts`), locked/unlocked state reflects the user's real tier (not per-module hardcoded flags), and mastery badges on each card come from file `02`'s mastery read.

## Diamond Extraction List

**`lib/module-navigator.ts`** (327 lines): `getAvailableModules(userId, userEmail)` — fetches the `modules` table, resolves tier access via `resolveAccess()` (`lib/session.ts`, harvested in `01`), computes per-module `elo_rating`/`mastery`/completion from `scenario_mastery` (use file `02`'s canonical read, don't re-derive here), and recommends the 3 lowest-Elo modules (`sortedByElo.slice(0, 3)`). Has a hardcoded 40-module fallback catalog used only if the live DB query throws — acceptable as a resilience fallback, not a pattern to copy for the primary path.

**Important — no per-module prerequisite logic exists.** `modules.ts`'s `Module` type declares `recommended_prereq_ids?: number[]` but it's never read anywhere in the codebase (confirmed dead field). Locking in V3 is entirely tier-based: `lib/session.ts`'s `TIER_MODULES` gives `free` tier `[]` and every paid tier `ALL_MODULES` (1–40). There is no "Inventory Master requires Compliance & Safety" type rule anywhere to extract.

**`app/api/training/modules/[moduleId]/route.ts`** and **`.../scenarios/route.ts`** — both `getUserFromRequest`-gated, read-only, confirmed to have **zero current callers** in the codebase (orphaned but functional). `[moduleId]/route.ts` returns `{ id, title, description, category, difficulty_level }` with a 20-title hardcoded fallback if the DB lookup fails. `.../scenarios/route.ts` returns scenarios filtered by `?level=1|2|3|4` (maps to `scenario_type`: quiz/descriptor_l2/descriptor_l3/roleplay) and `?difficulty=1-5`.

**`modules` DB table** — `id (1–40 PK)`, `title`, `category` (technical/service/compliance CHECK), `subcategory`, `difficulty_level (1–5)`, `required_role`, `min_elo_for_advanced`.

**`GET /api/training/modules?sort=${sortBy}`** — the route `DynamicModuleNav.tsx` actually calls today for the module list (backed by `getAvailableModules()`). This, not the orphaned per-module route, is the direct precedent for Learn Hub's grid fetch.

## Architecture & Cleanup Plan

- **Locked Decision #3 (from `00`):** `LearnHubScreen`'s per-module "locked" badge (currently hardcoded per card, e.g. "Inventory Master," "Compliance & Safety") becomes cosmetic-only, driven by `access.allowedModules` from `resolveAccess()`. If the user's tier is `free`, every module shows locked; otherwise none do. Do not build per-module rules against `recommended_prereq_ids` — it's dead in V3 and reviving it here would be scope creep beyond what the backend actually models.
- Replace `LearnHubScreen.tsx`'s hardcoded `MODULES` array and 4 `CATEGORIES` pills with a real fetch through `GET /api/training/modules` (mirrors `DynamicModuleNav.tsx`'s call) — this directly satisfies `CLAUDE.md`'s explicit rule: "Never hardcode a parallel module list in a component — fetch through `module-navigator.ts` or `/api/training/modules`." The current mobile mock is exactly the anti-pattern this rule exists to prevent.
- Category pills map to the DB's 3 real `category` values (technical/service/compliance) — confirm the 4th pill in the current mock (if any) doesn't imply a category that doesn't exist in the schema; collapse to the real 3 if so.
- Adopt the orphaned `[moduleId]/scenarios` route as Learn Hub's first real consumer if a module-detail sub-view is built — it's already auth-gated and functional, lower-risk than writing a new endpoint.
- Mastery badges per card: source from file `02`'s `getMasteryProgress()`/`training/progress` read — do not add a second mastery computation local to this screen.

## Step-by-Step Task Checklist

1. Replace hardcoded `MODULES`/`CATEGORIES` in `LearnHubScreen.tsx` with a fetch through `GET /api/training/modules?sort=recommended`.
2. Wire category pills' local `useState` (from the earlier Phase B.5 nav pass) to filter on the real `category` field returned by the API, not a static index.
3. Replace hardcoded per-card `badge: "locked"` flags with a single tier check against `access.allowedModules` (from file `01`'s auth gate).
4. Wire mastery badges to file `02`'s shared mastery read.
5. If a module-detail view is added, wire it through the orphaned `[moduleId]/route.ts` + `.../scenarios/route.ts` rather than a new endpoint.
6. Manually verify: `free`-tier account sees all modules locked; paid-tier account sees all unlocked; category pills filter correctly; mastery badges match `ProgressScreen`'s numbers for the same modules.

## Implementation Notes (Day 6 — 2026-08-19) — module cards now launch a real scenario

Steps 1–4 were already satisfied as a side effect of file `02`'s work (see the Day 5 diary entry) — this closes the remaining gap: tapping a module card did nothing at all. Not step 5 as originally scoped (a module-detail view through the orphaned `[moduleId]/scenarios` route) — a simpler, now-viable option existed instead: `lib/arena-scenarios.ts` covers all 40 modules as of this same day, so a card tap can go straight into a real Arena run rather than a detail screen.

- Unlocked module cards now call `router.push()` into `/mobile/arena?moduleId=…&moduleTitle=…&scenario=…`, same query-param contract `ScenarioTrainingScreen`'s 6-card grid already uses, sourced from the same `lib/arena-scenarios.ts`.
- Locked cards route to `/pricing` instead. There's no "gate modal" component anywhere in this codebase — the one real precedent for a locked/premium item (`DashboardShell.tsx`'s `handleNavClick`) does the exact same direct `/pricing` redirect, not a modal, so this matches existing behavior rather than inventing new UI.
- The card element changed from a plain `<div>` to a `<button type="button">` (with `textAlign: "left"` to preserve the original layout) so the interaction is a real, accessible control — matches the `<button>`-first convention used everywhere else in `app/mobile`.
- The orphaned `[moduleId]/scenarios` route remains unused — still a viable option for a genuine module-detail view (multiple scenarios per module, not just the one Arena run) if that's ever wanted, but out of scope for this fix.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile --max-warnings=0`, full `npx next build` — all pass.
- **Still open**: live verification that tapping a card actually lands on the right scenario and that a locked card correctly redirects to `/pricing`.
