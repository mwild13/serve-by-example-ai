# V4 Mobile — Major Bug Batch: Root-Cause Fix Plan

## Context

The user ran a full live-device pass on the deployed `/mobile` preview and reported 15 issues in one message. Three parallel research passes plus direct verification against `lib/mastery.ts`, `app/api/training/progress/route.ts`, `app/api/training/save/route.ts`, and the Supabase migrations confirmed the user's own diagnosis: **the mobile migration conflated three structurally distinct desktop systems into one.** Desktop has:

| System | Desktop component | Content source | Purpose |
|---|---|---|---|
| Quiz (module mastery gate) | `DynamicModuleNav.tsx` → `ModuleVerify.tsx` → `RapidFireQuiz.tsx` | `lib/verify-questions.ts` — 5 True/False Qs × 40 modules | Pass 4/5 to master a module |
| Scenario Training ("Scenarios") | `DashboardTrainer.tsx` + `ScenarioPractice.tsx` | `app/dashboard/_components/trainer/trainer-data.ts::SCENARIOS` — 10 bartending, 10 sales, 20 management (mgmt gated to Manager/Supervisor role) | Free-text response, graded by `POST /api/evaluate` (GPT-4o-mini, 5-dim rubric) |
| AI Arena ("Live Scenarios") | `ArenaPage.tsx` | `lib/arena-scenarios.ts::ARENA_SEED_SCENARIOS` — 1 roleplay per module × 40 | Roleplay, graded by `POST /api/arena/evaluate` |

Mobile currently routes **both** the Learn Hub (should → Quiz) and the "Scenarios" tab (should → Scenario Training) into Arena — the one system that happens to already be built. This single architectural mistake is the root cause of 4 of the 15 reported bugs (module-card destination, wrong scenario tab content/count, "Live Scenarios" mislabeling, and half of the fake "X/10" counters). The rest are independent, smaller bugs, each with a confirmed single root cause below.

User decisions already made for this plan:
- **Scenario collision (Phase 2 below):** ship the proper fix — a migration adding `scenario_type` to `scenario_mastery`, with best-effort backfill.
- **Streak (Phase 6 below):** add real increment logic to mobile, not just fix the display mismatch.
- **AI Photo identity preservation (Phase 7 below):** switch the selfie path to `fal-ai/flux-pulid` rather than tuning the existing model.

---

## What YOU need to check/do (not code — environment or your own verification)

