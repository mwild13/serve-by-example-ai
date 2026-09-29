# Staff App — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers `app/dashboard/_components/` (the core training loop/simulator, web + embedded mobile) and the standalone `app/mobile/` route tree.

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

**Tier access (`lib/session.ts`)**:
- `free` — no module access
- `pro` — all 40 modules
- `venue_single` — all 40 modules, up to 25 staff
- `venue_multi` — all 40 modules, up to 125 staff (5 venues × 25)
- Staff invited via venue code (`venue_memberships` table) receive sponsored access equivalent to `pro`

**`DashboardShell.tsx`** is the main authenticated staff UI — a client component managing `NavItem` state and rendering the correct view. To add a new learning view: add a string literal to `type NavItem` → add an entry to `NAV_ITEMS` → import the component (lazy-load heavy ones with `lazy(() => import(...))`) → add a render case in the conditional chain → add to `PREMIUM_NAV_ITEMS` if it should be gated.

## 2. Mobile-First Rules

**There are two separate mobile systems — do not assume a unified implementation:**

1. **Legacy, embedded**: `Mobile*.tsx` components colocated inside `app/dashboard/_components/` (`MobileDashboardV3.tsx`, `MobileLearnHub.tsx`). Bottom nav shows 4 tabs: **Home, Learn, Scenarios, Me** (`MobileBottomNavBar`, per `DashboardShell.tsx`).
2. **Newer, standalone**: a separate route tree at `app/mobile/_components/` with its own `BottomNav.tsx`, `HomeScreen.tsx`, `SettingsScreen.tsx`, `KnowledgeBaseScreen.tsx`, `CocktailLibraryScreen.tsx`, `progress/AiCoachWidget.tsx`, using `next/link` routing. Bottom nav shows only **3 tabs: Home, Learn, Me** — note it drops "Scenarios" relative to the legacy system.

Before touching "the mobile dashboard," confirm which of these two trees the request is actually about — they have different tab counts, different component names, and are not kept in sync automatically.

**Touch targets**: WCAG 2.5.5 (44×44px minimum) is the intended standard for staff-facing UI, but it's enforced **ad hoc via inline styles per element** — e.g. `MobileDashboardV3.tsx` sets `minHeight: 44, minWidth: 44` directly on a close button. There is no shared `--touch-target` CSS variable or helper; when adding a new tappable element, add the inline minimum yourself rather than assuming a global rule catches it.

**Safe-area handling**: real and widespread. `env(safe-area-inset-bottom, 0px)` appears throughout `app/globals.css` and across both mobile trees (`MobileDashboardV3.tsx`, `CocktailLibrary.tsx`, and nearly every file under `app/mobile/_components/`). No `viewport-fit=cover` meta tag was confirmed present in `app/layout.tsx` — check there before relying on safe-area insets actually being active in a given build.

**`docs/MOBILE_VIEW.md` predates the `app/mobile/_components/` tree** — it only documents `MobileDashboardV3.tsx` in detail. Treat it as a legacy/partial reference; this doc (`STAFF_APP.md`) is the current combined reference across both systems. Don't edit or delete `MOBILE_VIEW.md` as part of using this doc.

## 3. AI Simulator (Arena) State

**Not streaming, not multi-turn — a common wrong assumption to guard against.**

- `app/api/arena/evaluate/route.ts` calls `openai.chat.completions.create()` with **no `stream: true`**. It awaits the full completion, parses `completion.choices[0].message.content` as one JSON blob, and returns a single `Response.json({ assessment: {...} })`.
- 25-second `AbortController` timeout, unrelated to streaming.
- System prompt instructs the model to return `{score, what_you_did_well, room_for_improvement, passed}`. `PASS_THRESHOLD = 75` (0–100 scale).
- After scoring, writes through the canonical path: `recordAttempt()` (normalizing the 0–100 score to the mastery engine's 0–25 scale) then `syncMasteryToVenueStaff()` — both from `lib/mastery.ts`. See `docs/MASTERY_ENGINE.md`, don't re-derive the mastery formula here.
- **No chat history or message array exists anywhere in this flow.** `ArenaPage.tsx` state is just `phase`, `selectedId`, `response` (the textarea text), `result`, `error`, `arenaProgress` — there is no transcript. Each scenario attempt is one isolated, one-shot, scored write-up submitted via a single `fetch("/api/arena/evaluate", {...})` — it is not a multi-turn roleplay conversation, and there is no conversational context carried between attempts.
- `arenaProgress` (attempts/bestScore/passed per module) loads once from `/api/training/progress` on mount and is updated in local memory after each submit — persistence itself happens server-side via `recordAttempt()`, not by re-fetching.

## 4. PWA / Offline

**Confirmed greenfield — no PWA/offline infrastructure exists today.** A full-repo search for `manifest.json`, `next-pwa`, `serviceWorker`, `workbox`, `sw.js`, and `<link rel="manifest">` in source files returns zero matches outside auto-generated Next.js/OpenNext build artifacts (`.next/`, `.open-next/`), which are not app-authored and don't count. There is no service worker registration anywhere in `app/` source. State this as a definitive current-state fact — this doc round is recording reality, not proposing to add PWA support.

## Known Gaps / Drift

- **Two parallel mobile systems** with different tab counts (§2) — the top thing a future agent must not assume is unified.
- **`docs/MOBILE_VIEW.md` is now a partial/legacy reference**, superseded in scope (not deleted) by this doc.
- **AI Arena has no chat history** (§3) — guard against assuming streaming or multi-turn conversation when extending it.
- **PWA is greenfield** (§4).

## Related Docs

- `MOBILE_BUILD.md` — full architecture reference for the newer, standalone `app/mobile/` build (V4): route map, auth/session/progress data layer, offline retry queue, dark-theme design tokens
- `CHALLENGES.md` — one-stop reference for the "Challenges" mini-game feature across all three surfaces (desktop, legacy embedded mobile, new mobile build), including a checklist for adding new challenge types
- `docs/MOBILE_VIEW.md` — legacy mobile-dashboard detail (superseded in scope, not deleted)
- `docs/MASTERY_ENGINE.md` — ELO/mastery scoring source of truth; this doc only describes how Arena calls into it, not the formula itself
- `docs/staff-dashboard-a11y-audit.md`, `docs/STAFF_DASHBOARD_AUDIT_REPORT.md` — historical UI/accessibility audits
