"use client";

import type { ManagementSnapshot } from "@/lib/management/types";
import { rsaStatus } from "./compliance/helpers";

// "Qualifications" card on the Overview tab. Each row maps to a
// qualification the app genuinely records: RSA compliance, food-safety (FSS) currency, service readiness
// (on-track status), and overall training completion.

export function RoleQualificationCard({
  venueStaff,
  avgCompletion,
}: {
  venueStaff: ManagementSnapshot["staff"];
  avgCompletion: number;
}) {
  const total = venueStaff.length || 1;
  // A current RSA means a date on file that has not passed. Staff with no
  // date recorded are not counted as certified.
  const rsaCertified = venueStaff.filter((s) => s.compliance?.rsaExpiryDate && rsaStatus(s.compliance).level !== 3).length;
  const foodSafety = venueStaff.filter((s) => s.compliance?.fssExpiryDate && new Date(s.compliance.fssExpiryDate) > new Date()).length;
  const serviceReady = venueStaff.filter((s) => s.status === "on-track").length;

  const rows = [
    { label: "RSA (Responsible Service of Alcohol)", certified: rsaCertified, total: venueStaff.length },
    { label: "Food Safety Supervisor", certified: foodSafety, total: venueStaff.length },
    { label: "On track in training", certified: serviceReady, total: venueStaff.length },
    { label: "Training completed", certified: Math.round((avgCompletion / 100) * total), total: venueStaff.length },
  ];

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Qualifications</p>
          <p className="mc-panel-desc">How much of the team holds each one</p>
        </div>
      </div>
      <div className="mc-panel-body">
        {rows.map((row) => {
          const pct = row.total > 0 ? Math.round((row.certified / row.total) * 100) : 0;
          return (
            <div key={row.label} className="mc-qual-row">
              <div className="mc-qual-head">
                <span className="mc-qual-label">{row.label}</span>
                <div className="mc-qual-figures">
                  <span className="mc-qual-count">{row.total > 0 ? `${row.certified} of ${row.total}` : "No staff"}</span>
                  <span className="mc-qual-pct">
                    {row.total > 0 ? `${pct}%` : ""}
                  </span>
                </div>
              </div>
              <div className="mc-progress-track">
                <div className="mc-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
