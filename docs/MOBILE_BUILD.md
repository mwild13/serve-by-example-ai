# Mobile Build (V4) — `app/mobile/`

Companion to `CLAUDE.md`, not a replacement: where the two conflict, `CLAUDE.md` wins. This is the architecture reference for the **standalone Mobile build** (called "V4" in code comments), a separate route tree at `app/mobile/`. It is the only mobile staff experience: the legacy view embedded in `/dashboard` was removed on 2026-10-09 (see `STAFF_APP.md` section 2). Last brought up to date 2026-10-22, during the October 2026 redesign (`docs/STAFF_MOBILE_REDESIGN_PLAN.md`; phases 0 and 1 are in).

## 1. What This Is, and What It Isn't

`app/mobile/` is a purpose-built, app-shell-style mobile web experience (native-tab-app feel, not a responsive shrink of the desktop dashboard) — 12+ independent routes under a shared layout, rather than one client-side shell component (`DashboardShell.tsx`) swapping views via state, which is how the desktop dashboard works.

- **This build** (`app/mobile/`): 4 tabs (Home, Learn, Practise, Me). This is the build referenced when the user says "the Mobile build" or "V4."
- **Desktop dashboard** (`app/dashboard/`): the other staff surface, a separate route tree. It has no mobile UI of its own; below 720px it only reflows.

**Routing into this build**: `middleware.ts` auto-redirects phone user agents hitting `/dashboard` to `/mobile/home` (`isMobilePhoneUserAgent()` — narrow match: iPhone/iPod, or Android + "Mobile" token; a tablet-class Android UA falls through to desktop deliberately). A `/dashboard?join=CODE` staff sign-up link is sent to `/mobile/settings` instead, which joins the venue on arrival. A desktop browser can still visit `/mobile/*` directly and isn't blocked.

## 2. Route Map

Every route lives under `app/mobile/<slug>/page.tsx`, and every `page.tsx` follows the same minimal pattern: import a screen component from `_components/`, set `export const metadata`, render the screen. No route does its own data fetching — screens read from shared context (§4).

| Route | Screen component | Purpose |
|---|---|---|
| `/mobile/home` | `HomeScreen.tsx` | The feed: the next step on a stack card, this week at the venue (`home/VenueWeek.tsx`), keep going, tonight's cocktails, look it up, a fact. See section 3a |
| `/mobile/practise` | `PractiseScreen.tsx` | The Practise tab: the mixed drill, Live Guest, Saturday Rush, the challenges |
| `/mobile/learn` | `LearnHubScreen.tsx` | The Learn hub, see section 3 |
| `/mobile/progress` | `ProgressScreen.tsx` | "Me" tab: personal stats and mastery |
| `/mobile/quiz` | `QuizScreen.tsx` | A module's Learn cards and verify quiz |
| `/mobile/drill` | `DrillScreen.tsx` | Mixed drill; `?mode=preshift` is the pre-shift drill |
| `/mobile/live-guest` | `LiveGuestScreen.tsx` | Live Guest conversations (`components/live-guest/`) |
| `/mobile/rush` | `RushScreen.tsx` | Saturday Rush (`components/rush/`) |
| `/mobile/challenges` | `ChallengesScreen.tsx` | All ten Challenges, see `CHALLENGES.md` |
| `/mobile/recipe-order`, `/memory-test`, `/match-pairs`, `/menu-audit`, `/speed-round` | Their own screens | Challenges 1 to 5 |
| `/mobile/challenge/<slug>` | `ChallengeScreen.tsx` | Challenges 6 onwards, on the shared game |
| `/mobile/cocktails` | `CocktailLibraryScreen.tsx` | Cocktail library |
| `/mobile/knowledge` | `KnowledgeBaseScreen.tsx` | Knowledge Base, 101 cards |
| `/mobile/badges` | `BadgesGalleryScreen.tsx` | Badges |
| `/mobile/onboarding` | `OnboardingDiagnosticScreen.tsx` | Skill check (placement) |
| `/mobile/settings` | `SettingsScreen.tsx` | Profile, security, venue, shift reminders |
| `/mobile/ai-photo` | `PhotoUploadScreen.tsx` | Profile photo with background removal |
| `/mobile/help`, `/contact`, `/report-bug` | `HelpScreen.tsx`, `ContactSupportScreen.tsx`, `ReportBugScreen.tsx` | Help and support |
| `/mobile/privacy`, `/mobile/terms` | `PrivacyScreen.tsx`, `TermsScreen.tsx` (share `LegalProse.tsx`) | Legal pages |
| `/mobile/arena`, `/scenario-practice`, `/scenarios` | None | Redirects only (old links): the first two to Live Guest, the last to Learn |

