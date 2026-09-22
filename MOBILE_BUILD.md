# Mobile Build (V4) — `app/mobile/`

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. This is the architecture reference for the **new standalone Mobile build** — internally referred to in code comments as "V4" — a separate route tree at `app/mobile/`. It is one of two mobile systems in this codebase; see §1 for how it differs from the legacy embedded one, and `STAFF_APP.md` §2 for the broader staff-app framing of that split.

## 1. What This Is, and What It Isn't

`app/mobile/` is a purpose-built, app-shell-style mobile web experience (native-tab-app feel, not a responsive shrink of the desktop dashboard) — 12+ independent routes under a shared layout, rather than one client-side shell component (`DashboardShell.tsx`) swapping views via state, which is how both other surfaces work.

- **Legacy embedded mobile** (`MobileDashboardV3.tsx`, `MobileLearnHub.tsx` inside `app/dashboard/_components/`): the older mobile UI, still live, rendered as a responsive branch *inside* `DashboardShell.tsx`. 4 bottom-nav tabs (Home, Learn, Scenarios, Me). Do not confuse this with the build documented here.
- **This build** (`app/mobile/`): the newer, standalone route tree. 3 bottom-nav tabs (Home, Learn, Me — "Scenarios" was deliberately folded into "Learn", see §3). This is the build referenced when the user says "the new Mobile build" or "V4."
- Desktop dashboard (`app/dashboard/`) is the third surface, unrelated route tree entirely.

**Routing into this build**: `middleware.ts` auto-redirects phone user agents hitting `/dashboard` to `/mobile/home` (`isMobilePhoneUserAgent()` — narrow match: iPhone/iPod, or Android + "Mobile" token; a tablet-class Android UA falls through to desktop deliberately). A desktop browser can still visit `/mobile/*` directly and isn't blocked.

## 2. Route Map

Every route lives under `app/mobile/<slug>/page.tsx`, and every `page.tsx` follows the same minimal pattern: import a screen component from `_components/`, set `export const metadata`, render the screen. No route does its own data fetching — screens read from shared context (§4).

| Route | Screen component | Purpose |
|---|---|---|
| `/mobile/home` | `HomeScreen.tsx` | Daily dashboard, recommended next step |
| `/mobile/learn` | `LearnHubScreen.tsx` | Orchestrator for 5 sub-sections — see §3 |
| `/mobile/progress` | `ProgressScreen.tsx` | "Me" tab — personal stats/mastery |
| `/mobile/challenges` | `ChallengesScreen.tsx` | Challenges hub — see `CHALLENGES.md` |
| `/mobile/recipe-order`, `/memory-test`, `/match-pairs`, `/menu-audit`, `/speed-round` | 5 individual game screens | The 5 Challenge games — see `CHALLENGES.md` |
| `/mobile/quiz` | `QuizScreen.tsx` | Rapid-fire true/false quiz |
| `/mobile/scenario-practice` | `ScenarioPracticeScreen.tsx` | Written scenario practice |
| `/mobile/arena` | `ArenaScreen.tsx` | AI Arena (GPT-scored roleplay) |
| `/mobile/scenarios` | — | Redirect only, to `/mobile/learn` (old bookmarks) |
| `/mobile/cocktails` | `CocktailLibraryScreen.tsx` | Cocktail reference library |
| `/mobile/knowledge` | `KnowledgeBaseScreen.tsx` | 101 knowledge base |
| `/mobile/badges` | `BadgesGalleryScreen.tsx` | Earned achievement badges |
| `/mobile/onboarding` | `OnboardingDiagnosticScreen.tsx` | Retake placement assessment |
| `/mobile/settings` | `SettingsScreen.tsx` | Profile, security, venue settings |
| `/mobile/ai-photo` | `AiProfilePhotoScreen.tsx` | AI-generated profile photo |
| `/mobile/help` | `HelpScreen.tsx` | Help & FAQ |
| `/mobile/contact` | `ContactSupportScreen.tsx` | Contact support |
| `/mobile/report-bug` | `ReportBugScreen.tsx` | Report a Bug feature |
| `/mobile/privacy`, `/mobile/terms` | `PrivacyScreen.tsx`, `TermsScreen.tsx` (share `LegalProse.tsx`) | Legal pages |

**Bottom nav** (`BottomNav.tsx`) exposes only 3 of these as persistent tabs: **Home** (`/mobile/home`), **Learn** (`/mobile/learn`), **Me** (`/mobile/progress`) — everything else is reached by drilling in from one of those three. `fixed` positioning is opt-in per screen (currently only `HomeScreen` uses it) rather than global, because some screens run taller than the viewport and an always-inline nav would sit below the fold.

## 3. The "3-Tab Consolidation"

