# Z — Running Summary, Day 1–3

Rolling log of the V4 migration effort. Add a new `## Day N` section each session rather than editing prior entries — this file is a diary, not a living spec (the 12 numbered files are the spec).

---

## Day 1 — 2026-08-13/14

### Where we started

Picking up from the Phase B skeleton build: all 13 static, presentation-only V4 mobile screens under `app/mobile/_components/` (Home, Learn Hub, Scenario Training, Arena, Challenges, Match Pairs, Cocktail Library, Knowledge Base, Progress, Badges Gallery, Onboarding Diagnostic, AI Profile Photo, BottomNav), each with a preview route at `app/mobile/*/page.tsx`, verified rendering clean (tsc/eslint clean, all routes 200). Dark-mode, Figma-accurate, zero backend wiring by design.

### What we did today

**1. Phase B.5 — Navigation & Flow (planned, not yet executed)**
Reviewed all 13 screens and drafted a full plan to turn the static skeleton into a genuinely clickable prototype: real `<Link>`-based routing for `BottomNav` and per-screen glue (Home → Challenges/Knowledge/Cocktails/Progress, Scenario Training → Arena, Challenges → Match Pairs, back buttons via `router.back()`), plus local `useState` wiring for category pills and single-select groups (Learn Hub, Cocktail Library, Badges Gallery, Onboarding levels, AI Photo styles). Four product-ambiguity questions were resolved with the user (Pre-Shift Warmup stays inert, Skip Assessment → Home, Next Question disabled, all no-detail-screen cards stay inert).
**Status: plan finalized, approval flow was interrupted before execution began — this is queued, not done.** Nothing under `app/mobile/_components/` has been touched by this plan yet.

**2. V4 Migration Plan — "Diamond Extraction" audit + 12-file plan (shipped)**
This was the main event. Goal: before Phase C (wiring Supabase + the mastery engine to V4), produce a detailed, audited migration plan that maps each V4 mobile screen to the specific V3 backend logic it should reuse, rather than guessing during implementation.

- Ran 3 parallel deep-research passes across the existing V3 codebase:
  - **Domain/mastery audit** — `lib/mastery.ts`'s full Elo/streak/spaced-repetition formulas, `lib/badges.ts`, `lib/diagnostic-engine.ts`, `lib/module-navigator.ts`, the DB schema (`modules`, `scenarios`, `scenario_mastery`, `venue_staff`, etc.).
  - **AI/prompt audit** — verbatim system prompts for every OpenAI-backed route (`arena/evaluate`, `evaluate`, `coach`, `management/coach`, `translate`, `demo/evaluate`, `demo/generate-drills`), the shared `gpt-4o-mini` client pattern, rate limits per route.
  - **UI-to-API wiring audit** — auth pattern, `training/save` & `training/progress` contracts, challenges persistence, cocktail/knowledge-base data sourcing, session displacement, manager-console sync chain, and a confirmed absence of any offline/retry infrastructure.
- Surfaced 4 real mismatches between the V4 mocks and V3 reality and got explicit decisions from the user on each:
  1. **AI Profile Photo** — V3 has zero image-gen code anywhere → decided to **build it net-new** (not extraction), with an explicit cost callout.
  2. **Arena chat** — V3's Arena is single-shot, not multi-turn → keep it single-shot, relabel the UI framing.
  3. **Module locking** — V3 only has one global free/paid gate, no per-module rules → keep it cosmetic-only.
  4. **Progress screen** — V3 has no XP concept and only 3 mastery categories, not 9 → remap the UI to real fields instead of inventing a new scoring system.
- Also caught two live pieces of architecture debt worth fixing during the migration, not replicating: Arena's hand-rolled `scenario_mastery` upsert (bypasses the canonical `recordAttempt()`, already flagged in `CLAUDE.md`) and 7x-duplicated OpenAI client boilerplate across every AI route (no shared `lib/openai.ts`).
- Wrote all **12 Markdown files** to `v4-migration-plan/` at the repo root, each following the same Goal → Diamond Extraction List → Architecture & Cleanup → Task Checklist structure:
  `00` audit index · `01` auth · `02` mastery engine · `03` Learn Hub · `04` Scenario Training & Arena · `05` Challenges & Match Pairs · `06` Cocktail Library & Knowledge Base · `07` Badges · `08` Onboarding Diagnostic & AI Photo · `09` Manager Console Sync · `10` Error Handling & Offline Resilience · `11` Final QA & Launch Readiness.

### Net state at end of Day 1

- **Phase B**: done (prior session).
- **Phase B.5 (navigation/flow)**: planned in detail, **not yet implemented**.
- **V4 Migration Plan (12-file Diamond Extraction spec)**: **done and written to disk**, nothing committed to git yet.
- **Phase C (actual backend wiring)**: not started — this is what the 12 files exist to de-risk.

### Open items carried into Day 2+

- Decide whether to execute the Phase B.5 nav/flow plan before or interleaved with Phase C backend wiring (they touch the same files — probably do B.5 first so Phase C lands on top of working navigation).
- Two unresolved content/naming questions flagged in the migration plan, not decisions yet: the Knowledge Base "101" label vs. 31 actual entries (file `06`), and whether `app/api/training/diagnostic/start`/`submit` already cover `lib/diagnostic-engine.ts`'s question flow or need new routes (file `08`).
- Nothing in `v4-migration-plan/` or the Phase B.5 plan has been committed/pushed — still local, uncommitted work.

---

## Day 2 — 2026-08-17

### Where we started

Picked up per file `00`'s "logical start" pointer. Two things asked for: (1) research whether the 12-file plan has gaps worth adopting now, specifically around AI model/cost choices; (2) decide sequencing between Phase B.5 (nav wiring) and Phase C file `01` (auth).

### What we did today

