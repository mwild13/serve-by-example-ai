# Handoff: October 2026, Week 2 — By Example Advisory page, homepage UI overhaul and pricing page redesign

> **Eight pieces of work this week. Parts 1 to 7 are on `main` as of 2026-10-09 (`9b80080`).** Part 8, at the end of this file, is the removal of the old mobile view inside `/dashboard`; it is on branch `preview/remove-legacy-mobile`, **pushed for preview, not merged**. Part 7 is the em dash sweep, the demo and login page redesigns, the production release and the review of old branches. Parts 5 and 6 are the Manager Console redesign: Part 5 is the shell and home page, Part 6 is every other tab. Parts 5, 6 and 7 were built on branch `preview/console-home-redesign` and **fast-forwarded into `main` on 2026-10-09**. The first four: Part 1 (below) is the Advisory page, merged to `main`. Part 2 is the homepage UI overhaul, also merged to `main`. Part 3 is the pricing page redesign, also merged to `main`. Part 4 is the new typography and the redesign of every remaining marketing page, **merged to `main` 2026-10-08**. The AI model switch to `gpt-6-luna` is recorded in Part 1 and is merged too.

- **Dates:** 2026-10-07 to 2026-10-08
- **Branch:** `preview/advisory-page`, **merged to `main` 2026-10-08** (merge `b0e1de1`). Preview: https://preview-advisory-page.serve-by-example-ai.pages.dev/advisory
- **Covers:** the new `/advisory` consulting page, attribution from its CTAs through the `/contact` form, consent-gated click tracking, a no-login Playwright suite for marketing pages, and fixes to the existing mobile e2e suite.
- **Related:** `docs/MARKETING_SITE.md` (route table and the `/advisory` LAUNCH-CHECKLIST), `docs/handoff/2026-10-week1-handoff.md` (QA account and e2e background).

---

## The short version

1. **`/advisory` exists.** A consulting page for By Example Advisory: hero, problem, Audit/Fix/Sustain, four packages, Systems Upgrade modules, a Venue Hub "coming soon" band, add-ons, About, FAQ and a final CTA. It is linked from the footer only, not the navbar.
2. **It is hidden from search for now.** The page has `robots: noindex` and is not in the sitemap until pricing is confirmed. The FAQ JSON-LD is in place.
3. **Every CTA says which package it came from.** Links go to `/contact?source=advisory&package=<slug>`. The contact form carries both values in hidden fields and the enquiry email shows them.
4. **CTA clicks are tracked.** A GA event, `advisory_cta_click`, fires only for visitors who accepted analytics cookies.
5. **Marketing pages have their own e2e suite.** It needs no login and covers the homepage sticky bar, `/advisory` and the `/contact` attribution.
6. **The mobile e2e suite is green again.** The Home screenshot no longer breaks when the daily warm-up title changes length, and the four missing baselines are captured.

---

## What changed

### The page (`app/advisory/page.tsx`)

- **Styling:** reuses the homepage hero classes (`sbe-mkt-hero-*`), `SectionHeading`, `CTABand` and the existing FAQ accordion. Page-specific styles use the `sbe-adv-` prefix at the end of `app/globals.css`. No new colours; the Venue Hub band uses the existing `--green-deep` token.
- **Layout choices (second revision):** card grids were cut back so the page reads less templated. The problem section, modules and Venue Hub modules are ruled text lists with no icons. About is text-only with a pull quote. FAQ is two columns on desktop. "Ways to work with us" and "Where we work" were removed and their content folded into the packages intro and an add-ons footnote.
- **Package cards** (`components/advisory/PackageCard.tsx`): equal height, buttons aligned along the bottom, Service Reset lifted with a border and "Most popular" tag. On phones the inclusions sit behind a "What's included" toggle; the list stays in the HTML.
- **Mobile sticky bar:** `components/HeroStickyBar.tsx` now takes optional `label`, `cta` and `href` props. The homepage passes none and behaves as before.
- **Images:** `public/images/advisory/advisory-hero.jpg` (in use) and `advisory-about.jpg` (in the repo, currently unused).
- **Meta description:** changed from "15+ years" to "20 years on the floor" to match the revised copy.

### CTA attribution

- **Slugs:** `health-check`, `bar-profit`, `service-reset`, `ongoing`, `remote-review`, `systems-upgrade`, `strategy-session`, `hub-pilot`, and `general` for the hero, FAQ, final and sticky CTAs.
- **Contact form** (`app/contact/page.tsx`): reads `source` and `package` from the URL on mount, keeps slug-shaped values only, and renders hidden inputs only when a value is present. With no params the form and its payload are unchanged.
- **Contact API** (`app/api/contact/route.ts`): accepts the two optional fields, drops anything that is not slug-shaped, and adds Source and Package rows to the enquiry email.

### Click tracking

- **`trackEvent`** added to `lib/consent.ts`. It does nothing unless the visitor opted in and gtag has loaded.
- **`components/advisory/AdvisoryCtaTracker.tsx`:** one click listener for the whole page. It reads the package slug from the clicked link, so server-rendered CTAs and the sticky bar are covered without extra handlers.

### Tests

- **New:** `tests/e2e-marketing/advisory.spec.ts` with its own config, `playwright.marketing.config.ts`. Kept apart from the main config because that one signs in with the QA account.
- **Mobile Home screenshot** (`tests/e2e/mobile-screens.spec.ts`): masked text is replaced with a fixed placeholder before the screenshot. The mask only painted over the text, so a longer warm-up title wrapped and pushed the layout down.
- **Baselines:** Help, Report a bug, Privacy and Terms added (24 files); Home regenerated (6 files).

---

## How to run the e2e suites

Both run against a deployed preview. Local `next start` does not work: production mode geo-blocks requests that have no Cloudflare country header.

**Marketing suite (no login):**

```
PLAYWRIGHT_BASE_URL='<preview url>' npx playwright test -c playwright.marketing.config.ts
```

**Mobile suite (QA login):**

```
export E2E_TEST_EMAIL='mitch+qa@servebyexample.co'
export E2E_TEST_PASSWORD='<qa password>'
PLAYWRIGHT_BASE_URL='<preview url>' npx playwright test
```

Use the QA account, not a personal one. One-device enforcement would log the personal session out on every run, and the baselines show the QA account's name and progress.

---

## Checks run

| Check | Result |
|---|---|
| Typecheck and lint | Passed |
| `npm run build` | Passed |
| `npm run build:cloudflare` | Passed, no warnings |
| Unit tests (vitest) | 38 of 38 passed |
| Marketing e2e, against the preview | 15 passed, 1 skipped by design |
| Mobile e2e, against the preview | 185 passed on the first full run after the fix; 184 passed with 1 page-load timeout on the last run |
| Layout at 375px, 820px, 1366px | No horizontal overflow; package buttons aligned |

---

## AI model switch to `gpt-6-luna` (2026-10-08)

- **Branch:** `preview/gpt-6-luna`, cut from `main`, **merged to `main` 2026-10-08**.
- **Why:** `gpt-4o-mini` ($0.15 in / $0.60 out per 1M tokens) is two generations old. `gpt-6-luna` is the current budget model and is cheaper ($0.10 in / $0.50 out). `gpt-4o-mini` is not on OpenAI's deprecation list, so this was a choice, not a forced move.
- **One shared setting:** `CHAT_MODEL_PARAMS` in `lib/openai.ts` holds the model and `reasoning_effort: "none"`. The five call sites spread it in: `app/api/translate`, `app/api/coach`, `app/api/management/coach`, `app/api/arena/evaluate` and `lib/scenario-evaluator.ts`.
- **Reasoning is off on purpose.** Luna is a reasoning model. With reasoning on it rejects `temperature`, and reasoning tokens would eat into the small output caps and the 15 to 25 second timeouts.
- **`max_tokens` became `max_completion_tokens`** in all five calls, same limits.
- **No Cloudflare change.** The existing `OPENAI_API_KEY` is used. The OpenAI project allows all models.
- **Checks:** typecheck, lint and 38 of 38 unit tests passed. Manual pass on the preview by Mitchell, all working: AI Arena answer, training scenario, staff coach, manager coach and translation.
- **Rollback:** set `CHAT_MODEL_PARAMS` back to `{ model: "gpt-4o-mini" }` (drop `reasoning_effort`, which that model rejects).

