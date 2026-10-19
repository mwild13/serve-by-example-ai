# Staff App — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers `app/dashboard/_components/` (the core training loop/simulator on desktop) and the standalone `app/mobile/` route tree.

## 1. Scope — Learning Engine Structure

The staff training platform has a **3-stage mastery path** plus AI-powered extras, all routed through `app/dashboard/_components/DashboardShell.tsx`:

| Nav ID | Label | Component | Description |
|--------|-------|-----------|-------------|
| `home` | Home | `PreShiftHome.tsx` | Daily dashboard with recommendations |
| `module` | Modules | `DynamicModuleNav.tsx` + `ModuleVerify.tsx` | 40 modules across Bartending, Sales, Management |
| `rapid-fire` | — | `RapidFirePage.tsx` | Internal sub-nav from Modules; lists modules and opens the same quiz (`ModuleVerify.tsx`) |
| `stage4` | Scenario Training | `DashboardTrainer.tsx` | Written scenario practice (routed in `DashboardShell.tsx:816-821`; `DiagnosticFlow.tsx` is only the first-login onboarding modal, not this nav destination) |
| `live-guest` | Live Guest | `LiveGuestPage.tsx` → `components/live-guest/LiveGuest.tsx` | A typed conversation with a guest who talks back (Rich update, Phase 6). Mobile: `/mobile/live-guest`, linked from the Learn hub. See below |
| `scenarios` | AI Arena | `ArenaPage.tsx` | GPT-4o-mini scored roleplay writing exercise — see §3, it is **not** a live chat |
| `challenges` | Challenges | `ChallengesPage.tsx` | 5 tap-based interactive mini-games — see `CHALLENGES.md` for full detail across all surfaces |
| `cocktails` | Cocktail Library | `CocktailLibrary.tsx` | 38-cocktail reference (lazy-loaded) |
| `knowledge` | 101 Knowledge Base | `KnowledgeBase.tsx` | Quick-reference knowledge base (lazy-loaded) |
| `progress` | Me / How I'm improving | `ProgressOverview.tsx` | Personal stats and mastery overview |
| `settings` | Settings | `StaffSettingsPanel` | Profile, security, venue join |

**Premium gating** — `PREMIUM_NAV_ITEMS = ["module", "stage4", "scenarios", "cocktails", "knowledge"]`. Free users see these as locked. `challenges`, `home`, `progress`, and `settings` are always available.

**Tier access (`lib/session.ts`, `TIER_MODULES` / `TIER_SEATS`)**:
- `free` — no module access
- `pro` — all 40 modules (individual, no staff seats)
- `boutique` (legacy value `venue_single`) — all 40 modules, 15 staff seats, 1 venue
- `commercial` (legacy value `venue_multi`) — all 40 modules, 35 staff seats, unlimited venues
- `enterprise` — all 40 modules, unlimited seats (stored as 9999) and venues; sales-assisted only
- **Sponsored staff**: an active `organization_members` row (via an invite or joining with a venue code) gives the staff member module access through their manager's plan. Accounts are linked to roster/membership rows only at sign-in, by exact lowercase email (`lib/staff-link.ts`), and everything afterwards follows `user_id`.

One resolver serves pages and API routes: `resolveTierAccess()`, with `resolveAccess()` delegating to it, so the lapsed-subscription downgrade and the paused-sponsor rule apply everywhere. Venue and seat caps are enforced server-side in `requireManager()` (`docs/MANAGER_CONSOLE.md` §3).

**`DashboardShell.tsx`** is the main authenticated staff UI — a client component managing `NavItem` state and rendering the correct view. To add a new learning view: add a string literal to `type NavItem` → add an entry to `NAV_ITEMS` → import the component (lazy-load heavy ones with `lazy(() => import(...))`) → add a render case in the conditional chain → add to `PREMIUM_NAV_ITEMS` if it should be gated.

## 2. Mobile-First Rules