A documented architectural decision (2026-08-21, referenced in multiple file headers) worth knowing before restructuring anything: "Scenarios" used to be its own bottom-nav tab, but was judged to be a training *method* (roleplay / descriptor / quiz) rather than a distinct destination from "Learn." It was folded into `LearnHubScreen.tsx` as two of its five sections (`PracticeScenariosSection.tsx`, `CategorySimulationsSection.tsx`), and `/mobile/scenarios` now just redirects to `/mobile/learn` for old links.

`LearnHubScreen.tsx` is accordingly not a simple module grid — it's an orchestrator rendering five sections in a deliberate difficulty progression (per explicit product decision, 2026-08-24 "easy → medium → hard"):
1. `CoreKnowledgeSection.tsx` — the 40-module quiz gate (easiest)
2. `PracticeScenariosSection.tsx` — Live Arena practice
3. `CategorySimulationsSection.tsx` — full-category scenario run (deepest practice mode)
4. `MiniGamesSection.tsx` — Interactive Challenges teaser (first 3 of 5, "+2 more" tile, links to `/mobile/challenges`)
5. `ReferenceLibrarySection.tsx` — Knowledge Base + Cocktail Library (moved here from the old Modules section)

`useTrainingProgress()` is called exactly once at this orchestrator level and prop-drilled into sections that need it, rather than each section independently calling the hook — a deliberate perf choice (see §4).

## 4. Data Layer — Auth, Session, and Progress

This is the area where mobile diverges most from desktop, and where a new screen is most likely to get something subtly wrong by copying desktop patterns.

### Auth gate (`app/mobile/layout.tsx`)
Server component wrapping the whole tree. Mirrors `app/dashboard/page.tsx`'s gate via the shared `resolveTierAccess()` (`lib/session.ts`) so the two entry points can't drift:
1. `createSupabaseServerClient()` → `getUser()` → redirect to `/login` if none.
2. Redirect to `/onboarding` if `profile.onboarding_completed` is falsy.
3. Resolve tier/plan via `resolveTierAccess()`, fetch profile fields (display name, photo, generation caps).
4. Seed `MobileSessionProvider` with a value object (token, tier, allowed modules, venue membership state, etc.) and wrap children in `TrainingProgressProvider`.
5. Sets a locked viewport (`maximumScale: 1, userScalable: false, viewportFit: "cover"`) scoped to this route segment only — deliberately not applied site-wide, since marketing pages need pinch-zoom for WCAG 1.4.4 and this app-shell tree doesn't.

One-device session displacement is enforced in `middleware.ts`, not in this layout — `/mobile` is explicitly included in that gate's path check (`isMobile = path.startsWith("/mobile")`) alongside `/dashboard`, so a displaced session can't browse mobile screens unchecked.

### `useMobileSession()` (`_lib/mobile-session-context.tsx`)
The mobile equivalent of `DashboardShell.tsx`'s `initialToken` prop-threading, as a context instead (necessary because mobile is 12+ independent routes, not one shell component). Exposes:
- `token` — Supabase access token; attach as `Authorization: Bearer <token>` on API calls. **This is the #1 thing that differs from desktop** — desktop's `ChallengesPage.tsx` and friends rely on the ambient session cookie and send no auth header at all. Every mobile fetch to an authenticated API route must carry this header explicitly.
- `tier`, `allowedModules`, `hasVenueMembership`, `venueMembershipPaused` — seeded server-side, static for the session.
- `streakCount` — client-only daily-login streak (`lib/streak.ts`), computed once here (not per-screen) so it increments exactly once per mobile session regardless of landing screen.
- `isOnline`, `pendingSyncCount` — offline/retry-queue state (see below); renders a fixed top banner ("You're offline…" / "Syncing N pending changes…") whenever either is non-default.

### `useTrainingProgress()` (`_lib/use-training-progress.ts` + `_lib/training-progress-context.tsx`)
A **shared, single-fetch-per-session** cache around `GET /api/training/progress` — the same endpoint desktop's `ProgressOverview.tsx` calls directly. This was a deliberate perf fix (Phase 1a): previously every screen (Home, Learn, Progress, Challenges, Badges) independently fetched on its own mount, causing the full round trip to re-run on every navigation — the documented root cause of "Continue Learning" appearing to hang on first login until you navigated away and back.

**The correctness rule that follows from this**: because the fetch is now shared instead of per-mount, *any screen that writes an attempt* (Quiz, Scenario Practice, Arena, the challenge screens via `use-challenge-complete.ts`) **must call `refetch()`** after a successful save, or every other screen keeps showing stale progress. If you add a new mobile screen that writes training data, this is the step most likely to be forgotten.

