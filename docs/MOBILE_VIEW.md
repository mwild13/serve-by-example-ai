# Serve By Example — Mobile View Architecture

## Mobile-First Philosophy

Hospitality staff train on their phones — between shifts, before service, during a break. The staff dashboard is designed for one-handed, tap-based interaction. The primary device assumption is a mid-range Android or iPhone at 375–430px viewport width. Desktop is supported but secondary.

This means:
- All interactive elements are tap targets, not hover targets
- Navigation uses a persistent bottom bar — no hamburger menus buried in a corner
- Content is stacked vertically, not side-by-side
- Minimum readable font size is 16px to prevent browser auto-zoom on input focus
- No modals that are hard to dismiss on small screens

---

## Primary Mobile Layout: `MobileDashboardV3.tsx`

**File:** `components/learning-engine/MobileDashboardV3.tsx`

This is the mobile-specific shell for the entire staff dashboard. `DashboardShell.tsx` conditionally renders it on small viewports using a CSS media query. The same `NavItem` state model and all the same child components apply — `MobileDashboardV3` is a presentation layer, not a separate feature.

**Receives from `DashboardShell.tsx`:**
- `userId: string`
- `tier: Tier` — `"free" | "pro" | "venue_single" | "venue_multi"`
- `activeNav: NavItem`
- `setActiveNav: (nav: NavItem) => void`

**Layout:** Stacked card layout. No sidebars. Content fills the full viewport width with horizontal padding via CSS variables.

---

## Bottom Navigation Bar

The bottom bar is always visible on mobile. It provides instant access to the 5 most-used sections.

| Position | Label | NavItem ID | Component Rendered |
|----------|-------|------------|--------------------|
| 1 | Home | `home` | `PreShiftHome.tsx` |
| 2 | Modules | `module` | `DynamicModuleNav.tsx` |
| 3 | Scenarios | `stage4` | `DiagnosticFlow.tsx` |
| 4 | AI Arena | `scenarios` | `ArenaPage.tsx` |
| 5 | Me | `progress` | `ProgressOverview.tsx` |

The following nav items are accessible via a secondary menu or settings panel — not in the bottom bar:
- `challenges` — Challenges (ChallengesPage.tsx)
- `cocktails` — Cocktail Library (CocktailLibrary.tsx)
- `knowledge` — 101 Knowledge Base (KnowledgeBase.tsx)
- `settings` — Settings (StaffSettingsPanel)

---

## Touch-Optimised Components

### `ChallengesPage.tsx`
All 5 challenge formats are tap-first. No drag-and-drop. No hover states required. Each challenge fits on a single screen without horizontal scrolling.

| Format | Tap Interaction |
|--------|----------------|
| Sequence Sort | Tap up/down arrow buttons to reorder items |
| Fill the Blank | Tap a blank slot to select it, then tap a word from the bank to fill it |
| Match Pair | Tap a left item to select it, tap a right item to complete the pair |
| Spot the Error | Tap the incorrect ingredient in the recipe card |
| Multiple Choice | Tap one of 3 response options |

Each challenge has a Verify/Submit button and a Reset button. Feedback banners appear inline — no full-page overlays.

### `RapidFireQuiz.tsx`
- Large True / False buttons fill the bottom of the screen
- Keyboard shortcuts (T / F keys) work as a desktop fallback
- Streak indicator and progress counter render in a fixed header band
- Consecutive-correct requirement: 4 of 5

### `ArenaPage.tsx`
- Text input area is large and scrollable — accommodates mobile keyboard push-up
- Submit button is full-width on mobile
- AI feedback renders below the input in a scrollable card

### `DynamicModuleNav.tsx`
- Modules render as a scrollable vertical list on mobile
- Each module card has a minimum height of 60px (full tap target)
- Stage indicators (Learn / Verify / Perform) are icon-based with text labels below

---

## Language Switcher

**File:** `components/ui/LanguageSwitcher.tsx`

The `LanguageSwitcher` component accepts a `mobileOnly` prop. When `mobileOnly` is true, it renders only on mobile viewports (hidden via CSS on desktop).

Usage locations:
- `components/Footer.tsx` — `<LanguageSwitcher variant="footer" mobileOnly />` — bottom of the marketing footer
- `components/Navbar.tsx` — controlled via `showNavbarLanguageOnMobile` prop on the `Navbar` component

---

## Responsive Breakpoints

All breakpoints are defined in `app/globals.css`.

| Breakpoint | Range | Layout behaviour |
|------------|-------|-----------------|
| Mobile | up to ~768px | Single column, bottom nav active, stacked cards |
| Tablet | 768px – 1024px | Some two-column layouts, transitional nav |
| Desktop | 1024px+ | Full navbar, sidebar navigation, multi-column grids |

---

## Design Rules for Mobile Components

Follow these rules when building or modifying any staff-facing component:

**Tap targets**
- Minimum 44×44px — follows Apple Human Interface Guidelines
- Use `style={{ padding: "12px 16px" }}` or larger for buttons and interactive rows
- Never rely on hover state alone — every interactive element needs a visible active/pressed state

**Cards and containers**
```css
background: var(--surface)         /* #fffef9 */
border-radius: var(--radius-lg)    /* 20px */
box-shadow: var(--shadow-md)
padding: 16px 20px
```

**Typography**
- Body text: minimum 16px to prevent iOS/Android auto-zoom on input focus
- Headings use `var(--font-fraunces)` — do not substitute
- Body and UI text use `var(--font-manrope)` — do not substitute
- No emojis anywhere — use SVG icons or text labels

**Colours — always use CSS variables, never hex**
```css
var(--bg)           /* page background */
var(--surface)      /* card background */
var(--green)        /* primary CTA */
var(--gold)         /* highlight / accent */
var(--text)         /* primary text */
var(--text-soft)    /* secondary text */
var(--text-muted)   /* labels, captions */
var(--line)         /* borders */
```

**No Tailwind utility classes** — all styling via `style={{}}` inline props with CSS variables, or class names defined in `app/globals.css`.

---

## Dashboard Shell Routing on Mobile

`DashboardShell.tsx` owns `activeNav` state. `MobileDashboardV3.tsx` receives it as a prop and renders the correct component. Switching tabs updates `activeNav` in the shell, which re-renders the mobile layout.

Premium gating applies on mobile the same as desktop. `PREMIUM_NAV_ITEMS = ["module", "stage4", "scenarios", "cocktails", "knowledge"]` — free users see these tabs as locked with an upgrade prompt. Challenges, Home, Progress, and Settings are always accessible.

---

## Testing Mobile Views

To test the mobile layout during development:

1. Open Chrome DevTools → Toggle device toolbar (Cmd+Shift+M)
2. Select iPhone 14 Pro or similar (393×852)
3. Confirm bottom nav renders and all 5 tabs are tappable
4. Test each challenge format in ChallengesPage — all interactions must work with touch simulation
5. Test the RapidFireQuiz — True/False buttons must be easy to tap without mis-tapping
6. Rotate to landscape and confirm layout doesn't break
