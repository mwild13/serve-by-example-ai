"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  Users,
  Target,
  ShieldCheck,
  FileText,
  BarChart3,
  FileLineChart,
  Trophy,
  Sparkles,
  Settings,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import SignOutButton from "@/components/ui/SignOutButton";
import type { ManagerSection } from "@/lib/management/types";
import type { NavGroup } from "./manager-types";

// The console's left navigation, on every tab. Extracted from
// ManagerControlCenter.tsx so the shell could gain a collapsed state without
// that file growing.
//
// Collapsed, it is a 64px rail of icons. Labels stay in the DOM (visually
// hidden) so each button keeps its accessible name, and `title` gives a
// tooltip. The choice is remembered per browser; Cmd/Ctrl+B toggles it. With
// no saved choice the rail is used below 1100px, where the full sidebar
// would crowd the workspace.

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Command",
    collapsible: false,
    items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "People",
    collapsible: true,
    items: [
      { id: "staff", label: "Staff", icon: User },
      { id: "teams", label: "Teams", icon: Users },
      { id: "predictive", label: "Training Gaps", icon: Target },
      { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
      { id: "compliance", label: "Compliance", icon: FileText },
    ],
  },
  {
    label: "Performance",
    collapsible: true,
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "reports", label: "Reports", icon: FileLineChart },
      { id: "leaderboards", label: "Leaderboards", icon: Trophy },
      { id: "aicoach", label: "Ask AI Coach", icon: Sparkles },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const STORAGE_KEY = "sbe-mc-sidebar-collapsed";
const AUTO_COLLAPSE_BELOW = 1100;

export interface ConsoleSidebarProps {
  activeSection: ManagerSection;
  onNavigate: (section: ManagerSection) => void;
  /** False for duty managers: hides Settings. */
  isOwnerLevel: boolean;
  accountName: string;
  /** Trial prompt, shown above the profile row while the sidebar is expanded. */
  trialSlot?: ReactNode;
}

export function ConsoleSidebar({ activeSection, onNavigate, isOwnerLevel, accountName, trialSlot }: ConsoleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  // Width only animates after the saved choice has been applied, so a
  // manager who keeps the rail does not watch it fold on every page load.
  const [ready, setReady] = useState(false);
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage unavailable (private browsing): fall back to the width rule.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only preference after hydration; the server render cannot know it.
    setCollapsed(saved === null ? window.innerWidth < AUTO_COLLAPSE_BELOW : saved === "1");
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // The choice still applies for this visit.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  function toggleGroup(label: string) {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const toggleLabel = collapsed ? "Expand menu" : "Collapse menu";

  return (
    <aside className={`mc-sidebar${collapsed ? " collapsed" : ""}${ready ? " ready" : ""}`}>
      <div className="mc-sidebar-logo">
        <Image src="/logo.webp" alt="Serve By Example" width={36} height={36} className="mc-sidebar-logo-img" />
        <div className="mc-sidebar-logo-text">
          <span className="mc-sidebar-logo-brand">Serve By Example</span>
          <span className="mc-sidebar-logo-sub">Management Console</span>
        </div>
      </div>

      <div className="mc-sidebar-scroll">
        <button
          type="button"
          className="mc-nav-item mc-sidebar-toggle"
          onClick={toggle}
          aria-expanded={!collapsed}
          title={`${toggleLabel} (Ctrl or Cmd + B)`}
        >
          <ToggleIcon size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="mc-nav-item-label">{toggleLabel}</span>
        </button>

        <nav aria-label="Console sections">
          {NAV_GROUPS.map((group, groupIndex) => {
            // Group folding only applies to the full sidebar; the rail always shows every icon.
            const isClosed = !collapsed && group.collapsible && closedGroups.has(group.label);
            return (
              <div key={group.label} className="mc-nav-group">
                {collapsed ? (
                  groupIndex > 0 && <div className="mc-nav-rule" />
                ) : group.collapsible ? (
                  <button
                    type="button"
                    className="mc-nav-group-toggle"
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={!isClosed}
                  >
                    <span>{group.label}</span>
                    <ChevronDown size={14} strokeWidth={2} className={`mc-nav-chevron${isClosed ? " collapsed" : ""}`} aria-hidden="true" />
                  </button>
                ) : (
                  <div className="mc-nav-group-label">{group.label}</div>
                )}
                {!isClosed && (
                  <div className="mc-nav-items">
                    {group.items
                      .filter((item) => item.id !== "settings" || isOwnerLevel)
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`mc-nav-item${activeSection === item.id ? " active" : ""}`}
                          onClick={() => onNavigate(item.id)}
                          aria-current={activeSection === item.id ? "page" : undefined}
                          title={collapsed ? item.label : undefined}
                        >
                          <item.icon size={18} strokeWidth={1.5} aria-hidden="true" />
                          <span className="mc-nav-item-label">{item.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mc-sidebar-bottom">
        {!collapsed && trialSlot}
        <div className="mc-profile-row" title={collapsed ? accountName || "Manager" : undefined}>
          <div className="mc-profile-avatar">{(accountName || "M").trim().slice(0, 1).toUpperCase()}</div>
          <div className="mc-profile-text">
            <div className="mc-profile-name">{accountName || "Manager"}</div>
            <div className="mc-profile-role">Venue Manager</div>
          </div>
        </div>
        <SignOutButton className="mc-nav-item mc-signout-btn" title={collapsed ? "Sign out" : undefined}>
          <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="mc-nav-item-label">Sign out</span>
        </SignOutButton>
      </div>
    </aside>
  );
}