---

## Open items

- **LAUNCH-CHECKLIST** in `docs/MARKETING_SITE.md`: confirm pricing, then remove noindex and re-add to the sitemap (and update the noindex assertion in the marketing spec); replace the hero image with a real photo; add an About photo; review the supplier disclosure FAQ.
- **Cloudflare Error 1102, "Worker exceeded resource limits".** Seen on the preview while running the suites repeatedly with five parallel browsers. Not investigated: the plan and limits the project is on have not been checked, so it is unknown whether production would do the same. A single stray e2e failure is worth one re-run before treating it as real.
- **Copy to review:** the sticky bar label still reads "Free 15 min discovery call" and one FAQ answer says "the discovery call", while the buttons now say "free 15 min call". The `strategy-session` slug is carried by a link on the words "Strategy Sessions" in the add-ons footnote.
- **Phone mockup text** in the Venue Hub band ("3 new deals", "8 of 11 on track" and so on) is placeholder sample content.

---

## Rules for new code (added this week)

- **Click or conversion tracking goes through `trackEvent` in `lib/consent.ts`.** Do not call `gtag` directly; the helper is what keeps tracking behind cookie consent.
- **Links into `/contact` can carry `?source=<slug>&package=<slug>`.** Lowercase letters, digits and hyphens only, 40 characters at most. Anything else is dropped silently.
- **OpenAI calls spread `CHAT_MODEL_PARAMS` from `lib/openai.ts`.** Do not hardcode a model name, and use `max_completion_tokens`, not `max_tokens`.
- **Public-page e2e tests go in `tests/e2e-marketing/`.** In those tests, wait for the page to reach full height before scrolling. On a deployed build the page can still be one screen tall when `goto` resolves.
- **Dynamic text in a screenshot test needs a stable size, not only a mask.** Tag it `data-e2e-mask` as before; the Home test shows how to pin its content.

---

# Part 2: Homepage UI overhaul

- **Date:** 2026-10-08
- **Branch:** `preview/homepage-ui-overhaul`, **merged to `main` 2026-10-08**. Preview: https://preview-homepage-ui-overhaul.serve-by-example-ai.pages.dev/
- **Covers:** a rebuild of every homepage section below the hero, a new type scale, a rebuilt FAQ and Revenue Impact Calculator, rewritten homepage microcopy, and a full rewrite of `docs/Pages-Redesign.md`.
- **Related:** `docs/Pages-Redesign.md` is now the standard for all marketing pages and uses the homepage as its reference.

## The short version

1. **The homepage no longer uses card grids.** Sections are separated by background shifts, hairlines and whitespace. Layouts are asymmetric, and some elements break out of the container.
2. **The hero is untouched.** Its copy is locked by the July marketing audit, and the e2e suite asserts the sticky bar label.
3. **No new dependencies.** No Tailwind, Shadcn or motion library. The FAQ and slider animation are CSS only.
4. **The calculator changed on three pages.** `ROICalculator` is shared, so `/membership` and `/roi` show the new version too.
5. **Homepage copy was rewritten** for kickers, section intros and buttons. The claims themselves were not changed.
6. **`docs/Pages-Redesign.md` was replaced.** The August version described a component set the homepage no longer uses.

## What changed

### Layout (`app/page.tsx`, `app/globals.css`)

| Section | Before | After |
|---|---|---|
| Built for High-Performance Venues | Two cards | Parchment heading left; dark panel bleeds off the right edge and overhangs the founder section |
| Founder | Boxed quote with a green side border | Portrait, statement, italic pull quote under a hairline |
| Two roles, library, mobile | Two rows of equal columns with icon tiles | Alternating text and screenshot rows; screenshots run past the container; the phone overlaps the library screenshot |
| Mastery Path | Three boxed steps with icons and arrows | Three staggered steps with large gold numerals |
| Benefits | Three stat cards | Ledger rows |
| Plans & Pricing | Four mini-cards and a tinted guarantee box | Sticky intro and CTA left, ruled plan list right, one guarantee statement |
| FAQ | Boxed accordion, centred heading | Sticky heading left, hairline accordion right, one answer open at a time |
| Final CTA | Rounded gradient box | Shared `CTABand` |

- **Page structure:** content moved into constants at the top of `app/page.tsx`. The FAQ list now feeds both the accordion and the FAQPage JSON-LD.
- **Styles:** one new block at the end of `app/globals.css`, all under the `sbe-mkt-` prefix. No new colours.

### Type scale (`app/globals.css`, `:root`)

- **New tokens:** `--fs-display`, `--fs-numeral`, `--tracking-display`, `--tracking-heading`, `--tracking-caps`, `--lh-display`, `--lh-heading`, `--lh-body`, `--page-gutter`, `--ease-spring-soft`.
- **New primitives:** `.sbe-mkt-kicker` (replaces the pill eyebrow), `.sbe-mkt-display`, `.sbe-mkt-lede`, `.sbe-mkt-head`.

### Revenue Impact Calculator (`components/ui/ROICalculator.tsx`)

- **Look:** a full-bleed dark band instead of a rounded card. Thin slider rails with tick marks and a tall handle. The total is the largest element.
- **Code:** the three sliders render from one array. The fill is a CSS variable, which removed the refs, the effect and the hydration workaround. The calculation is unchanged.
- **Fits one screen:** the first build was 1,136px tall and the email form sat below the fold on a full-screen desktop. It is now 828px, with the form under the sliders. On phones the order is sliders, readout, form.

### Sizing pass after review at 1920px

- **Display headings:** maximum cut from 3.75rem to 3.25rem.
- **Founder quote:** cut from display size to a 2.25rem maximum.
- **Screenshots:** media column narrowed from 7/11 to 7/12 of the row, and the break-out capped at 72px instead of 120px.

### Copy

| Where | Before | After |
|---|---|---|
| Pillars kicker | Two Systems, One Platform | Staff side. Manager side. |
| Founder kicker | Built From Experience | Who built this |
| Platform heading | Built for two different roles. | Two views of the same shift. |
| Benefits heading | Training that actually measures performance. | Training that measures performance, not attendance. |
| SOP band | Download your free Venue SOP template before you go. | Take a venue SOP template with you. |
| SOP button | Build Your Custom SOP | Build my venue SOP |
| Pricing heading | Plans & Pricing | Priced by the size of your roster. ("Plans & Pricing" is now the kicker) |
| Pricing buttons | View full pricing / or explore the demo free | Compare plans and prices / Or try the demo first, no card needed |
| Calculator heading | See what better training is worth | Put a dollar figure on better training. |
| Calculator button | Email me this projection | Send my projection |
| FAQ heading | Everything you need to know before starting. | The questions worth asking first. |
| Final CTA | Ready to train your team faster? / Start My Free Trial – No CC Needed | Get your next hire floor-ready sooner. / Start my 14-day trial |

The two pillar descriptions were also rewritten and no longer name the AI model.

## Checks run

| Check | Result |
|---|---|
| Typecheck and lint | Passed |
| CSS token lint | 10 reported values, the same as `main` |
| Unit tests (vitest) | 38 of 38 passed |
| Marketing e2e, against the preview | 15 passed, 1 skipped by design. Run against the first commit, before the sizing pass |
| Layout at 375, 1200, 1440, 1800 and 1920px | No horizontal overflow |
| Calculator at 1440×900 | Whole section and email form visible without scrolling |
| FAQ and sliders | Open, close and update the total, checked in a browser |
| Mobile e2e | Not run. It covers `/mobile`, which this work does not touch |
| `npm run build` and `build:cloudflare` | Not run locally. The Cloudflare preview built and served the first commit |

