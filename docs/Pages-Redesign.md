# Pages Redesign — Serve By Example

The visual and structural standard for the marketing site. It is a companion to `CLAUDE.md`, not a replacement: `CLAUDE.md` governs security, auth and app architecture, and wins wherever the two conflict on styling rules (design tokens, fonts, no Tailwind).

**Status, October 2026.** The homepage was rebuilt on branch `preview/homepage-ui-overhaul` and is now the reference implementation. Every other marketing page still uses the August 2026 component set (`PageHero`, `FeatureGrid` cards, `MetricsStrip`). Those pages work and are consistent with each other, but they are the previous standard. Section 7 covers how to bring them across.

This document replaces the August 2026 version in full. Code comments across the repo still cite the old section numbers; section 9 maps them to this version.

---

## 1. Scope

**In scope:**

- Homepage: `app/page.tsx`, `components/HeroSection.tsx`, `components/ui/ROICalculator.tsx`
- Marketing sub-pages: `/platform`, `/pricing` and `/membership`, `/about`, `/how-it-works`, `/for-venues`, `/solutions/*`, `/roi`, `/resources/*`, `/toolkit*`, `/roadmap`, `/security`, `/contact`, `/vs-generic-lms`, `/advisory`, `/demo*`, and the legal pages
- Shared marketing chrome: `components/Navbar.tsx`, `components/Footer.tsx`, `components/SectionSubNav.tsx`, and everything in `components/marketing/`

**Out of scope unless explicitly requested:**

- `/dashboard` and `/management/dashboard`. These are logged-in product surfaces with their own density rules. Do not port marketing patterns into them.
- `ManagerControlCenter.tsx`. Per `CLAUDE.md` it must not grow.
- Auth pages (`/login`, `/reset-password`, `/onboarding`).

The full route table lives in `docs/MARKETING_SITE.md`.

---

## 2. The standard

The homepage reads as designed rather than assembled because of six decisions. New marketing work follows all six.

### 2.1 Separate content without boxes

Sections and items are divided by a background shift, a hairline rule or whitespace. They are not placed in bordered, rounded, shadowed cards.

- **Background shifts:** `--bg` (parchment), `--bg-alt`, `--bg-warm`, and the dark band (`--bg-dark` to `--bg-dark-soft`).
- **Hairlines:** `1px solid var(--line)` on light, `var(--border-light-on-dark)` on dark.
- **Rounded corners and shadows** are for things that are objects: buttons (`--radius-sm`) and product screenshots (`.sbe-shot`). A block of text is not an object.

### 2.2 Break the grid on purpose

- **Headers are left-aligned.** Centring is reserved for the final CTA band and the SOP lead band.
- **Columns are unequal.** 5/7 and 4/7 splits, not 6/6.
- **Something leaves the container.** The dark systems panel bleeds off the right edge and hangs 4rem into the next section. Product screenshots run up to 72px past the container. The phone overlaps the corner of the library screenshot.
- **Sequences are staggered.** The three Mastery Path steps step down the page instead of sitting in a level row.

### 2.3 One composition per section

No two neighbouring sections use the same layout. The homepage runs: split panel, portrait with pull quote, alternating media rows, staggered numbered steps, ledger rows, centred band, sticky intro with ruled list, instrument panel, sticky heading with accordion, centred band. If a new section would repeat its neighbour's layout, pick a different pattern from section 4.

### 2.4 Type does the hierarchy

Fraunces at display size with tight tracking sits against small, widely tracked Manrope capitals. That contrast replaces icons, pills and coloured tiles as the way to signal structure. Oversized Fraunces numerals (`01`, `24/7`, the calculator total) are used where a number is the content.

### 2.5 Real product over decoration

Screenshots of the actual product carry the visual weight. There are no decorative icons on the homepage apart from the SOP band's document glyph, and no stat cards.

### 2.6 Motion is small and CSS-only

