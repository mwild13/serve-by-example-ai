"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { rsaStatus } from "./compliance/helpers";
import { WorkspaceHeader } from "@/app/management/dashboard/_components/WorkspaceHeader";
import { OverviewKpiStrip, type OverviewKpi } from "./OverviewKpiStrip";
import { LearningActivityChart } from "./LearningActivityChart";
import { NeedsAttentionCard } from "./NeedsAttentionCard";
import { SkillGapsSummaryCard } from "./SkillGapsSummaryCard";
import { RoleQualificationCard } from "./RoleQualificationCard";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap). Covers the Overview tab — the Figma "Venue Manager Dashboard"
// port: compact header + compliance banners, then strictly the 4-card KPI
// strip and the 60/40 grid (Learning Activity + Needs Attention on the
// left; Predictive Skill Gaps + Role Qualification Progress on the right).
// Everything from the pre-redesign Overview that isn't part of that grid —
// the old sparkline KPI strip, "Upcoming shifts" (static hardcoded
// content), the full shift-readiness board, the merged operational-alerts/
// AI-coaching-queue row, the 14-day training-progression chart, and the
// Venue health / pillar-breakdown / compliance-summary row — has been
// removed rather than kept alongside the new grid, per the redesign brief.
// The RSA compliance banners are kept: they're live legal/safety alerts
// (7-day and 30-day expiry warnings), not a duplicate "overview" card.
//
// Pure presentational — every value here is already computed by the parent
// (metrics, needsAttention, venueStaff) and passed down as props; no new
// data-fetching, no hardcoded identities.

export interface OverviewMetrics {
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
  selectedVenueName: string | undefined;
  todayDateStr: string;
  attentionCount: number;
  metrics: OverviewMetrics;
  venueStaff: ManagementSnapshot["staff"];
  needsAttention: ManagementSnapshot["staff"];
  handleSectionChange: (section: ManagerSection) => void;
  handleExportStaff: () => void;
  onOpenCoachingDrawer: (staffId: string) => void;
}

