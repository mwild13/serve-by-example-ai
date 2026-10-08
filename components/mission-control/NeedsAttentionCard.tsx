"use client";

import type { ManagementSnapshot, StaffMember } from "@/lib/management/types";
import { EmptyState } from "@/components/mission-control/manager-ui";

// "Needs attention" roster on the Overview tab. Per-staff only: the same
// `needsAttention` list ManagerControlCenter already computes (onboarding
// stagnation, inactivity, zero progress, non-on-track status), one row per
// person with their training completion and a Coach button.

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
          <p className="mc-panel-title">Needs attention</p>
          <p className="mc-panel-desc">Staff who are behind on training or have gone quiet</p>
        </div>
        <span className="mc-panel-count">{staff.length} staff</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState copy="All staff are on track." />
      ) : (
        <div className="mc-attention-scroll">
          {rows.map((member) => {
            const progress = Math.round(member.progress);
            return (
              <div key={member.id} className="mc-attention-row">
                <div className="mc-attention-avatar">{member.name[0]?.toUpperCase() ?? "?"}</div>
                <div className="mc-attention-identity">
                  <div className="mc-attention-name">{member.name}</div>
                  <div className="mc-attention-role">{member.role}</div>
                </div>
                <div className="mc-attention-progress">
                  <div className="mc-attention-progress-row">
                    <span className="mc-attention-progress-label">Training</span>
                    <span className="mc-attention-progress-pct">{progress}%</span>
                  </div>
                  <div className="mc-progress-track">
                    <div className="mc-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <button type="button" className="mc-attention-coach-btn" onClick={() => onCoach(member)}>
                  Coach
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
