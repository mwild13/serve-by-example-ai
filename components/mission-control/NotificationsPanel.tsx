"use client";

import { useState } from "react";
import type { ManagementSnapshot, ManagerSection } from "@/lib/management/types";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap, line-count reduction). Covers the Notifications tab: category
// filter tabs, active alert feed with inline CTAs, and an archive drawer.
//
// notifFilter / dismissedNotifs / showArchivedNotifs are local UI-only
// state — nothing outside this tab reads them.

type NotifItem = { id: string; category: "training" | "performance" | "inventory"; urgency: "critical" | "warning" | "info"; title: string; body: string };

export interface NotificationsPanelProps {
  venueStaff: ManagementSnapshot["staff"];
  needsAttention: ManagementSnapshot["staff"];
  venueInventory: ManagementSnapshot["inventory"];
  venuePrograms: ManagementSnapshot["trainingPrograms"];
  metrics: { salesSkill: number };
  selectedVenueName: string | undefined;
  handleSectionChange: (section: ManagerSection) => void;
}

export function NotificationsPanel({ venueStaff, needsAttention, venueInventory, venuePrograms, metrics, selectedVenueName, handleSectionChange }: NotificationsPanelProps) {
  const [notifFilter, setNotifFilter] = useState<"all" | "training" | "performance" | "inventory">("all");
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(new Set());
  const [showArchivedNotifs, setShowArchivedNotifs] = useState(false);

  const allNotifs: NotifItem[] = [
    ...(needsAttention.filter((s) => s.status === "inactive").map((s) => ({
      id: `inactive-${s.id}`,
      category: "training" as const,
      urgency: "critical" as const,
      title: "Staff inactive",
      body: `${s.name} (${s.role}) has not completed any training and is inactive.`,
    }))),
    ...(needsAttention.filter((s) => s.status === "attention").map((s) => ({
      id: `attention-${s.id}`,
      category: "training" as const,
      urgency: "warning" as const,
      title: "Training overdue",
      body: `${s.name} needs attention, currently at ${parseFloat(s.progress.toFixed(0))}% completion.`,
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
  const urgencyStyle: Record<string, { bg: string; border: string; dot: string; label: string }> = {
    critical: { bg: "var(--status-critical-bg)", border: "var(--status-critical-border)", dot: "var(--status-critical)", label: "Critical" },
    warning:  { bg: "var(--status-amber-bg)", border: "var(--status-amber-border)", dot: "var(--status-amber)", label: "Warning" },
    info:     { bg: "var(--bg-alt)", border: "var(--line)", dot: "var(--color-link-dark)", label: "Info" },
  };
  const filterTabs: { key: "all" | "training" | "performance" | "inventory"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "training", label: "Training" },
    { key: "performance", label: "Performance" },
    { key: "inventory", label: "Inventory" },
  ];
  const visible = allNotifs
    .filter((n) => notifFilter === "all" || n.category === notifFilter)
    .filter((n) => !dismissedNotifs.has(n.id))
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return (
    <section className="ops-grid ops-grid-main">
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ops-card-head">
          <h3>Notifications</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedVenueName}</span>
            {dismissedNotifs.size > 0 && (
              <button
                type="button"
                onClick={() => setShowArchivedNotifs((v) => !v)}
                style={{ padding: "4px 10px", borderRadius: 6, border: "1.5px solid var(--line)", background: showArchivedNotifs ? "var(--line-light, var(--border-subtle))" : "transparent", color: "var(--text-soft)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
              >
                {showArchivedNotifs ? "Hide archived" : `Show archived (${dismissedNotifs.size})`}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSectionChange("settings")}
              style={{ padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--line)", background: "transparent", color: "var(--text-muted)", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              aria-label="Notification settings"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {filterTabs.map((t) => {
            const count = allNotifs.filter((n) => (t.key === "all" || n.category === t.key) && !dismissedNotifs.has(n.id)).length;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setNotifFilter(t.key)}
                style={{
                  padding: "6px 14px", borderRadius: 999, border: "1.5px solid",
                  borderColor: notifFilter === t.key ? "var(--color-mastery-technical)" : "var(--line)",
                  background: notifFilter === t.key ? "var(--color-mastery-technical)" : "transparent",
                  color: notifFilter === t.key ? "white" : "var(--text-soft)",
                  fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {t.label}
                {count > 0 && (
                  <span style={{
                    background: notifFilter === t.key ? "rgba(255,255,255,0.25)" : "var(--viz-neutral-light)",
                    color: notifFilter === t.key ? "white" : "var(--text-soft)",
                    borderRadius: 999, padding: "1px 7px", fontSize: "0.72rem", fontWeight: 700,
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        {visible.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "var(--status-success-bg)", borderRadius: 10, border: "1.5px solid var(--status-success-border)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--status-success-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--status-success-strong)" }}>All clear in this category.</div>
              <div style={{ fontSize: "0.8rem", color: "var(--status-success)" }}>No active alerts to action right now.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map((notif) => {
              const style = notif.id === "inventory-ok" ? { bg: "var(--status-success-bg)", border: "var(--status-success-border)", dot: "var(--status-success)", label: "Connected" } : urgencyStyle[notif.urgency];
              const ctaMap: Record<string, { label: string; section: ManagerSection }> = {
                "training":     { label: "Review staff", section: "staff" },
                "performance":  { label: "Open scenarios", section: "scenarios" },
                "inventory":    { label: "Manage inventory", section: "inventory" },
              };
              const inlineCta = notif.urgency !== "info" ? ctaMap[notif.category] : null;
              return (
                <div key={notif.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 10, background: style.bg, border: `1.5px solid ${style.border}`, borderLeft: `4px solid ${style.dot}` }}>
                  <span style={{ marginTop: 3, flexShrink: 0, width: 10, height: 10, borderRadius: "50%", background: style.dot, display: "inline-block" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)", marginBottom: 2 }}>{notif.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-soft)", lineHeight: 1.45 }}>{notif.body}</div>
                    {inlineCta && (
                      <button
                        type="button"
                        onClick={() => handleSectionChange(inlineCta.section)}
                        style={{ marginTop: 8, padding: "5px 12px", borderRadius: 6, background: "var(--green-mid)", color: "white", border: "none", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        {inlineCta.label} →
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Now</span>
                    <button
                      type="button"
                      onClick={() => setDismissedNotifs((prev) => new Set([...prev, notif.id]))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, padding: "2px 6px", borderRadius: 4, lineHeight: 1 }}
                      aria-label="Dismiss"
                    >Archive</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showArchivedNotifs && dismissedNotifs.size > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Archived</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: 0.55 }}>
              {allNotifs.filter((n) => dismissedNotifs.has(n.id)).map((notif) => (
                <div key={notif.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--line)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-neutral)", flexShrink: 0, display: "inline-block" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-soft)" }}>{notif.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{notif.body}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissedNotifs((prev) => { const next = new Set(prev); next.delete(notif.id); return next; })}
                    style={{ background: "none", border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer", color: "var(--text-muted)", fontSize: "0.72rem", padding: "2px 7px" }}
                  >Restore</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