**1. Model-currency research (grounded via web search, not memory) — two plan files patched:**
- **`gpt-image-1` correction in file `08` (time-sensitive, most important finding):** the original draft's image-gen choice (`gpt-image-1`, DALL-E 3 as fallback) is stale. DALL-E 3 was removed from the OpenAI API entirely on May 12, 2026 — dead, not usable as a fallback. `gpt-image-1` itself is scheduled for shutdown October 23, 2026 (~9 weeks from today) — building against it now means an almost-immediate forced migration. `gpt-image-1.5`/`gpt-image-1-mini` also shut down December 1, 2026. **Corrected target: `gpt-image-2`**, the model OpenAI is consolidating onto. File `08` updated with dates and sources; the existing cost-sign-off gate is unchanged (still real, non-trivial per-call cost — get current `gpt-image-2` pricing before building).
- **Text model stays `gpt-4o-mini` — explicitly not a cost-driven upgrade.** Checked current pricing: `gpt-4o-mini` remains ~$0.15/$0.60 per 1M input/output tokens with no published sunset date. `gpt-5-mini` exists but is *more* expensive on output (~$2/1M) for these simple scoring/eval tasks — no case to migrate for cost. File `04` updated to state this explicitly so it doesn't get re-litigated later.
- **Structured Outputs called out as the actual reliability upgrade worth adopting** in file `04` — `response_format: { type: "json_schema", strict: true }` (supported by installed `openai` SDK ^6.29.0) is stronger than the previously-noted `json_object` mode and directly closes the "prompt-only JSON compliance" gap already flagged against all 7 AI routes.

**2. Sequencing decision — Phase B.5 first (user confirmed).** Matches the plan's own standing recommendation (same files, B.5 should land before Phase C touches them).