**Tab bar** (`ui/TabBar.tsx`): **Home** (`/mobile/home`), **Learn** (`/mobile/learn`), **Practise** (`/mobile/practise`), **Me** (`/mobile/progress`). Always fixed to the bottom, with a spacer in front of it so no screen reserves its height. The drill, Rush, Live Guest and challenge screens light up Practise; the reference screens light up Learn. Everything else is reached by drilling in from a tab.

## 3. The Learn hub

"Scenarios" used to be its own bottom-nav tab; it was folded into Learn on 2026-08-21, and the AI Arena and Scenario Training were retired in the Rich update (Phase 8) in favour of Live Guest.

`LearnHubScreen.tsx` renders, top to bottom:
1. **The skill check prompt**, linking to `/mobile/onboarding`.
2. **`CoreKnowledgeSection.tsx`:** the 40 modules.
3. **Practice links:** the mixed drill, Saturday Rush and Live Guest.
4. **`MiniGamesSection.tsx`:** a Challenges teaser, the first few rows of `CHALLENGES` from `ChallengesScreen.tsx` with a "+N more" tile.
5. **`ReferenceLibrarySection.tsx`:** the Knowledge Base and Cocktail Library.

`useTrainingProgress()` is called exactly once at this orchestrator level and prop-drilled into sections that need it, rather than each section independently calling the hook — a deliberate perf choice (see §4).

## 3a. Home (redesign phase 1)

- **The stack card** is the staff desktop's next step: `pickNextSteps()` (`lib/next-step.ts`), in the same words (`copyFor()`, `lib/next-step-copy.ts`), opening the mobile screen from `stepHref()` (`lib/home-feed.ts`). On a shift day with the pre-shift drill done it becomes "Ready for tonight" with the next step as its button (`homeHero()`).
- **The week's dots** (`ShiftDots`) are gold on days with a finished pre-shift drill (`weekDone` from `GET /api/training/shift-streak`), a ring on today, filled on shift days, small on days off.
- **Keep going** is a module part way through that isn't already on the card (`keepGoingModule()`); its ring is the module's mastery from `useTrainingProgress()`.
- **Tonight's cocktails and fact** are the desktop's (`dayIdx`), drawn only once the date is known, so the snap row never jumps.
- **The gold streak chip** on the avatar shows only when the shift streak is above 0.
- **Join your venue** shows for an account with no modules and no venue.

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

### The staff data cache (`lib/staff-cache.ts`, `_lib/use-staff.ts`)
`MobileSessionProvider` makes the signed-in person the owner of the staff desktop's cache, so mobile screens use the same `useStaffData()` loaders (`lib/staff-data.ts`): the module list, shift streak and team week load once and a return visit paints at once. `useGetToken()` gives the loaders a stable token getter; `useShiftStreak()` feeds the gold chip on every screen's avatar.

### `useMobileSession()` (`_lib/mobile-session-context.tsx`)
The mobile equivalent of `DashboardShell.tsx`'s `initialToken` prop-threading, as a context instead (necessary because mobile is 12+ independent routes, not one shell component). Exposes:
- `token` — Supabase access token; attach as `Authorization: Bearer <token>` on API calls. **This is the #1 thing that differs from desktop** — desktop's `ChallengesPage.tsx` and friends rely on the ambient session cookie and send no auth header at all. Every mobile fetch to an authenticated API route must carry this header explicitly.
- `tier`, `allowedModules`, `hasVenueMembership`, `venueMembershipPaused` — seeded server-side, static for the session.
- `streakCount` — client-only daily-login streak (`lib/streak.ts`), computed once here (not per-screen) so it increments exactly once per mobile session regardless of landing screen.
- `isOnline`, `pendingSyncCount` — offline/retry-queue state (see below); renders a fixed top banner ("You're offline…" / "Syncing N pending changes…") whenever either is non-default.

### `useTrainingProgress()` (`_lib/use-training-progress.ts` + `_lib/training-progress-context.tsx`)
A **shared, single-fetch-per-session** cache around `GET /api/training/progress`, the same endpoint the desktop shell (`DashboardShell.tsx`) fetches once on arrival. This was a deliberate perf fix (Phase 1a): previously every screen (Home, Learn, Progress, Challenges, Badges) independently fetched on its own mount, causing the full round trip to re-run on every navigation — the documented root cause of "Continue Learning" appearing to hang on first login until you navigated away and back.

**The correctness rule that follows from this**: because the fetch is now shared instead of per-mount, *any screen that writes an attempt* (Quiz, the drills, Live Guest, the challenge screens via `use-challenge-complete.ts`) **must call `refetch()`** after a successful save, or every other screen keeps showing stale progress. If you add a new mobile screen that writes training data, this is the step most likely to be forgotten.

