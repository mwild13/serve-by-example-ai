# 04 — Scenario Training & AI Arena

## Primary Goal & UI Targets

Primary targets: `ScenarioTrainingScreen` (Start Simulation entry point), `ArenaScreen` (the evaluation screen itself). "Done" = Arena is wired to the real single-shot evaluation endpoint, its result is written through the canonical `recordAttempt()` path (not a hand-rolled upsert), and the OpenAI client construction is de-duplicated into one shared factory.

## Diamond Extraction List

**`app/api/arena/evaluate/route.ts`** — `gpt-4o-mini`, `temperature: 0.3`, 25s AbortController timeout, single-shot (no streaming, no message history). System prompt (verbatim):
```
You are an expert Australian Hospitality Assessor.
You will be provided with a Scenario and a Staff Member's Response.

Your task:
- Grade the response on a scale of 0–100 based on Australian RSA, WHS, and high-end service standards.
- A score of 75 or above means the staff member has passed.
- Provide two concise bullet points: one for what they did well, one for room for improvement.

Return ONLY valid JSON in this exact format:
{
  "score": number,
  "what_you_did_well": "string",
  "room_for_improvement": "string",
  "passed": boolean
}

Rules:
- score: 0–100 (75+ = passed)
- what_you_did_well: 1–2 sentences, specific and encouraging
- room_for_improvement: 1–2 sentences, practical coaching note
- passed: true if score >= 75, false otherwise
- no markdown, no text outside the JSON
```
User message: `` `Module: ${title}\n\nScenario:\n${scenario}\n\nStaff Member's Response:\n${response}` ``. Request: `POST { action: "evaluate", moduleId, moduleTitle, scenario, response }`, auth required, `response` capped at 4000 chars. Response: `{ assessment: { score, what_you_did_well, room_for_improvement, passed } }`. Rate limit: `rateLimit(\`arena:user:${user.id}\`, 20)` **and** `rateLimit(\`arena:ip:${ip}\`, 20)` — both must pass, 20/min.

**Locked Decision #2 (from `00`):** this is a single-shot flow — one static scenario string, one typed response, one score. There is no conversational back-and-forth, no message history sent to the model. Wire `ArenaScreen` to this reality; its chat-shell layout displays one exchange, it does not drive a real multi-turn conversation.

**`app/api/evaluate/route.ts`** — the alternative rubric, used for general `ScenarioTrainingScreen`-style scoring (not Arena specifically). `gpt-4o-mini`, `temperature: 0.3`, 20s timeout. System: `"You are a structured hospitality training evaluator. You always return valid JSON only."` User prompt (verbatim):
```
You are an AI hospitality training evaluator for a platform called Serve By Example.

Your job is to assess a staff member's response to a hospitality scenario.

You must evaluate the response using these 5 criteria:
1. Communication
2. Hospitality Behaviour
3. Problem Solving
4. Professionalism
5. Guest Experience

Score each category from 1 to 5.

Scenario:
${scenario}

Staff response:
${userResponse}

Return ONLY valid JSON in this exact format:
{
  "communication": number,
  "hospitalityBehaviour": number,
  "problemSolving": number,
  "professionalism": number,
  "guestExperience": number,
  "overallScore": number,
  "strengths": "string",
  "improvement": "string",
  "improvedResponse": "string"
}

Rules:
- overallScore must equal the sum of the 5 category scores
- strengths must be short and clear
- improvement must be practical and specific
- improvedResponse must sound natural, professional, and suitable for hospitality
- do not include markdown
- do not include explanation outside the JSON
```
5 criteria × 1–5 = 0–25 scale — **this is the scale `recordAttempt()` expects** (`Math.min(overallScore / 25, 1)`), unlike Arena's raw 0–100. Rate limit: `evaluate:user:${user.id}` and `evaluate:ip:${ip}`, 20/min each. Does not itself write to `scenario_mastery` — returns JSON to the caller, which owns the write.

**Canonical OpenAI client pattern (repo-wide, found duplicated 7x):**
```ts
import OpenAI from "openai";
function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
```
Identical in `arena/evaluate`, `evaluate`, `coach`, `management/coach`, `translate`, `demo/evaluate`, `demo/generate-drills`. Model is always `gpt-4o-mini`; temperature varies 0.1–0.5 by task; **no route uses `response_format: { type: "json_object" }`** — JSON compliance is prompt-only plus a manual `try { JSON.parse } catch` guard; no route streams.

## Architecture & Cleanup Plan

