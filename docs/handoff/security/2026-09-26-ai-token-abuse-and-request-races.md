# Handoff: AI token abuse, request races and score spoofing (Complaint Master, Scenario Training and all OpenAI routes)

- **Date:** 2026-09-26
- **Branch:** `fix/ai-prompt-injection-hardening`, committed and pushed on top of `7f3bf4e` (see "Round 2" for the second pass).
- **Follows:** `2026-09-26-ai-prompt-injection-audit.md` (same day, same branch).
- **Source brief:** two external prompts pasted into the session. "Job 2: Token Bomb & API Abuse" asked what happens with a 50,000-word input, 50 requests a second, or raw HTML/JS, and asked for a validation schema and rate limiting. "Job 3: Streaming State Desync" asked what happens on navigate-away or double-submit mid-stream, and asked for AbortController or lock fixes.

## Round 2: Priority 1 fixes (same day)

A follow-up brief marked three items critical before deploying. All three are done.

### 1. `/api/training/save` score spoofing: fixed

**Before:** Scenario Training was two requests. The browser called `/api/evaluate` to get a score, then POSTed `{ module, overallScore, scenarioIndex }` to `/api/training/save`, which wrote it to mastery and synced it to the manager's `venue_staff` view. Anyone could skip the AI with DevTools and post `overallScore: 25` for every scenario, showing as fully compliant. `/api/evaluate` also accepted any scenario text, so the grade itself could be for an easier question.

**Now:** one request. The browser sends only *which* scenario it answered, plus its answer:

```
POST /api/evaluate { module: "bartending", scenarioIndex: 3, userResponse: "...", confidence: "medium" }
```

1. The server looks the scenario text up in `trainer-data.ts` `SCENARIOS[module][scenarioIndex]`. An unknown module or index gets a 400.
2. It checks the session (`sbe_session_id`, same 401/409 codes as before) **before** calling OpenAI, so a displaced session doesn't cost tokens.
3. It grades the answer, then records the attempt itself via `recordScenarioAttempt()` in the new `lib/training-attempt.ts` (mastery engine, legacy progress, Pro-badge streak, `venue_staff` sync, trial activation). This is the same logic that lived in the save route, moved.
4. It returns the evaluation plus `saved: true` and `mastery`. If recording fails, it still returns the evaluation with `saved: false`.

`/api/training/save` now **only** handles the ModuleVerify quiz (`verifyPassed: true`, answers re-checked on the server). Any other body gets **410** `SCORE_SUBMISSION_REMOVED`.

Also fixed along the way:
- **Duplicate quiz answers counted as separate correct answers.** Sending one correct answer 4 times passed the 4-of-8 quiz and marked the module mastered. Each question now counts once.
- **Dropped a dead spoof path.** The save route's `stageLevel` + `completed: true` branch (writes `user_level_progress` and `level4_unlocked`) wasn't sent by any client, but a direct POST could unlock level 4. It wasn't carried over.
- **Clients:** `DashboardTrainer.tsx` and mobile `ScenarioPracticeScreen.tsx` no longer call `/api/training/save`. Mobile's "didn't save, Retry" button now re-submits the answer, so it's graded and recorded again, instead of re-posting a score.
- Arena was already safe (it records inside `/api/arena/evaluate`, fixed in the earlier handoff).

**Kept on purpose:** free-tier users (`TIER_MODULES.free = []`) could already get graded before; only their save was refused with a 403. That's unchanged: they're graded, nothing is recorded, and the response is `saved: false, saveCode: "MODULE_ACCESS_DENIED"`. See "Needs your review".

### 2. Fake Complaint Master email form: removed

The "Email me my score summary" form and its fake 600 ms "sending" state are gone, along with their now-unused CSS (`.cm-email-*`, `.cm-complete-email`, `.roi-email-*`, which that form was the only user of). If it comes back, `app/api/roi/email/route.ts` is an existing email-capture route to model it on.

### 3. Dead route: deleted

`app/api/demo/generate-drills/route.ts` had no caller anywhere (app, components, config, public files). Deleted.

### Round 2 verification

- `tsc --noEmit`, ESLint across `app lib components`, and `next build`: all clean.
- **Not tested locally:** the signed-in evaluate-and-record flow, because there are no Supabase or OpenAI env vars locally. This is the main thing to smoke test on preview (see "Next steps").

## Reality check first

Both briefs assume a **streaming chat**. Neither exists in this codebase.

- **Complaint Master** (`app/demo/complaint-master/page.tsx`) is a 3-step form. Each step makes one `fetch` to `/api/demo/evaluate` and gets one JSON result back. There is no chat history or multi-turn state.
- **Nothing in the repo streams.** There's no `stream: true`, `ReadableStream` consumer or SSE anywhere.

