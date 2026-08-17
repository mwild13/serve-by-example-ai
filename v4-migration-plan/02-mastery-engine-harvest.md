# 02 — Mastery Engine Harvest

## Primary Goal & UI Targets

Primary targets: `ProgressScreen`, `LearnHubScreen` (module cards' mastery state), `HomeScreen` (recommendation surface). This file is also the shared foundation `03`, `04`, and `09` build on — read it before those. "Done" = every mobile screen that shows or affects mastery/Elo data goes through the exact same `lib/mastery.ts` functions V3 uses, with zero new formulas invented.

## Diamond Extraction List

`lib/mastery.ts` is declared the single source of truth for ELO/mastery logic in `CLAUDE.md` — this file only *reads* from it, nothing here re-derives the math.

**Constants (quoted exactly):**
```
SCENARIO_COUNTS = { bartending: 10, sales: 10, management: 20 }
V3_TOTAL_MODULES = 40
MASTERY_THRESHOLD = 3   // consecutive correct for mastery
SPAM_GUARD_MINUTES = 60 // min gap between mastery-advancing attempts
ELO_K = 32               // Elo sensitivity factor
PASS_SCORE = 15          // out of 25 – threshold for "correct"
```

**Formulas (quoted exactly):**
- Expected score: `1 / (1 + Math.pow(10, (scenarioDifficulty - playerRating) / 400))`
- New Elo: `Math.round(current + ELO_K * (actual - expected))`
- Scenario difficulty: `1000 + Math.round((scenarioIndex / Math.max(total - 1, 1)) * 400)` — linear 1000→1400 across a module's scenarios.
- Spaced-repetition interval: `days = Math.pow(Math.max(masteryLevel, 1), 2)` → 1, 4, 9, 16 days for levels 1–4; a failed attempt schedules immediate review.
- Mastery progression: 3 consecutive correct → level 3 (mastered); 2 → level 2 (practiced); 1 → level 1 (seen); any incorrect → `Math.max(level - 1, 0)`, resets streak.
- `isBridge = consecutiveFails >= 2` — signals "serve an easier scenario next."
- Confidence/accuracy persona (`classifyConfidenceAccuracy`): high+correct = "expert," low+correct = "lucky-guesser," low+incorrect = "student," high/medium+incorrect = "liability"/"student."
- `syncMasteryToVenueStaff`'s weighted service score: `Math.round(overallProgress * 0.8 + roleplayProgress * 0.2)` — 80% quiz mastery (`scenario_index=0`) + 20% Arena roleplay (`scenario_index=40`).

**Note — two mastery models coexist in this one file:** (a) a legacy per-scenario Elo/streak model (`recordAttempt`, used for scored scenario attempts) and (b) V3's binary `is_mastered` model (`markModuleMastered`, gated by a 4/5 verify quiz). `syncMasteryToVenueStaff` reads both. V4 needs to know which one each screen is displaying — `ProgressScreen`'s "mastery %" should read the aggregate from `getMasteryProgress()`, not re-derive it from raw attempt rows.

**Exported functions to call directly (do not reimplement):**
| Function | Use in V4 |
|---|---|
| `recordAttempt(admin, input)` | Canonical write after any scored attempt (scenario training — see `03`/`04`) |
| `markModuleMastered(admin, input)` | Canonical write after a verify-quiz pass |
| `getMasteryProgress(admin, userId, module)` | Aggregate read for `ProgressScreen` and module cards |
| `getReviewQueue(admin, userId, module?)` | Spaced-repetition due items — candidate source for `HomeScreen`'s "Today's Hot Picks" (see `00`'s mismatch note) |
| `getScenarioMasteryDetails(admin, userId, module)` | Full per-scenario breakdown, if a detail view is ever needed |
| `syncMasteryToVenueStaff(admin, userId, userEmail)` | Called automatically by the write paths below — mobile code should never call this directly, just make sure its write paths (`training/save`, `arena/evaluate`) are the ones actually used (cross-check `09`) |

**Read/write surface already built and reusable as-is:**
- `POST /api/training/save` — canonical write endpoint. Handles both the verify-quiz-pass branch (`markModuleMastered`) and the scored-attempt branch (`recordAttempt`), plus session-displacement checks and tier gating. Auth required.
- `GET /api/training/progress` — canonical aggregate read. Returns modules, mastery, scores, `skillLevel` (1–10, `masteredModuleCount / totalModuleCount * 10`), category mastery, streaks, review queue, challenges completed, access/tier info — one call composes most of what `ProgressScreen` needs.

## Architecture & Cleanup Plan

- **Canonical field names — hard constraint:** `elo_rating`, `mastery`. Never `current_elo`/`eloRating`/`avgElo`/`mastery_pct`/`mastery_status` anywhere in new V4 code, per `CLAUDE.md`.
- One mastery read path for all mobile screens: build a single mobile-facing hook/fetch wrapper around `GET /api/training/progress` (and `getReviewQueue`/`getMasteryProgress` where a narrower read is cheaper) rather than letting each of `ProgressScreen`, `LearnHubScreen`, and `HomeScreen` independently re-derive mastery state from raw data.
- `ProgressScreen`'s mock "XP" number and 9-skill-ring layout (Locked Decision #4 from `00`) get remapped here: replace with the real `mastery`/`elo_rating` fields, streak counts (`profiles.current_correct_streak`/`best_correct_streak`), and the real 3-category breakdown (bartending/sales/management → technical/service/compliance) that `getMasteryProgress`/`training/progress` already compute. Do not invent a 9-category taxonomy or an XP formula — neither exists in V3.
- All writes go through `recordAttempt()`/`markModuleMastered()` via the existing `/api/training/save` route — never a new hand-rolled upsert (this is exactly the anti-pattern `04` has to clean up in the Arena route; don't introduce a second instance of it for any other mobile screen).

## Step-by-Step Task Checklist

1. Build a single mobile data hook wrapping `GET /api/training/progress` (bearer-token auth from `01`).
2. Wire `ProgressScreen` to real fields: replace mock `STATS`/`SKILLS`/`ACTIVITY_LOG` with `mastery`, `elo_rating`, streaks, and the 3-category breakdown.
3. Wire `LearnHubScreen`'s per-module mastery badges to `getMasteryProgress()`/`training/progress`'s `moduleProgress` map (cross-reference `03` for the rest of Learn Hub's wiring).
4. Wire any scored-attempt UI (see `04`) to `POST /api/training/save` using `recordAttempt`'s expected 0–25 input scale — confirm no screen sends a 0–100 score to this endpoint.
5. Source `HomeScreen`'s recommendation surface from `getReviewQueue()` + `getAvailableModules()`'s lowest-Elo picks (see `00`'s mismatch note — this is light composition, not new domain logic).
6. Manually verify: complete a scenario, confirm `elo_rating` changes by the expected `ELO_K * (actual - expected)` amount, confirm `venue_staff` reflects the update (cross-check `09`).
