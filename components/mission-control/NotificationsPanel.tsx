"use client";

import { useEffect, useState } from "react";
import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";
import { EmptyState } from "@/components/mission-control/manager-ui";
import { PageHead, Panel, StatusText, type StatusTone } from "./console-ui";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap, line-count reduction). Covers the Notifications tab: category
// filter tabs, active alert feed with inline CTAs, and an archive drawer.
//
// notifFilter / showArchivedNotifs are local UI-only state — nothing
// outside this tab reads them. dismissedNotifs is mirrored to
// localStorage (per venue) so an "Archive" click survives reload —
// these alerts are computed from live data each render rather than
// stored as DB rows, so there's no server-side place to persist a
// dismissal; localStorage keeps the illusion honest instead of silently
// resetting it.

type NotifItem = { id: string; category: "training" | "performance" | "inventory"; urgency: "critical" | "warning" | "info"; title: string; body: string };

export interface NotificationsPanelProps {
  venueStaff: ManagementSnapshot["staff"];
  needsAttention: ManagementSnapshot["staff"];
  venueInventory: ManagementSnapshot["inventory"];
  venuePrograms: ManagementSnapshot["trainingPrograms"];
  metrics: { salesSkill: number };
  selectedVenueName: string | undefined;
  handleSectionChange: (section: ManagerSection) => void;
  venueId?: string;
}

function dismissedNotifsStorageKey(venueId: string | undefined): string {
  return `sbe-dismissed-notifs-${venueId ?? "default"}`;
}

