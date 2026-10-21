# SBE Marketing Fix — Execution Checklist
**Companion to:** `SBE-Marketing-Audit-July2026.md`
**Execute in order.** Do not advance to the next phase until all tasks in the current phase are complete and verified.

---

## Phase 1 — Legal & Compliance (Critical)
*These items are deploy-blocking. No other phase should be pushed while these are open.*

### 1.1 — Fix domain typo in cookies policy [C1]
**File:** `app/cookies/page.tsx`
**Find:** `servebyexample.com` (as a domain reference, not a URL)
**Replace with:** `servebyexample.co`
**Verify:** Read the file after change. Confirm no other occurrences of `.com` where `.co` is intended.
**Confirm:** `grep -n "servebyexample.com" app/cookies/page.tsx` returns zero results.

---

### 1.2 — Reframe pre-launch operational metrics on three solutions pages [C2, C3, C4]

**File 1:** `app/solutions/franchise-systems/page.tsx`
**Find:** The metric stating "200+ staff onboarded across 12 locations in under 30 days" (or equivalent stat referencing this number + time claim)
**Replace with:** "Built to onboard groups of 200+ staff across 12+ locations from Day 1"
**Remove:** Any surrounding disclaimer that references "based on modelling" or "projected outcomes"

**File 2:** `app/solutions/fine-dining/page.tsx`
**Find:** The metric stating "22% average upsell revenue lift within 8 weeks" (or equivalent)
**Replace with:** "Built to drive upsell performance across cocktail and premium service training"
**Remove:** Any surrounding modelling disclaimer

**File 3:** `app/solutions/pub-groups/page.tsx`
**Find:** The metric stating "70% reduction in average onboarding time" (or equivalent)
**Replace with:** "Structured to reduce onboarding time for new starters across all venues"
**Remove:** Any surrounding modelling disclaimer

**Verify each:** Read the updated metric strip section. Confirm outcome-claim framing with no numerical time-to-value projection and no modelling disclaimer.

---

## Phase 2 — Product Architecture (Critical)
*Product naming integrity. Required before any campaign traffic or investor demos.*

### 2.1 — Codebase sweep: replace "Mission Control" with "Manager Console" [C7]

**Run:**
```bash
grep -rn "Mission Control\|mission control" app/ components/ --include="*.tsx" -i
```

**Expected affected locations (non-exhaustive — treat grep output as the authoritative list):**
- `app/how-it-works/page.tsx` — "Consoles" section header and any label saying "Mission Control"
- `app/privacy/page.tsx` — Section 7 manager analytics reference
- `app/management/dashboard/page.tsx` — any display label
- Marketing copy in solutions pages

**For each occurrence:**
- If it is the product name for the manager-facing dashboard → replace with "Manager Console"
- If it is a descriptive phrase like "your venue's command centre" → leave as-is (not a product name)
- If it is "mission-control" as a CSS class name or component folder reference → leave as-is (these are internal identifiers, not copy)

**Verify:**
```bash
grep -rn "Mission Control\|Manager Mission Control" app/ components/ --include="*.tsx" -i
```
Should return zero marketing-copy matches. CSS classes like `.mission-control` and folder names like `components/mission-control/` are exempt.

---

### 2.2 — Fix "Three Systems, One Hub" on homepage [C5]

**File:** `app/page.tsx`
**Section:** The three-card section titled "Three Systems, One Hub"

**Changes:**
1. Rename section heading from "Three Systems, One Hub" to "Two Systems, One Platform"
2. Remove the Cocktail & Spec Library card entirely
3. Keep the Staff Dashboard card and Manager Console card
4. Move the product screenshots from the "Built for Two Different Roles" section below into these two cards (or make them visible at this position)
5. Delete the "Built for Two Different Roles" section that follows — its content is now covered by the updated two-card section

**Verify:** Page renders with exactly two product cards. No third card. No "Three Systems" text visible anywhere on the homepage.

---

### 2.3 — Fix "Three Systems, One Hub" on /platform [C6]

**File:** `app/platform/page.tsx`
**Section:** Same three-card section structure as homepage

**Changes:**
1. Rename section heading to "Two Systems, One Platform"
2. Remove Cocktail Library card
3. Keep Staff Dashboard and Manager Console cards
4. Correct any column header that reads "Manager Mission Control" to "Manager Console"

**Verify:** No "Three Systems" or "Mission Control" as a product name appears on this page.

---

## Phase 3 — Conversion Dead-Ends (Critical)
*These items are directly costing conversion. Deployable in the same release as Phase 2.*

### 3.1 — Establish /pricing as canonical URL [C8]

**Step A — Audit all /membership CTA references:**
```bash
grep -rn '"/membership"\|href.*membership\|to.*membership' app/ components/ --include="*.tsx"
```

