# Challenges — One-Stop Reference

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. This is the single source of truth for the "Challenges" mini-game feature across **all three** surfaces it exists on: the new standalone Mobile build (`app/mobile/`), the desktop staff dashboard (`app/dashboard/_components/`), and the legacy embedded mobile view (`MobileDashboardV3.tsx`). Written so a future session can add new challenge types without re-deriving this from scratch.

**Primary intent of this doc**: you (Mitchell) want to build additional challenges soon. Read §5 ("Adding a New Challenge") before writing any code — the app-layer count is now centralized in `lib/challenges.ts` (2026-09-11), but a hard DB constraint will still silently reject a 6th challenge unless migrated first, and the new game itself still needs building on both surfaces.

## 1. What "Challenges" Is

Five tap-based, no-typing interactive mini-games that quiz staff on hospitality knowledge (cocktail specs, service recovery, recipe sequencing). Distinct from **AI Arena** (GPT-scored written roleplay, see `STAFF_APP.md` §3) and the **40-module quiz/scenario system** (see `docs/MASTERY_ENGINE.md`) — Challenges do not touch OpenAI or the mastery/Elo engine at all. They are simple client-side correctness checks against a hardcoded answer key, with completion (not score) persisted server-side.

There is currently **one fixed set of 5 challenges** (indices 0–4), each a different *game type*:

| Index | Game Type | Desktop file | Mobile file | Mobile display name / route |
|---|---|---|---|---|
| 0 | Sequence Sort | `challenges/SequenceSortGame.tsx` | `_components/SequenceSortScreen.tsx` | **Recipe Order** — `/mobile/recipe-order` |
| 1 | Fill the Blank | `challenges/FillBlankGame.tsx` | `_components/FillBlankScreen.tsx` | **Memory Test** — `/mobile/memory-test` |
| 2 | Match Pair | `challenges/MatchPairGame.tsx` | `_components/MatchPairsScreen.tsx` | **Ingredient Match** — `/mobile/match-pairs` |
| 3 | Spot the Error | `challenges/SpotErrorGame.tsx` | `_components/SpotErrorScreen.tsx` | **Menu Audit** — `/mobile/menu-audit` |
| 4 | Multiple Choice | `challenges/MultipleChoiceGame.tsx` | `_components/MultipleChoiceScreen.tsx` | **Speed Round** — `/mobile/speed-round` |

(Desktop paths are relative to `app/dashboard/_components/`, mobile paths relative to `app/mobile/`.)

**Important naming trap**: the game *type* name (used internally, in the DB comment, and on desktop) and the mobile *marketing* name are different strings for the same index. "Fill the Blank" (desktop label) and "Memory Test" (mobile label) are the same challenge (index 1) with the same hardcoded question. Don't assume a name match across surfaces — always cross-reference by index.

## 2. Content — What Each Challenge Actually Asks

Content is **hardcoded per-component**, one single question per game type (not a question bank/pool). Mobile screens port the desktop content **verbatim** — same question text, same answer key, same explanation copy — just restyled to the dark mobile shell. This is confirmed in code comments (e.g. `SequenceSortScreen.tsx`: "real content ported verbatim from desktop's SequenceSortGame.tsx, not new domain content").

| Index | Question | Correct Answer | Explanation shown |
|---|---|---|---|
| 0 — Sequence Sort | "A Guinness, a Margarita, and a Pinot Grigio arrive simultaneously. What order do you build them?" | Start Guinness → build Margarita → pour wine → top Guinness | Guinness needs a two-stage pour (~90s settle) — start it first, build others while it settles, top it last. |
| 1 — Fill the Blank | Reconstruct the Classic Daiquiri recipe (4 blanks) | `60ml` White Rum, `25ml` lime juice, `15ml` sugar syrup, served in a `chilled coupe` | Always use fresh lime — bottled juice alters acidity balance. |
| 2 — Match Pair | Match cocktail → correct glassware | Margarita→Coupe, Old Fashioned→Rocks, Mojito→Highball | (no explanation banner; feedback is immediate per-pair) |
| 3 — Spot the Error | Tap the wrong ingredient on a Classic Daiquiri recipe card | "25ml **Bottled** Lime Juice" is the error | Bottled juice has preservatives/citric acid that flatten flavour and alter acidity. |
| 4 — Multiple Choice | Guest points out lipstick on their wine glass rim — what do you do? | "I'm so sorry, let me replace that immediately." | Always own the problem and replace immediately — don't deflect or wipe a soiled glass. |

