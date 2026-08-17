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
