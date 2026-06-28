# SBE Management Console — Australian Compliance & Operational Command Centre

## Context

The audit document prescribes transforming the passive SBE manager console into a real-time Operational Command Centre with: (1) a leaner staff directory, (2) a Shift Readiness Scorecard on the Overview dashboard, (3) a dedicated Compliance tab, and (4) an AI Coaching Queue. This plan maps those requirements to the exact SBE codebase, adapting every reference to Tailwind/Shadcn/lucide-react to SBE's actual patterns (CSS custom properties in `globals.css`, inline `style={{}}`, inline SVGs, no Tailwind).

**Key discoveries from code audit:**
- `compliance` tab already exists in `ManagerControlCenter.tsx` (line 2147) but renders `<EmptyState>` — just needs content
- `venueHealthScore` is already computed in `metrics` (lines 513–575) — just needs surfacing
- `StaffMember.lastActive` is a string (e.g. "3 days ago") — needs parse helper for aging logic
- No compliance fields exist in `StaffMember` or `Venue` types — all RSA/FSS data is synthetic today
- CSS grid uses named classes (`.mcc-lower-grid`, `.mcc-overview-grid`) not Tailwind `col-span` — new widgets must follow this pattern
- `WorkspaceHeader.tsx` accepts an `actions?: ReactNode` slot — Venue Health Score chip goes there at call site, no header changes needed

---

## Phase 1 — Type Extensions + StaffRosterPanel Refactor

**Goal:** Clear layout real estate and establish type safety before building functional features.

### 1a. Add compliance types to `lib/management/types.ts`

Append after `StaffInvitePayload`:

```ts
export type RSAState = 'valid' | 'warning_30d' | 'warning_7d' | 'expired';
export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'NT' | 'ACT';

export interface StaffComplianceRecord {
  staffId: string;
  rsaState: RSAState;
  rsaJurisdiction: AustralianState;
  rsaExpiryDate: string | null;        // ISO date string, null = not recorded
  fssExpiryDate: string | null;         // null = not applicable or not recorded
  fssOnSiteCopy: boolean;
  shiftConfirmed: boolean;              // Ai — operational confirmation
}
```

Add optional compliance fields to `StaffMember` (lines 28–51). All fields must be `?` optional so existing mock payloads and DB hydration are not broken:
```ts
compliance?: StaffComplianceRecord;
lastActiveDays?: number;               // numeric companion to lastActive string
isJunior?: boolean;                    // triggers adult rate alert under MA000119
```

All fields in `StaffComplianceRecord` must also be optional-safe — `shiftConfirmed` defaults to `false` when absent, `rsaExpiryDate`/`fssExpiryDate` default to `null`.

### 1b. Refactor StaffRosterPanel.tsx email column

**File:** `components/mission-control/StaffRosterPanel.tsx`

- **Replace** `<span className="ops-staff-email">{email}</span>` (line 222) with an inline SVG mail icon + CSS tooltip:
  ```tsx
  <div className="ops-email-icon-cell" title={email}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
    </svg>
  </div>
  ```
- Add `.ops-email-icon-cell` to `globals.css`: `cursor: default; color: var(--text-muted); display: flex; align-items: center;`
- **Widen** the Role and Progress column headers proportionally in CSS (remove `ops-staff-email` width allocation)

### 1c. Readiness Pills in StaffRosterPanel

Replace the existing inline status `<span>` (lines 204–210) with a `readinessPill` helper function above the component:

```ts
function readinessPill(member: StaffMember): { label: string; dot: string; bg: string; color: string } {
  if (member.compliance?.rsaState === 'expired') 
    return { label: 'At Risk', dot: '○', bg: '#fff1f2', color: '#b91c1c' };
  if (member.status === 'attention' || (member.compliance?.rsaState === 'warning_7d'))
    return { label: 'Caution', dot: '◐', bg: '#fff7ed', color: '#c2410c' };
  return { label: 'Ready', dot: '●', bg: '#dcfce7', color: '#16a34a' };
}
```

### 1d. Last-Active aging in StaffRosterPanel

Add a parse helper above the component with NaN and empty-string guards:

