# Serve By Example — Homepage Architecture

## Overview

**File:** `app/page.tsx` (519 lines)
**Route:** `/`
**Audience:** Developers maintaining or extending the marketing homepage. Designers modifying layout, content, or conversion flows.

The homepage is a static server-rendered marketing page. It has no authentication dependency — logged-in users see a "Go to Dashboard" button in the navbar, but the page is fully accessible without an account.

The page is conversion-focused: every section moves the visitor toward one of three actions — starting a demo, booking a call, or starting a trial.

---

## Component Map

| Component | File | Purpose |
|-----------|------|---------|
| `Navbar` | `components/Navbar.tsx` | Sticky marketing nav with mega-menu dropdowns |
| `HeroSection` | `components/HeroSection.tsx` | Above-the-fold hero with CTA and modal |
| `ROICalculator` | `components/ui/ROICalculator.tsx` | Interactive revenue uplift calculator |
| `Footer` | `components/Footer.tsx` | 5-column marketing footer |

All other sections (Trust Stats, Pillars, Mastery Path, Pricing, FAQ, Founder Story, Final CTA) are rendered inline in `app/page.tsx` — no separate component files.

---

## Section Inventory

The page renders 13 sections in order:

| # | Section | CSS Class / ID | Location in page.tsx |
|---|---------|----------------|----------------------|
| 1 | Navbar | — | Line 73 |
| 2 | Hero | `.hero` | Lines 77–78 (HeroSection) |
| 3 | Trust Stats | `.trust-section.trust-section-green` | Lines 81–98 |
| 4 | Core Pillars | `.section` + `.section-header` | Lines 101–136 |
| 5 | Two Outcomes | `.section-ecosystem` / `.solution-grid` | Lines 139–190 |
| 6 | Product Preview | `.section.section-warm` + `.solution-grid` | Lines 193–239 |
| 7 | Mastery Path | `#mastery-path` / `.section-band-green` | Lines 242–291 |
| 8 | Quantified Benefits | `.benefit-grid` | Lines 294–324 |
| 9 | Pricing | Inline styled | Lines 327–390 |
| 10 | ROI Calculator | `.roi-section.roi-section-band` | Line 393 (ROICalculator) |
| 11 | FAQ | `.faq-list` | Lines 396–436 |
| 12 | Founder Story | `.section.section-alt` | Lines 439–497 |
| 13 | Final CTA | `.section.section-cta` | Lines 500–512 |
| 14 | Footer | — | Line 516 (Footer) |

---

## Hero Section

**File:** `components/HeroSection.tsx` (342 lines)

The hero is the only section with its own component file. It contains the booking modal and form logic.

### Layout

```
Hero
├── H1: "Training Software Built for Hospitality"
├── Tagline: "From 6 months of onboarding to 6 weeks."
├── Subheading: platform description paragraph
├── CTA tiles (flex row)
│   ├── Primary: "Explore the Demo" → /demo
│   └── Secondary: "Book a free 15-min call" → opens modal
├── Tertiary link: "How it works" → /how-it-works
└── Hero image: /shots/257shots_so.png (Next.js Image, priority)
```

### Key CSS

```css
.hero {
  padding: 98px 0 44px;
  background: radial-gradient overlay rgba(228, 239, 234, 0.6);
}

.hero h1 {
  font-size: clamp(2.6rem, 6.5vw, 4.4rem);
  font-family: var(--font-fraunces);
  color: var(--green-deep);
}

.hero-tagline {
  font-size: clamp(1.2rem, 3.5vw, 1.5rem);
}

.hero-cta-tiles {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

/* Primary CTA tile */
background: var(--green);
color: white;
box-shadow: 0 4px 18px rgba(31, 78, 55, 0.28);

/* Secondary CTA tile */
background: var(--surface);
border: 1.5px solid var(--line);

/* Hover state (both) */
transform: translateY(-2px);
transition: 0.18s;
```

### Booking Modal

**Lines 144–339 in HeroSection.tsx**

The "Book a free 15-min call" button opens an inline modal overlay.

- Overlay: `rgba(0, 0, 0, 0.72)` backdrop
- Form fields: firstName, lastName, email, phone, company, teamSize, usesTraining, decisionMaker, intent
- Conditional field: "Platform name" renders only if `usesTraining === 'yes'` (line 287)
- Client-side validation on all required fields before submit
- Success state after submission (lines 178–182)
- API endpoint: `POST /api/book-call`

Do not add new fields to this modal without also updating the API route at `app/api/book-call/`.

---

## Trust Stats Section

Three stat cards in a green-tinted band, immediately below the hero.

```
.trust-section.trust-section-green
├── "3× Faster Onboarding" — 6 months to 6 weeks
├── "100+ Learning Modules & Scenarios"
└── "19 Languages Supported" — Aus Training Ready
```

Layout: 3-column grid (`.stat-card-green`). Stat values use large Fraunces serif. Color: `var(--green)`.