## Open items

- **Look at `/roi`.** The new calculator sits inside its old layout as a square dark panel. (`/membership` is covered by Part 3, which removes the calculator from that page.)
- **Copy sign-off.** The table above went live on the preview without a separate approval round.
- **Trial button alternatives** offered and not used: "Train my team free for 14 days", "Open my venue's trial", "Put my roster through it".
- **Unused CSS to delete after merge:** `.solution-grid`, `.solution-col*`, `.mastery-step*`, `.benefit-*`, `.cta-box`, `.zero-risk-block`, `.section-band-green`, `.sbe-slider-input`.
- **Other marketing pages** are still on the August card-grid standard. `docs/Pages-Redesign.md` section 7 has the order and the steps.
- **`docs/HOMEPAGE.md`** describes an older homepage and is out of date.
- **No homepage screenshot baseline exists.** The marketing suite checks the sticky bar only.

## Rules for new code (added in Part 2)

- **Marketing sections are not built from cards.** Use the patterns in `docs/Pages-Redesign.md` section 4.2.
- **Section headings use `.sbe-mkt-head` with `.sbe-mkt-kicker`,** not the pill `.eyebrow`.
- **Type sizes, tracking and line heights come from the `:root` tokens.** No inline `clamp()`.
- **Anything that bleeds out of `.container` uses `--page-gutter`** and is added to the three gutter media queries.
- **A section the visitor operates must fit a 1440×900 window** with its submit control visible.
- **To run public pages locally,** start the dev server with placeholder Supabase values. The command is in `docs/Pages-Redesign.md` section 8.

---

# Part 3: Pricing page redesign

- **Date:** 2026-10-08
- **Branch:** `preview/pricing-redesign`, cut from `main` after the Part 2 merge, **merged to `main` 2026-10-08** (fast-forward, `db570a1`).
- **Covers:** a rebuild of `/pricing` (also served at `/membership`) to the Part 2 standard, a "buy now" path beside the trial, the calculator removed from the page, and changes to the shared comparison table.
- **Related:** `docs/Pages-Redesign.md` (section 4.2 has the new price board and aligned strip patterns; section 7 marks `/pricing` as migrated).

## The short version

1. **Price and button are on the first screen.** The plans sit in a board that overlaps the hero. Before, the buttons were about 1,030px down the page.
2. **Three priced plans, not four cards.** Staff, Venue and Group are columns divided by hairlines, with Venue as a dark column. Franchise is a "Talk to us" row at the foot of the board.
3. **Plans, founding points and comparison table share column edges.** All three use the same four equal tracks.
4. **"Buy now" replaces "No credit card required".** Venue and Group show "Start my 14-day trial" with "or buy now" beneath. Staff has no trial, so its button is "Buy now".
5. **The calculator is gone from this page.** The founding strip links to `/roi`. The calculator stays on `/` and `/roi`.
6. **The page is shorter.** 7,038px to about 3,600px at 1440px wide; 11,983px to 6,710px on a phone.
7. **No API change.** The checkout route already accepted logged-out buyers.

## What changed

### Page structure

- **`app/pricing/page.tsx`** is now a server component: content constants, FAQ JSON-LD and markup. It was a 590-line client component.
- **`components/marketing/PricingPlans.tsx`** (new) is the only client part: tier data, billing toggle, trial start and checkout. The handlers were moved across unchanged.
- **Plan keys** are derived from the tier id: `pro`, `boutique`, `commercial`, with `_yearly` added for annual billing.

### Comparison table (`components/ui/CompareMatrix.tsx`, shared with `/for-venues`)

- **Rows identical across the visible plans are dropped at render time.** Three learning rows left the table on both pages and moved to the "On every plan" list.
- **Three optional props:** `flush` (no panel, four 25% columns), `collapsible` (native `<details>`, closed by default) and `hideFranchise`. `/pricing` passes all three; `/for-venues` passes none and keeps its dark panel.
- **One badge.** Venue is "Recommended". "Most Popular" and "Best Value" were removed.

### Copy

| Where | Before | After |
|---|---|---|
| Annual toggle | Save $298 | Pay annually and get 2 months free. |
| Venue badge | Most Popular | Recommended |
| Staff button and note | Subscribe now / No credit card required for trial. Billed annually. Cancel anytime. | Buy now / Billed monthly. Cancel anytime. |
| Venue and Group button and note | Try Free for 14 Days / 14-day free trial. No credit card required. Pick a plan when you're ready. | Start my 14-day trial / or buy now |
| Plan sublabels | Pro, Boutique, Commercial | One person, one seat / One venue, up to 15 staff / Multi-site, up to 35 staff |
| Plan features | Neural Scenario Forge, Command & Compliance Centre and similar | The comparison table's existing names (AI Arena, Manager Console and so on) |
| Founding heading | Lock In Founding Member Rates — Before Prices Rise | The price you start on is the price you keep. |
| Founding button | Secure Founding Member Rate (to `/contact`), "Strictly limited spots" | Removed. The plan buttons above are the action. |
| FAQ heading | Common questions. | Billing, trials and cancelling. |
| Final CTA | Start Free Trial / 14-day free trial. No credit card required. Set up in under 10 minutes. | Start my 14-day trial / 14-day free trial. Set up in under 10 minutes. |

- **Why "2 months free":** "Save $298" was true only for Group. Every annual price is exactly ten times the monthly price, so the new line is true for all three plans.
- **Why "Recommended":** there are no customers yet, so "Most Popular" could not be backed.
- **Staff note fixed:** the old line promised a trial the Staff plan does not have and said "Billed annually" on monthly billing.
- **Guarantee:** the board carries the homepage's 14-Day Performance Guarantee wording as the page's one risk-reversal statement.
- **New FAQ entry:** "Can I skip the trial and buy straight away?"
- **Hero copy was not changed.**

### Styles (`app/globals.css`)

- **Added:** one block for the price board, founding strip and flush table, before the reduced-motion block at the end of the file. Tokens only.
- **Deleted:** `.founding-*`, the old tier-card rules (`.sbe-mkt-pricing-grid`, `.sbe-mkt-pricecard*` except `-btn`, `.sbe-mkt-priceblock*`) and the pricing support footer rules.
- **Kept:** `.sbe-mkt-pricefeature*` and `.sbe-mkt-pricecard-btn`, which `/advisory` also uses.

## Checks run

| Check | Result |
|---|---|
| Typecheck and lint | Passed |
| CSS token lint | 10 reported values, the same as `main` |
| Unit tests (vitest) | 38 of 38 passed |
| Layout at 375, 1280, 1440 and 1920px | No horizontal overflow |
| Column edges at 1280, 1440 and 1920px | Plans, founding points and table columns match, by measurement |
| Buttons at 1440×900 | All three plan buttons visible without scrolling |
| Buy now | Sends `pro`, `boutique`, `commercial` or the `_yearly` key to `/api/billing/checkout`, checked with the route stubbed |
| Trial button, logged out | Redirects to `/login?intent=trial&tier=boutique` |
| `/for-venues` | Table renders with four plan columns and 15 rows |
| Real Stripe checkout | Not tested before the merge |
| Marketing e2e | Not run before the merge |
| `npm run build` and `build:cloudflare` | Not run locally. The Cloudflare Pages preview build passed |

## Open items

- **Run the marketing e2e suite against production.** It was not run before the merge.
- **Make one real purchase path test on production:** "or buy now" as a logged-out visitor, through Stripe and back to `/login?checkout=success`.
- **Copy sign-off.** The table above went live without a separate approval round. The old tier data was marked as locked pending a pricing review; prices are unchanged, feature names are not.
- **Hero copy.** "Priced for founders" reads as if the customer is a startup founder. Suggested and not applied: "Pick a plan. Keep the price."
- **Cost per staff member.** Venue is AUD $5.27 per seat per month and Group $4.26. Suggested as a line under the price and not applied, because it is a new claim.
- **Phones.** The first plan's price is on the first screen at 375×812 but its button sits just below it.
- **`/for-venues`** still shows the comparison table in the old dark panel inside a card-grid page.
- **No pricing e2e test exists.** The marketing suite does not cover `/pricing`.