**There is one mobile system: the standalone route tree at `app/mobile/`** (`BottomNav.tsx`, `HomeScreen.tsx`, `SettingsScreen.tsx` and the rest, using `next/link` routing). Bottom nav has 3 tabs: **Home, Learn, Me**. Full reference: `MOBILE_BUILD.md`.

`middleware.ts` redirects phone user agents from `/dashboard` to `/mobile/home`, or to `/mobile/settings` when the URL carries a `?join=CODE` staff sign-up link, which Settings then submits once on arrival.

The legacy mobile view that used to be embedded in `/dashboard` (`MobileDashboardV3.tsx`, `MobileLearnHub.tsx`, `MobileBottomNavBar`) was removed on 2026-10-09. `/dashboard` is desktop only. In a non-phone window narrower than 720px it reflows to one column with the sidebar as a wrapped nav row on top (`app/globals.css`, the `max-width: 720px` block after `.management-unlock-form`). It does not switch to a different UI.

**Touch targets**: WCAG 2.5.5 (44×44px minimum) is the intended standard for staff-facing UI, but it's enforced **ad hoc via inline styles per element**. There is no shared `--touch-target` CSS variable or helper; when adding a new tappable element, add the inline minimum yourself rather than assuming a global rule catches it.

**Safe-area handling**: real and widespread. `env(safe-area-inset-bottom, 0px)` appears throughout `app/globals.css`, in `CocktailLibrary.tsx`, and in nearly every file under `app/mobile/_components/`. `app/mobile/layout.tsx` sets `viewportFit: "cover"` for the `/mobile` tree; no `viewport-fit=cover` was confirmed in `app/layout.tsx`, so check there before relying on safe-area insets outside `/mobile`.

## 3. AI Simulator (Arena) State

**Not streaming, not multi-turn — a common wrong assumption to guard against.**

- `app/api/arena/evaluate/route.ts` calls `openai.chat.completions.create()` with **no `stream: true`**. It awaits the full completion, parses `completion.choices[0].message.content` as one JSON blob, and returns a single `Response.json({ assessment: {...} })`.
- 25-second `AbortController` timeout, unrelated to streaming.
- System prompt instructs the model to return `{score, what_you_did_well, room_for_improvement, passed}`. `PASS_THRESHOLD = 75` (0–100 scale).
- After scoring, writes through the canonical path: `recordAttempt()` (normalizing the 0–100 score to the mastery engine's 0–25 scale, with Arena's own `passed` flag) then `syncMasteryToVenueStaff()` — both from `lib/mastery.ts`. Each submission carries an `attemptId` (`lib/attempt-id.ts`), so a retry returns the stored assessment instead of grading and recording twice. The route checks the one-device session and the user's plan before calling OpenAI. See `docs/MASTERY_ENGINE.md`, don't re-derive the mastery formula here.
- **No chat history or message array exists anywhere in this flow.** `ArenaPage.tsx` state is just `phase`, `selectedId`, `response` (the textarea text), `result`, `error`, `arenaProgress` — there is no transcript. Each scenario attempt is one isolated, one-shot, scored write-up submitted via a single `fetch("/api/arena/evaluate", {...})` — it is not a multi-turn roleplay conversation, and there is no conversational context carried between attempts.
- `arenaProgress` (attempts/bestScore/passed per module) loads once from `/api/training/progress` on mount and is updated in local memory after each submit — persistence itself happens server-side via `recordAttempt()`, not by re-fetching.

## 4. Verify Quiz (module mastery)

Desktop (`ModuleVerify.tsx`) and mobile (`app/mobile/_components/QuizScreen.tsx`) both render `components/quiz/QuizRun.tsx`, in light and dark themes (`.qz` rules in `app/styles/staff.css`). The server sends one question at a time and grades each answer: `/api/training/verify/start` returns the first question, and `/api/training/verify/answer` grades an answer and returns the next. A run passes on 6 right across 3 question types, and the 3rd miss ends it. The answer key (`lib/question-bank.ts`, `lib/verify-questions.ts`, `lib/questions/`) is `server-only`, so importing it into a client component fails the build. `/api/training/save` is retired (410). Details in `docs/MASTERY_ENGINE.md`. Before the quiz, a module opens on its Learn cards (`components/quiz/LearnCards.tsx`), once the owner has approved them. The cards offer a test-out, a short hard run that masters the module straight away. Until the skill check is done, the mobile Learn hub shows a prompt for it above the modules (`/mobile/onboarding`).

