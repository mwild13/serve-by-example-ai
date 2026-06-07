"use client";

import { useEffect } from "react";
import { OpsKpiCard, StaffBadges } from "./manager-ui";
import type { StaffMember } from "@/lib/management/types";

interface CoachingDrawerProps {
  staff: StaffMember;
  onClose: () => void;
  onAssignTraining?: () => void;
}

export default function CoachingDrawer({ staff, onClose, onAssignTraining }: CoachingDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(0,0,0,0.25)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="ops-coaching-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${staff.name} — coaching profile`}
      >
        <div className="ops-coaching-drawer-head">
          <div>
            <h3>{staff.name}</h3>
            <span>{staff.role} · Last active {staff.lastActive}</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {onAssignTraining && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: "0.78rem", padding: "6px 14px" }}
                onClick={onAssignTraining}
              >
                + Assign training
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              autoFocus
            >
              Close
            </button>
          </div>
        </div>

        <div className="ops-profile-metrics">
          <OpsKpiCard label="Completion" value={`${parseFloat(staff.progress.toFixed(2))}%`} />
          <OpsKpiCard label="Service" value={`${parseFloat(staff.serviceScore.toFixed(2))}%`} />
          <OpsKpiCard label="Sales" value={`${parseFloat(staff.salesScore.toFixed(2))}%`} />
          <OpsKpiCard label="Product" value={`${parseFloat(staff.productScore.toFixed(2))}%`} />
        </div>

        <StaffBadges staff={staff} />

        <div className="ops-grid-two-col">
          <div>
            <strong className="ops-subhead">Strengths</strong>
            <ul className="ops-coaching-list">
              {staff.strengths.length
                ? staff.strengths.map((item) => <li key={item}>{item}</li>)
                : <li style={{ color: "var(--text-muted)" }}>No strengths recorded yet</li>}
            </ul>
          </div>
          <div>
            <strong className="ops-subhead">Needs improvement</strong>
            <ul className="ops-coaching-list">
              {staff.improvements.length
                ? staff.improvements.map((item) => <li key={item}>{item}</li>)
                : <li style={{ color: "var(--text-muted)" }}>No coaching notes recorded yet</li>}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
