"use client";

import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { StatusText } from "@/components/mission-control/console-ui";
import { daysUntilExpiry } from "@/components/mission-control/compliance/helpers";
import { V3_TOTAL_MODULES } from "@/lib/mastery";
import type { StaffMember } from "@/lib/management/types";

// The staff profile drawer, opened from a row on the Staff tab. Rebuilt on
// 2026-10-17 to the console standard (docs/MANAGER_CONSOLE.md §6): type and
// hairlines, no boxed badges or pills, and only figures the platform
// records. Removed from the old drawer:
// - The Sales score. Nothing calculates it; it is 0 for every real account.
// - Strengths and Needs improvement. Nothing writes them; they now show only
//   for the seeded rows that carry them.
// - The 20-square module grid and "All 20 modules" badges. The platform has
//   40 modules, and the roster only stores how many were passed, not which,
//   so the grid painted modules 1, 2, 3... as passed whatever was done.

interface CoachingDrawerProps {
  isOpen: boolean;
  staff: StaffMember | null;
  onClose: () => void;
}

const TOTAL = V3_TOTAL_MODULES;
// SBE Elite: quizzes passed for 80% of modules (eliteThreshold() in
// lib/verify-quiz.ts, which is server-only).
const ELITE = Math.ceil(TOTAL * 0.8);

function activityLine(staff: StaffMember): { text: string; tone: "ok" | "warn" | "neutral" } {
  if (staff.lastActive === "Not started") return { text: "Has not started training", tone: "neutral" };
  const text = staff.lastActive === "Today" || staff.lastActive === "Yesterday"
    ? `Last trained ${staff.lastActive.toLowerCase()}`
    : `Last trained ${staff.lastActive}`;
  return { text, tone: staff.status === "on-track" ? "ok" : staff.status === "attention" ? "warn" : "neutral" };
}

