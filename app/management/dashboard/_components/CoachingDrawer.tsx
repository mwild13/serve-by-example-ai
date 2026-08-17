"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { OpsKpiCard, StaffBadges, MasteryMicroGrid } from "@/components/mission-control/manager-ui";
import type { StaffMember } from "@/lib/management/types";

interface CoachingDrawerProps {
  isOpen: boolean;
  staff: StaffMember | null;
  onClose: () => void;
  onAssignTraining?: () => void;
}

export default function CoachingDrawer({ isOpen, staff, onClose, onAssignTraining }: CoachingDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (isOpen && e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
        );
        const focusableArray = Array.from(focusableElements) as HTMLElement[];
        if (focusableArray.length === 0) return;

        const firstElement = focusableArray[0];
        const lastElement = focusableArray[focusableArray.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (e.shiftKey) {
          if (activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      if (drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        if (firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 0);
        }
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!staff) return null;

  return (
    <>
      <div
        className={`ops-coaching-drawer-backdrop ${isOpen ? "ops-coaching-drawer-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`ops-coaching-drawer ${isOpen ? "ops-coaching-drawer-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${staff.name} – coaching profile`}
        ref={drawerRef}
      >
        <div className="ops-coaching-drawer-header">
          <div>
            <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)", color: "var(--green-deep)", margin: 0, marginBottom: 2 }}>
              {staff.name}
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>
              {staff.role} · Last active {staff.lastActive}
            </span>
          </div>
          <button
            type="button"
            className="ops-coaching-drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ops-coaching-drawer-body" key={isOpen && staff ? staff.id : "closed"}>
          <div className="ops-profile-metrics">
            <OpsKpiCard label="Completion" value={`${parseFloat(staff.progress.toFixed(2))}%`} />
            <OpsKpiCard label="Service" value={`${parseFloat(staff.serviceScore.toFixed(2))}%`} />
            <OpsKpiCard label="Sales" value={`${parseFloat(staff.salesScore.toFixed(2))}%`} />
            <OpsKpiCard label="Product" value={`${parseFloat(staff.productScore.toFixed(2))}%`} />
          </div>

          {/* Contact / connection metadata — moved here from the Staff
              Directory table (Phase 5 UX Refinement Pass, streamlined to 4
              essential columns: Name/Role, Readiness, Progress, Action).
              Module mastery grid moved here alongside it. */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 18px", padding: "10px 0", borderTop: "1px solid var(--line-light)", borderBottom: "1px solid var(--line-light)", marginBottom: 16, fontSize: "0.8rem" }}>
            {staff.email && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-soft)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                {staff.email}
              </div>
            )}
            <span className={`ops-badge ${staff.staffUserId ? "ops-badge-active" : staff.email ? "ops-badge-pending" : "ops-badge-removed"}`}>
              {staff.staffUserId ? "Connected" : staff.email ? "Invited" : "No account"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Module mastery</span>
              <MasteryMicroGrid scenariosMastered={staff.scenariosMastered} scenariosAttempted={staff.scenariosAttempted} />
            </div>
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

          {onAssignTraining && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: "0.78rem", padding: "6px 14px", marginTop: 20, width: "100%" }}
              onClick={onAssignTraining}
            >
              + Assign training
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