No animation library. Motion is limited to state changes the visitor causes: the accordion opening, a hover nudge on a row, a slider thumb. Everything is switched off under `prefers-reduced-motion`.

### 2.7 Do not ship

- A grid of bordered, rounded, shadowed cards as the answer to "here are several things".
- A centred eyebrow, heading and paragraph as the default section opening.
- Pill-shaped eyebrow badges. Use `.sbe-mkt-kicker`.
- Icon tiles (an icon in a tinted rounded square) beside headings.
- Gradients as decoration. The one sanctioned gradient is the dark band.
- Unicode glyphs or emojis as icons.
- Numbers used as decoration when they are not the point of the section.
- Tailwind classes, Shadcn components, or a motion library.

---

## 3. Homepage reference

`app/page.tsx` is a server component. Content lives in constants at the top of the file (`FAQS`, `SYSTEMS`, `STEPS`, `MEASURES`, `PLANS`); the markup below maps over them. `FAQS` feeds both the accordion and the FAQPage JSON-LD, so the two cannot drift apart.

| # | Section | Root class | Pattern |
|---|---|---|---|
| 1 | Hero and marquee | `.sbe-mkt-fold` | Dark 60/40 hero, one primary CTA. Unchanged in October. |
| 2 | Two systems | `.sbe-mkt-duo` | Parchment lead on the left; dark panel bleeds right and overhangs the next section. |
| 3 | Founder | `.sbe-mkt-founder` | Portrait, statement, italic pull quote under a hairline. |
| 4 | Two views | `.sbe-mkt-showcase` | Alternating text and screenshot rows; screenshots break out of the container. |
| 5 | Library and mobile | `.sbe-mkt-showcase-warm` | Two text blocks beside one screenshot, with the phone overlapping its corner. |
| 6 | Mastery Path | `.sbe-mkt-path` | Dark band, split header, three staggered numbered steps. |
| 7 | What gets measured | `.sbe-mkt-measures` | Ledger rows: numeral, label, explanation. |
| 8 | SOP lead band | `.sbe-mkt-leadband` | Centred dark band. |
| 9 | Plans | `.sbe-mkt-plans` | Sticky intro and CTA on the left, ruled plan list on the right, one guarantee statement. |
| 10 | Revenue Impact Calculator | `.sbe-mkt-roi` | Full-bleed dark band; sliders and email form left, readout right. |
| 11 | FAQ | `.sbe-mkt-faq` | Sticky heading left, hairline accordion right. |
| 12 | Final CTA | `CTABand` | Centred dark band, one action. |

Anchors in use: `#feature-preview`, `#mastery-path`, `#roi-calculator`. Keep them when editing.

---

## 4. Building blocks

All of this is in the "Homepage editorial layout" block at the end of `app/globals.css`.

### 4.1 Type primitives

| Class | Use |
|---|---|
| `.sbe-mkt-kicker` | Small caps label with a short rule before it. Replaces the pill eyebrow. |
| `.sbe-mkt-display` | Section heading. Fraunces 500 at `--fs-display`. |
| `.sbe-mkt-lede` | Intro paragraph at `--fs-body-lg`, capped at 34rem wide. |
| `.sbe-mkt-head` | Wrapper for kicker, heading and lede. |
| `.sbe-mkt-head-split` | Puts the heading left and the lede right from 900px up. |
| `.sbe-mkt-on-dark` | Add to a dark section to recolour the four classes above. |

### 4.2 Layout patterns