```ts
function parseLastActiveDays(lastActive: string): number {
  if (!lastActive) return 0;
  const m = lastActive.match(/(\d+)\s*(day|week|month)/);
  if (!m) return 0;
  const n = parseInt(m[1]);
  if (isNaN(n)) return 0;
  if (m[2] === 'week') return n * 7;
  if (m[2] === 'month') return n * 30;
  return n;
}
```

Apply to the "Last active" cell:
```tsx
const days = member.lastActiveDays ?? parseLastActiveDays(member.lastActive);
const lastActiveStyle = days > 30
  ? { color: '#b91c1c', fontWeight: 700 }
  : days > 14 ? { color: '#c2410c' } : {};
<span style={lastActiveStyle}>{member.lastActive}</span>
```

---

## Phase 2 — Venue Health Score in Topbar

**Goal:** Surface the already-computed `venueHealthScore` as a persistent chip in WorkspaceHeader.

**File:** `components/mission-control/ManagerControlCenter.tsx`

At the Overview `<WorkspaceHeader>` call site (around line 1440), add a chip to the `actions` prop:

```tsx
actions={
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div className="ops-health-chip" data-health={
      metrics.venueHealthScore >= 75 ? 'good' : metrics.venueHealthScore >= 50 ? 'warn' : 'critical'
    }>
      Venue Health: {metrics.venueHealthScore}/100
    </div>
    {/* existing quick-action buttons */}
  </div>
}
```

Add `.ops-health-chip` to `globals.css`:
```css
.ops-health-chip { padding: 4px 12px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700; }
.ops-health-chip[data-health="good"]     { background: var(--green-light); color: var(--green); }
.ops-health-chip[data-health="warn"]     { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.ops-health-chip[data-health="critical"] { background: #fff1f2; color: #b91c1c; border: 1px solid #fecdd3; }
```

---

## Phase 3 — Shift Readiness Scorecard (Overview bento)

**Goal:** Add a new bento card to the Overview primary grid showing a real-time Rf score.

**File:** `components/mission-control/ManagerControlCenter.tsx` (Overview section, lines 1515–1589)

### 3a. Rf formula computation

Weights sum exactly to 1.0 (wc=0.50 + wt=0.30 + wa=0.20). Guard against division-by-zero when the roster is empty:

```ts
const WC = 0.50, WT = 0.30, WA = 0.20; // must sum to 1.0

const shiftStaff = venueStaff.slice(0, 8); // first 8 = "tonight's shift" approximation
const rfScore = shiftStaff.length === 0 ? 0 : Math.round(
  (shiftStaff.reduce((sum, s) => {
    const Ci = s.compliance?.rsaState === 'expired' ? 0 : 1;
    const Ti = s.progress / 100;
    const Ai = s.compliance?.shiftConfirmed ? 1 : (s.status === 'on-track' ? 0.8 : 0.4);
    return sum + (WC * Ci + WT * Ti + WA * Ai);
  }, 0) / shiftStaff.length) * 100
);
```

### 3b. Scorecard widget card

Insert a new `<div className="mcc-scorecard-card">` inside `.mcc-overview-grid` (between the chart and the right column).

Each staff row must also flag junior staff serving alcohol — detect this as `role === "Bartender" || role === "Floor"` combined with `isJunior?: boolean` on `StaffMember`. When `isJunior` is true, render a small inline alert next to their name:
- Text: "Junior serving alcohol — verify adult rate (MA000119)"
- Style: `color: #c2410c; font-size: 0.65rem;`