Because content lives inline in each component as literal constants (`SEQUENCE_ITEMS`, `FILL_CORRECT`, `MATCH_CORRECT`, `SPOT_ITEMS`, `MC_OPTIONS`), there is **no CMS, no DB-backed question table, and no admin authoring UI** for Challenges content today. Editing a question means editing the component file directly, in both the desktop and mobile version if it should stay in sync.

## 3. Shared Chrome / Presentational Components

Each surface has its own presentational shell — they are **not shared components**, by design (desktop is light-theme, mobile is dark-theme):

- **Desktop**: `app/dashboard/_components/challenges/ChallengeCard.tsx` exports `ChallengeCard` (card shell with format label + title), `FeedbackBanner` (correct/incorrect banner), `ResetButton` ("Try Again").
- **Mobile**: `app/mobile/_components/challenges/MobileChallengeChrome.tsx` exports `FeedbackBanner`, `TryAgainButton`, `CompletionCard` (with auto-scroll-into-view fix), and `mobileShellStyle` — restyled to `--*-mobile` CSS tokens, explicitly *not* a port of `ChallengeCard.tsx` (see file header comment).
- Each game component (`onComplete?`, `onIncorrect?` props on desktop; a `useMarkChallengeComplete(index, isComplete)` hook on mobile) is otherwise self-contained — its own local `useState` for selection/checked/correct, no shared game engine or state machine.

## 4. Data Flow & Persistence

**Table**: `public.user_challenges` (`supabase/migrations/20260630_user_challenges.sql`, soft-delete columns added in `20260824_reset_progress_soft_delete.sql`).

```sql
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_index INTEGER NOT NULL CHECK (challenge_index >= 0 AND challenge_index <= 4),  -- ⚠️ hard 0–4 cap, see §5
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ NULL,  -- added later; soft-delete marker for "reset progress"
  UNIQUE(user_id, challenge_index)
);
```

RLS: plain own-row pattern (`auth.uid() = user_id`) — see `DATABASE_SCHEMA.md` "Pattern 1".

**Write path** — `POST /api/training/challenges/save` (`app/api/training/challenges/save/route.ts`):
1. `getUserFromRequest(req)` → 401 if no user.
2. Rate limited 20/min, dual user+IP (`lib/rate-limit.ts`).
3. Validates `challengeIndex` via `isValidChallengeIndex()` (`lib/challenges.ts` — see §5, centralized 2026-09-11) — `400` if out of range. Widening the range still requires a DB migration (see §5.1), this just means the app-layer bound now lives in one file instead of being re-typed inline.
4. Upserts on `(user_id, challenge_index)` via `createSupabaseAdminClient()` (bypasses RLS), setting `archived_at: null` — this is what *reactivates* a row a prior "reset progress" soft-deleted, rather than erroring on the unique constraint.
5. It's a **pure completion flag**, not a score — no attempt count, no correctness-percentage, no timestamp history beyond the single `completed_at`. Replaying this endpoint for an already-completed index is a harmless no-op (this is why it's the one endpoint safe to put in the mobile retry queue — see below).

**Read path** — `GET /api/training/progress` (`app/api/training/progress/route.ts`) computes:
```ts
challengesCompleted = challengesCompletedRows?.length ?? 0;  // count of non-archived rows
totalChallenges = TOTAL_CHALLENGES;  // from lib/challenges.ts — see §5
```
This single endpoint backs the "N of 5 completed" summary on **both** the desktop `ProgressOverview.tsx` and mobile `ChallengesScreen.tsx` — same read path, one source of truth.

**Desktop write flow** (`ChallengesPage.tsx`): plain cookie-session `fetch()`, no `Authorization` header — relies on the browser's Supabase session cookie, matching desktop's general auth pattern.

**Mobile write flow** differs meaningfully and is worth understanding on its own — see `MOBILE_BUILD.md` §4 for the full mobile-specific data-layer writeup (session token propagation, the shared `useTrainingProgress()` cache, and the offline retry queue). In short: mobile sends `Authorization: Bearer <token>` (from `useMobileSession()`), and a failed/offline save is queued in `localStorage` (`retry-queue.ts`) and flushed automatically on reconnect — desktop has no equivalent retry mechanism.

