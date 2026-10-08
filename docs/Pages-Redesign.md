# Pages Redesign — Serve By Example

The visual and structural standard for the marketing site. It is a companion to `CLAUDE.md`, not a replacement: `CLAUDE.md` governs security, auth and app architecture, and wins wherever the two conflict on styling rules (design tokens, fonts, no Tailwind).

**Status, October 2026.** Every marketing page is on this standard. The homepage was rebuilt first and is the reference implementation; `/pricing` (served at `/membership`) followed; the remaining pages were rebuilt on branch `preview/marketing-redesign`, which also moved the site to Newsreader and Inter. The August 2026 component set (`FeatureGrid`, `MetricsStrip`, `SectionHeading`) has been deleted. Section 7 records how the pages were brought across and how to build a new one.

This document replaces the August 2026 version in full. Code comments across the repo still cite the old section numbers; section 9 maps them to this version.

---

## 1. Scope

**In scope:**

- Homepage: `app/page.tsx`, `components/HeroSection.tsx`, `components/ui/ROICalculator.tsx`
- Marketing sub-pages: `/platform`, `/pricing` and `/membership`, `/about`, `/how-it-works`, `/for-venues`, `/solutions/*`, `/roi`, `/resources/*`, `/toolkit*`, `/roadmap`, `/security`, `/contact`, `/vs-generic-lms`, `/advisory`, `/demo*`, and the legal pages
- Shared marketing chrome: `components/Navbar.tsx`, `components/Footer.tsx`, `components/SectionSubNav.tsx`, and everything in `components/marketing/`

**Out of scope unless explicitly requested:**

- `/dashboard` and `/management/dashboard`. These are logged-in product surfaces with their own density rules. Do not port marketing patterns into them. The Manager Console's shell and Overview tab follow this document's principles (type, hairlines, restrained colour) through their own rules in `docs/MANAGER_CONSOLE.md` section 6, not through the `sbe-mkt-` classes.
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

Newsreader at display size, one weight (600), sits against small Inter capitals. That contrast replaces icons, pills and coloured tiles as the way to signal structure. Oversized Newsreader numerals (`01`, `24/7`, the calculator total) are used where a number is the content.

The pairing was chosen in October 2026 as the closest freely licensed match to ABC Marist and Antique Legacy. Section 5.2 has the detail.

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
| `.sbe-mkt-display` | Section heading. Newsreader 600 at `--fs-display`. |
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
| Price board | `.sbe-mkt-price-board`, `-intro`, `-plans`, `-col`, `-col-featured`, `-franchise` | Priced plans. Four equal tracks: intro and billing toggle, then three plans divided by hairlines, the recommended one a dark column standing above the board. Overlaps the hero so price and button sit above the fold. Lives in `components/marketing/PricingPlans.tsx`. |
| Aligned strip | `.sbe-mkt-founding-grid`, `-intro`, `-list`, `-item` | Three supporting points on the same four tracks as the price board, so their rules continue the plan columns. |
| Hairline accordion | `.sbe-mkt-faq-grid`, `-list`, `-item`, `-q`, `-icon`, `-a` | Questions and answers. Uses native `<details name="…">`, so one answer is open at a time. |
| Pull quote | `.sbe-mkt-pullquote` | A first-person statement from a named, real person. |
| Versus table | `.sbe-mkt-versus`, `-table` | A three-column hairline comparison in a real `<table>`. Stacks per row on phones. Used on `/vs-generic-lms`. |

### 4.3 Shared components (`components/marketing/`)

| Component | Use |
|---|---|
| `CTABand` | Every marketing page ends with exactly one. One primary action; the optional secondary is a text link. The exceptions are `/toolkit`, where the generator is the action, and the legal pages. |
| `PageHero` | Every sub-page hero renders through it. |
| `LogoMarquee` | Shows venue category text until real customer logos exist. |
| `sections.tsx` | The section 4.2 patterns as server components that take content: `SectionHead`, `SplitPanel`, `MediaRows`, `Ledger`, `RuledList`, `Steps`, `Strip`, `Faq`, `FounderStory`. Sub-pages are built from these. |
| `SolutionPage` | The one layout behind every `/solutions/<vertical>` page. A vertical's page file is metadata plus a `SolutionContent` constant. |
| `ContactForm` | The client island on `/contact`. |
| `PricingPlans` | The client island on `/pricing`. |

**Building a sub-page.** Import the patterns from `sections.tsx`, put the content in constants at the top of the file, and list the sections in order. Each pattern takes `tone` (`plain`, `alt` or `warm`) for its background. Check that no two neighbours use the same pattern (section 2.3).

| Component | Pattern | Notes |
|---|---|---|
| `SplitPanel` | Split panel | The dark panel hangs 4rem into the next section, so the next section needs normal top padding. Items take `body`, `points`, or both. |
| `MediaRows` | Media rows, overlapping media | Rows alternate side automatically. `phone` adds the overlapping phone; `bare` shows a phone screenshot on its own. |
| `Ledger` | Ledger rows | `metric` is a figure or a numeral such as `01`. |
| `RuledList` | Ruled list with sticky intro | Optional `label` column, link per row, action buttons and a closing `note` for the page's one guarantee statement. |
| `Steps` | Numbered steps | Three or four steps. Dark band only. |
| `Strip` | Aligned strip | Intro in the first of four tracks; three points beside it, with further points in a second row. |
| `Faq` | Hairline accordion | Pass a unique `name` so one answer is open at a time. Feed the same constant to the FAQPage JSON-LD. |

