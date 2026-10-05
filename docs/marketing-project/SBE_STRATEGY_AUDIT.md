# SBE Strategy Audit

Combined source documents: MARKETING_SITE.md, docs/SBE-Marketing-Audit-July2026.md, docs/HOMEPAGE.md.

---

<!-- Source: MARKETING_SITE.md -->

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
| `/solutions/multi-venue` | Multi-venue groups vertical |
| `/solutions/pub-groups` | Pub groups vertical |
| `/for-venues` | Venue operator landing |
| `/pricing` | Pricing (Stripe checkout) — see §2, same page component as `/membership` |
| `/membership` | Re-exports `/pricing`'s page component with its own metadata (title "Membership Plans", "Founding Member" framing) — **missing from prior docs entirely** despite being the link target most marketing CTAs actually point to |
| `/vs-generic-lms` | Comparison page — **also missing from prior docs entirely** |
| `/demo` | Public AI demo |
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
| `/contact` | Contact |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/cookies` | Cookie Policy |

## 2. Canonical URLs & Routing Rules

**`/pricing` vs `/membership`**: `app/membership/page.tsx` is a one-line re-export — `export { default } from "@/app/pricing/page";` — same component, different `layout.tsx` metadata. Both pages set their own self-referential SEO canonical:

```ts
// app/pricing/layout.tsx
alternates: { canonical: "/pricing" }
// app/membership/layout.tsx
alternates: { canonical: "/membership" }
```

Both are listed separately in `app/sitemap.ts`. This is a duplicate-content SEO issue — two canonical URLs for identical content. `/membership` is the link target used almost everywhere across marketing pages ("View Pricing" CTAs on `/roi`, `/solutions/*`, `/for-venues`, `/how-it-works`, `/resources`, `/roadmap`, `/demo/*`, the homepage), while `/pricing` is the route most historically documented. Recorded as current state in Known Gaps below — not fixed here.

**Geo-blocking** (source: `lib/geo-config.ts`) — Australia-only platform:
- `shouldApplyGeoBlock(pathname, country)` no-ops entirely outside `NODE_ENV=production` (local dev/build never geo-blocks).
- Country resolved from Cloudflare's `cf.country` / the `cf-ipcountry` header. Unknown, missing, or `XX` is **denied by default** (`isCountryAllowed` strict default-deny).
- `restrictedRoutes`: `/login`, `/signup`, `/onboarding`, `/dashboard`, `/management`.
- `marketingRoutes` is **deliberately empty** — all marketing/hero content is AU-only too. A comment in the config explains why: this list used to include `/pricing`, `/for-venues`, `/demo`, `/platform`, which created a bypass (`/restricted` → `/privacy` (public) → Navbar → `/pricing` (then-allowed) → full site). That bypass was closed by emptying this list.
- `publicRoutes` (accessible to all countries): `/restricted`, `/geo-block`, `/privacy`, `/terms`, `/cookies`, `/contact`.
- `geoBlockPath` is `/restricted` — **this is the actual redirect target**, not `/geo-block`. `/geo-block` is a real, separate page (own `"Australia Only – For Now"` messaging, `robots: noindex`) that sits in `publicRoutes` (so it's reachable if linked to directly) but the middleware's redirect never routes there — it always sends blocked visitors to `/restricted` instead.

## 3. Brand Voice & Copy Rules

| Say this | Not this | Where confirmed |
|---|---|---|
| Manager Console | ~~Mission Control~~ | Navbar, Footer, homepage feature card, `/how-it-works`, `/solutions`, `/pricing`, `/privacy`, `/vs-generic-lms`, `components/ui/CompareMatrix.tsx` |
| 14-Day Performance Guarantee | — | `app/page.tsx:460-486`, a dedicated section: *"If training engagement doesn't measurably increase within your first 14 days, you won't be charged. No questions asked."* |

**Be precise about which "14-day" claim is being referenced** — two distinct claims share the same number and both appear across marketing copy:
1. **14-day free trial** (trial length) — reused on `/pricing`, `/terms`, `HeroSection.tsx`, `CompareMatrix.tsx`, `lib/trial.ts`.
2. **14-Day Performance Guarantee** (money-back guarantee, conditional on engagement) — `app/page.tsx:460-486` only.

These are not interchangeable — don't use "14-day" copy from one context to justify wording in the other.

"Manager Console" is the correct term for **marketing copy** (this doc's scope, `app/(marketing)` routes). It does still leak as "Mission Control" in a few real user-facing strings on the authenticated product surface (`/management/dashboard`'s `<title>`, its error page, some role-picker option labels) — that's a product-surface naming drift, not a marketing-copy violation, and is documented in `docs/MANAGER_CONSOLE.md`'s Known Gaps, not here.

## 4. Component Usage

**`components/marketing/`** — an entire directory not previously documented anywhere, and the real answer to "which component for feature cards / metric strips / CTA bands":

| Component | Role | Used in |
|---|---|---|
| `PageHero.tsx` | Replaces every hand-coded `.inner-hero` block | ~24 pages: `/demo`, `/demo/complaint-master`, `/contact`, `/roi`, `/vs-generic-lms`, `/privacy`, `/security`, `/roadmap`, `/resources`, `/resources/sop-toolkit`, `/platform`, `/terms`, `/solutions` + all 5 verticals, `/for-venues`, `/about`, `/how-it-works`, `/pricing`, `/toolkit`, `/cookies` |
| `FeatureGrid.tsx` | Feature/benefit grid; variants `'default' \| 'dark' \| 'stat'`; replaces `bento-grid`/`sol-feature-grid`/`benefit-grid` markup; icons from `components/icons/MarketingIcons.tsx` | Homepage, `/vs-generic-lms`, `/roi`, `/security`, `/roadmap`, `/resources/sop-toolkit`, `/platform`, all `/solutions/*`, `/for-venues`, `/about`, `/how-it-works` |
| `MetricsStrip.tsx` | Horizontal stat-row band; enforces an "honesty rule" — no fabricated outcome numbers | Individual marketing pages — check usage before assuming a page has one |
| `CTABand.tsx` | End-of-page CTA band: one primary action + optional secondary text link | Across marketing pages per `docs/Pages-Redesign.md` §6.3 |
| `LogoMarquee.tsx` | Logo marquee (blocked on real customer logos) | Homepage |

**`components/ui/`** — for pricing-table and comparison content specifically:

| Component | Purpose |
|---|---|
| `CompareMatrix.tsx` | Full feature-comparison matrix (Staff/Venue/Group/Franchise columns); docstring targets the `/membership` page | `app/pricing/page.tsx`, `app/for-venues/page.tsx` |
| `SectionHeading.tsx` | `eyebrow`/`title`/`copy`/`align` props, **defaults to `align: 'left'`** per `docs/Pages-Redesign.md` §2.2's rule against centering every section | ~13 pages |
| `ROICalculator.tsx` | Interactive ROI calculator widget | Homepage, `/roi`, `/pricing` |
| `PricingIcons.tsx` | SVG icon set (`IncludedIcon`, `ExcludedIcon`, `TreeConnector`) for the pricing/membership matrix | `CompareMatrix.tsx` |

**Note**: `components/ui/` does not contain `BrowserMockup.tsx`, `DashboardMockup.tsx`, or `WaitlistSection.tsx` — if you've seen these referenced elsewhere, they no longer exist; don't import them.

## Cookie Consent & Analytics

Google Analytics (`G-EF9YRFXKBG`) is **not** in `app/layout.tsx`. It loads only after the visitor opts in.

- `components/CookieBanner.tsx` (mounted in `app/layout.tsx`): non-modal card, bottom-left on desktop / bottom sheet on mobile. Actions: Accept all, Customise (Analytics toggle), Essential only. UI is hidden on app/utility routes (`HIDDEN_PREFIXES`), but a stored choice is still applied there.
- `lib/consent.ts`: `sbe-cookie-consent` localStorage record (`{v, analytics, ts}`), `applyAnalyticsConsent()` injects gtag.js from the client bundle (no inline script, works with the strict-dynamic CSP). Bump `CONSENT_VERSION` to re-prompt everyone.
- Footer `Cookie settings` (`components/CookieSettingsLink.tsx`) reopens the banner via the `sbe:open-cookie-settings` event.
- Any new analytics/marketing tag must be gated through `lib/consent.ts`, not added to the layout.

## Known Gaps / Drift

- **`/pricing` and `/membership` duplicate-canonical SEO issue** (§2) — recorded as fact, not fixed.
- **`/geo-block` is a real, reachable page that the geo-block middleware never redirects to** (§2) — the actual redirect target is `/restricted`. Possibly stale/orphaned; not resolved here.
- **"Mission Control" leaks into a few user-facing strings outside marketing copy** on the authenticated product surface (§3) — see `docs/MANAGER_CONSOLE.md` for the specifics; out of scope for this doc since it only governs `app/(marketing)`.

## Related Docs

- `docs/Pages-Redesign.md` — full visual/structural marketing redesign spec (default left-aligned headers, no generic gradients, vary feature-list presentation, scope-limited to marketing pages) — this doc does not duplicate it
- `docs/SBE-Marketing-Audit-July2026.md` — historical point-in-time audit
- `docs/pricing-membership-overhaul.md` — historical background on the `/pricing` vs `/membership` split

---

<!-- Source: docs/SBE-Marketing-Audit-July2026.md -->

# SBE Marketing Pages — Audit Report (Revised)
**Prepared:** July 2026 | **Revised:** July 2026 — Secondary review incorporating legal, compliance, and conversion directives
**Scope:** All public-facing (pre-login) marketing pages at servebyexample.co
**Method:** Live page fetch + source code review (geo-blocked pages read from codebase directly)

> **How to use this document:** Work through the Priority Implementation Queue at the end in strict tier order — Critical before High before Medium. Do not begin any codebase sweep until items within a Critical tier are approved. The Execution Checklist is a companion document for the engineering phase.

---

## Summary: Key Findings Across All Pages

### Critical tier (act before any other work)

**1. Pre-launch operational metrics breach Australian Consumer Law risk threshold — on three pages**
Pages `/solutions/fine-dining`, `/solutions/franchise-systems`, and `/solutions/pub-groups` present specific numerical outcomes (e.g., "200+ staff onboarded across 12 locations in 30 days", "22% upsell lift in 8 weeks", "70% reduction in onboarding time") with small-print disclaimers noting these are based on "modelling." Under the ACCC's guidelines on misleading representations, presenting modelled projections as operational outcomes — even with a disclaimer — is a compliance risk for a pre-launch product. All such metrics must be reframed as capability claims before launch.

**2. "Three Systems, One Hub" is factually wrong — appears on homepage AND /platform**
Both pages describe the Cocktail & Spec Library as a third standalone system. It is a feature within the Staff Dashboard. The product has exactly two systems: the Staff Dashboard and the Manager Console. The heading and the three-card structure must be corrected on both pages to "Two Systems, One Platform."

**3. Cookies policy contains wrong domain in a legal document**
The cookies policy states "our platform at servebyexample.com" — the domain is servebyexample.co. Incorrect domain in a legal disclosure.

**4. Pricing URL is split across two routes, creating a funnel dead-end**
The nav links to `/pricing`. Internal CTAs throughout the site link to `/membership`. Both routes serve the same page (confirmed: `/app/membership/page.tsx` re-exports the pricing component). Non-AU visitors who click the nav "Pricing" link are redirected to `/restricted`, a total dead-end. Canonical URL must be established and applied consistently.

**5. Two competing guarantee claims on different pages**
The `/demo` page presents a "7-Day Guarantee" ("If your staff doesn't complete their first live scenario within 7 days, you pay $0"). The homepage presents a "14-Day Performance Guarantee." Two different guarantees with different terms erode trust. Unify site-wide to the 14-Day Performance Guarantee.

### High tier

**6. "Manager Console" is the correct product name — the site uses "Mission Control" throughout**
The confirmed correct name for the manager-facing system is "Manager Console." The live site uses "Manager Mission Control," "Mission Control," or "mission control" in marketing copy, legal documents (Privacy Policy Section 7), and source labels. This must be standardised globally.

**7. /pub-groups and /multi-venue are near-duplicate pages**
Both target multi-site operators with identical "5 venues, 125 staff" metrics and an ~80% feature overlap. One page should be retired or meaningfully differentiated by audience lens.

**8. /for-venues comparison table uses invented feature names inconsistent with the rest of the site**
Feature names in the comparison matrix — "Neural Scenario Forge," "Rapid Deploy Drilling," "Reflex Scenario Challenges," "Multilingual Activation Layer," "Deployment Intelligence Survey," "Command & Compliance Centre," "Competitive Performance Index," "Operator Intelligence Assistant," "Franchise Command Network" — appear nowhere else on the site. Every other page uses plain language to describe the same features.

**9. Primary CTA is inconsistent across every page**
Defined standard: Primary = "Start Free Trial", Secondary = "Book a 15-Min Call." What appears on pages: "View Memberships →" (homepage hero), "Try Free for 14 Days" (pricing), "Create free account" (demo), "Request Venue Access" (solutions, for-venues, roadmap), "Try the Demo" (how-it-works, platform). No page follows the standard consistently.

**10. ROI Calculator and Revenue Impact Calculator are the same component — named differently in context**
`<ROICalculator />` is one component. It renders with the eyebrow "Revenue Impact Calculator" inside the component itself, but is called "ROI Calculator" in page headings and metadata on `/roi` and `/pricing`. This is a naming inconsistency within a single component's own display label vs its page context. Standardise the in-component eyebrow to match its page context, or pick one name and use it everywhere.

---

## Homepage Audit — `/`

### Section-by-section table

| # | Section | Single job | Doing that job? | Redundancy | Recommendation |
|---|---------|-----------|-----------------|------------|----------------|
| 1 | Hero: "Turn 6 Months of Onboarding Into 6 Weeks" | State value prop and convert to trial | Partial — strong headline, wrong primary CTA ("View Memberships →") | None | **Modify:** Change CTA to "Start Free Trial" → `/login?intent=trial&tier=boutique`. "How it works" becomes secondary. |
| 2 | Venue-type scrolling ticker | Signal target audience | Yes | None | **Keep** |
| 3 | Metric strip (3×, 100+, 19, AI Scoring) | Establish credibility with numbers | Partial — "19 Languages Supported" is a feature claim, breaks the benefit pattern. "Advanced AI Scoring" breaks numeric format. | None | **Modify:** Replace "19 Languages Supported" with an outcome metric. Align all four slots to the same format (number + buyer outcome). |
| 4 | "Three Systems, One Hub" | Explain what the product is | No — factually wrong; Cocktail Library is not a system | Duplicates section 6 | **Replace:** Rename to "Two Systems, One Platform." Remove Cocktail Library card. Add Manager Console + Staff Dashboard as the two cards, each with a screenshot from section 6. Then delete section 6. |
| 5 | Founder section | Build trust and brand credibility | Yes — specific, grounded, not generic | None | **Keep** |
| 6 | "Built for Two Different Roles" with screenshots | Show the two product UIs | Yes — best proof section on the page | Duplicates section 4 entirely | **Delete:** Screenshots move into corrected section 4. This section's job disappears once section 4 is fixed. |
| 7 | "The Mastery Path — Know it. Apply it. Managers see it." | Explain the 3-stage training loop | Yes — clear and well-structured | None | **Keep** |
| 8 | "Training that actually measures performance" (3×/24/7/0) | Differentiate on AI scoring | Partial — good stats, slight theme overlap with section 7 | Low overlap | **Keep.** The "0 Hours of Manager Admin" framing is strong — lead with that stat. |
| 9 | SOP template teaser | Soft lead gen conversion | Yes — relevant, non-intrusive | None | **Keep** |
| 10 | Pricing preview ("Plans & Pricing") | Orient visitor toward pricing decision | Partial — tier dual-naming ("Venue Pro / Boutique") is confusing; pricing URL inconsistency between nav (/pricing) and CTA (/membership) | None | **Modify:** Use single, clean tier names per card. Standardise all pricing links to one canonical URL. |
| 11 | 14-Day Performance Guarantee | Reduce conversion friction | Yes — strong framing | None | **Keep.** Ensure this is the single guarantee statement used site-wide (replaces the 7-day claim on /demo). |
| 12 | FAQ | Handle exit objections | Yes — 6 relevant questions | None | **Keep.** Sourcing note: "90%+ completion rates" answer needs an attribution line. |
| 13 | Bottom CTA: "Ready to train your team faster?" | Final conversion | Yes — "No credit card required" is strong | None | **Keep** |
| 14 | ROI Calculator (embedded below footer area) | Provide financial modelling | Partial — buried placement, no section heading in main content | Duplicated by /roi page | **Modify:** Either promote to a named homepage section with an intro paragraph, or remove from homepage entirely and route to /roi. |

### Homepage meta notes
The main meta description ("Get your team shift-ready instantly") targets staff. The OG description ("Real-time team analytics… built for Australian venue operators") targets the buyer/GM. Align both to the primary buyer persona.

---

## Core Funnel Pages

### `/pricing` — Canonical pricing URL (currently split with `/membership`)

**CRITICAL — Pricing URL consolidation:** The nav links to `/pricing`. Throughout the site, CTAs link to `/membership`. Both routes serve the same page (confirmed in source: `/app/membership/page.tsx` re-exports `/app/pricing/page.tsx`). Establish `/pricing` as the canonical URL. Update all internal CTAs that reference `/membership` to use `/pricing`. If geo-blocking must persist, ensure the logic redirects to `/restricted` only as a last-resort fallback — not as the default response to the nav "Pricing" link for any visitor. The nav "Pricing" link hitting a geo-block wall is a complete funnel break.

**CTA:** The pricing page renders "Try Free for 14 Days" for boutique and commercial tiers. This is an acceptable variant of "Start Free Trial" and consistent with the 14-day guarantee framing.

**Tier display naming:** The pricing page correctly uses "Boutique" and "Commercial" as the venue tier names. The homepage pricing preview section uses "Venue Pro / Boutique" and "Group / Commercial" — dual-name format creates confusion. Mandate single tier names everywhere: **Boutique** and **Commercial** only.

---

### `/demo` — Live Scenario Demo

**Page job:** Let visitors experience the AI scenario engine without committing — convert to trial.

**CRITICAL — Guarantee mismatch:** This page states "If your staff doesn't complete their first live scenario within 7 days, you pay $0." The homepage guarantee is 14 days with a different trigger condition ("training engagement doesn't measurably increase"). Replace the 7-day guarantee with the 14-Day Performance Guarantee across all touchpoints.

**CTA:** "Create free account" instead of "Start Free Trial." Inconsistent. Fix.

**Solution vertical links:** The row of vertical links at the page bottom (Pub Groups, Fine Dining & Bars, Hotel F&B, etc.) all point to geo-blocked pages for non-AU visitors. Remove or make conditional.

**Complaint Master discoverability:** `/demo/complaint-master` is a strong standalone tool with no discovery path from `/demo`. Add a card or secondary link.

---

### `/how-it-works` — Source only (geo-blocked)

**CRITICAL — Manager Console naming:** The "Consoles" section labels the management dashboard "Mission Control." Correct to "Manager Console."

**Accuracy:** Metadata describes "three-stage training loop." The page body presents 5 steps + 6 pillars. The Mastery Path on the homepage uses 3 stages. Align the step/stage count across all pages and metadata.

**Conversion:** Final CTA is "Try the Demo." Secondary should be "Book a 15-Min Call," not "View Pricing."

---

### `/roi` — ROI / Revenue Impact Calculator

**Page job:** Help a buyer quantify the financial return.

**Naming:** The page h1 says "Calculate your training return on investment." The component renders "Revenue Impact Calculator" as its internal eyebrow. The metadata title says "Hospitality Training ROI Calculator." Three different names for the same thing. Decision required: pick "ROI Calculator" or "Revenue Impact Calculator" and apply it to the page h1, metadata, and the component eyebrow label consistently.

**Homepage duplication:** The same `<ROICalculator />` component is also embedded on the homepage (below the footer). The homepage placement is hidden below the fold with no section heading. Either promote it to a named section on the homepage or remove it and route to `/roi`.

**Conversion:** CTAs "Try the Demo" + "View Pricing" are appropriate. Secondary could shift to "Book a 15-Min Call" for buyers using this page to build a business case.

---

### `/for-venues` — Venue Operator Landing Page

**CRITICAL — Invented feature names in comparison table:** The feature matrix uses "Neural Scenario Forge," "Rapid Deploy Drilling," "Reflex Scenario Challenges," "Multilingual Activation Layer," "Deployment Intelligence Survey," "Command & Compliance Centre," "Competitive Performance Index," "Compliance Pulse Monitoring," "Operator Intelligence Assistant," "Franchise Command Network." These names appear nowhere else on the site and contradict the plain-language descriptions used everywhere else. Replace all with the same plain-language naming used on marketing pages.

**Table structure:** Four columns (Staff / Venue / Group / Franchise). The "Franchise" column should be "Enterprise" to match homepage labelling, or the homepage should be updated to "Franchise." Pick one and apply it everywhere.

**Page structure:** The comparison table belongs on the pricing page, not here. This page should close with a simpler "What's included" summary and route operators to `/pricing` for the full comparison.

---

## Platform & Feature Pages

### `/platform`

**CRITICAL — "Three Systems" heading:** Same factual error as the homepage. Section heading and three-card structure must be corrected to "Two Systems, One Platform."

**Manager Console naming:** Section subtitle "Your venue's mission control" is acceptable as a descriptive phrase. However the section that reads "Manager Mission Control" as a column header in the three-system section must be corrected to "Manager Console."

**Conversion:** Page ends with "Try the Demo" + "For Venues." Missing a "Start Free Trial" CTA for visitors ready to commit.

---

### `/platform/challenges` — Geo-blocked, not auditable from this session

Page exists (confirmed by geo-block with noindex meta) but source was not accessible in this session. Flag for manual internal review — confirm the page uses "Two Systems" framing and correct CTA pattern.

---

## Solutions Pages — Consistency Matrix

All five solutions pages share the same four-section template: Hero → Metrics strip → Feature grid → CTA. Template consistency is good. Differentiation and compliance are the issues.

### Consistency matrix

| Element | /fine-dining | /franchise-systems | /hotel-fb | /multi-venue | /pub-groups |
|---------|-------------|-------------------|-----------|-------------|------------|
| Template | Hero/Metrics/Grid/CTA | Same | Same | Same | Same |
| Primary CTA | Request Venue Access | Same | Same | Same | Same |
| Secondary CTA | View Pricing | Talk to Us | Talk to Us | Talk to Us | Talk to Us |
| Pre-launch metric risk | **High** — 22% upsell claim | **Critical** — 200+ staff/12 locations claim | Low | Low | **High** — 70% onboarding claim |
| Vertical-specific content | Strong | Strong | Good | Partial | Weak |
| Overlap with other page | Low | Low | Low | High (pub-groups) | High (multi-venue) |
| Breadcrumb parent label | Solutions | Solutions | Solutions | Solutions | **Industries** (inconsistent) |
| ACCC reframe required | Yes | Yes | No | No | Yes |

### Per-page notes

**/solutions/fine-dining**
Good vertical differentiation (cocktail knowledge, upsell tracking, premium service recovery). The "22% average upsell revenue lift within 8 weeks" metric is a pre-launch modelled claim. **Reframe to:** "Built to drive upsell performance across cocktail and premium service training." Footer nav lists both "Bars" and "Restaurants" linking here — inaccurate for restaurants, which have different training needs. Either broaden the page scope or remove the "Restaurants" footer link.

