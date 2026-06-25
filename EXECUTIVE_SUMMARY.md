# Serve By Example — Executive Summary

## Product Vision

Bars, restaurants, and hotel groups have no scalable way to train staff consistently. Onboarding is verbal. Compliance is untracked. Managers have no visibility into who knows what — until something goes wrong on the floor.

Serve By Example replaces paper manuals and inconsistent on-floor training with a structured, mobile-first digital learning system. Staff train at their own pace on their phone. Managers see exactly who is ready to serve.

---

## Two Audiences

### Staff
Bartenders, floor staff, and hospitality employees work through a self-paced mastery path covering 40 training modules across Bartending, Sales, and Management. Training happens on mobile, between shifts, in under 10 minutes a session.

### Managers
Venue operators and team leaders get Mission Control — a real-time dashboard showing team mastery, compliance status, AI-generated coaching, multi-venue roster management, and training program configuration.

---

## The Learning Engine

**Onboarding diagnostic** — New staff complete a short diagnostic on signup that assesses current knowledge and surfaces personalised module recommendations.

**3-stage mastery path per module:**

1. **Learn** — Staff consume module content (text, AI explanation). No scoring.
2. **Verify** — Rapid-fire True/False quiz. Pass threshold: 4 of 5 consecutive correct. Binary outcome — Mastered or retry.
3. **Perform** — AI Arena: GPT-4o-mini evaluates a live roleplay scenario tied to the module. Contributes to service, sales, and product scores.

**40 modules** across three categories:
- Bartending — beer, wine, cocktails, coffee, glassware, bar back operations
- Sales — upselling, VIP service, complaint handling, phone reservations
- Management — RSA compliance, food safety, conflict resolution, open/close procedures

**Interactive Challenges** (launched May 2026) — 5 tap-based mini-game formats available to all staff regardless of subscription tier:
- Sequence Sort — build a round in the correct order
- Fill the Blank — reconstruct a recipe
- Match Pair — cocktail to glassware
- Spot the Error — identify the wrong ingredient
- Multiple Choice — guest complaint de-escalation

**Mastery is binary.** A staff member is either Mastered or Not Mastered for a given module. No partial credit. No level-grinding. Pass the quiz, move on.

---

## Manager Mission Control

| Feature | Detail |
|---------|--------|
| Team mastery grid | Per-staff mastery view across all 40 modules |
| Compliance tracking | RSA and Food Safety module completion at a glance |
| AI coaching | GPT-4o-mini-powered coaching messages for underperforming staff |
| Training programs | Managers configure and assign structured training programs per venue |
| Multi-venue management | Venue_multi tier supports up to 5 venues, 125 staff |
| Venue code join | Staff self-join a venue via a 4-digit code; access is granted immediately |
| Inventory linking | Venue-specific inventory and menu linked to module content |
| Staff roster panel | Dedicated panel for roster management, invite dispatch, and membership control |

---

## Subscription Tiers

| Tier | Module Access | Staff Cap | Management |
|------|--------------|-----------|-----------|
| Free | None | — | — |
| Pro | All 40 modules | 1 | — |
| Venue Single | All 40 modules | 25 | Single venue |
| Venue Multi | All 40 modules | 125 (5 venues) | Multi-venue |

Staff invited to a venue via venue code receive sponsored access equivalent to Pro — paid for by the venue, not the individual.

Interactive Challenges, the dashboard home, personal progress, and settings are available to all users on every tier at no cost.

Stripe checkout supports promotion codes for discounts at the point of purchase.

---

## Current State (June 2026)

- Live at [servebyexample.co](https://servebyexample.co)
- 40 training modules deployed across all tiers
- Interactive Challenges (5 formats) launched May 2026
- Mission Control live for venue managers with mastery grid, AI coaching, and training programs
- Onboarding diagnostic live — new users receive personalised module recommendations on signup
- 38-cocktail reference library available to all staff
- 101 Knowledge Base (quick-reference hospitality knowledge) available to all staff
- SOP Toolkit — free downloadable resource for venue operators; available at `/resources/sop-toolkit` and acts as a lead magnet into the platform
- Language switching — multi-language support via translation API
- Stripe billing integrated — monthly and annual pricing, promotion code support, instant access on checkout
- Geo-blocking active for restricted regions

---

## Technology

Production-grade and security-hardened:

- **Next.js 15** (App Router) on **Cloudflare Pages** via OpenNext — global edge delivery
- **Supabase** — Postgres with row-level security; every data access respects auth boundaries
- **OpenAI GPT-4o-mini** — scenario evaluation, manager coaching, language translation
- **Stripe** — subscription billing with webhook-driven state machine confirming access provisioning
- Server-side answer validation — quiz scores are validated on the server, not client-trusted
- Rate limiting on all public-facing API routes
- Session displacement — only one active session per staff member per purchase
- Geo-blocking — access restricted by region where required

---

## Key Differentiators

1. **Mobile-first, tap-based** — designed for phones, not desktops
2. **Real content, not placeholders** — all 40 modules contain actual hospitality training content
3. **Binary mastery model** — clear pass/fail with no ambiguity about readiness
4. **AI Arena** — live roleplay evaluation, not just multiple choice
5. **Manager visibility** — team-level compliance and mastery tracking in real time
6. **No paper** — the entire training system runs in a browser, no installs, no printing