**Step B — Update each CTA link:**
For every result that is a pricing CTA button or anchor → change to `/pricing`
Do NOT change:
- Route definitions in `app/membership/page.tsx` (the re-export itself — leave it as a redirect)
- Any middleware or redirect config referencing `/membership`

**Step C — Verify nav:**
Open `components/Navbar.tsx`. Confirm the "Pricing" nav link points to `/pricing` and not `/membership`.

**Verify:** All pricing CTA buttons in marketing pages use `/pricing`. The `/membership` route still works as a redirect (do not break it) but no marketing page CTA should actively link there.

---

### 3.2 — Unify guarantee copy to 14-Day Performance Guarantee [C9]

**File:** `app/demo/page.tsx`
**Find:** The 7-day guarantee claim ("If your staff doesn't complete their first live scenario within 7 days, you pay $0" or equivalent)
**Replace with:** The 14-Day Performance Guarantee language from the homepage. Use the same exact wording as the homepage guarantee section.

**Cross-check:** Search for any other guarantee references across marketing pages:
```bash
grep -rn "7.day\|seven.day\|7 day" app/ components/ --include="*.tsx" -i
```
Replace any guarantee-context matches with 14-day language.

**Verify:** The homepage and demo page now show identical guarantee framing. No "7 day" or "7-day" text appears in marketing copy.

---

### 3.3 — Standardise tier names to Boutique and Commercial [C10]

**Find all dual-name instances:**
```bash
grep -rn "Venue Pro\|Group / Commercial\|Venue Pro / Boutique" app/ components/ --include="*.tsx"
```

**Replace:**
- "Venue Pro / Boutique" → "Boutique"
- "Group / Commercial" → "Commercial"
- Any other dual-label format → single clean name

**Expected locations:** Homepage pricing preview section, any pricing card component, comparison table headers.

**Verify:** Search returns zero matches for dual-name formats. "Boutique" and "Commercial" appear as the sole tier labels everywhere.

---

## Phase 4 — High Priority Copy & Structure

### 4.1 — Fix homepage hero CTA [H1]
**File:** `app/page.tsx`
**Section:** Hero section
**Find:** Primary CTA with label "View Memberships →"
**Replace with:** "Start Free Trial" linking to `/login?intent=trial&tier=boutique`
**Verify:** Hero renders with "Start Free Trial" as primary CTA.

---

### 4.2 — Replace invented feature names on /for-venues [H2]
**File:** `app/for-venues/page.tsx`
**Section:** Comparison matrix / feature table

Replace all branded jargon feature names with plain-language equivalents:

| Current name | Replace with |
|--------------|-------------|
| Neural Scenario Forge | AI Scenario Training |
| Rapid Deploy Drilling | Rapid-Fire Knowledge Drills |
| Reflex Scenario Challenges | Interactive Challenges |
| Multilingual Activation Layer | 19-Language Staff Support |
| Deployment Intelligence Survey | Training Diagnostic |
| Command & Compliance Centre | Manager Console |
| Competitive Performance Index | Team Performance Leaderboard |
| Compliance Pulse Monitoring | Compliance Tracking |
| Operator Intelligence Assistant | AI Coaching for Managers |
| Franchise Command Network | Multi-Venue Roster Management |

**Verify:** Read the table section. No invented names remain.

---

### 4.3 — Align "Franchise" vs "Enterprise" label [H3]
**Decision required:** Choose one label for the highest-tier operator column.
- If "Franchise" → update the homepage pricing preview to use "Franchise"
- If "Enterprise" → update the /for-venues comparison table to use "Enterprise"

Apply consistently to both files once decided. Do not implement until label decision is confirmed.

---

### 4.4 — Fix /demo primary CTA [H6]
**File:** `app/demo/page.tsx`
**Find:** CTA labelled "Create free account"
**Replace with:** "Start Free Trial"
**Verify:** Demo page post-interaction CTA says "Start Free Trial."

---

### 4.5 — Add founder section to /about [H7]
**File:** `app/about/page.tsx`
**Action:** Add the founder section from the homepage as the lead section above the existing four content blocks (The Problem / Our Approach / Who We're For / Where We're Headed).
**Source content:** Copy the founder content block from `app/page.tsx` (photo, quote, 15+ years credential, personal backstory paragraph). Wrap in appropriate section markup consistent with the about page layout.
**Verify:** `/about` page renders founder section above the four existing content blocks. No duplicate content on homepage.

---

### 4.6 — Remove solution vertical links from /demo for non-AU context [H8]
**File:** `app/demo/page.tsx`
**Find:** The row of vertical solution links at the bottom of the page (Pub Groups, Fine Dining, Hotel F&B, etc.)
**Action:** Either remove entirely, or wrap in a conditional that checks geo and hides for non-AU visitors.
**Verify:** Links row is not visible (or is conditionally hidden) without causing layout breaks.

