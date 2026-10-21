"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Image from "next/image";
import {
  BookOpen,
  ChevronUp,
  House,
  Library,
  Lock,
  LogOut,
  Martini,
  MessageCircle,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Puzzle,
  Settings,
  Shuffle,
  Sun,
  Timer,
  TrendingUp,
} from "lucide-react";
import SignOutButton from "@/components/ui/SignOutButton";
import { tierDisplayName } from "@/lib/session";

// The staff desktop sidebar (docs/STAFF_APP.md section 8): grouped by the
// three levels, collapsible to a 64px rail, Settings, the light and dark
// switch and Sign out in the account menu at its foot. Styles: the
// sd-sidebar rules in app/styles/staff.css. Nav ids are DashboardShell's.

export type StaffNavId =
  | "home" | "module" | "drill" | "rush" | "live-guest" | "challenges"
  | "cocktails" | "knowledge" | "progress" | "badges" | "settings";

type NavEntry = { id: StaffNavId; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }> };

const NAV_GROUPS: { label: string | null; items: NavEntry[] }[] = [
  { label: null, items: [{ id: "home", label: "Today", Icon: House }] },
  { label: "Learn", items: [{ id: "module", label: "Modules", Icon: BookOpen }] },
  {
    label: "Practise",
    items: [
      { id: "drill", label: "Mixed Drill", Icon: Shuffle },
      { id: "live-guest", label: "Live Guest", Icon: MessageCircle },
      { id: "rush", label: "Saturday Rush", Icon: Timer },
      { id: "challenges", label: "Challenges", Icon: Puzzle },
    ],
  },
  {
    label: "Look it up",
    items: [
      { id: "cocktails", label: "Cocktails", Icon: Martini },
      { id: "knowledge", label: "Knowledge Base", Icon: Library },
    ],
  },
  { label: "Me", items: [{ id: "progress", label: "My progress", Icon: TrendingUp }] },
];

const COLLAPSE_KEY = "sbe-sd-sidebar-collapsed";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export default function StaffSidebar({
  active,
  onNavigate,
  lockedIds,
  displayName,
  plan,
  sponsored,
  dark,
  onToggleDark,
}: {
  active: StaffNavId;
  onNavigate: (id: StaffNavId) => void;
  /** Nav ids locked on this plan; they stay clickable. */
  lockedIds: StaffNavId[];
  displayName: string;
  plan: string;
  /** Trained through a venue's plan rather than their own. */
  sponsored: boolean;
  /** Dark mode is on (the shell holds it, see DashboardShell). */
  dark: boolean;
  onToggleDark: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Saved choice first; with none, narrow windows start as the rail.
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(COLLAPSE_KEY); } catch {}
    // One-time read of a browser-only preference on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(saved === null ? window.innerWidth < 1100 : saved === "1");
  }, []);

  function toggle() {
    setCollapsed((was) => {
      try { localStorage.setItem(COLLAPSE_KEY, was ? "0" : "1"); } catch {}
      return !was;
    });
    setMenuOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const current: StaffNavId = active === "badges" ? "progress" : active;
  const planLabel = sponsored && plan === "free" ? "Venue staff" : `${tierDisplayName(plan)} plan`;

  return (
    <aside className={`sd-sidebar${collapsed ? " is-collapsed" : ""}`}>
      <div className="sd-brand">
        <Image src="/logo.webp" alt="" width={32} height={32} className="sd-brand-logo" />
        <span className="sd-brand-name">Serve By Example</span>
        <button
          type="button"
          className="sd-icon-btn sd-collapse"
          onClick={toggle}
          aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
          title={`${collapsed ? "Expand" : "Collapse"} (Ctrl+B)`}
        >
          {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.75} aria-hidden /> : <PanelLeftClose size={18} strokeWidth={1.75} aria-hidden />}
        </button>
      </div>

      <nav className="sd-nav" aria-label="Training">
        {NAV_GROUPS.map((group) => (
          <div key={group.label ?? "top"} className="sd-nav-section">
            {group.label && <p className="sd-nav-group">{group.label}</p>}
            <ul>
              {group.items.map(({ id, label, Icon }) => {
                const locked = lockedIds.includes(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`sd-nav-item${current === id ? " is-active" : ""}`}
                      aria-current={current === id ? "page" : undefined}
                      aria-label={locked ? `${label}, on paid plans` : label}
                      title={collapsed ? label : undefined}
                      onClick={() => onNavigate(id)}
                    >
                      <Icon size={18} strokeWidth={1.75} aria-hidden />
                      <span className="sd-nav-label">{label}</span>
                      {locked && <Lock className="sd-nav-lock" size={13} strokeWidth={2} aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sd-account" ref={menuRef}>
        {menuOpen && (
          <div className="sd-account-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className="sd-account-item"
              onClick={() => { setMenuOpen(false); onNavigate("settings"); }}
            >
              <Settings size={16} strokeWidth={1.75} aria-hidden />
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              className="sd-account-item"
              onClick={() => { setMenuOpen(false); onToggleDark(); }}
            >
              {dark ? <Sun size={16} strokeWidth={1.75} aria-hidden /> : <Moon size={16} strokeWidth={1.75} aria-hidden />}
              {dark ? "Light mode" : "Dark mode"}
            </button>
            <SignOutButton className="sd-account-item">
              <LogOut size={16} strokeWidth={1.75} aria-hidden />
              Sign out
            </SignOutButton>
          </div>
        )}
        <button
          type="button"
          className={`sd-account-btn${active === "settings" ? " is-active" : ""}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          title={collapsed ? displayName : undefined}
        >
          <span className="sd-avatar" aria-hidden="true">{initials(displayName)}</span>
          <span className="sd-account-text">
            <span className="sd-account-name">{displayName}</span>
            <span className="sd-account-plan">{planLabel}</span>
          </span>
          <ChevronUp className="sd-account-chevron" size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
