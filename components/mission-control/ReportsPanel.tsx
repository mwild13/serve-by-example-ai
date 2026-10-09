"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { rsaStatus } from "./compliance/helpers";
import { EmptyState } from "./manager-ui";
import { BarCell, ExportButton, PageHead, Panel, StatRow, StatusText, type StatusTone } from "./console-ui";

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
// is preserved below: an unrecorded RSA reads "Not on file" rather than
// "Current", and level 3 reads "Expired" rather than a bare dash.
//
// Layout (October 2026): figure strip, one sortable table, two ruled lists,
// skill bars and the email schedule. Status is text beside a dot.

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

  const statusText = (status: string, progress?: number) => {
    const effective = status === "on-track" && progress === 0 ? "not-started" : status;
    const map: Record<string, { tone: StatusTone; label: string }> = {
      "on-track": { tone: "ok", label: "On track" },
      attention: { tone: "warn", label: "Needs follow-up" },
      inactive: { tone: "neutral", label: "Inactive" },
      "not-started": { tone: "neutral", label: "Not started" },
    };
    const entry = map[effective] ?? map.inactive;
    return <StatusText tone={entry.tone}>{entry.label}</StatusText>;
  };

  const rsaText = (member: typeof venueStaff[0]) => {
    // rsaStatus level 0 covers both "none on file" and "30+ days left", so
    // the raw date is checked first.
    if (!member.compliance?.rsaExpiryDate) return <StatusText title="RSA not recorded">Not on file</StatusText>;
    const rsa = rsaStatus(member.compliance);
    if (rsa.level === 0) return <StatusText tone="ok" title={rsa.label}>Current</StatusText>;
    if (rsa.level === 1) return <StatusText tone="warn" title={rsa.label}>Within 30 days</StatusText>;
    if (rsa.level === 2) return <StatusText tone="warn" title={rsa.label}>Within 7 days</StatusText>;
    return <StatusText tone="alert" title={rsa.label}>Expired</StatusText>;
  };

  const columns: [string, ReportSortKey | null, boolean][] = [
    ["Staff member", "name", false],
    ["Role", "role", false],
    ["Training", "progress", false],
    ["Service", "service", true],
    ["Sales", "sales", true],
    ["Product", "product", true],
    ["RSA", null, false],
    ["Status", null, false],
  ];
  const query = reportSearch.trim().toLowerCase();
  const rows = sortedByProgress.filter((s) => !query || s.name.toLowerCase().includes(query) || s.role.toLowerCase().includes(query));
  const hasStaff = venueStaff.length > 0;

  return (
    <div className="mc-page">
      <PageHead
        title="Reports"
        description={`Training results for ${selectedVenueName ?? "your venue"}, person by person.`}
        actions={hasStaff ? <ExportButton label="Export staff CSV" onClick={handleExportStaff} /> : undefined}
      />

      <StatRow
        items={[
          { label: "Staff", value: String(venueStaff.length) },
          { label: "Training completed", value: hasStaff ? `${metrics.avgCompletion}%` : null, sub: "Average across all staff" },
          { label: "Scenario score", value: hasStaff ? `${metrics.avgScenarioScore}%` : null, sub: "Average across all staff" },
          { label: "Training qualified", value: hasStaff ? `${fullyCompliant.length} of ${venueStaff.length}` : null, sub: "Passed every module their role needs" },
        ]}
      />

      {!hasStaff ? (
        <Panel>
          <EmptyState copy="Add staff to start generating reports." ctaLabel="+ Add staff" onCtaClick={onAddStaff} />
        </Panel>
      ) : (
        <>
          <Panel
            title="Training summary"
            aside={
              <input
                type="search"
                className="mc-input"
                style={{ width: 240, minHeight: 40 }}
                value={reportSearch}
                onChange={(event) => setReportSearch(event.target.value)}
                placeholder="Filter by name or role"
                aria-label="Filter staff"
              />
            }
            flush
          >
            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead>
                  <tr>
                    {columns.map(([label, key, numeric]) => (
                      <th
                        key={label}
                        className={numeric ? "is-num" : undefined}
                        aria-sort={key && reportSortKey === key ? (reportSortDir === "desc" ? "descending" : "ascending") : undefined}
                      >
                        {key ? (
                          <button
                            type="button"
                            className={`mc-th-sort${reportSortKey === key ? " active" : ""}`}
                            onClick={() => {
                              if (reportSortKey === key) setReportSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
                              else { setReportSortKey(key); setReportSortDir("desc"); }
                            }}
                          >
                            {label}
                            {reportSortKey === key && (reportSortDir === "desc" ? <ArrowDown size={13} aria-hidden="true" /> : <ArrowUp size={13} aria-hidden="true" />)}
                          </button>
                        ) : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td className="is-main">{s.name}</td>
                      <td className="is-soft">{s.role}</td>
                      <td><BarCell value={s.progress} /></td>
                      <td className="is-num">{s.serviceScore}%</td>
                      <td className="is-num">{s.salesScore}%</td>
                      <td className="is-num">{s.productScore}%</td>
                      <td>{rsaText(s)}</td>
                      <td>{statusText(s.status, s.progress)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <p className="mc-panel-note">No staff match that filter.</p>}
          </Panel>

          <div className="mc-two-col">
            <Panel title="Furthest along" flush>
              {topPerformers.length === 0 ? (
                <p className="mc-panel-note" style={{ borderTop: "none" }}>No one has started training yet.</p>
              ) : (
                <div>
                  {topPerformers.map((s) => (
                    <button key={s.id} type="button" className="mc-row" onClick={() => onOpenCoachingDrawer(s.id)}>
                      <span className="mc-row-main">
                        <span className="mc-row-title" style={{ display: "block" }}>{s.name}</span>
                        <span className="mc-row-meta">{s.role}</span>
                      </span>
                      <span className="mc-row-value">{Math.round(s.progress)}%</span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Needs follow-up" aside={needsHelp.length > 0 ? <span className="mc-panel-count">{needsHelp.length}</span> : undefined} flush>
              {needsHelp.length === 0 ? (
                <p className="mc-panel-note" style={{ borderTop: "none" }}>Everyone is on track.</p>
              ) : (
                <div>
                  {needsHelp.map((s) => (
                    <button key={s.id} type="button" className="mc-row" onClick={() => onOpenCoachingDrawer(s.id)}>
                      <span className="mc-row-main">
                        <span className="mc-row-title" style={{ display: "block" }}>{s.name}</span>
                        <span className="mc-row-meta">{s.role} · last active {s.lastActive.toLowerCase()}</span>
                      </span>
                      {statusText(s.status)}
                    </button>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <Panel title="Skills across the venue" description="Average score in each area.">
            <div>
              {[
                { label: "Service", value: metrics.serviceSkill },
                { label: "Sales", value: metrics.salesSkill },
                { label: "Product knowledge", value: metrics.productSkill },
              ].map((skill) => (
                <div key={skill.label} className="mc-qual-row">
                  <div className="mc-qual-head">
                    <span className="mc-qual-label">{skill.label}</span>
                    <span className="mc-qual-pct">{skill.value}%</span>
                  </div>
                  <span className="mc-progress-track" aria-hidden="true">
                    <span className="mc-progress-fill" style={{ width: `${skill.value}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Weekly email report" description="A summary of this venue's training progress, sent to your inbox.">
            <div className="mc-inline-form" style={{ alignItems: "center", paddingTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, fontSize: "0.9375rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={reportScheduleEnabled}
                  onChange={(event) => setReportScheduleEnabled(event.target.checked)}
                  style={{ width: 20, height: 20, accentColor: "var(--green)", cursor: "pointer" }}
                />
                Send me the weekly report
              </label>
              {reportScheduleEnabled && (
                <>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9375rem" }}>
                    on
                    <select className="mc-input" style={{ width: "auto" }} value={reportScheduleDay} onChange={(event) => setReportScheduleDay(Number(event.target.value))}>
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                        <option key={day} value={index}>{day}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="mc-btn mc-btn-primary" onClick={handleSaveReportSchedule} disabled={reportScheduleSaving}>
                    {reportScheduleSaving ? "Saving…" : "Save"}
                  </button>
                  {reportScheduleSaved && <span className="mc-saved" role="status">Saved</span>}
                </>
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
