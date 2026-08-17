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
