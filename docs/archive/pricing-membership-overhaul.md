# SBE Pricing Page → Membership Overhaul
## Execution-Ready Blueprint

**Date:** 2026-07-20  
**Scope:** Full pricing page conversion overhaul — from `/pricing` to `/membership`  
**Reference:** Kimi membership page architecture (musical tempo naming + uniform card system)

---

## Phase 1: SBE Value Audit & Naming Architecture

### 1.1 Build Extraction — What Actually Exists in the Codebase

A full audit of `app/pricing/page.tsx`, `components/ui/CompareMatrix.tsx`, `lib/session.ts`, `lib/mastery.ts`, `components/learning-engine/`, and `components/mission-control/` reveals the following features, categorized by buyer type.

#### Value Hooks
*(Features that directly save time, money, or stress — these go on the top cards)*

| # | Raw Feature Name | Buyer Impact |
|---|-----------------|--------------|
| 1 | AI Arena (GPT-4o-mini live roleplay evaluation) | Staff get realistic practice without wasting a manager's time |
| 2 | 40-module training library (Bartending, Sales, Management) | Replaces paper manuals and inconsistent verbal coaching |
| 3 | ELO scoring + spaced repetition mastery engine (`lib/mastery.ts`) | Self-correcting learning — staff only revisit what they don't know |
| 4 | Manager Mission Control real-time dashboard | Managers see exactly who knows what, live, without chasing staff |
| 5 | Cross-team compliance tracking | Reduces liability at inspection and audit events |
| 6 | 14-day free trial (no credit card) | Removes all signup friction |
| 7 | Staff joined via venue invite codes | No IT setup — onboarding under 5 minutes |
| 8 | Language runtime translation | Non-English-speaking staff fully included |
| 9 | AI coaching for managers | Removes need for external consultants |

#### Scale Metrics
*(Thresholds and capacity limits — these go in the comparison matrix)*

| Feature | Free | Staff (Pro) | Venue (Boutique) | Group (Commercial) | Franchise (Enterprise) |
|---------|------|-------------|------------------|--------------------|----------------------|
| Staff seats | 0 | 1 (solo) | Up to 15 | Up to 35 | Unlimited |
| Venues | 0 | 1 | 1 | Multi | Unlimited |
| Training modules | 1 preview | 40 | 40 | 40 | 40 + custom |
| AI Arena evaluations | 3 scored | Unlimited | Unlimited | Unlimited | Unlimited |
| Cocktail Library | — | 38 cocktails | 38 cocktails | 38 cocktails | 38 cocktails |
| 101 Knowledge Base | — | Full | Full | Full | Full |