**/solutions/franchise-systems**
Best differentiated page of the five. The "200+ staff onboarded across 12 locations in under 30 days" claim is the highest-risk metric on the site — a specific outcome figure with a "modelling" disclaimer for a pre-launch product. **Mandatory reframe to:** "Built to onboard groups of 200+ staff across 12+ locations from Day 1." Remove the time claim entirely — it is unverifiable pre-launch.

**/solutions/hotel-fb**
Appropriately differentiated. "19 languages supported for diverse hotel teams" is a genuine and verifiable differentiator. No ACCC risk. Stats are defensible. Page is in good shape.

**/solutions/multi-venue**
Near-duplicate of /pub-groups. Same "5 venues, 125 staff" metrics. Same feature set. If both pages survive, this page should differentiate by lens: analytics and group performance comparison for executive operators, not operational onboarding details.

**/solutions/pub-groups**
Weakest and most redundant of the five pages. "70% reduction in average onboarding time" is a modelled claim for a pre-launch product — **reframe to:** "Structured to reduce onboarding time for new starters across all venues." Six feature cards vs four on other pages creates a longer, less focused page. Breadcrumb incorrectly uses "Industries" as parent; all other solution pages use "Solutions."

---

## Resource & Tool Pages

### `/resources`
One resource card for a nav item labelled "Resources" creates an expectation gap. Acceptable pre-launch, but the page should acknowledge that more is coming ("More operator tools coming soon"). Otherwise the nav label implies a library that doesn't exist.

