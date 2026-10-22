# Marketing Site — Serve By Example

Companion to `CLAUDE.md`, not a replacement — where the two conflict, `CLAUDE.md` wins. Covers the public-facing marketing routes in `app/` (everything outside `/dashboard`, `/management`, and the auth/utility routes).

## 1. Scope — Marketing Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/platform` | Platform overview |
| `/platform/challenges` | Interactive Challenges marketing page |
| `/solutions` | Solutions by venue type |
| `/solutions/fine-dining` | Fine dining vertical |
| `/solutions/franchise-systems` | Franchise systems vertical |
| `/solutions/hotel-fb` | Hotel F&B vertical |
| `/solutions/pub-groups` | Pub groups and multi-venue groups vertical. `/solutions/multi-venue` redirects here (`next.config.ts`) and has no page file |
| `/for-venues` | Venue operator landing |
| `/pricing` | Pricing (Stripe checkout) — see §2, same page component as `/membership` |
| `/membership` | Re-exports `/pricing`'s page component with its own metadata (title "Membership Plans", "Founding Member" framing) — **missing from prior docs entirely** despite being the link target most marketing CTAs actually point to |
| `/vs-generic-lms` | Comparison page — **also missing from prior docs entirely** |
| `/demo` | Scripted Live Guest demo: Sharon and the cold parmy, three replies, no sign-up and no AI call (`lib/demo-guest.ts`, held to her real brief by `lib/demo-guest.test.ts`). Sends `demo_start` and `demo_complete` to Analytics |
| `/demo/complaint-master` | Complaint handling demo |
| `/how-it-works` | How It Works |
| `/roi` | ROI Calculator |
| `/resources` | Resources hub |
| `/resources/sop-toolkit` | Free SOP toolkit lead magnet |
| `/toolkit` | SOP toolkit landing page |
| `/toolkit/success` | Post-toolkit-download success page |
| `/roadmap` | Public product roadmap |
| `/security` | Security & Safety |
| `/about` | About |
| `/advisory` | By Example Advisory — hospitality consulting packages. Not linked from anywhere on the site (the footer link was removed on 2026-10-13); reached by direct URL only. `robots: noindex` and deliberately absent from `app/sitemap.ts`. All CTAs go to `/contact?source=advisory&package=<slug>` (the contact form forwards both to the enquiry email) and fire the GA event `advisory_cta_click` via `components/advisory/AdvisoryCtaTracker.tsx`. Styles use the `sbe-adv-` prefix in `app/globals.css`; hero reuses the homepage `sbe-mkt-hero-*` classes |
| `/contact` | Contact |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/refunds` | Refund and Cancellation Policy. Restates section 5 of `/terms`; the link given to Stripe |
| `/cookies` | Cookie Policy |

## 2. Canonical URLs & Routing Rules

**`/pricing` vs `/membership`**: `app/(marketing)/membership/page.tsx` is a one-line re-export — `export { default } from "@/app/pricing/page";` — same component, different `layout.tsx` metadata. Both pages set their own self-referential SEO canonical:

```ts
// app/(marketing)/pricing/layout.tsx
alternates: { canonical: "/pricing" }
// app/(marketing)/membership/layout.tsx
alternates: { canonical: "/membership" }
```

Both are listed separately in `app/sitemap.ts`. This is a duplicate-content SEO issue — two canonical URLs for identical content. `/membership` is the link target used almost everywhere across marketing pages ("View Pricing" CTAs on `/roi`, `/solutions/*`, `/for-venues`, `/how-it-works`, `/resources`, `/roadmap`, `/demo/*`, the homepage), while `/pricing` is the route most historically documented. Recorded as current state in Known Gaps below — not fixed here.

**Geo-blocking** (source: `lib/geo-config.ts`) — Australia-only platform:
- `shouldApplyGeoBlock(pathname, country)` no-ops entirely outside `NODE_ENV=production` (local dev/build never geo-blocks).
- Country resolved from Cloudflare's `cf.country` / the `cf-ipcountry` header. Unknown, missing, or `XX` is **denied by default** (`isCountryAllowed` strict default-deny).
- `restrictedRoutes`: `/login`, `/signup`, `/onboarding`, `/dashboard`, `/management`.
- `marketingRoutes` is **deliberately empty** — all marketing/hero content is AU-only too. A comment in the config explains why: this list used to include `/pricing`, `/for-venues`, `/demo`, `/platform`, which created a bypass (`/restricted` → `/privacy` (public) → Navbar → `/pricing` (then-allowed) → full site). That bypass was closed by emptying this list.
- `publicRoutes` (accessible to all countries): `/` (the home page, since 2026-10-12, so Google's sign-in brand check can read it), `/restricted`, `/geo-block`, `/privacy`, `/terms`, `/refunds`, `/cookies`, `/contact`.
- `geoBlockPath` is `/restricted` — **this is the actual redirect target**, not `/geo-block`. `/geo-block` is a real, separate page (own `"Australia Only – For Now"` messaging, `robots: noindex`) that sits in `publicRoutes` (so it's reachable if linked to directly) but the middleware's redirect never routes there — it always sends blocked visitors to `/restricted` instead.

## 3. Brand Voice & Copy Rules

| Say this | Not this | Where confirmed |
|---|---|---|
| Manager Console | ~~Mission Control~~ | Navbar, Footer, homepage feature card, `/how-it-works`, `/solutions`, `/pricing`, `/privacy`, `/vs-generic-lms`, `components/ui/CompareMatrix.tsx` |
| 14-Day Performance Guarantee | — | `app/(marketing)/page.tsx:460-486`, a dedicated section: *"If training engagement doesn't measurably increase within your first 14 days, you won't be charged. No questions asked."* |

**Be precise about which "14-day" claim is being referenced** — two distinct claims share the same number and both appear across marketing copy:
1. **14-day free trial** (trial length) — reused on `/pricing`, `/terms`, `HeroSection.tsx`, `CompareMatrix.tsx`, `lib/trial.ts`.
2. **14-Day Performance Guarantee** (money-back guarantee, conditional on engagement) — `app/(marketing)/page.tsx:460-486` only.

These are not interchangeable — don't use "14-day" copy from one context to justify wording in the other.

"Manager Console" is the correct term for **marketing copy** (this doc's scope, `app/(marketing)` routes). It does still leak as "Mission Control" in a few real user-facing strings on the authenticated product surface (`/management/dashboard`'s `<title>`, its error page, some role-picker option labels) — that's a product-surface naming drift, not a marketing-copy violation, and is documented in `docs/MANAGER_CONSOLE.md`'s Known Gaps, not here.

## 4. Component Usage

**`components/marketing/`** — what every marketing page is built from. `docs/Pages-Redesign.md` section 4.3 is the full reference.

| Component | Role | Used in |
|---|---|---|
| `PageHero.tsx` | The single sub-page hero | Every sub-page |
| `CTABand.tsx` | End-of-page CTA band: one primary action + optional secondary text link | Every page except `/toolkit` and the legal pages |
| `sections.tsx` | The editorial section patterns as server components: `SplitPanel`, `MediaRows`, `Ledger`, `RuledList`, `Steps`, `Strip`, `Faq`, `SectionHead` | Every sub-page |
| `SolutionPage.tsx` | Shared layout for the four `/solutions/<vertical>` pages | `/solutions/*` |
| `ContactForm.tsx` | Client island holding the contact form and its `source` / `package` attribution | `/contact` |
| `PricingPlans.tsx` | Client island holding tier data, billing toggle, trial start and checkout | `/pricing` |
| `LogoMarquee.tsx` | Logo marquee (blocked on real customer logos) | Homepage |

`FeatureGrid`, `MetricsStrip`, `SectionHeading` and `components/icons/MarketingIcons.tsx` were deleted in October 2026. Do not recreate them.

**`components/Navbar.tsx`** (shared, styles in `app/globals.css`): signed-out visitors see a Login button; signed-in visitors see the same button filled green (`.nav-login-btn--in`). Both go to `/login`, which sends a signed-in visitor straight on to the app (`middleware.ts`).

**`components/ui/`** — for pricing-table and comparison content specifically:

| Component | Purpose |
|---|---|
| `CompareMatrix.tsx` | Full feature-comparison matrix (Staff/Venue/Group/Franchise columns); docstring targets the `/membership` page | `app/(marketing)/pricing/page.tsx`, `app/(marketing)/for-venues/page.tsx` |
| `ROICalculator.tsx` | Interactive ROI calculator widget | Homepage, `/roi`, `/pricing` |
| `PricingIcons.tsx` | SVG icon set (`IncludedIcon`, `ExcludedIcon`, `TreeConnector`) for the pricing/membership matrix | `CompareMatrix.tsx` |

**Note**: `components/ui/` does not contain `BrowserMockup.tsx`, `DashboardMockup.tsx`, or `WaitlistSection.tsx` — if you've seen these referenced elsewhere, they no longer exist; don't import them.

## `/advisory` — LAUNCH-CHECKLIST

The page is live on its URL but held back from search until these are done:

- [ ] Confirm pricing, then remove `robots: { index: false }` from `app/(marketing)/advisory/page.tsx` and re-add `/advisory` to `app/sitemap.ts`. Update the noindex assertion in `tests/e2e-marketing/advisory.spec.ts` at the same time.
- [ ] Replace the hero image (`public/images/advisory/advisory-hero.jpg`) with a real photo.
- [ ] Add an About photo. `public/images/advisory/advisory-about.jpg` is in the repo but unused; the About section is currently text-only.
- [ ] Review the supplier disclosure FAQ ("Do you have ties to any suppliers?") so it matches Mitch's current role and supplier relationships.

## Cookie Consent & Analytics

Google Analytics (`G-EF9YRFXKBG`) is **not** in `app/layout.tsx`. It loads only after the visitor opts in.

- `components/CookieBanner.tsx` (mounted in `app/layout.tsx`): non-modal card, bottom-left on desktop / bottom sheet on mobile. Actions: Accept all, Customise (Analytics toggle), Essential only. UI is hidden on app/utility routes (`HIDDEN_PREFIXES`), but a stored choice is still applied there.
- `lib/consent.ts`: `sbe-cookie-consent` localStorage record (`{v, analytics, ts}`), `applyAnalyticsConsent()` injects gtag.js from the client bundle (no inline script, works with the strict-dynamic CSP). Bump `CONSENT_VERSION` to re-prompt everyone.
- Footer `Cookie settings` (`components/CookieSettingsLink.tsx`) reopens the banner via the `sbe:open-cookie-settings` event.
- Any new analytics/marketing tag must be gated through `lib/consent.ts`, not added to the layout.
- `connect-src` in `middleware.ts` allows Google's three documented hosts for Analytics (`*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com`), because hits can go to a regional host. A new ad platform's hosts must be added there before its tag goes in.
- **Ad platforms (decided 2026-10-12):** Google Ads only, with conversions imported from the Analytics events. No ad pixel is in the code. The numbers to watch are in `docs/FUNNEL_METRICS.md`.

## Error Reporting

Errors go to Sentry through `lib/report-error.ts`, which posts to Sentry's envelope endpoint with `fetch`. There is no Sentry SDK in the build, on purpose: the Next.js SDK threatens the worker's size limit.

- Off until `NEXT_PUBLIC_SENTRY_DSN` is set in Cloudflare Pages. With it unset, `reportError()` does nothing and the CSP allows no extra host.
- **Browser:** `components/ErrorLogger.tsx` (uncaught errors and rejected promises) and the five `error.tsx` boundaries.
- **Server:** `instrumentation.ts` (`onRequestError`, for anything uncaught) and the catch blocks of the billing and AI routes. On the server, `await reportError(...)`: a worker drops unfinished requests once it has responded.
- It sets no cookie and stores nothing in the browser, so it does not wait for cookie consent. It sends the error, its stack and the path without the query string; no user id, email or IP. `/privacy` and `/cookies` both name Sentry.
- A new route that catches its own errors should call `reportError(error, { route, url: req.url })` beside its `console.error`.

## Known Gaps / Drift

- **`/pricing` and `/membership` duplicate-canonical SEO issue** (§2) — recorded as fact, not fixed.
- **`/geo-block` is a real, reachable page that the geo-block middleware never redirects to** (§2) — the actual redirect target is `/restricted`. Possibly stale/orphaned; not resolved here.
- **"Mission Control" leaks into a few user-facing strings outside marketing copy** on the authenticated product surface (§3) — see `docs/MANAGER_CONSOLE.md` for the specifics; out of scope for this doc since it only governs `app/(marketing)`.

## Related Docs

- `docs/Pages-Redesign.md` — full visual/structural marketing redesign spec (default left-aligned headers, no generic gradients, vary feature-list presentation, scope-limited to marketing pages) — this doc does not duplicate it
- `docs/SBE-Marketing-Audit-July2026.md` — historical point-in-time audit
- `docs/zHistorical/pricing-membership-overhaul.md` — historical background on the `/pricing` vs `/membership` split
