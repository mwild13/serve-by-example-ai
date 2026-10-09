"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { EmptyState } from "@/components/mission-control/manager-ui";
import { ExportButton, PageHead, Panel, StatRow, StatusText, downloadCsv, type Stat } from "./console-ui";
import { computeSkillGapFlags, groupSkillGapsByCategory, countShiftReadyStaff, countUrgentBottlenecks } from "@/lib/management/skill-gaps";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap, line-count reduction). Covers the shift-readiness / training
// bottlenecks tab: rule-based flag generation from staff scores/mastery data
// (lib/management/skill-gaps.ts — shared with SkillGapsSummaryCard.tsx's
// Overview-tab rollup), KPI summary, per-staff flag cards, and a systemic-gap
// rollup. All derived from props — no local state beyond the immediate render.

export interface PredictivePanelProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
  handleSectionChange: (section: ManagerSection) => void;
}

export function PredictivePanel({ venueStaff, selectedVenueName, handleSectionChange }: PredictivePanelProps) {
  const predictions = computeSkillGapFlags(venueStaff);
  const groupedGaps = groupSkillGapsByCategory(predictions);
  const topGaps = groupedGaps.slice(0, 3);
  // "Shift-ready" and "urgent bottleneck" replace the old Total flags/Top gap
  // area framing (vague — a manager can't act on "3 flags") with two numbers
  // that map directly to a decision: who can I put on the floor right now,
  // and which training gap is big enough to need venue-wide content rather
  // than a one-off coaching conversation. Bottleneck count is computed off
  // the full grouped list, not the top-3 slice used for on-screen display,
  // so it doesn't undercount venues with more than 3 systemic gap categories.
  const shiftReadyCount = countShiftReadyStaff(venueStaff, predictions);
  const urgentBottleneckCount = countUrgentBottlenecks(groupedGaps);

  // Mastery status summary
  const masteryStats = { mastered: 0, inProgress: 0, atRisk: 0 };
  for (const m of venueStaff) {
    if (m.masteryStatus === "mastered") masteryStats.mastered++;
    else if (m.knowledgeDecayRisk) masteryStats.atRisk++;
    else if (m.scenariosAttempted && m.scenariosAttempted > 0) masteryStats.inProgress++;
  }
  const hasMasteryData = venueStaff.some((m) => m.masteryStatus != null);

  const flaggedNames = [...new Set(predictions.map((p) => p.staffName))];

  const stats: Stat[] = [
    { label: "Cleared to work", value: `${shiftReadyCount} of ${venueStaff.length}`, sub: "No high-priority gaps right now" },
    {
      label: "Venue-wide gaps",
      value: String(urgentBottleneckCount),
      sub: urgentBottleneckCount === 0 ? "No gap is shared by two or more staff" : "High-priority gaps shared by two or more staff",
    },
    { label: "Staff with a gap", value: `${flaggedNames.length} of ${venueStaff.length}` },
  ];
  if (hasMasteryData) {
    stats.push(
      { label: "At mastery", value: String(masteryStats.mastered), sub: `${masteryStats.inProgress} still training` },
      { label: "Reviews overdue", value: String(masteryStats.atRisk), sub: "Knowledge at risk of fading" },
    );
  }

  function handleExport() {
    downloadCsv(`training-plan-${selectedVenueName ?? "venue"}.csv`, [
      ["Staff", "Role", "Gap", "Priority", "Reason", "Action"],
      ...predictions.map((p) => [p.staffName, p.role, p.gap, p.risk, p.reason, p.action]),
    ]);
  }

  return (
    <div className="mc-page">
      <PageHead
        title="Training Gaps"
        description="Who is ready to work a shift, and which gaps are wide enough to need training for the whole venue."
        actions={predictions.length > 0 ? <ExportButton label="Export training plan" onClick={handleExport} /> : undefined}
      />

      <StatRow items={stats} />

      {predictions.length === 0 ? (
        <Panel>
          <EmptyState copy="No training gaps found." subCopy="Every staff member is above the thresholds. This page updates as new staff join and scores change." />
        </Panel>
      ) : (
        <>
          {topGaps.length > 0 && (
            <Panel title="Shared by several staff" description="A gap that shows up across the team usually needs a venue-wide session, not one-to-one coaching." flush>
              <ul className="mc-rows">
                {topGaps.map(([gap, info]) => (
                  <li key={gap} className="mc-row">
                    <span className="mc-row-main mc-row-title">{gap}</span>
                    <span className="mc-row-value">{info.count} staff</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="By person" aside={<span className="mc-panel-count">{flaggedNames.length} {flaggedNames.length === 1 ? "person" : "people"}</span>} flush>
            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Staff member</th>
                    <th>Gap</th>
                    <th>Why it was flagged</th>
                    <th>Priority</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedNames.flatMap((name) => {
                    const flags = predictions.filter((p) => p.staffName === name);
                    const member = venueStaff.find((s) => s.name === name);
                    return flags.map((flag, index) => (
                      <tr key={flag.id}>
                        {index === 0 && (
                          <td rowSpan={flags.length} style={{ verticalAlign: "top" }}>
                            <div className="mc-row-title">{name}</div>
                            <div className="mc-row-meta">{member?.role ?? "Staff"}</div>
                          </td>
                        )}
                        <td className="is-main" style={index === 0 ? undefined : { paddingLeft: 16 }}>{flag.gap}</td>
                        <td className="is-soft" style={{ minWidth: 240 }}>{flag.reason}</td>
                        <td>{flag.risk === "high" ? <StatusText tone="warn">High</StatusText> : <StatusText>Watch</StatusText>}</td>
                        <td className="is-num">
                          <button type="button" className="mc-link" onClick={() => handleSectionChange("staff")}>{flag.action}</button>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