---

## Core Pillars Section

**Heading:** "Three tools. One training system."
**Eyebrow:** "The Platform"

Three cards in an auto-fit grid (`minmax(260px, 1fr)`, 1.5rem gap):

| Card | Icon | Background |
|------|------|------------|
| AI Scenario Simulators | Zap | `var(--surface)` |
| Cocktail & Spec Library | Book | `var(--surface)` |
| Manager Mission Control | Building | `var(--surface)` |

Card styling:
- Border: `1px solid var(--line)`
- Padding: `2rem`
- Icon wrapper: 44×44px, `var(--green-light)` background, `var(--green)` icon at 22px
- Heading: 1rem, weight 700
- Description: 0.9rem, `var(--text-soft)`, line-height 1.65

---

## Two Outcomes Section

**Heading:** "Built for two different roles."
**CSS:** `.section-ecosystem` / `.solution-grid`

Two-column layout (32px gap). Each column targets one audience:

| Column | Audience | Content |
|--------|----------|---------|
| Left | Managers | "Run a tighter venue" — management console screenshot |
| Right | Staff | "Train confident staff" — staff certifications screenshot |

Column header layout: `.solution-col-header` — flex row with icon + text. Icon: 44×44px, `var(--green-light)` bg, `var(--green-deep)` icon. H3: `var(--green-deep)`, 1.35rem.

---

## Product Preview Section

**CSS:** `.section.section-warm`

Two-column layout. Demonstrates the product visually.

| Column | Content | Image |
|--------|---------|-------|
| Left | "The full training library" | Modules screenshot (1400×875) |
| Right | "Train anywhere, on any shift" | Mobile screenshot (347×707) |

The mobile screenshot is centered with `max-width: 280px` to simulate a phone in hand. Do not resize this image arbitrarily — the phone frame ratio matters.

---

## Mastery Path Section

**ID:** `#mastery-path`
**CSS:** `.section.section-band-green`
**Heading:** "Know it. Apply it. Managers see it."
**Eyebrow:** "The Mastery Path"

Three step cards connected by SVG arrows:

```
.mastery-steps-flow
Grid: 1fr auto 1fr auto 1fr
      [step] [→] [step] [→] [step]
```

| Step | Icon | Title |
|------|------|-------|
| 1 | Book | "Know Your Product Cold" |
| 2 | Zap | "Apply It Under Real Pressure" |
| 3 | Building | "Managers See Everything" |

Step card styling:
- Background: `var(--surface-raised)`
- Border: `1px solid var(--line-light)`
- Border-radius: `var(--radius-lg)`
- Padding: `32px 28px`
- Icon wrapper: 64×64px, `var(--green-light)` bg, `var(--green-mid)` icon
- Step number: 0.72rem, uppercase, letter-spacing 0.1em
- H3: 1.1rem, `var(--green-deep)`
- Connectors: 40×16px SVG arrows, `var(--text-muted)` color

---

## Quantified Benefits Section

**Heading:** "Training that actually measures performance."
**Eyebrow:** "What makes it different"
**CSS:** `.benefit-grid` (3 columns)

Three benefit cards (`.benefit-card`):

| Metric | Label |
|--------|-------|
| 5× | Dimensions Scored Per Response |
| 24/7 | AI Coach, Always On |
| 0 Hours | Manager Admin |

Card structure:
- `.benefit-metric`: large bold number, Fraunces serif
- `.benefit-metric-unit`: smaller unit text
- `.benefit-title`: 1rem, weight 700
- `.benefit-desc`: 0.9rem, `var(--text-soft)`

---

## Pricing Section

Rendered inline in `app/page.tsx` (lines 327–390). Three tiers displayed as cards:

| Tier | Price | Visual Treatment |
|------|-------|-----------------|
| Pro | $19/month | "Most Popular" badge, `2px solid #0B2B1E` border, scale 1.03, elevated shadow |
| Venue | $49/month | `1.5px solid #e5e7eb` border, standard |
| Enterprise | Custom | `1px solid var(--line)` border, "Talk to our team" CTA |

The Pro card uses hardcoded hex (`#0B2B1E`) for the border — this is intentional (a slightly darker green than `--green` to distinguish the featured card). Do not change this to a variable without checking the visual result.

CTA on Pro card: primary "Join Pro" button + "or explore the demo free" text link beneath.

Stripe checkout is wired through the billing API — do not change the button targets without updating `app/api/billing/`.

---

## ROI Calculator

**File:** `components/ui/ROICalculator.tsx` (181 lines)
**CSS:** `.roi-section.roi-section-band`

Interactive calculator with two sliders and a projection table.

**Inputs:**
- Staff Count — range 1–50
- Avg Transaction Value — range $10–$200

**Calculation:**
```
staffCount × 40 transactions/week × avgTransaction × 5% uplift × 52 weeks
```

Displays Year 1, Year 3, Year 5 projections.