### Offline resilience — retry queue (`_lib/retry-queue.ts`)
A `localStorage`-backed queue (key `"sbe-retry-queue"`, cap 50 entries), scoped **only** to `POST /api/training/challenges/save`. This scoping is deliberate, not incomplete: that endpoint is a pure upsert on `(user_id, challenge_index)`, so blindly replaying it is a harmless no-op. Graded work (the verify quiz, drills, Live Guest turns) isn't queued: it needs the person on screen for the feedback, and each answer is graded by the server as it's given. Those screens keep their own try-again buttons instead.

Flow: a failed/offline challenge save → `enqueueRetry()`. `MobileSessionProvider` listens for `online`/`visibilitychange` events and calls `flushRetryQueue(token)`, which attempts every queued request and keeps only the ones that still fail. `getPendingCount()` seeds the initial banner state on mount without waiting for a flush attempt.

Naming note if you extend this: the queue key uses the house `sbe-` hyphenated convention; the underscore-cased `"sbe_challenges_completed"` localStorage key is a deliberate, documented exception kept for desktop/mobile parity (see `CHALLENGES.md` §4) — don't treat one as a typo of the other or "fix" it to match.

## 5. Design: tokens, light and dark, the parts

The October 2026 redesign (`docs/STAFF_MOBILE_REDESIGN_PLAN.md`) replaced the navy and amber dark theme.

- **Tokens:** `--sm-*` in `app/globals.css`, aliases of the brand tokens plus three added for this app: `--paper` (`#F8F6F0`), `--bottle` (`#0E2A1E`) and `--gold-bright` (`#D4AF37`). Gold is only for streaks, goals and finished drills, and never small gold text on paper.
- **Dark mode:** `.sm-dark` on `<html>` swaps the same names for bottle green, with cards a step lighter. It follows the phone unless Settings > Appearance picks one (`lib/mobile-theme.ts`, saved per device as `sbe-sm-theme`). The layout's nonce'd inline script sets it before the first paint; `MobileThemeSync.tsx` keeps it right after. Browser bar colours follow (`viewport.themeColor`).
- **Old names:** the `--*-mobile` tokens now point at `--sm-*`, so screens not yet rebuilt show the new palette in both modes. They go in phase 8. New code uses `--sm-*` only.
- **Shared components** (quiz, drills, Live Guest, Rush, team week, challenges) keep `theme="dark"`, which is now "the mobile theme": `.qz--dark` and `.sd-on-mobile` read `--sm-*`.
- **Type:** Manrope throughout, 200 to 800 (`app/fonts/product-fonts.ts`). 34px large titles, 20px section heads, 16 to 17px rows, 12px small capitals.
- **Parts** (`app/mobile/_components/ui/`, styles in the "STAFF MOBILE" block of `app/styles/staff.css`, all `.sm-*`): `Screen` (large title that collapses into a compact bar, tab bar, safe areas), `TabBar`, and in `parts.tsx`: `Section`, `Card`, `StackCard`, `RowList`, `Row`, `Pill`, `ProgressBar`, `ProgressRing`, `ButtonLink`, `Avatar` (with the gold streak), `ShiftDots`, `PhotoCard` (square, with the fade).
- **Rebuilt screens use classes, not inline styles.** Inline styles stay only for values worked out at run time, such as a progress width.

## 6. Cross-Cutting Notes Carried Over from `STAFF_APP.md`

These apply to this build specifically and are restated here so this doc is self-contained:

- **Touch targets**: WCAG 2.5.5 (44×44px) is the intended standard but enforced **ad hoc via inline styles** per element, not a shared helper/CSS variable. Add the inline minimum yourself on any new tappable element.
- **Safe-area handling**: `env(safe-area-inset-bottom, 0px)` is used throughout this tree (fixed `BottomNav`, challenge screens). `app/mobile/layout.tsx`'s locked viewport sets `viewportFit: "cover"`, which is what makes these insets meaningful here — confirm that's still true before relying on it elsewhere.
- **PWA and offline:** `public/manifest.json` makes the app installable, and `public/sw.js` exists only for shift-reminder push notifications (`lib/push-client.ts`, `lib/web-push.ts`). It caches nothing and handles no fetches, so there is no offline mode: the retry queue in section 4 is the only offline resilience.

## Related Docs

- `CHALLENGES.md` — full detail on the Challenges feature, which lives primarily on this build.
- `STAFF_APP.md` — parent doc covering the full staff training platform, including the desktop dashboard this build parallels.
- `docs/MASTERY_ENGINE.md` — the mastery formula behind `useTrainingProgress()`'s data.
- `DATABASE_SCHEMA.md` — table map for `user_challenges`, `scenario_mastery`, and the other tables this build reads/writes.