`ROICalculator` (`components/ui/`) is shared by `/` and `/roi`. A change to it changes both. It was removed from `/pricing` in October; the founding strip links to `/roi` instead.

`CompareMatrix` (`components/ui/`) is shared by `/pricing` and `/for-venues`. It drops any row whose value is the same in every visible column. `/pricing` passes `flush collapsible hideFranchise`; `/for-venues` passes nothing and keeps the dark panel.

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
| `--tracking-display` | `-0.025em` | `--fs-display`, `--fs-numeral` |
| `--tracking-heading` | `-0.015em` | `--fs-h2`, `--fs-h3` |
| `--tracking-caps` | `0.08em` | `--fs-caption` in capitals |
| `--tracking-body` | `-0.01em` | Body copy, set on `body` |
| `--lh-display` | `1.02` | Display headings |
| `--lh-heading` | `1.12` | Sub-headings |
| `--lh-lede` | `1.45` | Ledes |
| `--lh-body` | `1.55` | Body |
| `--fw-heading` | `600` | Every heading |

**Fonts.** Headings are Newsreader and body is Inter, both SIL Open Font Licence and self-hosted from `app/fonts/` (loaded in `app/layout.tsx`). They were chosen to match the type on blinq.me, which uses ABC Marist (Dinamo) and Antique Legacy (Optimo). Both of those are commercial; if they are ever licensed, the swap is the two loaders in `app/layout.tsx` and nothing else.

- **Reference `--font-heading` and `--font-body` only.** Never name a family in a rule.
- **One heading weight.** Headings use `--fw-heading`. Numerals and the pull quote use 400. Newsreader is loaded from 400 to 700, roman and italic; Inter from 400 to 600.
- **Optical size is pinned.** `html` sets `font-variation-settings: "opsz" 24` so large headings keep a sturdy, low-contrast shape. Do not override it on a heading.
- **Numerals that carry content** (prices, ledger figures, totals) set `font-variant-numeric: lining-nums`.
- **The staff product is not on these fonts.** `/dashboard` and `/mobile` wrap their tree in `.sbe-app-type`, which points the same two tokens back at Fraunces and Manrope and restores their leading. Do not remove that wrapper as part of marketing work. The Manager Console (`/management`) is on Newsreader and Inter and has no wrapper.

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

Every marketing page is on the standard.

| Area | State |
|---|---|
| Homepage, `/pricing` and `/membership` | Reference implementations. |
| `/platform`, `/platform/challenges`, `/how-it-works`, `/about`, `/for-venues`, `/roi`, `/resources`, `/resources/sop-toolkit`, `/roadmap`, `/security`, `/vs-generic-lms` | Built from `components/marketing/sections.tsx`. |
| `/solutions` and the four vertical pages | Hub is one ruled index. Verticals share `SolutionPage`. `/solutions/multi-venue` redirects to `/solutions/pub-groups` and has no page file. |
| `/contact` | Server page with the `ContactForm` client island. |
| `/advisory` | Shared headings and accordion; its own `sbe-adv-` classes for the hero, hub band and package board. |
| `/demo`, `/demo/complaint-master`, `/toolkit` | The interactive tool keeps its frame, because it is an object. The page around it follows the standard. |
| Legal pages | Reading pages on `PageHero` (light) and `.legal-prose`. |

### 7.2 What was retired

- **Components:** `FeatureGrid`, `MetricsStrip`, `SectionHeading` and `components/icons/MarketingIcons.tsx`.
- **CSS:** about 200 rules for the card grids, stat strips, pill eyebrows on marketing pages, both `.faq-list` / `.faq-item` blocks and the pre-October homepage sections.
- **`.eyebrow` is still in `app/globals.css`.** The logged-in product and the auth pages use it. Do not use it on a marketing page; `tests/e2e-marketing/pages.spec.ts` fails if it appears inside `<main>`.

### 7.3 Still owed

- **Unsourced figures.** Several outcome and industry figures were carried into the new layouts unchanged. They are listed in `To_do_list.md` under "Marketing copy to source or remove".
- **`/advisory` prefix.** Sections that are unique to that page keep `sbe-adv-`. Move them to `sbe-mkt-` only if another page needs them.
- **No screenshot baselines** exist for marketing pages. The e2e suite checks structure, not appearance.

---

## 8. Before a marketing change ships

- **Widths:** check at 375, 1280, 1440 and 1920px. No horizontal scroll at any of them.
- **Interactive sections** fit a 1440×900 window (section 5.4).
- **Neighbouring sections** do not share a layout (section 2.3).
- **No item from section 2.7** has been introduced.
- **Commands:** `npx tsc --noEmit`, `npx eslint <changed files>`, `npm run lint:css` (count unchanged), `npm test`.
- **Marketing e2e** against the deployed preview: `PLAYWRIGHT_BASE_URL='<preview url>' npx playwright test -c playwright.marketing.config.ts`. It also runs against the local dev server below (one test skips there by design). A new marketing route goes in the `ROUTES` list in `tests/e2e-marketing/pages.spec.ts`.

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
