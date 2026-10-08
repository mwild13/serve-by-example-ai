# Handoff: October 2026, Week 2 — By Example Advisory page, homepage UI overhaul and pricing page redesign

> **Four pieces of work this week.** Part 1 (below) is the Advisory page, merged to `main`. Part 2 is the homepage UI overhaul, also merged to `main`. Part 3 is the pricing page redesign, also merged to `main`. Part 4, at the end of this file, is the new typography and the redesign of every remaining marketing page, on `preview/marketing-redesign` and **not yet pushed or merged**. The AI model switch to `gpt-6-luna` is recorded in Part 1 and is merged too.

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
- **Branch:** `preview/marketing-redesign`, cut from `main` after the Part 3 merge. Seven commits, local only: **not pushed, not merged**.
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
| Marketing e2e, against a deployed preview | Not run. The branch is not pushed |
| `/dashboard`, `/mobile`, `/management` in a browser | Not checked. They need a login, which the local server does not have |
| `npm run build` and `build:cloudflare` | Not run |
| Mobile e2e | Not run |

## Open items

- **Push and preview.** Mitchell to name the branch to push to; then run the marketing e2e suite once against the preview.
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

