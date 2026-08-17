"use client";

import type { ManagementSnapshot } from "@/lib/management/types";
import { rsaStatus } from "./compliance/helpers";

// Figma "Role Qualification Progress" card. Unlike the mockup's static
// named certifications (Wine Service Cert, etc. — not tracked anywhere in
// this schema), each row here maps to a qualification the app genuinely
// records: RSA compliance, food-safety (FSS) currency, service readiness
// (on-track status), and overall training completion.

export function RoleQualificationCard({
  venueStaff,
  avgCompletion,
}: {
  venueStaff: ManagementSnapshot["staff"];
  avgCompletion: number;
}) {
  const total = venueStaff.length || 1;
  const rsaCertified = venueStaff.filter((s) => rsaStatus(s.compliance).level <= 1).length;
  const foodSafety = venueStaff.filter((s) => s.compliance?.fssExpiryDate && new Date(s.compliance.fssExpiryDate) > new Date()).length;
  const serviceReady = venueStaff.filter((s) => s.status === "on-track").length;

  const rows = [
    { label: "RSA — Responsible Service", certified: rsaCertified, total: venueStaff.length },
    { label: "Food Safety (FSS)", certified: foodSafety, total: venueStaff.length },
    { label: "Service Readiness", certified: serviceReady, total: venueStaff.length },
    { label: "Training Completion", certified: Math.round((avgCompletion / 100) * total), total: venueStaff.length },
  ];

  return (
    <div className="mc-panel">
      <div className="mc-panel-head">
        <div>
          <p className="mc-panel-title">Role Qualification Progress</p>
          <p className="mc-panel-desc">Mandatory training &amp; compliance coverage</p>
        </div>
      </div>
      <div className="mc-panel-body">
        {rows.map((row) => {
          const pct = row.total > 0 ? Math.round((row.certified / row.total) * 100) : 0;
          const barColor = pct === 100 ? "var(--mc-green)" : pct < 70 ? "var(--mc-terracotta)" : "var(--mc-brown)";
          return (
            <div key={row.label} className="mc-qual-row">
              <div className="mc-qual-head">
                <span className="mc-qual-label">{row.label}</span>
                <div className="mc-qual-figures">
                  <span className="mc-qual-count">{row.total > 0 ? `${row.certified}/${row.total}` : "–"}</span>
                  <span className="mc-qual-pct" style={{ color: pct === 100 ? "var(--mc-green)" : pct < 70 ? "var(--mc-terracotta)" : "var(--mc-text)" }}>
                    {row.total > 0 ? `${pct}%` : "–"}
                  </span>
                </div>
              </div>
              <div className="mc-progress-track">
                <div className="mc-progress-fill" style={{ width: `${pct}%`, background: barColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
