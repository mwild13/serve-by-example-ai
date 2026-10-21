# Staff Mobile Redesign Plan (October 2026)

The plan for rebuilding `/mobile`, the staff app on phones, to the Version 2 mock-up the owner approved on 2026-10-21. About 90% of staff use this surface, so it is built for speed, a native iPhone feel and reasons to come back.

- **Mock-up:** the "Version 2: warmer, tactile feed" row on the [SBE Mobile Home Proposal](https://claude.ai/artifact/Qsyafav9Pm6NDzDuqNk6vM) canvas: Home, Home scrolled, Home dark, Add to Home Screen, Pre-shift drill finished.
- **Branch:** `preview/staff-mobile`, one branch for the whole update, one commit per phase.
- **Companion docs:** `docs/MOBILE_BUILD.md` (architecture), `docs/STAFF_APP.md` (training loop). `CLAUDE.md` wins where they conflict.

---

## 1. Decisions locked

| Topic | Decision |
|---|---|
| Look | Version 2: warm paper cream, bottle green anchors, gold only for streaks, goals and finished drills |
| Colours | New brand values `#F8F6F0` (paper), `#0E2A1E` (bottle), `#D4AF37` (bright gold) added as tokens. Approved on 2026-10-21 |
| Depth | Soft shadows and clean borders on cards. Two functional gradients: the photo fade on cocktail cards and the glow behind the finished drill. Approved for mobile only |
| Light and dark | Light by default. Dark is bottle green with lighter green cards. Follows the phone's setting, with a manual switch in Settings, saved per device |
| Type | Manrope throughout, headings included, as on the staff desktop. iPhone sizes: 34px large title, 20px section heads, 16 to 17px rows, 15px body, 12px small capitals |
| Tabs | Four: Home, Learn, Practise, Me. The active tab has a solid icon; the others are 2px strokes. Every tab is at least 44 by 49px |
| Emoji | None. The streak uses a drawn flame |
| Gold text | Never small gold text on cream (it fails contrast). On light screens gold fills chips and dots with bottle green text on top. Gold text only in dark mode |
| Desktop | Not changed by this work. It keeps its own `--sd-*` palette |

**Confirmed by the owner on 2026-10-21:**
- An install step at the end of onboarding, on phones only, skippable.
- A "Train on your phone" QR code on desktop Today.
- Every mobile screen in this branch, done in the phases below.
- The `app_installed_at` migration (section 4.4), so the funnel can count installs.
- Real-phone testing by the owner on an iPhone, with an Android phone borrowed for the Android checks.

---

## 2. How it is built

### 2.1 Tokens

- New base tokens in the one `:root` block of `app/globals.css`: `--paper`, `--bottle`, `--bottle-raised` (`#183B2B`), `--bottle-hero` (`#1E4634`), `--gold-bright`, `--gold-glow`, `--sage` (`#B9CBBE`), plus the shadow pair the cards use.
- A `--sm-*` set (staff mobile), each an alias of a base token, the same pattern as the desktop's `--sd-*`: `--sm-bg`, `--sm-card`, `--sm-card-line`, `--sm-ink`, `--sm-ink-soft`, `--sm-accent`, `--sm-hero`, `--sm-hero-ink`, `--sm-track`, `--sm-fill`, `--sm-gold`, `--sm-shadow`, `--sm-tabbar`.
- Dark mode is one block, `.sm-dark`, that swaps the same names, so no screen writes its own dark rules. It is applied by `prefers-color-scheme: dark` unless the person chose a mode in Settings (`localStorage` key `sbe-sm-theme`, wrapped in try/catch).
- The old `--*-mobile` tokens (navy and bright gold) are deleted at the end (phase 8), once nothing reads them.
- `npm run lint:css` must not report more raw colour values than before.

### 2.2 Shared screens follow for free

The quiz (`QuizRun`, `.qz--light`), the mixed and pre-shift drill (`MixedDrill`), Live Guest, Saturday Rush, `TeamWeekCard` and the challenge game already take their colours from the `--sd-*` tokens in their light theme. The plan:

1. Remap `.sd-on-mobile` so every `--sd-*` name points at the matching `--sm-*` token.
2. Mobile screens pass `theme="light"` instead of `theme="dark"` and sit inside `.sd-on-mobile`.
3. Light and dark then both work on those screens with no change to the shared components.

Phase 0 checks each one, because Rush and Live Guest have a few colours of their own in `staff.css`.

### 2.3 Styles

- Today `app/mobile/` has 748 inline style blocks, which is why the screens drift. They are replaced by `.sm-*` classes in `app/styles/staff.css` under a new "STAFF MOBILE (/mobile)" heading. Inline styles stay only for values computed at run time, such as a progress width.
- One small kit in `app/mobile/_components/ui/`, used by every screen:

| Part | Use |
|---|---|
| `Screen` | Page frame, safe areas, the large title that collapses into the compact bar on scroll (an IntersectionObserver on a marker, no scroll listener) |
| `NavBar` | The compact top bar: back button or title, the avatar with the streak chip |
| `TabBar` | The four tabs, see-through with blur, fixed, safe-area padding. Replaces `BottomNav.tsx` and its fake home bar |
| `Card`, `HeroCard`, `StackCard` | The three card weights. `StackCard` is the layered pre-shift card |
| `RowList`, `Row` | Tappable rows with icon, bold label, count pill and chevron |
| `ProgressBar`, `ProgressRing` | 10px bar, 46px ring, both with labels for screen readers |
| `Button` | Primary (bottle or cream), secondary, text. 52px primary height |
| `Pill`, `StreakChip`, `ShiftDots` | Counts, the gold streak, the M to S week |
| `Banner` | The dismissible top banner (install, offline, sync) |
| `Sheet` | Bottom sheet for pickers and confirms |
| `PhotoCard` | Square 1:1 photo with the bottom fade and title |

- **Motion:** CSS only, `--ease-out` and `--ease-spring-soft`, everything off under `prefers-reduced-motion`. Press states on every tappable element (scale 0.98 and a darker fill), no hover-only styles. The mobile-native rules apply throughout: no tap flash, no long-press text selection on buttons, `100dvh`, 16px inputs so iOS does not zoom.

### 2.4 Browser chrome

- `viewport.themeColor` in `app/mobile/layout.tsx` becomes a light and dark pair (paper and bottle), so Safari's bars match the screen.
- `public/manifest.json`: `background_color` and `theme_color` match the light theme, the description loses its en dash, and the icons are checked for a clean maskable crop. `start_url` stays `/dashboard`, which already sends phones to `/mobile/home`.

---

## 3. Home: the feed

`lib/home-feed.ts`, a pure function with tests, decides the order of Home from data the app already has (shift streak and days, today's drill, modules, team week, the person's plan). No new tables.

| State | Top of Home |
|---|---|
| Shift day, drill not done | The pre-shift drill stack card |
| Shift day, drill done | "Ready for tonight" with the streak, then the venue goal and the guest of the week first |
| Day off | The module to keep going with as the hero, the drill offered as practice |
| No modules (free, no venue) | Join a venue or start a trial, one action |
| First day | What's coming, never a row of zeros |

Below the top: this week at the venue (when the manager has set something), keep going (with Resume), for the bar tonight (square cocktail photos, swipe), look it up (rows with counts), a fact for the bar.

---

## 4. Getting it on the Home Screen

### 4.1 Detecting the phone

`lib/install-platform.ts`, pure and tested against real user agent strings:

| Platform | What we show |
|---|---|
| iPhone, Safari (iOS 26 and later) | Three picture steps: "..." then Share then Add to Home Screen, leave Open as Web App on, tap Add |
| iPhone, Safari (iOS 16.4 to 18) | Share button in the toolbar, then Add to Home Screen |
| iPhone, Chrome | Share in the address bar, then Add to Home Screen |
| iPhone or Android in-app browser (Instagram, Facebook, Messenger, Gmail, LinkedIn, TikTok) | "Open this in Safari" (or Chrome), with a copy-link button. You can't install from inside these |
| Android, Chrome or Edge | The real install button (`beforeinstallprompt`), with the menu steps as a fallback |
| Android, Samsung Internet | Menu, then Add page to, then Home screen |
| Already installed (`display-mode: standalone`) | Nothing, anywhere |

### 4.2 The guide screen

`/mobile/install`: the Version 2 screen, with the detected phone shown at the top, "Different phone?" to switch, and "I've added it". The step pictures are drawn in CSS and SVG, not screenshots, so they stay sharp and follow dark mode. The line about signing in once more shows on iPhone only.

### 4.3 Where people meet it

1. **Onboarding, phones only:** a skippable second step after the venue code ("Put SBE on your Home Screen"), opening the guide.
2. **After a finished pre-shift drill:** the "Get a nudge before Thursday" card on the finish screen. Shift reminders on iPhone need the installed app, so this is the honest pitch.
3. **Home top banner:** shown from the second visit, dismissible, back once after 14 days, then never.
4. **Me:** a permanent "Add to Home Screen" row.
5. **Shift reminders on iPhone:** the existing "add to Home Screen first" step opens the guide.
6. **Desktop Today:** "Train on your phone" with a QR code to `/mobile/home`.

The old `InstallPrompt.tsx` in Settings is retired.

### 4.4 Knowing if it works

- Each prompt shown, tapped and dismissed goes through `trackEvent` with the platform.
- A launch from the Home Screen (standalone mode) is recorded once per device.
- **The install column:** `app_installed_at` on `profiles`, so the funnel SQL in `docs/FUNNEL_METRICS.md` can count installs. Written in phase 0 as a migration file for the owner to run; the phase 3 code copes with it not being run yet.

---

## 5. Drill finished

- The mobile pre-shift finish screen becomes the Version 2 celebration:
  - The gold ring draws round and the streak number pops up.
  - Sparks twinkle and today's dot turns gold.
  - Then "You're ready for tonight", the score and time, the install or reminder card, "Back to Home" and "Warm up with a Live Guest".
- **Android vibration:** a short vibrate (`navigator.vibrate`) where the phone supports it. iPhone browsers don't support vibration, so the animation carries it there.
- **No celebration on a missed day:** a freeze used shows the freeze plainly, not gold.
- **Where it's built:** the finish screen is `PreshiftResult` in `components/quiz/MixedDrill.tsx`, shared with desktop. Mobile passes its own finish (`renderPreshiftDone`, `app/mobile/_components/drill/DrillCelebration.tsx`) so desktop keeps its current one.

---

## 6. Phases

Each phase is one commit on `preview/staff-mobile`, checked at 360, 375, 390 and 430px wide in light and dark before the next starts.

| # | Phase | What lands |
|---|---|---|
| 0 | Foundations | Tokens, `.sm-dark` and the theme switch, `.sd-on-mobile` remap, the `ui/` kit, `TabBar` with four tabs and a new `/mobile/practise` route, browser chrome colours, manifest |
| 1 | Home | `lib/home-feed.ts` and tests, the Version 2 Home in light and dark, the collapsing title, square cocktail cards, look it up, the notifications opt-in card restyled |
| 2 | Drill and celebration | The pre-shift drill screen in the new chrome, the celebration finish, `/mobile/drill` mixed drill restyled |
| 3 | Install | `lib/install-platform.ts` and tests, `/mobile/install`, the six entry points, onboarding step, desktop QR, tracking |
| 4 | Learn | Learn tab as a path: the suggested module, then modules by level as rows; the skill check prompt; module Learn cards and the verify quiz in the new chrome |
| 5 | Practise | The new Practise tab (Mixed Drill, Saturday Rush, Live Guest, Challenges, today's challenge on top); Rush and Live Guest on `theme="light"`; the ten challenge screens' chrome (`MobileChallengeChrome`) |
| 6 | Me | Progress (figures, mastery by area, badges with the next one), the AI coach widget, Settings in grouped iPhone-style lists with a new Appearance row, profile photo, help, contact, report a bug, legal pages |
| 7 | Look it up | Cocktail library on square photos with a detail sheet, the knowledge base in rows with search |
| 8 | Clean-up and release | Delete `--*-mobile` tokens, `BottomNav.tsx`, `InstallPrompt.tsx` and the dead inline styles; knip; new Playwright baselines; docs; preview push |

---

## 7. Speed

This is the screen most people open, often on bar Wi-Fi or 4G.

- **First paint from cache:** Home paints from the in-memory staff cache on a return visit, as desktop does (`lib/staff-cache.ts`), so the feed is never blank while progress loads. On a first visit it shows skeleton rows the same shape as the real ones, with no layout jump when data arrives.
- **Photos:** cocktail photos through `next/image` at 204px, served at 2x, lazy below the fold. The first card loads eagerly only when it is on screen.
- **Fewer requests:** the three tab roots prefetch each other. The `ui/` kit is plain server-safe markup where it can be, so most screens send less JavaScript than today.
- **Targets on a mid-range phone over 4G:** Home's largest paint under 2.0 seconds, layout shift under 0.05, a tap answered within 100ms.

---

## 8. Checks before release

- **Commands:** `npx tsc --noEmit`, `npx eslint` on changed files, `npm run lint:css` (raw colour count not up), `npm run lint:css:unused`, `npm test` (including `lib/no-dashes.test.ts`), `npx knip`.
- **Visual tests:** `tests/e2e/mobile-screens.spec.ts` baselines regenerated on purpose and reviewed by eye. A dark mode pass is added, Practise and Install are added to the route list, and the no-horizontal-scroll check covers every route.
- **Accessibility:** text at 4.5:1 in both modes, focus rings on everything, every icon-only button labelled, 44px touch targets, VoiceOver read-through of Home and the drill.
- **Real phones:** install from Safari and Chrome on an iPhone, from Chrome on Android, and from an Instagram link. Sign in again inside the installed app, run a pre-shift drill, and receive a reminder.
- **Release:** as usual. Push the branch to its preview, wait for CI, the owner checks it on a phone, then main when told.

---

## 9. Docs to update in phase 8

- `docs/MOBILE_BUILD.md`: section 5 (tokens) rewritten for `--sm-*` and dark mode; the route map gains Practise and Install; the bottom nav paragraph becomes the tab bar.
- `docs/STAFF_APP.md`: section 2 (four tabs), section 5 (PWA is no longer greenfield), a new section on the mobile design standard like section 8 for desktop.
- `CLAUDE.md`: the staff tokens line names `--sm-*` alongside `--sd-*`.
- This plan moves to `docs/zHistorical/` once released.
