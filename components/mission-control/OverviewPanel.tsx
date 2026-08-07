"use client";

import type { ManagementSnapshot, ManagerSection, StaffMember } from "@/lib/management/types";
import { rsaStatus } from "./compliance/helpers";
import { StaffReadinessBoard } from "./StaffReadinessBoard";
import { KpiStrip, type KpiItem } from "./KpiStrip";
import { RevenueAreaChart } from "./RevenueAreaChart";
import { WorkspaceHeader } from "@/app/management/dashboard/_components/WorkspaceHeader";
import { formatPercent } from "./manager-ui";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap, line-count reduction toward the 3,200-line target). Covers the
// Overview tab: compact header, compliance banners, KPI strip, revenue
// projection banner, shift readiness board, operational alerts / needs
// attention / AI coaching queue columns, and the venue health / training
// pillar / compliance summary row.
//
// Pure presentational — every value here is already computed by the parent
// (metrics, operationalAlerts, coachingQueue, etc.) and passed down as
// props; no new data-fetching.

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

export interface OverviewOperationalAlert {
  title: string;
  detail: string;
  actionLabel: string;
  // null when the target section is an unbuilt placeholder (e.g. Scenario
  // Builder, Inventory) — the CTA is suppressed rather than click-through
  // to an EmptyState "coming soon" page.
  section: ManagerSection | null;
}

export interface OverviewCoachingItem {
  staff: StaffMember;
  reason: string;
  moduleTag: string;
}

export interface OverviewPanelProps {
  selectedVenueName: string | undefined;
  todayDateStr: string;
  attentionCount: number;
  metrics: OverviewMetrics;
  venueStaff: ManagementSnapshot["staff"];
  venuePrograms: ManagementSnapshot["trainingPrograms"];
  venueInventory: ManagementSnapshot["inventory"];
  todaySnapshot: { staffActive: number; scenariosCompleted: number; salesImpact: number };
  operationalAlerts: OverviewOperationalAlert[];
  needsAttention: ManagementSnapshot["staff"];
  inactiveCount: number;
  coachingQueue: OverviewCoachingItem[];
  revenueTransactionValue: number;
  handleSectionChange: (section: ManagerSection) => void;
  handleExportStaff: () => void;
}

// Deterministic mock sparkline shape, seeded off the final value — moved
// here from ManagerControlCenter.tsx, this was the KPI strip's only caller.
function mgrMockSpark(finalValue: number, len = 10): number[] {
  if (!finalValue) return Array(len).fill(0) as number[];
  const clamp = Math.max(2, Math.min(98, finalValue));
  return Array.from({ length: len }, (_, i) => {
    const prog = i / (len - 1);
    const base = clamp * (0.6 + prog * 0.4);
    const noise = ((i * 7 + Math.round(clamp) * 3) % 9) - 4;
    return Math.max(0, Math.min(100, Math.round(base + noise)));
  });
}

