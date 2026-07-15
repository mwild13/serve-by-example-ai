'use client';

// Staff Readiness Board — traffic-light replacement for the old flat
// "Tonight's Shift Readiness" table. Extracted per the UX overhaul spec
// (Manager-Console-UX-Overhaul-Spec.html, Hero Component #3) so
// ManagerControlCenter.tsx doesn't grow past its size ceiling.
//
// Status color is driven entirely by the existing rsaStatus/readinessPill
// helpers — this component only changes presentation, not business logic.

import type { StaffMember } from "@/lib/management/types";
import { rsaStatus, readinessPill } from "./compliance/helpers";

export function StaffReadinessBoard({ staff }: { staff: StaffMember[] }) {
  if (staff.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-soft)", fontSize: 16 }}>
        No staff rostered for tonight yet.
      </div>
    );
  }

  return (
    <div className="mcc-readiness-board">
      {staff.map((member) => {
        const rsaStat = rsaStatus(member.compliance);
        const isBlocked = rsaStat.level === 3;
        const pill = readinessPill(member.compliance, member.status, member.progress);
        const isAlcoholRole = member.role === "Bartender" || member.role === "Floor";
        const dotColor = isBlocked
          ? "var(--status-error)"
          : pill.label === "Caution"
          ? "var(--status-warn)"
          : "var(--status-good)";
        const statusLabel = isBlocked ? "Blocked" : pill.label;

        return (
          <div key={member.id} className="mcc-readiness-row" style={{ borderLeftColor: dotColor }}>
            <span
              className="mcc-readiness-dot"
              style={{ background: dotColor }}
              role="img"
              aria-label={`${statusLabel} status`}
            />

            <div className="mcc-readiness-avatar">{member.name[0]}</div>

            <div className="mcc-readiness-identity">
              <div className="mcc-readiness-name">{member.name}</div>
              {member.isJunior && isAlcoholRole && (
                <div className="mcc-readiness-flag">
                  Junior serving alcohol — verify adult rate (MA000119)
                </div>
              )}
            </div>

            <div className="mcc-readiness-meta">
              <span className="mcc-readiness-meta-label">RSA</span>
              <span style={{ color: isBlocked ? "var(--status-error)" : "var(--status-good)", fontWeight: 600 }}>
                {member.compliance?.rsaJurisdiction ? `${member.compliance.rsaJurisdiction} · ${rsaStat.label}` : "Not verified"}
              </span>
            </div>

            <div className="mcc-readiness-meta">
              <span className="mcc-readiness-meta-label">Training</span>
              <span style={{ fontWeight: 600 }}>{member.progress}%</span>
            </div>

            <span
              className="mcc-readiness-status-chip"
              style={{
                background: isBlocked ? "var(--status-error-bg)" : pill.bg,
                color: isBlocked ? "var(--status-error)" : pill.color,
              }}
            >
              {statusLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
