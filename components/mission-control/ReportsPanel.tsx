"use client";

import { useState } from "react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { rsaStatus } from "./compliance/helpers";
import { EmptyState } from "./manager-ui";

// Extracted from ManagerControlCenter.tsx (Phase 5, Task — line-count
// reduction toward the 3,200-line target). Covers the "Performance reports"
// tab: KPI summary strip, weekly training summary table (with CSV
// download/export controls), top performers / needs attention panels, skill
// breakdown, and the weekly email report schedule form.
//
// reportSearch/reportSortKey/reportSortDir are local UI-only state — nothing
// outside this tab ever reads them, so they live here rather than being
// prop-drilled. reportSchedule* state and handleSaveReportSchedule stay in
// the parent (ManagerControlCenter.tsx) since that state is also read by the
// schedule-save API call defined there — passed down as props per the
// "keep existing state hooks/callbacks as props from the parent" rule.
//
// The RSA level-3 "Expired" fix (Phase 5, Task 1 — dual-status bug follow-up)
// is preserved as-is below: unrecorded RSA renders an explicit amber
// "Not verified" chip instead of a green "OK", and level 3 renders "Expired"
// instead of a bare em-dash.

type ReportSortKey = "name" | "role" | "progress" | "service" | "sales" | "product";

interface ReportsPanelMetrics {
  avgCompletion: number;
  avgScenarioScore: number;
  serviceSkill: number;
  salesSkill: number;
  productSkill: number;
}

export interface ReportsPanelProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
  metrics: ReportsPanelMetrics;
  handleExportStaff: () => void;
  onOpenCoachingDrawer: (staffId: string) => void;
  onAddStaff: () => void;
  reportScheduleEnabled: boolean;
  setReportScheduleEnabled: (enabled: boolean) => void;
  reportScheduleDay: number;
  setReportScheduleDay: (day: number) => void;
  reportScheduleSaving: boolean;
  reportScheduleSaved: boolean;
  handleSaveReportSchedule: () => void | Promise<void>;
}

