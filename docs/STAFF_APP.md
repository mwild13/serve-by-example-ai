# Staff App — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers `app/dashboard/_components/` (the core training loop/simulator on desktop) and the standalone `app/mobile/` route tree.

## 1. Scope — Learning Engine Structure

The staff training platform has a **3-stage mastery path** plus AI-powered extras, all routed through `app/dashboard/_components/DashboardShell.tsx`:

| Nav ID | Label | Component | Description |
|--------|-------|-----------|-------------|
| `home` | Home | `PreShiftHome.tsx` | Daily dashboard with recommendations |
| `module` | Modules | `DynamicModuleNav.tsx` + `ModuleVerify.tsx` | 40 modules across Bartending, Sales, Management |
| `rapid-fire` | — | `RapidFirePage.tsx` | Internal sub-nav from Modules; rapid quiz mode |
| `stage4` | Scenario Training | `DashboardTrainer.tsx` | Written scenario practice (routed in `DashboardShell.tsx:816-821`; `DiagnosticFlow.tsx` is only the first-login onboarding modal, not this nav destination) |
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

The desktop quiz (`ModuleVerify.tsx` → `RapidFireQuiz.tsx`) and the mobile one (`app/mobile/_components/QuizScreen.tsx`) are graded **on the server, one answer at a time**: `/api/training/verify/start` returns prompts only, `/api/training/verify/answer` grades each answer and keeps the streak. 5 correct in a row masters the module. The answer key (`lib/verify-questions.ts`) is `server-only` — importing it into a client component fails the build. `/api/training/save` is retired (410). Details in `docs/MASTERY_ENGINE.md`.

## 5. PWA / Offline

**Confirmed greenfield — no PWA/offline infrastructure exists today.** A full-repo search for `manifest.json`, `next-pwa`, `serviceWorker`, `workbox`, `sw.js`, and `<link rel="manifest">` in source files returns zero matches outside auto-generated Next.js/OpenNext build artifacts (`.next/`, `.open-next/`), which are not app-authored and don't count. There is no service worker registration anywhere in `app/` source. State this as a definitive current-state fact — this doc round is recording reality, not proposing to add PWA support.

## Known Gaps / Drift

- **AI Arena has no chat history** (§3) — guard against assuming streaming or multi-turn conversation when extending it.
- **PWA is greenfield** (§5).

## Related Docs

- `MOBILE_BUILD.md` — full architecture reference for the standalone `app/mobile/` build (V4): route map, auth/session/progress data layer, offline retry queue, dark-theme design tokens
- `CHALLENGES.md` — one-stop reference for the "Challenges" mini-game feature across both surfaces (desktop and the mobile build), including a checklist for adding new challenge types
- `docs/MASTERY_ENGINE.md` — mastery scoring source of truth; this doc only describes how Arena and the quiz call into it, not the formula itself
- `docs/staff-dashboard-a11y-audit.md`, `docs/archive/STAFF_DASHBOARD_AUDIT_REPORT.md` — historical UI/accessibility audits
