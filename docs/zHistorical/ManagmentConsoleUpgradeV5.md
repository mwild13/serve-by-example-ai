# ManagmentConsoleUpgradeV5
**Serve By Example — Management Console Visual Upgrade Plan**
*Engineering-led. CSS-first. Zero logic changes.*

---

## Pre-Work: What the Audit Actually Found

Before any plan, I need to correct the assumed starting point — because several things in the mandate describe changes that are already partially done.

### What already exists (and doesn't need building from scratch)

| Element | Mandate Assumed | Actual State |
| :--- | :--- | :--- |
| Sidebar background | "Change from light to dark" | Already dark: `background: #0B2B1E` |
| Sidebar text | "Add white text" | Already white with rgba opacity layers |
| Dark sidebar contrast | "Needs building" | Structure is solid — needs polish, not a rebuild |
| `ops-kpi-card` (Coaching Drawer) | "Needs full redesign" | Already clean: label/value grid, `var(--line-light)` border |
| `ops-workspace` background | "Needs to be bright" | Already `#F8F9F5` (clean warm white) |

### What is genuinely broken or inconsistent

1. **Active nav state** uses a background fill (`rgba(255,255,255,0.13)`) with no left border accent — no structural indicator of where you are
2. **`mcc-kpi-card`** (the Overview strip) has inline urgency border colors applied directly in JSX via `borderColor` prop — inconsistent with the CSS system
3. **Workspace padding** is 24px, undershooting the breathing room the console needs at 32px
4. **Tables** (Shift Readiness, Staff Roster, Compliance Registry) have no shared row standard — each is styled ad-hoc with mixed inline colors and background tints
5. **`--bg-warm`** is referenced in `.ops-kpi-card` but is not defined in the canonical design token list in `globals.css`. Needs aliasing to `var(--surface)`.
6. **Nav group labels** are 0.62rem — too small. Hierarchy gets lost.
7. **`ops-nav-group-toggle`** (collapsible group button) has no visual differentiation from items. Chevron is a text character (`▸`), not an icon.

---

## One Question Before Execution Starts

The reference dashboard image shows a **light/neutral sidebar** with icon-only navigation. The written mandate describes a **dark sidebar** (which we already have). These are two different directions.

**My recommendation: stay with the dark sidebar.** Here's why:
- The dark/light split (dark nav rail + bright workspace) is the exact pattern Linear, Vercel, and Asana use — and it creates the strongest visual hierarchy
- Switching to a light sidebar would require changing the text/icon contrast system across the entire sidebar, which is more risk for less return
- The current `#0B2B1E` is distinctly brand-aligned — no generic SaaS product has this warm dark green

The reference image is useful for **layout density and card structure patterns** — not the color system. I'll extract those lessons and apply them to our existing palette.

**You don't need to answer this if you agree with the above. If you want the light sidebar, tell me now before Phase 1 executes.**

---

## Engineering Principles for This Build

1. **CSS-first.** All visual changes target `globals.css` class definitions. No JSX logic changes.
2. **Scoped to `.ops-shell`.** Every rule is namespaced so nothing bleeds into marketing pages.
3. **No inline style removal in ManagerControlCenter.tsx yet.** For urgency border colors and inline spacing in JSX, we move them to classes — not delete them.
4. **One phase at a time, deployed and verified before the next starts.**
5. **Sparklines stay.** The mandate suggests stripping them. As the engineer I'm recommending we keep them — they're the only at-a-glance trend data a shift manager has in the morning. We'll make them cleaner, not remove them.

---

## Phase Summary

| Phase | Scope | Files Changed | Risk |
| :--- | :--- | :--- | :--- |
| 1 | Sidebar polish + active state | `globals.css` only | Very low |
| 2 | KPI card standardization | `globals.css` + `manager-ui.tsx` (minor) | Low |
| 3 | Workspace padding + table rows | `globals.css` only | Very low |
| 4 | Topbar + nav group refinements | `globals.css` only | Very low |
| 5 | Status badge system + polish | `globals.css` only | Very low |

---