## 5. PWA / Offline

**Confirmed greenfield — no PWA/offline infrastructure exists today.** A full-repo search for `manifest.json`, `next-pwa`, `serviceWorker`, `workbox`, `sw.js`, and `<link rel="manifest">` in source files returns zero matches outside auto-generated Next.js/OpenNext build artifacts (`.next/`, `.open-next/`), which are not app-authored and don't count. There is no service worker registration anywhere in `app/` source. State this as a definitive current-state fact — this doc round is recording reality, not proposing to add PWA support.

## 6. Daily AI Limit

One allowance per account per day, shared by scenario grading, Arena and the AI Coach: 30 requests on the free tier, 300 on a paid one (`lib/ai-usage.ts`). The day turns over at midnight, Sydney time. Kept at these numbers on 2026-10-12 because there was no usage to tune against; `supabase/queries/ai-usage.sql` is the check.

- At the limit a route answers 429 with `code: "AI_DAILY_LIMIT"`, a message that says how long until the reset, `resetsAt` and `upgrade` (true for a free account).
- A screen that calls an AI route reads that body with `readAiDailyLimit()` and holds it with `useAiDailyLimit()` (`lib/use-ai-daily-limit.ts`). While a limit is held it shows `components/AiLimitNotice.tsx` in place of its error line and keeps its submit button disabled, so nobody retries a request that cannot succeed. Any other 429 is the short burst limit and keeps the "try again in a minute" message.
- The per-account limit does not cap the month's bill. The budget set in the OpenAI dashboard does.

## 7. Notification Emails

Two opt-in emails, both off until the person turns them on in Settings > Notifications (desktop or mobile), with a confirm dialog. Sent since 2026-10-17.

| Email | When (Sydney time) | What it says |
|---|---|---|
| Weekly digest (`notif_weekly_digest`) | Monday, 7:00 to 11:59 | Days trained, quiz answers, modules passed and scenarios over the previous Monday to Sunday; modules mastered out of 40; scenarios due for review |
| Sunday reminder (`notif_reminders`) | Sunday, 18:00 to 21:59 | One nudge: reviews due, else the next module, else a quick quiz; days trained in the last week |

- **How it runs:** pg_cron calls `POST /api/cron/notifications` every 15 minutes on Sunday and Monday UTC through pg_net, with `x-cron-secret` from Vault (`notifications_cron_secret`). The route compares it with `NOTIFICATIONS_SECRET`, works out what is due (`lib/notifications/schedule.ts`), claims up to 40 people at a time (`claim_notification_batch()`), sends through Brevo and records the result (`finish_notification_batch()`). A send day is never sent twice; a window missed entirely is skipped, not sent late.
- **Content:** `lib/notifications/emails.ts`, on the shared branded shell. The button opens `/dashboard`, which sends phones on to `/mobile`.
- **Unsubscribe:** every email has a signed link to `/notifications/unsubscribe` (HMAC with `NOTIFICATIONS_SECRET`, no sign-in) and a `List-Unsubscribe` one-click header for Gmail and Apple Mail. Only a POST changes anything, so link scanners can't unsubscribe people. The page is open from any country.
- **Opt-in card:** mobile Home shows `NotificationOptInCard` once, while both emails are off, linking to `/mobile/settings#notifications`. Dismissing or tapping it hides it on that device for good. Nobody is emailed about the feature.
- **Manual run:** the same secret with body `{"force": "weekly_digest"}` or `{"force": "sunday_reminder"}` sends to opted-in people now; `{"dryRun": true}` reports what is due.
- **Capacity:** 40 per call keeps a call under the Workers Free plan's 50 outbound requests; about 700 to 800 per window. Raise `BATCH_SIZE` after buying Workers Paid.
- **Checking a run:** `select status_code, content from net._http_response order by id desc limit 5;` within six hours (pg_net deletes older rows). Every send is kept in `notification_sends`.