---

### 4.7 — Standardise ROI / Revenue Impact Calculator naming [H9]
**Decision required:** Pick one name — recommend "ROI Calculator."

If "ROI Calculator" is chosen:
- **File:** `components/ui/ROICalculator.tsx`, line 93 — Change eyebrow from `"Revenue Impact Calculator"` to `"ROI Calculator"`
- **File:** `app/roi/page.tsx` — Confirm h1 and metadata already say "ROI Calculator" (verify with Read)
- **File:** `app/pricing/page.tsx` — Confirm any section label for the embedded calculator says "ROI Calculator"

**Verify:** The component eyebrow, the /roi page heading, and any pricing page label all use the same name.

---

## Phase 5 — Medium Priority

### 5.1 — Align step/stage count on /how-it-works [M1]
**File:** `app/how-it-works/page.tsx`
**Issue:** Metadata says "three-stage training loop"; page body has 5 steps + 6 pillars
**Action:** Either:
  - (a) Update metadata to accurately describe the page structure (5 steps), OR
  - (b) Consolidate the page structure to 3 stages matching the Mastery Path model on the homepage
**Once decided:** Update the meta description accordingly.

---

### 5.2 — Fix /how-it-works final CTA [M2]
**File:** `app/how-it-works/page.tsx`
**Find:** Secondary CTA "View Pricing"
**Replace with:** "Book a 15-Min Call"
**Verify:** Page ends with "Try the Demo" (primary) + "Book a 15-Min Call" (secondary).

---

### 5.3 — Convert /roadmap ETAs to absolute quarters [M3]
**File:** `app/roadmap/page.tsx`
**Find:** All roadmap items using relative time strings ("2 months", "4 months", "6 months", "coming soon")
**Replace with:** Absolute quarter labels ("Q3 2026", "Q4 2026", "H1 2027" — confirm the correct quarters with Mitch before making these changes)

---

### 5.4 — Add "Start Free Trial" CTA to /roadmap [M4]
**File:** `app/roadmap/page.tsx`
**Find:** Page CTA section (currently "Request Venue Access" only)
**Add:** "Start Free Trial" as a secondary CTA alongside "Request Venue Access"

---

### 5.5 — Add missing venue types to /contact dropdown [M5]
**File:** `app/contact/page.tsx`
**Find:** Venue type `<select>` or equivalent dropdown
**Add two options:**
  - "Franchise / Chain"
  - "Multi-venue Group"
**Verify:** Dropdown includes all active solution verticals.

---

### 5.6 — Fix fine-dining footer nav link [M6]
**File:** Footer component or wherever the "Restaurants" footer link is defined (likely `components/Footer.tsx`)
**Find:** Footer nav link "Restaurants" that links to `/solutions/fine-dining`
**Action:** Either remove the "Restaurants" entry, or update the `/solutions/fine-dining` page to explicitly serve both fine dining and restaurant operators (title change + broadened scope)

---

### 5.7 — Fix pub-groups breadcrumb [M7]
**File:** `app/solutions/pub-groups/page.tsx`
**Find:** Breadcrumb parent label "Industries"
**Replace with:** "Solutions"
**Verify:** Breadcrumb reads "Solutions / Pubs & Multi-Venue Groups" (or equivalent).

---

### 5.8 — Update homepage meta to target operator persona [M8]
**File:** `app/page.tsx`
**Find:** Main `<meta name="description">` tag
**Current value (approximate):** "Get your team shift-ready instantly"
**Replace with:** A description targeting the buyer persona (venue operator / GM). E.g.: "Serve by Example helps Australian venues train staff faster, track compliance in real time, and scale onboarding without the manual admin."
**Verify:** Both the main meta description and the OG description target the operator, not the staff user.

---

### 5.9 — Fix homepage metric strip [M9]
**File:** `app/page.tsx`
**Find:** Metric strip containing "19 Languages Supported" and "Advanced AI Scoring"
**Issues:**
  - "19 Languages Supported" is a feature claim, not a benefit outcome
  - "Advanced AI Scoring" breaks the numeric-format pattern of the other three slots
**Replace:** Substitute with two outcome-framed metrics using the same number + outcome format as the other slots. Confirm the replacement metrics with Mitch before implementing.

---

### 5.10 — Add "coming soon" note to /resources [M10]
**File:** `app/resources/page.tsx`
**Find:** The single resource card (SOP toolkit)
**Add below:** A short note — "More operator tools coming soon" — to manage expectation for visitors expecting a full resource library.

---