function accountLine(staff: StaffMember): string {
  if (staff.staffUserId) return "Account connected";
  if (staff.email) return "Invite sent, not yet joined";
  return "No account yet";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

/** One certificate's state as a sentence and a tone. */
function certificate(expiry: string | null): { text: string; tone: "ok" | "warn" | "alert" | "neutral" } {
  if (!expiry) return { text: "No date on file", tone: "neutral" };
  const days = daysUntilExpiry(expiry);
  if (days < 0) return { text: `Expired ${formatDate(expiry)}`, tone: "alert" };
  if (days <= 30) return { text: `Expires in ${days} ${days === 1 ? "day" : "days"}`, tone: "warn" };
  return { text: `Valid to ${formatDate(expiry)}`, tone: "ok" };
}

export default function CoachingDrawer({ isOpen, staff, onClose }: CoachingDrawerProps) {
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

  const passed = Math.max(0, Math.min(TOTAL, staff.scenariosMastered ?? 0));
  const started = Math.max(passed, Math.min(TOTAL, staff.scenariosAttempted ?? 0));
  const inProgress = started - passed;
  const activity = activityLine(staff);

  const milestones = [
    { label: "Started training", done: started > 0, togo: null },
    { label: "Product knowledge complete", done: staff.productScore >= 100, togo: null },
    { label: `Halfway, ${TOTAL / 2} modules`, done: passed >= TOTAL / 2, togo: TOTAL / 2 - passed },
    { label: `SBE Elite, ${ELITE} modules`, done: passed >= ELITE, togo: ELITE - passed },
    { label: `All ${TOTAL} modules`, done: passed >= TOTAL, togo: TOTAL - passed },
  ];

  const rsa = staff.compliance ? certificate(staff.compliance.rsaExpiryDate) : null;
  const fss = staff.compliance?.fssExpiryDate ? certificate(staff.compliance.fssExpiryDate) : null;
  const hasCoachingNotes = staff.strengths.length > 0 || staff.improvements.length > 0;

  return (
    <>
      <div
        className={`ops-coaching-drawer-backdrop ${isOpen ? "ops-coaching-drawer-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`ops-coaching-drawer mc-profile ${isOpen ? "ops-coaching-drawer-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${staff.name}, staff profile`}
        ref={drawerRef}
      >
        <header className="mc-profile-head">
          <div className="mc-profile-id">
            <p className="mc-caps">{staff.role}</p>
            <h2 className="mc-profile-name">{staff.name}</h2>
            <div className="mc-profile-status">
              <StatusText tone={activity.tone}>{activity.text}</StatusText>
              <span className="mc-profile-account">{accountLine(staff)}</span>
            </div>
          </div>
          <button type="button" className="mc-icon-btn" onClick={onClose} aria-label="Close profile">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="mc-profile-body" key={isOpen ? staff.id : "closed"}>
          <section className="mc-profile-section" aria-label="Modules">
            <p className="mc-profile-figure">
              <span className="mc-profile-figure-num">{passed}</span>
              <span className="mc-profile-figure-of">of {TOTAL} modules passed</span>
            </p>
            <div
              className="mc-profile-bar"
              role="img"
              aria-label={`${passed} passed, ${inProgress} in progress, ${TOTAL - started} not started`}
            >
              <span className="mc-profile-bar-passed" style={{ width: `${(passed / TOTAL) * 100}%` }} />
              <span className="mc-profile-bar-started" style={{ width: `${(inProgress / TOTAL) * 100}%` }} />
            </div>
            <p className="mc-profile-note">
              {inProgress} in progress · {TOTAL - started} not started
            </p>
          </section>

          <section className="mc-profile-section">
            <h3 className="mc-caps mc-profile-label">Scores</h3>
            <dl className="mc-dl">
              <div>
                <dt>Training progress</dt>
                <dd>{Math.round(staff.progress)}%</dd>
              </div>
              <div>
                <dt>Service score</dt>
                <dd>{Math.round(staff.serviceScore)}%</dd>
              </div>
              <div>
                <dt>Product knowledge</dt>
                <dd>{Math.round(staff.productScore)}%</dd>
              </div>
            </dl>
          </section>

          <section className="mc-profile-section">
            <h3 className="mc-caps mc-profile-label">Milestones</h3>
            <ul className="mc-profile-milestones">
              {milestones.map((m) => (
                <li key={m.label} className={m.done ? "is-done" : undefined}>
                  <span className="mc-profile-tick" aria-hidden="true">{m.done && <Check size={14} strokeWidth={2.5} />}</span>
                  <span className="mc-profile-milestone">{m.label}</span>
                  <span className="mc-profile-togo">
                    {m.done ? "Done" : m.togo !== null ? `${m.togo} to go` : "Not yet"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {(rsa || fss) && (
            <section className="mc-profile-section">
              <h3 className="mc-caps mc-profile-label">Certificates</h3>
              <dl className="mc-dl">
                {rsa && (
                  <div>
                    <dt>RSA{staff.compliance?.rsaJurisdiction ? `, ${staff.compliance.rsaJurisdiction}` : ""}</dt>
                    <dd><StatusText tone={rsa.tone}>{rsa.text}</StatusText></dd>
                  </div>
                )}
                {fss && (
                  <div>
                    <dt>Food Safety Supervisor</dt>
                    <dd><StatusText tone={fss.tone}>{fss.text}</StatusText></dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {staff.managerNotes && (
            <section className="mc-profile-section">
              <h3 className="mc-caps mc-profile-label">Your notes</h3>
              <p className="mc-profile-text">{staff.managerNotes}</p>
            </section>
          )}

          {hasCoachingNotes && (
            <section className="mc-profile-section mc-profile-split">
              {staff.strengths.length > 0 && (
                <div>
                  <h3 className="mc-caps mc-profile-label">Strengths</h3>
                  <ul className="mc-profile-list">{staff.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              )}
              {staff.improvements.length > 0 && (
                <div>
                  <h3 className="mc-caps mc-profile-label">To work on</h3>
                  <ul className="mc-profile-list">{staff.improvements.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              )}
            </section>
          )}

          {staff.email && (
            <p className="mc-profile-contact">
              <a href={`mailto:${staff.email}`}>{staff.email}</a>
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
