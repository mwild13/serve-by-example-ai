"use client";

import type { ManagementSnapshot, StaffRole } from "@/lib/management/types";
import { EmptyState } from "./manager-ui";

// Extracted from ManagerControlCenter.tsx (Phase 5, Task 2 — component
// extraction roadmap). Pure presentational: all team math is derived here
// from already-fetched venueStaff, no new data-fetching or API routes.

export interface TeamsPerformancePanelProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
  onAssignStaffToTeam: () => void;
  onResolveSkillGap: (prompt: string) => void;
}

export function TeamsPerformancePanel({
  venueStaff,
  selectedVenueName,
  onAssignStaffToTeam,
  onResolveSkillGap,
}: TeamsPerformancePanelProps) {
  const teamDefs = [
    { label: "Bar Team", roles: ["Bartender"] as StaffRole[] },
    { label: "Floor Team", roles: ["Floor", "New Staff"] as StaffRole[] },
    { label: "Leadership", roles: ["Supervisor", "Manager"] as StaffRole[] },
  ];
  const teams = teamDefs.map((def) => {
    const members = venueStaff.filter((s) => def.roles.includes(s.role));
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const avgProgress = avg(members.map((s) => s.progress));
    const avgService = avg(members.map((s) => s.serviceScore));
    const avgSales = avg(members.map((s) => s.salesScore));
    const avgProduct = avg(members.map((s) => s.productScore));
    const avgScore = avg(members.map((s) => Math.round((s.serviceScore + s.salesScore + s.productScore) / 3)));
    const attention = members.filter((s) => s.status !== "on-track");
    const top = members.length ? [...members].sort((a, b) => b.progress - a.progress)[0] : null;
    const weakest = (() => {
      const scores = { Service: avgService, Sales: avgSales, "Product knowledge": avgProduct };
      const [label] = Object.entries(scores).sort((a, b) => a[1] - b[1])[0] ?? [];
      return label ?? null;
    })();
    return { ...def, members, avgProgress, avgScore, avgService, avgSales, avgProduct, attention, top, weakest };
  });
  const allScores = teams.map((t) => t.avgScore);
  const maxScore = Math.max(...allScores, 1);

  return (
    <section className="ops-grid ops-grid-main">
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ops-card-head">
          <h3>Team performance</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedVenueName}</span>
            {venueStaff.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const rows = [["Team", "Members", "Avg Progress", "Avg Score", "Needs Attention"], ...teams.map((t) => [t.label, String(t.members.length), `${t.avgProgress}%`, `${t.avgScore}%`, String(t.attention.length)])];
                  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = `team-report-${selectedVenueName ?? "venue"}.csv`; a.click(); URL.revokeObjectURL(url);
                }}
                style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text-soft)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export team report
              </button>
            )}
          </div>
        </div>
        {venueStaff.length === 0 ? (
          <EmptyState
            copy="Add staff to unlock team performance data."
            ctaLabel="+ Add staff"
            onCtaClick={onAssignStaffToTeam}
          />
        ) : (
          <>
            <div className="ops-module-grid" style={{ marginBottom: "1.5rem" }}>
              {teams.map((team) => (
                <div key={team.label} className="ops-module-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{team.label}</strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{team.members.length} member{team.members.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Training completion</span>
                      <b style={{ color: "var(--text)" }}>{team.avgProgress > 0 ? `${team.avgProgress}%` : "–"}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Avg scenario score</span>
                      <b style={{ color: "var(--text)" }}>{team.avgScore > 0 ? `${team.avgScore}%` : "–"}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Needs attention</span>
                      <b style={{ color: team.attention.length > 0 ? "var(--status-amber-dark)" : "var(--status-success-strong)" }}>{team.attention.length}</b>
                    </div>
                  </div>
                  {team.members.length === 0 && (
                    <button
                      type="button"
                      onClick={onAssignStaffToTeam}
                      style={{ marginTop: 8, padding: "7px 12px", borderRadius: 8, border: "1.5px dashed var(--line)", background: "transparent", color: "var(--green)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "center" }}
                    >
                      + Assign staff to team
                    </button>
                  )}
                  {team.top && (
                    <div style={{ fontSize: "0.78rem", borderTop: "1px solid var(--line)", paddingTop: 6, marginTop: 2 }}>
                      <span style={{ color: "var(--text-muted)" }}>Top: </span>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{team.top.name}</span>
                      <span style={{ color: "var(--text-muted)" }}> · {team.top.progress}%</span>
                    </div>
                  )}
                  {team.weakest && team.members.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "var(--status-amber-bg)", color: "var(--status-amber-dark)", border: "1px solid var(--status-amber-border)", borderRadius: 999, padding: "2px 8px" }}>
                        Gap: {team.weakest}
                      </span>
                      <button
                        type="button"
                        onClick={() => onResolveSkillGap(`What specific training should I assign to close the ${team.weakest} skill gap for my ${team.label} team?`)}
                        className="sbe-button-outline sbe-button-outline--sm"
                      >
                        Resolve →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>Team comparison – avg scenario score</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* 80% target label */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={{ width: 96, flexShrink: 0 }} />
                  <div style={{ flex: 1, position: "relative", height: 10 }}>
                    <div style={{ position: "absolute", left: `${(80 / maxScore) * 100}%`, top: -14, fontSize: "0.65rem", color: "var(--color-mastery-technical)", fontWeight: 700, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>80% target</div>
                    <div style={{ position: "absolute", left: `${(80 / maxScore) * 100}%`, top: 0, width: 2, height: "100%", background: "var(--color-mastery-technical)", opacity: 0.4 }} />
                  </div>
                  <span style={{ width: 60 }} />
                </div>
                {teams.map((team) => (
                  <div key={team.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 96, fontSize: "0.82rem", color: "var(--text-soft)", flexShrink: 0 }}>{team.label}</span>
                    <div style={{ flex: 1, height: 10, background: "var(--bg-alt)", borderRadius: 999, overflow: "visible", position: "relative" }}>
                      <div style={{ height: "100%", width: `${team.members.length ? (team.avgScore / maxScore) * 100 : 0}%`, background: team.avgScore >= 80 ? "var(--status-success)" : team.avgScore >= 50 ? "var(--color-mastery-technical)" : "var(--status-amber)", borderRadius: 999, transition: "width 0.4s ease" }} />
                      {/* 80% marker */}
                      <div style={{ position: "absolute", left: `${(80 / maxScore) * 100}%`, top: -2, width: 2, height: 14, background: "var(--color-mastery-technical)", opacity: 0.35, borderRadius: 1 }} />
                    </div>
                    <span style={{ width: 60, fontSize: "0.78rem", fontWeight: 600, color: team.members.length ? (team.avgScore >= 80 ? "var(--status-success)" : "var(--text)") : "var(--text-muted)", textAlign: "right" }}>
                      {team.members.length ? `${team.avgScore}%` : "No data"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {teams.some((t) => t.attention.length > 0) && (
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "1rem" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--status-amber-dark)", marginBottom: 8 }}>Needs attention</p>
                <ul className="ops-plain-list ops-compact-list">
                  {teams.flatMap((t) => t.attention.map((s) => (
                    <li key={s.id}>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>{t.label} · {s.status === "inactive" ? "Inactive" : "Needs attention"} · {s.progress}% complete</span>
                    </li>
                  )))}
                </ul>
              </div>
            )}
          </>
        )}
      </article>
    </section>
  );
}