## Rules for new code (added in Part 3)

- **Tier prices and plan keys live in `components/marketing/PricingPlans.tsx`.** They match live Stripe prices; do not change them without a pricing review.
- **A plan with a trial offers both paths:** the trial as the button and "buy now" as the link beneath. A plan without a trial uses "Buy now" as the button.
- **Do not claim popularity.** Use "Recommended" until there is customer data.
- **Savings copy must be true for every plan it sits beside.**
- **`CompareMatrix` rows that are the same on every visible plan belong in the "On every plan" list,** not the table. The component drops them from the table automatically.
- **Check the current branch before committing.** The checkout was moved to `main` by another session while this work was in progress, and the commit landed there first.

---

# Part 4: New typography and the remaining marketing pages

- **Date:** 2026-10-08
- **Branch:** `preview/marketing-redesign`, cut from `main` after the Part 3 merge, **merged to `main` 2026-10-08**. Preview: https://preview-marketing-redesign.serve-by-example-ai.pages.dev/
- **Covers:** the marketing site's move to Newsreader and Inter, the rebuild of all 24 remaining marketing routes to the Part 2 standard, a shared set of section components, removal of the August component set, and a page-standard e2e spec.
- **Related:** `docs/Pages-Redesign.md` (section 4.3 documents the new components; section 5.2 the fonts and tokens; section 7 the final state). `To_do_list.md` has the copy flags.

## The short version

1. **New fonts on the marketing site.** Headings are Newsreader, body is Inter. They are the closest free match to the type on blinq.me, which uses two commercial fonts.
2. **The logged-in product did not change.** `/dashboard`, `/mobile` and `/management` stay on Fraunces and Manrope.
3. **Every marketing page is on the standard.** No card grids, pill eyebrows or centred section openings remain.
4. **Pages are now assembled from shared sections.** `components/marketing/sections.tsx` holds the layouts; a page file is content plus a list of sections.
5. **The old component set is gone.** `FeatureGrid`, `MetricsStrip`, `SectionHeading`, the marketing icon set and about 200 CSS rules were deleted.
6. **Claims were not rewritten.** Unsourced figures were carried across as they were and listed in `To_do_list.md`.

## Fonts

### What blinq.me uses

| Role | Font | Foundry | Licence |
|---|---|---|---|
| Headings | Inq Marist SemiBold, a custom cut of ABC Marist | Dinamo | Commercial. One-off web licence priced by company size, per domain |
| Body, buttons, labels | Antique Legacy | Optimo | Commercial. One-off web licence priced by domain and monthly visitors |

- **How this was confirmed:** from the page's computed styles and the name tables inside the font files. Nothing was copied.
- **Not licensed.** Mitchell chose the free match. If the commercial fonts are bought later, only the two loaders in `app/layout.tsx` change.

### What we use

| Role | Font | Settings |
|---|---|---|
| Headings | Newsreader (SIL OFL) | Weight 600, optical size pinned at 24, roman and italic |
| Body | Inter (SIL OFL) | Weights 400 to 600, tracking -0.01em |

- **Files:** three self-hosted latin-subset variable files in `app/fonts/`, loaded through `next/font/local`.
- **Optical size:** pinned on `html` so large headings keep a sturdy shape close to Marist. Left on automatic, Newsreader turns high-contrast at display sizes.

### Token changes (`app/globals.css`, `:root`)

| Token | Before | After |
|---|---|---|
| Heading weight | 500, with 600 on heroes | `--fw-heading: 600` everywhere |
| `--tracking-display` | -0.035em | -0.025em |
| `--tracking-heading` | -0.02em | -0.015em |
| `--tracking-caps` | 0.14em | 0.08em |
| `--lh-heading` | 1.18 | 1.12 |
| `--lh-body` | 1.65 | 1.55 |
| `--lh-lede`, `--tracking-body` | none | 1.45 and -0.01em (new) |

Type sizes were not changed.

### How the product is kept on its old fonts

- **`app/fonts/product-fonts.ts`** loads Fraunces and Manrope and exports one class string.
- **`app/dashboard/layout.tsx` (new), `app/mobile/layout.tsx` and `app/management/layout.tsx`** wrap their tree in it.
- **`.sbe-app-type`** in `app/globals.css` points `--font-heading` and `--font-body` back at the old pair inside that wrapper and restores their leading and tracking.
- **Auth pages** (`/login`, `/onboarding`, `/reset-password`) take the new fonts, as agreed.

## Pages

| Page | Section order after the hero |
|---|---|
| `/platform` | Ledger, media rows, ruled list, split panel, overlapping media |
| `/platform/challenges` | Media rows, ledger, ruled list, split panel |
| `/how-it-works` | Split panel, numbered ledger, ruled list, aligned strip, four numbered steps, overlapping media |
| `/solutions` | One ruled index of the four verticals |
| `/solutions/*` (four pages) | Ledger of three facts, one screenshot, ruled feature list with trial action and guarantee |
| `/about` | Founder portrait with pull quote, ruled list |
| `/for-venues` | Media row, numbered ledger, split panel, aligned strip, the `/pricing` comparison table |
| `/roi` | Calculator as its own dark band under a light hero, ledger |
| `/resources` | Split panel |
| `/resources/sop-toolkit` | Ruled list, three numbered steps, ruled list, aligned strip, split panel, accordion |
| `/toolkit`, `/toolkit/success` | Same tool and flow; inline styles replaced with classes; success page left-aligned |
| `/contact` | Form beside a ruled list |
| `/security` | Split panel, ruled list, aligned strip |
| `/roadmap` | One ruled list ordered by timeframe |
| `/vs-generic-lms` | Ledger, hairline comparison table, ruled list |
| `/advisory` | Shared headings and accordion; packages as a hairline board |
| `/demo`, `/demo/complaint-master` | Tool unchanged; a closing band added; pills removed |
| Legal pages | Body leading and heading weight tuned for the new fonts |

### Structural changes worth knowing

- **`components/marketing/SolutionPage.tsx`** is the single layout for the vertical pages. Each page file is metadata plus one content constant.
- **`/contact` is a server page.** The form moved to `components/marketing/ContactForm.tsx`. Field ids, the `contact-form` class and the hidden `source` / `package` inputs are unchanged.
- **`/contact` fits one screen.** The submit button's lower edge is at 885px in a 1440×900 window. It was at 1,323px.
- **`app/solutions/multi-venue/page.tsx` was deleted.** The route has redirected to `/solutions/pub-groups` since July. It was also removed from the sitemap.
- **`/for-venues` uses the `/pricing` comparison table** (`flush collapsible hideFranchise`), so the Franchise column no longer shows there.
- **`docs/HOMEPAGE.md` was deleted** and its link removed from `README.md`.

### Copy changes

| Where | Before | After |
|---|---|---|
| `/platform` console heading | Your venue's mission control. | Your whole venue on one screen. |
| `/advisory` package tag | Most popular | Recommended |
| `/solutions` hub | Five rows, one for "Multi-Venue Groups" | Four rows; multi-venue is part of the pub groups row |

- **New headings.** Sections that had no heading, or that changed pattern, needed a kicker and title. Examples: "What the platform is built to move.", "Pick the operation closest to yours.", "What is coming, and when.", "Four differences you feel on a shift.", and the per-vertical ledger headings.
- **New row titles** on `/platform`, `/platform/challenges`, `/how-it-works`, `/about` and `/security`, where a paragraph became a titled row.
- **New closing bands** on the two demo pages: "Put your own roster through it." and "Give your whole team this practice."
- **Price figures on `/pricing` are set in Inter 600,** not Newsreader. The serif dollar sign looked decorative at that size. Changed after review on the preview.
- **Vertical pages gained the trial button and the 14-Day Performance Guarantee line,** using the homepage wording.
- **Dropped from the `/solutions` hub:** the bullet lists and stat cards under each venue type. The same points are on the vertical pages.
- **Founder experience** stays at 15 years on `/about`, as decided. `/advisory` still says 20 years.

