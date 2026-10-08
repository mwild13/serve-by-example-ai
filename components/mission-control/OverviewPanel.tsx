"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { buildOverviewNotices } from "@/lib/management/notices";
import { fssStatus, rsaStatus } from "./compliance/helpers";
import { OverviewKpiStrip, type OverviewKpi } from "./OverviewKpiStrip";
import { OverviewNoticeReel } from "./OverviewNoticeReel";
import { TeamActivityCard } from "./TeamActivityCard";
import { NeedsAttentionCard } from "./NeedsAttentionCard";
import { SkillGapsSummaryCard } from "./SkillGapsSummaryCard";
import { RoleQualificationCard } from "./RoleQualificationCard";

// The Overview tab, top to bottom: the notice reel, the four-figure strip,
// then a 60/40 grid (Team activity and Needs attention on the left; Training
// gaps and Qualifications on the right).
//
// The venue name is not repeated here: it lives in the sticky
// ManagementTopbar above this panel. Compliance warnings are no longer
// banners: they are the first items in the notice reel, and the RSA and FSS
// figure carries the count.
//
// Pure presentational — every value is computed from props the parent
// already holds (metrics, needsAttention, venueStaff); no data-fetching.

interface OverviewMetrics {
  venueHealthScore: number;
  serviceSkill: number;
  salesSkill: number;
  productSkill: number;
  avgScenarioScore: number;
  avgCompletion: number;
  rfScore: number;
  activeThisWeek: number;
}

export interface OverviewPanelProps {
  metrics: OverviewMetrics;
  venueStaff: ManagementSnapshot["staff"];
  needsAttention: ManagementSnapshot["staff"];
  handleSectionChange: (section: ManagerSection) => void;
  onOpenCoachingDrawer: (staffId: string) => void;
}

export function OverviewPanel({
  metrics,
  venueStaff,
  needsAttention,
  handleSectionChange,
  onOpenCoachingDrawer,
}: OverviewPanelProps) {
  const total = venueStaff.length;
  const clearedCount = venueStaff.filter((s) => rsaStatus(s.compliance).level !== 3 && s.status !== "inactive").length;
  const rsaExpiredCount = venueStaff.filter((s) => rsaStatus(s.compliance).level === 3).length;
  const rsaExpiringCount = venueStaff.filter((s) => {
    const level = rsaStatus(s.compliance).level;
    return level === 1 || level === 2;
  }).length;
  const fssOnFile = venueStaff.filter((s) => s.compliance?.fssExpiryDate).length;
  const fssExpiredCount = venueStaff.filter((s) => fssStatus(s.compliance).level >= 1).length;
  const fssNote = fssOnFile === 0 ? "no FSS on file" : fssExpiredCount > 0 ? `${fssExpiredCount} FSS expired` : "FSS current";

  const kpis: OverviewKpi[] = [
    {
      label: "Shift readiness",
      value: `${metrics.rfScore}%`,
      sub: `${clearedCount} of ${total} staff cleared to work`,
      section: "predictive",
    },
    {
      label: "Average mastery",
      value: `${metrics.avgScenarioScore}%`,
      sub: "Across service, sales and product",
      section: "analytics",
    },
    {
      label: "Trained this week",
      value: `${metrics.activeThisWeek} of ${total}`,
      sub: "Staff active in the last 7 days",
      section: "staff",
    },
    {
      label: "RSA and FSS",
      value: `${rsaExpiredCount} expired`,
      alert: rsaExpiredCount > 0,
      sub: `${rsaExpiringCount} RSA expiring within 30 days, ${fssNote}`,
      section: "compliance",
    },
  ];

  return (
    <div className="mcc-overview-shell">
      <div className="mcc-overview-main mc-overview">
        <OverviewNoticeReel notices={buildOverviewNotices(venueStaff)} onNav={handleSectionChange} />

        <OverviewKpiStrip items={kpis} onNav={handleSectionChange} />

        <div className="mc-overview-grid">
          <div className="mc-col">
            <TeamActivityCard venueStaff={venueStaff} />
            <NeedsAttentionCard
              staff={needsAttention}
              onCoach={(member) => onOpenCoachingDrawer(member.id)}
            />
          </div>

          <div className="mc-col">
            <SkillGapsSummaryCard venueStaff={venueStaff} handleSectionChange={handleSectionChange} />
            <RoleQualificationCard venueStaff={venueStaff} avgCompletion={metrics.avgCompletion} />
          </div>
        </div>
      </div>
    </div>
  );
}