export function ReportsPanel({
  venueStaff,
  selectedVenueName,
  metrics,
  handleExportStaff,
  onOpenCoachingDrawer,
  onAddStaff,
  reportScheduleEnabled,
  setReportScheduleEnabled,
  reportScheduleDay,
  setReportScheduleDay,
  reportScheduleSaving,
  reportScheduleSaved,
  handleSaveReportSchedule,
}: ReportsPanelProps) {
  const [reportSearch, setReportSearch] = useState("");
  const [reportSortKey, setReportSortKey] = useState<ReportSortKey>("progress");
  const [reportSortDir, setReportSortDir] = useState<"asc" | "desc">("desc");

  // Compliance helper (matches Compliance tab logic)
  const reqModules: Record<string, string[]> = {
    Bartender: ["Bartending", "Sales"],
    Floor: ["Sales"],
    Supervisor: ["Sales", "Bartending"],
    Manager: ["Sales", "Bartending", "Management"],
    "New Staff": ["Bartending"],
  };
  const hasModule = (s: typeof venueStaff[0], mod: string) => {
    if (mod === "Sales") return s.salesScore >= 60 || s.progress >= 60;
    if (mod === "Bartending") return s.serviceScore >= 60;
    if (mod === "Management") return s.productScore >= 60;
    return false;
  };
  const fullyCompliant = venueStaff.filter((s) =>
    (reqModules[s.role] ?? []).every((m) => hasModule(s, m))
  );
  const sortedByProgress = [...venueStaff].sort((a, b) => {
    const m = reportSortDir === "asc" ? 1 : -1;
    switch (reportSortKey) {
      case "name":    return m * a.name.localeCompare(b.name);
      case "role":    return m * a.role.localeCompare(b.role);
      case "service": return m * (a.serviceScore - b.serviceScore);
      case "sales":   return m * (a.salesScore - b.salesScore);
      case "product": return m * (a.productScore - b.productScore);
      default:        return m * (a.progress - b.progress);
    }
  });
  const topPerformers = [...venueStaff].sort((a, b) => b.progress - a.progress).filter((s) => s.progress > 0).slice(0, 3);
  const needsHelp = venueStaff.filter((s) => s.status !== "on-track").slice(0, 5);

  const statusBadge = (status: string, progress?: number) => {
    const effective = (status === "on-track" && progress === 0) ? "not-started" : status;
    const map: Record<string, { bg: string; color: string; label: string }> = {
      "on-track":    { bg: "var(--status-success-bg)", color: "var(--status-success-strong)", label: "On track" },
      "attention":   { bg: "var(--status-amber-bg)", color: "var(--status-orange)", label: "Attention" },
      "inactive":    { bg: "var(--status-critical-bg)", color: "var(--status-critical-text)", label: "Inactive" },
      "not-started": { bg: "var(--border-subtle)", color: "var(--color-text-muted)", label: "Not started" },
    };
    const s = map[effective] ?? map["inactive"];
    return (
      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <section className="ops-grid ops-grid-main">
      {/* Header with export */}
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>Performance reports</h3>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 3 }}>{selectedVenueName}</div>
          </div>
          {venueStaff.length > 0 && (
            <button
              type="button"
              onClick={handleExportStaff}
              style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text-soft)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export staff CSV
            </button>
          )}
        </div>

        {/* KPI summary strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total staff", value: venueStaff.length, noData: false },
            { label: "Avg training", value: `${metrics.avgCompletion}%`, noData: venueStaff.length === 0 },
            { label: "Avg score", value: `${metrics.avgScenarioScore}%`, noData: venueStaff.length === 0 },
            { label: "Training qualified", value: `${fullyCompliant.length}/${venueStaff.length}`, noData: venueStaff.length === 0 },
          ].map((kpi) => (
            <div key={kpi.label} style={{ padding: "14px 16px", background: "var(--surface-raised)", borderRadius: 10, border: "1px solid var(--line)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {kpi.noData ? (
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-muted)" }}>No data</div>
              ) : (
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)" }}>{kpi.value}</div>
              )}
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {venueStaff.length === 0 ? (
          <EmptyState
            copy="Add staff to start generating performance reports."
            ctaLabel="+ Add staff"
            onCtaClick={onAddStaff}
          />
        ) : (
          <>
            {/* Training summary table */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Weekly training summary
                </div>
                <input
                  type="search"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Filter by name or role…"
                  style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text-soft)", fontSize: "0.8rem", width: 200 }}
                  aria-label="Filter staff"
                />
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="mgmt-table">
                  <thead>
                    <tr>
                      {([
                        ["Staff member", "name"],
                        ["Role", "role"],
                        ["Progress", "progress"],
                        ["Service", "service"],
                        ["Sales", "sales"],
                        ["Product", "product"],
                        ["Cert", null],
                        ["Status", null],
                      ] as [string, ReportSortKey | null][]).map(([h, key]) => (
                        <th
                          key={h}
                          style={{ whiteSpace: "nowrap", cursor: key ? "pointer" : "default", userSelect: "none" }}
                          onClick={key ? () => {
                            if (reportSortKey === key) setReportSortDir(d => d === "asc" ? "desc" : "asc");
                            else { setReportSortKey(key); setReportSortDir("desc"); }
                          } : undefined}
                        >
                          {h}{key && reportSortKey === key ? (reportSortDir === "desc" ? " ↓" : " ↑") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByProgress.filter((s) => !reportSearch.trim() || s.name.toLowerCase().includes(reportSearch.toLowerCase()) || s.role.toLowerCase().includes(reportSearch.toLowerCase())).map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{s.name}</td>
                        <td style={{ padding: "8px 10px", color: "var(--text-soft)", whiteSpace: "nowrap" }}>{s.role}</td>
                        <td style={{ padding: "8px 10px", minWidth: 90 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, height: 5, background: "var(--bg-alt)", borderRadius: 999 }}>
                              <div style={{ height: "100%", width: `${s.progress}%`, background: s.progress >= 70 ? "linear-gradient(90deg, var(--status-success-strong), var(--status-success-bright))" : s.progress >= 40 ? "linear-gradient(90deg, var(--status-warning), var(--status-amber-bright))" : "linear-gradient(90deg, var(--status-critical), var(--status-critical-rose))", borderRadius: 999, transition: "width 0.3s ease" }} />
                            </div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-soft)", width: 32, textAlign: "right" }}>{Math.round(s.progress)}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "var(--text-soft)" }}>{s.serviceScore}%</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "var(--text-soft)" }}>{s.salesScore}%</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "var(--text-soft)" }}>{s.productScore}%</td>
                        <td style={{ padding: "8px 10px", textAlign: "center" }}>
                          {(() => {
                            const rsa = rsaStatus(s.compliance);
                            // rsa.level === 0 covers two different realities: "no RSA on
                            // file" and "RSA on file with 30+ days remaining" — the level
                            // alone can't tell them apart, so check the raw field directly.
                            // Not doing so previously rendered unrecorded RSA as a green
                            // "OK" chip, and an expired RSA (level 3) as a bare "–".
                            const notRecorded = !s.compliance?.rsaExpiryDate;
                            if (notRecorded) {
                              return (
                                <span title="RSA not recorded" style={{ display: "inline-block", padding: "2px 7px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, background: "var(--status-yellow-bg)", color: "var(--status-warning)" }}>
                                  Not verified
                                </span>
                              );
                            }
                            const color = rsa.level === 0 ? "var(--status-success-strong)" : rsa.level === 1 ? "var(--status-warning)" : "var(--status-critical)";
                            const bg = rsa.level === 0 ? "var(--status-success-bg)" : rsa.level === 1 ? "var(--status-yellow-bg)" : "var(--status-critical-light)";
                            const label = rsa.level === 0 ? "OK" : rsa.level === 1 ? "30d" : rsa.level === 2 ? "7d" : "Expired";
                            return (
                              <span title={rsa.label} style={{ display: "inline-block", padding: "2px 7px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, background: bg, color }}>
                                {label}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: "8px 10px" }}>{statusBadge(s.status, s.progress)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom two panels */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {/* Top performers */}
              <div style={{ background: "var(--bg-alt)", borderRadius: 12, padding: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                  Top performers
                </div>
                {topPerformers.map((s, i) => (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenCoachingDrawer(s.id)}
                    onKeyDown={(e) => e.key === "Enter" && onOpenCoachingDrawer(s.id)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < topPerformers.length - 1 ? "1px solid var(--line)" : "none", cursor: "pointer" }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{s.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--color-mastery-technical)" }}>{Math.round(s.progress)}%</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>completion</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Needs attention */}
              <div style={{ background: needsHelp.length > 0 ? "var(--status-amber-bg)" : "var(--bg-alt)", borderRadius: 12, padding: "1rem", border: needsHelp.length > 0 ? "1.5px solid var(--status-amber-border)" : "none" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: needsHelp.length > 0 ? "var(--status-orange)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                  Needs attention {needsHelp.length > 0 ? `(${needsHelp.length})` : ""}
                </div>
                {needsHelp.length === 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--status-success-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--status-success-strong)", fontWeight: 600 }}>All staff are on track. Great work.</p>
                  </div>
                ) : (
                  needsHelp.map((s, i) => (
                    <div
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenCoachingDrawer(s.id)}
                      onKeyDown={(e) => e.key === "Enter" && onOpenCoachingDrawer(s.id)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < needsHelp.length - 1 ? "1px solid var(--status-amber-border)" : "none", cursor: "pointer" }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--status-critical-dark)" }}>{s.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--status-amber-text)" }}>{s.role} · {s.lastActive}</div>
                      </div>
                      <div>{statusBadge(s.status)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Skill breakdown */}
            <div style={{ marginTop: "1rem", background: "var(--bg-alt)", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                Venue skill breakdown
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {[
                  { label: "Service", value: metrics.serviceSkill, color: "var(--color-mastery-technical)" },
                  { label: "Sales", value: metrics.salesSkill, color: "var(--status-amber)" },
                  { label: "Product knowledge", value: metrics.productSkill, color: "var(--color-link-dark)" },
                ].map((skill) => (
                  <div key={skill.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-soft)", fontWeight: 600 }}>{skill.label}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, color: skill.value > 0 ? skill.color : "var(--text-muted)" }}>{skill.value}%</span>
                    </div>
                    <div style={{ height: 10, background: "var(--viz-neutral-light)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${skill.value}%`, background: skill.color, borderRadius: 999, transition: "width 0.3s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* A27 — Weekly report schedule */}
            <div style={{ marginTop: "1.25rem", padding: "16px 20px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: reportScheduleEnabled ? 14 : 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>Weekly email report</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>Receive a summary of this venue&apos;s training progress by email</div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={reportScheduleEnabled}
                    onChange={(e) => setReportScheduleEnabled(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-soft)", fontWeight: 600 }}>{reportScheduleEnabled ? "On" : "Off"}</span>
                </label>
              </div>
              {reportScheduleEnabled && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-soft)", fontWeight: 600 }}>
                    Day:
                    <select
                      value={reportScheduleDay}
                      onChange={(e) => setReportScheduleDay(Number(e.target.value))}
                      style={{ marginLeft: 6, padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text-soft)", fontSize: "0.8rem" }}
                    >
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                        <option key={d} value={i}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={handleSaveReportSchedule}
                    disabled={reportScheduleSaving}
                    style={{ padding: "6px 16px", borderRadius: 7, border: "none", background: "var(--green)", color: "white", fontWeight: 700, fontSize: "0.8rem", cursor: reportScheduleSaving ? "not-allowed" : "pointer", opacity: reportScheduleSaving ? 0.6 : 1 }}
                  >
                    {reportScheduleSaving ? "Saving…" : "Save"}
                  </button>
                  {reportScheduleSaved && <span style={{ fontSize: "0.8rem", color: "var(--green)", fontWeight: 600 }}>Saved</span>}
                </div>
              )}
            </div>
          </>
        )}
      </article>
    </section>
  );
}