export function NotificationsPanel({ venueStaff, needsAttention, venueInventory, venuePrograms, metrics, selectedVenueName, handleSectionChange, venueId }: NotificationsPanelProps) {
  const [notifFilter, setNotifFilter] = useState<"all" | "training" | "performance" | "inventory">("all");
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const [showArchivedNotifs, setShowArchivedNotifs] = useState(false);

  // Hydrate archived-alert ids from localStorage whenever the selected venue changes.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(dismissedNotifsStorageKey(venueId));
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissedNotifs(new Set(ids));
    } catch {
      // Private browsing / storage disabled — fall back to session-only dismissal.
      setDismissedNotifs(new Set());
    }
  }, [venueId]);

  function persistDismissed(next: Set<string>) {
    setDismissedNotifs(next);
    try {
      window.localStorage.setItem(dismissedNotifsStorageKey(venueId), JSON.stringify([...next]));
    } catch {
      // Ignore storage failures — the in-memory state still updates for this session.
    }
  }

  const allNotifs: NotifItem[] = [
    ...(needsAttention.filter((s) => s.status === "inactive").map((s) => ({
      id: `inactive-${s.id}`,
      category: "training" as const,
      urgency: "critical" as const,
      title: "Staff inactive",
      body: `${s.name} (${s.role}) has not trained in 30 days or more.`,
    }))),
    ...(needsAttention.filter((s) => s.status === "attention").map((s) => ({
      id: `attention-${s.id}`,
      category: "training" as const,
      urgency: "warning" as const,
      title: "Training overdue",
      body: `${s.name} has not trained in 14 days or more and is at ${Math.round(s.progress)}% completion.`,
    }))),
    ...(needsAttention.filter((s) => s.lastActive === "Not started").map((s) => ({
      id: `notstarted-${s.id}`,
      category: "training" as const,
      urgency: "warning" as const,
      title: "Yet to start",
      body: `${s.name} (${s.role}) has been added but has not started training.`,
    }))),
    ...(venueStaff.filter((s) => s.salesScore > 0 && s.salesScore < 50).map((s) => ({
      id: `lowsales-${s.id}`,
      category: "performance" as const,
      urgency: "warning" as const,
      title: "Low upsell score",
      body: `${s.name} has a sales score of ${s.salesScore}%. Consider targeted upsell training.`,
    }))),
    ...(metrics.salesSkill > 0 ? [{
      id: "upsell-avg",
      category: "performance" as const,
      urgency: metrics.salesSkill < 60 ? "warning" as const : "info" as const,
      title: "Venue upsell performance",
      body: `Average upsell performance is ${metrics.salesSkill}%.${metrics.salesSkill < 60 ? " Consider running a sales-focus training session." : " Tracking well."}`,
    }] : []),
    ...(venueInventory.length === 0 ? [{
      id: "no-inventory",
      category: "inventory" as const,
      urgency: "info" as const,
      title: "No inventory connected",
      body: "Add inventory categories to improve scenario realism for your team.",
    }] : [{
      id: "inventory-ok",
      category: "inventory" as const,
      urgency: "info" as const,
      title: "Inventory connected",
      body: `${venueInventory.length} inventory categor${venueInventory.length !== 1 ? "ies" : "y"} linked to training scenarios.`,
    }]),
    ...(venuePrograms.length === 0 ? [{
      id: "no-programs",
      category: "training" as const,
      urgency: "info" as const,
      title: "No training programs",
      body: "Create a training program to assign structured onboarding to your staff.",
    }] : []),
  ];
  const urgencyOrder = { critical: 0, warning: 1, info: 2 };
  const urgencyTone: Record<NotifItem["urgency"], { tone: StatusTone; label: string }> = {
    critical: { tone: "alert", label: "Critical" },
    warning: { tone: "warn", label: "Warning" },
    info: { tone: "neutral", label: "Info" },
  };
  const filterTabs: { key: "all" | "training" | "performance" | "inventory"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "training", label: "Training" },
    { key: "performance", label: "Performance" },
    { key: "inventory", label: "Inventory" },
  ];
  const active = allNotifs.filter((n) => !dismissedNotifs.has(n.id));
  const archived = allNotifs.filter((n) => dismissedNotifs.has(n.id));
  const visible = active
    .filter((n) => notifFilter === "all" || n.category === notifFilter)
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return (
    <div className="mc-page mc-page-narrow">
      <PageHead
        title="Notifications"
        description={`What needs a look${selectedVenueName ? ` at ${selectedVenueName}` : ""}, worked out from your team's training right now.`}
        actions={
          <>
            {archived.length > 0 && (
              <button type="button" className="mc-btn mc-btn-quiet" onClick={() => setShowArchivedNotifs((v) => !v)}>
                {showArchivedNotifs ? "Hide archived" : `Show archived (${archived.length})`}
              </button>
            )}
            <button type="button" className="mc-btn mc-btn-quiet" onClick={() => handleSectionChange("settings")}>
              Settings
            </button>
          </>
        }
      />

      <div className="mc-tabs" role="tablist" aria-label="Notification category">
        {filterTabs.map((t) => {
          const count = active.filter((n) => t.key === "all" || n.category === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={notifFilter === t.key}
              className={`mc-tab${notifFilter === t.key ? " active" : ""}`}
              onClick={() => setNotifFilter(t.key)}
            >
              {t.label}{count > 0 ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <Panel flush={visible.length > 0}>
        {visible.length === 0 ? (
          <EmptyState tone="success" copy="All clear in this category." subCopy="No active alerts to action right now." />
        ) : (
          <ul className="mc-rows">
            {visible.map((notif) => {
              const status = notif.id === "inventory-ok" ? { tone: "ok" as const, label: "Connected" } : urgencyTone[notif.urgency];
              // Only "training" leads to a built section (Staff). The
              // inventory and scenario builders are placeholders, so those
              // alerts carry no button.
              const showReview = notif.urgency !== "info" && notif.category === "training";
              return (
                <li key={notif.id} className="mc-row" style={{ alignItems: "flex-start" }}>
                  <div className="mc-row-main">
                    <div className="mc-row-title">{notif.title}</div>
                    <div className="mc-row-meta">{notif.body}</div>
                    <div style={{ marginTop: 6 }}>
                      <StatusText tone={status.tone}>{status.label}</StatusText>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {showReview && (
                      <button type="button" className="mc-btn mc-btn-sm mc-btn-primary" onClick={() => handleSectionChange("staff")}>
                        Review staff
                      </button>
                    )}
                    <button
                      type="button"
                      className="mc-btn mc-btn-sm mc-btn-quiet"
                      onClick={() => persistDismissed(new Set([...dismissedNotifs, notif.id]))}
                    >
                      Archive
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {showArchivedNotifs && archived.length > 0 && (
        <Panel title="Archived" flush>
          <ul className="mc-rows">
            {archived.map((notif) => (
              <li key={notif.id} className="mc-row">
                <div className="mc-row-main">
                  <div className="mc-row-title">{notif.title}</div>
                  <div className="mc-row-meta">{notif.body}</div>
                </div>
                <button
                  type="button"
                  className="mc-btn mc-btn-sm mc-btn-quiet"
                  onClick={() => { const next = new Set(dismissedNotifs); next.delete(notif.id); persistDismissed(next); }}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