### `/resources/sop-toolkit`
Clean and well-structured. Compliance disclaimer says "Current as at June 2026" — update to July 2026. Three-step path (Resources → SOP Marketing Page → Toolkit) may be one step too many — evaluate whether `/resources` can link directly to `/toolkit`.

### `/toolkit`
Correctly set to `noindex`. Lean and functional. Compliance disclaimer at footer is well-worded. **Keep as-is.**

### `/toolkit/success`
Correctly set to `noindex`. Standard success state. **Keep as-is.**

---

## Trust & Company Pages

### `/roadmap`
Roadmap item ETAs use relative dates ("2 months", "4 months", "6 months") which will silently become inaccurate over time. Convert to absolute quarters ("Q3 2026", "Q4 2026", "H1 2027"). Primary CTA is "Request Venue Access" — appropriate for pre-launch context, but add "Start Free Trial" for visitors ready to commit.

### `/security`
Well-executed. Data transparency, AI transparency, and Stripe/PCI sections are clear and honest. No product accuracy issues. The only downstream change required: update "Mission Control" reference to "Manager Console" once the naming pass is complete (this reference occurs in the Privacy Policy Section 7, not on the /security page itself — but both documents should be updated in the same pass).

### `/about`
Page is thinner than the homepage founder section — counterproductive for a page whose job is to build trust. The homepage includes Mitch's photo, quote, 15+ years credential, and a human backstory. The /about page has four short content blocks and no founder information. Move or duplicate the homepage founder section to /about as the lead section. The four existing blocks (The problem / Our approach / Who we're for / Where we're headed) are solid — they just need the founder layer above them.