export function OverviewPanel({
  selectedVenueName,
  todayDateStr,
  attentionCount,
  metrics,
  venueStaff,
  needsAttention,
  handleSectionChange,
  handleExportStaff,
  onOpenCoachingDrawer,
}: OverviewPanelProps) {
  // ── KPI strip data (Figma: Shift Readiness / RSA·FSS / Confidence / Mastery) ──
  const clearedCount = venueStaff.filter((s) => rsaStatus(s.compliance).level !== 3 && s.status !== "inactive").length;
  const rsaExpiredCount = venueStaff.filter((s) => rsaStatus(s.compliance).level === 3).length;
  const rsaExpiringCount = venueStaff.filter((s) => {
    const level = rsaStatus(s.compliance).level;
    return level === 1 || level === 2;
  }).length;
  const confidenceMismatchCount = venueStaff.filter(
    (s) => s.highConfidenceIncorrectRatio != null && s.highConfidenceIncorrectRatio > 0.3,
  ).length;

  const kpis: OverviewKpi[] = [
    {
      label: "Shift Readiness Score",
      abbr: "Rf",
      abbrColor: metrics.rfScore >= 75 ? "var(--mc-green)" : "var(--mc-terracotta)",
      abbrBg: metrics.rfScore >= 75 ? "var(--mc-green-bg)" : "var(--mc-terracotta-bg)",
      value: `${metrics.rfScore}%`,
      valueColor: metrics.rfScore >= 75 ? "var(--mc-green)" : "var(--mc-terracotta)",
      sub: `${clearedCount}/${venueStaff.length || 0} rostered staff cleared for tonight`,
      section: "staff",
    },
    {
      label: "Legal RSA / FSS Status",
      abbr: "RSA",
      abbrColor: "var(--mc-terracotta)",
      abbrBg: "var(--mc-amber-bg)",
      pills: [
        { label: `${rsaExpiredCount} Expired`, color: rsaExpiredCount > 0 ? "var(--mc-terracotta)" : "var(--mc-green-text)", bg: rsaExpiredCount > 0 ? "var(--mc-terracotta-bg)" : "var(--mc-green-bg)" },
        { label: `${rsaExpiringCount} Expiring <30d`, color: "var(--mc-amber-text)", bg: "var(--mc-amber-bg)" },
      ],
      sub: "Responsible Service of Alcohol",
      section: "compliance",
    },
    {
      label: "Confidence Mismatch Alert",
      abbr: "CM",
      abbrColor: "var(--mc-terracotta)",
      abbrBg: "var(--mc-terracotta-bg)",
      value: `${confidenceMismatchCount}`,
      valueColor: confidenceMismatchCount > 0 ? "var(--mc-terracotta)" : "var(--mc-text)",
      sub: "Staff confident & incorrect",
      section: "predictive",
    },
    {
      label: "Average Mastery Score",
      abbr: "Ms",
      abbrColor: "var(--mc-green-text)",
      abbrBg: "var(--mc-green-bg)",
      value: `${metrics.avgScenarioScore}%`,
      valueColor: "var(--mc-green)",
      sub: "Across all active assessments",
      section: "analytics",
    },
  ];

  return (
    <div className="mcc-overview-shell">
      <div className="mcc-overview-main">

        {/* ── Compact workspace header ── */}
        <div style={{ padding: "20px 28px 0" }}>
          <WorkspaceHeader
            title={selectedVenueName ?? "Your Venue"}
            description={`${todayDateStr} · ${attentionCount > 0 ? `${attentionCount} ${attentionCount === 1 ? "thing needs" : "things need"} attention` : "All systems operational"}`}
            actions={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  className="sbe-button-outline sbe-button-outline--sm"
                  onClick={() => handleSectionChange("staff")}
                >
                  View roster →
                </button>
                <button
                  type="button"
                  className="sbe-button-outline sbe-button-outline--sm"
                  onClick={handleExportStaff}
                >
                  Export →
                </button>
              </div>
            }
          />
        </div>

        {/* ── Level 1 Compliance Banner (30-day warning) ── */}
        {venueStaff.some(s => rsaStatus(s.compliance).level === 1) && (
          <div style={{ padding: "12px 28px 0 28px" }}>
            <div style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', color: 'var(--text)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.9rem' }}>
              Compliance reminder: {venueStaff.filter(s => rsaStatus(s.compliance).level === 1).length} staff member{venueStaff.filter(s => rsaStatus(s.compliance).level === 1).length > 1 ? 's have' : ' has'} RSA certifications expiring within 30 days. Plan renewals early.
            </div>
          </div>
        )}

        {/* ── Level 2 Compliance Banner (7-day alert) ── */}
        {venueStaff.some(s => rsaStatus(s.compliance).level >= 2) && (
          <div style={{ padding: "12px 28px 0 28px" }}>
            <div style={{ background: 'var(--status-error-bg)', border: '1px solid var(--status-error)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, fontWeight: 600, fontSize: '1rem' }}>
              Compliance alert: one or more staff have certifications expiring within 7 days. Review the Compliance tab immediately.
            </div>
          </div>
        )}

        {/* ── KPI strip (Figma: Shift Readiness / RSA·FSS / Confidence / Mastery) ── */}
        <div style={{ padding: "16px 28px 0" }}>
          <OverviewKpiStrip items={kpis} onNav={handleSectionChange} />
        </div>

        {/* ── 60/40 grid: Learning Activity + Needs Attention | Skill Gaps + Role Qualification ── */}
        <div className="mc-overview-grid" style={{ padding: "16px 28px 20px" }}>
          <div className="mc-col">
            <div className="mc-panel">
              <div className="mc-panel-head">
                <div>
                  <p className="mc-panel-title">Learning Activity</p>
                  <p className="mc-panel-desc">Training completion trend, last 7 days</p>
                </div>
              </div>
              <div className="mc-panel-body">
                <LearningActivityChart trainingValue={metrics.avgCompletion} />
              </div>
            </div>

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