| Pattern | Classes | Use it for |
|---|---|---|
| Split panel | `.sbe-mkt-duo`, `-lead`, `-panel`, `-item` | A claim on one side and two or three proofs on the other. |
| Media rows | `.sbe-mkt-show-row`, `-row-flip`, `-media-end`, `-media-start` | Product screenshots with a short explanation. Alternate direction row to row. |
| Overlapping media | `.sbe-mkt-show-stack`, `.sbe-mkt-show-phone` | A second image standing over the corner of the first. |
| Numbered steps | `.sbe-mkt-path-steps`, `-step`, `-num` | A sequence of three. Dark band only. |
| Ledger rows | `.sbe-mkt-ledger`, `-row`, `-metric`, `-title` | Facts where a number leads. |
| Ruled list with sticky intro | `.sbe-mkt-plans-grid`, `-intro`, `-list`, `.sbe-mkt-plan` | A short list of options beside the heading and CTA that apply to all of them. |
| Hairline accordion | `.sbe-mkt-faq-grid`, `-list`, `-item`, `-q`, `-icon`, `-a` | Questions and answers. Uses native `<details name="…">`, so one answer is open at a time. |
| Pull quote | `.sbe-mkt-pullquote` | A first-person statement from a named, real person. |

### 4.3 Shared components (`components/marketing/`)

| Component | Status |
|---|---|
| `CTABand` | Current. Every marketing page ends with exactly one. One primary action; the optional secondary is a text link. |
| `PageHero` | Current. Every sub-page hero renders through it. |
| `LogoMarquee` | Current. Shows venue category text until real customer logos exist. |
| `SectionHeading` (`components/ui/`) | Previous standard. Still used on sub-pages. New sections use `.sbe-mkt-head` with a kicker. |
| `FeatureGrid` | Previous standard. Card grid. Do not use for new sections; replace it page by page (section 7). |
| `MetricsStrip` | Previous standard. Stat row. Prefer ledger rows. |

`ROICalculator` (`components/ui/`) is shared by `/`, `/membership` and `/roi`. A change to it changes all three.

### 4.4 Composition rules

- **Page files stay thin:** metadata, JSON-LD, content constants, then markup.
- **Server components by default.** `'use client'` only where there is real interaction (`Navbar`, `ROICalculator`).
- **A section used on one page stays in that page file.** When a second page needs the same structure, move it to `components/marketing/`.
- **Icons:** `lucide-react` for interface chrome (chevrons, close buttons); `components/icons/MarketingIcons.tsx` for content icons. The homepage now uses neither in its body, and that is the preferred direction.
- **`SectionSubNav`:** any page with more than about four sections gets one. Shorter pages do not.

---

## 5. Design system rules

### 5.1 Tokens

- **No new hex values.** Reference tokens from the single `:root` block in `app/globals.css`. `npm run lint:css` reports raw hex values; the count must not rise.
- **One class prefix: `sbe-mkt-`.** Do not start a new prefix family, and do not add a second `:root` block.
- **Dark sections** use the `*-on-dark` tokens for text and borders, with `--nav-cream` for headings and `--gold-warm` for accents.

### 5.2 Type scale

Defined once in `:root`. Do not write a new `clamp()` in a page file.

| Token | Value | Use |
|---|---|---|
| `--fs-hero` | `clamp(2.4rem, 5.5vw, 4.2rem)` | Hero H1 only |
| `--fs-display` | `clamp(2rem, 3.6vw, 3.25rem)` | Section headings |
| `--fs-numeral` | `clamp(3.5rem, 8vw, 6.5rem)` | Step numbers |
| `--fs-h2` | `clamp(1.8rem, 3.5vw, 2.6rem)` | Sub-headings inside a section |
| `--fs-h3` | `clamp(1.15rem, 2vw, 1.35rem)` | Minor headings |
| `--fs-body-lg` | `clamp(1.05rem, 1.5vw, 1.2rem)` | Ledes |
| `--fs-body` | `1rem` | Body |
| `--fs-caption` | `0.8rem` | Kickers and labels |

| Token | Value | Pairs with |
|---|---|---|
| `--tracking-display` | `-0.035em` | `--fs-display`, `--fs-numeral` |
| `--tracking-heading` | `-0.02em` | `--fs-h2`, `--fs-h3` |
| `--tracking-caps` | `0.14em` | `--fs-caption` in capitals |
| `--lh-display` | `1.02` | Display headings |
| `--lh-heading` | `1.18` | Sub-headings |
| `--lh-body` | `1.65` | Body |

