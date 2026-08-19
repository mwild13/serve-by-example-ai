# 10 — Error Handling & Offline Resilience

## Primary Goal & UI Targets

Cross-cutting across all 13 `app/mobile/_components/` screens, with the highest-value targets being the fire-and-forget write paths from files `02` (`training/save`), `05` (`challenges/save`), and `04` (`arena/evaluate`) — the ones most likely to fire on a spotty venue WiFi/mobile-data connection mid-shift. Unlike every other file in this plan, this one is framed as **net-new work**, same caveat as file `08`'s AI-photo half: there is nothing in V3 to extract here.

## Diamond Extraction List — what actually exists (confirmed absent, listed for completeness)

- `components/ErrorLogger.tsx` — client component, `window.addEventListener("error"/"unhandledrejection")`, **console.error only**. No reporting endpoint, no retry, no user-facing recovery.
- No `navigator.onLine` / offline-detection code anywhere in `app/dashboard`, `lib`, or `components` (grep-confirmed).
- No React `ErrorBoundary`, no `app/dashboard/error.tsx`, no `global-error.tsx`.
- No network retry logic on any inspected `fetch()` call — `DashboardTrainer.tsx`, `DynamicModuleNav.tsx`, `ChallengesPage.tsx` all use "fire and best-effort": catch-and-swallow (`catch { /* non-critical */ }`) or `.catch(err => console.error(...))`. No exponential backoff, no queued retry, no offline-write queue.
- The only "retry" hits in the codebase are UI-label copy (`ModuleVerify.tsx`'s `Status = "retry"` for a failed quiz attempt, `ChallengeScoreBoard.tsx`'s "Needed retry" text) — unrelated to network resilience.
- One informal precedent worth reusing conceptually: `DashboardTrainer.tsx` updates its local `scenarioMastery` state **optimistically**, ahead of server confirmation from `/api/training/save`. This is the closest thing to a resilience pattern in V3 — not a formal queue, just "update the UI first, reconcile if the write fails."

**Conclusion: there is no existing offline/retry infrastructure to port.** Everything in this file is new design, informed only by the optimistic-update habit above.

## Architecture & Cleanup Plan

- Given a real "spotty venue WiFi" use case (staff mid-shift, phone on venue guest WiFi or patchy mobile data), propose a minimal, proportionate pattern — not a full offline-first rearchitecture:
  - **Optimistic local state**, matching `DashboardTrainer.tsx`'s existing informal approach: update the mobile UI (mastery ring, streak, badge state) immediately on a scenario/challenge completion, before the server confirms.
  - **A small retry queue** for the two idempotent fire-and-forget writes that already tolerate replay safely: `/api/training/save` (upserts, safe to retry) and `/api/training/challenges/save` (upserts on `onConflict`, safe to retry). Queue failed writes in `localStorage` or IndexedDB, retry on reconnect (`window.addEventListener("online", ...)`) or on next app foreground.
  - **Do not** build a queue for `/api/arena/evaluate` or `/api/evaluate` — these are not idempotent (each call costs an LLM invocation and produces a fresh, possibly-different score); a network failure there should surface as "try again" UI, not silent background retry.
  - Basic online/offline UI affordance (a banner or inline state) so staff aren't confused when a save is pending vs. failed vs. confirmed.
- This is scoped as a cross-cutting pass applied *after* the per-screen wiring in files `02`–`08` is functional — retrofitting resilience onto working online-only calls is more tractable than building it speculatively first.

## Step-by-Step Task Checklist