**Email capture:** Form at lines 145–174. Submits to `POST /api/roi/email`. This is a lead capture step — do not remove without product discussion.

---

## FAQ Section

Six collapsible items using native `<details>` / `<summary>` HTML. No JavaScript required.

**Classes:** `.faq-list`, `.faq-item`, `.faq-question`, `.faq-answer`

Topics: setup time, mobile-friendliness, staff churn, compliance certifications, free trial, vs generic LMS.

To add a new FAQ: add a `<details>` block inside `.faq-list`. Keep to plain text — no links or nested components inside FAQ answers.

---

## Founder Story Section

**CSS:** `.section.section-alt`
**Layout:** Max-width 880px, centered

Structure:
- Circular founder photo (140×140px)
- Eyebrow: "Built From Experience"
- H2 heading + narrative text
- 3-stat row: "15+ Years", "100s Staff Trained", "40+ Modules"
- Blockquote — 4px left border in `#2d6a4f` (green), padding 1.5rem, 1.5px border

---

## Final CTA Section

**CSS:** `.section.section-cta`
**Heading:** "Ready to train your team faster?"
**Subtext:** "No credit card required."
**CTA:** Gold button → `/demo`

This is the last conversion opportunity on the page. The gold color (`var(--gold)`) differentiates it from the green primary CTAs used earlier.

---

## Navbar

**File:** `components/Navbar.tsx`

On the homepage, rendered as:
```tsx
<Navbar showActions={false} showTextLogin showNavbarLanguageOnMobile={false} />
```

Key props for this page:
- `showActions={false}` — hides the default action buttons
- `showTextLogin` — shows a text-only login link
- `showNavbarLanguageOnMobile={false}` — language switcher is not shown in the nav on mobile (it appears in the footer instead)

The navbar is sticky with `backdrop-filter: blur(16px)` glassmorphic effect. On mobile it collapses to a hamburger with accordion-style Platform/Solutions sub-menus.

Auth state is detected inside the Navbar component — if a session exists, the CTA changes to "Go to Dashboard".

---

## Footer

**File:** `components/Footer.tsx`

Five-column footer: Brand column + Platform, For Venues, Resources, Company link groups.

On the homepage: `<Footer />` with no special props. The language switcher inside the Footer renders `mobileOnly` — it is visible on mobile but hidden on desktop.

---

## Design System Notes

All colors use CSS variables — never add hex values inline unless there is a specific documented reason (the Pro card border is the only current exception).

```css
/* Backgrounds */
var(--bg)           /* #f5f2e9 — page background */
var(--surface)      /* #fffef9 — card background */
var(--surface-raised) /* #fff — elevated cards */

/* Brand */
var(--green)        /* #1f4e37 — primary CTA */
var(--green-deep)   /* #0f2d1d — headings, icons */
var(--green-mid)    /* #2a6848 — secondary icons */
var(--green-light)  /* #e4efea — icon backgrounds, tints */
var(--gold)         /* #a9812a — final CTA, accents */

/* Text */
var(--text)         /* #172f22 — primary */
var(--text-soft)    /* #496155 — descriptions */
var(--text-muted)   /* #7a9185 — labels, captions */

/* Borders */
var(--line)         /* #ddd2ba — standard */
var(--line-light)   /* #ece5d5 — subtle dividers */
```

Typography:
- Headings: `var(--font-fraunces)` (Fraunces serif)
- Body and UI: `var(--font-manrope)` (Manrope sans-serif)
- Fluid headings use `clamp()` — do not replace with fixed sizes

Container width: `min(1200px, calc(100% - 48px))` — provides max-width on desktop and responsive padding on mobile.

Section padding: `80px 0` standard, `98px 0 44px` for the hero.

Hover animations use `transform: translateY(-2px)` and `transition: 0.22s` — stick to GPU-friendly transform/opacity properties only.

---

## API Routes Used

| Route | Used By | Purpose |
|-------|---------|---------|
| `POST /api/book-call` | HeroSection modal | Submit booking form |
| `POST /api/roi/email` | ROICalculator | Lead capture email |
| `app/api/billing/` | Pricing section CTAs | Stripe checkout |

---

## Testing the Homepage

```bash
npm run dev   # http://localhost:3000
```

Check these on every significant change:

- Hero image loads at correct size on mobile and desktop
- "Book a free 15-min call" modal opens, all fields validate, conditional "Platform name" field appears when `usesTraining = yes`
- ROI sliders update projections in real time
- FAQ accordions expand and collapse
- Navbar sticky behavior on scroll
- Navbar collapses to hamburger below ~768px
- All CTA buttons link to correct routes (`/demo`, `/how-it-works`, `/pricing`)
- Footer language switcher is hidden on desktop, visible on mobile

To test mobile layout: Chrome DevTools → Toggle device toolbar (Cmd+Shift+M) → iPhone 14 Pro (393×852).
