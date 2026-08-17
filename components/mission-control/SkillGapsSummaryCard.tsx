"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";

// Condensed "Predictive Skill Gaps" card for the Overview tab (Figma).
// Uses the identical flagging rules as PredictivePanel.tsx's full tab
// (score thresholds, knowledge decay, confidence mismatch) — this is a
// top-4 rollup of the same real per-staff flags, not a separate mock list.
// No week-over-week trend arrows are shown: the data model doesn't persist
// historical snapshots, so a trend direction can't be computed honestly.

export function SkillGapsSummaryCard({
  venueStaff,
  handleSectionChange,
}: {
  venueStaff: ManagementSnapshot["staff"];
  handleSectionChange: (section: ManagerSection) => void;
}) {
  type Flag = { gap: string; risk: "high" | "medium" };

  const flags: Flag[] = venueStaff.flatMap((member) => {
    const out: Flag[] = [];
    if (member.salesScore < 70) out.push({ gap: "Upselling & Sales", risk: "high" });
    if (member.serviceScore < 65) out.push({ gap: "Service Quality", risk: "medium" });
    if (member.productScore < 60) out.push({ gap: "Product Knowledge", risk: "medium" });
    if (member.progress < 40 && member.status !== "inactive") out.push({ gap: "Training Completion", risk: "high" });
    if (member.knowledgeDecayRisk) out.push({ gap: "Knowledge Decay", risk: "high" });
    if (member.highConfidenceIncorrectRatio != null && member.highConfidenceIncorrectRatio > 0.3) out.push({ gap: "Confidence Mismatch", risk: "medium" });
    return out;
  });

  const totals = new Map<string, { count: number; risk: "high" | "medium" }>();
  for (const f of flags) {
    const existing = totals.get(f.gap);
    if (existing) {
      existing.count += 1;
      if (f.risk === "high") existing.risk = "high";
    } else {
      totals.set(f.gap, { count: 1, risk: f.risk });
    }
  }
  const topGaps = [...totals.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 4);

  const riskStyle: Record<"high" | "medium", { bg: string; text: string; label: string }> = {
    high: { bg: "var(--mc-terracotta-bg)", text: "var(--mc-terracotta)", label: "High" },
    medium: { bg: "var(--mc-amber-bg)", text: "var(--mc-amber-text)", label: "Medium" },
  };

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Predictive Skill Gaps</p>
          <p className="mc-panel-desc">Based on assessment patterns &amp; confidence signals</p>
        </div>
      </div>
      <div className="mc-panel-body">
        {topGaps.length === 0 ? (
          <div className="mc-gap-empty">No skill gaps detected — all staff on track.</div>
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