## Known Gaps / Drift

- **AI Arena has no chat history** (§3) — guard against assuming streaming or multi-turn conversation when extending it.
- **PWA is greenfield** (§5).

## Related Docs

- `MOBILE_BUILD.md` — full architecture reference for the standalone `app/mobile/` build (V4): route map, auth/session/progress data layer, offline retry queue, dark-theme design tokens
- `CHALLENGES.md` — one-stop reference for the "Challenges" mini-game feature across both surfaces (desktop and the mobile build), including a checklist for adding new challenge types
- `docs/MASTERY_ENGINE.md` — mastery scoring source of truth; this doc only describes how Arena and the quiz call into it, not the formula itself
- `docs/staff-dashboard-a11y-audit.md`, `docs/archive/STAFF_DASHBOARD_AUDIT_REPORT.md` — historical UI/accessibility audits

## Live Guest (Rich update, Phases 6 and 7)

- **What:** pick a guest, talk to them over 3 to 6 typed replies, then see what they were thinking at each turn, how their mood moved, a score and a short debrief, and what they wanted. Desktop nav item `live-guest` and mobile `/mobile/live-guest` both render `components/live-guest/LiveGuest.tsx` (`.lg` rules in `app/styles/staff.css`).
- **Routes:** `GET /api/live-guest/guests` (the picker, without the hidden parts of each brief), `POST /api/live-guest/start` (opens a conversation, no AI call), `POST /api/live-guest/turn` (one staff reply, one AI call with `CHAT_MODEL_PARAMS`, counted against the daily AI allowance).
- **The server keeps the transcript** in `live_guest_sessions`. The browser sends only its next reply and how many replies it has sent, so it can't rewrite the guest or skip a turn, and a resent reply is answered from what's stored.
- **Rules the server enforces** (`parseGuestTurn()` in `lib/live-guest/engine.ts`), whatever the model returns: mood moves up one step per reply at most and down two; no ending before the 3rd reply; always an ending on the 6th; breaking the brief's must-do ends it as a breach, scored 40 at most and never a pass.
- **Access:** for now the same as the guest's module (`resolveAccess().allowedModules`). Plan gating (venue plans only) comes in Phase 8.
- **Recorded** through `recordAttempt()` on the module's roleplay row, like the Arena, so it counts in the service score and the daily training card. See `docs/MASTERY_ENGINE.md`.
- **The four dials (Phase 7):** the guest's mood, plus speed, safety and money when the brief's `stakes` put them in play. Each reply, the model says which way speed and safety moved (one step at most) and which of the brief's money items happened. The dollar figures come only from the brief, each item counts once, and a breach drops safety to the bottom. Shown in the reveal, with what each reply moved. Rules and tests: `lib/live-guest/engine.ts`.
- **Difficulty (Phase 7):** `lib/live-guest/difficulty.ts`. A guest plays patient (1), as written (2) or tough (3), one step up for each of: the module mastered, this guest passed before, 10 or more modules mastered. It's fixed when the conversation starts and stored in `live_guest_sessions.difficulty`. Patient starts one mood better; tough starts one mood worse (never fuming) and the prompt tells the guest to push back once. The picker suggests up to 3 guests within the person's reach (gentle guests for a beginner, the hardest within reach first). The rest show one area at a time (`PublicGuest.area`, from `moduleCategory()`). Every guest stays open.
- **Briefs:** `lib/live-guest/guests.ts`. The person can be a colleague when the scenario is about the team. Only `reviewed: true` briefs are offered. Money items that are alternatives share a `group`, and only the first to happen counts. Plan for all 80 scenarios: `docs/Rich Update/guest-briefs-plan.md`.