- **Fix, don't replicate, the Arena hand-rolled upsert.** `app/api/arena/evaluate/route.ts` currently does its own direct `scenario_mastery.upsert()` (hardcoded `scenario_index = 40`, `mastery_level: passed ? 3 : 1` — a binary shortcut, not the real progression state machine; 0–100 scale mismatched against `recordAttempt()`'s 0–25 expectation) instead of calling the canonical `recordAttempt()`. `CLAUDE.md` already flags this as known duplication not to expand. **This migration should close it**: normalize Arena's 0–100 score to the 0–25 scale (`score / 4`) and route the result through `recordAttempt()` so Arena attempts get the real Elo/streak/spam-guard treatment instead of the shortcut logic.
- **Introduce `lib/openai.ts`.** A single exported `getOpenAIClient()` (or a shared client instance) used by every AI route, replacing the 7x-duplicated local helper. Small, low-risk win, consistent with the project's existing "single source of truth" philosophy.
- Adopt OpenAI **Structured Outputs** (`response_format: { type: "json_schema", strict: true, json_schema: {...} }`, supported by the installed `openai` SDK ^6.29.0) when touching these routes for V4 — stronger than plain `json_object` mode since it enforces the exact field set/types, not just "valid JSON." Every route currently depends on prompt-only JSON compliance with a manual parse-catch fallback; this closes that reliability gap for the cost of defining one schema per route. Not required to ship V4, but low-risk and worth doing while the routes are already being touched.
- **Text model stays `gpt-4o-mini` — do not upgrade for cost reasons.** Checked 2026-08-17: `gpt-4o-mini` has no published sunset date and remains OpenAI's cheapest general-purpose model at ~$0.15/$0.60 per 1M input/output tokens. `gpt-5-mini` exists as a newer option but is *more* expensive on output (~$2/1M vs. $0.60/1M) for eval/scoring tasks that don't need frontier reasoning. Revisit only if `gpt-4o-mini` eval quality becomes an actual problem in practice — not a proactive migration. (This is unrelated to the AI Profile Photo image model in file `08`, which *is* a forced migration due to `gpt-image-1` deprecation.)
- `ScenarioTrainingScreen`'s "Start Simulation" leads into `ArenaScreen`; the 6 category cards on `ScenarioTrainingScreen` stay inert per the Phase B.5 navigation plan (no per-category detail screen exists) — this file only concerns the Arena/evaluate wiring itself, not the category cards' navigation (already handled).

## Step-by-Step Task Checklist

