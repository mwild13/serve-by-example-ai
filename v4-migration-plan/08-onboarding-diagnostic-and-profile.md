# 08 — Onboarding Diagnostic & AI Profile Photo

## Primary Goal & UI Targets

Primary targets: `OnboardingDiagnosticScreen`, `AiProfilePhotoScreen`. These two screens are unrelated features that happen to share a file per the original 12-file brief — treat them as two independent halves with very different risk profiles: the diagnostic half is extraction (V3 already has the real logic), the AI-photo half is net-new (V3 has nothing to extract).

## Half A — Onboarding Diagnostic

### Diamond Extraction List

**`lib/diagnostic-engine.ts`** (363 lines) — 10 hardcoded Q&As (`DIAGNOSTIC_ANSWER_KEY`, `QUESTION_CATEGORY_MAP`) mapped to technical/service/compliance categories.
- `processDiagnosticAnswers()` — scores answers, requires all 10 present.
- `calculateCategoryScores()` — `Math.max(1000, Math.min(1500, 1200 + (percentage - 50) * 6))` — 50% → 1200 Elo, 100% → 1500, 0% → 900 clamped to 1000.
- `getRecommendedModules()` — sorts categories ascending, returns modules from the lowest 2 categories.
- `generateScenarioMasterySeeds()` — seeds `scenario_mastery` rows (`mastery_level=0`, `elo_rating=categoryElo`, `next_review_at = now+1 day`) for modules in `MODULE_CATEGORY_MAP` (covers modules 1–20 only — a known gap versus the full 40-module catalog, inherited from V3, not something to fix as part of this port).

**The mismatch (from `00`):** the current `OnboardingDiagnosticScreen.tsx` mock is a **self-reported** 3-level picker ("Beginner"/"Intermediate"/"Advanced," hardcoded `selected: true` on "Intermediate") with a fake "Step 2 of 4" / 51% progress bar and no scoring logic whatsoever. It has zero relationship to `diagnostic-engine.ts`'s real 10-question, category-scored Elo placement flow.

### Architecture & Cleanup Plan