### `/contact`
Functional. Response time commitment ("within one business day") is a good trust signal. Minor gap: venue type dropdown lists "Bar / Pub, Restaurant, Hotel F&B, Events venue, Other" but omits "Franchise / Chain" and "Multi-venue Group" despite both being promoted as primary solution verticals.

---

## Legal Pages — Compliance Check

### `/privacy` — Last updated: 3 July 2026
Current. Covers required Australian Privacy Principles (APPs). Data retention schedule, third-party disclosures, and Google Analytics ID disclosure are all present.
**One update required:** Section 7 references "Mission Control" as the manager analytics dashboard name. Update to "Manager Console" in the naming standardisation pass.

### `/terms` — Last updated: 26 April 2026
Three months old as of July 2026. Content is standard for a SaaS platform. Review if material platform changes (new features, billing model changes, tier additions) have occurred since April — if so, update the document and its date.

### `/cookies` — Last updated: 3 July 2026
**CRITICAL — Domain typo:** Opening paragraph references "our platform at servebyexample.com." Domain is servebyexample.co. Correct immediately.
Content is otherwise complete — essential cookies, analytics cookies (Google Analytics), opt-out mechanisms, and session management are all documented.

### `/demo/complaint-master`
Well-executed standalone training experience. Scoring, model responses, and the email capture flow are all appropriate. **One gap:** No path from `/demo` to this sub-page. The main demo page does not reference Complaint Master. Add a discovery card or link on `/demo` — this tool is strong enough to be a distinct conversion entry point.