1. Create `lib/openai.ts` exporting a shared client factory; update all 7 AI routes to import from it, removing the duplicated local helpers.
2. In `app/api/arena/evaluate/route.ts`, replace the hand-rolled `scenario_mastery.upsert()` with a call to `recordAttempt()`, normalizing the 0–100 score to 0–25 first.
3. Wire `ArenaScreen`'s composer/Send button to `POST /api/arena/evaluate` with `{ action: "evaluate", moduleId, moduleTitle, scenario, response }`.
4. Render the returned `{ score, what_you_did_well, room_for_improvement, passed }` in the existing Arena UI shell (single exchange, not a live thread).
5. Wire "Start Simulation" on `ScenarioTrainingScreen` to navigate into Arena with the correct scenario payload (cross-check the Phase B.5 nav plan's existing `<Link href="/mobile/arena">` wiring — this file adds the data payload behind it).
6. Manually verify: submit a response, confirm score renders, confirm `elo_rating`/`mastery` update via `recordAttempt()` (not the old upsert path), confirm the 20/min rate limit triggers correctly under repeated calls.

## Implementation Notes (Day 5 — 2026-08-18)

Steps 1–5 done. Step 6 still open (needs a live signed-in pass, same shape as files `01`/`02`'s closing gaps).

- **Built `lib/openai.ts`** — single `getOpenAIClient()` factory (memoized singleton). Updated all 7 routes (`arena/evaluate`, `evaluate`, `coach`, `management/coach`, `translate`, `demo/evaluate`, `demo/generate-drills`) to import it, removing each local duplicate. No behavior change — same `apiKey` source, same per-route model/temperature choices untouched.
- **Closed the Arena hand-rolled upsert.** `app/api/arena/evaluate/route.ts` now calls `recordAttempt()` instead of doing its own `scenario_mastery.upsert()`. Score is normalized `score / 4` (0–100 → 0–25) before the call, matching `recordAttempt()`'s expected scale exactly as file `04`'s spec calls for. `syncMasteryToVenueStaff()` is still called immediately after, same as before. One decision not fully specified by the plan: Arena has no confidence-selection UI (unlike whatever Stage 4 scenario training eventually builds), so `confidence: "medium"` is passed as a neutral default — called out in an inline code comment so it isn't mistaken for a real captured value if a confidence prompt is added to Arena later.
- **`ArenaScreen` rewired**: composer + Send button now POST to `/api/arena/evaluate` with the real payload, show an "Evaluating…" state while in flight, render the real `{score, passed, what_you_did_well, room_for_improvement}` result card, and surface the 429 rate-limit message distinctly from other errors. The previous fake `METRICS` row (Empathy/Knowledge/Resolution percentages with no backing data) was removed rather than left in — same "don't fabricate a data source that doesn't exist" rule file `02` applied to `ProgressScreen`'s old XP stat.
- **`ScenarioTrainingScreen` → `ArenaScreen` payload wiring**: "Start Simulation" now links to `/mobile/arena?moduleId=…&moduleTitle=…&scenario=…` instead of a bare `/mobile/arena`. Module 11 ("Handling Guest Complaints") was picked as the closest real catalog match to the existing "Wine Cork Complaint" scenario copy — there's no scenario-selection backend wired yet (that's the bigger, deferred piece: adopting the orphaned `[moduleId]/scenarios` route per file `03` step 5), so this is a single hardcoded featured scenario carried via query params, not a real scenario browser. `ArenaScreen` falls back to the same copy if opened directly without query params. The 6 category cards remain inert, unchanged, per the existing Phase B.5 decision.
- Added a `Suspense` boundary in `app/mobile/arena/page.tsx` around `ArenaScreen` — required by Next.js because the screen now calls `useSearchParams()`.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile app/api/arena/evaluate/route.ts lib/openai.ts --max-warnings=0`, and a full `npx next build` all pass with zero errors/warnings.
- **Still open:** Step 6 — a real signed-in browser pass: submit an Arena response, confirm the score renders, confirm `elo_rating`/`mastery` actually move in Supabase via `recordAttempt()` (not the old shortcut), and confirm the 20/min rate limit trips under repeated calls. Cannot be done from a static code read.

## Implementation Notes (Day 6 — 2026-08-19) — real per-module Arena entry point

User asked directly for this scoped item after the live-QA round: "A real per-module Arena entry point from Learn (beyond the one featured scenario)." Investigation found this needed far less new work than the earlier "bigger backend piece" flag implied — desktop's `ArenaPage.tsx` already has real situation/context/task content for modules 1–20 (`ARENA_SEED_SCENARIOS`, a private inline const); the gap was never missing content or a missing DB source, only that mobile had no way to reach it per-module.

- **Extracted `lib/arena-scenarios.ts`** — `ARENA_SEED_SCENARIOS` (modules 1–20) and a `formatArenaScenario()` helper moved out of `ArenaPage.tsx` into a shared lib file. `ArenaPage.tsx` now imports from here instead of keeping its own copy — this resolves the Arena-scenario half of CLAUDE.md's "known duplication, do not expand" note (the `trainer-data.ts` Stage-4-descriptor half of that note is untouched, a different scenario type, out of scope here).
- **`ScenarioTrainingScreen.tsx`'s 6 module cards** now link straight into a real Arena run (`/mobile/arena?moduleId=…&moduleTitle=…&scenario=…`) for any module with seed content, instead of always falling back to `/mobile/learn`. Card selection also now prefers modules that have Arena content when picking which 6 of the user's allowed modules to show, so the grid isn't dominated by dead-end cards into modules 21–40 (which still have zero Arena content in V3 — desktop's own picker never covered them either, not a mobile-side gap).
- **Not changed**: the featured "Wine Cork Complaint" banner scenario (still its own hand-written copy, deliberately distinct from `ARENA_SEED_SCENARIOS[11]`); `ArenaScreen.tsx`'s own `DEFAULT_SCENARIO` fallback (same reasoning — it's the featured-banner copy's counterpart, not part of the per-module set).
- **Still out of scope, flagged again rather than silently expanded**: modules 21–40 have no Arena roleplay content at all (in V3 or V4) — writing 20 more situation/context/task scenarios is real content work, not a wiring fix, and wasn't started.
- Verified clean: `npx tsc --noEmit`, `npx eslint app/mobile app/dashboard/_components/ArenaPage.tsx lib/arena-scenarios.ts --max-warnings=0`, full `npx next build` — all pass with zero errors/warnings.

## Implementation Notes (Day 6 — 2026-08-19, continued) — Arena content for modules 21–40

The gap flagged immediately above is now closed. Wrote 20 new `situation`/`context`/`task` scenarios for modules 21–40 directly into `lib/arena-scenarios.ts`, matched one-for-one against the real title/description/category for each module in `lib/module-navigator.ts` (not generic filler — e.g. module 22's "Glass in Well Emergency: The Burn Protocol" gets a scenario about a shattered glass in the ice well, module 32's "The Waiter's Friend: Mechanical Wine Mastery" gets a table-side cork-pull scenario). Same Australian-hospitality voice and situation/context/task shape as 1–20, one scenario per module, no new fields added to `ArenaSeedScenario` (kept to the existing 3-field shape rather than the richer `initialMessage`/`evaluationCriteria` shape floated at scoping time — Arena's actual evaluate flow only ever consumes the formatted 3-field string via `formatArenaScenario()`, so extra fields would have been dead data with nothing to read them).

- `ARENA_SEED_SCENARIOS` now covers all 40 modules (1–40), not just 1–20. The file header comment updated to match — "modules 21–40 have no content" is no longer true and was corrected rather than left stale.
- `ScenarioTrainingScreen.tsx`'s `moduleCards` logic (the `withArena`/`withoutArena` split added in the previous entry) needed no changes — it still runs correctly, `withoutArena` is just always empty now since every catalog module has seed content.
- Desktop `ArenaPage.tsx` picks this content up automatically via its existing import from `lib/arena-scenarios.ts` — no separate desktop-side change needed.
- Verified clean: `npx tsc --noEmit`, `npx eslint lib/arena-scenarios.ts app/mobile app/dashboard/_components/ArenaPage.tsx --max-warnings=0`, full `npx next build` — all pass with zero errors/warnings.
- **Still open**: live verification that a module-21–40 Arena run scores and updates mastery correctly — same standing combined-pass item as every other module range.