### Offline resilience — retry queue (`_lib/retry-queue.ts`)
A `localStorage`-backed queue (key `"sbe-retry-queue"`, cap 50 entries), scoped **only** to `POST /api/training/challenges/save`. This scoping is deliberate, not incomplete: that endpoint is a pure upsert on `(user_id, challenge_index)`, so blindly replaying it is a harmless no-op. `training/save`'s `recordAttempt()` (`lib/mastery.ts`) is a read-then-accumulate write (total attempts, cumulative Elo, streaks) — replaying an ambiguous failure there could double-count an attempt, so it deliberately keeps its own direct try/catch-with-retry-button UX instead (`ScenarioPracticeScreen.tsx`, `QuizScreen.tsx`) and is **not** queued.

Flow: a failed/offline challenge save → `enqueueRetry()`. `MobileSessionProvider` listens for `online`/`visibilitychange` events and calls `flushRetryQueue(token)`, which attempts every queued request and keeps only the ones that still fail. `getPendingCount()` seeds the initial banner state on mount without waiting for a flush attempt.

Naming note if you extend this: the queue key uses the house `sbe-` hyphenated convention; the underscore-cased `"sbe_challenges_completed"` localStorage key is a deliberate, documented exception kept for desktop/mobile parity (see `CHALLENGES.md` §4) — don't treat one as a typo of the other or "fix" it to match.

## 5. Design Tokens — Mobile Dark Theme

Mobile uses its own CSS-variable set, defined in `app/globals.css` under "Mobile Staff Dashboard — Dark Mode" (sourced from Figma frames `NEW-MOBILE-STAFF-DASHBOARD`), scoped conceptually to `app/mobile/_components/` — it does **not** replace the site-wide `--green`/`--gold` brand tokens from `CLAUDE.md`, it's a brightened dark-bg variant tuned for contrast against a near-black surface:

```css
--bg-mobile-dark:         #0B0D16;  /* page background */
--surface-mobile:         #171A26;  /* card / panel background */
--surface-mobile-alt:     #202538;  /* progress track, icon-circle fill */
--surface-mobile-inverse: rgba(255,255,255,0.9);
--border-mobile:          #2C3145;
--text-mobile:            #FFFFFF;
--text-mobile-muted:      #8A90A6;
--text-mobile-faint:      rgba(138,144,166,0.3);
--gold-mobile:            #F2AF34;  /* active tab, progress fill, XP-style accents */
--gold-mobile-bg:         #3A280F;
--green-mobile:           #3A7A57;  /* streak stat, positive accents */
--green-mobile-bg:        #1B3B28;
--red-mobile:             #A63B3B;  /* danger/hard-difficulty accent */
--avatar-mobile-bg:       #51566B;
```

**Rule**: when styling anything under `app/mobile/`, use these `--*-mobile` tokens, not the light-theme `--surface`/`--text`/`--line` tokens from the base design system — mixing them produces low-contrast or invisible elements against the dark shell. This is why mobile's `MobileChallengeChrome.tsx` is a separate file from desktop's `ChallengeCard.tsx` rather than a shared/reused component (see `CHALLENGES.md` §3).

Standard container shape used throughout: `maxWidth: 390, margin: "0 auto", minHeight: "100dvh"` (exported as `mobileShellStyle` in `MobileChallengeChrome.tsx` for the challenge screens, replicated inline elsewhere) — this fixed-width-frame approach is what the locked viewport (§4) is protecting.

## 6. Cross-Cutting Notes Carried Over from `STAFF_APP.md`

These apply to this build specifically and are restated here so this doc is self-contained:

- **Touch targets**: WCAG 2.5.5 (44×44px) is the intended standard but enforced **ad hoc via inline styles** per element, not a shared helper/CSS variable. Add the inline minimum yourself on any new tappable element.
- **Safe-area handling**: `env(safe-area-inset-bottom, 0px)` is used throughout this tree (fixed `BottomNav`, challenge screens). `app/mobile/layout.tsx`'s locked viewport sets `viewportFit: "cover"`, which is what makes these insets meaningful here — confirm that's still true before relying on it elsewhere.
- **PWA/offline**: no service worker, manifest, or `next-pwa`/workbox infrastructure exists anywhere in the repo (confirmed via repo-wide search) — the retry queue in §4 is the *only* offline-resilience mechanism in this build, not a general PWA capability. Don't assume install-to-homescreen or background sync exist.
- **`docs/MOBILE_VIEW.md`** documents `MobileDashboardV3.tsx` (the legacy embedded system, §1) and predates this build entirely — don't use it as a reference for `app/mobile/`.

## Related Docs

- `CHALLENGES.md` — full detail on the Challenges feature, which lives primarily on this build.
- `STAFF_APP.md` — parent doc covering the full staff training platform, including the legacy mobile system and the desktop dashboard this build parallels.
- `docs/MASTERY_ENGINE.md` — the Elo/mastery formula behind `useTrainingProgress()`'s data.
- `DATABASE_SCHEMA.md` — table map for `user_challenges`, `scenario_mastery`, and the other tables this build reads/writes.
