# Phase 5 — Mission Control Execution Brief

Prepared 6 August 2026. Scope: `components/mission-control/`, `app/globals.css`, and the 15 FireShot screenshots of the live "Pub Wild" venue console. This supersedes `Manager-Console-UX-Overhaul-Spec.html` (15 July) — that spec's three headline recommendations (extract `StaffReadinessBoard`, `RevenueAreaChart`, `KpiStrip`) have already shipped, and the file has grown anyway. That's the real finding here: extraction alone didn't hold the line, and one of the three fixed bugs only got fixed in one of the two places it appears.

## 0. Two things to settle before an execution agent touches code

**`ManagerControlCenter.tsx` is 4,025 lines today — 60 lines *past* the 3,965-line baseline the guardrail was written against, despite three components already being pulled out.** The extraction pattern works; it just isn't being enforced as new features land. Section 2 below treats "reduce net lines" as a hard acceptance criterion per extraction, not a nice-to-have.

**The brief text says use `--bg-dark`, `--surface`, `--line`.** `--bg-dark` (`#1B2A2F`) is real, but it's the marketing-site dark-hero token (`app/globals.css:64`), not a console token — the console runs entirely on `--bg` (`#f5f2e9` parchment) and `--surface` (`#fffef9`). If an execution agent takes that literally it will render a navy-charcoal panel into a warm-parchment dashboard. Recommend striking `--bg-dark` from console work unless a specific dark-mode surface is intentionally being introduced — worth a one-line confirmation before build starts rather than discovering it in review.

## 1. Workflow Friction Audit (prioritized)

| # | Friction | Where | Severity | Evidence |
|---|----------|-------|----------|----------|
| 1 | Staff Directory table still shows every manager as a flat green "Ready" pill regardless of 0% progress and unrecorded RSA | `ManagerControlCenter.tsx` Staff Directory table | **High** | Staff.png: Emmet, Heather, Cam all read "● Ready" at 0% progress, "Not started." The Overview page's `StaffReadinessBoard` got the traffic-light fix (Home.png shows correct green/amber split); the Staff Directory table reads status from a different, older code path and never got it. Two implementations of "is this person ready," one correct. |
| 2 | No single-click path to "assign training" — the actual daily task | Global `+Create New` menu | **High** | The dropdown (visible in Staff.png, Assign Staff.png, Teams.png, Roles.png) offers exactly two items: *Add staff*, *Add inventory*. "Assign training" only exists inside a staff member's coaching-profile drawer (User Example.png shows `+ Assign training` there). `QuickActionId` in `manager-types.ts` already defines `assign-training` and `create-program` as first-class actions — they're typed but not wired into the menu that renders them. A manager doing the daily "who's behind, assign them something" loop has to open each staff card individually to find the button. |
| 3 | Wide-viewport layout doesn't reflow — content pins to the left third of the screen | Teams page, likely Overview/Analytics too | **High** | Teams.png was captured at 6598px wide; the actual content occupies roughly the left 2,300px, the remaining ~65% of the screen is blank `--bg`. Root cause confirmed in code: `.mcc-overview-main { flex: 1; min-width: 0; }` — no `max-width` cap, no centered content column. On an ultrawide monitor (increasingly common at bar POS stations) most of the screen is dead space. |
| 4 | Empty states stack across 3+ screens on a first-run venue and read as broken, not "getting started" | Compliance, Analytics, Teams | **High** (trust risk) | Compliance.png: "0/4," "No certifications recorded yet" ×2. Analytics.png: "No bar or floor staff yet." Teams.png: two teams at "0 members," dashes for training completion. Same finding as the July spec — still unresolved. For a first-time or infrequent viewer (the target demographic per the brief), four consecutive empty panels reads as "this doesn't work yet," not "add your first staff member." |
| 5 | Compliance's legal-requirement banner has no clear resolution action | Compliance.png, "FSS Onsite Copy Verification" | **Medium** | An unchecked checkbox ("NSW — Physical FSS copy on-site") sits above a red/danger-styled legal-requirement notice with no save button, no confirmation state, and no indication of what happens when checked. A busy manager can't tell if ticking the box does anything, or where that data goes. |
| 6 | Leaderboard podium duplicates the ranked list below it without adding legibility, and the points formula is exposed as raw math | Leaderboards.png | **Medium** | Podium (Emmet/Mitch/Heather, 2nd/1st/3rd) repeats exactly what the numbered list below already shows more clearly. Separately, "Points = Training completion (×1.2) + Avg scenario score (×0.8)" is printed as a caption formula — Cam shows "0% / 13 pts," which is mathematically consistent but illegible to a manager not doing the arithmetic in their head. Flagged in the July spec as a hover-dependency issue; still present, and now compounded by an unexplained formula. |
| 7 | Role Training Matrix + Permission Matrix are two separate dense tables covering overlapping ground | Roles & Permissions | **Medium** | 5-role × 3-training-category matrix immediately above a 5-capability × 3-role dot matrix. Both are "accurate but not scannable in a 2-second glance," per the July audit — still true, no visual change since. |
| 8 | `--mcc-*` token system is still fully parallel to the documented `:root` tokens | `app/globals.css:13319-13360`, 198 usages in `ManagerControlCenter.tsx` | **High (architecture)** | This isn't a leftover — it's a second, actively-used 20-token palette (`--mcc-canvas`, `--mcc-forest-900`, `--mcc-good`, `--mcc-bad`, etc.) scoped to `.mcc-overview-shell`, distinct in both name and hex value from `--status-good` / `--green` / `--surface`. The July spec called this out as a drift risk; it has since grown into the primary system the newest UI (readiness board, KPI strip) is actually built on. `scripts/lint-css-tokens.mjs` presumably doesn't know about `--mcc-*` as a sanctioned namespace — worth confirming it isn't silently failing or silently exempting this block. |
| 9 | Settings still lives at the bottom of the sidebar | All screenshots with sidebar visible | **Low** | Not wrong, just noting the July spec's "gear icon in top bar" recommendation was never actioned and shouldn't be treated as still-pending unless there's a reason to revisit it now. |