## Phase 1 — Sidebar: Active State + Nav Refinements

**Goal:** Turn the active nav item from an opaque background blob into a clean left-border accent. Improve spacing and label legibility.

**Files:** `app/globals.css` only

### What changes

**`.ops-nav-item.active`** — remove background fill, add left border accent. The accent color should be `var(--gold-warm)` (#c49a2f), not white or green. Against the dark `#0B2B1E` sidebar, gold is more legible and brand-distinctive than a green-on-green situation.

```css
/* BEFORE */
.ops-nav-item.active {
  background: rgba(255, 255, 255, 0.13);
  color: #fff;
  font-weight: 600;
}

/* AFTER */
.ops-nav-item.active {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
  font-weight: 600;
  border-left: 3px solid var(--gold-warm);
  padding-left: 7px; /* compensate for border width */
}
```

**`.ops-nav-item`** — tighten padding, increase icon size, softer default opacity:
```css
.ops-nav-item {
  padding: 9px 12px;
  gap: 10px;
  font-size: 0.85rem;
  border-left: 3px solid transparent; /* reserve space so active state doesn't shift layout */
  border-radius: 0 6px 6px 0;
  margin-left: -1px; /* align flush to sidebar edge */
}
```

**`.ops-nav-group-label`** — bring up to legible size:
```css
.ops-nav-group-label {
  font-size: 0.68rem;  /* was 0.62rem */
  letter-spacing: 0.10em;
  padding: 10px 12px 4px;
  color: rgba(255, 255, 255, 0.45);
}
```

**`.ops-nav-group`** — add more breathing room between groups:
```css
.ops-nav-group {
  gap: 2px;
  margin-bottom: 14px; /* was 8px */
}
```

**`.ops-nav-group-toggle`** — style it to match `ops-nav-group-label` visually, not like a nav item:
```css
.ops-nav-group-toggle {
  font-size: 0.68rem;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
  padding: 10px 12px 4px;
  background: none;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
}
```

**`.ops-sidebar-brand`** — give it more vertical separation from the heading:
```css
.ops-sidebar-brand {
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.45); /* slightly more muted — hierarchy */
  margin-bottom: 2px;
}
```

**`.ops-sidebar-top h3`** — upgrade heading weight and size slightly:
```css
.ops-sidebar-top h3 {
  font-size: 1.1rem;
  color: #fff;
  margin: 2px 0 0 0;
}
```

---

## Phase 2 — KPI Card Standardization

**Goal:** Unify `mcc-kpi-card` (Overview strip) and `ops-kpi-card` (Coaching Drawer) into a consistent visual language. Clean rectangles, surface background, uniform typography. Keep sparklines.

**Files:** `app/globals.css` + minor change to `components/mission-control/manager-ui.tsx`

### Two systems to align

**System A: `mcc-kpi-card`** — used in the Overview KPI strip (4 cards)
- Current problem: `borderColor` applied inline via JSX prop, creating red/amber/green left borders
- These urgency colors belong in the status badges (Phase 5), not the card border
- The sparkline should stay but be normalized to a consistent height

**System B: `ops-kpi-card`** — used in Coaching Drawer (4 metrics)
- Current problem: `background: var(--bg-warm)` — this token is undefined in our canonical system
- Needs aliasing to `var(--surface)` and a cleaner border

### CSS changes

```css
/* ── mcc-kpi-card (Overview strip) ─────────────────── */
.mcc-kpi-card {
  background: var(--surface);           /* was: no var, various inline */
  border: 1px solid var(--line);        /* was: var(--line-light), too faint */
  border-radius: var(--radius-md);
  padding: 20px;                        /* was: 16px */
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s ease;
  /* NO border-left — remove urgency coloring from card border */
}

.mcc-kpi-card:hover {
  box-shadow: var(--shadow-md);
}

.mcc-kpi-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-soft);              /* was: var(--mcc-ink-500) */
}

.mcc-kpi-value-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.mcc-kpi-value {
  font-size: clamp(1.5rem, 3vw, 2rem);  /* was: 1.55rem fixed */
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  font-family: var(--font-fraunces);   /* use brand heading font for values */
}

.mcc-kpi-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ── ops-kpi-card (Coaching Drawer) ─────────────────── */
.ops-kpi-card {
  background: var(--surface);           /* was: var(--bg-warm) — undefined */
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 14px;
  display: grid;
  gap: 4px;
}

.ops-kpi-card span {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-muted);
  font-weight: 700;
}

.ops-kpi-card strong {
  font-family: var(--font-fraunces);
  font-size: 1.6rem;
  color: var(--text);                   /* was: var(--green-deep) — too much color */
  line-height: 1;
}
```

### JSX change in `ManagerControlCenter.tsx`

The `MgrKpiCard` component receives a `borderColor` prop that applies inline urgency coloring. We remove the prop from callsites and strip the `borderColor` style from the component's JSX. The urgency signal moves to the `.mcc-kpi-sub` text (already says "at risk" / counts). **One line change per card, four cards total.**

```tsx
// BEFORE (in each MgrKpiCard callsite)
<MgrKpiCard ... borderColor={getUrgencyBorder(metrics.avgScenarioScore)} />

// AFTER
<MgrKpiCard ... />
```

And in the `MgrKpiCard` component definition (line ~181):
```tsx
// BEFORE
function MgrKpiCard({ label, value, sub, data, accent, borderColor }: {...}) {
  return (
    <div className="mcc-kpi-card" style={borderColor ? { borderLeft: `4px solid ${borderColor}` } : undefined}>

// AFTER
function MgrKpiCard({ label, value, sub, data, accent }: {...}) {
  return (
    <div className="mcc-kpi-card">
```

---

## Phase 3 — Workspace Padding + Table Row Standardization

**Goal:** Consistent 32px breathing room across all panels. Uniform table rows with padding and border-only status indicators (no tinted row backgrounds).

**Files:** `app/globals.css` only

### Workspace padding

```css
.ops-workspace {
  padding: 32px;    /* was: 24px */
  gap: 20px;        /* was: 14px */
}
```

Note: The inner sections (`.mcc-overview-main`, `.mcc-kpi-strip`, etc.) use their own internal padding (`padding: "20px 28px 0"`). This is fine — the outer workspace padding creates frame breathing room, inner padding handles section-level spacing.

### Shared table row standard

Add a new reusable class block to the management CSS section:

```css
/* ── Shared management table standard ───────────────────
   Apply .mgmt-table to any table in the console that needs
   the standard row treatment. Does not override header styles. */

.mgmt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.mgmt-table th {
  padding: 10px 16px;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-soft);
  border-bottom: 1px solid var(--line);
  background: var(--bg-alt);
}

.mgmt-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--line-light);
  color: var(--text);
  vertical-align: middle;
}

.mgmt-table tbody tr:last-child td {
  border-bottom: none;
}

.mgmt-table tbody tr:hover {
  background: rgba(31, 78, 55, 0.03);
}

/* NO tinted row backgrounds — state lives in badges only */
```

**Three tables to migrate to `.mgmt-table` in ManagerControlCenter.tsx:**
1. Tonight's Shift Readiness table (`className="ops-staff-table mcc-scorecard-table"`) — add `mgmt-table`
2. Role Training Matrix table (inline `style={{ ... }}`) — replace with `mgmt-table`
3. Permission Matrix table (inline `style={{ ... }}`) — replace with `mgmt-table`

Note: The Compliance Registry table is in `ComplianceHub.tsx` — same treatment, Phase 3 includes it.

---

## Phase 4 — Topbar Refinements

**Goal:** The `ManagementTopbar` is structurally solid. These are visual polish changes only.

**Files:** `app/globals.css` only

### What to tighten

**`.ops-topbar`** — increase height to 56px (currently unspecified, likely 48px), add bottom border:
```css
.ops-topbar {
  height: 56px;
  border-bottom: 1px solid var(--line-light);
  background: var(--surface);
  padding: 0 28px;      /* was: varies */
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 40;
}
```

**`.ops-topbar-search-input`** — give search field a tighter, more refined look:
```css
.ops-topbar-search-input {
  background: var(--bg);
  border: 1px solid var(--line-light);
  border-radius: var(--radius-sm);
  padding: 7px 12px 7px 32px;  /* room for icon */
  font-size: 0.85rem;
  color: var(--text);
  transition: border-color 0.15s;
}

.ops-topbar-search-input:focus {
  border-color: var(--green);
  outline: none;
}
```

**`.ops-create-dropdown-trigger`** — clean up to match design system button style:
```css
.ops-create-dropdown-trigger {
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}

.ops-create-dropdown-trigger:hover {
  background: var(--green-mid);
}
```

---

## Phase 5 — Status Badge System

**Goal:** Create a single shared status badge class family that all tables and roster panels use. Replaces ad-hoc inline styles across the console.

**Files:** `app/globals.css` only

```css
/* ── Management status badge system ─────────────────────
   Three operational states + one blocked state.
   Use on <span> elements only. */

.mgmt-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  line-height: 1;
}

.mgmt-badge-ready {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.mgmt-badge-caution {
  background: rgba(245, 158, 11, 0.1);
  color: #c2410c;
}

.mgmt-badge-risk {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.mgmt-badge-blocked {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fee2e2;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
}
```

These badges replace the inline `style={{ background: ..., color: ..., padding: ..., borderRadius: ... }}` blocks currently scattered across the Shift Readiness table, Staff Roster rows, and the Coaching Drawer readiness pills.

---

## What We Are Not Doing (And Why)

| Suggestion from Mandate / UX Doc | Decision | Reason |
| :--- | :--- | :--- |
| Strip sparklines from KPI cards | **Keep them** | Only at-a-glance trend signal for hospitality managers; removing it loses data |
| Full `DataTable` reusable component | **Defer** | High value but high effort; Phase 3's `.mgmt-table` gets 80% of the benefit with 10% of the risk |
| Decompose ManagerControlCenter.tsx into sections | **Defer** | Right call architecturally, wrong call for this sprint — zero logic risk this way |
| Cmd+K command palette | **Defer** | Real product feature, not a visual polish item; needs its own sprint |
| New chart types (heatmap, donut, timeline) | **Defer** | Needs data to back it, not visual work |
| Horizontal spacing scale tokens | **Add in Phase 5** | Can piggyback on the status badge CSS block with zero risk |

---

## Execution Sequence

```
Phase 1 → verify → Phase 2 → verify → Phase 3 → verify → Phase 4 → Phase 5 → deploy
```

Each phase ends with a browser verification pass. We do not chain phases without checking the last one rendered correctly.

### Verification checklist per phase
- [ ] Sidebar active state shows left border (gold), not just background fill
- [ ] KPI cards on Overview show no left-border urgency colors
- [ ] KPI values use Fraunces heading font
- [ ] Tables have consistent 12/16px cell padding
- [ ] Status pills use `.mgmt-badge` classes (not inline styles)
- [ ] No marketing pages affected (spot-check `/`, `/pricing`, `/demo`)
- [ ] TypeScript build passes (`tsc --noEmit`)

---

## Files Changed Summary

| File | Phase | Type of Change |
| :--- | :--- | :--- |
| `app/globals.css` | 1–5 | CSS class additions and updates |
| `components/mission-control/ManagerControlCenter.tsx` | 2, 3 | Remove `borderColor` prop from 4 `MgrKpiCard` calls; add `mgmt-table` class to 3 tables |
| `components/mission-control/ManagerControlCenter.tsx` | 2 | Remove `borderColor` from `MgrKpiCard` component definition |
| `components/mission-control/compliance/ComplianceHub.tsx` | 3 | Add `mgmt-table` class to Certification Registry table |

**No API routes, state hooks, auth logic, or data binding is touched in any phase.**

---

## Ready to Execute

Phase 1 (Sidebar polish) is the lowest risk and highest visual impact. Say the word and I'll start with the `globals.css` changes for the sidebar active state, nav group labels, and spacing. We can verify it in the browser before moving to Phase 2.