Fraunces is loaded at weights 400 to 600 only. Display headings use 500, numerals and the pull quote use 400. Do not ask for 700.

`--fs-display` was first set at 3.75rem and was cut to 3.25rem after review at 1920px. Do not raise it again without checking the page at that width.

### 5.3 Spacing and width

- **Section padding:** `--section-spacing-sm`, `-md` or `-lg`. Most sections use `-md`. The calculator uses `-sm` so it fits one screen.
- **Column split:** side-by-side layouts start at `min-width: 900px`. Below that everything stacks.
- **`.container` changes width at four breakpoints** (600px, 1400px, 1700px, and the default). Anything that bleeds out of the container must use `--page-gutter`, which is overridden at the same breakpoints on `.sbe-mkt-duo` and `.sbe-mkt-showcase`. If a new section bleeds, add its class to those three media queries.
- **A section that bleeds needs `overflow-x: clip`** so it cannot cause a horizontal scrollbar.

### 5.4 Interactive sections fit one screen

A section the visitor operates (the calculator, a form) must fit in a 1440×900 window with its submit control visible, without scrolling. The calculator was 1,136px tall on first build and its email form sat below the fold; it is now 828px, with the form under the sliders. On phones the order is sliders, readout, then form.

### 5.5 Motion

- **Easing:** `--ease-out` for most transitions, `--ease-spring-soft` (about 6% overshoot) for small parts such as the accordion icon and slider thumb.
- **Accordion height** animates only in browsers that support `interpolate-size`. Elsewhere it opens instantly and the answer fades in. Do not add JavaScript to close that gap.
- **Every new transition** goes in the `prefers-reduced-motion` block at the end of the homepage styles.

### 5.6 Accessibility

- **Contrast:** WCAG AA at minimum (4.5:1 body text, 3:1 large text and interface parts). `--text-soft` and `--text-muted` are already AAA on light surfaces. On light backgrounds use `--gold-deep` for small text, never `--gold-warm`.
- **Focus:** every interactive element keeps a visible focus ring. The custom slider and the accordion summary define their own.
- **Semantics carry the structure.** Steps are an `<ol>`, facts are a `<dl>`, plans are a `<ul>`, the accordion is `<details>`.
- **Decorative numerals** are `aria-hidden`.

---

## 6. Copy rules

### 6.1 Locked

- **Hero headline, subhead and CTA** in `components/HeroSection.tsx` are locked by `SBE-Marketing-Audit-July2026.md`. Do not reword them without a new audit pass. The marketing e2e suite asserts the sticky bar's "Start Free Trial" label.
- **Navigation labels** are shared across every page and stay plain.

### 6.2 Microcopy

- **Kickers** name the thing in the visitor's words ("Who built this", "Before you start"), not a category ("Our Story", "FAQ").
- **Buttons** say what happens next in the first person ("Build my venue SOP", "Send my projection", "Start my 14-day trial").
- **Section intros** are one or two plain sentences. No "everything you need", "seamless", "powerful" or similar filler.
- **Do not name the AI model** in marketing copy.
- **Existing claims** (six weeks, 14-day guarantee, five scored dimensions, 40 modules) are reworded only with the owner's sign-off.

### 6.3 Proof

- **No testimonials, customer logos, case studies or unsourced outcome figures.** None exist yet. The founder story is the only real proof on the site and is treated as such.
- **One risk-reversal statement per page,** placed at the pricing or CTA decision point.

### 6.4 What every page must say

1. **Speed:** six months of onboarding into six weeks.
2. **No manager pulled off the floor.**
3. **Two audiences, one platform:** staff practise and are scored; managers see it without admin.
4. **Built by an operator:** 15 years in Australian hospitality.

### 6.5 Calls to action

- **One primary action per page.** Top-of-funnel pages point to the demo; solution and pricing pages point to the trial.
- **Links into `/contact`** can carry `?source=<slug>&package=<slug>`. Tracking goes through `trackEvent` in `lib/consent.ts`.

