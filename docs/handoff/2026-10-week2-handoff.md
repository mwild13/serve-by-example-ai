# Handoff: October 2026, Week 2 — By Example Advisory page

- **Dates:** 2026-10-07 to 2026-10-08
- **Branch:** `preview/advisory-page` (6 commits on top of `main` at `9026d94`). Preview: https://preview-advisory-page.serve-by-example-ai.pages.dev/advisory
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

## Open items

- **LAUNCH-CHECKLIST** in `docs/MARKETING_SITE.md`: confirm pricing, then remove noindex and re-add to the sitemap (and update the noindex assertion in the marketing spec); replace the hero image with a real photo; add an About photo; review the supplier disclosure FAQ.
- **Cloudflare Error 1102, "Worker exceeded resource limits".** Seen on the preview while running the suites repeatedly with five parallel browsers. Not investigated: the plan and limits the project is on have not been checked, so it is unknown whether production would do the same. A single stray e2e failure is worth one re-run before treating it as real.
- **Copy to review:** the sticky bar label still reads "Free 15 min discovery call" and one FAQ answer says "the discovery call", while the buttons now say "free 15 min call". The `strategy-session` slug is carried by a link on the words "Strategy Sessions" in the add-ons footnote.
- **Phone mockup text** in the Venue Hub band ("3 new deals", "8 of 11 on track" and so on) is placeholder sample content.

---

## Rules for new code (added this week)

- **Click or conversion tracking goes through `trackEvent` in `lib/consent.ts`.** Do not call `gtag` directly; the helper is what keeps tracking behind cookie consent.
- **Links into `/contact` can carry `?source=<slug>&package=<slug>`.** Lowercase letters, digits and hyphens only, 40 characters at most. Anything else is dropped silently.
- **Public-page e2e tests go in `tests/e2e-marketing/`.** In those tests, wait for the page to reach full height before scrolling. On a deployed build the page can still be one screen tall when `goto` resolves.
- **Dynamic text in a screenshot test needs a stable size, not only a mask.** Tag it `data-e2e-mask` as before; the Home test shows how to pin its content.