---

## Technical Cleanup — Codebase-Wide Sweep

This section defines a one-time technical pass to be run after all copy and structural changes are approved. It is not a marketing change — it is a housekeeping task targeting code quality and compliance accuracy.

### Sweep 1 — HTML entity leaks

Several source files contain raw HTML entities in JSX strings: `&rsquo;`, `&amp;`, `&quot;`, `&mdash;`, `&ndash;`, `&ldquo;`, `&rdquo;`, `&hellip;`, `&middot;`. In JSX, these render correctly in some contexts but are fragile in others and represent a code quality issue. The full codebase sweep should:

- Replace `&rsquo;` → `'` (or the JSX entity `&rsquo;` is fine inside `dangerouslySetInnerHTML`, but not inside JSX text nodes)
- Replace `&amp;` → `&` or `&amp;` consistently per context
- Replace `&quot;` → `"` in JSX attributes
- Replace typographic entity codes (`&ldquo;`, `&rdquo;`, `&lsquo;`, `&rsquo;`) with their Unicode equivalents (`"`, `"`, `'`, `'`) for maintainability

Run: `grep -rn "&rsquo;\|&amp;\|&quot;\|&mdash;\|&ldquo;\|&rdquo;\|&lsquo;\|&hellip;\|&middot;" app/ components/ --include="*.tsx"`

