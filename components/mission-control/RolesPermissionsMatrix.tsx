"use client";

import type { ManagementSnapshot, StaffRole } from "@/lib/management/types";
import { EmptyState } from "@/components/mission-control/manager-ui";

// Extracted from ManagerControlCenter.tsx (Phase 5, Task 2 — component
// extraction roadmap). Combines the Role Training Matrix and Permission
// Matrix into one modular unit, since they're always rendered together and
// cover overlapping ground ("what does this role need / have access to").
// Pure presentational — all role math is derived here from venueStaff.

// ─────────────────────────────────────────────
// Circular compliance ring (moved from ManagerControlCenter.tsx — this was
// its only consumer)
// ─────────────────────────────────────────────
function ComplianceRing({ compliant, total }: { compliant: number; total: number }) {
  if (!total) return <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>–</span>;
  const pct = compliant / total;
  const r = 13, cx = 16, cy = 16;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = compliant === total ? "var(--status-success)" : compliant > 0 ? "var(--status-amber)" : "var(--status-critical)";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <svg width="32" height="32" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--viz-neutral-light)" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span style={{ fontWeight: 700, color, fontSize: "0.82rem" }}>{compliant}/{total}</span>
    </div>
  );
}

const MODULE_REQS: Record<StaffRole, { label: string; required: boolean }[]> = {
  "Bartender":  [{ label: "Bartending", required: true }, { label: "Sales", required: true }, { label: "Management", required: false }],
  "Floor":      [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: false }],
  "Supervisor": [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: true }],
  "Manager":    [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: true }],
  "New Staff":  [{ label: "Bartending", required: false }, { label: "Sales", required: true }, { label: "Management", required: false }],
};

const PERMISSIONS: { label: string; manager: boolean; supervisor: boolean; staff: boolean }[] = [
  { label: "Manager dashboard", manager: true, supervisor: false, staff: false },
  { label: "Staff management", manager: true, supervisor: true, staff: false },
  { label: "Training programs", manager: true, supervisor: true, staff: false },
  { label: "Inventory & menu", manager: true, supervisor: false, staff: false },
  { label: "Reports & analytics", manager: true, supervisor: true, staff: false },
  { label: "Complete training", manager: true, supervisor: true, staff: true },
  { label: "View own progress", manager: true, supervisor: true, staff: true },
];

export interface RolesPermissionsMatrixProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
}

export function RolesPermissionsMatrix({ venueStaff, selectedVenueName }: RolesPermissionsMatrixProps) {
  const roleGroups: StaffRole[] = ["Bartender", "Floor", "Supervisor", "Manager", "New Staff"];
  const roleStats = roleGroups.map((role) => {
    const members = venueStaff.filter((s) => s.role === role);
    const avgProgress = members.length ? Math.round(members.reduce((a, s) => a + s.progress, 0) / members.length) : null;
    const reqs = MODULE_REQS[role].filter((m) => m.required);
    const compliant = members.filter((s) => s.progress >= 80).length;
    return { role, members, avgProgress, reqs, compliant };
  });

  return (
    <section className="ops-grid ops-grid-main">
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ops-card-head">
          <h3>Role training matrix</h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedVenueName}</span>
        </div>
        {venueStaff.length === 0 ? (
          <EmptyState copy="No staff added yet. Role readiness and training compliance will populate here once your team joins." />
        ) : (
          <>
        {/* Role readiness summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
          {roleStats.map((row) => {
            const readiness = row.avgProgress ?? 0;
            const color = readiness >= 70 ? "var(--status-success)" : readiness >= 40 ? "var(--status-amber)" : "var(--text)";
            const bg = readiness >= 70 ? "var(--status-success-bg)" : readiness >= 40 ? "var(--status-amber-bg)" : "var(--surface)";
            const border = readiness >= 70 ? "var(--status-success-border)" : readiness >= 40 ? "var(--status-amber-border)" : "var(--line)";
            return (
              <div key={row.role} style={{ padding: "10px 12px", borderRadius: 8, background: bg, border: `1.5px solid ${border}` }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-soft)", marginBottom: 4 }}>{row.role}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color }}>{row.avgProgress ?? "–"}{row.avgProgress != null ? "%" : ""}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>readiness</span>
                </div>
                <div style={{ marginTop: 6, height: 4, background: "var(--viz-neutral-light)", borderRadius: 999 }}>
                  <div style={{ height: "100%", width: `${readiness}%`, background: color, borderRadius: 999, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Role</th>
                <th style={{ textAlign: "center" }}>Staff</th>
                <th style={{ textAlign: "center" }}>Bartending</th>
                <th style={{ textAlign: "center" }}>Sales</th>
                <th style={{ textAlign: "center" }}>Management</th>
                <th style={{ textAlign: "center" }}>Avg progress</th>
                <th style={{ textAlign: "center" }}>Compliant (&ge;80%)</th>
              </tr>
            </thead>
            <tbody>
              {roleStats.map((row) => {
                const mods = MODULE_REQS[row.role];
                const cell = (mod: { label: string; required: boolean }) => (
                  <td key={mod.label} style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600,
                      background: mod.required ? "var(--status-success-subtle)" : "var(--border-subtle)",
                      color: mod.required ? "var(--status-success-strong)" : "var(--color-text-faint)",
                    }}>
                      {mod.required ? "Required" : "Optional"}
                    </span>
                  </td>
                );
                return (
                  <tr key={row.role} style={{ background: row.members.length ? "transparent" : "var(--bg-alt)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, borderBottom: "1px solid var(--line)", color: "var(--text)" }}>{row.role}</td>
                    <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--line)", color: "var(--text-soft)" }}>{row.members.length}</td>
                    {mods.map(cell)}
                    <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--line)", fontWeight: 700, color: "var(--text)" }}>
                      {row.avgProgress !== null ? `${row.avgProgress}%` : "–"}
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
                      <ComplianceRing compliant={row.compliant} total={row.members.length} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
          </>
        )}
      </article>
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ops-card-head">
          <h3>Permission matrix</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Dashboard access by role</span>
            <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 999, background: "var(--status-yellow-bg)", color: "var(--status-amber-text)", fontWeight: 700, border: "1px solid var(--color-amber-badge)" }}>Manager column = elevated access</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--color-mastery-technical)" }} /> Permitted
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--viz-neutral-light)" }} /> No access
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th style={{ textAlign: "center", color: "var(--status-amber-text)", background: "var(--status-yellow-bg)", borderRadius: "8px 8px 0 0" }}>Manager</th>
                <th style={{ textAlign: "center" }}>Supervisor</th>
                <th style={{ textAlign: "center" }}>Staff</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm) => {
                const dot = (has: boolean, isManager?: boolean) => (
                  <td style={{ textAlign: "center", padding: "9px 12px", borderBottom: "1px solid var(--line)", background: isManager ? "var(--status-yellow-bg)" : "transparent" }}>
                    <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: has ? "var(--color-mastery-technical)" : "var(--viz-neutral-light)" }} />
                  </td>
                );
                return (
                  <tr key={perm.label}>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--line)", color: "var(--text-soft)" }}>{perm.label}</td>
                    {dot(perm.manager, true)}
                    {dot(perm.supervisor)}
                    {dot(perm.staff)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