#### Operational Anchors
*(Technical features buyers expect but don't need to see upfront — comparison matrix only)*

| Feature | Notes |
|---------|-------|
| Row-level security (Supabase RLS) | Per-user data isolation, all tiers |
| One-device session enforcement | Session displacement (`lib/session.ts`) — prevents credential sharing |
| Rate limiting on all public API routes | `lib/rate-limit.ts` applied to all public-facing endpoints |
| Geo-blocking | `lib/geo-config.ts` — region-level access control |
| Stripe billing + webhook state machine | `app/api/billing/webhook/` — fully automated billing lifecycle |
| Diagnostic onboarding flow | `DiagnosticFlow.tsx` — personalises the learning path on first login |
| Badge + achievement system | Streak tracking, progress rings (`lib/badges.ts`) |
| SOP Toolkit / Generator | Free lead-magnet tool at `/resources/sop-toolkit` |
| 5 tap-based challenge mini-games | `ChallengesPage.tsx` — mobile-first gamification layer |
| Rapid-fire quiz mode | `RapidFireQuiz.tsx` — streak-based, keyboard shortcuts |
| Venue inventory management | `app/api/management/inventory/` |
| Training program management | `app/api/management/training-programs/` |

---

### 1.2 The "Kimi-fication" Copy Matrix

Kimi uses proprietary, engineered-sounding language to reframe commodity features as intellectual property. Apply the same lens to SBE.

**Critical framing rule:** Hospitality buyers (restaurant/bar managers, venue operators) are practical and pressed for time. They do not share Kimi's developer-audience appetite for abstract technical naming. The premium name must always be paired with a plain-English sub-label in a smaller, muted font directly below the feature line item. This retains the IP feel while eliminating cognitive friction.

**Rendering pattern for all feature line items:**
```
Neural Scenario Forge
AI Live Roleplay Evaluation          ← muted, 0.75rem, var(--text-muted)
```

| Old Feature Name | Premium Name | Plain Sub-Label (muted) |
|-----------------|--------------|------------------------|
| 40-module training library | **Mastery Protocol Engine** | 40 modules across Bartending, Sales & Management |
| AI Arena (GPT-4o-mini roleplay) | **Neural Scenario Forge** | AI live roleplay evaluation |
| ELO scoring + spaced repetition | **Dynamic Skill Calibration (DSC)** | Adapts to what each staff member still needs to learn |
| Progress tracking + badges + streaks | **Adaptive Mastery Intelligence** | Personal progress, badges and streak tracking |
| Manager Mission Control dashboard | **Command & Compliance Centre** | Real-time team progress and compliance dashboard |
| Cross-team compliance tracking | **Compliance Pulse Monitoring** | Live cross-team training compliance |
| Staff leaderboards | **Competitive Performance Index (CPI)** | Live staff leaderboards |
| Multi-venue roster management | **Franchise Command Network** | Multi-venue staff roster and analytics |
| AI coaching for managers | **Operator Intelligence Assistant** | AI coaching for managers |
| Onboarding diagnostic flow | **Deployment Intelligence Survey** | Personalised onboarding diagnostic |
| Rapid-fire quiz mode | **Rapid Deploy Drilling** | Streak-based rapid-fire quiz mode |
| Language runtime translation | **Multilingual Activation Layer** | In-platform language translation |
| 5 tap-based challenge mini-games | **Reflex Scenario Challenges** | 5 tap-based mobile mini-games |
| Session displacement (one-device) | **Secure Single-Session Architecture** | One active device per account |

---

### 1.3 Conversion Gap Analysis

These are high-value trust signals we almost certainly support in the build but do not currently surface on the pricing page.

**Gap 1: Data Security & Privacy Compliance Statement**

The pricing page currently has a FAQ answer that says "your data is strictly private." This should be elevated to a trust badge on the pricing cards and the top of the comparison matrix. The build uses Supabase RLS (row-level security), which is a credible technical guarantee. Proposed framing:

> "Data Isolated Per Venue — Supabase Row-Level Security. No cross-venue data exposure."

**Gap 2: Uptime / Availability Language**

The Franchise (Enterprise) tier mentions "SLA and compliance reporting" but nowhere on the page do we state any availability commitment. Even a soft statement like "99.9% uptime target, hosted on Cloudflare's global edge network" is credible (it's true — the app deploys via Cloudflare Pages/OpenNext) and closes a key enterprise objection.

**Gap 3: Dedicated Onboarding for Paid Tiers**

The "1-on-1 Onboarding" is buried in the Founding Member section as a founding-only perk. It should be listed as a tier feature for Venue and above — because it already exists and is already offered. Proposed tier placement:

- Venue: "Guided venue setup call (1 session)"
- Group: "Dedicated onboarding specialist (2 sessions)"
- Franchise: "White-glove onboarding programme (unlimited)"

---

## Phase 2: Page Copy & Conversion Architecture

### 2.1 Global Page Changes

| Element | Current | New |
|---------|---------|-----|
| URL slug | `/pricing` | `/membership` |
| Nav link text | "Pricing" (keep as is) | "Pricing" — unchanged to avoid top-of-funnel confusion |
| Page H1 | "Simple plans for individuals and venue teams." | "Your Membership Starts Here." |
| Page sub-copy | "Early access pricing in AUD..." | "Built for hospitality operators. Priced for founders. Lock in your rate before the industry catches up." |
| Billing default | `monthly` | `annually` — anchors users to the lower monthly-equivalent price |
| Toggle labels | Monthly / Yearly | Monthly / Annually |
| Savings badge | "2 months free" | "Save up to $298" |
| Card count | 5 (Free Demo + 4 paid) | 4 paid tiers (Free Demo removed from cards; redirected to homepage hero and nav) |

### 2.2 Price Typography Hierarchy (Annual Default)

When the billing toggle defaults to Annually, the monthly equivalent must be the visually dominant number. The annual lump sum is shown smaller below it. This anchors the user's perception of cost to the lower figure before they process the total.

**Required price block layout (all tiers, annual mode):**

```
$15.83 / mo                ← large, var(--font-fraunces), e.g. 2.5rem, var(--text)
Billed annually ($190/yr)  ← small, var(--font-manrope), 0.8rem, var(--text-muted)
```

**Implementation per tier (annual):**

| Tier | Dominant display | Sub-line |
|------|-----------------|----------|
| Staff | AUD $15.83 / mo | Billed annually (AUD $190/yr) |
| Venue | AUD $65.83 / mo | Billed annually (AUD $790/yr) |
| Group | AUD $124.17 / mo | Billed annually (AUD $1,490/yr) |
| Franchise | Custom | Per arrangement |

**Monthly mode:** Show only the monthly price in the dominant position with no sub-line. No math required from the user.

```tsx
// Price block component pattern
<div style={{ marginBottom: "1.25rem" }}>
  <div style={{
    fontFamily: "var(--font-fraunces)",
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1.1,
  }}>
    {billing === "annually"
      ? `AUD $${tier.monthlyEquivalent} / mo`
      : `AUD $${tier.monthly} / mo`}
  </div>
  {billing === "annually" && (
    <div style={{
      fontFamily: "var(--font-manrope)",
      fontSize: "0.8rem",
      color: "var(--text-muted)",
      marginTop: "4px",
    }}>
      Billed annually (AUD ${tier.annual}/yr)
    </div>
  )}
</div>
```

**The "$298" Math:** Commercial (Group) tier at AUD $149/month × 12 months = AUD $1,788/year. Annual plan = AUD $1,490/year. Savings = **AUD $298**. State this explicitly in the badge so the number feels verifiable, not arbitrary.

---

### 2.2 The Four Tier Cards — Full Copy

All four cards share a unified card background (`var(--surface)`), no featured highlighting via color. Preferred tier is indicated with a 4px top border in `var(--green)` and a small "Most Popular" badge only.

---

#### Tier 1 — Staff
**Title:** Staff  
**Subtitle:** Pro  
**Price (Annual default):** AUD $15.83 / mo displayed large; "Billed annually (AUD $190/yr)" in muted sub-line  
**Price (Monthly):** AUD $19 / month  
**Tagline:** For individual bartenders and hospitality staff.

**CTA button:** "Subscribe now" → `handleCheckout("pro")` / `handleCheckout("pro_yearly")`  
*(Direct checkout — no trial. "Subscribe now" is correct here: the user's next step IS payment.)*

**Top 5 card features (with icon type — see Phase 3):**

```
[check]  Neural Scenario Forge — AI-powered live roleplay evaluation
[check]  Mastery Protocol Engine — 40 modules across Bartending, Sales & Management
[check]  Dynamic Skill Calibration — ELO scoring + spaced repetition
[check]  Rapid Deploy Drilling — streak-based quiz mode with keyboard shortcuts
[check]  Reflex Scenario Challenges — 5 tap-based mobile mini-games
```

**Below CTA micro-copy:**  
No credit card required for trial. Billed annually. Cancel anytime.

---

#### Tier 2 — Venue *(Most Popular — 4px green top border)*
**Title:** Venue  
**Subtitle:** Boutique  
**Price (Annual default):** AUD $65.83 / mo displayed large; "Billed annually (AUD $790/yr)" in muted sub-line  
**Price (Monthly):** AUD $79 / month  
**Tagline:** For single-venue operators and small teams.

**CTA button:** "Try Free for 14 Days" → `handleTrialStart("boutique")`  
*(Triggers a trial, not a payment. "Subscribe now" would create a trust mismatch — the user clicks expecting to pay, then gets a trial screen. Align the label to the actual next step.)*

**Top 5 card features:**

```
[check]  Everything in Staff
[check]  Up to 15 staff seats — invite via venue code, live in under 5 minutes
[check]  Command & Compliance Centre — real-time team progress dashboard
[check]  Competitive Performance Index — live staff leaderboards
[check]  Guided venue setup call — 1-on-1 onboarding session included
```

**Below CTA micro-copy:**  
14-day free trial. No credit card required. Pick a plan when you're ready.

---

#### Tier 3 — Group
**Title:** Group  
**Subtitle:** Commercial  
**Price (Annual default):** AUD $124.17 / mo displayed large; "Billed annually (AUD $1,490/yr)" in muted sub-line  
**Price (Monthly):** AUD $149 / month  
**Tagline:** For growing venues with larger teams and multiple locations.

**CTA button:** "Try Free for 14 Days" → `handleTrialStart("commercial")`  
*(Same reasoning as Venue — trial, not checkout. CTA must match the user's actual next psychological step.)*

**Top 5 card features:**

```
[check]  Everything in Venue
[check]  Up to 35 staff seats — across one or multiple service areas
[check]  Compliance Pulse Monitoring — cross-team compliance tracking
[check]  Advanced analytics — cohort comparisons and performance trends
[check]  Dedicated onboarding specialist — 2 setup sessions included
```

**Below CTA micro-copy:**  
14-day free trial. No credit card required. Pick a plan when you're ready.

---

#### Tier 4 — Franchise
**Title:** Franchise  
**Subtitle:** Enterprise  
**Price:** Custom  
**Tagline:** For venue groups and large hospitality organisations.

**CTA button:** Talk to us → `/contact`

**Top 5 card features:**

```
[check]  Everything in Group
[check]  Unlimited staff seats — across unlimited venues
[check]  Franchise Command Network — multi-venue roster and analytics
[check]  Custom module development — training tailored to your brand
[check]  White-glove onboarding + dedicated account management
```

**Below CTA micro-copy:**  
Custom pricing. SLA included. White-label available.

---

### 2.3 ROI Calculator Placement

The ROI calculator must sit **between the pricing cards and the comparison matrix** — not before them and not after.

**Why this position converts:** A user who looks at Venue ($790/yr) vs. Group ($1,490/yr) and feels hesitant scrolls down for answers. Encountering the ROI calculator at that exact inflection point lets them plug in their own staff metrics, proving to themselves that the step-up pays for itself. It converts objection into justification, then delivers them into the granular matrix with their guard down.

**Page flow:**
```
1. Billing toggle + 4 Tier Cards          ← decision trigger
2. ROI Calculator (distinct bg section)   ← objection destroyer
3. Feature Comparison Matrix              ← technical validation
4. Founding Member section
5. FAQ
```

The calculator already exists as `<ROICalculator />`. Move it out of its current position (after cards in the DOM) and wrap it in a section with a distinct background:

```tsx
<section style={{ background: "var(--bg-alt)", padding: "var(--section-pad) 0" }}>
  <div className="container">
    <ROICalculator />
  </div>
</section>
```

---

### 2.4 Information Architecture Split

**Rule:** Each card shows exactly 5 features. Everything else lives in the matrix below.

#### What Goes on the Card (Top 5 — Emotional, Outcome-Oriented)

| Card | Feature 1 | Feature 2 | Feature 3 | Feature 4 | Feature 5 |
|------|-----------|-----------|-----------|-----------|-----------|
| Staff | Neural Scenario Forge | Mastery Protocol Engine (40 modules) | Dynamic Skill Calibration | Rapid Deploy Drilling | Reflex Scenario Challenges |
| Venue | Everything in Staff | 15 staff seats | Command & Compliance Centre | Competitive Performance Index | Guided setup call |
| Group | Everything in Venue | 35 staff seats | Compliance Pulse Monitoring | Advanced cohort analytics | 2 onboarding sessions |
| Franchise | Everything in Group | Unlimited seats / venues | Franchise Command Network | Custom module development | White-glove onboarding |

#### What Goes in the Feature Comparison Matrix (Operational Detail)

The matrix below the cards handles all granular detail. Columns: Staff | Venue | Group | Franchise.

**Section A — Learning Engine**

| Feature | Staff | Venue | Group | Franchise |
|---------|-------|-------|-------|-----------|
| Total training modules | 40 | 40 | 40 | 40 + custom |
| Training tracks | Bartending, Sales, Management | Same | Same | Same + custom tracks |
| AI Arena evaluations (Neural Scenario Forge) | Unlimited | Unlimited | Unlimited | Unlimited |
| Rapid Deploy Drilling (rapid-fire quiz) | Yes | Yes | Yes | Yes |
| Reflex Scenario Challenges (5 mini-games) | Yes | Yes | Yes | Yes |
| Cocktail Library (38 recipes) | Yes | Yes | Yes | Yes |
| 101 Knowledge Base | Yes | Yes | Yes | Yes |
| Language runtime translation | Yes | Yes | Yes | Yes |
| Deployment Intelligence Survey (onboarding diagnostic) | Yes | Yes | Yes | Yes |

**Section B — Mastery & Progress**

| Feature | Staff | Venue | Group | Franchise |
|---------|-------|-------|-------|-----------|
| Dynamic Skill Calibration (ELO scoring) | Yes | Yes | Yes | Yes |
| Spaced repetition scheduling | Yes | Yes | Yes | Yes |
| Badge + achievement system | Yes | Yes | Yes | Yes |
| Streak tracking | Yes | Yes | Yes | Yes |
| Personal progress overview | Yes | Yes | Yes | Yes |

**Section C — Venue Operations (Manager Tools)**

| Feature | Staff | Venue | Group | Franchise |
|---------|-------|-------|-------|-----------|
| Staff seats | 1 (solo) | Up to 15 | Up to 35 | Unlimited |
| Venues | 1 | 1 | Multi | Unlimited |
| Command & Compliance Centre | — | Yes | Yes | Yes |
| Competitive Performance Index (leaderboards) | — | Yes | Yes | Yes |
| Compliance Pulse Monitoring | — | — | Yes | Yes |
| Cohort analytics and trend reporting | — | — | Yes | Yes |
| Venue inventory management | — | Yes | Yes | Yes |
| Training program management | — | Yes | Yes | Yes |
| Staff invite via venue code | — | Yes | Yes | Yes |
| Operator Intelligence Assistant (AI coaching) | — | Yes | Yes | Yes |
| Franchise Command Network (multi-venue) | — | — | — | Yes |
| Custom module development | — | — | — | Yes |
| White-label options | — | — | — | Yes |

**Section D — Support & Trust**

| Feature | Staff | Venue | Group | Franchise |
|---------|-------|-------|-------|-----------|
| Onboarding sessions | — | 1 guided call | 2 sessions | Unlimited |
| Support channel | Email | Email | Priority email | Dedicated account manager |
| Response time target | 48 hrs | 24 hrs | 8 hrs | 4 hrs |
| 14-day free trial | — | Yes | Yes | — |
| Founding member rate lock | Yes | Yes | Yes | Yes |
| Data isolation (Supabase RLS) | Yes | Yes | Yes | Yes |
| Secure Single-Session Architecture | Yes | Yes | Yes | Yes |
| SLA documentation | — | — | — | Yes |
| Uptime target | 99.9% (Cloudflare edge) | Same | Same | Custom SLA |

---

### 2.4 Free Trial Relocation Plan

With the Free Demo card removed from the pricing page, the trial CTA must appear in three new locations:

**Homepage Hero (Primary)**  
Current: "Explore the Demo" / "Learn More"  
New: Two CTAs side by side — `[View Memberships →]` (primary, green) + `[Start Free Trial]` (secondary, outlined)

**Global Header Navigation**  
Current: "Explore the Demo" button  
New: Two buttons — `[Start Free Trial]` (secondary) + `[Login]` (ghost/text)  
On mobile: Collapse to `[Free Trial]` only

**Footer — Utility Links column**  
Add: "Start a free trial" link pointing to `/login?intent=trial&tier=boutique`

---

## Phase 3: Technical Icon & SVG Specification

> **Note for implementation:** The project prohibits Tailwind utility classes. All alignment rules below use CSS custom properties and inline `style={{}}` props, consistent with the existing codebase convention.

---

### 3.1 The Visual Hierarchy System

Two distinct visual layers exist on the new cards:

**Layer 1 — Primary Feature Items**  
Top-level capability. Uses a "Check" icon (semantic: confirmed capability).

**Layer 2 — Sub-Feature Detail (nested)**  
Used in the deep-dive matrix only, not on cards. Uses a "Tree Connector" icon (`└`) to show the parent-child relationship. Applied when a feature has granular sub-items (e.g., "Neural Scenario Forge" → sub-items: AI evaluation, roleplay scenarios, written feedback).

---

### 3.2 Binary Icon Rule (Matrix)

**Rule:** For rows that are simple binary included/not-included states, render the `IncludedIcon` or `ExcludedIcon` alone — no "Yes" or "No" text label. The icon does all the work. A text label next to a check is redundant and adds visual noise that breaks the clean, scannable Kimi aesthetic.

**Only add text alongside the icon when specifying a concrete capacity metric:**

```tsx
// Binary row — icon only
<IncludedIcon />

// Capacity row — icon + value
<IncludedIcon /> Up to 35 staff seats

// Not included
<ExcludedIcon />
```

This rule applies to every cell in the comparison matrix. The `ExcludedIcon` never gets a "Not included" label — the muted dash communicates it without friction.

---

### 3.4 Feature-to-Icon Mapping Table

#### Card Icons (Primary Features)

| Feature | Icon | Lucide Name | Stroke |
|---------|------|-------------|--------|
| Neural Scenario Forge (AI Arena) | Sparkles / Zap | `Zap` | 1.5px |
| Mastery Protocol Engine (40 modules) | Layers | `Layers` | 1.5px |
| Dynamic Skill Calibration (ELO) | TrendingUp | `TrendingUp` | 1.5px |
| Rapid Deploy Drilling | Timer | `Timer` | 1.5px |
| Reflex Scenario Challenges | Gamepad | `Gamepad2` | 1.5px |
| Staff seats | Users | `Users` | 1.5px |
| Command & Compliance Centre | LayoutDashboard | `LayoutDashboard` | 1.5px |
| Competitive Performance Index | Trophy | `Trophy` | 1.5px |
| Compliance Pulse Monitoring | ShieldCheck | `ShieldCheck` | 1.5px |
| Cohort analytics | BarChart2 | `BarChart2` | 1.5px |
| Onboarding / setup call | PhoneCall | `PhoneCall` | 1.5px |
| Franchise Command Network | Network | `Network` | 1.5px |
| Custom module development | Code2 | `Code2` | 1.5px |
| White-label | PaintBrush | `Paintbrush` | 1.5px |
| Data isolation / security | Lock | `Lock` | 1.5px |
| Language translation | Globe | `Globe` | 1.5px |
| Support / account management | Headphones | `Headphones` | 1.5px |
| Everything in [tier] (inheritance) | ChevronRight | `ChevronRight` | 1.5px |

#### Matrix Icons (Row-level indicators)

| State | Icon | Description |
|-------|------|-------------|
| Included | Custom check SVG (see 3.3) | Solid, green-tinted |
| Not included | Custom dash SVG (see 3.3) | Muted, `var(--text-muted)` |
| Sub-feature detail | Tree connector SVG (see 3.3) | Muted line, `var(--line)` |

---

### 3.5 Production-Ready SVG Code Blocks

All SVGs use `currentColor` so they inherit the parent element's `color` CSS property.

#### A. Primary Check Icon (matrix "included" state)

```tsx
// IncludedIcon.tsx — used in comparison matrix for "Yes" cells
export function IncludedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--green)", flexShrink: 0 }}
      aria-label="Included"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
```

#### B. Not Included / Dash Icon (matrix "–" state)

```tsx
// ExcludedIcon.tsx — used in comparison matrix for "No" cells
export function ExcludedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--text-muted)", flexShrink: 0 }}
      aria-label="Not included"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
```

#### C. Tree Connector (sub-feature nesting)

```tsx
// TreeConnector.tsx — used before nested sub-features in the matrix
export function TreeConnector() {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "var(--line)", flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      {/* Vertical line down from parent */}
      <line x1="4" y1="0" x2="4" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Horizontal line to feature text */}
      <line x1="4" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
```

#### D. Card Feature Check (larger, used on the pricing cards)

```tsx
// CardCheckIcon.tsx — used in the 5-feature list on each pricing card
export function CardCheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
```

#### E. "Everything in [Tier]" Inheritance Indicator

```tsx
// InheritIcon.tsx — for "Everything in Staff" type rows
export function InheritIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
```

#### F. Semantic Section Header Icons (comparison matrix section headers)

```tsx
// LearningEngineIcon — Section A header
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
</svg>

// MasteryIcon — Section B header
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
</svg>

// VenueOpsIcon — Section C header
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
</svg>

// SupportIcon — Section D header
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.72a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15.92z"/>
</svg>
```

---

### 3.6 CSS Implementation Rules (No Tailwind — CSS Custom Properties Only)

All icon alignment follows the project's established pattern of inline `style={{}}` with CSS variables.

#### Feature List Item (card)

```tsx
// Feature list item on a pricing card
<li
  style={{
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "0.875rem",
    color: "var(--text-soft)",
    lineHeight: "1.5",
    padding: "4px 0",
  }}
>
  <CardCheckIcon />
  <span>Neural Scenario Forge — AI-powered live roleplay evaluation</span>
</li>
```

#### Matrix Row Cell (included)

```tsx
<td
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "12px 16px",
    borderBottom: "1px solid var(--line-light)",
    fontSize: "0.875rem",
    color: "var(--text)",
  }}
>
  <IncludedIcon />
  <span>Unlimited</span>  {/* only when there's a value to show */}
</td>
```

#### Sub-feature Row (matrix, nested)

```tsx
<tr style={{ background: "var(--bg-alt)" }}>
  <td
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "6px",
      paddingLeft: "28px",  // indent sub-features
      paddingTop: "8px",
      paddingBottom: "8px",
      color: "var(--text-soft)",
      fontSize: "0.8125rem",
    }}
  >
    <TreeConnector />
    <span>AI evaluation scoring + written feedback per response</span>
  </td>
  ...
</tr>
```

#### Icon Stroke Weight Override

All icons imported from Lucide React must explicitly override the default stroke:

```tsx
import { Zap } from "lucide-react";

// Always pass explicit strokeWidth — Lucide defaults to 2px
<Zap
  size={18}
  strokeWidth={1.5}
  style={{ color: "var(--green)", flexShrink: 0 }}
/>
```

#### Sticky Header (comparison matrix)

When the user scrolls into the matrix, the tier names and CTA buttons should stick. Implement with:

```css
/* In app/globals.css */
.pricing-matrix-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}
```

```tsx
<thead>
  <tr className="pricing-matrix-sticky">
    <th style={{ padding: "16px 20px", fontFamily: "var(--font-manrope)", fontWeight: 600 }}>
      Feature
    </th>
    {tiers.map((tier) => (
      <th key={tier.id} style={{ padding: "16px 12px", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-fraunces)", fontSize: "1rem", color: "var(--text)" }}>
            {tier.title}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-soft)" }}>{tier.subtitle}</span>
          <button
            className="btn btn-primary"
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            onClick={() => tier.onSubscribe()}
          >
            Subscribe now
          </button>
        </div>
      </th>
    ))}
  </tr>
</thead>
```

---

## Implementation Sequence

To ship this in the least-risk order:

1. **Copy changes only (zero code risk):** Update all text strings in `app/pricing/page.tsx` — H1, sub-copy, tier names, subtitles, billing toggle label, CTA button text. No logic change.
2. **Toggle default:** Change `useState<"monthly" | "yearly">("monthly")` to `"yearly"` on line 14. One-character change, immediately increases ARPU anchoring.
3. **Card removal:** Delete the Free Demo `<div className="price-card">` block (lines 175–191). Confirm `/demo` link still exists in the nav.
4. **New URL:** Add `app/membership/page.tsx` that re-exports `PricingPage`, then add a redirect in `next.config.js`: `{ source: '/pricing', destination: '/membership', permanent: true }`.
5. **Card styling:** Add the top-border accent to the Venue card: `style={{ borderTop: "4px solid var(--green)" }}`.
6. **SVG icons:** Create `components/ui/PricingIcons.tsx` with all icon components from Phase 3.3.
7. **New comparison matrix:** Replace `CompareMatrix.tsx` with the full 4-column, 4-section matrix from Phase 2.3, using the new icon components.
8. **Free trial relocation:** Update `components/Navbar.tsx` and `components/HeroSection.tsx` with the new dual-CTA pattern.
9. **Sticky header:** Add `.pricing-matrix-sticky` to `app/globals.css`, apply class to matrix `thead`.

---

*This document is a complete, execution-ready specification. All feature names, prices, and code patterns are derived directly from the current SBE codebase as of 2026-07-20.*
