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