## Checks run

| Check | Result |
|---|---|
| Typecheck | Passed |
| Lint on changed files | Passed |
| CSS token lint | 10 reported values, the same as `main` |
| Unit tests (vitest) | 38 of 38 passed |
| Marketing e2e, against the local dev server | 71 passed, 1 skipped by design |
| Layout at 375 and 1440px, all 31 public routes | No horizontal overflow |
| Layout at 1280 and 1920px, every rebuilt page | No horizontal overflow |
| Homepage and `/pricing` heights after the CSS deletions | Unchanged, so nothing they use was removed |
| Marketing e2e, against the deployed preview | 71 passed, 1 skipped by design (run by Mitchell) |
| `/dashboard`, `/mobile`, `/management` in a browser | Not checked. They need a login, which the local server does not have |
| `npm run build` and `build:cloudflare` | Not run |
| Mobile e2e | Did not start. The login step in `global-setup.ts` timed out waiting for `/dashboard`, so no test ran. Cause not established |

## Open items

- **Mobile e2e did not start.** The sign-in step timed out before any test ran. The usual cause is a wrong or placeholder `E2E_TEST_PASSWORD`; the other possibility is that sign-in itself is failing. Sign in by hand with the QA account first, then re-run.
- **Confirm the product fonts in a browser.** The scoping is in place but untested behind a login. If anything in `/dashboard`, `/mobile` or `/management` shows Newsreader or Inter, the wrapper is missing on that route.
- **Run the mobile e2e suite once** against the preview. Its baselines should still match, because `/mobile` kept its fonts.
- **Copy sign-off.** The new headings and row titles went in without a separate approval round.
- **Unsourced figures:** see `To_do_list.md`.
- **15 or 20 years.** `/about` and the homepage say 15; `/advisory` says 20.
- **Hero buttons on the vertical pages** still say "Request Venue Access", while the ruled list below offers the trial. One of them should be the page's single primary action.
- **`/roi` on first load.** The calculator's send button sits 144px below the fold at 1440×900, because the hero is above it. The calculator itself fits one screen once scrolled to.
- **Font licence.** Revisit ABC Marist and Antique Legacy if the free match is not close enough.

## Rules for new code (added in Part 4)

- **Reference `--font-heading` and `--font-body`.** Never name a font family or a `--font-<family>` variable in a rule or an inline style.
- **Build sub-page sections from `components/marketing/sections.tsx`.** Add a pattern there before hand-building one in a page file.
- **A new `/solutions/<vertical>` page is a `SolutionContent` constant** passed to `SolutionPage`.
- **A product layout must wrap its tree in `PRODUCT_FONT_CLASS`** from `app/fonts/product-fonts.ts`.
- **Add every new marketing route to `ROUTES`** in `tests/e2e-marketing/pages.spec.ts`.
- **Do not use `.eyebrow`, `.faq-list` or `.faq-item` on a marketing page.** The e2e spec fails on them.
- **In the local dev server, a screenshot that stays blank** can be a stuck image-optimiser entry. Restart the server before debugging the page.

---

# Part 5: Manager Console shell and home page redesign

- **Date:** 2026-10-09
- **Branch:** `preview/console-home-redesign`, cut from `main`. **Pushed for preview, not merged.** Part 6 is on the same branch.
- **Covers:** the console sidebar and top header (every tab), the Overview tab, the console's move to Newsreader and Inter, and a new "Training Gaps" nav item.
- **Related:** `docs/MANAGER_CONSOLE.md` section 6 (rules for this area), `docs/Pages-Redesign.md` (the principles applied), `To_do_list.md` (open items under "Manager Console").

## The short version

1. **The console is on the site fonts.** Newsreader and Inter replace Lora, Outfit and DM Mono on every console tab. The six font files were deleted.
2. **Colour is restrained.** Parchment, ink, hairlines and brand green. Terracotta, amber and all tinted pills are gone from the shell and the Overview tab. Red appears only on an expired-certificate count.
3. **The sidebar collapses to an icon rail.** The choice is remembered. Cmd/Ctrl+B toggles it.
4. **A notice reel replaces the compliance banners.** One bar steps through named, specific notices, most urgent first.
5. **The four tiles were reordered and cleaned.** Shift readiness, Average mastery, Trained this week, RSA and FSS. The Rf, RSA, CM and Ms chips are gone.
6. **The Learning Activity chart was removed.** It was a formula, not data. A real "Team activity" breakdown took its place.
7. **Other console tabs changed font only.** Their layouts are untouched.

## What changed

### Shell

- **Sidebar** moved to `components/mission-control/ConsoleSidebar.tsx`. `ManagerControlCenter.tsx` went from 2,111 to 1,995 lines.
- **Collapse:** 64px rail, saved in `localStorage`, default below 1100px.
- **Icons:** Staff is one person; Teams is two.
- **New nav item:** "Training Gaps" under Teams. It opens the page that was only reachable from a home page tile. That page's heading changed from "Shift Readiness & Training Bottlenecks" to "Training Gaps".
- **Header alignment:** the logo block and the top header share one height token (68px), and the header now runs the full width of the workspace. Their bottom rules meet.
- **Search:** grows up to 440px, 15px text, placeholder "Search staff, programs, reports". `/` or Cmd/Ctrl+K focuses it. The old placeholder advertised Cmd+K, which did nothing.
- **Narrow screens:** the shell no longer stacks the sidebar above the page.

### Overview tab

| Area | Before | After |
|---|---|---|
| Top of page | Two coloured compliance banners | One notice reel |
| Tile 1 | Shift Readiness, first 8 staff, "rostered for tonight" | Shift readiness, all staff, "cleared to work", opens Training Gaps |
| Tile 2 | Legal RSA / FSS (RSA only) | Average mastery |
| Tile 3 | Confidence Mismatch | Trained this week |
| Tile 4 | Average Mastery | RSA and FSS, now including FSS |
| Left column | Learning Activity chart | Team activity by last-active date |
| Cards | "Training Bottlenecks", "Role Qualification Progress" | "Training gaps", "Qualifications" |

- **Notices** are built in `lib/management/notices.ts`: expired RSA, RSA within 7 and 30 days, expired FSS, no RSA date on file, inactive 45+ days, not started, completed all modules, trained this week. Up to three first names, then "and N others".
- **Reel behaviour:** advances every 7 seconds; stops on hover, focus or pause; never auto-advances for reduced-motion users.

### Behaviour changes to know about

- **Shift readiness will show a different number.** It now averages every staff member in the venue, not the first eight.
- **Qualifications, RSA row:** staff with no RSA date on file are no longer counted as certified.
- **Needs attention** labels its bar "Training", because it shows training completion.
- **`SignOutButton`** accepts `children` and `title`. Existing uses are unaffected.

## Checks run

| Check | Result |
|---|---|
| Typecheck | Passed |
| Lint on changed files | Passed |
| CSS token lint | 0 raw hex values, down from 10 on `main` |
| Unit tests (vitest) | 45 of 45 passed, including 7 new tests for the notices |
| Layout at 800, 1440 and 1920px, Overview tab | No horizontal overflow; header rules level at 68px |
| Sidebar collapsed and expanded | Checked at 1440 and 800px |
| Reel | Advances after 7 seconds, holds while paused, steps with previous and next |
| Every console tab at 1440px | Renders in the new fonts, no horizontal overflow |
| Behind a real login, with live data | Not checked. Viewed locally through a temporary route with sample staff, since the console needs a login |
| `npm run build` and `build:cloudflare` | Not run |
| e2e suites | Not run. Neither suite covers the console |

## Open items