## 2. Component Extraction Roadmap

Target: `ManagerControlCenter.tsx` under **3,200 lines** after this phase — not just "don't grow," actually shrink, since the current trajectory (3,965 → 4,025 despite three extractions) shows extraction without a shrink target doesn't hold.

**`components/mission-control/StaffDirectoryTable.tsx`**
Extract the Staff Directory table + mobile card view. This is the fix for Friction #1: it must call the *same* `rsaStatus()` / `readinessPill()` helpers from `compliance/helpers.ts` that `StaffReadinessBoard.tsx` already uses, rendering the identical traffic-light dot/chip, not a separately-coded status pill. One status renderer, two call sites — not two renderers that can drift again next quarter.

**`components/mission-control/QuickActionMenu.tsx`**
Extract the `+Create New` dropdown. Wire in the two unused `QuickActionId` values (`assign-training`, `create-program`) that already exist in the type but aren't rendered. This is the fix for Friction #2 — cheapest high-impact item in this whole brief, since the type-level plumbing is already done.

**`components/mission-control/TeamsPerformancePanel.tsx`**
Extract Team Performance cards + team comparison bars. While extracting, wrap the panel (and ideally `mcc-overview-main` itself) in a `max-width: 1440px; margin: 0 auto;` content column — this is the fix for Friction #3 and should apply at the shell level so Analytics and Overview inherit it too, not just Teams.

**`components/mission-control/RolesPermissionsMatrix.tsx`**
Extract Role Training Matrix + Permission Matrix together, since they're visually and logically paired. Addressing Friction #7 (density) is a Section 3 concern, not required for the extraction itself — but don't extract as-is and call it done; see acceptance criteria below.

**`components/mission-control/LeaderboardBoard.tsx`**
Extract Leaderboards. Recommend *removing* the podium visualization rather than porting it — the ranked list already carries rank, name, role, percentage, and points more legibly. If the podium is a stated brand/marketing requirement (screenshot-bait for sales demos), keep it but stop it duplicating the list one-for-one — collapse the "2nd/1st/3rd" labels into the podium and drop the redundant percentage that's repeated in the list.

**Compliance panels** — `components/mission-control/compliance/` already exists as a directory; confirm `CertificationRegistry` and `FSSVerification` are already separate files (not inline in the parent) before writing new ones. If they're already extracted, this phase's compliance work is UI-only (Section 3), not a new extraction target.

