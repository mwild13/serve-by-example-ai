"use client";

import type { ManagementSnapshot } from "@/lib/management/types";
import { parseLastActiveDays } from "@/lib/management/needs-attention";

// "Team activity" on the Overview tab: how recently each person last
// trained, grouped into five bands. Built from each staff member's
// last-active date, which is the only activity history the app stores, so
// every number is a real head count. It replaced a weekday bar chart that
// spread one average across seven days with a formula.

const BANDS = ["Today", "Earlier this week", "7 to 30 days ago", "Over 30 days ago", "Not started"] as const;

function bandFor(lastActive: string): number {
  if (lastActive === "Not started") return 4;
  // An unreadable timestamp counts as this week, matching wasActiveWithinDays().
  const days = parseLastActiveDays(lastActive) ?? 1;
  if (days === 0) return 0;
  if (days < 7) return 1;
  if (days <= 30) return 2;
  return 3;
}

export function TeamActivityCard({ venueStaff }: { venueStaff: ManagementSnapshot["staff"] }) {
  const counts = BANDS.map(() => 0);
  for (const member of venueStaff) counts[bandFor(member.lastActive)] += 1;
  const total = venueStaff.length;

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Team activity</p>
          <p className="mc-panel-desc">When each person last trained</p>
        </div>
        <span className="mc-panel-count">{total} staff</span>
      </div>
      <div className="mc-panel-body">
        {total === 0 ? (
          <p className="mc-panel-empty">Add staff to see who is training.</p>
        ) : (
          <ul className="mc-activity-list">
            {BANDS.map((band, i) => (
              <li key={band} className="mc-activity-row">
                <span className="mc-activity-label">{band}</span>
                <span className="mc-progress-track" aria-hidden="true">
                  <span className="mc-progress-fill" style={{ width: `${(counts[i] / total) * 100}%` }} />
                </span>
                <span className="mc-activity-count">{counts[i]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