1. Wire basic `navigator.onLine` detection + an `online`/`offline` event listener into the mobile shell (likely alongside `app/mobile/layout.tsx` from file `01`).
2. Define the retry-queue shape (a simple `{ url, body, timestamp }[]` in `localStorage` is sufficient — no need for IndexedDB unless payload volume proves it necessary).
3. Wrap `/api/training/save` and `/api/training/challenges/save` calls with: try immediately → on failure, enqueue → flush queue on reconnect.
4. Leave `/api/arena/evaluate` and `/api/evaluate` calls as direct try/catch-with-user-facing-retry-button, no silent queue.
5. Add minimal online/offline UI state (banner or inline indicator) — keep it small; this is a resilience layer, not a new design system component.
6. Manually verify: simulate offline (dev tools network throttling), complete a scenario, confirm it queues; go back online, confirm the queued write flushes and mastery updates correctly; confirm Arena submissions surface a clear retry prompt instead of silently failing.

## Implementation Notes (Day 6 — 2026-08-19) — targeted audit pass, not the full retry-queue build

User asked for a scoped audit ("what happens if the network drops mid-submit") rather than the full plan above — explicitly: add defensive error handling only where genuinely missing, don't rewrite working UI/business logic. This entry covers that narrower pass; the retry-queue/`navigator.onLine`/offline-banner design above is **still entirely unbuilt** and a separate, bigger piece of work.

**Audited every `fetch()` call site under `app/mobile`** (8 total, one per file: `use-challenge-complete.ts`, `AiProfilePhotoScreen.tsx` ×2, `OnboardingDiagnosticScreen.tsx` ×2, `MatchPairsScreen.tsx`, `use-training-progress.ts`, `ArenaScreen.tsx`) plus every API route mobile calls into (`training/progress`, `diagnostic/start`, `diagnostic/submit`, `training/challenges/save`, `profile-photo/generate`, `profile-photo/save`, `arena/evaluate`).

**Found and fixed one real gap**: `ScenarioTrainingScreen.tsx` read `status`/`data` from `useTrainingProgress()` but never rendered anything for `status === "error"` — the module grid just silently rendered empty, no message, no retry, matching neither the "hang" nor the "clear failure" pattern, just a dead end. Added an explicit error state with a "Try again" button (calling the hook's existing `refetch()`), plus an explicit loading message, matching the pattern already used in `LearnHubScreen.tsx`/`ProgressScreen.tsx`/`BadgesGalleryScreen.tsx`.

**Everything else checked out, no changes needed:**
- `use-training-progress.ts` (the shared data hook every screen reads through) already has full try/catch, a distinct `error` state, and a `refetch()` — this is why fixing it once in the hook already covers 6 of 7 consumer screens; only `ScenarioTrainingScreen` had failed to render what the hook already exposed.
- `ArenaScreen.tsx`, `AiProfilePhotoScreen.tsx`, `OnboardingDiagnosticScreen.tsx` all already have try/catch around every fetch, a distinct 429/error message, and reset their `submitting`/`isLoading`/`isSaving` flags in every code path (`finally` or both branches) — no infinite-spinner risk found anywhere in this audit.
- `use-challenge-complete.ts` and `MatchPairsScreen.tsx`'s own inline completion-sync fetch are intentionally fire-and-forget with a `.catch(console.error)` — this matches desktop's own `ChallengesPage.tsx::markComplete()` pattern exactly (already documented in these files' own header comments) and isn't tied to any loading spinner — the completion UI renders from local optimistic state regardless of whether the background sync succeeds, so a dropped network call here degrades silently (the challenge badge just doesn't sync that attempt) rather than hangs or breaks the visible flow. Left as-is: turning this into a user-facing failure state would mean adding a queue/toast (file `10`'s actual unbuilt scope above), not a one-line defensive fix, and would be rewriting working, intentional business logic rather than patching a gap.
- Every API route mobile touches already wraps its handler in try/catch with a proper error response — no bare/unguarded route found.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile --max-warnings=0`, full `npx next build` — all pass.

**Still fully unbuilt**: the actual file `10` scope — `navigator.onLine` detection, a `localStorage` retry queue for `training/save`/`challenges/save`, and an offline/pending UI banner. Worth a real go/no-go from the user before starting, same as any other net-new (not extraction) piece in this migration.