All five components above are pure presentational, consistent with the existing three — they accept already-computed props from `ManagerControlCenter.tsx`, no new data-fetching, no new API routes.

**CSS token consolidation (not a component, but blocks everything above):** migrate the `--mcc-*` block (`app/globals.css:13319-13360`) onto the documented `--status-*` / `--green` / `--surface` set. Values are close enough (`--mcc-good: #5C8C4F` vs. `--status-good: var(--green)` / `#1f4e37`) that this is a controlled rename, not a redesign — but do it *before* the five extractions above, since all of them will otherwise inherit whichever token system their source JSX currently references, re-planting the drift this phase is meant to close.

## 3. UI/UX Upgrade & Acceptance Criteria

### Staff Directory (`StaffDirectoryTable.tsx`)
- Status pill reflects graded state (green / amber / red), matching `StaffReadinessBoard`'s existing logic — not a binary "Ready" regardless of progress.
  - **AC:** A staff member at 0% training with unrecorded RSA renders an amber or red chip, never green, on both Overview and Staff Directory, using one shared component.
- Replace bare `—` for unset RSA/training with an explicit "Not verified" amber chip.
  - **AC:** No cell in the Staff Directory table renders a lone em-dash for a compliance-relevant field.

### Global Quick Actions (`QuickActionMenu.tsx`)
- Add "Assign training" and "Create program" to the `+Create New` menu.
  - **AC:** All four `QuickActionId` values are reachable from the top-bar menu in one click, from any Mission Control screen.

### Teams / wide-viewport layout
- Content column caps at a sane max-width and centers, instead of stretching full-bleed.
  - **AC:** At 2560px+ viewport width, no panel's content sits more than ~1,500px from either edge with the remainder as dead whitespace; verify visually at 1920px, 2560px, and 3440px.

### Empty states (Compliance, Analytics, Teams)
- Replace passive "No X recorded yet" text with an actionable first-run card: what this panel will show, plus the specific button to populate it (mirrors the "+ Add staff" CTA already used correctly on Analytics' "No bar or floor staff yet" panel — extend that pattern to Compliance and Teams, which currently just state absence with no CTA).
  - **AC:** Every empty state includes one primary CTA button, not text alone. Zero fabricated numbers in any empty state (ACCC compliance — ties to the "zero fake analytics" guardrail already in force).

### Compliance — FSS verification interaction
- Give the checkbox a visible saved/confirmed state and remove ambiguity about what checking it does.
  - **AC:** Checking "NSW — Physical FSS copy on-site" persists, shows a timestamp/confirmation, and the red legal-requirement banner either clears or explicitly states it remains a standing reminder — one or the other, not silent.

### Leaderboards
- Either drop the podium or make it additive, not duplicative, versus the ranked list.
  - **AC:** No data point (rank, name, percentage) appears identically in both the podium and the list without added context in at least one of the two.
- Points formula gets a one-line plain-English gloss near the number, not just the caption math.
  - **AC:** A user can tell why "0% training" produced "13 pts" without doing arithmetic — e.g., "13 pts from scenario score" inline.

### Roles & Permissions
- Table headers and matrix labels meet the 16px body floor / 13px all-caps floor already set as this project's standard (per the July audit, still unmet here).
  - **AC:** No data-bearing table cell renders under 16px; all-caps labels render at 13px minimum.
- Collapse the two matrices into a single scannable surface where content overlaps (e.g., a role's training requirement and its dashboard access are both "what can/must this role do" — consider one grouped card per role instead of two separate full-width tables).
  - **AC:** A manager can answer "what does a Supervisor have access to and what training do they need" without cross-referencing two separate tables.

## 4. Verification before handoff

Once implemented: re-screenshot Home, Staff, Teams, Compliance, Leaderboards, and Roles & Permissions at 1440px and 2560px; confirm `ManagerControlCenter.tsx` line count via `wc -l`; run `scripts/lint-css-tokens.mjs` and confirm it flags (or explicitly allowlists) any remaining `--mcc-*` reference; grep the final diff for `#[0-9a-f]{6}` to confirm no new inline hex crept in during the rebuild.