### 5.11 — Add /demo/complaint-master discovery card [M11]
**File:** `app/demo/page.tsx`
**Find:** A suitable placement in the demo page (before or after the main demo interaction)
**Add:** A card or secondary section promoting the Complaint Master tool with a link to `/demo/complaint-master`. Use consistent card styling with the rest of the demo page.

---

### 5.12 — Update SOP toolkit compliance date [M12]
**File:** `app/resources/sop-toolkit/page.tsx`
**Find:** "Current as at June 2026"
**Replace with:** "Current as at July 2026"

Also check:
```bash
grep -rn "June 2026" app/ --include="*.tsx"
```
Update any other "June 2026" compliance date strings to "July 2026."

---

### 5.13 — Add "Start Free Trial" CTA to /platform [M13]
**File:** `app/platform/page.tsx`
**Find:** Final CTA section (currently "Try the Demo" + "For Venues")
**Add:** "Start Free Trial" as the primary CTA, push "Try the Demo" to secondary.

---

### 5.14 — Review and update /terms date [M14]
**File:** `app/terms/page.tsx`
**Current:** "Last updated: 26 April 2026"
**Action:** Manually review whether any material changes to the platform (billing, tier structure, feature additions, data handling) have occurred since April 2026. If yes, update the document content and its date. If no material changes, leave as-is.

---

### 5.15 — Fix ROI Calculator homepage placement [M15]
**File:** `app/page.tsx`
**Find:** `<ROICalculator />` embedded below the footer area with no section heading
**Action:** Either:
  - (a) Promote to a named homepage section with a heading and intro paragraph before the component, OR
  - (b) Remove from homepage entirely and add a "Calculate your ROI →" link to the homepage CTAs that routes to `/roi`
**Decision required before implementing.** Note that the same component already exists at `/roi` — the homepage placement adds value only if it is visible and contextually motivated.

---

## Phase 6 — Technical Sweeps
*Run after all Phase 1–5 changes are merged. These are automated search-and-replace passes.*

### 6.1 — HTML entity audit [T1]
```bash
grep -rn "&rsquo;\|&amp;\|&quot;\|&mdash;\|&ldquo;\|&rdquo;\|&lsquo;\|&hellip;\|&middot;" app/ components/ --include="*.tsx"
```
For each result: replace HTML entity codes with their Unicode equivalents in JSX text nodes.
- `&rsquo;` → `'`
- `&lsquo;` → `'`
- `&ldquo;` → `"`
- `&rdquo;` → `"`
- `&mdash;` → `—`
- `&ndash;` → `–`
- `&hellip;` → `…`
- `&middot;` → `·`
- `&amp;` in JSX text → `&`
Exception: Inside `dangerouslySetInnerHTML` — entity codes are correct; leave those as-is.

---

### 6.2 — Final stale date sweep [T2]
```bash
grep -rn "June 2026\|servebyexample\.com\b" app/ --include="*.tsx"
```
- "June 2026" → "July 2026" for any compliance or "last updated" strings
- "servebyexample.com" → "servebyexample.co" for any domain references in copy (note: this should already be fixed by 1.1 above; this is a final confirmation pass)

---

### 6.3 — Final Mission Control naming pass [T3]
```bash
grep -rn "Mission Control\|mission control" app/ components/ --include="*.tsx" -i
```
After Phase 2 changes, this should return only:
- CSS class names (`.mission-control`)
- Component folder path strings (`components/mission-control/`)
- Any descriptive phrase where "mission control" is used as a metaphor, not a product name

Any remaining marketing-copy or UI label match must be corrected to "Manager Console."

---

### 6.4 — Final guarantee copy verification [T4]
```bash
grep -rn "7.day\|7 day\|seven day" app/ components/ --include="*.tsx" -i
```
Should return zero marketing-copy matches. If any remain, update to the 14-Day Performance Guarantee.

---

### 6.5 — Final pricing URL verification [T5]
```bash
grep -rn '"/membership"' app/ components/ --include="*.tsx"
```
Should return only the re-export in `app/membership/page.tsx`. Any CTA `href="/membership"` in marketing files must already be replaced with `/pricing` by Phase 3.

---

## Deployment Notes

- **Phase 1 should be deployed independently** as a hotfix PR — domain typo in a legal document is a compliance gap, not a feature change.
- **Phases 2 and 3** can be combined into a single "architecture + conversion" PR.
- **Phases 4 and 5** can be batched into a "copy + structure" PR once the Phase 2/3 release is verified.
- **Phase 6** is a housekeeping PR — low risk, can follow any release window.
- Any items marked "Decision required before implementing" (4.3, 5.1, 5.9, 5.15) must be confirmed before the relevant phase PR is opened.

---

*End of execution checklist. 34 tasks across 6 phases. Cross-reference item codes (C1–C10, H1–H9, M1–M15, T1–T5) with `SBE-Marketing-Audit-July2026.md` for full context.*