**Client-side completion cache**: both desktop and mobile *also* write the completed index into `localStorage["sbe_challenges_completed"]` (a JSON array of indices) as an instant-UI-feedback cache, independent of the server write. This is a deliberately shared, deliberately underscore-cased legacy key name — mobile's own new `retry-queue.ts` explicitly notes it kept the old naming here rather than switching to the house `sbe-` hyphenated convention, specifically so both surfaces read the same device-level completion state. Note this is **device-level, not account-level** — clearing browser storage or switching devices loses the local cache (though the server-side `user_challenges` table still has the real record, surfaced via the progress API on next fetch).

## 5. Adding a New Challenge — Checklist

**Update (2026-09-11): the app-layer "5" is now centralized.** `lib/challenges.ts` exports `TOTAL_CHALLENGES`, `MAX_CHALLENGE_INDEX`, and `isValidChallengeIndex()`, and every previously-independent literal now imports from it: the save-route validation, `totalChallenges` in the progress route, desktop's score/personal-best/"N of 5" display text (`ChallengesPage.tsx`, `ChallengeScoreBoard.tsx`), and mobile's fallback total (`ChallengesScreen.tsx`). `MiniGamesSection.tsx`'s "+2 more" teaser tile is also no longer a hardcoded string — it now computes `CHALLENGES.length - preview.length` and hides itself if that's ever `0`. This closes most of what used to be step-by-step manual hunting; steps 1, 4, and 5 below are still real work for a 6th challenge, but 2 and 3 are now one-line changes in `lib/challenges.ts` instead of a multi-file grep.

To add a 6th challenge type (or beyond):