**3. Phase B.5 — nav/flow wiring executed in full** (no written B.5 spec existed on disk; reconstructed from the approved plan recap and executed directly against all 13 screens under `app/mobile/_components/`):
- `BottomNav.tsx` — tabs converted from inert buttons to real `next/link` routing (`home`→`/mobile/home`, `learn`→`/mobile/learn`, `scenarios`→`/mobile/scenarios`, `me`→`/mobile/progress`).
- `HomeScreen.tsx` — Quick Access tiles linked (Challenges/101 Knowledge/Cocktail Library → their screens), avatar/username header → Progress, Continue Learning card → Learn Hub. Pre-Shift Warmup and Today's Hot Picks cards stay inert (no detail screens exist).
- `ScenarioTrainingScreen.tsx` — "Start Simulation" → Arena. The 6 category cards stay inert (matches file `04`'s existing note).
- `ChallengesScreen.tsx` — "Ingredient Match" play button → Match Pairs (the one challenge with a real game screen); the other 4 play buttons render disabled/inert.
- `MatchPairsScreen.tsx` — fixed a pre-existing `BottomNav active="learn"` mismatch to `active="home"` (Match Pairs is reached via Challenges, off the Home tab, not Learn).
- `LearnHubScreen.tsx`, `CocktailLibraryScreen.tsx`, `BadgesGalleryScreen.tsx` — category/filter pills converted from static-first-item to local `useState` selection.
- `KnowledgeBaseScreen.tsx` — back button wired to `router.back()` (category pills were already stateful from Phase B).
- `OnboardingDiagnosticScreen.tsx` — level cards converted to a real local-state picker (was a hardcoded `selected: true` on "Intermediate"); "Skip Assessment" → Home; "Next Question" rendered disabled (per the earlier-locked product decisions — not re-litigated).
- `AiProfilePhotoScreen.tsx` — style chips converted to local-state picker; back button → `router.back()`; "Skip for now" and "Save Portrait" both → Home (Save Portrait's real generate/persist step is the Phase C `08` work); "Retake Selfie" stays inert (no camera flow exists).
- Verified clean: `npx tsc --noEmit` and `npx eslint app/mobile --max-warnings=0` both pass with zero errors/warnings after all edits.

### Net state at end of Day 2

- **Phase B**: done.
- **Phase B.5 (navigation/flow)**: **done** — all 13 screens now click through real routes/back-buttons/local state, still zero backend wiring (by design).
- **V4 Migration Plan (12-file spec)**: two files (`04`, `08`) patched with dated, sourced model-currency corrections; rest unchanged.
- **Phase C (backend wiring)**: not started. Nav layer is now real, so Phase C can land directly on working screens per the original sequencing rationale.
- Nothing committed/pushed yet — still local, per project convention (commit/push only on explicit request).

### Open items carried into Day 3

- Phase C execution itself hasn't started — next session should pick up file `01` (auth, cross-cutting) per the original reading order in `00`.
- Two still-unresolved content/naming questions from Day 1 remain open: Knowledge Base "101" label vs. 31 real entries (file `06`), and confirming whether `app/api/training/diagnostic/start`/`submit` already implement `diagnostic-engine.ts`'s real flow before file `08`'s diagnostic half is built.
- `gpt-image-2` pricing should be re-confirmed at build time (file `08`) — image-model pricing has shifted with each OpenAI generation this year; treat the number in `08` as directional, not final, until checked again right before writing the route.

## Day 3 — 2026-08-17 (cont.)

### Where we started

Phase B.5 done and verified. User confirmed: keep flagging real gaps proactively (model currency, process, anything that makes later phases easier), and start Phase C wherever made sense next — that's file `01` (auth), per Day 2's own carried-forward recommendation.

### What we did today

**Phase C file `01` — Supabase client & auth — executed:**

- Read `app/dashboard/page.tsx`'s real auth+tier-resolution sequence (not just the plan's summary of it) and `middleware.ts` in full before writing anything, to catch behavior the plan file couldn't have known about from a static read.
- **Factored `resolveTierAccess()` into `lib/session.ts`** — the exact dashboard tier chain (own tier → lapsed-subscription downgrade → org trial sync → sponsored-membership fallback with paused-sponsor detection), extracted so `/dashboard` and `/mobile` share one implementation. `app/dashboard/page.tsx` refactored to call it — behavior-preserving, verified via `tsc`/`eslint`, not a rewrite.
- **Built `app/mobile/layout.tsx`** — server-side gate mirroring dashboard's auth + onboarding + tier resolution via the new shared helper.
- **Built `app/mobile/_lib/mobile-session-context.tsx`** — a `MobileSessionProvider`/`useMobileSession()` context, seeded once by the layout. Chose this over prop-drilling because V4's mobile surface is 12 independent routes, not one shell component like `DashboardShell` — there's no single place to receive an `initialToken` prop the way the desktop dashboard has. This is a new pattern for the codebase (V3 has zero React Context usage anywhere) — called out explicitly in file `01`'s Implementation Notes rather than left implicit, since files `02`–`10` need to know to consume state through this hook rather than re-inventing it.
- **Found and closed a real security gap, not a hypothetical one:** `middleware.ts`'s session-displacement check (the actual "one device per purchase" enforcement — redirects to `/session-conflict` on a stamp mismatch) only ever covered `/dashboard` and `/management/dashboard`. `/mobile` had zero coverage — a displaced session could browse every mobile screen unchecked, bypassing the exact security control `/dashboard` already enforces. Added `/mobile` to both the auth-redirect gate and the displacement-check gate in `middleware.ts`. This gap pre-dates V4 — it just had no surface to expose it until `/mobile` needed the same protection.
- **Corrected the plan's own assumption about item 4** (session stamping): there is no separate "mobile login" — `POST /api/session/stamp` already fires globally at sign-in (`app/login/page.tsx`, `app/auth/page.tsx`), so a user reaching `/mobile/*` is already stamped. Documented this in file `01` so the checklist item isn't mistakenly treated as still-open next session.
- Verified clean: `npx tsc --noEmit` and `npx eslint app/mobile app/dashboard/page.tsx lib/session.ts middleware.ts --max-warnings=0` both pass with zero errors/warnings.
- Patched `v4-migration-plan/01-supabase-client-and-auth.md` with an "Implementation Notes" section recording all of the above against the original checklist, same pattern used for files `04`/`08` on Day 2 (append corrections, don't silently rewrite the spec).

### Net state at end of Day 3 (so far)

- **Phase C file `01` (auth)**: code complete — `resolveTierAccess()`, `app/mobile/layout.tsx`, `app/mobile/_lib/mobile-session-context.tsx`, `middleware.ts` `/mobile` coverage. **Not yet manually verified in a browser** (checklist item 6 — sign in, load `/mobile/home`, confirm no redirect loop) — this is the one open item before calling file `01` fully closed.
- Files `02`–`10` (mastery engine, Learn Hub, Arena, Challenges, cocktail/KB, badges, onboarding/AI photo, manager sync, error handling) — not started. They can now build on a working `/mobile` auth gate and `useMobileSession()` instead of each having to solve auth access themselves.
- Nothing committed/pushed yet — still local, per project convention.

### Open items carried into Day 3 (cont.) / Day 4

- Manually verify the `/mobile` auth gate in a real signed-in browser session before treating file `01` as fully closed (item 6 above).
- File `02` (mastery engine harvest) is the natural next file — it's what every subsequent screen (Learn Hub, Arena, Challenges, Badges, Progress) needs for real reads/writes, and `01`'s context now gives it a token/tier to work with.
- Still-unresolved from Day 1/2: Knowledge Base "101" label vs. 31 real entries (file `06`); confirming `app/api/training/diagnostic/start`/`submit` against `diagnostic-engine.ts`'s real flow (file `08`); `gpt-image-2` pricing re-confirmation at build time (file `08`); AI Profile Photo cost/budget sign-off still needs explicit user approval before any code is written.
- Pre-existing, lower-priority inconsistency noticed but not touched (out of scope for `01`): the sponsored-membership email lookup uses `.eq(staff_email, email.toLowerCase())` in `resolveTierAccess()` (preserved from `app/dashboard/page.tsx`'s original behavior) vs. `.ilike(staff_email, email)` in the older `resolveAccess()` — two slightly different case-handling strategies for the same lookup. Worth unifying whenever `resolveAccess()` itself is next touched, not urgent.

## Day 4 — 2026-08-18

### Where we started

User signed into the deployed `/mobile` build in a real browser (screenshots confirmed: Home screen renders correctly, navigation works, no redirect loop) — closing file `01`'s last open item. Also flagged a real bug from that session: a "Book a free 15-min call" floating button/modal was appearing on mobile screens.

### What we did today

**1. Fixed `FloatingBookCallButton.tsx` leaking onto `/mobile`.** `APP_ROUTE_PREFIXES` (the list of authenticated-app routes where the marketing-site floating CTA hides itself) only had `/dashboard` and `/management` — never updated when `/mobile` was added. One-line fix: added `/mobile` to the array. Unrelated to the V4 migration plan itself, just a global-layout bug the new route tree exposed. Verified clean via `tsc`/`eslint`. Uncommitted.

**2. File `01` (auth) formally closed** — the deployment check requested on Day 3 confirmed the `/mobile` auth gate works end-to-end in a real signed-in session. No further action needed on file `01`.

**3. Phase C file `02` — Mastery Engine Harvest — executed (steps 1, 2, 3, 5 of 6):**
- Built `app/mobile/_lib/use-training-progress.ts` — the single mobile data hook wrapping `GET /api/training/progress`, authenticated via the bearer token from `useMobileSession()`. All three target screens read through it; no independent re-derivation.
- Rewired `ProgressScreen.tsx`: real `masteredModuleCount/totalModuleCount`, `bestCorrectStreak`, `skillLevel` stats (mock "Total XP" removed — no XP field exists in V3); 3-ring mastery breakdown (bartending/sales/management) replacing the mock 9-ring grid; the fabricated "Recent Activity Log" replaced with "Up Next For Review" sourced from the real spaced-repetition `reviewQueue` (a deliberate upcoming-vs-past substitution, documented inline since nothing analogous to a past-activity feed exists in the API).
- Rewired `LearnHubScreen.tsx`: real 40-module catalog + `moduleProgress` map replacing the 6 mock cards; category pills now filter on real `modules.category` (Technical/Service/Compliance) instead of placeholder categories; "mastered"/"locked" badges driven by real thresholds, module locking kept cosmetic-only per the already-locked product decision.
- Rewired `HomeScreen.tsx`: streak badge now shows real `bestCorrectStreak` (relabeled off "Days" — the field counts consecutive correct answers, not daily logins, so the old unit would have misrepresented it); Continue Learning card now recommends a real module via lowest-Elo-first composition over already-fetched progress data (mirrors `getAvailableModules()`'s logic without a second network call, since that function is server/admin-only).
- **Step 4 (wiring scored-attempt writes to `POST /api/training/save`) confirmed genuinely out of scope for this file** — checked `ArenaScreen.tsx`/`ScenarioTrainingScreen.tsx` directly; neither has any submit logic yet. Nothing to wire until file `04` builds the real scoring UI.
- Verified clean: `npx tsc --noEmit` and `npx eslint app/mobile --max-warnings=0`, zero errors/warnings.
- Patched `v4-migration-plan/02-mastery-engine-harvest.md` with an Implementation Notes section, same append-only pattern as files `01`/`04`/`08`.

### Net state at end of Day 4

- **Phase C file `01` (auth)**: fully closed — code complete and manually verified.
- **Phase C file `02` (mastery engine)**: steps 1/2/3/5 done and lint/type clean. Step 4 confirmed as file `04`'s scope, not skipped. **Step 6 (manual verification — complete a real scenario, confirm `elo_rating`/`venue_staff` update correctly) is still open** — same shape as file `01`'s closing gap, needs a live browser pass.
- Global-layout bug fixed (`FloatingBookCallButton.tsx` `/mobile` exclusion).
- Nothing committed/pushed yet — still local, per project convention.

### Open items carried into Day 5

- Manually verify file `02` step 6 in a real signed-in session (complete a scenario attempt, confirm the Elo delta and `venue_staff` sync).
- File `03` (Learn Hub integration — the rest of it, beyond the mastery badges just wired) or file `04` (Scenario Training & AI Arena — where step 4's deferred write-wiring actually belongs) is the natural next file.
- Still-unresolved from Day 1/2/3: Knowledge Base "101" label vs. 31 real entries (file `06`); confirming `training/diagnostic/start`/`submit` against `diagnostic-engine.ts` (file `08`); `gpt-image-2` pricing re-confirmation at build time (file `08`); AI Profile Photo cost sign-off still needed before any code is written.

## Day 5 — 2026-08-18

User asked what could be picked up immediately without further product decisions or a live browser. Re-read file `03` against the Day 4 work and found it was already almost entirely satisfied as a side effect of file `02` (real module fetch, real category pills, real locked/mastery badges) — nothing new to do there beyond its optional step 5 (module-detail view) and its step 6 manual check. File `04`'s steps 1–5 were fully spec'd with no open product decisions, so that's what got built.

**File `04` (Scenario Training & AI Arena) — steps 1–5 done, step 6 open:**

- `lib/openai.ts` created — single shared `getOpenAIClient()` factory, replacing the identical local helper duplicated across 7 AI routes (`arena/evaluate`, `evaluate`, `coach`, `management/coach`, `translate`, `demo/evaluate`, `demo/generate-drills`). No behavior change, pure de-duplication.
- `app/api/arena/evaluate/route.ts`'s hand-rolled `scenario_mastery.upsert()` replaced with a call to the canonical `recordAttempt()`, closing the known-duplication item flagged in `CLAUDE.md`. Score normalized `score / 4` (0–100 → 0–25) before the call. Arena has no confidence-capture UI, so `confidence: "medium"` is passed as a neutral default — flagged inline for whoever eventually adds a real confidence prompt to Arena.
- `ArenaScreen.tsx` rewired end-to-end: composer/Send button now hit the real endpoint, an in-flight "Evaluating…" state shows, the real `{score, passed, what_you_did_well, room_for_improvement}` result renders in place of nothing, 429s surface a distinct rate-limit message. The old fake `METRICS` row (Empathy/Knowledge/Resolution — no backing data) was removed rather than kept, consistent with file `02`'s "don't fabricate a data source" precedent.
- `ScenarioTrainingScreen.tsx`'s "Start Simulation" now carries a real scenario payload (moduleId 11 "Handling Guest Complaints", matched to the existing "Wine Cork Complaint" copy) into Arena via query params, rather than linking to a bare route with nothing behind it. A full scenario browser (multiple selectable scenarios from the DB) is still not built — that's the bigger deferred piece tied to file `03` step 5's orphaned `[moduleId]/scenarios` route, not done here.
- Added a `Suspense` boundary around `ArenaScreen` in `app/mobile/arena/page.tsx` (required by Next.js for `useSearchParams()`).
- Verified: `npx tsc --noEmit`, `npx eslint app/mobile app/api/arena/evaluate/route.ts lib/openai.ts --max-warnings=0`, and a full `npx next build` all pass clean.

### Open items carried into Day 6

- Manually verify file `02` step 6 AND file `04` step 6 together in one live signed-in pass: submit a real Arena response, confirm the score renders, confirm `elo_rating`/`mastery` move via `recordAttempt()` in Supabase, confirm `venue_staff` sync, confirm the 20/min rate limit trips under repeated calls.
- File `03`'s only remaining open piece: an optional module-detail view wired through the orphaned `[moduleId]/scenarios` route — not required for V4 launch, worth a product call on whether it's in scope.
- Next candidate files: `05` (Challenges & Match Pairs) or `06` (Cocktail Library & 101 Knowledge) look similarly self-contained and decision-free — good next picks for another "what's easy right now" pass.
- Still-unresolved from Day 1–3: Knowledge Base "101" label vs. 31 real entries (file `06`); confirming `training/diagnostic/start`/`submit` against `diagnostic-engine.ts` (file `08`); `gpt-image-2` pricing re-confirmation at build time (file `08`); AI Profile Photo cost sign-off still needed before any code is written.

## Day 5 — 2026-08-18 (continued: file 05)

User confirmed files `02`/`04` step 6 manual verification can wait for a later live pass — instructed to keep trickling: "continue on next step." Picked file `05` (Challenges & Match Pairs), the next candidate flagged above — no open product decisions, no live-browser dependency, matching the same selection criteria used for file `04`.

- **Confirmed `challengeIndex` mapping** by reading `ChallengesPage.tsx`'s `markComplete()` call order directly, rather than guessing: `0`=Sequence Sort, `1`=Fill the Blank, `2`=Match Pair, `3`=Spot the Error, `4`=Multiple Choice. Applied this mapping to all 5 mobile lobby rows on `ChallengesScreen` (not just the built one), so the "Completed" badge is already correct for any challenge a user finished on desktop V3, and no remap is needed when the other 4 games eventually get built.
- **Built real game logic for `MatchPairsScreen`** — 6-pair ingredient/cocktail matching, shuffled 12-card deck, live move counter, live elapsed timer, replacing the Phase B skeleton's static hardcoded "1:14 Min" / "Moves: 8". On full match: fire-and-forget `POST /api/training/challenges/save { challengeIndex: 2 }` (mirrors `ChallengesPage.tsx`'s exact pattern) plus a `localStorage` write to the **same** `sbe_challenges_completed` key V3 desktop already uses (deliberate — same account, same device, V3's own `ProgressOverview.tsx` already treats completion as device-level, not per-surface) and a new mobile-only `sbe-match-pairs-best-moves` personal-best key (no V3 analogue to collide with).
- **Resolved the file's own flagged scope question rather than leaving it open**: dropped the Phase B mock's fabricated XP figures ("+150 XP earned today," "14h 22m" countdown, per-row "Best: N XP" / stars) — grep-reconfirmed no XP system exists in V3 anywhere. Replaced with a real completion-count card sourced from `useTrainingProgress()`'s `challengesCompleted`/`totalChallenges` (same field `ProgressOverview.tsx` reads on desktop). Same "don't fabricate a data source that doesn't exist" call already applied to files `02` and `04`.
- Verified clean: `tsc --noEmit`, targeted `eslint --max-warnings=0`, full `next build` — all pass. Plan file `05` updated with its own Implementation Notes section.
- **Still open:** step 6 (live signed-in verification: `user_challenges` upsert, `ProgressScreen` count increment, no duplicate on replay) — same category as files `02`/`04`'s open items, batchable into the same future live-browser pass.

## Day 5 — 2026-08-18 (continued: file 06, and a merge-safety check)

User asked for a merge-perspective sanity check before continuing, then to proceed to file `06`.

- **Merge check**: branch is only 2 commits ahead of its merge-base with `origin/main`; `origin/main`'s one new commit (`55ab440`) is a no-op merge with zero file overlap against anything touched this session. No conflict markers anywhere in the tree (grep hits were false positives — comment separators in `lib/cocktails.ts`). `preview/v4-migration` is in sync with its own remote. Flagged (not touched): `.vscode/settings.json` and untracked `.clineignore` are unrelated Roo/Cline editor config, not V4 work — should stay out of any future commit on this branch.
- **File `06` (Cocktail Library & 101 Knowledge)** — the lowest-risk file in the plan (no backend/DB/API route at all, pure static-data wiring). Steps 1–4 done:
  - `CocktailLibraryScreen` now imports `COCKTAILS`/`CATEGORIES` from `lib/cocktails.ts` directly, with the desktop `useMemo` search/filter/sort ported verbatim. Dropped the Phase B mock's fabricated `base`/`difficulty`/`locked` per-card fields (no such fields exist on the real `Cocktail` type); real `glass` field and `featured` tag used instead. Only 4 of 38 cocktails have real photography in `/public/mobile` — the rest fall back to the existing generic `thumb-cocktail.png` instead of a broken path. Bookmark toggle is real session-state, matching desktop's own non-persisted `practiceAdded` behavior exactly.
  - `KnowledgeBaseScreen` now imports `KB_ENTRIES`/`KB_CATEGORIES` from `lib/knowledge-base.ts`, replacing the Phase B mock's hardcoded 6-card sample entirely — same `useMemo` filter/group pattern ported from desktop. Built a new mobile bottom-sheet detail view (desktop has a slide-over; mobile previously had no tap-through at all).
  - **Step 5's "101 vs 31" naming question was surfaced, not silently resolved**: confirmed desktop already ships the literal "101 Knowledge Base" title over the real 31-entry array in production today, so mobile now matches that existing (if inconsistent) behavior rather than diverging from it on its own initiative. Still an open product call for the user: rename the label, or treat 101 real entries as separate content work.
  - Verified clean: `tsc --noEmit`, targeted `eslint --max-warnings=0`, full `next build` — all pass.
  - **Still open:** step 6, on-device eyeball check of search/filter correctness — lower risk than the other files' open items since there's no write path to get wrong here.

## Day 5 — 2026-08-18 (continued: file 07)

Continued the trickle straight to file `07` (Badges & Achievements) per the user's own selection — next self-contained, decision-free candidate in the queue.

- **`BadgesGalleryScreen` wired to the real `computeBadges()`** from `lib/badges.ts`, sourced entirely through the shared `useTrainingProgress()` hook already used by files `02`–`06` (no second fetch path introduced). `modules`/`scores` derived exactly like desktop's `BadgesView.tsx` does — `scores` uses `data.mastery` directly (`{bartending, sales, management}`) since the API already returns that exact `CategoryScores` shape, rather than re-deriving a redundant per-category average client-side.
- **Found and fixed a real gap while wiring this**: `/api/training/progress` has always returned `sbeEliteNumber`, but the mobile `useTrainingProgress()` hook's `TrainingProgress` type never declared it — the field was silently unreachable from any mobile screen until now. Added it next to the existing `bestCorrectStreak` field.
- **Kept the plan's own explicit "two streaks" warning intact**: daily-login streak (`localStorage["sbe-streak-count"]`, mount-effect + null-skeleton read, same SSR-safe pattern as desktop's `BadgeStreakSection.tsx`) is never mixed with the server-sourced `bestCorrectStreak`/`sbeEliteNumber` used only for the Pro/SBE Elite badges. No streak-increment logic was added on mobile — reading only, same as desktop's own `BadgeStreakSection.tsx` (the increment itself lives in `PreShiftHome.tsx`, shared `localStorage`, same device/account, per the file `05` precedent).
- **Dropped two more fabricated data points, per the now-established pattern** (files `02`/`04`/`05`): the mock's "14/52 earned" header (no 52-badge catalog exists anywhere in V3 — real total is 17: 12 category + 3 streak + 2 special) is now a live `countEarned(badges)/badges.length`; the "Your personal best is 28 days" streak-banner line was dropped rather than faked, since V3 only ever persists the *current* streak count, never a best.
- **Category pills rebuilt against the real taxonomy**: the mock's `["All", "Learning", "Challenges", "Streaks"]` corresponded to nothing `computeBadges()` actually emits. Replaced with the 5 real categories (technical/service/compliance/streak/special) plus "All," each pill showing a live count — a deliberate, documented deviation from the plan's illustrative "4 pills," since forcing the real 5-category output into 4 buckets would just reintroduce the same mismatch this file exists to fix.
- **Caught and fixed a real navigation gap** — the user specifically asked to double-check mobile linking stayed clean this pass. `/mobile/badges` had no inbound `Link` anywhere in the app; it was only reachable by typing the URL directly, and its own file comment was a stale "Phase B preview route." Added an "Achievements" tile to `HomeScreen`'s Quick Access row (same pattern as the existing Challenges/101 Knowledge/Cocktail Library tiles), so the badges screen is now reachable from the primary landing tab. Updated the stale route comment to match.
- Verified clean: `tsc --noEmit`, targeted `eslint --max-warnings=0`, full `next build` — all pass. Plan file `07` updated with its own Implementation Notes section.
- **Still open:** step 6 (live verification of low- vs. high-mastery badge states, streak/Pro-badge independence) — folded into the same combined future browser pass as files `02`/`04`/`05`/`06`.
- **Swept the rest of `app/mobile` for the same orphaned-route pattern** while fixing badges — `/mobile/ai-photo` and `/mobile/onboarding` are *also* unlinked from anywhere in the mobile tree. Left both alone deliberately: they're file `08`'s scope (Onboarding Diagnostic & Profile), and AI Profile Photo specifically has a known open cost/budget sign-off blocking it from being wired live — not a gap this session should silently close. Every other mobile route (`home`, `learn`, `progress`, `challenges`, `match-pairs`, `knowledge`, `scenarios`, `cocktails`, `arena`, and now `badges`) has a confirmed inbound `Link` somewhere in the tree.

## Day 5 — 2026-08-18 (continued: file 08 Half B — AI Profile Photo)

User cleared the previously-open cost/budget sign-off directly: **Fal.ai `fal-ai/flux/schnell` at ~$0.003/generation**, not `gpt-image-2` as file `08` originally recommended — `@fal-ai/client` was already a `package.json` dependency, and an unauthenticated, unhardened route scaffold already existed at `app/api/profile-photo/generate/route.ts`. Instructed to wire it to `AiProfilePhotoScreen.tsx` per file `08`.

- **Hardened the existing scaffold rather than trusting it as-is**: it accepted a raw free-text `prompt` from the client with no auth gate and no rate limit — a real-cost, real-abuse-shape gap. Added `getUserFromRequest` gating, 5/min dual user+IP rate limiting (`lib/rate-limit.ts`, stricter than the standard 20/min text-route tier per file `08`'s own guidance), and moved all 10 style prompts server-side into a canonical `id`-keyed list — the client now only ever sends a validated `styleId`.
- **Split generate from save into two routes**, matching the plan's literal "generate → preview → Save Portrait" sequence: `generate/route.ts` returns a preview URL only; a new `save/route.ts` persists to `profiles.profile_photo_url` (new column, `supabase/migrations/20260818_profile_photo_url.sql` — **not yet applied**, flagged for the user's own deploy process) only when the user explicitly confirms. Auto-persisting on every preview would have silently overwritten a saved portrait with an unconfirmed style.
- **Storage decision**: no Supabase bucket — Fal's URLs live on Fal's own durable CDN (`*.fal.media`), so `save/route.ts` just validates the hostname and stores the URL directly. Re-uploading into our own bucket would be a redundant copy with no stated history/versioning requirement to justify it.
- **`AiProfilePhotoScreen.tsx` had real bugs beyond "not wired"**: a banned `err: any`, a missing `Authorization` header (would have 401'd the instant auth gating landed), and a fabricated static "12 Days" streak badge — replaced with the real `bestCorrectStreak` value `HomeScreen` already sources the same way.
- **Found a second orphaned-route gap**, same shape as `/mobile/badges` last session: `/mobile/ai-photo` had zero inbound links anywhere and a stale "Phase B, no wiring yet" comment. Fixed by adding an edit-pencil badge on `ProgressScreen`'s avatar, linking to `/mobile/ai-photo` — a natural "tap your photo to change it" affordance on the "Me" tab.
- **Flagged, not silently left broken**: nothing reads `profiles.profile_photo_url` back yet — `ProgressScreen`/`HomeScreen` still show the static placeholder avatar even after a successful save. Threading the real photo through `MobileSession` (file `01`'s server-side session plumbing) is a bigger, separate change than "wire the generate route" and was left for a future pass rather than expanded into silently.
- Verified clean: `tsc --noEmit`, targeted `eslint --max-warnings=0` across every touched file, full `next build` — all pass. Plan file `08` updated with its own Implementation Notes section (Half B only — Half A, Onboarding Diagnostic, is untouched).
- **Still open:** step 6 (live verification: generation completes, rate limit trips, saved URL round-trips on next login) — folds into the standing combined browser pass. Half A (the real 10-question diagnostic replacing the self-report picker) has not been started.

## Day 5 — 2026-08-18 (continued: profile-photo read path + file 08 Half A)

User confirmed the migration was applied and `FAL_KEY` is set in Cloudflare, then gave direct instructions: wire the `profile_photo_url` read path (explicitly approving touching file `01`'s session plumbing for this), and build Half A (real diagnostic).

**Read path:**
- `app/mobile/layout.tsx` now selects `profile_photo_url` and passes it into `MobileSessionProvider` as `profilePhotoUrl: string | null`; `MobileSession`'s type updated to match. `ProgressScreen` and `HomeScreen` both now render the real saved photo (with `unoptimized`) when present, falling back to the static placeholder otherwise — closing the exact gap flagged at the end of the last AI-photo pass.

**File 08 Half A:**
- **Confirmed rather than assumed**: `app/api/training/diagnostic/start`/`.../submit` already fully implement `diagnostic-engine.ts` against a real, already-seeded 10-question `diagnostic_questions` table — this was working, complete backend that mobile simply never called. Answers the user's "5 vs 10" question directly: 10 was already built and seeded, so it stayed at 10 per their own "if 10 already done, all good."
- **`OnboardingDiagnosticScreen.tsx` rewritten** as a straight mobile port of desktop's `DiagnosticFlow.tsx` flow — real fetch, single-select per question, Next/Previous, real progress bar, real submit, routes to `/mobile/home` on success. Confirmed (not separately built) that the diagnostic's Elo seeding and `HomeScreen`'s existing recommendation sort already connect with zero new code — they both already read/write the same `scenario_mastery` table.
- **Caught a second real bug this session**: both the new screen and the existing `AiProfilePhotoScreen.tsx` used a dead Tailwind class (`animate-spin`) on their loading spinners — this project has no Tailwind pipeline, the same bug class `DiagnosticFlow.tsx`'s own file comment already documents fixing once on desktop. Added a real `.mobile-spin` keyframes utility to `globals.css` and fixed both.
- **Flagged, not fixed**: `/diagnostic/start` leaks `isCorrect` in its response, inspectable via devtools — confirmed desktop has the identical leak already in production, not something this migration introduced. Not treated as blocking since diagnostic scoring only seeds an initial Elo baseline, not a compliance gate.
- **Third orphaned-route fix, with a twist**: `/mobile/onboarding` was also unlinked, but unlike badges/ai-photo its *intended* first-time entry point is architecturally gated — `app/mobile/layout.tsx` redirects users with incomplete onboarding to desktop's `/onboarding`, never to the mobile screen. Rewiring that redirect is a bigger, riskier call than adding a link (could break the working desktop gate) and wasn't made unilaterally — added a "Retake placement assessment" link on `ProgressScreen` instead, and flagged the redirect-target question as an open product decision.
- Verified clean: `tsc --noEmit`, targeted `eslint --max-warnings=0` across every touched file, full `next build` — all pass. Plan file `08` updated with a second Implementation Notes section.

### Open items carried into Day 6 (updated)
- One combined live signed-in pass now covers five files: `02` (Elo/`venue_staff` update), `04` (Arena score render + rate limit), `05` (Match Pairs completion + count increment), `07` (badge tier states + streak independence), `08` (AI photo round-trip + real diagnostic → Elo seed → Home recommendation chain). File `06` step 6 (search/filter eyeball check) rides along too, lowest priority of the set.
- File `03`'s optional module-detail view (orphaned `[moduleId]/scenarios` route) — still needs a product scope call, not started.
- File `08` is now fully built (both halves) pending only live verification — no code work remaining in this file barring the one flagged pre-existing gap (devtools `isCorrect` leak in the diagnostic endpoints), not a regression introduced by this migration.

## Day 6 — 2026-08-18 (both open product decisions closed)

User made both final calls: (1) rename "101 Knowledge Base"/"101" to plain "Knowledge Base" everywhere, not expand content toward a literal 101 entries; (2) keep first-time onboarding redirects pointing to desktop `/onboarding` — `/mobile/onboarding` stays retake-only, reachable from `ProgressScreen`, no redirect-target change.

- **"Knowledge Base" rename applied repo-wide**, not just mobile: `KnowledgeBaseScreen.tsx`, `HomeScreen.tsx` (mobile), `KnowledgeBase.tsx`, `DashboardShell.tsx`, `PreShiftHome.tsx`, `MobileLearnHub.tsx`, `RecommenderCard.tsx` (desktop), plus `components/ui/CompareMatrix.tsx` (marketing comparison table — named the same feature, would've become a new inconsistency if left as "101 Knowledge Base" while every in-app surface now says otherwise) and `lib/knowledge-base.ts`'s file header comment. Deliberately left the `KB_CATEGORIES` "Spirits 101"/"Beer 101"/etc. sub-labels alone — different "basics of X" idiom, not the count-mismatch this decision was about.
- **Decision 2 required no code change** — `/mobile/onboarding` was already retake-only (added last session), and the desktop `/onboarding` redirect in `app/mobile/layout.tsx` was already left untouched pending this call. Confirmed as final, no further action.
- Verified clean: `tsc --noEmit`, `eslint app/mobile --max-warnings=0`, targeted `eslint` on every touched dashboard/marketing file, full `next build` — all pass. Plan file `06` updated with a closing Implementation Notes section (step 5 now resolved).

### Both standing product decisions are now closed. Everything else remaining is verification, not open questions.

**File `06` is now fully done** except step 6 (on-device eyeball check), same shape as the other files' remaining open items — folded into the standing combined pass.

**Ready for the final combined live-browser verification pass**, covering in one signed-in session:
- File `02` — complete a scenario, confirm `elo_rating`/`mastery` move and `venue_staff` syncs.
- File `04` — Arena score renders correctly, 20/min rate limit trips under repeated calls.
- File `05` — Match Pairs completion upserts `user_challenges` (index 2), `ProgressScreen` count increments, no duplicate row on replay.
- File `06` — search/filter results and counts correct on both Cocktail Library and Knowledge Base; "Knowledge Base" title renders everywhere with no stray "101" left visible.
- File `07` — low- vs. high-mastery badge tier states render correctly; daily-streak badges track independently from the Pro badge's server-sourced best-streak.
- File `08` — AI photo generate → preview → Save Portrait round-trips and the saved photo now actually renders on `ProgressScreen`/`HomeScreen`; 5/min rate limit trips under repeated generate calls; the real 10-question diagnostic produces 1000–1500 Elo scores, visible `scenario_mastery` rows, and a `HomeScreen` recommendation that reflects the new baseline; "Retake placement assessment" link works from `ProgressScreen`.
- Nothing left to check against files `01`, `02`(partially, see above), `03` beyond their already-noted optional/lower-priority items.

Nothing has been committed or pushed this entire migration effort — still fully local, per project convention (commit/push only on explicit request).

## Day 6 — 2026-08-19 (first live-device QA pass, bug fixes)

User committed/pushed `e9f3e8f` to `origin/preview/v4-migration` and ran the first real live-device pass on the deployed preview build, reporting 6 issues in one message with screenshots.

**Confirmed real, fixed:**
- **`HomeScreen` "Today's Hot Picks"** was still the Phase B mock ("Upselling Bordeaux"/"Classic Refresher" — no such modules or cocktails exist anywhere in V3). Replaced with the two real featured cocktails from `lib/cocktails.ts`, linking to `/mobile/cocktails`.
- **`HomeScreen` Continue Learning's message logic was genuinely wrong** for one real case: an account with zero `access.allowedModules` (free tier / no venue) fell into the same branch as "you've mastered everything," which is actively misleading — split into three distinct, correct states (has a module / no modules unlocked / all mastered), plus a distinct error-state message that the old ternary also collapsed into "loading."
- **`ScenarioTrainingScreen`'s 6 "Category Simulations" cards were 100% fabricated** — invented attempt counts, invented difficulty ratings, zero navigation. Replaced with real modules from `useTrainingProgress()` (real title, real category icon, real attempts count, real `difficulty_level`), linking to `/mobile/learn`. Full per-module Arena entry (a real scenario for every module, not just the one featured one) is a separate, bigger build — same "orphaned `[moduleId]/scenarios`" item flagged since file `03`, not something this fix expanded into.
- **`AiProfilePhotoScreen` needed scroll to reach the footer buttons** — removed the "Helps managers put a face to the team" tagline pill (per direct instruction), shrank the portrait preview (210px→176px) and tightened several paddings/gaps to bring total content height back under one viewport on real devices. Also fixed genuinely misleading copy: "Snap a selfie, pick your look" implied a camera/selfie capture that has never existed in this feature (it's style-preset AI generation only) — changed to "Pick a style, we'll generate your portrait."
- **`MatchPairsScreen` "doesn't finish when the answers are all done"** — the completion banner renders below the 3×4 card grid with no auto-scroll, so on a real phone viewport it was rendering off-screen with nothing visibly happening. Added a `scrollIntoView` on completion.

**Investigated thoroughly, could not reproduce a code-level bug — hardened defensively instead:**
- **"Scenarios isn't mapped to actual dashboard modules"** — this is `ScenarioTrainingScreen`'s already-known, already-documented gap (see above), not a new regression.
- **"Placement assessment gets stuck on only one question for all 10"** and **Home's "Continue Learning" stuck on "Loading…"** — both traced exhaustively: `OnboardingDiagnosticScreen.tsx`'s index logic is correct on inspection, and the live `diagnostic_questions` table was queried directly via Supabase MCP — confirmed 10 genuinely distinct, correctly-ordered rows, no duplicates, matching the route's own query exactly. Could not find a code path that produces the reported symptom. Added a `key={currentQuestion.id}` remount boundary around the question/option block regardless, since it structurally eliminates any possible stale-DOM-reuse class of bug even though none was proven. **Flagged to the user: retest both specifically after this new deploy** — the first pass may have hit a stale Cloudflare Pages preview build rather than a real bug in the code that shipped in `e9f3e8f`.
- **"Only Ingredient Match connected" in Challenges** — confirmed as-designed, not a bug: the other 4 challenge games were never built (file `05`'s explicit scope), same status as before this pass.

Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile --max-warnings=0`, full `npx next build` — all pass with zero errors/warnings.

### Open items carried into the next pass
- Retest, on a fresh deploy: the diagnostic's per-question content, Home's Continue Learning state, and everything just fixed above.
- Building real per-module Arena scenario content (beyond the one featured "Wine Cork Complaint") is a real, scoped, **not-yet-started** feature — distinct from a bug fix, worth an explicit go/no-go before starting.
- Camera/selfie capture for AI Profile Photo does not exist and was not built this pass — only the misleading copy referencing it was fixed. Confirm whether real photo capture is in scope before promising it in future copy.

## Day 6 — 2026-08-19 (continued: broader mobile sweep + the other 4 Challenge games)

User asked for a broader sweep of `app/mobile` for anything else worth fixing, then directly: "Can you build the other 4 games?" — followed by "look into these then deploy fresh."

**Sweep findings:** grepped every mobile screen for fabricated-data patterns and dead navigation. Found nothing new beyond what's already tracked — `LearnHubScreen.tsx` (the primary 40-module browser) has real data but genuinely no tap-through to any module or scenario content; this is the *same* "orphaned `[moduleId]/scenarios`" gap flagged since Day 4 (file `03` step 5), not a new find, and not something to silently build given how large real per-module scenario content actually is (would mean a new API route pulling from the `scenarios` table, not a link fix). Flagging again rather than expanding scope unilaterally. Everything else checked out — `ArenaScreen.tsx`, `CocktailLibraryScreen.tsx`/`KnowledgeBaseScreen.tsx` (modal-based, correctly have no page-level links), `BottomNav.tsx` all clean.

**Built the remaining 4 Challenge games**, closing out `ChallengesScreen`'s last 4 disabled rows:
- `SequenceSortScreen` (Recipe Order, index 0), `FillBlankScreen` (Memory Test, index 1), `SpotErrorScreen` (Menu Audit, index 3), `MultipleChoiceScreen` (Speed Round, index 4) — real content ported verbatim from desktop's own game components (same questions, correct answers, and explanations — not new content, not a difficulty rebalance).
- Mobile keeps its own established shape (5 independent standalone routes, matching `MatchPairsScreen`'s precedent) rather than porting desktop's sequential 5-question wizard — a deliberate, documented divergence, not an oversight.
- Factored out two shared files rather than quadruplicating boilerplate: `use-challenge-complete.ts` (the completion-sync hook) and `MobileChallengeChrome.tsx` (mobile-dark feedback/retry/completion UI, with the same-day Match Pairs `scrollIntoView` fix built in from the start).
- New routes: `/mobile/recipe-order`, `/mobile/memory-test`, `/mobile/menu-audit`, `/mobile/speed-round`. `ChallengesScreen.tsx` updated to link all 5 rows.
- Verified clean: `tsc --noEmit`, `eslint app/mobile --max-warnings=0`, full `next build` — all pass. Plan file `05` updated with a second Implementation Notes section.

**Deploy**: committed and pushed to `origin/preview/v4-migration` per direct instruction — see the commit for the full file list.

### Open items carried forward
- Live verification of all 4 new games (`user_challenges` upsert per index, `ProgressScreen` count increments) — same category as every other file's still-open manual-verification item, batches into the standing combined pass.
- Retest on this fresh deploy: the diagnostic per-question content and Home's Continue Learning state (both investigated exhaustively last pass with no code bug found — possible stale-build artifact).
- Still the single largest remaining gap, still not silently built: a real per-module Arena/scenario entry point from `LearnHubScreen` — needs new backend work (real scenario content per module from the `scenarios` table) and an explicit go-ahead, not just a link fix.
- Camera/selfie capture for AI Profile Photo still doesn't exist — only the misleading copy was fixed, not the feature itself.
