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

## Implementation Notes (Day 5 — 2026-08-18) — Half B only

Half A (Onboarding Diagnostic) not started this pass — only Half B (AI Profile Photo) was in scope, per explicit user go-ahead. Steps 1–5 of Half B done. Step 6 open (live verification, folded into the standing combined-pass list).

- **Model decision superseded**: the user cleared the cost/budget sign-off and chose **Fal.ai `fal-ai/flux/schnell`** (~$0.003/generation) over this file's original `gpt-image-2` recommendation — cheaper, and `@fal-ai/client` was already a `package.json` dependency. This supersedes the "Model correction" section above; `gpt-image-2` was never built against.
- **A route scaffold already existed** at `app/api/profile-photo/generate/route.ts` (unauthenticated, no rate limit, accepted a raw free-text `prompt` straight from the client, no persistence) — this was hardened rather than replaced wholesale: added `getUserFromRequest` auth gating, dual user+IP rate limiting via `lib/rate-limit.ts` (5/min, stricter than the 20/min text-route norm per this file's own guidance — image generation has real per-call cost), and moved all 10 style prompts server-side into a canonical `STYLE_PROMPTS` list keyed by `id`. The client now sends only a validated `styleId`, never a prompt — closes the "arbitrary-prompt image generator with real cost" abuse shape this file's Architecture section warned about.
- **Generate vs. Save split into two routes**, matching the plan's own "generate call → preview → Save Portrait" sequence literally: `generate/route.ts` returns a preview URL only, no DB write. A new `save/route.ts` persists to `profiles.profile_photo_url` only when the user explicitly taps "Save Portrait" — auto-persisting on every generate would silently overwrite a saved portrait with whatever style the user last previewed but never confirmed.
- **Storage decision made**: no Supabase Storage bucket. Fal's returned URLs are hosted on Fal's own durable CDN (`*.fal.media`), so re-uploading into a bucket would just be a redundant copy with no stated multi-photo/history requirement to justify it. `save/route.ts` validates the URL's hostname ends in `.fal.media` before writing, so this endpoint can't be used to set `profile_photo_url` to an arbitrary string.
- **New migration**: `supabase/migrations/20260818_profile_photo_url.sql` adds `profiles.profile_photo_url text`. **Not yet applied** — migration files in this repo are applied by the user's own deploy process, not by this session; flagging so it isn't missed before this feature goes live.
- **`AiProfilePhotoScreen.tsx` hardened**, not just wired: fixed a real `err: any` (banned by `CLAUDE.md`'s "no `any`" rule) to `err instanceof Error`; added the `Authorization: Bearer` header (was missing — the generate call would have 401'd the moment auth gating was added); replaced the fabricated static "12 Days" streak badge with `useTrainingProgress()`'s real `bestCorrectStreak` (same value/pattern `HomeScreen` already uses); "Save Portrait" changed from a bare `Link` to a button that calls `save`, then navigates — matching the new two-step flow.
- **Fixed a second orphaned-route gap** (same pattern as `/mobile/badges` last session): `/mobile/ai-photo` had no inbound link anywhere in the app either, and its route file still said "Phase B preview, no wiring yet." Added an edit-pencil badge on `ProgressScreen`'s avatar linking to `/mobile/ai-photo` — profile photo is a natural "tap your avatar to change it" affordance, and `ProgressScreen` (the "Me" tab) is the natural home for it. Updated the stale route comment to match.
- **Known follow-up, not done this pass**: nothing currently reads `profiles.profile_photo_url` back — `ProgressScreen` and `HomeScreen` still show the static placeholder avatar image regardless of whether a user has saved a real portrait. Wiring the read side would mean threading `profile_photo_url` through `MobileSession` (file `01`'s auth/session plumbing, built server-side in `app/mobile/layout.tsx`) or `useTrainingProgress()`'s response — a larger, separate change than "wire the generate route," which is what was asked for this pass. Flagging explicitly rather than silently leaving both avatars looking unchanged after a successful save.
- Verified clean: `npx tsc --noEmit`, `npx eslint` on all touched files `--max-warnings=0`, and a full `npx next build` — all pass with zero errors/warnings.
- **Still open:** step 6 (live signed-in verification: generation completes, rate limit trips under repeated calls, saved URL round-trips) — folds into the same combined future browser pass as files `02`/`04`/`05`/`06`/`07`. Half A (Onboarding Diagnostic) is entirely unstarted.

## Implementation Notes (Day 5 — 2026-08-18, continued) — read-path wiring + Half A

User applied the migration, set `FAL_KEY` in Cloudflare, and gave direction to (1) wire the `profile_photo_url` read path into `MobileSession` and (2) build Half A. Both done this pass.

**Read path (file `01` scope, approved for this session):**
- `app/mobile/layout.tsx` now selects `profile_photo_url` alongside the existing profile columns and passes it into `MobileSessionProvider` as `profilePhotoUrl`.
- `MobileSession` type (`mobile-session-context.tsx`) gained `profilePhotoUrl: string | null`.
- `ProgressScreen` and `HomeScreen` both render `session.profilePhotoUrl ?? <placeholder>` in place of the static avatar image, with `unoptimized` set when a real URL is present (same pattern already used in `AiProfilePhotoScreen`'s preview).

**Half A — real diagnostic:**
- **Step 1 confirmed, no new routes needed**: `app/api/training/diagnostic/start` and `.../submit` already fully implement `diagnostic-engine.ts`'s real scoring against a real `diagnostic_questions` DB table (10 seeded questions, confirmed via migration `20260421_2c_create_scenarios_part3.sql`) — this was existing, working, unused-by-mobile backend, not something built this pass. User's "5 vs 10" question was answered by this: 10 was already done and seeded, so 10 stayed, per the user's own "if 10 already done, all good."
- **`OnboardingDiagnosticScreen.tsx` rewritten** as a straight mobile port of desktop's `DiagnosticFlow.tsx` fetch/answer/submit flow (not new logic) — fetches real questions on mount (cache-busted, `no-store`, matching `DiagnosticFlow.tsx`'s own caching-safety comment about edge cache replay risk), single-select per question, Next/Previous stepping, real progress bar, submits real answers to `/submit` on the last question, then routes to `/mobile/home`.
- **Step 4 verified, not separately built**: `submit` already seeds `scenario_mastery.elo_rating` per module from the diagnostic's category scores, and `HomeScreen`'s existing recommendation logic (file `02`) already sorts by `avgElo` read from that same table — the two already connect with zero new code once the real submit endpoint runs. No extra "feed recommendations into Home" wiring was needed.
- **Caught and fixed a real bug found while building this**: `Loader2` spinners in both this new screen and the existing `AiProfilePhotoScreen.tsx` used `className="animate-spin"`, a Tailwind utility class — this project has no Tailwind build pipeline (documented precedent: `DiagnosticFlow.tsx`'s own file comment already describes fixing the identical dead-class bug once on desktop). Added a real `.mobile-spin`/`@keyframes` pair to `globals.css` and switched both mobile spinners to it.
- **Known pre-existing gap, flagged not fixed**: `/diagnostic/start`'s response includes `isCorrect` on every option object, inspectable via devtools — confirmed desktop's `DiagnosticFlow.tsx` has the identical leak already in production today. Diagnostic scoring only seeds an initial Elo baseline, not a compliance gate, so this wasn't treated as blocking; noted in the new screen's file comment for whoever eventually hardens these two routes.
- **Fixed the same orphaned-route pattern a third time**: `/mobile/onboarding` had no inbound link either. Unlike badges/ai-photo, its *first-time entry* is architecturally gated by a completely different flag — `app/mobile/layout.tsx` redirects users with `!profile.onboarding_completed` to desktop's `/onboarding`, not to `/mobile/onboarding`, so there's no automatic mobile-native onboarding entry today. Rewiring that redirect target is a bigger, riskier architectural call than "add a link" (could break the working desktop onboarding gate for mobile users) and wasn't made unilaterally. What *was* added: a "Retake placement assessment" link on `ProgressScreen`, giving the screen real reachability without touching the mandatory first-login redirect. **Flagged as an open product question**: should first-time mobile users be routed through `/mobile/onboarding` instead of desktop's `/onboarding`, or is "retake only, reachable from Progress" the intended mobile behavior long-term?
- Verified clean: `npx tsc --noEmit`, `npx eslint` on every touched file `--max-warnings=0`, and a full `npx next build` — all pass with zero errors/warnings.
- **Still open:** live signed-in verification of both halves (folds into the standing combined browser pass) — real 10-question flow producing 1000–1500 Elo scores and visible `scenario_mastery` rows, and the AI-photo round trip. The first-time mobile onboarding entry-point question above needs the user directly, not a code fix.