| # | Item | What to do |
|---|---|---|
| 1 | **AI Photo generation** | Confirmed working now (`FAL_KEY` fix landed) — but the selfie-guided path doesn't preserve the actual face (wrong hair colour/skin tone/ethnicity than the uploaded photo). Root cause + fix now in Phase 7 below (switching the selfie path from raw image-to-image to an identity-preserving model, PuLID). Retest with your own selfie once Phase 7 ships and confirm the output actually looks like you, just restyled into the chosen hospitality setting. |
| 2 | **20 vs 40 modules on Learn tab** | Re-investigated end-to-end (DB → API route → component) this session — found no cap anywhere in current code: `modules` table has 40 active rows (verified live via SQL), `route.ts` returns them unmodified, `LearnHubScreen.tsx` has no slice/filter. Git history shows this exact bug class (a `?? 20` fallback, an old placeholder catalog) was already fixed in two earlier commits already on this branch. Most likely explanation: the live Cloudflare Pages preview you tested was a stale build from before those commits, or a cached `/api/training/progress` response on your device. Hard-refresh / clear site data on a confirmed-fresh deploy and recheck before reporting this back as a code bug — static review found nothing left to fix. |
| 3 | **Only 6 cards on the Scenarios tab** | Real bug, found — not stale build. `ScenarioTrainingScreen.tsx:98` hardcodes `.slice(0, 6)` on the module list, so only 6 cards ever render no matter how many modules/scenarios exist (confirmed `ARENA_SEED_SCENARIOS` genuinely has all 40 entries — this isn't a sparse-data issue). This is exactly the screen Phase 3 (item 9) already rewires from an Arena-card grid into 3 real category cards (Bartending/Sales/Management) — the `.slice(0, 6)` is removed entirely as part of that rewrite, no separate patch needed. |
| 4 | **Category pill CSS glitch (Technical/Compliance ghost edges, Service overflow)** | No structural bug found in static code — this needs a live-device retest. I'll ship a best-effort CSS hardening pass (scroll-snap, touch-scroll fix) below; please retest on your actual device afterward and tell me if it's resolved, since I can't reproduce this from code alone. |
| 5 | **Pinch-zoom gets stuck, won't reset on refresh/page change** | Root cause found: `app/globals.css` sets `touch-action: pan-x pan-y` on `body`, which omits `pinch-zoom` from the allowed gesture list and can suppress zooming back out once a pinch has engaged. Fixed in Phase 1 below (one-line CSS change). One residual caveat that's a genuine mobile-browser limitation, not something fixable in this codebase alone: Safari/Chrome only reset zoom level on a full page reload, not on Next.js's client-side route transitions — so zoom can still visually persist across in-app navigation even after this fix. Flag if that residual behaviour is still a problem after retesting; there's a small JS workaround (briefly toggling the viewport meta tag on route change) to force a hard reset-on-navigate, not built by default since it's extra complexity for a browser quirk rather than a codebase bug. |
| 6 | **Live QA pass after this batch ships** | Once deployed: retest every item below on your device and confirm each is actually fixed, especially the two new screens (Quiz, Scenario Practice) since they're net-new UI with no prior live test. |
| 7 | **Scenario-collision backfill risk** | The migration backfills existing `scenario_mastery` rows for modules 1-3 as best-effort (quiz-mastered rows → `scenario_type='quiz'`, everything else → `'descriptor'`). If your own account (or any test account) shows a module 1-3 quiz as suddenly "not mastered" after this ships, that's the known imperfect-backfill edge case — just retake that module's quiz once. |

---

## Implementation plan (build order)

### Phase 1 — Independent, low-risk fixes (ship first)

1. **Match Pairs stuck at 3/6** — `app/mobile/_components/MatchPairsScreen.tsx`: `pairsFound = matched.size / 2` → `matched.size` (matched already holds one entry per pair, not two). One line.
2. **Fake SBE logo → real logo** — replace the 3-span `S`/`B`/`E` pill wordmark with `<Image src="/logo.webp" alt="Serve By Example" .../>` (same asset/pattern as `components/Navbar.tsx:150`) in all 3 places it appears: `LearnHubScreen.tsx` (~168-183), `HomeScreen.tsx` (~170-186), `ChallengesScreen.tsx` (~82-94).
3. **Category pill CSS hardening** — `LearnHubScreen.tsx`'s category scroller (~214-242): add `scrollSnapType`/`scrollSnapAlign`, `WebkitOverflowScrolling: "touch"`, verify no parent `overflow: hidden` is clipping trailing padding. Flagged to user as best-effort (checklist item 4 above).
4. **Pinch-zoom stuck (found 2026-08-20)** — `app/globals.css:303`: `body { ...; touch-action: pan-x pan-y; ... }` → `touch-action: manipulation;`. `manipulation` = pan + pinch-zoom while still suppressing double-tap-to-zoom, which was almost certainly the original intent of the rule — this restores pinch-zoom-out without reintroducing the 300ms-tap-delay/double-tap-zoom behaviour the rule was likely added to avoid. This is a global rule (affects every route, not just `/mobile`), so no separate mobile-scoped change is needed. Do **not** touch the viewport meta (`app/layout.tsx`'s `viewport` export) — it's already correctly permissive (no `maximumScale`/`userScalable: false`), so adding either now would make zoom worse, not better. See checklist item 5 above for the separate SPA-navigation-doesn't-reset-zoom caveat, which is out of scope for this one-line fix.

### Phase 2 — Scenario collision fix (migration)

5. **Add `scenario_type` to `scenario_mastery`**
   - New migration `supabase/migrations/20260820_scenario_mastery_scenario_type.sql`: add `scenario_type text` (reuse the same enum values already used by the `scenarios` content table — `'quiz' | 'descriptor_l2' | 'descriptor_l3' | 'roleplay'`, simplify to `'quiz' | 'descriptor' | 'roleplay'` if L2/L3 distinction isn't needed for mastery tracking — confirm against how `trainer-data.ts` scenarios are indexed before deciding), change the unique constraint from `(user_id, module, scenario_index)` to `(user_id, module, scenario_type, scenario_index)`.
   - Backfill: existing `scenario_index=0` rows with `is_mastered=true` → `scenario_type='quiz'`; everything else → `'descriptor'`; `scenario_index=40` rows → `'roleplay'` (matches the existing Arena convention in `lib/mastery.ts:496`).
   - Update write paths to pass `scenario_type` explicitly: `markModuleMastered()` (`lib/mastery.ts:305-357`, always `'quiz'`), `recordAttempt()` callers — `DashboardTrainer.tsx`'s save call and the new mobile Scenario Practice screen (Phase 3, always `'descriptor'`), `app/api/arena/evaluate/route.ts` (always `'roleplay'`).
   - Update read paths to filter by `scenario_type`: `getMasteryProgress()`, `getReviewQueue()`, `getScenarioMasteryDetails()` (`lib/mastery.ts`), and `moduleProgress` aggregation in `app/api/training/progress/route.ts` (~line 101-125, currently groups by `module_id` alone with no type filter).
   - Remove the fake `?? 10` fallback (`progress/route.ts:113`, `lib/module-navigator.ts:189`, `LearnHubScreen.tsx:96`) — once Quiz/Scenario-Training/Arena are separated, the Learn Hub card (now showing Quiz progress) has a fixed, real total of 5 questions, not a scenario count at all.

### Phase 3 — Net-new UI: Quiz screen + Scenario Practice screen (the big pieces)

6. **`app/mobile/_components/QuizScreen.tsx`** (new) + `app/mobile/quiz/page.tsx` (new route, `<Suspense>`-wrapped like `arena/page.tsx`)
   - Mirrors `ModuleVerify.tsx`/`RapidFireQuiz.tsx`: True/False, 5 questions from `VERIFY_QUESTIONS[moduleId]` (`lib/verify-questions.ts`), 4/5 pass threshold, same `answers: [{id: "${moduleId}-${index}", answer}]` shape the server already validates.
   - On pass: `POST /api/training/save` `{moduleId, verifyPassed: true, answers}` (existing route, existing validation — no route changes needed here beyond Phase 2's `scenario_type` plumbing). Show a "Module Mastered" state with a CTA into `/mobile/arena?moduleId=...`.
   - On fail: retry state, matching desktop's pattern.
   - Visual style: reuse mobile's existing dark-mode card/pill/progress-bar language (as seen throughout `app/mobile/_components/*`), not desktop's `.quiz-*` CSS classes (they don't exist in mobile's stylesheet).

7. **`app/mobile/_components/ScenarioPracticeScreen.tsx`** (new) + `app/mobile/scenario-practice/page.tsx` (new route, `<Suspense>`-wrapped)
   - Mirrors `DashboardTrainer.tsx`/`ScenarioPractice.tsx`: scenario prompt + 3 quick-fill pills that populate a free-text textarea (not a pick-2/pick-3 selector — confirmed this is desktop's real UX), imported directly from `trainer-data.ts::SCENARIOS[module][index]`.
   - Submit: `POST /api/evaluate` `{scenario, userResponse}` (existing route, unchanged) → then `POST /api/training/save` `{module, overallScore, scenarioIndex: index, confidence: "medium"}` (hardcode confidence, matching Arena's own existing pattern — no new confidence-picker UI).
   - Show the 5-dimension score breakdown + strengths/improvement text (reuse `SCORE_DIMENSIONS` from `trainer-data.ts`), "Next scenario →" control.

8. **Rewire `LearnHubScreen.tsx`** — `handleModuleClick()` (~113-122): drop the `ARENA_SEED_SCENARIOS` routing, push to `/mobile/quiz?moduleId=...&moduleTitle=...` instead. Locked-card `/pricing` redirect unchanged.

9. **Rewire `ScenarioTrainingScreen.tsx`** — drop the fake 6-module-slice grid (~90-106) entirely. Replace with 3 real category cards (Bartending 10 / Sales 10 / Management 20), gated: bartending/sales lock to `/pricing` on free tier (matches existing binary tier gate in `lib/session.ts`); management additionally requires `autoUnlockManagement` (add this field to `TrainingProgress` type in `app/mobile/_lib/use-training-progress.ts` — API already returns it, just isn't typed/exposed yet), showing "Manager/Supervisor role required" rather than a pricing redirect when a paid user lacks the role. Unlocked card → `/mobile/scenario-practice?module=...&index=0`. The existing "Wine Cork Complaint" Arena banner stays — it correctly links into Arena already.

### Phase 4 — Category-rollup mastery fix

10. **`app/api/training/progress/route.ts`** — replace the broken `mastery: {bartending, sales, management}` field (currently `LEGACY_MODULES.map(getMasteryProgress)` — per-legacy-module-id, not a category rollup at all) with the real category-average formula desktop already uses 3x independently (`ProgressOverview.tsx::catAvg()`, `PreShiftHome.tsx::getCategoryMastery()`, `BadgesView.tsx`): average `moduleProgress[m.id].mastery` across all modules where `category === "technical"|"service"|"compliance"`, remapped to `bartending/sales/management` labels. Worth extracting into one shared helper in `lib/mastery.ts` while touching this (currently duplicated 3x on desktop alone) — not required for the fix, but avoids a 4th copy.
   - Side effect (intended, call out in the deploy notes): this field also feeds `BadgesGalleryScreen.tsx`/`ProgressScreen.tsx` (mobile) and `MobileDashboardV3.tsx` (desktop mobile-dashboard view)'s badge computation — those will start computing correct badge unlocks instead of wrong ones.

### Phase 5 — Review queue labels (depends on Phase 2 + 3)

11. **`app/mobile/_components/ProgressScreen.tsx`** ("Up Next For Review", ~line 294) — replace the incomplete `LEGACY_MODULE_LABELS` fallback with a real title lookup: parse the numeric module id out of `module_N` (or reverse-map the 3 legacy strings to ids 1/2/3), look up the real title in `data.allModules`. Once `scenario_type` (Phase 2) is available, branch the suffix: `"{title} · Quiz review"` / `"{title} · Scenario N of {total}"` (descriptor) / `"{title} · Live Scenario review"` (roleplay) — instead of the current meaningless "· Scenario 1" on every row.

### Phase 6 — Streak fixes

12. **`app/mobile/_components/HomeScreen.tsx`** — replace the `bestCorrectStreak`-labeled-as-streak display (~line 123) with a real read of `localStorage["sbe-streak-count"]` (same key/pattern as `BadgesGalleryScreen.tsx::readStreakCount()`), in a mount effect (SSR-safe, same hydration-guard pattern as `MatchPairsScreen.tsx`).
13. **Add increment logic to mobile** (per your decision) — mirror desktop's `PreShiftHome.tsx::computeStreak()` logic (increment-on-daily-visit) somewhere shared across mobile, most likely `app/mobile/layout.tsx` or a small shared hook, so it runs once per mobile session and stays consistent with desktop's own increment semantics (don't double-increment if a user opens both surfaces same day — check desktop's own dedupe-by-date logic and reuse it exactly).

### Phase 7 — AI Photo: cost-minimization + resilience hardening (`FAL_KEY` reconfirmed live 2026-08-20)

**Architecture note — do not create `functions/api/generate-image.ts`.** This repo does not use raw Cloudflare Pages Functions (no `/functions` directory anywhere in the tree). It deploys via OpenNext, which compiles the whole Next.js App Router — including every `app/api/**/route.ts` — into one Cloudflare Worker. A parallel `/functions` directory would not be reachable through the OpenNext build and would fork the routing model the rest of the codebase relies on. The existing route, `app/api/profile-photo/generate/route.ts`, already **is** "route through a server function, key stays server-side, browser never touches Fal.ai" — same requirement, this repo's actual mechanism. This phase tightens that file to fully match the 5 backend + 3 frontend requirements below, it does not replace it.

Requirement-by-requirement status against the current file (already read in full):

| # | Requirement | Current state | Action |
|---|---|---|---|
| B1 | Never call Fal.ai from client | ✅ Already true — client only ever calls `/api/profile-photo/generate`. | None. |
| B2 | Key via `env.FAL_KEY` server-side only | ✅ Already true — `fal.config({ credentials: process.env.FAL_KEY })`, never sent to client. | None. |
| B3 | Default `flux/schnell`, only use `dev`/`dev/image-to-image` on an explicit flag | ✅ Mostly true — `selfieImage` presence is that flag for image-to-image. ❌ Missing: no explicit high-quality flag for a *text-to-image* dev tier. | Add optional `highQuality: boolean` — `false`/absent stays on `schnell`; only flips model when true. |
| B4 | Restrict resolution to 768×768 / 512×512 | ❌ Currently `image_size: "square_hd"` = 1024×1024 (Fal's most expensive text-to-image tier). | Replace with explicit `{ width: 512, height: 512 }` default, `{ width: 768, height: 768 }` only when `highQuality` is true. |
| B5 | Clear 400/429/500s, no leaked env vars | ✅ Already true — 401 (unauthenticated), 400 (bad style/body/photo), 429 (rate limit ×2), 500 branched by `ApiError`/`ValidationError` with a `detail` field gated to non-production only. | None. |
| F1 | Disable submit + spinner immediately | ✅ Already true — `handleGenerate` sets `isLoading` synchronously; button has `disabled={isLoading}` + overlay spinner. | None. |
| F2 | Trim/validate prompt client-side | ✅ Satisfied by design, not by trimming — there is no free-text prompt field in this UI; the user picks from 10 fixed `styleId`s and the real prompt text lives server-side only (`STYLE_PROMPTS`). Nothing for the client to sanitize without reintroducing a free-text-prompt attack surface the route deliberately avoids (see the route's own header comment). | None — note this as intentionally satisfied, don't add a prompt field. |
| F3 | Cache generated URL in state/localStorage so re-render doesn't re-trigger | ✅ No re-trigger risk exists — generation only ever fires from the button's `onClick`, never from an effect/re-render. ❌ Missing: navigating away from this screen (e.g. back button) and returning loses the generated-but-unsaved preview, forcing a wasted re-generation call. | Add a small `localStorage` draft cache keyed per user so an unsaved preview survives unmount/remount. |

**New finding (2026-08-20) — selfie-guided generation doesn't preserve identity.** User confirmed generation now works end-to-end (`FAL_KEY` fix live) but reported the output face doesn't match the uploaded selfie — wrong hair colour, wrong skin tone/ethnicity. Root cause: `flux/dev/image-to-image`'s `strength: 0.75` controls how far the model is allowed to deviate from the input image (0 = preserve original, 1 = effectively regenerate from scratch; Fal's own default for this model is 0.95, i.e. even *less* preservation than the 0.75 already set here). Combined with a prompt that only describes the *setting* ("Professional bartender headshot in a classic wooden bar...") and never instructs the model to keep the subject's actual features, the model has enough freedom to reinvent the face. This is expected behaviour for raw denoising-strength image-to-image, not a Fal misconfiguration — that technique was never designed to lock facial identity, it just partially blends pixels.

**Decision (user, 2026-08-20): switch the selfie path to `fal-ai/flux-pulid`.** PuLID is purpose-built for this — it preserves facial identity via ID embedding rather than pixel-blend denoising, which is architecturally the correct tool for "same person, restyled into a new setting." Pricing is ~$0.033/megapixel, so at this route's existing 512×512–768×768 targets that's roughly $0.009–$0.02 per generation — in the same cost band as the `flux/dev` tier already gated behind `highQuality`, not a meaningful cost regression.

Implementation notes for whoever builds this:
- PuLID's input is `reference_image_url` (a URL), not an inline `Blob`/`image_url` the way `flux/dev/image-to-image` accepts — the selfie needs to be uploaded to Fal's storage first via `fal.storage.upload()`, an extra call the current code doesn't make. Confirm `fal.storage.upload()` exists with that signature on the installed `@fal-ai/client` version before relying on it.
- **Resolution cap does NOT carry over from the old code — this needs an explicit fix, not an assumption.** The removed `flux/dev/image-to-image` branch got away with no `image_size` param because that model's `strength`-based blending output naturally follows the input image's dimensions. PuLID is architecturally closer to text-to-image (ID-conditioned generation, not pixel-blend img2img) — it almost certainly needs its own explicit size input and will NOT automatically inherit the 768px-downscaled selfie's dimensions. Left unset, this would silently regress Backend Requirement 4 (the 512/768 cap) the same way the old `square_hd` default did. Pass `DEFAULT_IMAGE_SIZE`/`HQ_IMAGE_SIZE` (already defined below) the same way the no-selfie branch does — confirm the exact param name (`image_size` vs `width`/`height` fields) against the installed client's PuLID type def, don't assume it matches `flux/dev`'s shape.
- Exact param names (`id_weight`, `true_cfg`, etc.) must be re-verified against the installed `@fal-ai/client` package's type defs before implementing — same discipline this route's own header comment already documents for the `flux/dev`/`flux/schnell` payloads (field-by-field check against `FluxDevImageToImageInput`/`FluxDevInput`). If the installed client version predates PuLID support (no typed model id for `"fal-ai/flux-pulid"`), that's a package upgrade, not a type-safety workaround — do not silently reach for `any` to force it through, per this project's no-`any` rule.
- Also append an explicit "preserve identity" instruction to the prompt as a cheap belt-and-suspenders measure on top of the model swap.

```ts
// Selfie path — replaces the flux/dev/image-to-image branch below.
// PuLID preserves facial identity via ID embedding instead of raw
// denoising-strength pixel blending, which is why flux/dev/image-to-image
// was free to reinvent the face at strength 0.75.
const uploadedUrl = await fal.storage.upload(
  new Blob([Uint8Array.from(selfie.buffer)], { type: selfie.mime })
);

const result = await fal.subscribe("fal-ai/flux-pulid", {
  input: {
    reference_image_url: uploadedUrl,
    prompt: `${style.prompt}, preserve the exact facial identity, skin tone, and hair color of the reference photo`,
    id_weight: 1.2,  // slightly above the 1.0 default — bias toward likeness over prompt
    true_cfg: 1.5,   // modest prompt adherence without overpowering identity
    // Unlike flux/dev/image-to-image, PuLID does not inherit the reference
    // image's dimensions — must be pinned explicitly or this silently
    // regresses the cost-minimization requirement. Verify the real param
    // name (may not be `image_size`) against the installed client's types.
    image_size: highQuality ? HQ_IMAGE_SIZE : DEFAULT_IMAGE_SIZE,
  },
});
imageUrl = result.data.images?.[0]?.url;
```

This block replaces the `if (body?.selfieImage !== undefined) { ... }` branch's `fal.subscribe("fal-ai/flux/dev/image-to-image", ...)` call shown in the full backend code below — everything else in that branch (the `parseSelfieDataUrl` validation, the 400 on an invalid photo) stays as-is; only the model call changes. Note the selfie branch now also needs `highQuality` in scope, which it already is (declared once, above both branches).

**Backend — `app/api/profile-photo/generate/route.ts`:**

Replace the two constant/logic blocks:

```ts
// Cost-minimization: default to the cheapest square tier; only step up when
// explicitly requested. Fal's "square_hd" (1024x1024) was previously used
// unconditionally for text-to-image — meaningfully pricier per call than
// either of these for a feature whose output is a small circular avatar.
const DEFAULT_IMAGE_SIZE = { width: 512, height: 512 } as const;
const HQ_IMAGE_SIZE = { width: 768, height: 768 } as const;
```

```ts
const styleId = typeof body?.styleId === "string" ? body.styleId : "";
const style = STYLE_PROMPTS.find((s) => s.id === styleId);
if (!style) {
  return NextResponse.json({ error: "Invalid style." }, { status: 400 });
}

// Explicit opt-in only — absent/false always stays on the cheap defaults
// (schnell, 512x512). Mirrors the existing selfieImage-gates-image-to-image
// pattern below: a flag the client must deliberately set, never an implicit
// upgrade.
const highQuality = body?.highQuality === true;

let imageUrl: string | undefined;

if (body?.selfieImage !== undefined) {
  const selfie = parseSelfieDataUrl(body.selfieImage);
  if (!selfie) {
    return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
  }

  // PuLID (not flux/dev/image-to-image — see "New finding" note above):
  // preserves facial identity via ID embedding instead of raw denoising-
  // strength pixel blending, which was letting the model reinvent the
  // subject's face. Unlike the old image-to-image branch, PuLID does NOT
  // inherit the reference image's dimensions (it's closer to text-to-image
  // under the hood) — image_size must be pinned explicitly or this silently
  // regresses the 512/768 cost cap. Verify the real param name against the
  // installed @fal-ai/client's PuLID type def before shipping.
  const uploadedUrl = await fal.storage.upload(
    new Blob([Uint8Array.from(selfie.buffer)], { type: selfie.mime })
  );
  const result = await fal.subscribe("fal-ai/flux-pulid", {
    input: {
      reference_image_url: uploadedUrl,
      prompt: `${style.prompt}, preserve the exact facial identity, skin tone, and hair color of the reference photo`,
      id_weight: 1.2,
      true_cfg: 1.5,
      image_size: highQuality ? HQ_IMAGE_SIZE : DEFAULT_IMAGE_SIZE,
    },
  });
  imageUrl = result.data.images?.[0]?.url;
} else {
  // No selfie: text-to-image. Model only steps up from schnell to dev when
  // highQuality is explicitly true — same cost-tiering requirement 4 needs.
  const result = await fal.subscribe(highQuality ? "fal-ai/flux/dev" : "fal-ai/flux/schnell", {
    input: {
      prompt: style.prompt,
      image_size: highQuality ? HQ_IMAGE_SIZE : DEFAULT_IMAGE_SIZE,
      num_inference_steps: highQuality ? 28 : 4,
    },
  });
  imageUrl = result.data.images?.[0]?.url;
}
```

No changes needed to the 401/400/429/500 branching, the `FAL_KEY`-missing fast-fail, or the `ApiError`/`ValidationError` handling — all already correct per the table above.

**Frontend — `app/mobile/_components/AiProfilePhotoScreen.tsx`:** add a draft cache so a generated-but-unsaved portrait survives navigating away and back, without changing the generate-on-click trigger (already correct, per F1/F3 above). Insert near the top of the component and in `handleGenerate`/`handleSave`:

```ts
// Requirement F3: cache an unsaved generated preview so back-navigation
// doesn't lose it and force a wasted (costed) re-generation call. Keyed
// per-user; cleared once the portrait is actually saved or the user skips.
const DRAFT_KEY = `sbe-ai-portrait-draft:${session.userEmail}`;

// Keep the two useState lines exactly as they are today (PLACEHOLDER_AVATAR /
// null) — do NOT read localStorage in the initializer. This route is SSR'd
// like every other app/mobile screen, and reading localStorage during the
// lazy-init function would make the client's first render diverge from the
// server-rendered HTML (the exact hydration-mismatch class already found
// and fixed in MatchPairsScreen.tsx, file 10's second Implementation Notes
// pass). Load the cached draft in a mount effect instead, same SSR-safe
// pattern already used everywhere else in app/mobile for localStorage reads:
useEffect(() => {
  try {
    const cached = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (cached?.avatarUrl) setAvatarUrl(cached.avatarUrl);
    if (cached?.selfieDataUrl) setSelfieDataUrl(cached.selfieDataUrl);
  } catch {
    // corrupt/unreadable cache — ignore, stays on PLACEHOLDER_AVATAR
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

(Add `useEffect` to the existing `import { useRef, useState } from "react";` line.)

```ts
// At the end of handleGenerate's try block, after setAvatarUrl(data.url):
setAvatarUrl(data.url);
localStorage.setItem(DRAFT_KEY, JSON.stringify({ avatarUrl: data.url, selfieDataUrl }));
```

```ts
// In handleSave, after a successful save response (before router.push):
localStorage.removeItem(DRAFT_KEY);
router.push("/mobile/home");
```

```ts
// The existing "Skip for now" <Link> should also clear a stale draft on click:
<Link
  href="/mobile/home"
  onClick={() => localStorage.removeItem(DRAFT_KEY)}
  ...
```

This is a plain-object cache (`{avatarUrl, selfieDataUrl}` strings only) — no functions, no Blob/File objects — so it round-trips through `JSON.stringify`/`localStorage` safely. Because the draft is applied via a mount effect rather than a lazy initializer, the server-rendered and first-client-rendered HTML both show `PLACEHOLDER_AVATAR`/no selfie, and the cached draft swaps in immediately after — same SSR-safe shape as every other `localStorage` read already audited clean in `app/mobile` (file 10's Implementation Notes).

---

## Explicitly confirmed correct, no change needed
- "Continue Learning → Learn Hub" routing — already correct, matches intent.
- Knowledge Base / Cocktail Library — confirmed clean by user, not touched.
- All 4 non-Match-Pairs challenge games — confirmed clean by user, not touched.

## Critical files
`app/mobile/_components/LearnHubScreen.tsx`, `ScenarioTrainingScreen.tsx`, `HomeScreen.tsx`, `ProgressScreen.tsx`, `MatchPairsScreen.tsx`, `ChallengesScreen.tsx`, `AiProfilePhotoScreen.tsx` · `app/mobile/_lib/use-training-progress.ts` · `app/globals.css` (Phase 1 zoom fix, line 303) · `lib/mastery.ts` · `lib/verify-questions.ts` · `app/dashboard/_components/trainer/trainer-data.ts` · `app/api/training/progress/route.ts` · `app/api/training/save/route.ts` · `app/api/arena/evaluate/route.ts` · `app/api/profile-photo/generate/route.ts` · new: `app/mobile/_components/QuizScreen.tsx`, `ScenarioPracticeScreen.tsx`, `app/mobile/quiz/page.tsx`, `app/mobile/scenario-practice/page.tsx`, `supabase/migrations/20260820_scenario_mastery_scenario_type.sql`.

## Verification
- After every phase: `npx tsc --noEmit`, `npm run lint`, full `npx next build` — zero errors/warnings, same standard as every prior session.
- Migration (Phase 2): apply via Supabase MCP or CLI against a branch/staging first if available; confirm row counts before/after backfill match expectations; spot-check a real account's modules 1-3 state post-backfill.
- Phase 1 zoom fix: on a real device, pinch to zoom in, then pinch back out — confirm it responds. Confirm double-tap doesn't re-trigger browser zoom (the `manipulation` value should still suppress that). Note in the deploy message that zoom persisting across in-app navigation (not resetting to 1x on route change) is a separate, known browser quirk — only worth the extra JS workaround if it's still bothering the user after this fix.
- Phase 7: manually generate once with no selfie (confirm `schnell` + 512×512, cheapest path), and once with a selfie (confirm `flux-pulid` + `fal.storage.upload` path — check both that the *output face actually resembles the uploaded selfie's hair colour/skin tone*, and that the returned image is actually 512×512/768×768, not some larger PuLID default — this is the one place the resolution cap isn't inherited automatically, see the implementation note above), and — if a `highQuality` control is ever added to the UI later — once with that flag (confirm `dev` + 768×768). Confirm a generated-but-unsaved preview survives a back-navigation + return via the draft cache, and that Save/Skip both clear it (no stale draft reappearing for a different session on a shared device).
- Manual device pass after deploy: full checklist item #6 in the "what YOU need to check" table above, covering all Phase 1/3/4/5/6/7 items live.
- Update `v4-migration-plan/*.md` Implementation Notes + `Z-Summary-Day-1-3.md` diary per the established append-only pattern, same as every prior session.
- Do not commit/push until explicitly told to, per standing project convention.