### Sweep 2 — Stale compliance date strings

Search for hardcoded date strings in compliance-sensitive copy and update:

- `"June 2026"` in `/app/resources/sop-toolkit/page.tsx` and `/app/toolkit/page.tsx` → `"July 2026"`
- `"servebyexample.com"` in `/app/cookies/page.tsx` → `"servebyexample.co"`
- Review `/app/terms/page.tsx` (last updated 26 April 2026) — verify if material changes since April warrant a new date

Run: `grep -rn "June 2026\|servebyexample\.com\b" app/ --include="*.tsx"`

### Sweep 3 — Manager Console / Mission Control replacement

After the naming decision is approved, run a targeted replacement sweep:

- Search scope: All `.tsx` files in `app/` and `components/`
- Replace: All occurrences of `"Manager Mission Control"`, `"Mission Control"` (as a product name, not as a section header phrase like "your venue's mission control"), and `"mission control"` used as a proper noun
- Replace with: `"Manager Console"` (capitalised), `"manager console"` (lowercase contextually)
- Verify Privacy Policy Section 7 is updated in the same pass

Run: `grep -rn "Mission Control\|mission control" app/ components/ --include="*.tsx" -i`

### Sweep 4 — Guarantee text unification

Search for and replace the 7-day guarantee copy on `/demo`:

- File: `/app/demo/page.tsx`
- Find: `"If your staff doesn't complete their first live scenario within 7 days, you pay $0"`
- Replace with the 14-Day Performance Guarantee language consistent with the homepage

### Sweep 5 — Pricing URL normalisation

Search for all `/membership` references in marketing-facing files and update to `/pricing`:

Run: `grep -rn '"/membership"\|href.*membership' app/ components/ --include="*.tsx"`

Evaluate each occurrence: if it is a pricing CTA link, update to `/pricing`. If it is a route reference inside a redirect or middleware, leave as-is.

---

## Priority Implementation Queue — Revised

All items are organised into three Critical subtiers before High and Medium. Do not begin High-tier work until all Critical items are approved and deployed.

---

### Critical — Legal & ACCC Compliance

| # | Page | Section | Issue | Action |
|---|------|---------|-------|--------|
| C1 | `/cookies` | Opening paragraph | Domain stated as "servebyexample.com" in a legal document | Correct to "servebyexample.co" |
| C2 | `/solutions/franchise-systems` | Metrics strip | "200+ staff onboarded across 12 locations in 30 days" — modelled claim for pre-launch product; ACCC risk | Reframe: "Built to onboard groups of 200+ staff across 12+ locations from Day 1." Remove time claim. |
| C3 | `/solutions/fine-dining` | Metrics strip | "22% average upsell revenue lift within 8 weeks" — modelled, pre-launch; inconsistent with claims on other pages | Reframe: "Built to improve upsell performance across cocktail and premium service training." |
| C4 | `/solutions/pub-groups` | Metrics strip | "70% reduction in average onboarding time" — modelled, pre-launch | Reframe: "Structured to reduce onboarding time for new starters across all venues." |

---

### Critical — Product Architecture & Factual Accuracy

| # | Page | Section | Issue | Action |
|---|------|---------|-------|--------|
| C5 | `/` | "Three Systems, One Hub" section | Two systems exist; Cocktail Library is a feature, not a system | Rename to "Two Systems, One Platform." Remove Cocktail Library card. Keep Staff Dashboard + Manager Console cards with screenshots. Delete the duplicate "Built for Two Different Roles" section below. |
| C6 | `/platform` | "Three Systems, One Hub" section | Same error as homepage | Same fix as C5 |
| C7 | All pages | Manager system name | Site uses "Mission Control" / "Manager Mission Control" throughout; correct name is "Manager Console" | Run codebase sweep (Sweep 3 above). Update all marketing pages, Privacy Policy Section 7, and the /how-it-works console section label. |

---

### Critical — Conversion Dead-Ends

| # | Page | Section | Issue | Action |
|---|------|---------|-------|--------|
| C8 | Nav + all pages | Pricing URL | Nav → `/pricing`; CTAs → `/membership`; non-AU nav click → `/restricted` dead-end | Establish `/pricing` as the canonical URL. Update all `/membership` CTA links to `/pricing`. Review geo-block logic to ensure the nav link does not dead-end for the intended AU audience. |
| C9 | `/demo` | Post-demo guarantee | "7-Day Guarantee" conflicts with homepage 14-Day Performance Guarantee | Replace with 14-Day Performance Guarantee language throughout. Also update homepage FAQ answer that references completion rates with a source attribution. |
| C10 | `/` + all pages | Tier naming | "Venue Pro / Boutique" and "Group / Commercial" dual-name format | Use single clean tier names: **Boutique** (15 seats) and **Commercial** (35 seats) everywhere. |

---

### High

