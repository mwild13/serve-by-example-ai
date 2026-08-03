# Pages Redesign — Serve By Example

Redesign guidelines for the marketing site: the homepage and every secondary/sub-page. This document is a companion to `CLAUDE.md`, not a replacement — `CLAUDE.md` governs security, auth, and app architecture; this file governs marketing-page visual and structural decisions. Where the two conflict on styling rules (design tokens, fonts, no Tailwind), `CLAUDE.md` wins.

This document was written after auditing the actual current codebase (not aspirational docs). Findings that shaped the rules below are called out inline as **Current state** notes so the reasoning stays visible.

---

## 1. Scope

**In scope:**
- Homepage (`app/page.tsx` + `components/HeroSection.tsx`)
- All marketing sub-pages: `/platform`, `/pricing`, `/about`, `/how-it-works`, `/for-venues`, `/solutions/*` (5 pages), `/roi`, `/resources/*`, `/toolkit*`, `/roadmap`, `/security`, `/contact`, `/vs-generic-lms`, legal pages (`/privacy`, `/terms`, `/cookies`)
- Shared marketing chrome: `components/Navbar.tsx`, `components/Footer.tsx`, `components/ui/SectionHeading.tsx`, `components/SectionSubNav.tsx`, `components/VenueMarquee.tsx`
- Any new shared components this redesign introduces (see Section 3)

**Out of scope unless explicitly requested:**
- `/dashboard` (staff learning UI) and `/management/dashboard` (Manager Mission Control) — these are logged-in product surfaces with their own density and interaction constraints, not marketing pages. Do not port marketing-page patterns (bento grids, big serif stat numbers) into them.
- `ManagerControlCenter.tsx` — per `CLAUDE.md`, this file is ~3,965 lines and must not grow. Not touched by this redesign.
- Auth pages (`/login`, `/reset-password`, `/onboarding`) — functional flows, evaluated separately.

**Definition of "cohesive":** a visitor should not be able to tell which page was built first. Right now they can — `/about` uses a plain centered `.about-grid`, `/platform` uses Unicode glyphs (`◉ → ◈ ✦ ◆ ▣`) as feature icons, and the `/solutions/*` pages hand-code inline SVGs. Cohesion means one hero pattern, one feature-grid pattern, one icon system, one CTA-band pattern, reused everywhere with only content changing.

---

## 2. Target UX/UI Goals

### 2.1 What "high-end, human-designed" means here

The benchmark is not "looks like it was built by a design team" in the abstract — it's specific, checkable things:
- **Asymmetry with intent.** Not every section centers. A human designer varies left/right weight, alternates image-left/image-right, and lets some sections breathe off-center. Currently 28 separate instances across 13 files use the identical `section-header center` pattern (eyebrow → centered `h2` → centered `p`). If every section opens the same way, the page reads like a template, because it is one.
- **Typographic hierarchy that does work, not just size steps.** Fraunces (headings) and Manrope (body) are good font choices already — the redesign's job is contrast and rhythm between them (weight, size ratio, line-length), not swapping fonts.
- **Photography and real detail over decoration.** The site currently leans on stat cards with big numbers (`3×`, `100+`, `19`, `15+`, `40+`) as its primary visual interest. Numbers-as-hero-content is a pattern every SaaS site with nothing else to show uses. Where real photography, screenshots, or specific proof exists, it should carry more visual weight than another stat card.
- **Restraint on card-and-grid decomposition.** Not everything is a card in a `repeat(auto-fit, minmax(...))` grid. Bento grids, feature-icon-grids, and stat-card rows are currently the default answer for every section (`bento-grid`, `sol-feature-grid`, `benefit-grid`, `metrics-strip` — four different grid systems doing similar jobs). Some content should just be a well-set paragraph.

### 2.2 Explicitly avoid

- **Centered-everything layouts.** Default to left-aligned or asymmetric section headers. Reserve centering for genuinely climactic moments (final CTA, hero) — not every section.
- **Generic gradient backgrounds** as a substitute for a real background decision. If a section needs visual separation, use `--bg` / `--bg-alt` / `--surface` shifts, a border, or a photograph — not an invented gradient.
- **Stock "3 icon + heading + paragraph" feature grids** as the default answer for any list of more than two things. This is currently the answer on `/platform`, every `/solutions/*` page, and the homepage's benefit grid. Vary the presentation: some feature sets work better as a table, a timeline, an annotated screenshot, or a two-column list with inline detail.
- **Unicode glyphs as icons.** `/platform`'s `◉ → ◈ ✦ ◆ ▣` is a tell that reads as unfinished, not minimal. Every icon ships as a proper SVG component (Section 3.4).
- **Numbers-as-hero-visual-interest** as a crutch. Metrics are supporting evidence, not the main event, unless the metric itself is the story (e.g. ROI calculator output).
- **The "eyebrow / h2 / centered p" section-open** as a universal default. It's fine as one tool in the kit, not the only tool.

