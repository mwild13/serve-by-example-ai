"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { EmptyState } from "@/components/mission-control/manager-ui";
import { computeSkillGapFlags, groupSkillGapsByCategory, countShiftReadyStaff } from "@/lib/management/skill-gaps";

// Condensed "Training gaps" card for the Overview tab.
// Uses the identical flagging rules as PredictivePanel.tsx's full tab
// (lib/management/skill-gaps.ts — score thresholds, knowledge decay,
// confidence mismatch) — this is a top-4 rollup of the same real per-staff
// flags, not a separate mock list. No week-over-week trend arrows are
// shown: the data model doesn't persist historical snapshots, so a trend
// direction can't be computed honestly.

export function SkillGapsSummaryCard({
  venueStaff,
  handleSectionChange,
}: {
  venueStaff: ManagementSnapshot["staff"];
  handleSectionChange: (section: ManagerSection) => void;
}) {
  const flags = computeSkillGapFlags(venueStaff);
  const topGaps = groupSkillGapsByCategory(flags).slice(0, 4);
  const shiftReadyCount = countShiftReadyStaff(venueStaff, flags);

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Training gaps</p>
          <p className="mc-panel-desc">{shiftReadyCount} of {venueStaff.length} staff are shift-ready</p>
        </div>
      </div>
      <div className="mc-panel-body">
        {topGaps.length === 0 ? (
          <EmptyState copy="No training gaps. Everyone is on track." />
        ) : (
          topGaps.map(([gap, info]) => (
            <div key={gap} className="mc-gap-row">
              <div>
                <div className="mc-gap-name">{gap}</div>
                <div className="mc-gap-meta">{info.count} staff affected</div>
              </div>
              <span className={`mc-gap-risk${info.risk === "high" ? " is-high" : ""}`}>
                {info.risk === "high" ? "High priority" : "Medium"}
              </span>
            </div>
          ))
        )}
        <button
          type="button"
          className="mc-panel-action"
          onClick={() => handleSectionChange("predictive")}
        >
          View all training gaps
        </button>
      </div>
    </div>
  );
}