- **Preview.** Pushed. Check the console on the preview deploy with a real account.
- **Trial prompt.** The upgrade card is hidden while the sidebar is collapsed.
- **Other tabs:** done in Part 6.
- **Needs Attention rule** over-flags. See `To_do_list.md`.
- **Dark mode.** The shell now uses the brand tokens, so it follows `.sbe-dark` like the other console tabs. Not checked.

## Rules for new code (added in Part 5)

- **Console nav items go in `NAV_GROUPS`** in `ConsoleSidebar.tsx`, not in `ManagerControlCenter.tsx`.
- **A new Overview notice goes in `buildOverviewNotices()`** with a test. Do not add a banner to the page.
- **No tinted pills, chips or abbreviation tiles** on the console shell or Overview tab.
- **`--mc-*` tokens alias brand tokens.** Never give one a hex value.
- **Use `wasActiveWithinDays()`** for any "active in the last N days" count.
- **Do not caption a figure with something the data cannot show,** such as a roster or a daily trend.

---

# Part 6: Manager Console, every other tab

- **Date:** 2026-10-09
- **Branch:** `preview/console-home-redesign`, the same branch as Part 5. **Pushed for preview, not merged.**
- **Scope:** every console tab other than Overview, plus changes to the shell that Mitchell asked for after seeing Part 5.

## The short version

- **Every tab now uses one set of parts:** a page heading, a strip of figures, panels, hairline tables, underline tabs and status as text beside a dot. They are in `components/mission-control/console-ui.tsx`.
- **Figures are in Inter,** not the heading serif, on the home page tiles and everywhere else.
- **Sidebar:** no "Command" heading, the collapse control is an icon beside the logo, Settings sits alone at the foot, and the profile row and Sign out are gone.
- **Sign out moved** to a menu on the account circle in the top header.
- **Roles & Permissions was removed.** Its role table is now on Teams. Its access table was dropped.
- **Ask AI Coach fills the window** and has a New chat button that deletes the saved conversation.
- **`ManagerControlCenter.tsx` fell from 1,995 to 1,717 lines.**

## What changed

### Shell

| Area | Before | After |
|---|---|---|
| Sidebar top | "Collapse menu" row, then a "Command" heading | Icon button beside the logo; Overview with no heading |
| Sidebar foot | Profile row and Sign out | Settings (owners only) |
| Collapsed rail | Logo, then an expand row | Expand button in the logo's place |
| Account circle | Not clickable | Menu: name, Account settings, Sign out |
| Settings in the menu | Last item under Performance | Alone at the foot |

### Tabs

| Tab | What it is now |
|---|---|
| Staff | Page heading with role filter, Export and Add staff. Training bar and readiness as text. Column headings corrected (they were swapped). |
| Teams | One table by team, one by role (from the removed Roles tab), one follow-up list. |
| Training Gaps | Figure strip, gaps shared by several staff, one table by person. |
| Compliance | Figure strip with an "RSA expired" count, certificate table, on-site copy list, other certificates, rules by state as a table. |
| Analytics | Figure strip, table by role (every role present, not the largest three), revenue estimate. |
| Reports | Figure strip, sortable table, two lists, skill bars, email schedule. |
| Leaderboards | One ranked table with points and their make-up. The gold, silver and bronze podium is gone. |
| Ask AI Coach | Conversation fills the window; suggested questions and people on the right. |
| Settings | One narrow column of rows: heading and note left, controls right. Sign-up link and join code are one section. |
| All venues | Was "Group Analytics". Figure strip and two tables. |

### Behaviour changes to know about

- **Certificate expiry was a day late.** `daysUntilExpiry()` rounded up, so a certificate that expired yesterday read as 0 days left and was not treated as expired until the following midnight. It now rounds down. Day counts for future dates read one lower than before (a certificate expiring tomorrow is "1", not "2"). The all-venues summary uses the same helper, so it is corrected too.
- **New chat deletes for good.** `DELETE /api/management/coach/history` removes that manager's saved messages for the venue. There is one confirmation and no undo.
- **AI Coach thumbs up and down were removed.** They changed colour and recorded nothing.
- **`?tab=roles`** now opens Teams.
- **Readiness wording on Staff:** "Caution" reads "Needs follow-up". "Blocked" still means an expired RSA.
- **Analytics lost one sentence** under the revenue estimate that described it as based on coaching outcomes. There was no source for it.
- **Billing shows org-wide seats in use,** not the selected venue's staff count.
- **Top header on narrow windows:** the Ask AI Coach button shows its icon only below 1000px.

### Removed

- `RolesPermissionsMatrix.tsx`, `WorkspaceHeader.tsx`, `OpsKpiCard` and its trend badge.
- 49 CSS rules for classes no component uses any more (`ops-ai-coach-*`, `ops-revenue-*`, `ops-compare-*`, `mcc-tab*`, `ops-module-*`, `ops-settings-list`, `ops-venue-*`).

## Checks run

| Check | Result |
|---|---|
| Typecheck | Passed |
| Lint on console files | Passed |
| CSS token lint | 0 raw hex values |
| Unit tests (vitest) | 46 of 46 passed, including a new test for expiry on the day before and the day of |
| Every tab at 1440px | No sideways scroll; no text under 13px |
| Every tab at 800px, sidebar open and collapsed | No sideways scroll |
| AI Coach at 1440 by 900 | Fits the window with the question box visible, no page scroll |
| Account menu | Opens, lists name, Account settings and Sign out, closes on Escape |
| Staff profile drawer and certificate form | Open and render in the new style |
| AI Coach answers, New chat delete, Sign out, saving a setting | Not checked. They need a login; locally the API returned "Unauthorized", which the page showed correctly |
| `npm run build` and `build:cloudflare` | Not run |
| e2e suites | Not run. Neither suite covers the console |
| Dark mode | Not checked |

## Open items

- **Check on the preview with a real account,** especially the four items marked not checked above.
- **Three screens are not on the new parts:** trial billing, Notifications and Training programs. See `To_do_list.md`.
- **AI Coach has no memory of the conversation.** See `To_do_list.md`.

## Rules for new code (added in Part 6)

- **Build a console tab from `console-ui.tsx`:** `.mc-page`, one `PageHead`, then `StatRow` and `Panel`. No `ops-grid` or `ops-card`.
- **Figures use `.mc-figure`** (Inter, tabular numerals). Never the heading serif.
- **Status is `StatusText`.** Red is for an expired certificate or a blocked person only.
- **One primary button per tab.**
- **Do not add a control that records nothing.**
- **Account actions go in the top header's account menu,** not the sidebar.

---

# Part 7: Em dash sweep, demo and login redesign, production release

- **Date:** 2026-10-09
- **Branch:** `preview/console-home-redesign`, fast-forwarded into `main` (`9b80080`). Parts 5 and 6 went to production in the same push.
- **Why:** a customer said the site's text "looks AI". The owner asked for the em dashes to go, then for the demo, any missed pages and the login page to be brought onto `docs/Pages-Redesign.md`.

## The short version

1. **Em dashes are gone from the marketing side.** About 30 in visible copy, plus page titles, meta descriptions, two emails and around 20 image alt texts that used a spaced en dash the same way.
2. **The demo's AI feedback should no longer add them.** The scenario evaluator prompt now asks for plain punctuation. That prompt is shared with the staff trainer.
3. **`/demo` and `/demo/complaint-master` are on the standard.** No boxed text cards, no glyph icons, one primary button each.
4. **The 404 and error pages have a real layout.** They share the confirmation layout used by `/toolkit/success`.
5. **`/login` is redesigned.** Navy panel with the real console screenshot, one text switch between sign in and create account, gold submit button.
6. **Everything on the preview branch is in production.** Five commits, a clean fast-forward.
7. **Six old branches were reviewed.** None should be merged. Four are dead, two hold work to rebuild.

## What changed

### Copy

