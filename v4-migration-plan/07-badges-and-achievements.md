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