export function OverviewPanel({
  selectedVenueName,
  todayDateStr,
  attentionCount,
  metrics,
  venueStaff,
  venuePrograms,
  venueInventory,
  todaySnapshot,
  operationalAlerts,
  needsAttention,
  inactiveCount,
  coachingQueue,
  revenueTransactionValue,
  handleSectionChange,
  handleExportStaff,
}: OverviewPanelProps) {
  return (
    <div className="mcc-overview-shell">
      {/* ── Main scrollable content ── */}
      <div className="mcc-overview-main">

        {/* ── Compact workspace header ── */}
        <div style={{ padding: "20px 28px 0" }}>
          <WorkspaceHeader
            title={selectedVenueName ?? "Your Venue"}
            description={`${todayDateStr} · ${attentionCount > 0 ? `${attentionCount} ${attentionCount === 1 ? "thing needs" : "things need"} attention` : "All systems operational"}`}
            actions={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className="ops-health-chip"
                  data-health={
                    metrics.venueHealthScore >= 75
                      ? "good"
                      : metrics.venueHealthScore >= 50
                      ? "warn"
                      : "critical"
                  }
                  title={`Venue Health ${metrics.venueHealthScore}/100 — Service quality ${metrics.serviceSkill}% (40%) · Sales performance ${metrics.salesSkill}% (30%) · Product knowledge ${metrics.productSkill}% (30%)`}
                >
                  Venue Health: {metrics.venueHealthScore}/100
                </div>
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

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ZONE 1: THE PULSE — Instant baseline verification */}
        {/* ══════════════════════════════════════════════════════════════════════ */}

        {/* ── KPI strip ── */}
        <div>
          {(() => {
            const onTrackCount = venueStaff.filter((m) => m.status === "on-track").length;

            const kpiItems: KpiItem[] = [
              {
                label: "Avg scenario score",
                value: formatPercent(metrics.avgScenarioScore),
                sub: "Service · sales · product",
                data: mgrMockSpark(metrics.avgScenarioScore),
                accent: "var(--green-mid)",
                },
              {
                label: "Training completion",
                value: formatPercent(metrics.avgCompletion),
                sub: "Across all modules",
                data: mgrMockSpark(metrics.avgCompletion),
                accent: "var(--status-warn)",
              },
              {
                label: "Upsell performance",
                value: formatPercent(metrics.salesSkill),
                sub: "Last 7 days",
                data: mgrMockSpark(metrics.salesSkill),
                accent: "var(--status-error)",
              },
              {
                label: "Staff health",
                value: `${onTrackCount} active`,
                sub: `${venueStaff.length} total · ${venueStaff.filter((m) => m.status === "attention").length} at risk · ${venueStaff.filter((m) => m.status === "inactive").length} inactive`,
                data: mgrMockSpark(0.75),
                accent: "var(--green-mid)",
              },
            ];

            return <KpiStrip items={kpiItems} />;
          })()}
        </div>

        {/* ── 30-Day Revenue Impact Projection Banner ── */}
        <section style={{ padding: "16px 28px" }}>
          {(() => {
            const completionRate = metrics.avgCompletion;
            const targetCompletion = Math.min(100, completionRate + 20);
            const staffCount = venueStaff.length || 1;
            const avgCheckSize = revenueTransactionValue;
            const weeklyBaselineCheck = staffCount * 5 * avgCheckSize * (completionRate / 100);
            const weeklyProjectedChecks = staffCount * 5 * avgCheckSize * (targetCompletion / 100);
            const weeklyIncrement = Math.round(weeklyProjectedChecks - weeklyBaselineCheck);

            return (
              <div style={{
                background: 'var(--gold-light)',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'var(--text)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <div>
                  <strong>30-Day Revenue Impact Projection</strong>
                  <p style={{ margin: '6px 0 0 0', color: 'var(--text-soft)' }}>
                    Increasing your team&apos;s scenario training completion to {targetCompletion.toFixed(0)}% is projected to drive an additional <strong style={{ color: 'var(--green)' }}>${weeklyIncrement.toLocaleString()}</strong> in weekly revenue through active-recall upselling modules.
                  </p>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ZONE 2: THE SHIFT — Operational visibility (33/67 split) */}
        {/* ══════════════════════════════════════════════════════════════════════ */}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", padding: "16px 28px 0" }}>

          {/* Left Column (33%): Upcoming shifts */}
          <div className="mcc-card">
            <div className="mcc-card-h">
              <h2>Upcoming shifts</h2>
              <span className="mcc-card-meta">Today</span>
            </div>
            <ul className="ops-shifts-list">
              <li className="ops-shift-row">
                <span className="ops-shift-time">08:00</span>
                <span className="ops-shift-label">Morning Prep · Kitchen</span>
              </li>
              <li className="ops-shift-row">
                <span className="ops-shift-time">11:00</span>
                <span className="ops-shift-label">Full Service · Floor</span>
              </li>
              <li className="ops-shift-row">
                <span className="ops-shift-time">12:00</span>
                <span className="ops-shift-label">Matinee Team · Bar</span>
              </li>
              <li className="ops-shift-row">
                <span className="ops-shift-time">17:00</span>
                <span className="ops-shift-label">Evening Service · All</span>
              </li>
            </ul>
            <button
              type="button"
              className="sbe-button-outline sbe-button-outline--sm"
              style={{ marginTop: 12 }}
              onClick={() => handleSectionChange("settings")}
            >
              Manage shifts →
            </button>
          </div>

          {/* Right Column (67%): Tonight's Shift Readiness — traffic-light board */}
          <div className="mcc-scorecard-card" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <div className="mcc-scorecard-header">
              <span>Tonight&apos;s Shift Readiness</span>
              <span
                className="mcc-rf-badge"
                style={{
                  background:
                    metrics.rfScore >= 75
                      ? 'var(--status-good-bg)'
                      : metrics.rfScore >= 50
                      ? 'var(--status-warn-bg)'
                      : 'var(--status-error-bg)',
                  color:
                    metrics.rfScore >= 75
                      ? 'var(--status-good-text)'
                      : metrics.rfScore >= 50
                      ? 'var(--status-warn-text)'
                      : 'var(--status-error-text)',
                }}
              >
                {metrics.rfScore}%
              </span>
            </div>
            <StaffReadinessBoard staff={venueStaff} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ZONE 3: THE ACTIONABLES — Exception management (3-column equal) */}
        {/* ══════════════════════════════════════════════════════════════════════ */}

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px", padding: "16px 28px 0" }}>

          {/* Column 1: Operational alerts — merged with per-staff "needs attention"
              items (Phase 5 UX Refinement Pass) so every alert, system-level or
              staff-level, lives in one card with one consistent CTA button
              pattern instead of a separate bare bullet-list card. */}
          <div className="mcc-card">
            <div className="mcc-card-h">
              <h2>Operational alerts</h2>
              <span className="mcc-card-meta">{operationalAlerts.length + Math.min(needsAttention.length, 5)} active</span>
            </div>
            <div style={{ padding: 4 }}>
              {operationalAlerts.map((alert) => {
                const isTraining = alert.title === "Training risk";
                const isUpsell = alert.title === "Upsell performance";
                const isInventory = alert.title === "Inventory intelligence";
                const tone = isInventory ? "info" : (isTraining && needsAttention.length === 0) || (!isTraining && !isUpsell && inactiveCount === 0) ? "good" : "warn";
                const iconChar = isTraining ? "◆" : isUpsell ? "→" : isInventory ? "≡" : "◉";
                return (
                  <div key={alert.title} className="mcc-alert-item">
                    <div className={`mcc-alert-icon ${tone}`}>{iconChar}</div>
                    <div>
                      <div className="mcc-alert-title">{alert.title}</div>
                      <div className="mcc-alert-desc">{alert.detail}</div>
                    </div>
                    {alert.section && (
                      <button type="button" className="sbe-button-outline sbe-button-outline--sm" onClick={() => handleSectionChange(alert.section as ManagerSection)}>
                        {alert.actionLabel} →
                      </button>
                    )}
                  </div>
                );
              })}
              {needsAttention.length > 0 && (
                <>
                  <div style={{ padding: "10px 12px 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderTop: "1px solid var(--line-light)", marginTop: 4 }}>
                    Staff needing attention
                  </div>
                  {needsAttention.slice(0, 5).map((member) => (
                    <div key={member.id} className="mcc-alert-item">
                      <div className={`mcc-alert-icon ${member.status === "inactive" ? "bad" : "warn"}`}>◉</div>
                      <div>
                        <div className="mcc-alert-title">{member.name}</div>
                        <div className="mcc-alert-desc">
                          {member.status === "attention" ? `Needs attention · ${parseFloat(member.progress.toFixed(0))}% complete` : "Not started"}
                        </div>
                      </div>
                      <button type="button" className="sbe-button-outline sbe-button-outline--sm" onClick={() => handleSectionChange("staff")}>
                        Review →
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Column 2: AI Coaching Queue */}
          <div className="mcc-card">
            <div className="mcc-card-h">
              <h2>AI Coaching Queue</h2>
              <span className="mcc-card-meta">{coachingQueue.length} to coach</span>
            </div>
            <div style={{ padding: 4 }}>
              {coachingQueue.length > 0 ? (
                coachingQueue.slice(0, 3).map((item) => (
                  <div
                    key={item.staff.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--line-light)',
                      fontSize: '13px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: item.staff.status === 'attention' ? 'var(--status-amber-bg)' : 'var(--status-critical-bg)',
                        color: item.staff.status === 'attention' ? 'var(--status-orange)' : 'var(--status-critical-text)',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {item.staff.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: '2px', fontSize: '12px' }}>
                        {item.staff.name}
                      </div>
                      <div style={{ color: 'var(--text-soft)', fontSize: '11px' }}>
                        {item.reason}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  All staff are on track. Great work!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ZONE 4: THE DEEP DIVE — Long-term trends & macro health */}
        {/* ══════════════════════════════════════════════════════════════════════ */}

        {/* Training progression chart (full width, tightened) */}
        <div className="mcc-overview-card" style={{ margin: "16px 28px 0", minHeight: "auto" }}>
          <div className="mcc-overview-card-head">Training progression, 14 days</div>
          <div style={{ padding: "12px 0" }}>
            <RevenueAreaChart trainingValue={metrics.avgCompletion} />
          </div>
        </div>

        {/* Balanced layout: Venue health + Training pillars + Compliance */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", padding: "16px 28px 0 28px", paddingBottom: "20px" }}>

          {/* Column 1: Venue health */}
          <div className="mcc-overview-card">
            <div className="mcc-overview-card-head">Venue health</div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                  {metrics.venueHealthScore > 0 ? metrics.venueHealthScore : "–"}
                </div>
                {metrics.venueHealthScore > 0 && <span style={{ fontSize: 16, color: "var(--text-muted)" }}>/100</span>}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>Composite training &amp; performance index</div>
              {([
                ["Service", metrics.serviceSkill, "var(--green-mid)"],
                ["Sales",   metrics.salesSkill,   "var(--status-warn)"],
                ["Product", metrics.productSkill, "var(--status-error)"],
              ] as [string, number, string][]).map(([k, v, c]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-soft)", marginBottom: 4 }}>
                    <span>{k}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{v > 0 ? `${v}%` : "–"}</span>
                  </div>
                  <div className="mcc-bar">
                    <div className="mcc-bar-fill" style={{ width: `${v}%`, background: c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Training completion by pillar */}
          <div className="mcc-overview-card">
            <div className="mcc-overview-card-head">Training completion by pillar</div>
            <div style={{ padding: "16px 20px" }}>
              {[
                { name: "Bartending",     val: metrics.productSkill, color: "var(--status-error)" },
                { name: "Sales",          val: metrics.salesSkill, color: "var(--status-warn)" },
                { name: "Management",     val: venuePrograms.length ? Math.round(venuePrograms.reduce((s, p) => s + p.completion, 0) / venuePrograms.length) : 0, color: "var(--gold-deep)" },
                { name: "Menu Knowledge", val: venueInventory.length ? Math.min(Math.round(venueInventory.reduce((s, i) => s + i.products.length, 0) / Math.max(venueInventory.length, 1) / 5 * 100), 100) : 0, color: "var(--green-mid)" },
                { name: "Service",        val: metrics.serviceSkill, color: "var(--green-mid)" },
                { name: "Scenarios",      val: Math.min(Math.ceil(todaySnapshot.scenariosCompleted / 10 * 100), 100), color: "var(--status-info)" },
              ].map((p) => (
                <div key={p.name} className="mcc-pillar-row">
                  <div className="mcc-pillar-name">{p.name}</div>
                  <div className="mcc-bar">
                    <div className="mcc-bar-fill" style={{ width: `${p.val}%`, background: p.color }} />
                  </div>
                  <div className="mcc-pillar-pct">{p.val}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Compliance */}
          <div className="mcc-overview-card">
            <div className="mcc-overview-card-head">Compliance</div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>
                {metrics.avgCompletion > 0 ? `${Math.min(100, metrics.avgCompletion)}%` : "–"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>Service standards assessment</div>
              {(() => {
                const rsaCertified = venueStaff.filter(s => rsaStatus(s.compliance).level <= 1).length;
                const foodSafety = venueStaff.filter(s => s.compliance?.fssExpiryDate && new Date(s.compliance.fssExpiryDate) > new Date()).length;
                const serviceReady = venueStaff.filter(s => s.status === "on-track").length;
                return ([
                  ["RSA certified",     `${rsaCertified} / ${venueStaff.length || "–"}`, rsaCertified === venueStaff.length ? "good" : rsaCertified > 0 ? "warn" : "alert"],
                  ["Food safety",       `${foodSafety} / ${venueStaff.length || "–"}`, foodSafety === venueStaff.length ? "good" : foodSafety > 0 ? "warn" : "alert"],
                  ["Service protocols", `${serviceReady} / ${venueStaff.length || "–"}`, needsAttention.length > 0 ? "warn" : "good"],
                  ["Sign-off pending",  `${needsAttention.length} staff`, needsAttention.length > 0 ? "warn" : "good"],
                ] as [string, string, string][]).map(([k, v, tone], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? "1px dashed var(--line-light)" : "none", fontSize: 12 }}>
                    <span style={{ color: "var(--text-soft)" }}>{k}</span>
                    <span className={`mcc-pill mcc-pill-${tone}`} style={{ fontSize: 10 }}>{v}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