```tsx
<div className="mcc-scorecard-card">
  <div className="mcc-scorecard-header">
    <span>Tonight's Shift Readiness</span>
    <span className="mcc-rf-badge" style={{ 
      background: rfScore >= 75 ? 'var(--green-light)' : rfScore >= 50 ? '#fff7ed' : '#fff1f2',
      color: rfScore >= 75 ? 'var(--green)' : rfScore >= 50 ? '#c2410c' : '#b91c1c'
    }}>{rfScore}%</span>
  </div>
  <table className="ops-staff-table mcc-scorecard-table">
    <thead><tr><th>Staff</th><th>RSA</th><th>Training</th><th>Status</th></tr></thead>
    <tbody>
      {shiftStaff.map(s => {
        const pill = readinessPill(s);
        const isAlcoholRole = s.role === 'Bartender' || s.role === 'Floor';
        return (
          <tr key={s.id}>
            <td>
              <div className="ops-staff-avatar">{s.name[0]}</div> {s.name}
              {s.isJunior && isAlcoholRole && (
                <span style={{ color: '#c2410c', fontSize: '0.65rem', display: 'block' }}>
                  Junior serving alcohol — verify adult rate (MA000119)
                </span>
              )}
            </td>
            <td><span style={{ color: s.compliance?.rsaState === 'expired' ? '#b91c1c' : 'var(--green)' }}>
              {s.compliance?.rsaJurisdiction ?? '—'} RSA
            </span></td>
            <td>{s.progress}%</td>
            <td><span style={{ background: pill.bg, color: pill.color, padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>
              {pill.dot} {pill.label}
            </span></td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
```

Add `.mcc-scorecard-card` and `.mcc-rf-badge` to `globals.css` following existing `.mcc-overview-card` patterns.

Update `.mcc-overview-grid` in `globals.css` to accommodate the scorecard (extend from 2-col to 3-section layout or nest scorecard below chart in left column).

---

## Phase 4 — Compliance Command Centre (tab=compliance)

**Goal:** Replace the `<EmptyState>` at line 2147 with a full compliance hub.

**File:** `components/mission-control/ManagerControlCenter.tsx`

### 4a. Severity escalation helper

Includes the NSW 28-day rule: if expired for more than 28 days in NSW, the staff member must complete the full SITHFAB021 course (not a simple online refresher):

```ts
function complianceStatus(record: StaffComplianceRecord | undefined): { label: string; level: 0|1|2|3; nsw28Day?: boolean } {
  if (!record?.rsaExpiryDate) return { label: 'Not recorded', level: 0 };
  const days = Math.ceil((new Date(record.rsaExpiryDate).getTime() - Date.now()) / 86400000);
  if (days < -28 && record.rsaJurisdiction === 'NSW')
    return { label: 'Full Course Required', level: 3, nsw28Day: true };
  if (days < 0) return { label: 'Expired', level: 3 };
  if (days <= 7) return { label: `${days}d`, level: 2 };
  if (days <= 30) return { label: `${days}d`, level: 1 };
  return { label: `${days}d`, level: 0 };
}
```

In the Certification Registry table, when `nsw28Day` is true, render a distinct row note: "NSW: Full SITHFAB021 course required (expired >28 days)" in crimson below the status pill.

### 4b. Level 2 banner (7-day alert) in Overview

At the top of the overview `<section>`, before the KPI strip, inject:

```tsx
{venueStaff.some(s => complianceStatus(s.compliance).level >= 2) && (
  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#b91c1c', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, fontWeight: 600 }}>
    Compliance alert: one or more staff have certifications expiring within 7 days. Review the Compliance tab immediately.
  </div>
)}
```

### 4c. Compliance tab content

Replace `<EmptyState .../>` at line 2147 with a full render (extracted into a named IIFE block like other sections):

**Three sections:**

1. **Certification Registry table** — columns: Staff | Cert Type | State | Expiry Date | Days Remaining | Status | Actions
   - RSA rows: pull from `s.compliance?.rsaExpiryDate`, state from `s.compliance?.rsaJurisdiction`
   - FSS rows: pull from `s.compliance?.fssExpiryDate`
   - Status cell uses `complianceStatus()` with coloured pills: grey (not recorded), amber (30d), crimson (7d), red border + "Expired" (day 0)
   - "Verify" action button for each row (no-op initially, connects to a future document upload flow)

2. **FSS checklist block** — for each venue: "Physical copy on-site?" toggle (`fssOnSiteCopy` boolean on `StaffComplianceRecord`). If `fssOnSiteCopy` is `false`, render a prominent red alert block (not just a pill):
   ```
   background: #fff1f2; border: 1px solid #fecdd3; border-left: 4px solid #b91c1c;
   ```
   Text: "Legal requirement: A physical copy of the active FSS certificate must be kept on-premises at all times (NSW Food Authority)."