| # | Page | Section | Issue | Action |
|---|------|---------|-------|--------|
| H1 | `/` | Hero CTA | Primary CTA is "View Memberships →" not "Start Free Trial" | Change to "Start Free Trial" → `/login?intent=trial&tier=boutique` |
| H2 | `/for-venues` | Comparison table | Invented feature names inconsistent with rest of site | Replace all branded jargon names with plain-language descriptions matching other pages |
| H3 | `/for-venues` | Comparison table | Fourth column labelled "Franchise" — homepage calls it "Enterprise" | Align: pick "Enterprise" or "Franchise" and use consistently on /for-venues and homepage pricing preview |
| H4 | `/for-venues` | Page structure | Comparison table belongs on pricing page, not the operator landing page | Move full comparison to `/pricing`. Replace with simpler "What's included" summary on /for-venues. |
| H5 | `/solutions/pub-groups` | Full page | ~80% content overlap with /multi-venue | Retire one page, or differentiate: pub-groups → operational onboarding focus; multi-venue → analytics and executive reporting focus |
| H6 | `/demo` | CTA | "Create free account" instead of "Start Free Trial" | Correct CTA text and label |
| H7 | `/about` | Full page | Thinner than homepage founder section — loses trust rather than building it | Add founder section (photo, quote, 15-year credential) as the lead section above the existing four content blocks |
| H8 | `/demo` | Solution vertical links | All five links point to geo-blocked pages for non-AU visitors | Remove row or conditionalize on geo-detection |
| H9 | All pages | ROI / Revenue Impact Calculator name | Component renders "Revenue Impact Calculator" eyebrow; pages call it "ROI Calculator" in headings and metadata — three different labels for one tool | Pick one name. Recommend "ROI Calculator" (shorter, search-friendly). Update component eyebrow label and `/roi` metadata to match. |

---

### Medium

| # | Page | Section | Issue | Action |
|---|------|---------|-------|--------|
| M1 | `/how-it-works` | Step / stage count | Meta says "three-stage training loop"; page presents 5 steps + 6 pillars | Align: either update meta or consolidate the page's step structure to match the 3-stage Mastery Path model on the homepage |
| M2 | `/how-it-works` | Final CTA | Secondary CTA is "View Pricing" | Change to "Book a 15-Min Call" for mid-funnel buyers |
| M3 | `/roadmap` | All roadmap items | Relative ETAs ("2 months", "4 months") will silently become stale | Convert to absolute quarters: "Q3 2026", "Q4 2026", "H1 2027" |
| M4 | `/roadmap` | CTAs | "Request Venue Access" only — no trial path | Add "Start Free Trial" alongside "Request Venue Access" |
| M5 | `/contact` | Venue type dropdown | Missing "Franchise / Chain" and "Multi-venue Group" options | Add both to the dropdown |
| M6 | `/solutions/fine-dining` | Footer nav | "Bars" and "Restaurants" both link here; page is fine-dining/cocktail-bars scoped | Remove "Restaurants" footer link or broaden page scope |
| M7 | `/solutions/pub-groups` | Breadcrumb | Uses "Industries" as parent — all other solution pages use "Solutions" | Update to "Solutions / Pubs & Multi-Venue Groups" |
| M8 | `/` | Homepage meta | Main meta targets staff; OG description targets operators/GMs | Align both to the primary buyer persona (venue operator/GM) |
| M9 | `/` | Metric strip | "19 Languages Supported" is a feature claim, not a benefit. "Advanced AI Scoring" breaks numeric pattern | Replace with two outcome-framed metrics |
| M10 | `/resources` | Full page | One resource card does not justify a "Resources" nav label | Add "More operator tools coming soon" note, or retitle to "Operator Tools" |
| M11 | `/demo/complaint-master` | Discovery | No path from `/demo` to this sub-page | Add a card or link on `/demo` |
| M12 | `/resources/sop-toolkit` | Compliance disclaimer | "Current as at June 2026" — one month stale | Update to "July 2026" |
| M13 | `/platform` | Final CTAs | "Try the Demo" + "For Venues" — no trial path | Add "Start Free Trial" |
| M14 | `/terms` | Document date | Last updated 26 April 2026 — three months old | Review for material changes; update date if content has changed |
| M15 | `/` | ROI Calculator placement | Component embedded below footer with no section heading — invisible to most visitors | Promote to named homepage section or remove and link to `/roi` |

---

## Technical Cleanup Queue

Run after all copy and structural changes above are approved and merged. These are codebase sweeps, not editorial decisions.

| # | Sweep | Command | Files affected |
|---|-------|---------|---------------|
| T1 | HTML entity audit | `grep -rn "&rsquo;\|&amp;\|&quot;\|&mdash;\|&ldquo;\|&rdquo;\|&lsquo;\|&hellip;\|&middot;" app/ components/ --include="*.tsx"` | Replace with Unicode equivalents in JSX text nodes |
| T2 | Stale date strings | `grep -rn "June 2026\|servebyexample\.com\b" app/ --include="*.tsx"` | Update "June 2026" → "July 2026"; fix domain typo |
| T3 | Manager Console naming | `grep -rn "Mission Control\|mission control" app/ components/ --include="*.tsx" -i` | Replace product-name uses with "Manager Console" |
| T4 | Guarantee copy | Search `/app/demo/page.tsx` for 7-day guarantee string | Replace with 14-Day Performance Guarantee language |
| T5 | Pricing URL | `grep -rn '"/membership"\|href.*membership' app/ components/ --include="*.tsx"` | Update pricing CTA links to `/pricing`; leave routing/redirect references as-is |

---

*End of revised audit. 32 pages reviewed. 10 Critical items, 9 High items, 15 Medium items, 5 Technical sweeps. Execution Checklist is a companion document for the engineering phase.*

---

<!-- Source: docs/HOMEPAGE.md -->

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
