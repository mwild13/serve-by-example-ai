"use client";

import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { rsaStatus } from "./compliance/helpers";
import { OverviewKpiStrip, type OverviewKpi } from "./OverviewKpiStrip";
import { LearningActivityChart } from "./LearningActivityChart";
import { NeedsAttentionCard } from "./NeedsAttentionCard";
import { SkillGapsSummaryCard } from "./SkillGapsSummaryCard";
import { RoleQualificationCard } from "./RoleQualificationCard";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap). Covers the Overview tab — the Figma "Venue Manager Dashboard"
// port: strictly the compliance banners, the 4-card KPI strip, and the
// 60/40 grid (Learning Activity + Needs Attention on the left; Predictive
// Skill Gaps + Role Qualification Progress on the right).
//
// The page-level "{venue} · {date} · N things need attention" sub-header
// and its "View roster →" / "Export →" actions have been removed — the
// venue name + switcher already lives permanently in the sticky
// ManagementTopbar above this panel, so repeating it here was a duplicate
// title bar. The attention count is still surfaced honestly via the
// NeedsAttentionCard's "N flagged" badge and the Confidence Mismatch KPI
// card, not fabricated a second time. "Export →" moved to the Staff
// Directory tab's own header, next to the role filter, since that's where
// staff records actually live.
//
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
      <div className="mcc-overview-main" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>

        {/* ── Level 1 Compliance Banner (30-day warning) ── */}
        {venueStaff.some(s => rsaStatus(s.compliance).level === 1) && (
          <div style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', color: 'var(--text)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.85rem' }}>
            Compliance reminder: {venueStaff.filter(s => rsaStatus(s.compliance).level === 1).length} staff member{venueStaff.filter(s => rsaStatus(s.compliance).level === 1).length > 1 ? 's have' : ' has'} RSA certifications expiring within 30 days. Plan renewals early.
          </div>
        )}

        {/* ── Level 2 Compliance Banner (7-day alert) ── */}
        {venueStaff.some(s => rsaStatus(s.compliance).level >= 2) && (
          <div style={{ background: 'var(--status-error-bg)', border: '1px solid var(--status-error)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontWeight: 600, fontSize: '0.92rem' }}>
            Compliance alert: one or more staff have certifications expiring within 7 days. Review the Compliance tab immediately.
          </div>
        )}

        {/* ── KPI strip (Figma: Shift Readiness / RSA·FSS / Confidence / Mastery) ── */}
        <OverviewKpiStrip items={kpis} onNav={handleSectionChange} />

        {/* ── 60/40 grid: Learning Activity + Needs Attention | Skill Gaps + Role Qualification ── */}
        <div className="mc-overview-grid">
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