---

## 7. Bringing the other pages across

### 7.1 Where things stand

| Area | State |
|---|---|
| Homepage | New standard. |
| `/advisory` | Close. Already uses ruled lists and a pull quote, with its own `sbe-adv-` classes and the old FAQ classes. |
| Pages using `FeatureGrid` (14 files) | Previous standard. Card grids. |
| Pages using `MetricsStrip` (5 files) | Previous standard. Stat rows. |
| Pages using the old `.faq-*` classes | `/pricing`, `/advisory`, `/resources/sop-toolkit`. |
| `/membership` and `/roi` | Already show the new calculator, inside their old page layout. |

### 7.2 Suggested order

1. **`/pricing` and `/membership`.** The commitment page, and the largest page file. Highest value.
2. **`/platform` and `/how-it-works`.** Where the product is explained; the media-row pattern fits directly.
3. **`/solutions/*`.** Five near-identical pages; do one, then apply it to the rest.
4. **`/about`, `/for-venues`, `/roi`.**
5. **Everything else.**

### 7.3 How to migrate a page

1. Replace each `FeatureGrid` with the pattern from section 4.2 that suits the content. Do not swap every grid for the same pattern.
2. Replace `SectionHeading` with `.sbe-mkt-head` and a kicker.
3. Move the FAQ to the `.sbe-mkt-faq-*` classes.
4. Keep `PageHero` and `CTABand`.
5. Check the page against section 8.

### 7.4 Cleanup owed

- **Unused homepage CSS** still in `app/globals.css`: `.solution-grid` and `.solution-col*`, `.mastery-step*`, `.benefit-*`, `.cta-box`, `.zero-risk-block`, `.section-band-green`, and `.sbe-slider-input`. Safe to delete once the new homepage is merged.
- **Two competing `.faq-list` / `.faq-item` blocks** in `app/globals.css`. Delete both when the last page moves to `.sbe-mkt-faq-*`.
- **`FeatureGrid`, `MetricsStrip` and `SectionHeading`** can be deleted when no page imports them.
- **`docs/HOMEPAGE.md`** describes the pre-August homepage and is out of date.

---

## 8. Before a marketing change ships

- **Widths:** check at 375, 1280, 1440 and 1920px. No horizontal scroll at any of them.
- **Interactive sections** fit a 1440×900 window (section 5.4).
- **Neighbouring sections** do not share a layout (section 2.3).
- **No item from section 2.7** has been introduced.
- **Commands:** `npx tsc --noEmit`, `npx eslint <changed files>`, `npm run lint:css` (count unchanged), `npm test`.
- **Marketing e2e** against the deployed preview: `PLAYWRIGHT_BASE_URL='<preview url>' npx playwright test -c playwright.marketing.config.ts`.

**Running the homepage locally.** There is no env file in the repo, and the navbar's Supabase client throws without its two public variables, which blanks the page. For layout work, start the dev server with placeholders:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-placeholder PORT=3111 npm run dev
```

This renders every public page. Nothing that needs a login will work. `next start` does not work locally because production mode geo-blocks requests with no Cloudflare country header.

---

## 9. Old section numbers

Code comments written before October 2026 cite the previous version of this document. Read them as follows.

| Old reference | Meant | Now in |
|---|---|---|
| §2.2 | Avoid centred-everything layouts; centre only climactic moments | 2.2, 2.7 |
| §3.1 | The shared component list (`PageHero`, `FeatureGrid`, `CTABand`, and so on) | 4.3 |
| §5.2 | One clear next action per page | 6.5 |
| §5.3 | No real customer proof yet; marquee shows categories | 6.3 |
| §5.4 | One consolidated guarantee statement | 6.3 |
| §6.1 | Hero layout and locked hero copy | 3 (row 1), 6.1 |
| §6.3 | Section rhythm; no stat-card rows as decoration | 2.3, 2.7 |
| §6.4 | Type scale and section spacing tokens | 5.2, 5.3 |