### 2.3 Accessibility is not optional polish

Existing `--text-soft` / `--text-muted` tokens already carry AAA-contrast comments in `globals.css` — preserve that discipline. Any new color combination introduced by this redesign must be checked against WCAG AA minimum (4.5:1 body text, 3:1 large text/UI) before it ships. Run the `design:accessibility-review` skill against any new page template before merge.

---

## 3. Component Architecture Rules

**Current state:** the only genuinely shared marketing UI today is `Navbar.tsx`, `Footer.tsx`, and `SectionSubNav.tsx`. `SectionHeading.tsx` exists (`eyebrow` / `title` / `copy` props) but most pages ignore it and hand-roll the equivalent markup inline instead — meaning the one abstraction that exists isn't trusted or used. `HeroSection.tsx` is homepage-only; every sub-page hero is a bespoke `<section className="inner-hero ...">` block copy-pasted and slightly modified per page (`sol-hero` on solutions pages, plain `inner-hero` on `/about`, breadcrumb present on some, absent on others). This redesign does not ship if it doesn't fix that.

### 3.1 New shared components to build (in `components/marketing/`)

| Component | Replaces | Notes |
|---|---|---|
| `PageHero.tsx` | Every hand-coded `.inner-hero` block | Props: `eyebrow`, `title`, `subtitle`, `breadcrumb?`, `actions?` (CTA links), `variant?: 'default' \| 'solution'`. Every sub-page hero renders through this, no exceptions. |
| `SectionHeading.tsx` (extend, don't replace) | The 28 hand-rolled `section-header center` divs | Add an `align?: 'left' \| 'center'` prop, default `'left'`. Every section header in the redesign uses this component. |
| `FeatureGrid.tsx` | `bento-grid`, `sol-feature-grid`, `benefit-grid` (currently three near-identical implementations) | Single configurable grid: column count, card variant (icon-card, dark-card, stat-card), icon slot typed to the shared icon set (3.4). |
| `MetricsStrip.tsx` | `metrics-strip` / "System Specifications" stat-card row | One implementation, used wherever a horizontal stat row is needed. |
| `CTABand.tsx` | The repeated `section-cta` pattern (full-bleed color band, heading, one or two buttons) | Props for one-button vs two-button layout, background variant (`green` / `gold` / `neutral`). |
| `LogoMarquee.tsx` (rename/extend `VenueMarquee.tsx`) | Current text-only category marquee | Once real venue logos are provided (see asset list), this renders actual logo images with the existing scrolling-track mechanics kept. |

Every page listed in Section 1 must be rebuilt to consume these instead of inline-styling its own version. A page that still hand-rolls its own hero or feature grid after this redesign is a bug, not a stylistic choice.

### 3.2 Composition rule

Page files (`app/**/page.tsx`) stay thin: metadata export, JSON-LD schema (keep — it's good SEO practice, don't remove), and a sequence of shared components with content props. Page-specific one-off sections (e.g. the homepage founder story) are allowed to exist as page-local components, but the moment a second page needs something structurally similar, it graduates to `components/marketing/`.

### 3.3 Server/client boundary

Per `CLAUDE.md`: server components fetch and pass props, client components handle interaction. Marketing pages are almost entirely static content — default every new component to a server component. Only mark `'use client'` where there's real interactivity (`Navbar`'s dropdown state, `ROICalculator`'s inputs, mobile menu toggles). `HeroSection.tsx` is currently `'use client'` with zero client-side state or handlers — that directive should be removed as part of this redesign unless a specific interactive element is added to the hero.

### 3.4 Icon system — pick one, use it everywhere

**Current state:** three icon strategies coexist — `lucide-react` (`ChevronDown` in `Navbar.tsx`), a hand-rolled SVG set in `components/icons/MarketingIcons.tsx`, raw inline `<svg>` markup copy-pasted directly into `/solutions/*` page files, and Unicode glyph characters on `/platform`. Consolidate to: `lucide-react` for UI chrome (chevrons, close buttons, nav affordances) and `MarketingIcons.tsx` for all content/feature icons. Delete inline per-page SVGs and Unicode glyphs as pages are migrated to `FeatureGrid.tsx`.

### 3.5 Sub-nav pattern

`SectionSubNav.tsx` (sticky in-page nav, currently used on `/platform`, `/how-it-works`, `/security`, `/roi`, `/vs-generic-lms`, `/resources/sop-toolkit`) is a good pattern for long single-page templates — keep it, and apply it consistently: any page over ~4 sections gets one, any page under that doesn't. Don't leave it as an ad hoc choice per page.

---

## 4. Design System Rules

### 4.1 Tokens — use only what exists in `app/globals.css`

No new hex values, ever — this is already a hard `CLAUDE.md` rule, and `scripts/lint-css-tokens.mjs` already enforces it at the code level (`process.exit(violations.length > 0 ? 1 : 0)`, currently passing clean). Note: the script's own header comment still describes an older "informational only, exits 0" state and instructs flipping the exit code later — that comment is stale relative to the code beneath it and should be corrected as a small cleanup. Two things to do as part of this redesign:

- **Wire `npm run lint:css` into CI** if it isn't already — the script enforces locally but that only matters if it runs on every PR.
- **Stop introducing new class-name prefix families.** `globals.css` (17,495 lines) already has `sbe-*` (homepage bento grid), `mkt-*` (marketing buttons/cards), `ip-*` ("Industrial Premium," mobile dashboard), `ops-*`, `status-*`, `color-*`, and several one-off aliases with comments documenting past duplicate-token drift (`--color-text-muted` aliasing `--text-muted`, old `--text-soft`/`--text-muted` values overridden by a later duplicate `:root` block). Every class this redesign adds uses a single new prefix — `sbe-mkt-` is available and already partially used — and nothing else. No new `:root` blocks; add tokens to the existing one.

**Color tokens** (reference by name, never hardcode):
- Backgrounds: `--bg`, `--bg-alt`, `--bg-warm`, `--surface`, `--surface-raised`
- Brand: `--green`, `--green-deep`, `--green-mid`, `--green-light`, `--gold`, `--gold-warm`, `--gold-deep`, `--gold-light`
- Text: `--text`, `--text-soft`, `--text-muted` (both already AAA-checked per in-file comments — don't introduce a fourth gray)
- Borders: `--line`, `--line-light`, `--line-faint`
- Status (only where genuinely showing state, not for decoration): `--status-good` / `--status-warn` / `--status-error` families

**Radius:** `--radius-sm` (10px) small elements (badges, pills-adjacent), `--radius-md` (14px) buttons/inputs, `--radius-lg` (20px) cards, `--radius-xl` (28px) large feature panels/hero media.

**Shadow:** `--shadow-xs`/`sm` for resting cards, `--shadow-md` for hover/raised states, `--shadow-lg`/`xl` reserved for modals and the most prominent single element on a page (never more than one `--shadow-xl` element per viewport).

### 4.2 Typography

- Headings: `var(--font-fraunces)` exclusively. No other serif.
- Body: `var(--font-manrope)` exclusively. No other sans.
- Establish and document an explicit type scale as part of this redesign. The hero H1 already does this correctly — `clamp(26px, 4vw, 50px)` defined once in `.hero h1` in `globals.css`, referenced from the component via className. The SOP lead-magnet banner heading breaks that pattern: it sets `fontSize: 'clamp(1.85rem, 4vw, 2.6rem)'` inline in `app/page.tsx` instead of through a class. Standardize on the hero's approach — every heading size is a CSS class with its `clamp()` defined once in `globals.css`, never an inline `clamp()` in a page file. Recommended scale, each step a fixed `clamp()` definition:
  - Hero H1, Section H2, Card H3, Body-lg, Body, Caption/eyebrow — six steps, each with a fixed `clamp()` definition.

### 4.3 Layout grid

- `.container` (already defined, max-width wrapper) stays the outer constraint for all page content.
- Section vertical rhythm: standardize spacing between sections (currently varies — some sections pad `2rem`, others `5rem`, set inline per section). Define `--section-spacing-sm/md/lg` tokens and use them everywhere instead of inline `padding` values.
- Grids: 12-column conceptual grid for desktop (`FeatureGrid.tsx` and `MetricsStrip.tsx` implement this internally via CSS Grid `repeat()` — page authors never write raw `gridTemplateColumns` inline again).

### 4.4 Responsiveness

- Mobile-first breakpoints, consistent with what's already in `globals.css`'s existing media queries — don't introduce a new breakpoint scale.
- Every new shared component (Section 3.1) ships with an explicit mobile layout as part of its definition, not as an afterthought media query bolted on later.
- Hero media (product screenshots) must have real mobile crops or alternate compositions where the desktop screenshot's aspect ratio doesn't hold up narrow — currently `HeroSection.tsx`'s showcase image is a single 1400×875 asset scaled down via `sizes`, which is acceptable for now but should be revisited if the hero composition changes.

---

## 5. Conversion & Messaging Goals

### 5.1 Core value propositions (from existing copy — keep these, don't reinvent)

1. **Speed:** "Turn 6 months of onboarding into 6 weeks" — the single clearest, most specific claim on the site. This should stay the primary hero message; don't dilute it with a more generic headline in the redesign.
2. **No manager pulled off the floor:** the operational-cost argument (training doesn't cost you your best staff's time) is distinct from the speed claim and should stay visible, not buried.
3. **Two audiences, one platform:** staff get scenario practice and mastery tracking; managers get real-time visibility with zero admin overhead. Every sub-page should make clear which audience it's talking to, or explicitly address both.
4. **Built by an operator, not a vendor:** the founder story (15 years in Australian hospitality) is genuine differentiation against generic LMS competitors — it deserves more prominence than a single mid-page block with one photo, not less.

### 5.2 Strategic user flow: hero → sub-pages

- **Homepage hero** commits to the speed claim and one primary CTA (Start Free Trial). Keep it to one primary action — the current single hero-CTA-tile pattern is correct, don't add a second competing CTA into the hero itself.
- **Platform / Solutions pages** are where the "how" gets proven — this is where screenshots, real feature detail, and specificity belong. These pages currently do the most copy-paste-and-modify (see Section 3), which is exactly why they're the highest-priority target for the new shared components.
- **Pricing** is the commitment moment — needs the clearest possible information hierarchy of any page on the site (it's currently 965 lines, the largest page file by far, which is itself a signal it's carrying too much inline one-off markup and needs the same component extraction treatment as everything else).
- **Every page ends with one clear next action** via `CTABand.tsx` — either "Start Free Trial" or "Try the Demo," never both presented with equal visual weight on the same band. Pick one primary per page based on that page's position in the funnel (top-of-funnel content pages → demo; solution/pricing pages → trial).

### 5.3 Social proof gap

**Current state:** `VenueMarquee.tsx` shows venue *category* labels (Hotels, Bars, Restaurants, Pubs, Franchises), not real customer names or logos — there is currently no third-party social proof anywhere on the site. This is a conversion gap, not a design gap. If real customer logos, testimonials, or case-study data become available (see asset request list), `LogoMarquee.tsx` and a new testimonial component should be prioritized above further visual polish — proof of real usage will move conversion more than another layout pass.

### 5.4 Guarantee and risk-reversal messaging

The "14-Day Performance Guarantee" and "Zero risk to your floor operations" messaging currently appears as two separate, slightly redundant blocks on the homepage. Consolidate into one clearly designed risk-reversal moment near the pricing/CTA decision point rather than two similar claims competing for attention in different sections.

---

## 6. Phase 1 Blueprint — Hero & Sub-Page Redesign (August 2026)

Written after reviewing: current codebase (`HeroSection.tsx`, `globals.css` tokens), FireShot captures of the live homepage/platform/solutions/membership/about pages, `SBE_Hero_Reconciliation_Report.docx`, and a live teardown of lemmonade.au. Copy decisions below defer to `SBE-Marketing-Audit-July2026.md` and the reconciliation report — **headline and CTA wording are locked, not up for redesign.**

### 6.1 Hero layout — 60/40 asymmetric split

Desktop: CSS Grid `7fr / 5fr` (copy left, product right), `min-height: 88vh`, gap `clamp(2rem, 5vw, 5rem)`. Replaces the current fully-centered stack with the tilted-perspective screenshot below the fold.

**Left column (60%) — top-aligned, left-aligned, max line length 20ch on H1:**

1. Eyebrow (Manrope, caps, `--gold` on dark): "Built for Australian pubs, bars & venues" — this is where the AU-hospo targeting lives. Do not put it in the H1.
2. H1 (locked): "Turn 6 Months of Onboarding Into 6 Weeks."
3. Subhead (locked): "Deliver the exact standard your best manager enforces, without pulling them off the floor."
4. Primary CTA: "Start Free Trial" — `--gold-warm` background, `--green-deep` text, `--radius-sm`. Microcopy beneath: "14-day free trial. No credit card required. Set up in under 10 minutes."
5. Secondary: "How it works" text link (existing pattern, keep).
6. Trust row (real numbers only): "3× faster onboarding · 100+ modules & scenarios · 19 languages" as a single quiet line, replacing the "System Specifications" stat-card band's job above the fold. **No venue counts, star ratings, or testimonials until real customers exist.**

**Right column (40%) — live HTML product teaser, not an image:**

Follow Lemmonade's hero move: a working-looking, HTML/CSS re-creation of real product UI rather than a screenshot. Composition: the Pre-Shift Brief card (from `PreShiftHome`) as the base layer, with an AI Arena scenario score card (5-dimension score) overlapping its lower-right corner. Optional third layer: a small "Manager view" pill/toast. Subtle entrance stagger on load (`prefers-reduced-motion` respected), no 3D tilt, no floating device frames, no autoplay video. Reuse or evolve `HeroPlayableSandbox.tsx` if interactivity is added; otherwise this is static markup and ships as a server component (remove the current `'use client'` from `HeroSection.tsx`).

**Background:** dark hero moment per the reconciliation report — redefine the two unused tokens `--bg-dark: #1B2A2F` and `--bg-dark-soft: #2A3B40` in the existing `:root` block (zero current usage, safe). Text: `--text-light-on-dark` / `--text-light-muted-on-dark`. This gives the site its one high-contrast anchor; everything below returns to parchment (`--bg`).

**Mobile:** single column — eyebrow → H1 → subhead → CTA + microcopy → trust row → teaser (simplified single card, real mobile crop). Sticky bottom CTA bar (`--bg-dark` bar, `--gold-warm` button, 48px min tap target) persistent through scroll.

### 6.2 Sub-page hero pattern

Every sub-page hero renders through `PageHero.tsx` (Section 3.1) using the same 60/40 grid at reduced height (`min-height: 48vh`), light background variant (`--bg-alt`) by default, dark variant reserved for `/for-venues` and `/pricing` only. Right column slot accepts either a product still, a stat, or nothing (collapses to 100% copy width). This kills the five divergent `.inner-hero` / `.sol-hero` implementations.

### 6.3 Section rhythm below the hero

- Alternate section alignment: left-header → 60/40 media-right → 40/60 media-left. Centered headers only on the final `CTABand`.
- Homepage order: Hero → honest trust row (in-hero) → "Two roles" split (existing dark/light card pair is good, keep) → annotated product walkthrough (replaces one icon-grid) → founder story (promote; it is the only real social proof; keep the quote, cut the 15+/100s/40+ stat-card row under it — numbers-as-decoration) → risk-reversal moment (consolidated guarantee, per 5.4) → CTABand.
- `/platform`: replace the `◉ → ◈ ✦ ◆ ▣` Unicode grid with `FeatureGrid.tsx` + `MarketingIcons.tsx` in the first migration PR.

### 6.4 Design token plan

**Colors:** no new hexes. Only change: redefine `--bg-dark`/`--bg-dark-soft` as above. CTA brass = existing `--gold-warm`. Do not add a sage/ivory token.

**Type scale — define once in `:root`, consume everywhere (no per-section `clamp()` re-invention):**

```css
--fs-hero:    clamp(2.4rem, 5.5vw, 4.2rem);   /* Fraunces 600, lh 1.05, ls -0.015em */
--fs-h2:      clamp(1.8rem, 3.5vw, 2.6rem);   /* Fraunces 600, lh 1.15 */
--fs-h3:      clamp(1.15rem, 2vw, 1.35rem);   /* Fraunces 500 or Manrope 700 */
--fs-body-lg: clamp(1.05rem, 1.5vw, 1.2rem);  /* Manrope 400, lh 1.6 — hero subhead */
--fs-body:    1rem;                            /* Manrope 400, lh 1.65 */
--fs-caption: 0.8rem;                          /* Manrope 600, caps, ls 0.08em — eyebrows */
```

**Spacing:** `--section-spacing-sm: clamp(3rem, 6vw, 4.5rem)`, `--section-spacing-md: clamp(4.5rem, 9vw, 7rem)`, `--section-spacing-lg: clamp(6rem, 12vw, 9.5rem)`. Replace all inline section padding.

**Component structure:** build order is `PageHero` → `SectionHeading` (add `align` prop) → `CTABand` → `FeatureGrid` → `MetricsStrip` → `LogoMarquee` (blocked on real logos). All new classes under the `sbe-mkt-` prefix; run `design:accessibility-review` on the dark hero (gold-on-navy CTA and muted text must clear WCAG AA) before merge.

### 6.5 Sequencing guardrails (from the reconciliation report — binding)

1. Hero restyle may build now in parallel; it touches only `HeroSection.tsx` + `.hero*`/token rules in `globals.css`.
2. No marketing push until `SBE-Execution-Checklist-July2026.md` Phase 1 (cookies domain, ACCC-risk claims, "Three Systems" factual fix) closes.
3. No fabricated social proof anywhere, ever. Honest early-access framing only.
4. A/B test alternative headlines only after real traffic exists.
