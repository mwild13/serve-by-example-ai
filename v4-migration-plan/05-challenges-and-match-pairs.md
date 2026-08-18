# 05 — Challenges & Match Pairs

## Primary Goal & UI Targets

Primary targets: `ChallengesScreen` (the 5-row lobby), `MatchPairsScreen` (one of the 5 games). "Done" = challenge completion persists through the existing `challenges/save` endpoint and mirrors the existing `localStorage` best-score cache — no XP system invented, no new game-logic backend built (there isn't one in V3 either).

## Diamond Extraction List

**`app/api/training/challenges/save/route.ts`** — auth-gated, `POST { challengeIndex: 0-4 }`, upserts `user_challenges (user_id, challenge_index, completed_at)` with `onConflict: "user_id,challenge_index"`. No score payload — this endpoint only records *that* a challenge was completed, not how well.

**`ChallengesPage.tsx`** (`app/dashboard/_components/`, 281 lines) — the V3 reference implementation. Lobby/quiz/summary dispatcher over 5 sub-components (`SequenceSortGame`, `FillBlankGame`, `MatchPairGame`, `SpotErrorGame`, `MultipleChoiceGame`). On completion (`markComplete(index)`):
1. Writes to `localStorage` key `sbe_challenges_completed` for instant UI cache.
2. Fires `POST /api/training/challenges/save` **non-blocking, fire-and-forget** — `{ challengeIndex }`.
3. Best-score is `localStorage`-only (`sbe-challenges-best-score`) — **never sent to the server.**

`GET /api/training/progress` separately reads `user_challenges` count for the `challengesCompleted`/`totalChallenges: 5` figure shown in `ProgressOverview.tsx` — this is the read path `ProgressScreen` (mobile) should use for its own challenges-completed count, not a separate query.

**No XP system exists anywhere in V3** (grep-confirmed across the whole repo, including all challenges files). If the V4 mock implies XP anywhere on `ChallengesScreen`/`MatchPairsScreen`, that number has no backend to source it from — flag to the user as a scope question rather than assuming a value.

**`MatchPairsScreen.tsx`'s own file comment** already scopes it (Phase B) to "no click handlers, no game logic" — this constraint doesn't lift in Phase C either, because V3's game logic is *itself* entirely client-local (no server-side game-state API exists to extract). Building the tap/match logic is new mobile-side frontend work either way, same effort V3 already paid once; there's nothing to "port" for the interaction mechanics themselves, only for the completion→persistence wiring.

## Architecture & Cleanup Plan

- Wire the mobile `ChallengesScreen`'s "Ingredient Match" row (already the only row with real navigation per the Phase B.5 nav plan, → `/mobile/match-pairs`) so that on `MatchPairsScreen` completion, it fires `POST /api/training/challenges/save` with the correct `challengeIndex`, non-blocking, exactly like `ChallengesPage.tsx` does.
- Mirror the `localStorage` best-score cache pattern (`sbe-challenges-best-score` key or a `mobile`-namespaced equivalent) for instant re-render without a round trip.
- Other 4 rows (Speed Round, Memory Test, Recipe Order, Menu Audit) stay inert per the Phase B.5 nav plan until their own game components are built — this file's wiring only applies once each game screen exists; don't wire a `challengeIndex` to a screen that isn't built yet.
- Do not build a new challenges XP/score-persistence table — the existing binary completion model (`user_challenges`) is what V3 has and what the manager console (`file 09`) already reads from.

## Step-by-Step Task Checklist

1. Confirm `challengeIndex` mapping: verify which of the 5 `user_challenges` indices (0–4) corresponds to "Ingredient Match" / Match Pairs in V3's existing challenge ordering, and use the same index for the mobile version — do not invent a new index scheme that would double-count in the manager console.
2. Build `MatchPairsScreen`'s tap/match interaction (net-new mobile frontend logic — no V3 backend exists for the mechanics themselves).
3. On match-complete, fire `POST /api/training/challenges/save` fire-and-forget, mirror to `localStorage`.
4. Wire `ChallengesScreen`'s completed-state UI (if any) to read from `GET /api/training/progress`'s `challengesCompleted` count, matching `ProgressOverview.tsx`'s pattern.
5. Flag to the user whether any XP number in the V4 mock should be dropped or scoped as new work — do not silently invent a value.
6. Manually verify: complete Match Pairs, confirm `user_challenges` row is upserted, confirm `ProgressScreen`'s challenges-completed count increments, confirm re-completing the same challenge doesn't create a duplicate row (`onConflict` handles this).

## Implementation Notes (Day 5 — 2026-08-18, continued)

Steps 1–5 done. Step 6 still open (same shape as the other files' closing manual-verification gaps).

- **`challengeIndex` mapping confirmed against `ChallengesPage.tsx`'s `markComplete()` call sites** — the 5-game ordering is fixed by V3's existing wizard, not invented: `0` = Sequence Sort ("Recipe Order" on the mobile lobby), `1` = Fill the Blank ("Memory Test"), `2` = Match Pair ("Ingredient Match"), `3` = Spot the Error ("Menu Audit"), `4` = Multiple Choice ("Speed Round"). All 5 mobile lobby rows now carry the correct index so a future build of any of the other 4 games won't need a remap, and so `ChallengesScreen`'s "Completed" badge is already correct for any of them a user has finished on desktop V3.
- **`MatchPairsScreen` built with real tap/match logic** — 6 ingredient↔cocktail pairs (12-card shuffled deck, Fisher-Yates), live move counter, live elapsed-time clock. The Phase B skeleton's static "1:14 Min" / "Moves: 8" were placeholder mock values with nothing behind them; both are now real client-side state, not fabricated numbers reused as "real."
- **On full match:** POST `/api/training/challenges/save` with `{ challengeIndex: 2 }`, fire-and-forget (matches `ChallengesPage.tsx`'s non-blocking pattern exactly, including the `.catch(console.error)` swallow). Mirrors into the **same** `localStorage` keys V3's desktop `ChallengesPage.tsx`/`ProgressOverview.tsx` already use (`sbe_challenges_completed`) rather than a mobile-namespaced key — deliberate: mobile and desktop are the same account on the same device/browser, and `ProgressOverview.tsx` already documents this as "completion is tracked on this device," not per-surface. Added a new device-local key, `sbe-match-pairs-best-moves`, for the fewest-moves personal-best (V3's `MatchPairGame.tsx` doesn't track a per-game best itself — only the aggregate `sbe-challenges-best-score` across the full 5-question wizard — so this is new state with no V3 analogue to collide with).
- **XP scope question resolved, not left open**: the Phase B mock's "+150 XP earned today," the "14h 22m" daily-reset countdown, and each row's "Best: N XP" / star rating all had no backing data — grep-reconfirmed no XP system exists anywhere in V3. Per this file's own step 5 instruction ("flag... do not silently invent"), the call made was to drop them rather than block on a product answer, consistent with the same "don't fabricate a data source that doesn't exist" precedent already applied in files `02` and `04` (`ProgressScreen`'s old XP stat, `ArenaScreen`'s old METRICS row). Replaced with a real completion summary card sourced from `useTrainingProgress()`'s `challengesCompleted`/`totalChallenges` (the same aggregate `GET /api/training/progress` field `ProgressOverview.tsx` reads on desktop), plus a per-row "Completed" badge read from the `sbe_challenges_completed` localStorage set.
- Other 4 lobby rows (Speed Round, Memory Test, Recipe Order, Menu Audit) remain inert (disabled Play button) — unchanged, per the existing Phase B.5 decision that no game screen exists for them yet.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile/_components/MatchPairsScreen.tsx app/mobile/_components/ChallengesScreen.tsx --max-warnings=0`, and a full `npx next build` — all pass with zero errors/warnings. Two mount-only `localStorage` reads and one save-once flag needed `// eslint-disable-next-line react-hooks/set-state-in-effect`, matching the existing suppression already used in `ChallengesPage.tsx` for the identical pattern.
- **Still open:** Step 6 — a live signed-in browser pass: complete Match Pairs, confirm the `user_challenges` upsert lands (index 2), confirm `ProgressScreen`'s challenges-completed count increments, confirm replaying doesn't duplicate the row. Cannot be done from a static code read — same category as files `02` and `04`'s open verification items.
