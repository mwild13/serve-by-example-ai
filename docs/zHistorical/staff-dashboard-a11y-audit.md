# Accessibility Audit: Staff Dashboard
**Standard:** WCAG 2.1 AA | **Date:** 2026-07-22
**Scope:** `app/dashboard/_components/` (DashboardShell, DynamicModuleNav, RapidFireQuiz, ArenaPage, PreShiftHome, MobileDashboardV3, ChallengesPage, BadgesView) + `app/globals.css` design tokens

**Method:** Manual source audit (no `jsx-a11y` ESLint plugin is configured in `eslint.config.mjs`, and `axe-cli` requires a running Chromedriver session not available in this sandbox — see Tooling Gaps below). Contrast ratios computed programmatically per WCAG relative-luminance formula against the actual CSS custom property values in `app/globals.css`.

---

### Summary
**Issues found:** 11 | **High:** 4 | **Medium:** 5 | **Low:** 2

---

### Color Contrast Check

| Element | Foreground | Background | Ratio | Required | Pass? |
|---|---|---|---|---|---|
| Body text | `var(--text)` #172f22 | `var(--bg)` #f5f2e9 | 12.80:1 | 4.5:1 | ✅ |
| Secondary text | `var(--text-soft)` #496155 | `var(--bg)` #f5f2e9 | 6.00:1 | 4.5:1 | ✅ |
| **Muted text** | `var(--text-muted)` #7a9185 | `var(--bg)` #f5f2e9 | **3.02:1** | 4.5:1 | ❌ |
| **Muted text** | `var(--text-muted)` #7a9185 | `var(--surface)` #fffef9 | **3.35:1** | 4.5:1 | ❌ |
| **Alt muted text** | `var(--color-text-muted)` #6b7280 | `var(--bg)` #f5f2e9 | **4.32:1** | 4.5:1 | ❌ (borderline) |
| Alt muted text | `var(--color-text-muted)` #6b7280 | `#ffffff` | 4.83:1 | 4.5:1 | ✅ |
| CTA label | white | `var(--green)` #1f4e37 | 9.53:1 | 4.5:1 | ✅ |
| **Mobile nav inactive label** | `rgba(255,255,255,0.45)` composited | nav bg `rgba(15,45,29,.88)` on `--bg` ≈ #2B4535 | **3.51:1** | 4.5:1 | ❌ |
| Gold accent text | `var(--gold)` #a9812a | `var(--bg)` #f5f2e9 | 3.20:1 | 4.5:1 | ❌ (only OK as large text/icon) |
| **Warning icon stroke** | `var(--gold-warm)` #c49a2f | `var(--gold-light)` #f7ecd0 | **2.23:1** | 3:1 (non-text) | ❌ |

---

### Findings

#### Operable