1. **DB migration** (still separate, not centralized): `ALTER TABLE user_challenges DROP CONSTRAINT <name>, ADD CHECK (challenge_index >= 0 AND challenge_index <= N);` — the current `CHECK (challenge_index >= 0 AND challenge_index <= 4)` will reject any insert above 4 outright (Postgres constraint violation → the API's generic 500 "Failed to save challenge completion", not a helpful error). A JS-layer constant can't reach into Postgres, so this step can't be automated away.
2. **Bump `TOTAL_CHALLENGES`** in `lib/challenges.ts` — this alone now updates the API validation range and every "N of 5" display string listed above.
3. ~~`totalChallenges` constant~~ — covered by step 2.
4. **Desktop wiring**: add the new game component under `app/dashboard/_components/challenges/`, following the existing pattern (`ChallengeGameProps` from `challenge-types.ts`, wrap in `ChallengeCard`, call `onComplete?.()` / `onIncorrect?.()`). Add its label to `STEP_LABELS` in `challenge-types.ts` (keep its length equal to `TOTAL_CHALLENGES`). Wire it into `ChallengesPage.tsx`'s phase/step switch (both the `quiz` render and the `reviewMode` review-all block) and the lobby's game-preview grid.
5. **Mobile wiring**: add the new screen under `app/mobile/_components/`, using `useMarkChallengeComplete(index, isComplete)` and the shared `MobileChallengeChrome.tsx` exports for visual consistency. Add a route folder (`app/mobile/<slug>/page.tsx`) that just renders it, following the existing one-liner page pattern (see any of `recipe-order/page.tsx`, `speed-round/page.tsx`, etc.). Add an entry to the `CHALLENGES` array in `ChallengesScreen.tsx` — this single array is the shared source of truth also consumed by `MiniGamesSection.tsx`'s Learn Hub teaser (the "+N more" count is now derived automatically, per the update note above — no separate edit needed there).
6. **Decide whether content is shared or mobile-only**. The existing 5 are content-identical across desktop/mobile by deliberate choice (ported "verbatim"). If new challenges are mobile-only (plausible, given the desktop dashboard is the older surface — see `MOBILE_BUILD.md`), that's a valid deviation from precedent, but write it down here once decided so a future session doesn't assume drift is a bug.
7. **Legacy embedded mobile** (`MobileDashboardV3.tsx` / `MobileLearnHub.tsx`): renders `ChallengesPage.tsx` (the *desktop* component) directly inside the legacy mobile shell — see §6. A new challenge added to desktop's `ChallengesPage.tsx` automatically appears there for free; nothing extra to do unless the new challenge is mobile-only.

## 6. How Each Surface Actually Renders Challenges

Three surfaces exist; they are **not** the same code path. Full mobile-vs-mobile detail (why there are two mobile systems at all) is in `STAFF_APP.md` §2 and `MOBILE_BUILD.md` §1 — this section is the Challenges-specific slice of that split.

### a) New standalone Mobile build (`app/mobile/`) — primary target for future work
- Entry: `/mobile/challenges` → `ChallengesScreen.tsx` — a lobby/hub screen listing all 5 games as rows (icon, title, marketing description, completion badge, Play/Replay button), reading completion counts from the shared `useTrainingProgress()` context.
- Each game is its **own route** (`/mobile/recipe-order`, `/mobile/memory-test`, etc.) rendering a single screen component — not a wizard/stepper like desktop. No "start all 5 in sequence" flow exists on mobile; each is independently entered and exited (back to `/mobile/challenges` via `CompletionCard`'s "Back to Challenges" link).
- A teaser of the first 3 games (`MiniGamesSection.tsx`) appears on the Learn Hub (`/mobile/learn`) with a "+N more" tile (count derived from `CHALLENGES.length`, not hardcoded) and "See all" link to the full hub.
- This is the build you should extend — see `MOBILE_BUILD.md` for its full architecture.

### b) Desktop dashboard (`app/dashboard/_components/`)
- Entry: `challenges` nav item in `DashboardShell.tsx` → `ChallengesPage.tsx`.
- Presented as a **single wizard**: lobby (preview grid of all 5 + "Start Challenges") → 5-step quiz (one `Stepper.tsx` dot per game, in fixed index order 0→4) → summary (`ChallengeScoreBoard.tsx` showing score out of 5, with a "Review all answers" mode that re-renders all 5 games read-only-ish with `onComplete={() => {}}`).
- Tracks a client-only "personal best" score (`localStorage["sbe-challenges-best-score"]`) — **this is desktop-only**, mobile has no equivalent personal-best/score concept (mobile only tracks per-game completion, not a combined score run). Don't assume feature parity here.
- Always available to every tier (not in `PREMIUM_NAV_ITEMS` — see `STAFF_APP.md` §1).

### c) Legacy embedded mobile (`MobileDashboardV3.tsx` / `MobileLearnHub.tsx`)
- Does **not** have its own Challenges implementation. `DashboardShell.tsx` renders the same desktop `ChallengesPage.tsx` component regardless of which mobile/desktop nav shell is active — the "legacy mobile" distinction only affects the surrounding chrome (bottom nav, header), not the Challenges content itself. So the legacy mobile experience of Challenges is literally the desktop wizard flow, just inside the legacy mobile frame.
- No action needed here when adding new challenges unless the legacy frame's styling needs updating to accommodate a new game — which, per the point above, it inherits automatically.

## 7. Known Gaps / Things to Decide Before Building More

- ~~Hardcoded "5" in multiple places~~ — **resolved 2026-09-11**, see §5's update note and `lib/challenges.ts`. The DB `CHECK` constraint is the one piece that still needs its own migration when the count actually changes; everything else now flows from one constant.
- **No content authoring system** — every question is a literal in a `.tsx` file. If you're planning several new challenges, decide now whether that's still acceptable or whether it's worth moving question content to a small data file / DB table before multiplying the number of hardcoded copies.
- **No question banks / randomization** — each challenge is exactly one fixed question. If "additional challenges" means more *variety within* a game type (e.g. 10 possible Sequence Sort scenarios, randomly picked) rather than more *game types*, that's a different, larger change (needs a content array + random/seeded selection per attempt + a decision on whether repeat completions re-roll).
- **No retry-queue on desktop** — only the mobile build offline-queues a failed save (§4). If desktop is going to keep receiving new challenges, decide whether it also needs this resilience or whether desktop's simpler fire-and-forget is intentional going forward.

## Related Docs

- `MOBILE_BUILD.md` — full architecture of the new standalone Mobile build this feature primarily lives on.
- `STAFF_APP.md` — the broader staff training platform this feature is one nav item within; §2 covers the two-mobile-systems split in general (not Challenges-specific).
- `DATABASE_SCHEMA.md` — full table map and RLS pattern reference.
- `docs/MASTERY_ENGINE.md` — the separate Elo/mastery scoring system Challenges deliberately does **not** write to (unlike Quiz, Scenario Training, and AI Arena).
