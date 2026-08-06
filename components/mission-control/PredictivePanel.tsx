"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { WorkspaceHeader } from "@/app/management/dashboard/_components/WorkspaceHeader";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap, line-count reduction). Covers the Predictive Skill Gaps tab:
// rule-based flag generation from staff scores/mastery data, KPI summary,
// per-staff flag cards, and a systemic-gap rollup. All derived from props —
// no local state beyond the immediate render.

type PredictionFlag = { id: string; staffName: string; role: string; gap: string; risk: "high" | "medium"; reason: string; action: string };

export interface PredictivePanelProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
  handleSectionChange: (section: ManagerSection) => void;
}

export function PredictivePanel({ venueStaff, selectedVenueName, handleSectionChange }: PredictivePanelProps) {
  const predictions: PredictionFlag[] = venueStaff.flatMap((member) => {
    const flags: PredictionFlag[] = [];
    if (member.salesScore < 70)
      flags.push({ id: `${member.id}-sales`, staffName: member.name, role: member.role, gap: "Upselling & Sales", risk: "high", reason: `Sales score ${member.salesScore}% – below 70% threshold`, action: "Assign 'Sales Conversations' training module" });
    if (member.serviceScore < 65)
      flags.push({ id: `${member.id}-service`, staffName: member.name, role: member.role, gap: "Service Quality", risk: "medium", reason: `Service score ${member.serviceScore}% – needs attention`, action: "Assign 'Guest Experience Foundations' scenario" });
    if (member.productScore < 60)
      flags.push({ id: `${member.id}-product`, staffName: member.name, role: member.role, gap: "Product Knowledge", risk: "medium", reason: `Product score ${member.productScore}% – knowledge gaps likely`, action: "Review menu knowledge module assignment" });
    if (member.progress < 40 && member.status !== "inactive")
      flags.push({ id: `${member.id}-progress`, staffName: member.name, role: member.role, gap: "Training Completion", risk: "high", reason: `Only ${member.progress}% complete – falling behind`, action: "Schedule a check-in and re-assign priority modules" });
    // Mastery engine flags
    if (member.knowledgeDecayRisk)
      flags.push({ id: `${member.id}-decay`, staffName: member.name, role: member.role, gap: "Knowledge Decay", risk: "high", reason: "Spaced-repetition items overdue – skills fading", action: "Prompt staff to complete review queue" });
    if (member.highConfidenceIncorrectRatio != null && member.highConfidenceIncorrectRatio > 0.3)
      flags.push({ id: `${member.id}-confidence`, staffName: member.name, role: member.role, gap: "Confidence Mismatch", risk: "medium", reason: `${Math.round(member.highConfidenceIncorrectRatio * 100)}% of high-confidence attempts are incorrect`, action: "Coach on self-assessment accuracy – over-confidence risk" });
    return flags;
  });
  const highRisk = predictions.filter((p) => p.risk === "high");
  const gapTotals: Record<string, number> = {};
  predictions.forEach((p) => { gapTotals[p.gap] = (gapTotals[p.gap] ?? 0) + 1; });
  const topGaps = Object.entries(gapTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Mastery status summary
  const masteryStats = { mastered: 0, inProgress: 0, atRisk: 0 };
  for (const m of venueStaff) {
    if (m.masteryStatus === "mastered") masteryStats.mastered++;
    else if (m.knowledgeDecayRisk) masteryStats.atRisk++;
    else if (m.scenariosAttempted && m.scenariosAttempted > 0) masteryStats.inProgress++;
  }
  const hasMasteryData = venueStaff.some((m) => m.masteryStatus != null || m.eloRating != null);

  return (
    <section className="ops-grid ops-grid-main">
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <WorkspaceHeader
          title="Predictive Skill Gaps"
          description="Identify training risks before they show up on the floor"
          actions={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedVenueName ?? "All venues"}</span>
              {predictions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const rows = [["Staff", "Role", "Gap", "Risk", "Reason", "Action"], ...predictions.map((p) => [p.staffName, p.role, p.gap, p.risk, p.reason, p.action])];
                    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = `training-plan-${selectedVenueName ?? "venue"}.csv`; a.click(); URL.revokeObjectURL(url);
                  }}
                  style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text-soft)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export training plan
                </button>
              )}
            </div>
          }
        />

        {hasMasteryData && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            <div className="ops-kpi-card" style={{ background: "var(--surface)", borderLeft: "4px solid var(--green)" }}>
              <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Mastered</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--green)" }}>{masteryStats.mastered}</strong>
              <small>staff at mastery level</small>
            </div>
            <div className="ops-kpi-card" style={{ background: "var(--surface)", borderLeft: "4px solid var(--gold-warm)" }}>
              <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>In Progress</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--gold-warm)" }}>{masteryStats.inProgress}</strong>
              <small>actively training</small>
            </div>
            <div className="ops-kpi-card" style={{ background: "var(--surface)", borderLeft: "4px solid var(--status-critical-text)" }}>
              <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>At Risk (Decay)</span>
              <strong style={{ fontSize: "1.8rem", color: "var(--status-critical-text)" }}>{masteryStats.atRisk}</strong>
              <small>overdue reviews</small>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <div className="ops-kpi-card" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Total flags</span>
            <strong style={{ fontSize: "1.8rem", color: "var(--text)" }}>{predictions.length}</strong>
            <small>{predictions.length === 0 ? "All staff on track" : `${highRisk.length} high priority`}</small>
          </div>
          <div className="ops-kpi-card">
            <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Staff flagged</span>
            <strong style={{ fontSize: "1.8rem" }}>{new Set(predictions.map((p) => p.staffName)).size}</strong>
            <small>of {venueStaff.length} total</small>
          </div>
          <div className="ops-kpi-card">
            <span style={{ color: "var(--text-soft)", fontSize: ".8rem" }}>Top gap area</span>
            <strong style={{ fontSize: "1.1rem" }}>{topGaps[0]?.[0] ?? "None"}</strong>
            <small>{topGaps[0] ? `${topGaps[0][1]} staff affected` : "All clear"}</small>
          </div>
        </div>
        {predictions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-soft)" }}>
            <div style={{ marginBottom: 8 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <strong>No skill gaps detected.</strong>
            <p style={{ marginTop: 4, fontSize: ".9rem" }}>All staff are tracking above performance thresholds. Keep monitoring as new staff join.</p>
          </div>
        ) : (
          <>
            {(() => {
              // Group all predictions by staffName for cleaner employee cards
              const staffNames = [...new Set(predictions.map((p) => p.staffName))];
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {staffNames.map((name) => {
                    const staffFlags = predictions.filter((p) => p.staffName === name);
                    const staffMember = venueStaff.find((s) => s.name === name);
                    const hasHigh = staffFlags.some((p) => p.risk === "high");
                    return (
                      <div key={name} style={{
                        border: "1.5px solid var(--line)",
                        borderLeft: "4px solid var(--line)",
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "var(--surface)",
                      }}>
                        {/* Staff header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--line-light)" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.875rem", color: "var(--green-deep)", flexShrink: 0 }}>
                            {name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{name}</div>
                              {hasHigh ? (
                                <span style={{ padding: "2px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.68rem", fontWeight: 700, background: "var(--status-critical-light)", color: "var(--status-critical-text)", border: "1px solid var(--status-critical-border)", flexShrink: 0 }}>
                                  High priority
                                </span>
                              ) : (
                                <span style={{ padding: "2px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.68rem", fontWeight: 700, background: "var(--bg-alt)", color: "var(--text-soft)", border: "1px solid var(--line)", flexShrink: 0 }}>
                                  Watch
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{staffMember?.role ?? "Staff"} · {staffFlags.length} flag{staffFlags.length !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                        {/* Individual flags */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {staffFlags.map((p, fi) => (
                            <div key={p.id} style={{ padding: "10px 16px", borderBottom: fi < staffFlags.length - 1 ? "1px solid var(--line-light)" : "none" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                                <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text)" }}>{p.gap}</span>
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-soft)", marginBottom: 6 }}>{p.reason}</div>
                              <button
                                type="button"
                                onClick={() => handleSectionChange("staff")}
                                style={{ padding: "5px 12px", borderRadius: 6, background: "var(--color-mastery-technical)", color: "white", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                {p.action}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            {topGaps.length > 0 && (
              <div style={{ marginTop: 28, padding: "16px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: ".9rem", display: "block", marginBottom: 10 }}>Systemic gap analysis</strong>
                {topGaps.map(([gap, count]) => (
                  <div key={gap} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: ".9rem" }}>{gap}</span>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{count} staff affected</span>
                  </div>
                ))}
                <p style={{ marginTop: 10, fontSize: ".82rem", color: "var(--text-soft)" }}>Patterns across multiple staff suggest a systemic gap. Consider creating venue-wide training content for these areas.</p>
              </div>
            )}
          </>
        )}
      </article>
    </section>
  );
}