| # | Issue | WCAG | Severity | Recommendation |
|---|---|---|---|---|
| 1 | **Module grid cards are keyboard-inaccessible.** In [DynamicModuleNav.tsx:111-137](../app/dashboard/_components/DynamicModuleNav.tsx#L111), all 40 module cards are plain `<div onClick={...}>` with no `role="button"`, `tabIndex`, or `onKeyDown` handler. This is the primary entry point into the entire training product (`module` nav item) and is completely unusable via keyboard or switch device. | 2.1.1 Keyboard | **High** | Convert the card wrapper to a native `<button>` (preferred — drop the `cursor:pointer` div pattern), or add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler for Enter/Space, matching the pattern already used correctly in `DashboardShell.tsx`'s sidebar nav items (lines 685-699). |
| 2 | **Focus indicator fully removed with no replacement on the Stage 4 scenario-response input.** `app/globals.css:11925` — `.s4-bubble-input:focus { outline: none; }` has no compensating `border-color`/`box-shadow`, unlike every sibling input in the file (`.input:focus`, `.demo-textarea:focus`, `.trainer-textarea:focus`, `.kb-search:focus` all pair `outline:none` with a visible border/glow). Keyboard users get zero visual confirmation of focus while composing a scenario answer. | 2.4.7 Focus Visible | **High** | Add `box-shadow: 0 0 0 3px rgba(31,78,55,0.15); border-color: var(--green);` (or equivalent) to `.s4-bubble-input:focus`, consistent with the other text inputs in the file. |
| 3 | **Mobile bottom nav inactive-tab labels fail contrast.** `MobileBottomNavBar` in [DashboardShell.tsx:451](../app/dashboard/_components/DashboardShell.tsx#L451) uses `rgba(255,255,255,0.45)` for inactive tab text at 9px, over the nav's `rgba(15,45,29,.88)` background. Computed contrast ≈ 3.51:1 against 4.5:1 required — and this is the persistent, always-visible nav on every mobile screen (staff dashboard is mobile-first per product docs). | 1.4.3 Contrast (Minimum) | **High** | Raise inactive opacity to at least `rgba(255,255,255,0.62)` (re-verify against the composited background) or use a dedicated token e.g. `--nav-inactive: #b7c4bd`. |
| 4 | **Quiz correct/incorrect feedback is color-only.** In `RapidFireQuiz.tsx` (~lines 202-249), the explanation panel switches between `.quiz-explanation-correct` (green bg/border) and `.quiz-explanation-incorrect` (red bg/border) with no icon or "Correct"/"Incorrect" text label — the only textual content is the explanation itself. Note also: the button classes `quiz-button-correct` / `quiz-button-incorrect` referenced in the TSX (lines 207, 226) have no matching CSS rule in `globals.css` — they currently do nothing, so the *only* feedback signal in production may be the panel color alone. | 1.4.1 Use of Color | **Medium** | Add a `✓ Correct` / `✗ Incorrect` text node (or `aria-hidden` icon + visible text) at the top of the explanation panel. Separately flag the dead `quiz-button-correct`/`incorrect` CSS classes to engineering as a correctness bug, not just a11y. |
| 5 | **Touch target / redundant nit — sidebar nav item is div-based `role="button"` rather than native `<button>`.** [DashboardShell.tsx:685-699](../app/dashboard/_components/DashboardShell.tsx#L685) *does* correctly implement `role="button"`, `tabIndex={0}`, `onKeyDown` for Enter/Space, and `aria-current` — so it is not a WCAG failure, but it's needless custom-ARIA where a `<button>` styled the same way would be simpler and remove a maintenance foot-gun (missing `aria-disabled`, missing default focus styling, etc.). | 4.1.2 (advisory) | **Low** | Consider refactoring to `<button>` in a future pass; not blocking. |

#### Perceivable

| # | Issue | WCAG | Severity | Recommendation |
|---|---|---|---|---|
| 6 | **`--text-muted` token fails AA and is used pervasively.** #7a9185 on `--bg`/`--surface` = 3.02–3.35:1 (needs 4.5:1). This is the token CLAUDE.md itself flags as a known risk area, confirming it's still unresolved in the shipped design tokens. | 1.4.3 Contrast | **High** | Darken `--text-muted` to at least #5c7568 (≈4.5:1 on #f5f2e9) or migrate remaining usages to the already-compliant `--color-text-muted` (#6b7280) — see Finding 7, that token also needs a small adjustment. |
| 7 | **`--color-text-muted` (#6b7280) is documented as "5.74:1 on white" but only reaches 4.32:1 against the actual `--bg` parchment (#f5f2e9)** that most of the dashboard renders on (e.g. `DynamicModuleNav.tsx`'s "Mastery" label and "Loading modules…" state use `var(--color-text-muted)` directly on parchment, not white). The code comment's contrast claim is accurate only for the `--surface-raised`/white case. | 1.4.3 Contrast | **Medium** | Darken to #62697a or similar to clear 4.5:1 on #f5f2e9 as well, or scope this token's use to white/`--surface-raised` contexts only. |
| 8 | **Warning icon (venue-paused banner) fails non-text contrast.** [DashboardShell.tsx:743-747](../app/dashboard/_components/DashboardShell.tsx#L743) strokes an `<svg>` with `var(--gold-warm)` (#c49a2f) on a `var(--gold-light)` (#f7ecd0) card background — 2.23:1 against the 3:1 required for meaningful graphics (1.4.11), and the `<svg>` has no `aria-hidden="true"` despite being purely decorative (the adjacent text already states "Training is paused..."). | 1.4.11 Non-text Contrast / 4.1.2 | **Medium** | Darken the stroke color (e.g. to `#8a6a1f`) and add `aria-hidden="true"` to the `<svg>` since it's decorative. |
| 9 | **SVG icon audit: ~27 `<svg>` elements across the shell vs. only 16 `aria-hidden` + 10 `aria-label` annotations (26 total, several overlapping the same file inconsistently).** Not every icon was individually traced, but the venue-paused warning icon (Finding 8) confirms at least one meaningful gap exists. Given the "no emoji, SVG icons only" policy in CLAUDE.md, this ratio suggests a handful of icons are neither hidden nor labeled. | 1.1.1 Non-text Content | **Medium** | Run a targeted pass: every decorative `<svg>` gets `aria-hidden="true"`; every icon-only interactive control (e.g. the "×" dismiss button, bottom-nav icons that already have adjacent text — fine) gets a proper `aria-label` on its parent control, not the SVG itself. |

#### Understandable / Robust

| # | Issue | WCAG | Severity | Recommendation |
|---|---|---|---|---|
| 10 | **Page-title regions use `<span>` + `<strong>` instead of a heading, breaking heading hierarchy.** The `sbe-command-bar` pattern (used in `DynamicModuleNav.tsx:84-92`, `ArenaPage.tsx`, `RapidFirePage.tsx`, and `StaffSettingsPanel` in `DashboardShell.tsx:236-241`) renders the tab's title as `<span className="sbe-command-eyebrow">Training Library</span><strong>Modules</strong>` — no `<h1>`/`<h2>` at all. Meanwhile `PreShiftHome.tsx` correctly uses `<h1>Welcome back...</h1>` then `<h2>` sections. A screen-reader user navigating the Modules tab by heading list sees no page-level heading, then jumps straight into repeated `<h3>` module titles (`DynamicModuleNav.tsx:151`) — a level skip (h1→h3) with no h2 landmark for "Modules" itself. | 1.3.1 Info and Relationships / 2.4.6 Headings and Labels | **Medium** | Wrap the `<strong>{title}</strong>` in each `sbe-command-bar` instance with `<h2>` (visually restyled via CSS class, not inline tag change) so every tab has one real heading in the correct position of the hierarchy. |
| 11 | **No `<nav>` landmark around the primary sidebar or mobile bottom nav.** `DashboardShell.tsx`'s `.mockup-nav` (line 683) and `MobileBottomNavBar` (line 436, which does use `<nav>` — good) are inconsistent: the desktop sidebar list is a bare `<div className="mockup-nav">`, not `<nav aria-label="Primary">`, so screen-reader users can't jump to it via landmark navigation on desktop. | 1.3.1 / 4.1.2 | **Low** | Wrap `.mockup-nav` in `<nav aria-label="Primary">` on the desktop sidebar to match the (already-correct) mobile `<nav>` implementation. |

---

### Keyboard Navigation

| Element | Tab Order | Enter/Space | Escape |
|---|---|---|---|
| Sidebar nav items (`DashboardShell.tsx`) | ✅ In order, `tabIndex={0}` | ✅ Handled explicitly | N/A |
| **Module grid cards (`DynamicModuleNav.tsx`)** | ❌ Not focusable at all | ❌ No handler | N/A |
| Rapid-fire True/False buttons | ✅ Native `<button>`, plus `T`/`F` shortcuts | ✅ Native | N/A |
| Stage 4 response textarea | ✅ Focusable | N/A | N/A — but **no visible focus ring** (Finding 2) |
| Mobile bottom nav | ✅ Native `<nav><button>` | ✅ Native | N/A |

---

### Tooling Gaps

- **No `eslint-plugin-jsx-a11y` is installed or configured.** `eslint.config.mjs` currently only extends `eslint-config-next/core-web-vitals` plus a custom hardcoded-hex rule; it does not enforce any accessibility linting. `eslint-config-next` bundles `jsx-a11y` rules under `next/core-web-vitals` only for a *subset* of rules — a dedicated `jsx-a11y/recommended` block is not present. Recommend adding `eslint-plugin-jsx-a11y` explicitly with `recommended` rules to catch classes 1, 9, and 11 automatically in CI going forward.
- **`axe-cli` could not be run against a live page in this environment** — it shells out to a real Chromedriver-driven browser session, which isn't available here. If you want an automated pass, run `npx axe-cli http://localhost:3000/dashboard --tags wcag2a,wcag2aa` locally against a dev server with a logged-in session; it will independently confirm/extend Findings 1, 3, 6, 7, 8.

---

### Priority Fixes

1. **Fix #1 (module card keyboard access)** — blocks the entire Modules feature for keyboard/switch users; highest-impact single fix.
2. **Fix #3 (mobile nav contrast) + #6 (`--text-muted` token)** — both affect every staff user on every screen, given the mobile-first, parchment-background design system.
3. **Fix #2 (Stage 4 focus outline)** — silent for keyboard users specifically in the scenario-writing flow, easy one-line CSS fix.
4. **Fix #10 (heading hierarchy)** — moderate effort, meaningfully improves screen-reader navigation across every tab, not just Modules.
