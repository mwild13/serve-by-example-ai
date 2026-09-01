"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { EmptyState } from "@/components/mission-control/manager-ui";
import { computeSkillGapFlags, groupSkillGapsByCategory, countShiftReadyStaff } from "@/lib/management/skill-gaps";

// Condensed "Training Bottlenecks" card for the Overview tab (Figma).
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

  const riskStyle: Record<"high" | "medium", { bg: string; text: string; label: string }> = {
    high: { bg: "var(--mc-terracotta-bg)", text: "var(--mc-terracotta)", label: "High" },
    medium: { bg: "var(--mc-amber-bg)", text: "var(--mc-amber-text)", label: "Medium" },
  };

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Training Bottlenecks</p>
          <p className="mc-panel-desc">{shiftReadyCount} / {venueStaff.length} staff shift-ready · based on assessment patterns &amp; confidence signals</p>
        </div>
      </div>
      <div className="mc-panel-body">
        {topGaps.length === 0 ? (
          <EmptyState copy="No skill gaps detected — all staff on track." />
        ) : (
          topGaps.map(([gap, info]) => {
            const rc = riskStyle[info.risk];
            return (
              <div key={gap} className="mc-gap-row">
                <div>
                  <div className="mc-gap-name">{gap}</div>
                  <div className="mc-gap-meta">{info.count} staff affected</div>
                </div>
                <span className="mc-gap-risk" style={{ background: rc.bg, color: rc.text }}>{rc.label}</span>
              </div>
            );
          })
        )}
        <button
          type="button"
          className="sbe-button-outline sbe-button-outline--sm"
          style={{ marginTop: 14 }}
          onClick={() => handleSectionChange("predictive")}
        >
          View full analysis →
        </button>
      </div>
    </div>
  );
}