- **Marketing pages:** `/roi`, `/contact`, `/vs-generic-lms`, `/resources`, `/platform/challenges`, `/solutions`, `/solutions/pub-groups`, `/for-venues`, `/how-it-works`, `/pricing`, `/toolkit` and `/toolkit/success`. Each em dash became a comma, a colon or a new sentence. No claim was reworded.
- **Shared parts:** the navbar's Platform description, the ROI calculator's thank-you line, the pricing comparison table's section labels ("A. Title", was "A — Title") and the four SOP preview titles.
- **Metadata:** the root Open Graph title and description, and the titles for `/demo/complaint-master`, `/toolkit`, `/toolkit/success` and `/geo-block`. Titles now use `|` as the separator throughout.
- **Emails:** the ROI projection email and its internal lead notification (`app/api/roi/email/route.ts`) and the password reset email (`app/api/auth/forgot-password/route.ts`).
- **Evaluator prompt** (`lib/scenario-evaluator.ts`): one line added to the OUTPUT rules, asking for commas and full stops and no em or en dashes in every text field. Nothing else in the hardened prompt changed. It applies to `/api/demo/evaluate` and `/api/evaluate`.
- **Not touched:** code comments, and the staff product (`/dashboard`, `/mobile`), which still has about 50 em dashes in visible text.

### `/demo`

- **Lead pane** (`app/demo/_components/LeadCapturePane.tsx`): was a dark rounded card with two equal pill buttons and a bordered guarantee badge. Now an unboxed column behind a hairline: kicker, heading, one gold button, a text link, the guarantee as plain text, and the solutions as a ruled list.
- **`CtaGuaranteeBlock`** lost its `variant` prop. The same block is used in the pane and inline on phones after a score.
- **Score highlight:** the pulse after a result now lands on the primary button, not the guarantee text.
- **Glyphs removed** (`EvaluationTabs.tsx`, `ScenarioSimulatorPane.tsx`): the tick, warning and cross characters are `lucide-react` icons; the arrows on Skip and "Try another module" and the hidden plus and minus spans are gone. Coach headings read "Strength: Communication" and "Missed opportunity: Problem solving".
- **Duplicate link removed:** "Multi-Venue Groups" pointed at the same page as "Pub Groups" and gave two list items the same React key.

### `/demo/complaint-master`

- **Intro:** the bordered card with three icon badges is a left-aligned heading beside three ledger rows (3 scenarios, 5 minutes, 25 points per scenario). The intro uses the full container; the practice, result and complete stages keep the 680px column.
- **Finish screen:** one primary button ("Try three more scenarios", to `/demo`) and one text link ("Compare plans and prices"). It had two equal buttons.
- **Kicker:** "Free practice tool", was "Free Training Tool".

### 404, error, geo-block

- **`app/not-found.tsx`:** navbar, footer and the `.sbe-mkt-confirm` layout, with "Back to home" and a text link to the demo.
- **`app/error.tsx`:** same layout without navbar or footer, since either could be what failed. "Back to home" is a plain anchor so it forces a full page load.
- **`/geo-block` and `/restricted`:** the globe icon tile is removed and the heading reads "Australia Only. For Now."

### `/login`

- **Right panel:** `--bg-dark` to `--bg-dark-soft`, was `--roi-forest`. Kicker, the six-weeks headline in the standard heading style, three points as a ruled list, and `public/shots/Overview Console Wide.png` running off the right and bottom edges. The panel is pinned to one screen tall, so the form column alone sets the page height. It is hidden below 900px.
- **Sign in or create account:** the two pill buttons are replaced by one line under the heading ("New here? Create an account", or "Already have an account? Sign in").
- **Submit buttons** use `sbe-mkt-btn-primary` with a new `.login-submit` class. Inputs and the Google button use `--radius-sm` inside `.login-split`.
- **Portal tabs** keep "Staff Login" and "Management Login" without their icons. The logo links to `/`.
- **e2e:** `tests/e2e/global-setup.ts` still clicks the form's "Sign in" button; only its comment changed. `#email` and `#password` are unchanged.
- **Not changed:** `/auth` and `/reset-password`, which still use `.login-shell` and the older card. `public/images/login-value-prop.png` is now unused.

### CSS (`app/globals.css`)

- **Added:** `.cm-intro`, `.demo-guarantee`, `.demo-solutions`, `.sbe-mkt-confirm-actions`, `.login-submit`, `.login-visual-points`, `.login-visual-shot`, and `button.sbe-mkt-btn-primary` (border and cursor reset, so the class works on a `<button>`).
- **Removed:** `.cm-hero`, `.cm-intro-card`, `.cm-intro-meta`, `.cm-intro-badge`, `.demo-guarantee-badge` and its light variant, `.demo-solutions-links*`, `.geo-block-icon`, `.login-visual-img-wrap`, `.login-visual-bullets`.

## Release

- **Production:** `main` moved from `856bc99` to `9b80080` on 2026-10-09 by fast-forward. Commits: `8712860` and `4671c56` (Parts 5 and 6), `768ac4a` (sweep and demo), `279148f` (empty, see below), `9b80080` (login).
- **One failed preview deploy.** The build for `768ac4a` compiled and uploaded, then failed at the last step with "Failed to publish your Function. Got error: Unknown internal error occurred." Nothing on the Cloudflare status page matched. An empty commit (`279148f`) retriggered it and it deployed. If it happens again, retry before investigating.
- **The production build after the fast-forward was not watched.**

## Old branches

Reviewed on 2026-10-09 with a trial merge against `main`. None was merged, and all six are still on the remote.

| Branch | Tip | State | Recommendation |
|---|---|---|---|
| `preview/navy-tokens-rollout` | `4633cae` | Merges clean and changes nothing; its icons and manifest fix are already on `main` | Dead |
| `cloudflare/workers-autoconfig` | `47eaef0` | March, auto-generated config; conflicts in 7 files with the working OpenNext setup | Dead |
| `feature/manager-console-ux-overhaul` | `9bc2f6c` | July; superseded by Parts 5 and 6, and grows `ManagerControlCenter.tsx` | Dead |
| `fix/misc-ui-polish` | `1d537d6` | Compliance table overflow is already fixed on `main` (`.mc-table-wrap`). What is left is a cosmetic colour change to the Arena text box | Dead |
| `preview/staff-billing-portal` | `6d0d06d` | Conflicts in `DashboardShell.tsx`; covers `/dashboard` only | Keep as reference, rebuild |
| `preview/sentry-error-tracking` | `55f0960` | Conflicts in 4 files; carries a cookie banner and analytics setup that `main` replaced | Keep as reference, rebuild if wanted |

Removing the four dead branches is the owner's to do; it was not done in this session.

## Checks run

| Check | Result |
|---|---|
| Typecheck | Passed |
| Lint on changed files | Passed |
| CSS token lint | 0 raw hex values |
| Unit tests (vitest) | 46 of 46 passed |
| `/demo`, `/demo/complaint-master`, `/login` at 375, 1280, 1440 and 1920px | No sideways scroll |
| `/login` at 1440 by 900 | Fits the window with the submit button visible |
| Demo result and coach tabs, Complaint Master through to the finish screen | Checked with a mocked `/api/demo/evaluate` response |
| Preview deploy of `9b80080` | Succeeded |
| Live evaluator output | Not checked. No real answer was submitted, so the new punctuation rule is untested against the model |
| Signing in, creating an account, Google sign-in, password reset on the new `/login` | Not checked. They need Supabase |
| Marketing and mobile e2e suites | Not run |
| Dark mode | Not checked |

## Open items

All of these are in `To_do_list.md`.

- **Staff on Pro cannot manage or cancel their subscription.** The most important item here. See "Staff billing".
- **Sentry:** decide, then build fresh. See "Error tracking".
- **Sign in on the new `/login`** and submit one real answer on each demo.
- **Two guarantees:** `/demo` promises "$0 if staff don't complete a scenario within 7 days"; the rest of the site says 14 days. The wording was left as it was.
- **New copy to approve:** the Complaint Master heading "Three complaints. Five minutes." and its three ledger descriptions; the kickers "After the demo", "Before you start" and "Hospitality staff training"; the button labels "Create my free account" and "Try three more scenarios".
- **Em dashes in the staff product,** and `/auth` and `/reset-password` on the old card.
- **Four dead branches** are still on the remote.

