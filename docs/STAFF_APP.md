# Staff App — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers `app/dashboard/_components/` (the core training loop/simulator on desktop) and the standalone `app/mobile/` route tree.

## 1. Scope — Learning Engine Structure

The staff training platform has a **3-stage mastery path** plus AI-powered extras, all routed through `app/dashboard/_components/DashboardShell.tsx`:

| Nav ID | Label | Component | Description |
|--------|-------|-----------|-------------|
| `home` | Home | `PreShiftHome.tsx` | Daily dashboard with recommendations |
| `module` | Modules | `DynamicModuleNav.tsx` + `ModuleVerify.tsx` | 40 modules across Bartending, Sales, Management |
| `drill` | Mixed Drill | `DrillPage.tsx` → `components/quiz/MixedDrill.tsx` | Ten questions mixed from every module the person has started (Rich update, Phase 10). Replaced Rapid Fire's module picker; old `?nav=rapid-fire` links open it. Mobile: `/mobile/drill`, linked from the Learn hub. See below |
| `live-guest` | Live Guest | `LiveGuestPage.tsx` → `components/live-guest/LiveGuest.tsx` | A typed conversation with a guest who talks back (Rich update, Phase 6). Mobile: `/mobile/live-guest`, linked from the Learn hub. See below |
| `challenges` | Challenges | `ChallengesPage.tsx` | 5 tap-based interactive mini-games — see `CHALLENGES.md` for full detail across all surfaces |
| `cocktails` | Cocktail Library | `CocktailLibrary.tsx` | 38-cocktail reference (lazy-loaded) |
| `knowledge` | 101 Knowledge Base | `KnowledgeBase.tsx` | Quick-reference knowledge base (lazy-loaded) |
| `progress` | Me / How I'm improving | `ProgressOverview.tsx` | Personal stats and mastery overview |
| `settings` | Settings | `StaffSettingsPanel` | Profile, security, venue join |

**Retired (Rich update, Phase 8):** Scenario Training (`stage4`) and the AI Arena (`scenarios`). Their screens and code are gone; old `?nav=stage4` / `?nav=scenarios` links open Live Guest (`RETIRED_NAV` in `DashboardShell.tsx`), as do mobile `/mobile/arena`, `/mobile/scenario-practice` and `/mobile/scenarios`. `/api/evaluate` and `/api/arena/evaluate` return 410 without an AI call. Their results stay in `training_attempts` and `scenario_mastery`.

**Premium gating** — `PREMIUM_NAV_ITEMS = ["module", "drill", "cocktails", "knowledge"]`. Free users see these as locked. `challenges`, `home`, `progress`, and `settings` are always available. Live Guest is open to everyone in the menu and shows its own upgrade prompt off venue plans (`hasLiveGuest()` in `lib/session.ts`).

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

## 3. AI Simulator (Arena): retired

The AI Arena was a one-shot scored write-up, never a conversation. It was retired in the Rich update, Phase 8, and Live Guest (§ Live Guest below) took its place on the same `roleplay` / 40 mastery row, so earlier passes still count. `/api/arena/evaluate` returns 410.

## 4. Verify Quiz (module mastery)

Desktop (`ModuleVerify.tsx`) and mobile (`app/mobile/_components/QuizScreen.tsx`) both render `components/quiz/QuizRun.tsx`, in light and dark themes (`.qz` rules in `app/styles/staff.css`). The server sends one question at a time and grades each answer: `/api/training/verify/start` returns the first question, and `/api/training/verify/answer` grades an answer and returns the next. A run passes on 6 right across 3 question types, and the 3rd miss ends it. The answer key (`lib/question-bank.ts`, `lib/verify-questions.ts`, `lib/questions/`) is `server-only`, so importing it into a client component fails the build. `/api/training/save` is retired (410). Details in `docs/MASTERY_ENGINE.md`. Before the quiz, a module opens on its Learn cards (`components/quiz/LearnCards.tsx`), once the owner has approved them. The cards offer a test-out, a short hard run that masters the module straight away. Until the skill check is done, the mobile Learn hub shows a prompt for it above the modules (`/mobile/onboarding`).

## 5. PWA / Offline

**Confirmed greenfield — no PWA/offline infrastructure exists today.** A full-repo search for `manifest.json`, `next-pwa`, `serviceWorker`, `workbox`, `sw.js`, and `<link rel="manifest">` in source files returns zero matches outside auto-generated Next.js/OpenNext build artifacts (`.next/`, `.open-next/`), which are not app-authored and don't count. There is no service worker registration anywhere in `app/` source. State this as a definitive current-state fact — this doc round is recording reality, not proposing to add PWA support.

## 6. Daily AI Limit

