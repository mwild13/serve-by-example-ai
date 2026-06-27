"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { OpsKpiCard, StaffBadges } from "./manager-ui";
import type { StaffMember } from "@/lib/management/types";

interface CoachingDrawerProps {
  isOpen: boolean;
  staff: StaffMember | null;
  onClose: () => void;
  onAssignTraining?: () => void;
}

export default function CoachingDrawer({ isOpen, staff, onClose, onAssignTraining }: CoachingDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [focusTrapActive, setFocusTrapActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFocusTrapActive(true);
    }
    return () => {
      document.body.style.overflow = "";
      setFocusTrapActive(false);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (focusTrapActive && e.key === "Tab" && drawerRef.current) {
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
  }, [isOpen, onClose, focusTrapActive]);

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