## Rules for new code (added in Part 7)

- **No em dashes, and no spaced en dashes, in anything a visitor or customer reads:** page copy, titles, meta descriptions, alt text and emails. Use a comma, a colon or a new sentence. An en dash in a number range ("3–9%") is fine.
- **Page titles separate with `|`.**
- **Any prompt whose output is shown to a person** asks for plain punctuation, as `lib/scenario-evaluator.ts` does.
- **No unicode characters as icons** (ticks, crosses, arrows). Use `lucide-react` for interface chrome, or nothing.
- **A standalone page with one message** (confirmation, not found, error) uses `.sbe-mkt-confirm` inside `.sbe-mkt-confirm-page`.
- **`sbe-mkt-btn-primary` works on a `<button>`.** Do not add a per-page border reset.

---

# Part 8: Legacy mobile dashboard removed

- **Date:** 2026-10-09
- **Branch:** `preview/remove-legacy-mobile`, off `main` at `ae91db9`. **Pushed for preview, not merged.** Preview: https://preview-remove-legacy-mobile.serve-by-example-ai.pages.dev
- **Why:** the owner asked for the old mobile staff dashboard to be deleted cleanly, and asked whether the new `/mobile` app should move back into `/dashboard`.

## The short version

1. **The old mobile view inside `/dashboard` is deleted.** About 1,500 lines: two components, the bottom nav bar, their CSS, twelve colour tokens and one doc.
2. **`/mobile` stays a separate route tree.** It was not merged back into `/dashboard`. The reasons are under "The decision".
3. **No phone user sees a change.** `middleware.ts` was already sending every phone from `/dashboard` to `/mobile/home`, so the old view only appeared in a non-phone window narrower than 720px.
4. **A narrow `/dashboard` window now shows the desktop dashboard in one column,** with the nav as a wrapped row on top.
5. **The staff sign-up link now works on a phone** for someone who is already signed in.
6. **Nothing was checked in a browser.** There is no local environment to sign in with. The checks are in `To_do_list.md`.

## The decision

The owner's question was whether to delete the old view and then merge `/mobile` into `/dashboard`, or simply delete. Simply delete was chosen.

- **Different layouts.** `/mobile` needs a locked viewport, a dark body, the orientation guard and its session and progress providers (`app/mobile/layout.tsx`). `/dashboard` is one client shell that swaps views in state. Putting both behind one URL is the arrangement that was just removed.
- **Real routes.** `/mobile` has 22 of them, which gives it a working back button, deep links and per-screen code splitting. The dashboard shell has none of these.
- **The shared code is already shared:** `resolveTierAccess()`, `lib/streak.ts`, `lib/badges.ts`, `trainer-data.ts` and the API routes. Nothing in `/dashboard` imports from `/mobile`.
- **The e2e suite and its snapshots** are keyed to `/mobile/*` paths.

The owner also chose that a narrow non-phone window keeps the desktop dashboard, reflowed, and is not redirected to `/mobile`.

## What changed

### Removed

- **`app/dashboard/_components/MobileDashboardV3.tsx`** (862 lines) and **`MobileLearnHub.tsx`** (289 lines).
- **In `DashboardShell.tsx`:** the `useIsMobile()` width check, `MobileBottomNavBar`, the `mobile-learn` nav id and its view. Home always renders `PreShiftHome`. An old `/dashboard?nav=mobile-learn` link opens Home.
- **CSS (`app/globals.css`):** the `.mobile-bottom-nav` block, including the rule that hid the sidebar below 720px with `!important`; `.dashboard-mobile-footer-actions` and `.dashboard-plan-card-mobile`, which nothing rendered.
- **Tokens:** every `--ip-*` token except `--ip-green`, which the console sidebar, the selected chips and the Cocktail Library still use.
- **`docs/MOBILE_VIEW.md`.** It documented only the removed view.

### `/dashboard` below 720px

- **Layout:** the one-column rules that were already in `app/globals.css` (the `max-width: 720px` block after `.management-unlock-form`) now apply, because the block that overrode them is gone. The sidebar becomes a wrapped row of nav items above the content.
- **Sign out** is no longer hidden at that width. Its intended replacement was never rendered, so it would have been unreachable.
- **No redesign.** This is a fallback for a squeezed desktop window or iPad split view, not a mobile product.

### Staff sign-up link on phones

- **Before:** `/dashboard?join=CODE` on a phone was redirected to `/mobile/home`, which ignored the code. The staff member never joined the venue.
- **`middleware.ts`:** a phone request to `/dashboard` with a `join` parameter goes to `/mobile/settings`. Every other phone request still goes to `/mobile/home`.
- **`app/mobile/_components/SettingsScreen.tsx`:** reads the code once on arrival, removes it from the URL and submits it through the same function as the Join button. The result message now also shows for someone already linked to a venue, and reads "Already connected to ..." when the API reports that.

### Docs

- **`docs/STAFF_APP.md`** section 2, **`docs/MOBILE_BUILD.md`** section 1 and **`docs/CHALLENGES.md`** now describe one mobile app and two surfaces. The README links to `MOBILE_BUILD.md`.
- **Not edited:** the older audits and plans that mention the removed files (`docs/archive/`, `v4-migration-plan/`, `docs/STAFF_DASHBOARD_AUDIT_REPORT.md`, `docs/staff-dashboard-a11y-audit.md`, `docs/ARCHITECTURE_CLEANUP_BLUEPRINT.md`, `docs/Staff Dash Directory.md`). They are records of their date.

### Left in place

- **`/api/coach`, `lib/badges.ts` and `lib/streak.ts`** are still used by `/mobile` or the desktop dashboard.
- **`.dashboard-plan-card*` and `.mockup-logo`** in `app/globals.css` have no users either, but were not part of the mobile view and were left.
- **Old streak keys** (`sbe-streak-last-<user id>`, `sbe-streak-count-<user id>`) stay in the local storage of browsers that used the old view. Nothing reads them.

## Commits

| Commit | What |
|---|---|
| `66221d6` | Remove the legacy view, its CSS and tokens |
| `6c8fc51` | Staff sign-up link on phones |
| `75d7843` | Docs and three to-do items |
| `03e6987` | Part 7 of this file and its to-do items, which were written after the release and had not been committed |

## Checks run

| Check | Result |
|---|---|
| Typecheck | Passed |
| Lint | Passed |
| CSS token lint | 0 raw hex values |
| Unit tests (vitest) | 46 of 46 passed |
| Production build (`next build`) | Passed |
| Search for the removed names in `app`, `lib` and `components` | None left |
| `/dashboard` at 700px and 375px | Not checked |
| Staff sign-up link on a phone | Not checked |
| Mobile e2e suite | Not run. It needs the preview URL and the QA login |
| Unused-code check (`knip`) | Not run. It is not installed |

## Open items

All of these are in `To_do_list.md`, under "Checks to finish".

- **Check the preview** before merging: the narrow `/dashboard` layout on a computer, and the sign-up link on a phone.
- **The sign-up link is lost at sign-in.** A signed-out person who opens it is sent to `/login`, and the code is dropped afterwards, on desktop and phone. Most new staff are signed out when they first open the link, so the fix in this part only helps people who already have a session.
- **Phone checkout return skips the instant upgrade.** `/dashboard?checkout=success&session_id=...` is redirected to `/mobile/home` before the Stripe session is verified, so the plan only updates when the webhook lands.

## Rules for new code (added in Part 8)

- **There is one mobile staff app, at `/mobile`.** Do not add a width check or a second UI to `DashboardShell.tsx`.
- **`/dashboard` is desktop.** Below 720px it reflows with CSS only.
- **A link that must work for staff on a phone** has to be handled in `middleware.ts`, because phones never reach `/dashboard`.