One allowance per account per day, shared by Live Guest and the AI Coach: 30 requests on the free tier, 300 on a paid one (`lib/ai-usage.ts`). The day turns over at midnight, Sydney time. Kept at these numbers on 2026-10-12 because there was no usage to tune against; `supabase/queries/ai-usage.sql` is the check.

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

- **PWA is greenfield** (§5).

## Related Docs

- `MOBILE_BUILD.md` — full architecture reference for the standalone `app/mobile/` build (V4): route map, auth/session/progress data layer, offline retry queue, dark-theme design tokens
- `CHALLENGES.md` — one-stop reference for the "Challenges" mini-game feature across both surfaces (desktop and the mobile build), including a checklist for adding new challenge types
- `docs/MASTERY_ENGINE.md` — mastery scoring source of truth; this doc only describes how Arena and the quiz call into it, not the formula itself
- `docs/staff-dashboard-a11y-audit.md`, `docs/archive/STAFF_DASHBOARD_AUDIT_REPORT.md` — historical UI/accessibility audits

## Mixed drill (Rich update, Phase 10)

- **What:** ten questions mixed from every module the person has started or mastered, at full difficulty, then a score by module and a link to the one missed most. Practice only: a drill never masters a module or changes mastery. Desktop nav item `drill` and mobile `/mobile/drill` both render `components/quiz/MixedDrill.tsx`, which runs the questions through the module quiz's `QuizRun` (`.dr` rules in `app/styles/staff.css`).
- **Routes:** `POST /api/training/drill/start` (plans the drill, returns the first question), `POST /api/training/drill/answer` (grades one answer with the module quiz's grader, returns the next question or the summary). No AI calls.
- **Rules** (`lib/drill.ts`, tests in `lib/drill.test.ts`): at least 3 modules with questions, at most 5 per drill; questions dealt in turns, never two in a row from one module; no True/False where a module has other questions; one question per fact, hardest variant first; none from the person's previous drill while there are others to ask.
- **Venue content (Phase 11):** questions the person's venue manager has approved (`venue_content_questions`) come in as one more source, filed under module id `0` and titled with the venue's name. They are in every drill while there are any, newest first, one per item, and count as one of the 3 sources a drill needs. Venues are the ones the person is on staff at (`venue_staff.staff_user_id`) plus any they own. An item past its last day or taken down leaves drills; a drill already under way still grades it. The summary has no "Go over" link for venue content.
- **Started modules** come from `quiz_modules_started`, written by a trigger on the first answer in a module quiz, and only modules on the person's plan count. Until 3 are started, the drill says how many are left.

## Pre-shift drill and shift streak (Rich update, Phase 12)

- **Where:** the "Ready for your shift?" card at the top of mobile Home opens `/mobile/drill?mode=preshift`. The Home badge shows the shift streak (the old client-side daily-visit streak, `lib/streak.ts`, is still shown on the Badges screen).
- **The drill:** `POST /api/training/drill/start` with `mode: "preshift"` (`PRESHIFT_DRILL` in `lib/drill.ts`): 6 questions, from as few as one source. The venue's approved content first, then up to 2 mastered modules due for review (`scenario_mastery.next_review_at`, oldest first), then other started modules. With nothing started, the first 3 modules on the plan. Stored as `drill_runs.kind = 'preshift'`.
- **The finish screen:** "You're ready for tonight", the shift streak, the shift days picker, and a link to warm up with one Live Guest. The plan's "one short Live Guest moment" is that link for now, not a conversation inside the drill, so the drill stays free of AI calls.
- **The shift streak** (`lib/shift-streak.ts`, tests in `lib/shift-streak.test.ts`): shifts in a row with a finished pre-shift drill. Staff pick the weekdays they work (`shift_schedules`; none picked means every day). Days off never count. A missed shift uses one of 2 freezes, and one freeze covers every shift missed in the 7 days from the first miss, so a missed week costs one freeze. Five shifts kept in a row earn a freeze back. Today never counts as missed. Finished drills are kept per Sydney day in `preshift_days`. `GET/PUT /api/training/shift-streak` reads the streak and saves the days.
- **Reminders (part 2):** "When should we remind you?" on the pre-shift finish screen (`ShiftReminder` in `components/quiz/ShiftDays.tsx`): a time on shift days, saved with `PUT /api/training/shift-streak` (`reminderTime`). Turning it on registers `public/sw.js`, asks for notification permission and saves the browser's subscription (`lib/push-client.ts`, `/api/push/subscription`). On iPhone it first asks for the app to be added to the Home Screen, since Safari only allows push for installed apps. `/api/cron/reminders` (pg_cron every 15 minutes, every day) sends one empty push to each person due: their time came in the last hour, it's a shift day, they haven't had one today and haven't done today's drill (`dueReminders()` in `lib/web-push.ts`). The service worker shows a fixed "Ready for your shift?" and opens the pre-shift drill. Pushes are only sent to the known push services. Needs `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_JWK` in Cloudflare (`scripts/vapid-keys.mjs`); without them nothing is sent.

## Live Guest (Rich update, Phases 6, 7 and 14)

- **What:** pick a guest, talk to them over 3 or 4 typed replies, then see what they were thinking at each turn, how their mood moved, a score and a short debrief, what they wanted, and which of the things that help (the brief's calms) the staff member found, ticked off. Each reply's guest line gives an opening for one calm not yet found, and never repeats a point. A stranger shows as "Guest" until they say their name (`knownByName` on a brief marks colleagues and the like, known from the start), so asking for a name is the staff member's job. Desktop nav item `live-guest` and mobile `/mobile/live-guest` both render `components/live-guest/LiveGuest.tsx` (`.lg` rules in `app/styles/staff.css`).
- **Routes:** `GET /api/live-guest/guests` (the picker, without the hidden parts of each brief), `POST /api/live-guest/start` (opens a conversation, no AI call), `POST /api/live-guest/turn` (one staff reply, one AI call with `CHAT_MODEL_PARAMS`, counted against the daily AI allowance).
- **The server keeps the transcript** in `live_guest_sessions`. The browser sends only its next reply and how many replies it has sent, so it can't rewrite the guest or skip a turn, and a resent reply is answered from what's stored.
- **Rules the server enforces** (`parseGuestTurn()` in `lib/live-guest/engine.ts`), whatever the model returns: mood moves up one step per reply at most and down two; no ending before the 3rd reply; always an ending on the 4th; a reply that did a new calm and nothing from sets_off can't lower the mood, and the reverse can't raise it; breaking the brief's must-do ends it as a breach, scored 40 at most and never a pass.
- **Access (Phase 8):** venue plans only: Boutique, Commercial, Enterprise, venue trials and sponsored staff (`hasLiveGuest()` in `lib/session.ts`), checked by `/start` and `/turn`. `GET /guests` returns `onPlan`; off a venue plan the picker shows the guests with an upgrade prompt, and the menu item stays open. Within a plan, the guest's module must be in `allowedModules`.
- **Recorded** through `recordAttempt()` on the module's roleplay row, like the Arena, so it counts in the service score and the daily training card. See `docs/MASTERY_ENGINE.md`.
- **The four dials (Phase 7):** the guest's mood, plus speed, safety and money when the brief's `stakes` put them in play. Each reply, the model says which way speed and safety moved (one step at most) and which of the brief's money items happened. The dollar figures come only from the brief, each item counts once, and a breach drops safety to the bottom. Shown in the reveal, with what each reply moved. Rules and tests: `lib/live-guest/engine.ts`.
- **Difficulty (Phase 7):** `lib/live-guest/difficulty.ts`. A guest plays patient (1), as written (2) or tough (3), one step up for each of: the module mastered, this guest passed before, 10 or more modules mastered. It's fixed when the conversation starts and stored in `live_guest_sessions.difficulty`. Patient starts one mood better; tough starts one mood worse (never fuming) and the prompt tells the guest to push back once. The picker suggests up to 3 guests within the person's reach (gentle guests for a beginner, the hardest within reach first). The rest show one area at a time (`PublicGuest.area`, from `moduleCategory()`). Every guest stays open.
- **Voice (Phase 14):** push to talk, not a live call. A "Voice" toggle in the conversation header (remembered per device; shown only where the browser can record) reads each guest line aloud and adds a Speak button. Speaking records up to 30 seconds (`lib/voice-recorder.ts`), `POST /api/live-guest/listen` writes it out with `VOICE_MODELS.transcribe` (Australian English, with bar words and the guest's last line as a hint), and the text lands in the reply box to check and send through `/turn` like a typed reply, so a noisy bar never costs a turn. `POST /api/live-guest/speak` reads line n (0 the opening) from the stored conversation, never from the browser, with `VOICE_MODELS.speech`, one voice per guest picked from the brief's pronouns, an Australian accent and the guest's mood at that line. Both routes are in `lib/live-guest/voice-access.ts` (owner, plan or taster, device) and count one clip each against 80 a day (`voice_usage_daily`). Audio is never stored. The conversation is marked `data-no-translate`, so it stays in English while the rest of the page (the debrief, the thoughts) follows the person's language. Needs `microphone=(self)` in `next.config.ts` and `media-src 'self' blob:` in the CSP. Rules and tests: `lib/live-guest/voice.ts`.
- **Briefs:** `lib/live-guest/guests.ts`. The person can be a colleague when the scenario is about the team. Only `reviewed: true` briefs are offered. Money items that are alternatives share a `group`, and only the first to happen counts. Plan for all 80 scenarios: `docs/Rich Update/guest-briefs-plan.md`.