3. **State-specific guidance panel** — static expandable rows per jurisdiction:
   - NSW: 5-year RSA expiry, 28-day re-enrollment rule (SITHFAB021), 5-year FSS, 30-day grace
   - VIC: No expiry, 3-year refresher + sexual harassment module
   - QLD/WA/SA: No formal expiry, recommended refresher every 3–5 years

**Styling:** Follow existing `.ops-staff-table` and `.ops-card` CSS classes. Use `var(--line)` borders, `var(--surface)` backgrounds, severity colors via inline `style={{}}`.

### 4d. Navigation — add Compliance to sidebar

In `NAV_GROUPS` (lines 48–86), move `compliance` from the unlisted Operations cluster into the People group:

```ts
{ id: "staff", ... },
{ id: "teams", ... },
{ id: "roles", ... },
{ id: "compliance", label: "Compliance", icon: "..." },
```

---

## Phase 5 — AI Coaching Queue Panel

**Goal:** Add a coaching queue card to the Overview using existing `venueStaff` performance telemetry.

**File:** `components/mission-control/ManagerControlCenter.tsx` (within `.mcc-lower-grid`, lines 1671–1789)

### 5a. Queue generation

```ts
const coachingQueue = venueStaff
  .filter(s => s.status !== 'on-track' || s.compliance?.rsaState === 'warning_30d')
  .slice(0, 4)
  .map(s => ({
    staff: s,
    reason: s.compliance?.rsaState === 'warning_30d'
      ? `RSA expiring in ${complianceStatus(s.compliance).label} — assign refresher`
      : s.salesScore < 50
      ? `Sales score ${s.salesScore}% — assign upsell module`
      : `Training completion ${s.progress}% — push core modules`,
    moduleTag: s.compliance?.rsaState === 'warning_30d' ? 'RSA Refresher' : 'Core Training',
  }));
```

### 5b. Queue card in lower grid

Replace or extend the "Operational alerts" card with a coaching queue card:

```
| Staff | Recommendation           | Trigger        | Action   |
| Cam   | Upsell Mastery (3 min)   | Sales -12%     | [Assign] |
| Emmet | NSW RSA Refresher        | Expires 14d    | [Assign] |
```

"Assign" button calls `POST /api/management/training-programs` with `{ venueId, staffTarget: s.id, name: moduleTag }`.

---

## Files Modified

| File | Changes |
|---|---|
| `lib/management/types.ts` | Add `StaffComplianceRecord`, `RSAState`, `AustralianState` types; add `compliance?`, `lastActiveDays?`, `isJunior?` to `StaffMember` (all optional) |
| `components/mission-control/StaffRosterPanel.tsx` | Email icon compression, Readiness Pills, Last Active aging |
| `app/globals.css` | New CSS classes: `.ops-email-icon-cell`, `.ops-health-chip`, `.mcc-scorecard-card`, `.mcc-rf-badge`, `.mcc-scorecard-table` |
| `components/mission-control/ManagerControlCenter.tsx` | Venue Health chip in Overview header, Rf scorecard widget, Level 2 severity banner, Compliance tab full content, Coaching queue card, NAV_GROUPS update |

---

## What's Deferred (post-MVP)

- **Real compliance data** — RSA/FSS fields are optional today; a future migration + UI for managers to record certificate dates activates all computed logic
- **Roster scheduling** — shift confirmation (`Ai`) defaults to derived heuristic; a roster integration would supply real shift data
- **PDF/CSV export** — audit-ready export engine deferred; `window.print()` or a server route can be wired later
- **Push notifications** — Level 1 alerts (30-day email) deferred to email/notification system work

---

## Verification

1. `npm run type-check` — zero errors after type additions
2. Run dev server → Overview tab: Venue Health chip visible in header, Scorecard widget renders with Rf score and staff rows, Readiness Pills replace old status badges
3. Staff tab: email column shows icon (hover reveals address), Last Active aging coloring visible for inactive staff
4. Compliance tab: no longer shows EmptyState; registry table renders with compliance fields (initially empty/not-recorded state for all staff)
5. Coaching queue: at least one coaching row visible for any staff with `status !== "on-track"`
