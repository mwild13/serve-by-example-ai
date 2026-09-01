"use client";

import type { ManagementSnapshot, StaffMember } from "@/lib/management/types";
import { EmptyState } from "@/components/mission-control/manager-ui";

// Figma "Needs Attention" roster card — replaces the old Overview zone that
// mixed system-level alerts with per-staff rows. This is per-staff only:
// the same `needsAttention` list ManagerControlCenter already computes
// (onboarding stagnation, inactivity, zero progress, non-on-track status),
// rendered as avatar + progress bar + Coach CTA to match the mockup.

export function NeedsAttentionCard({
  staff,
  onCoach,
}: {
  staff: ManagementSnapshot["staff"];
  onCoach: (member: StaffMember) => void;
}) {
  // Used to render every flagged staff member, not just the first 2 — the
  // badge above already showed the true "N flagged" count while the list
  // silently dropped everyone past index 1. Now scrollable instead of
  // truncated (.mc-attention-scroll, app/globals.css) so a long list
  // doesn't blow out the card's height past its sibling in .mc-col
  // (RoleQualificationCard.tsx, which always renders exactly 4 rows).
  const rows = staff;

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Needs Attention</p>
          <p className="mc-panel-desc">Staff below readiness threshold or requiring floor coaching</p>
        </div>
        <span className="mc-panel-badge">{staff.length} flagged</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState copy="All staff are on track." />
      ) : (
        <div className="mc-attention-scroll">
          {rows.map((member) => {
            const progress = Math.round(member.progress);
            const barColor = progress === 100 ? "var(--mc-green)" : progress < 50 ? "var(--mc-terracotta)" : "var(--mc-brown)";
            return (
              <div key={member.id} className="mc-attention-row">
                <div className="mc-attention-avatar">{member.name[0]?.toUpperCase() ?? "?"}</div>
                <div className="mc-attention-identity">
                  <div className="mc-attention-name">{member.name}</div>
                  <div className="mc-attention-role">{member.role}</div>
                </div>
                <div className="mc-attention-progress">
                  <div className="mc-attention-progress-row">
                    <span className="mc-attention-progress-label">Readiness</span>
                    <span className="mc-attention-progress-pct" style={{ color: progress < 50 ? "var(--mc-terracotta)" : "var(--mc-text)" }}>{progress}%</span>
                  </div>
                  <div className="mc-progress-track">
                    <div className="mc-progress-fill" style={{ width: `${progress}%`, background: barColor }} />
                  </div>
                </div>
                <button type="button" className="mc-attention-coach-btn" onClick={() => onCoach(member)}>
                  Coach →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
