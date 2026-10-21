# Challenges: One-Stop Reference

Companion to `CLAUDE.md`; where the two conflict, `CLAUDE.md` wins. Covers the Challenges mini-games on both surfaces: the staff desktop (`/dashboard`, nav id `challenges`) and the mobile app (`/mobile/challenges`). Rebuilt on 2026-10-21: ten challenges, kept as data.

## 1. What Challenges is

Ten one-minute, tap-to-answer games on bar, service and safety basics. They are separate from the module quizzes and the mastery engine (`docs/MASTERY_ENGINE.md`): no AI, no Elo. A challenge is right or wrong against its own answer key, and only completion is saved on the server.

## 2. Where the content lives

All ten are in **`lib/challenge-content.ts`** (`CHALLENGE_LIST`). Each has an `index` (the number saved in `user_challenges.challenge_index`), a `slug`, an `area` (bar, service, safety) and one of five kinds:

| Kind | What the person does | Data |
|---|---|---|
| `sequence` | Taps steps into order | `steps` (right order), `shuffled` (shown order) |
| `fill` | Taps a blank, then a word | `parts`, `answers`, `bank` |
| `match` | Picks a left item, then its partner | `pairs`, `rightOrder` |
| `spot` | Taps the one wrong line on a card | `lines`, one with `wrong: true` |
| `choice` | Picks one of three options | `options`, one with `correct: true` |

**An index never changes once shipped**, because completions are saved against it. Add new challenges at the end.

`lib/challenge-content.test.ts` checks every challenge can be answered (one wrong line, one right option, a complete word bank and so on). `lib/no-dashes.test.ts` covers the file.

## 3. How each surface plays them

**Shared game:** `components/challenges/ChallengeGame.tsx` renders any challenge and reports every answer through `onResult({ solved })`. A miss lets the person try again. Styles are the `sd-cg-*` rules in `app/styles/staff.css`, coloured by the `--sd-*` tokens, so the game follows the desktop's light and dark modes. On mobile it sits inside `.sd-on-mobile` (`app/globals.css`), which maps those tokens to the mobile palette.

**Desktop:** `app/dashboard/_components/ChallengesPage.tsx`.
- Today's challenge is on the green card. It's the first one not yet done, starting from a place that moves each day (`pickTodaysChallenge()` in `lib/challenge-content.ts`, shared with mobile's Practise tab).
- Your record sits beside it: how many are done, and your best run.
- All ten appear below as tiles, filtered by area.
- Any one can be played alone. "Play all 10 in a row" scores the run: a challenge counts only if it was right first time. The best run is saved on the device as `sbe-challenges-best-run`.

**Mobile:**
- `app/mobile/_components/ChallengesScreen.tsx` lists all ten, from `CHALLENGE_ROWS` in `app/mobile/_lib/challenge-rows.ts`. The Practise tab shows today's challenge from the same rows.
- Every game screen is an inner screen with a back button to Challenges. The feedback, Try again and finished card are in `challenges/MobileChallengeChrome.tsx`.
- Challenges 0 to 4 keep their original screens: `/mobile/recipe-order`, `/memory-test`, `/match-pairs`, `/menu-audit` and `/speed-round`.
  - Their content is a separate copy.
  - Index 2 on mobile is a memory card game with different pairs.
- Challenges 5 onwards open `/mobile/challenge/<slug>` (`ChallengeScreen.tsx`), which uses the shared game.

## 4. Saving

**Server write:** `POST /api/training/challenges/save` with `{ challengeIndex }`. It validates the index through `isValidChallengeIndex()` in `lib/challenges.ts` and upserts on `(user_id, challenge_index)`. Repeating it is harmless.

**Server read:** `GET /api/training/progress` returns `challengesCompleted` and `totalChallenges` (`TOTAL_CHALLENGES`, now 10).

**Device copy:** both surfaces also write the index to `localStorage["sbe_challenges_completed"]`, which drives the per-challenge "Done" marks. It is per device, not per account.

**Retries:** mobile queues a failed save and retries it (`app/mobile/_lib/retry-queue.ts`). Desktop sends it once and moves on.

**Database:** the `user_challenges.challenge_index` CHECK allows 0 to 9 after `supabase/migrations/20261031_challenges_ten.sql`. Until that migration runs, saves for 5 to 9 fail on the server.
- The device copy still marks them done.
- Mobile keeps retrying the failed saves.

## 5. Adding a challenge

1. Add an entry to the end of `CHALLENGE_LIST` with the next index and a new slug.
2. Bump `TOTAL_CHALLENGES` in `lib/challenges.ts`. The content file throws at load if the two disagree.
3. Write a migration that widens the `challenge_index` CHECK. Hand it to the owner before releasing.
4. Desktop and mobile pick the new challenge up automatically: the desktop page reads the list, and mobile rows for index 5 onwards are generated from it (`app/mobile/_lib/challenge-rows.ts`).
5. Run `npm test`.