- Replace the self-report picker with the real 10-question flow: fetch questions (likely via a new thin `GET` wrapping `diagnostic-engine.ts`'s question set, or reuse `app/api/training/diagnostic/start/route.ts` / `.../submit/route.ts` if those already serve this — confirm their existing contract before adding a new route), submit answers through `processDiagnosticAnswers()`, and seed `scenario_mastery` via `generateScenarioMasterySeeds()` exactly as V3 does today for `DiagnosticFlow.tsx`.
- Porting the self-report UI forward as "the diagnostic" would discard working, already-scored placement logic in favor of a decorative picker — don't do that. The mobile screen's visual shell (card-based level/question selection) can stay; what changes is that it drives real questions and a real score instead of static labels.
- `"Skip Assessment"` and disabled `"Next Question"` behavior (both already decided in the earlier Phase B.5 navigation plan — skip → `/mobile/home`, next → no-op until real steps exist) stays as-is; this file only concerns replacing the *content* of the 4 steps with the real question flow, not the navigation shell around it.

### Step-by-Step Task Checklist (Diagnostic)

1. Confirm whether `app/api/training/diagnostic/start` / `.../submit` already expose `diagnostic-engine.ts`'s logic (check before writing new routes).
2. Replace `OnboardingDiagnosticScreen`'s hardcoded `LEVELS` self-report with the real 10 questions, one per step (matches the mock's existing "Step X of 4"-style shell, extended to the real question count).
3. On completion, call `processDiagnosticAnswers()` → `calculateCategoryScores()` → `generateScenarioMasterySeeds()`, exactly mirroring `DiagnosticFlow.tsx`'s existing call sequence.
4. Verify `getRecommendedModules()`'s output feeds `HomeScreen`'s recommendation surface (cross-reference `02`'s note on composing "Today's Hot Picks").
5. Manually verify: completing the real 10 questions produces category Elo scores in the expected 1000–1500 range and seeds `scenario_mastery` rows visible in `ProgressScreen` immediately after.

## Half B — AI Profile Photo (Locked Decision #1 — Net-New Build)

### Diamond Extraction List

**None.** A repo-wide search for image-generation code (`images.generate`, DALL-E, `gpt-image`, Imagen, Stability AI, Replicate, Midjourney) across `app/`, `lib/`, and `components/` returned zero matches. There is no OpenAI Images API usage, no third-party image-gen SDK, no image-generation route anywhere in the codebase. `AiProfilePhotoScreen.tsx` is explicitly self-documented as UI-only ("back/retake/save actions and style selection are not wired") and ships 10 hardcoded style options (Classic Bar, Fine Dining, Cocktail Lounge, Hotel Lobby, Rooftop Bar, Wine Cellar, Coffee House, Beach Club, Speakeasy, Corporate), each pointing at a static placeholder image path — no generation logic anywhere.

Per the locked decision, this half is scoped as **new engineering, not extraction** — flagged distinctly from every other file in this plan set.

### Architecture & Cleanup Plan (net-new)

- **Model correction (checked 2026-08-17, supersedes the original draft's `gpt-image-1` / DALL-E 3 choice):** neither of those is viable to build against today.
  - **DALL-E 3 is dead** — removed from the OpenAI API entirely on May 12, 2026. Not usable as a fallback.
  - **`gpt-image-1` shuts down October 23, 2026** — about 9 weeks from today. Building on it now means a forced migration almost immediately after ship.
  - **`gpt-image-1.5` / `gpt-image-1-mini` also shut down December 1, 2026**, consolidating onto **`gpt-image-2`**.
  - **Target model: `gpt-image-2`** (migration from `gpt-image-1` is a model-id swap, not a prompt rewrite, per OpenAI's own migration notes). Use it directly rather than starting on a model that's already scheduled for retirement.
  - Cost is still real and non-trivial (`gpt-image-1`-era pricing ran roughly $0.011–$0.25/image depending on quality/resolution tier — confirm `gpt-image-2`'s current published rate before sign-off, since per-tier pricing shifts with each model generation). The existing budget-approval gate below still applies unchanged.
- New route: `app/api/profile-photo/generate/route.ts`, `getUserFromRequest`-gated, using `openai.images.generate` with model `gpt-image-2`. Reuse the shared `lib/openai.ts` client factory being introduced in file `04`, do not add an 8th duplicate client helper.
- One prompt template per `STYLES` entry (the 10 styles already defined in the mock) — design these as short, consistent style-descriptor prompts (e.g. "professional hospitality staff portrait, [style] setting, warm lighting..."), not one giant conditional prompt.
- New storage: a Supabase Storage bucket for generated images (e.g. `profile-photos/`) plus either a new column on `profiles` (`profile_photo_url`) or a small dedicated table if versioning/history matters — decide based on whether users can regenerate/keep multiple.
- Dedicated rate limiting via the existing `lib/rate-limit.ts`, **stricter than the 20/min text-route norm** — image generation is materially more expensive per call than `gpt-4o-mini` text completions; recommend starting around the `demo/generate-drills` tier (3–5/min) rather than the standard authenticated-route tier (20/min), keyed on both user and IP like `arena/evaluate`.
- **Explicit cost callout:** each image generation call has real, non-trivial per-call cost (unlike every other AI route in this plan set, which uses the cheap `gpt-4o-mini` text model). Confirm budget/expected usage volume with the user before building, since this is the one file in the whole migration where "just wire it up" has a real ongoing dollar cost attached.

### Step-by-Step Task Checklist (AI Photo — exploratory, not mechanical)

1. Confirm current `gpt-image-2` pricing/quality tiers and get explicit cost/budget sign-off from the user before writing code (do not build against `gpt-image-1` — it's scheduled for shutdown Oct 23, 2026).
2. Design and test the 10 style-specific prompts against a few sample generations.
3. Decide storage approach: bucket + `profiles` column vs. dedicated table (spike both, pick based on whether regeneration/history is a requirement).
4. Build `app/api/profile-photo/generate/route.ts` using the shared `lib/openai.ts` factory, with dedicated rate limiting.
5. Wire `AiProfilePhotoScreen`'s style chips (already `useState`-enabled per the Phase B.5 nav plan) → generate call → preview → Save Portrait (already wired to `/mobile/home` per that same plan; this file adds the actual generation + persistence behind it).
6. Manually verify: generation completes within a reasonable timeout, rate limiting rejects excess calls, saved photo persists and is retrievable on next login.
