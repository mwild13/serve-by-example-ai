# 07 — Badges & Achievements

## Primary Goal & UI Targets

Primary target: `BadgesGalleryScreen`, plus the badge-earning surface referenced on `ProgressScreen`. "Done" = badge state is computed client-side from real data via the existing `computeBadges()` function, replacing `BadgesGalleryScreen`'s current hardcoded "14/52" mock counts.

## Diamond Extraction List

**`lib/badges.ts`** (161 lines) — `computeBadges(modules, scores, streak, bestStreak, sbeElite): Badge[]`, a **pure function**, not a background job. Badges are recomputed on every render from current data, never persisted as "unlocked" rows in the DB.

**Definitions:** `CATEGORY_DEFS` — 3 categories (technical/service/compliance) × 4 tiers (starter/skilled/expert/master) = 12 badges. Thresholds: starter = any attempted, skilled ≥50% avg mastery, expert ≥80%, master ≥95%. `STREAK_DEFS` — 3/7/30-day streak badges. Plus 2 specials: **Pro** (`bestStreak >= 25` correct-in-a-row) and **SBE Elite** (`masteredTotal >= Math.max(1, Math.ceil(modules.length * 0.8))`).

**Two distinct "streak" inputs — do not conflate them:**
- `streak`/`bestStreak` (arg #3, used for the 3/7/30-day streak badges) comes from **`localStorage["sbe-streak-count"]`** — a client-only daily-login-streak, computed by `computeStreak()`/`readStreakCount()`, never persisted server-side.
- `bestStreak` (arg #4, used only for the Pro badge threshold) and `sbeElite` (arg #5) come from **server data**: `profiles.best_correct_streak` and `profiles.sbe_elite_number`, read via `/api/training/progress`.

These are two unrelated concepts that happen to share the word "streak" — one is "days you opened the app in a row" (client, localStorage), the other is "consecutive correct answers, best-ever" (server, DB). Mixing them up will produce wrong badge states.

**Callers/reference components:** `BadgeStreakSection.tsx` (reads `localStorage["sbe-streak-count"]` on mount, SSR-safe skeleton-until-resolved pattern, filters `computeBadges()`'s output to `category === "streak"`), `BadgeProgressRing.tsx` (pure presentational SVG ring, props `{earned, total}`, animates `strokeDashoffset` — directly portable as-is to `BadgesGalleryScreen`'s ring and `ProgressScreen`'s skill rings), `BadgesView.tsx` (full gallery: `computeBadges`/`countEarned` + `BadgeProgressRing` + `BadgeStreakSection` + category-grouped `BadgeCard` grid with earned/in-progress/locked states and a `progress.current/required` bar — this is the direct V3 source component `BadgesGalleryScreen` should be wired against).

## Architecture & Cleanup Plan

- Badges are computed, not stored — do not create a `badges`/`user_badges` table. `BadgesGalleryScreen` should call `computeBadges()` client-side with the same 5 arguments V3 passes, sourced from file `02`'s shared mastery read (`modules`, `scores`) plus the two streak inputs above (client `localStorage` for daily streak, server `profiles` fields for Pro/SBE Elite).
- Replace `BadgesGalleryScreen.tsx`'s hardcoded "14/52 earned" mock and its 9 static badge tiles with the real `computeBadges()` output, grouped the same way `BadgesView.tsx` groups them (by category, plus streak and specials).
- Port `BadgeProgressRing.tsx` largely as-is — it's already a pure, dependency-free SVG component; only styling needs to match the mobile dark-mode tokens (`--*-mobile` variables), not the logic.
- 4 category pills on `BadgesGalleryScreen` (currently hardcoded `isActive`) should filter the real `computeBadges()` output by category, using the same `useState` pattern already applied elsewhere in the Phase B.5 nav pass.

## Step-by-Step Task Checklist

1. Wire `BadgesGalleryScreen` to call `computeBadges()` with real inputs: `modules`/`scores` from file `02`'s shared mastery read, `streak`/`bestStreak` from `localStorage["sbe-streak-count"]`, `bestStreak` (Pro badge) and `sbeElite` from `/api/training/progress`'s `profiles` fields.
2. Replace the hardcoded badge-count header ("14/52") with `countEarned(badges)` / `badges.length`.
3. Replace the 9 static badge tiles with the real category-grouped output, matching `BadgesView.tsx`'s earned/in-progress/locked visual states.
4. Port `BadgeProgressRing.tsx` for the ring visualization, restyled to mobile dark-mode tokens.
5. Wire the 4 category pills to filter the real computed badge list.
6. Manually verify: a fresh/low-mastery account shows mostly locked badges; a high-mastery test account shows the correct starter/skilled/expert/master tiers; the daily-streak badges track the local streak count independently from the Pro badge's server-sourced best-streak.

## Implementation Notes (Day 5 — 2026-08-18, continued)

Steps 1–5 done. Step 6 still open — folded into the same combined live-verification pass as files `02`/`04`/`05`/`06`.

- **`BadgesGalleryScreen` now calls the real `computeBadges()`** from `lib/badges.ts`, sourced from `useTrainingProgress()` (`GET /api/training/progress`, the same hook files `02`–`06` already use — no parallel fetch added). `modules: ModuleSummaryForBadges[]` is derived from `data.allModules` + `data.moduleProgress`, matching `BadgesView.tsx`'s exact mapping (`mastered: mastery >= 80`, `attempted: scenariosAttempted > 0`). `scores: CategoryScores` uses `data.mastery` directly (`{bartending, sales, management}`) rather than re-deriving a per-category average client-side like desktop's `catAvg()` does — the API already returns this exact shape (`masteryByModule[...].mastery`), so re-deriving it would just be a redundant, potentially-drifting second calculation of the same number.
- **`sbeEliteNumber` added to `TrainingProgress`'s type** in `use-training-progress.ts` — the field was already returned by `/api/training/progress` (confirmed via read) but missing from the mobile hook's type, so it was silently unavailable to every mobile screen. Added it alongside the existing `bestCorrectStreak` field.
- **Streak inputs kept deliberately separate**, per this file's own warning: `streak` (arg #3, daily-login streak) reads `localStorage["sbe-streak-count"]` only, mount-effect + `null`-skeleton pattern (identical to `BadgeStreakSection.tsx`'s SSR-safe approach, avoiding a hydration mismatch) — nothing server-side feeds it. `bestStreak` (arg #4, Pro badge) and `sbeElite` (arg #5) come from `data.bestCorrectStreak`/`data.sbeEliteNumber`, both server data. No mobile-side streak *increment* logic was added — reading only, matching `BadgeStreakSection.tsx`; the actual daily-streak increment is desktop's `PreShiftHome.tsx`-only concern (shared `localStorage`, same device/account, per the already-established file `05` convention) and out of this file's scope.
- **Header count and static tiles replaced with real data**: the mock's "14/52 earned" had no 52-badge catalog anywhere in V3 — the real total is 17 (12 category + 3 streak + 2 special). Header now reads `countEarned(badges)/badges.length` computed live. The mock's "Your personal best is 28 days" streak-banner line was dropped, not faked — V3 only ever persists the *current* streak count, never a best, so there's no value to source that claim from (same precedent as files `02`/`04`/`05`).
- **Category pills**: the mock's `["All", "Learning", "Challenges", "Streaks"]` didn't correspond to any category `computeBadges()` actually produces. Replaced with the 5 real categories (`technical`/`service`/`compliance`/`streak`/`special`) plus "All" — 6 pills rather than force-fitting the real taxonomy into the plan's illustrative "4," since that would just recreate the same category mismatch this file exists to fix. Each pill shows a live count.
- **`BadgeProgressRing.tsx`'s ring math was not ported as a separate component** — the existing mobile `BadgeRing` tile (Phase B, per-badge SVG progress ring) already uses the identical stroke-dasharray technique and was kept/extended rather than adding a second ring component; a dedicated aggregate ring (matching desktop's header-level `BadgeProgressRing`) was judged redundant next to the numeric "N/Total earned" header already shown.
- **Fixed a routing gap found while wiring this**: `/mobile/badges` had zero inbound `Link`s anywhere in the mobile route tree — reachable only by typing the URL directly, and its own file comment still said "Phase B preview route... no auth/data wiring yet." Added an "Achievements" tile (4th entry) to `HomeScreen`'s existing Quick Access row, the same pattern already used for Challenges/101 Knowledge/Cocktail Library, so the screen is now reachable from the app's primary landing tab. Updated the stale `app/mobile/badges/page.tsx` comment to match.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile/_components/BadgesGalleryScreen.tsx app/mobile/_components/HomeScreen.tsx app/mobile/_lib/use-training-progress.ts --max-warnings=0`, and a full `npx next build` — all pass with zero errors/warnings.
- **Still open:** Step 6 — live signed-in verification of low- vs. high-mastery badge states and the streak/Pro-badge independence. Rides along in the same combined browser pass as files `02`, `04`, `05`, `06`.