So "stream desync" became "in-flight request desync", which is the same class of bug with a smaller blast radius. The token-bomb audit was widened to **every** OpenAI route, because the worst holes weren't in Complaint Master.

## Job 2 findings: what an attacker could do before this change

| Attack | Before | Now |
|---|---|---|
| **50,000-word body** to `/api/demo/evaluate` | `req.json()` buffered and parsed the whole body (~250 KB, or any size up to Cloudflare's 100 MB request cap) before the 3,000-char check rejected it. No LLM cost, but memory and CPU in a 128 MB isolate. An isolate crash also wipes the in-memory rate limiter. | `readJsonBody` rejects on `Content-Length` > 16 KB with no read, and counts bytes while streaming for chunked or lying bodies: **413**. |
| **Custom "scenario" text** (anonymous) | The demo route accepted any `scenario` up to 1,500 chars, so an anonymous caller chose the whole task. | The route takes a `scenarioId` and looks the text up in `lib/demo-scenarios.ts`. Unknown id: **400**. The body's `scenario` field is ignored. |
| **50 req/s from one IP** | 5/min per IP, in memory per isolate. | Same per-IP limit, plus a 60/min **global** breaker per isolate on `/api/demo/evaluate`. Limits run *before* the body is read, so a flood costs almost nothing. Tested: 50 parallel requests gave 5 × 400 and 45 × 429. |
| **Many IPs / botnet** | No ceiling at all. | The per-isolate global breaker helps, but **the real ceiling has to be set in dashboards** (see "Needs your action"). |
| **Raw HTML/JS input** | Not an XSS risk: React escapes all rendered text, and no AI output goes through `dangerouslySetInnerHTML` (only static JSON-LD does). The input is only a prompt-injection and token cost. | Unchanged by design: HTML stays as text and the prompt fences it (earlier handoff). New `cleanUserText` strips invisible characters (see below). |
| **Invisible-character smuggling** | Unicode tag characters (U+E0000-E007F), zero-width and bidi-override characters render as nothing but the model reads them. They hide instructions from human review, and each one costs tokens. | Stripped by `cleanUserText` before the text reaches any prompt. ZWJ/ZWNJ are kept for Indic/Persian scripts. Runs of 4+ spaces and 3+ newlines are collapsed. |
| **Runaway output** | No `max_tokens` on 5 of 6 routes, so a bad reply could bill up to 16k output tokens (JSON-mode whitespace loops are a known failure mode). | `max_tokens` on every route: evaluator 600, arena 400, drills 500, coach 900, translate 12,000. A truncated reply fails JSON parsing and returns a generic 500. |
| **Cross-site "simple" POSTs** | Routes accepted `text/plain`, so any website could make its visitors' browsers call `/api/translate` or the demo with no CORS preflight, spreading our per-IP limits across victims' IPs. | `readJsonBody` requires `application/json` (**415** otherwise), which forces a preflight that our routes don't answer. |

### Worse holes found outside Complaint Master

1. **`/api/translate`: public, no login, effectively unbounded.** It took up to 80 strings with **no per-string length cap** (one request could be ~100k tokens) and no body cap. `targetLanguage` was free text inserted straight into the prompt, and the route **returned the raw model output** on a parse failure. Now: 80 strings × 300 chars max (the only client sends ≤ 60 × 240), `targetLanguage` must match a BCP 47 pattern (`es`, `zh-CN`), 64 KB body cap, JSON mode, `max_tokens`, no `raw`. Tested with 81 items, a 301-char item and a prompt-injection language string: all 400.
2. **`/api/management/coach`: no length cap, no rate limit, and it leaked `error.message`.** A manager account could send a question of any length in a loop. It also sent upstream error text to the browser; locally that leaked "Missing Supabase environment variables…". Now: 2,000-char cap, 20/min per user, body cap, generic error (logged server-side).
3. **`/api/coach`**: already capped at 2,000 chars and rate limited. Added the body cap, `max_tokens`, text cleaning and abort-on-disconnect.
4. **`/api/demo/generate-drills` had no caller anywhere in the app.** It was a public LLM endpoint that nothing used. It was hardened in round 1 and **deleted in round 2**.

### Why not Zod

`zod` is only a transitive dependency here (not in `package.json`), and every route already validates by hand in the same style. I kept that style: `readJsonBody` handles transport (size, type, JSON shape) and each route checks its own fields. If you want Zod project-wide, it's a clean follow-up. The Complaint Master body would be:

```ts
z.object({
  scenarioId: z.enum(["wrong-order", "long-wait", "noisy-neighbours", "bartending", "sales", "management"]),
  userResponse: z.string().trim().min(1).max(3000),
}).strict();
```

Zod still wouldn't replace `readJsonBody`: a schema only runs after the body has been buffered, and the buffering is the memory problem.

## Job 3 findings: request state races

| Scenario | Before | Now |
|---|---|---|
| **Navigate away mid-request** (both pages) | The fetch kept running, and the server kept paying OpenAI for a response nobody would read. React 18 silently drops the late `setState`, so there was no crash and no real leak, just waste. | An unmount effect aborts the request. The server links `req.signal` to the OpenAI call (`linkAbortSignal`), so a disconnect cancels upstream where the runtime supports it, and the route returns 499 without logging an error. |
| **`/demo`: switch scenario / Skip / Retry / answer pill mid-request** | **Real desync.** None of these were disabled while loading, so scenario A's score landed on screen under scenario B, and `submitCount` bumped the lead-capture pulse for the wrong scenario. | `cancelInFlight()` runs first in each of these handlers. Tested in a browser: Skip during a 3 s delayed response showed no stale result and cleared the spinner. |
| **Double submit** | Complaint Master was only protected by `disabled={loading}`. On `/demo`, **Cmd+Enter in the textarea called `onSubmit` even while the button was disabled**, so holding it sent overlapping requests that raced to set the result. | A ref-based in-flight lock (`inFlight.current`), checked synchronously before any state is set. Tested: 5 extra Cmd+Enters while loading still sent exactly 1 request. |
| **Hung connection** | The spinner could spin forever (the server has a 20 s OpenAI timeout, but a stalled network doesn't). | 30 s client timeout aborts and shows "That took too long. Please try again." |

Pattern used on both pages (identity check, so only the *current* request may touch state):

```ts
const res = await fetch(url, { ..., signal: controller.signal });
const data = await res.json();
if (inFlight.current !== controller) return; // superseded or unmounted
```

If a real streaming chat is ever built, this same shape carries over: abort on unmount and on a new send, and check identity before each chunk is appended.

## Also fixed

- **Complaint Master final screen showed literal `&rsquo;`** ("That&rsquo;s a strong result…"). HTML entities inside JS string literals aren't decoded. Replaced with real apostrophes.

## Files changed

| File | Change |
|---|---|
| `lib/ai-guard.ts` | New `readJsonBody` (content-type, byte cap, streaming count, object-only JSON), `cleanUserText`, `linkAbortSignal`. |
| `lib/demo-scenarios.ts` | New. Complaint Master and `/demo` scenario text plus server-side `getDemoScenario(id)`. Both pages import their display text from here, so what's shown is what's graded. |
| `lib/scenario-evaluator.ts` | `max_tokens` 600, `cleanUserText`, optional abort signal. |
| `app/api/demo/evaluate/route.ts` | Scenario by id, body cap, global breaker, abort-on-disconnect, 499 on client abort. |
| `app/api/evaluate/route.ts` | Body cap, abort-on-disconnect. |
| `app/api/translate/route.ts` | Per-string, count, language and body caps, JSON mode, `max_tokens`, no `raw`, abort-on-disconnect. |
| `app/api/coach/route.ts` | Body cap, `max_tokens`, cleaning, abort-on-disconnect. |
| `app/api/management/coach/route.ts` | Length cap, per-user rate limit, body cap, cleaning, generic error, abort-on-disconnect. |
| `app/api/arena/evaluate/route.ts` | `max_tokens`, cleaning. **No** abort-on-disconnect (it writes mastery, and a phone switching apps shouldn't lose a real attempt) and **no** `readJsonBody` (desktop's `authHeaders()` may not set Content-Type). |
| `app/api/demo/generate-drills/route.ts` | Body cap, `max_tokens`, cleaning, abort-on-disconnect. |
| `app/demo/complaint-master/page.tsx` | Sends `scenarioId`; in-flight lock, unmount abort, timeout; entity fix. |
| `app/demo/page.tsx` | Sends `scenarioId`; in-flight lock, cancel on scenario/answer change, unmount abort, timeout. |
| **Round 2** | |
| `lib/training-attempt.ts` | New. `recordScenarioAttempt` (moved from the save route), `maybeMarkTrialActivated`, `getCookieValue`. |
| `app/api/evaluate/route.ts` | Takes `{ module, scenarioIndex, userResponse, confidence }`; server-side scenario lookup, session check before OpenAI, records the attempt, returns `saved` and `mastery`. |
| `app/api/training/save/route.ts` | Verify-quiz only; score body returns 410; duplicate answers counted once; dead `stageLevel` branch removed. |
| `app/dashboard/_components/DashboardTrainer.tsx` | One call to `/api/evaluate`; mastery feedback read from its response. |
| `app/mobile/_components/ScenarioPracticeScreen.tsx` | Same; Retry re-submits the answer. |
| `app/demo/complaint-master/page.tsx`, `app/globals.css` | Email form and its CSS removed. |
| `app/api/demo/generate-drills/route.ts` | Deleted. |

## Verification done

- `tsc --noEmit` and ESLint on all changed files: clean.
- 14 ad hoc checks of the helpers, all pass: valid body, text/plain → 415, 50k words → 413, chunked 100 KB → 413, lying Content-Length → 413, malformed → 400, array → 400, tag/zero-width/bidi/control stripping, ZWJ kept, whitespace collapse, HTML kept as text, `__proto__`/`constructor` ids rejected, abort linking.
- Live against `next dev`: every row of the Job 2 table above, plus the translate caps.
- Browser (Playwright, API mocked with a 3 s delay): `/demo` double-submit and Skip-mid-request; Complaint Master navigate-away abort.
- **Not tested:** real OpenAI calls, and whether Cloudflare/OpenNext fires `req.signal` on client disconnect. Local has no OpenAI or Supabase env; the browser test used dummy public Supabase values passed on the command line, with no `.env` file read.

## Needs your action (dashboards, no code)

These are the only hard ceilings. Every limit in `lib/rate-limit.ts` is in memory per isolate, so a distributed flood gets roughly (limit × live isolates).

1. **OpenAI → Project → Limits: set a monthly budget and alert threshold.** This is the one control that caps the bill however the app is abused. Consider a separate project/key for the public routes (`demo/*`, `translate`) so a demo flood can't take down staff training.
2. **Cloudflare → Security → WAF → Rate limiting rules:** one rule on `URI Path starts with /api/demo/ OR equals /api/translate`, e.g. 20 requests / 10 s per IP → block for 60 s. This is enforced at the edge across every isolate, before the Worker runs.

## Needs your review

1. **Old open tabs.** A visitor with Complaint Master or `/demo` open from before the deploy still sends `scenario` text, so their next submit gets "Unknown scenario." until they refresh. That's accepted as a one-off, but let me know if you'd rather have a short fallback.
2. **Global breaker size (60/min per isolate on `/api/demo/evaluate`).** It's fine at current traffic. Raise it before a launch or paid campaign that sends a spike to Complaint Master.
3. ~~`/api/demo/generate-drills` has no caller.~~ Deleted in round 2.
4. ~~The Complaint Master email form is fake.~~ Removed in round 2.
5. **`/api/translate` is still a free, anonymous translator** (now bounded to ~24k chars per request, 15/min per IP). If only signed-in or non-English visitors need it, consider gating it.
6. **Old open tabs on Scenario Training.** A tab loaded before the deploy still sends the old `{ scenario, userResponse }` body to `/api/evaluate` and gets "Invalid module." until it's refreshed; its follow-up save call gets 410. That's accepted as a one-off.
7. **Free tier still gets free AI grading on Scenario Training** (behaviour unchanged, now explicit in `/api/evaluate`). If free users shouldn't reach the trainer at all, return 403 there instead of `saved: false`. That's a product call.
8. **The ModuleVerify answer key ships to the browser.** `lib/verify-questions.ts` is imported by `ModuleVerify.tsx` and `QuizScreen.tsx`, and the quiz is 8 True/False questions graded client-side. Anyone can read the answers from the JS bundle and post a passing set, and even random guessing passes 4-of-8 often. That's much weaker than the scenario fix above. The fix is to serve questions without answers and grade on the server; do it on its own branch.

## Next steps

1. Do the two dashboard actions above. They're more important than any code here.
2. On the preview deploy of this branch, smoke test:
   - **Scenario Training (desktop and mobile):** submit an answer, check the score shows, then reload and check progress and mastery went up. Also check a manager account sees it. This is the flow round 2 rewired.
   - **Spoof check:** in DevTools, `POST /api/training/save` with `{"module":"bartending","overallScore":25,"scenarioIndex":0}` should return 410.
   - ModuleVerify quiz (desktop) and mobile Quiz still mark mastery on a pass.
   - Complaint Master to the final screen (no email form), `/demo` all three scenarios, AI coach (staff and manager), Arena, and the language switcher on a marketing page.
3. Server-side grading for the ModuleVerify quiz (review item 9).
4. Optional: move the ad hoc helper checks into a real test runner (Vitest).
