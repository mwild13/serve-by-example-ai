# Design Plugin Customization Report
## Serve By Example — Planned Changes

This report outlines every change planned for the design plugin before anything is touched. Review and confirm, then the changes will be applied.

---

## What the Design Plugin Does

The plugin has 7 skills:

| Skill | What it does |
|-------|-------------|
| **Design Critique** | Structured feedback on usability, hierarchy, and consistency |
| **Design System** | Audit, document, or extend component libraries and tokens |
| **Design Handoff** | Generate developer specs from a design |
| **UX Copy** | Write or review microcopy, CTAs, error messages, empty states |
| **Accessibility Review** | WCAG 2.1 AA audit for color, keyboard, and screen reader compliance |
| **User Research** | Plan and conduct interviews, surveys, usability tests |
| **Research Synthesis** | Turn raw research data into themes and recommendations |

Currently, all skills are generic — they know nothing about Serve By Example's design system, audiences, or product context. The changes below embed that knowledge so you get relevant, specific output instead of generic advice.

---

## Planned Changes

### 1. Design System Skill

**Why it needs updating:** The generic skill talks about abstract design tokens. Serve By Example has a fully defined token system in `app/globals.css` that the skill should reference by name.

**What will be added:**

- The full CSS variable set: backgrounds (`--bg`, `--surface`), brand colors (`--green`, `--gold`), text (`--text`, `--text-soft`, `--text-muted`), borders (`--line`), radius (`--radius-sm` through `--radius-xl`), and shadows (`--shadow-sm` through `--shadow-xl`)
- Font rules: headings use `var(--font-fraunces)`, body uses `var(--font-manrope)` — no other font stacks
- **Hard constraint**: No Tailwind utility classes — all styling must use CSS variables via inline `style={{}}` or class names from `globals.css`
- **Hard constraint**: No emoji — SVG icons or text labels only
- A note that `ManagerControlCenter.tsx` (~3,965 lines) should not be extended — new manager features go in `components/mission-control/`

---

### 2. Design Handoff Skill

**Why it needs updating:** Handoff specs would currently output hex values and Tailwind class names — both wrong for this codebase.

**What will be added:**

- All color references must use CSS variables (e.g. `var(--green)`, not `#1f4e37`)
- No Tailwind — specs should reference inline `style={{}}` props or `globals.css` class names
- Font stack: `var(--font-fraunces)` for headings, `var(--font-manrope)` for body
- Component architecture note: server components fetch and pass data as props; client components handle interaction — specs should flag which pattern applies
- Mobile-first context: the staff dashboard has a mobile bottom nav (Home, Modules, Scenarios, AI Arena, Me)

---

### 3. Accessibility Review Skill

**Why it needs updating:** WCAG contrast checks need to know the actual color palette to be useful.

**What will be added:**

- Primary foreground: `--text` (#172f22) — dark forest green
- Primary background: `--bg` (#f5f2e9) warm parchment, `--surface` (#fffef9)
- Brand green: `--green` (#1f4e37), `--green-mid` (#2a6848)
- Gold accent: `--gold` (#a9812a), `--gold-warm` (#c49a2f)
- Soft text: `--text-soft` (#496155), `--text-muted` (#7a9185)
- Known risk area: muted text (`--text-muted` on `--bg`) may be borderline on contrast — flag for review
- Touch target note: staff-facing UI is mobile-first; tap targets must meet WCAG 2.5.5 (44×44px minimum)

---

### 4. UX Copy Skill

**Why it needs updating:** Copy guidance needs to reflect the product's two distinct audiences, its tone, and its hard constraints.

**What will be added:**

**Audience 1 — Staff (bartenders, floor staff, hospitality employees):**
- Motivational, clear, direct
- Familiar with hospitality terminology
- Primarily mobile users
- Key product terms: Pre-Shift Home, Rapid Fire, AI Arena, Challenges, 101 Knowledge Base, Cocktail Library, Stage 4

**Audience 2 — Managers:**
- Professional, data-focused
- Managing teams across one or more venues
- Key product terms: Mission Control, Coaching Drawer, Staff Roster, Venue Code, Snapshot

**Shared copy rules:**
- No emoji — text labels or SVG icons only
- Premium gating copy: free users see locked states for Modules, Stage 4, AI Arena, Cocktail Library, 101 Knowledge Base — copy should be encouraging, not punitive
- "Join via venue code" is the onboarding path for staff added by a manager

---

### 5. Design Critique Skill

**Why it needs updating:** Critique needs to know the product's visual identity and the two distinct UI contexts it operates in.

**What will be added:**

- **Staff UI** (`DashboardShell.tsx`): mobile-first, learning-focused, streak/badge-driven motivation, bottom nav
- **Manager UI** (`ManagerControlCenter.tsx`): high-density analytics console, real-time team data, multi-venue views
- Visual identity: warm parchment backgrounds, forest green CTAs, gold accents, serif headings (Fraunces), clean body (Manrope)
- Critique should flag any Tailwind usage or hardcoded hex values as violations
- No emoji anywhere in UI

---

### 6. User Research Skill

**Why it needs updating:** Research planning should be grounded in who the actual users are.

**What will be added:**

**Primary user segments:**
- **Staff** — bartenders, floor staff, hospitality workers; time-poor, mobile-first, motivated by gamification (streaks, badges, leaderboards); pain point is inconsistent on-floor training
- **Managers / Venue operators** — bar/restaurant/hotel managers; motivated by compliance tracking, staff visibility, reducing onboarding time; pain point is no scalable training system

**Product context for research:**
- 3-stage mastery path: Quiz (Rapid Fire) → Descriptor → AI Roleplay (Arena)
- 40 modules across Bartending, Sales, and Management
- Key behaviors to study: module completion rates, Arena engagement, challenge replay, manager adoption of coaching tools

---

### 7. Research Synthesis Skill

**Why it needs updating:** Synthesis should route insights to the right product area.

**What will be added:**

- Segment findings by audience (staff vs. manager) — insights apply very differently
- Map themes to product areas: Learning Engine (staff), Mission Control (managers), Billing/Onboarding (both)
- Known feedback sources: venue operator sales calls, staff usability sessions, in-app behavior data

---

## What Will NOT Change

- Skill names, file names, and directory names (unchanged)
- How connector tools (Figma, Notion, Linear, etc.) work — the plugin remains tool-agnostic
- The WCAG framework used in accessibility reviews (still WCAG 2.1 AA)
- The general skill trigger descriptions

---

## Next Step

Confirm and the changes will be applied, then packaged as an installable `.plugin` file.
