"use client";

import { FormEvent, useState, useEffect, Suspense, lazy } from "react";
import Image from "next/image";
import SignOutButton from "@/components/ui/SignOutButton";
import DashboardTrainer from "@/components/learning-engine/DashboardTrainer";
import StageLearning from "@/components/learning-engine/StageLearning";
import AdvancedScenarios from "@/components/learning-engine/AdvancedScenarios";
import DiagnosticFlow from "@/components/learning-engine/DiagnosticFlow";
import DynamicModuleNav from "@/components/learning-engine/DynamicModuleNav";
import RapidFirePage from "@/components/learning-engine/RapidFirePage";
import { CocktailGridSkeleton } from "@/components/ui/Skeletons";
const CocktailLibrary = lazy(() => import("@/components/knowledge-base/CocktailLibrary"));
const KnowledgeBase = lazy(() => import("@/components/knowledge-base/KnowledgeBase"));
import ProgressOverview from "@/components/learning-engine/ProgressOverview";
import PreShiftHome from "@/components/learning-engine/PreShiftHome";
import MobileDashboardV3 from "@/components/learning-engine/MobileDashboardV3";
import SessionRefresher from "@/components/ui/SessionRefresher";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type NavItem = "home" | "module" | "rapid-fire" | "stage4" | "scenarios" | "cocktails" | "knowledge" | "progress" | "settings";

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "module", label: "Modules" },
  { id: "rapid-fire", label: "Quick Drills" },
  { id: "stage4", label: "Scenario Training" },
  { id: "scenarios", label: "AI Scenarios" },
  { id: "cocktails", label: "Cocktail Library" },
  { id: "knowledge", label: "101 Knowledge Base" },
  { id: "progress", label: "How I'm improving" },
  { id: "settings", label: "Settings" },
];

function StaffSettingsPanel({
  displayName,
  userEmail,
  notifReminders,
  notifWeeklyDigest,
  notifAchievementAlerts,
}: {
  displayName: string;
  userEmail: string;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  notifAchievementAlerts: boolean;
}) {
  const [profileName, setProfileName] = useState(displayName);
  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  const [venueCode, setVenueCode] = useState("");
  const [joinVenueStatus, setJoinVenueStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [joinVenueMessage, setJoinVenueMessage] = useState("");

  const [enableReminders, setEnableReminders] = useState(notifReminders);
  const [enableWeeklyDigest, setEnableWeeklyDigest] = useState(notifWeeklyDigest);
  const [enableAchievementAlerts, setEnableAchievementAlerts] = useState(notifAchievementAlerts);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifError, setNotifError] = useState("");

  async function handleDisplayNameUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = profileName.trim();
    if (!trimmedName) {
      setProfileError("Name cannot be empty.");
      setProfileMessage("");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/profile/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ displayName: trimmedName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update name.");

      setProfileName(trimmedName);
      setProfileMessage("Name updated successfully.");
    } catch (updateError) {
      setProfileError(updateError instanceof Error ? updateError.message : "Unable to update name.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleEmailUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingSecurity(true);
    setSecurityError("");
    setSecurityMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ email: email.trim() });

      if (error) {
        throw error;
      }

      setSecurityMessage("Email update requested. Check your inbox to confirm the new address.");
    } catch (updateError) {
      setSecurityError(updateError instanceof Error ? updateError.message : "Unable to update email.");
    } finally {
      setIsSavingSecurity(false);
    }
  }

  async function handleNotificationsSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingNotifications(true);
    setNotifMessage("");
    setNotifError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");
      const { error } = await supabase
        .from("profiles")
        .update({
          notif_reminders: enableReminders,
          notif_weekly_digest: enableWeeklyDigest,
          notif_achievement_alerts: enableAchievementAlerts,
        })
        .eq("id", user.id);
      if (error) throw error;
      setNotifMessage("Notification preferences saved.");
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setIsSavingNotifications(false);
    }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingSecurity(true);
    setSecurityError("");
    setSecurityMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: password.trim() });

      if (error) {
        throw error;
      }

      setPassword("");
      setSecurityMessage("Password updated successfully.");
    } catch (updateError) {
      setSecurityError(updateError instanceof Error ? updateError.message : "Unable to update password.");
    } finally {
      setIsSavingSecurity(false);
    }
  }

  async function handleJoinVenue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = parseInt(venueCode.trim(), 10);
    if (isNaN(code)) {
      setJoinVenueStatus("error");
      setJoinVenueMessage("Please enter a valid venue code.");
      return;
    }
    setJoinVenueStatus("loading");
    setJoinVenueMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/management/join-venue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ venueCode: code }),
      });
      const data = await res.json() as { success?: boolean; venueName?: string; alreadyLinked?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not join venue.");
      setJoinVenueStatus("success");
      setJoinVenueMessage(
        data.alreadyLinked
          ? `Already connected to ${data.venueName}.`
          : `Connected to ${data.venueName}. Your training progress is now visible to your manager.`
      );
      setVenueCode("");
    } catch (err) {
      setJoinVenueStatus("error");
      setJoinVenueMessage(err instanceof Error ? err.message : "Could not join venue.");
    }
  }

  return (
    <div className="staff-settings-wrap">
      <div className="card">
        <h3>Display name</h3>
        <p>Update the name shown across your training dashboard.</p>
        <form className="staff-settings-form" onSubmit={handleDisplayNameUpdate}>
          <label className="label" htmlFor="staff-display-name">
            Display name
            <input
              id="staff-display-name"
              className="input"
              type="text"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Your display name"
              required
            />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={isSavingProfile}>
            {isSavingProfile ? "Saving..." : "Change name"}
          </button>
        </form>
        {profileError ? <div className="auth-status auth-status-error">{profileError}</div> : null}
        {profileMessage ? <div className="auth-status auth-status-success">{profileMessage}</div> : null}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Account security</h3>
          <p>Update your login email or reset your password anytime.</p>
          <form className="staff-settings-form" onSubmit={handleEmailUpdate}>
            <label className="label" htmlFor="staff-email">
              Login email
              <input
                id="staff-email"
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn btn-secondary" disabled={isSavingSecurity}>
              {isSavingSecurity ? "Saving..." : "Update email"}
            </button>
          </form>

          <form className="staff-settings-form" onSubmit={handlePasswordUpdate}>
            <label className="label" htmlFor="staff-password">
              New password
              <input
                id="staff-password"
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                placeholder="At least 6 characters"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isSavingSecurity}>
              {isSavingSecurity ? "Saving..." : "Update password"}
            </button>
          </form>

          {securityError ? <div className="auth-status auth-status-error">{securityError}</div> : null}
          {securityMessage ? <div className="auth-status auth-status-success">{securityMessage}</div> : null}
        </div>

        <div className="card">
          <h3>Training notifications</h3>
          <p>Control reminder style and achievement updates.</p>
          <form className="staff-settings-form" onSubmit={handleNotificationsSave}>
            <div className="staff-toggle-list">
              <label>
                <input type="checkbox" checked={enableReminders} onChange={(event) => setEnableReminders(event.target.checked)} />
                <span>Daily training reminders</span>
              </label>
              <label>
                <input type="checkbox" checked={enableWeeklyDigest} onChange={(event) => setEnableWeeklyDigest(event.target.checked)} />
                <span>Weekly progress digest</span>
              </label>
              <label>
                <input type="checkbox" checked={enableAchievementAlerts} onChange={(event) => setEnableAchievementAlerts(event.target.checked)} />
                <span>Badge and streak alerts</span>
              </label>
            </div>
            {notifError ? <div className="auth-status auth-status-error">{notifError}</div> : null}
            {notifMessage ? <div className="auth-status auth-status-success">{notifMessage}</div> : null}
            <button type="submit" className="btn btn-secondary" disabled={isSavingNotifications}>
              {isSavingNotifications ? "Saving..." : "Save preferences"}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h3>Display theme</h3>
        <p>Switch to an industrial dark theme for the learning console — easier on the eyes in dimly lit bars.</p>
        <div className="staff-toggle-list">
          <label>
            <input
              type="checkbox"
              checked={typeof window !== "undefined" && document.documentElement.classList.contains("sbe-dark")}
              onChange={(event) => {
                if (event.target.checked) {
                  document.documentElement.classList.add("sbe-dark");
                  try { localStorage.setItem("sbe-dark-mode", "1"); } catch {}
                } else {
                  document.documentElement.classList.remove("sbe-dark");
                  try { localStorage.setItem("sbe-dark-mode", "0"); } catch {}
                }
              }}
            />
            <span>Dark mode (industrial theme)</span>
          </label>
        </div>
      </div>

      <div className="card sbe-trust-card">
        <h3>Account activity</h3>
        <p>You&apos;re always in control of your account and training data.</p>
        <div className="sbe-trust-list">
          <div className="sbe-trust-row">
            <span className="sbe-trust-label">Last login</span>
            <span className="sbe-trust-value">Current session</span>
          </div>
          <div className="sbe-trust-row">
            <span className="sbe-trust-label">Training data usage</span>
            <span className="sbe-trust-value">Your responses are used only to generate your personal feedback scores. They are never shared with other staff or venues.</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Join your venue</h3>
        <p>Enter the code your manager shares with you to link your training progress to their dashboard.</p>
        {joinVenueStatus === "success" ? (
          <div className="auth-status auth-status-success" style={{ marginTop: "0.75rem" }}>{joinVenueMessage}</div>
        ) : (
          <form className="staff-settings-form" onSubmit={handleJoinVenue}>
            <label className="label" htmlFor="venue-code-input">
              Venue code
              <input
                id="venue-code-input"
                className="input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={venueCode}
                onChange={(e) => setVenueCode(e.target.value)}
                placeholder="e.g. 4821"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={joinVenueStatus === "loading"}>
              {joinVenueStatus === "loading" ? "Connecting..." : "Connect to venue"}
            </button>
            {joinVenueStatus === "error" && (
              <div className="auth-status auth-status-error">{joinVenueMessage}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "1rem", marginBottom: 16, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Coming soon</div>
      <h2 style={{ marginBottom: 8 }}>{label}</h2>
      <p style={{ color: "var(--text-soft)" }}>
        This module is coming soon. Keep training with the modules available now!
      </p>
    </div>
  );
}

const DAILY_CHALLENGES = [
  {
    emoji: "◉",
    title: "Perfect the Martini",
    desc: "Describe the classic variants and how to read a guest's preference.",
    nav: "rapid-fire" as NavItem,
  },
  {
    emoji: "→",
    title: "Upsell without pressure",
    desc: "Practise guiding a guest from the house wine to a premium option.",
    nav: "rapid-fire" as NavItem,
  },
  {
    emoji: "↑",
    title: "Survive a rush",
    desc: "Handle three simultaneous orders while keeping guests happy.",
    nav: "scenarios" as NavItem,
  },
  {
    emoji: "◆",
    title: "Difficult guest recovery",
    desc: "Turn a frustrated guest into a loyal advocate in under 2 minutes.",
    nav: "scenarios" as NavItem,
  },
  {
    emoji: "≡",
    title: "Menu knowledge drill",
    desc: "Describe today's specials confidently and pair them with drinks.",
    nav: "rapid-fire" as NavItem,
  },
  {
    emoji: "▣",
    title: "Management mindset",
    desc: "Walk through how to brief a new hire on service standards.",
    nav: "rapid-fire" as NavItem,
  },
  {
    emoji: "◈",
    title: "Sales target scenario",
    desc: "Your venue needs to hit a cover target — walk through your plan.",
    nav: "rapid-fire" as NavItem,
  },
];

function RightPanel({
  setActiveNav,
  plan,
}: {
  setActiveNav: (nav: NavItem) => void;
  plan: string;
}) {
  const isPremium = plan !== "free";
  // Pick a challenge based on the day of the year so it rotates daily but is consistent per day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const challenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  const quickStarts: { emoji: string; label: string; nav: NavItem }[] = [
    { emoji: "◆", label: "Modules", nav: "module" },
    { emoji: "→", label: "Scenario Training", nav: "stage4" },
    { emoji: "↑", label: "My progress", nav: "progress" },
    { emoji: "◉", label: "Settings", nav: "settings" },
  ];
  const filteredQuickStarts = isPremium ? quickStarts : quickStarts.filter((q) => q.nav === "progress");

  // Fetch real stats
  const [stats, setStats] = useState({ sessions: 0, topScore: 0, badges: 0, loaded: false });
  useEffect(() => {
    async function loadStats() {
      try {
        const sb = createSupabaseBrowserClient();
        const { data: { session } } = await sb.auth.getSession();
        const r = await fetch("/api/training/progress", {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        const res = await r.json();
        if (res.sessions) {
          const totalSessions = (res.sessions.bartending ?? 0) + (res.sessions.sales ?? 0) + (res.sessions.management ?? 0);
          const topScore = Math.max(res.scores?.bartending ?? 0, res.scores?.sales ?? 0, res.scores?.management ?? 0);
          let badges = 0;
          for (const mod of ["bartending", "sales", "management"]) {
            const lp = res.levelProgress?.[mod];
            if (lp) {
              if (lp.level1_completed) badges++;
              if (lp.level2_completed) badges++;
              if (lp.level3_completed) badges++;
            }
            if ((res.sessions?.[mod] ?? 0) >= 1 && (res.scores?.[mod] ?? 0) >= 21) badges++;
          }
          setStats({ sessions: totalSessions, topScore: Math.round(topScore), badges, loaded: true });
        }
      } catch { /* non-critical */ }
    }
    void loadStats();
  }, []);

  return (
    <>
      {/* Daily challenge */}
      <div className="rp-section">
        <p className="rp-label">Daily challenge</p>
        <div className="rp-challenge-card">
          <span className="rp-challenge-emoji">{challenge.emoji}</span>
          <div>
            <strong className="rp-challenge-title">{challenge.title}</strong>
            <p className="rp-challenge-desc">{challenge.desc}</p>
          </div>
          <button
            className="btn btn-primary rp-challenge-btn"
            onClick={() => setActiveNav(challenge.nav)}
            type="button"
          >
            Start
          </button>
        </div>
      </div>

      {/* Stats / streak */}
      <div className="rp-section">
        <p className="rp-label">Your stats</p>
        <div className="rp-stats-grid">
          <div className="rp-stat">
            <span className="rp-stat-value">{stats.loaded ? stats.sessions : "—"}</span>
            <span className="rp-stat-key">Sessions</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">{stats.loaded ? (stats.topScore > 0 ? `${stats.topScore}/25` : "—") : "—"}</span>
            <span className="rp-stat-key">Top score</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">{stats.loaded ? stats.badges : "—"}</span>
            <span className="rp-stat-key">Badges</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">{isPremium ? "Pro" : "Free"}</span>
            <span className="rp-stat-key">Plan</span>
          </div>
        </div>
      </div>

      {/* Quick-start shortcuts */}
      <div className="rp-section">
        <p className="rp-label">Jump back in</p>
        <div className="rp-quickstart-list">
          {filteredQuickStarts.map((q) => (
            <button
              key={q.nav}
              className="rp-quickstart-btn"
              onClick={() => setActiveNav(q.nav)}
              type="button"
            >
              <span className="rp-quickstart-emoji">{q.emoji}</span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// Persistent bottom nav rendered on all mobile screens (z-index: 45, below V3 home overlay at 50)
function MobileBottomNavBar({
  activeNav,
  onNavigate,
}: {
  activeNav: NavItem;
  onNavigate: (id: NavItem) => void;
}) {
  const tabs = [
    { id: "home" as NavItem,       label: "Home",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-9z"/></svg> },
    { id: "module" as NavItem,     label: "Modules", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19h15"/></svg> },
    { id: "rapid-fire" as NavItem, label: "Drills",  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg> },
    { id: "cocktails" as NavItem,  label: "Library", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M9 3h6M10 3v6L4 19a2 2 0 002 2h12a2 2 0 002-2L14 9V3"/></svg> },
    { id: "progress" as NavItem,   label: "Me",      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg> },
  ];
  // Map activeNav to which tab is highlighted
  const activeTab =
    activeNav === "module" ? "module" :
    activeNav === "rapid-fire" ? "rapid-fire" :
    activeNav === "cocktails" || activeNav === "knowledge" ? "cocktails" :
    activeNav === "progress" || activeNav === "settings" ? "progress" :
    "home";

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map(({ id, label, icon }) => {
        const on = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "6px 4px 8px", color: on ? "var(--ip-parchment)" : "rgba(255,255,255,0.45)",
              flex: 1, position: "relative",
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            }}
          >
            {on && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 18, height: 2, background: "var(--ip-amber)",
              }} />
            )}
            {icon}
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default function DashboardShell({
  displayName,
  plan,
  userEmail,
  managementUnlockedInitial,
  notifReminders,
  notifWeeklyDigest,
  notifAchievementAlerts,
  hasVenueMembership = false,
}: {
  displayName: string;
  plan: string;
  userEmail: string;
  managementUnlockedInitial: boolean;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  notifAchievementAlerts: boolean;
  hasVenueMembership?: boolean;
}) {
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [managementUnlocked, setManagementUnlocked] = useState(managementUnlockedInitial);
  const [managementCode, setManagementCode] = useState("");
  const [managementCodeError, setManagementCodeError] = useState("");
  const [managementCodeMessage, setManagementCodeMessage] = useState("");
  const [isUnlockingManagement, setIsUnlockingManagement] = useState(false);

  // Phase 4: Dynamic module system
  const [userId, setUserId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);
  const [userToken, setUserToken] = useState<string>("");

  // Initialize dark mode from localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem("sbe-dark-mode") === "1") {
        document.documentElement.classList.add("sbe-dark");
      }
    } catch {}
  }, []);

  // Phase 4: Check diagnostic completion status and get user token
  useEffect(() => {
    async function checkDiagnostic() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          setUserToken(session.access_token);
          setUserId(session.user.id);

          // Check if user has completed diagnostic
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("diagnostic_completed, plan")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("[DashboardShell] Error fetching diagnostic status:", profileError);
            // Default to not showing diagnostic on error
            setDiagnosticCompleted(true);
          } else {
            // Show diagnostic if not completed (only for B2B users - check plan)
            const userPlan = profile?.plan || plan;
            const isBB2User = userPlan === "single-venue" || userPlan === "multi-venue";
            const hasDiagnostic = profile?.diagnostic_completed === true;

            if (!hasDiagnostic && isBB2User) {
              setShowDiagnostic(true);
            } else {
              setDiagnosticCompleted(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking diagnostic status:", error);
        setDiagnosticCompleted(true); // Allow access even if check fails
      }
    }

    checkDiagnostic();
  }, [plan]);

  const planTitle =
    plan === "multi-venue"
      ? "Multi-Venue plan"
      : plan === "single-venue"
      ? "Single Venue plan"
      : plan === "pro"
      ? "Pro plan"
      : "Free plan";

  const planMessage =
    plan === "free"
      ? "Demo access. Upgrade to unlock full modules."
      : plan === "pro"
      ? "Pro member access with bartender, sales and management modules."
      : "Venue plan access with team management dashboards.";

  const PREMIUM_NAV_ITEMS: NavItem[] = ["module", "rapid-fire", "stage4", "scenarios", "cocktails", "knowledge"];
  const FALLBACK_ADMIN_EMAILS = [
    "wild07man@gmail.com",
    "mitchellwildman1994@gmail.com",
    "campbell.wildman@gmail.com",
    "grahamwi@bigpond.com",
    "wildmanemmet@gmail.com",
    "hjallanson@gmail.com",
    "hello@studio-ell.com.au",
  ];
  const envAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const ADMIN_EMAILS = envAdminEmails.length > 0 ? envAdminEmails : FALLBACK_ADMIN_EMAILS;
  const isAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());
  const isPremium = isAdmin || plan !== "free" || hasVenueMembership;

  function handleNavClick(id: NavItem) {
    if (!isPremium && PREMIUM_NAV_ITEMS.includes(id)) {
      window.location.href = "/pricing";
      return;
    }
    setActiveNav(id);
  }

  async function handleManagementUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = managementCode.trim();

    if (!normalizedCode) {
      setManagementCodeError("Enter your manager-provided code.");
      setManagementCodeMessage("");
      return;
    }

    if (!/^\d{2,3}$/.test(normalizedCode)) {
      setManagementCodeError("Venue code must be a 2 or 3 digit number.");
      setManagementCodeMessage("");
      return;
    }

    setIsUnlockingManagement(true);
    setManagementCodeError("");
    setManagementCodeMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You need to sign in again.");
      }

      const codeAsNumber = Number(normalizedCode);

      const { data: managerMatch, error: managerLookupError } = await supabase
        .from("venues")
        .select("id")
        .eq("venue_code", codeAsNumber)
        .limit(1)
        .maybeSingle();

      if (managerLookupError) {
        throw managerLookupError;
      }

      if (!managerMatch) {
        throw new Error("That code was not recognised. Check with your venue manager.");
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .update({ management_unlocked: true })
        .eq("id", user.id);

      if (saveError) {
        throw saveError;
      }

      setManagementUnlocked(true);
      setManagementCode("");
      setManagementCodeMessage("Management Training unlocked.");
      setActiveNav("stage4");
    } catch (unlockError) {
      setManagementCodeError(
        unlockError instanceof Error ? unlockError.message : "Could not unlock management training.",
      );
    } finally {
      setIsUnlockingManagement(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <SessionRefresher />

      <aside className="dashboard-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 16 }}>
          <div style={{ backgroundColor: "#f5f5f5", padding: "6px", borderRadius: "8px", flexShrink: 0 }}>
            <Image src="/logo.png" alt="SBE AI" width={38} height={38} style={{ borderRadius: 10, display: "block" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Serve By Example</span>
        </div>

        <div style={{ marginBottom: 12, color: "#fff", fontSize: "0.93rem", fontWeight: 500 }}>
          Welcome back, {displayName}
        </div>

        <div className="mockup-nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className={`mockup-nav-item${activeNav === item.id ? " active" : ""}${
                !isPremium && PREMIUM_NAV_ITEMS.includes(item.id) ? " mockup-nav-item-locked" : ""
              }`}
              onClick={() => handleNavClick(item.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleNavClick(item.id); } }}
              aria-current={activeNav === item.id ? "page" : undefined}
              aria-label={!isPremium && PREMIUM_NAV_ITEMS.includes(item.id) ? `${item.label} (locked)` : item.label}
            >
              {!isPremium && PREMIUM_NAV_ITEMS.includes(item.id) ? `${item.label} (locked)` : item.label}
            </div>
          ))}
        </div>

        <div className="dashboard-sidebar-signout">
          <SignOutButton />
        </div>
      </aside>

      <section className="dashboard-main">
        {/* Phase 4: Show diagnostic modal if not completed */}
        {showDiagnostic && userToken && (
          <DiagnosticFlow
            userId={userId}
            userToken={userToken}
            onComplete={(categoryScores) => {
              setShowDiagnostic(false);
              setDiagnosticCompleted(true);
              // Redirect to module training
              setActiveNav("module");
            }}
          />
        )}

        {false && !managementUnlocked ? (
          <div className="management-unlock-card">
            <div className="eyebrow">Manager code required</div>
            <h2>Unlock Management Training</h2>
            <p>
              This section is restricted by your venue manager. Enter your venue&apos;s Management
              Training code to continue.
            </p>
            <form className="management-unlock-form" onSubmit={handleManagementUnlock}>
              <label className="label" htmlFor="management-code-input">
                Venue manager code
                <input
                  id="management-code-input"
                  className="input"
                  type="text"
                  value={managementCode}
                  onChange={(event) => setManagementCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                  placeholder="120"
                  autoCapitalize="characters"
                  required
                />
              </label>
              {managementCodeError ? (
                <div className="auth-status auth-status-error">{managementCodeError}</div>
              ) : null}
              {managementCodeMessage ? (
                <div className="auth-status auth-status-success">{managementCodeMessage}</div>
              ) : null}
              <button className="btn btn-primary" type="submit" disabled={isUnlockingManagement}>
                {isUnlockingManagement ? "Checking..." : "Unlock management section"}
              </button>
            </form>
          </div>
        ) : activeNav === "module" ? (
          <div key="module">
            {selectedModuleId ? (
              /* Training view — replaces module grid */
              <div>
                <button
                  onClick={() => setSelectedModuleId(null)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "20px",
                    padding: "8px 16px",
                    background: "transparent",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  ← All Modules
                </button>
                <StageLearning key={`module-${selectedModuleId}`} moduleId={selectedModuleId} managementUnlocked={managementUnlocked} />
              </div>
            ) : (
              /* Module grid */
              <DynamicModuleNav
                userId={userId}
                userEmail={userEmail}
                userToken={userToken}
                onModuleSelect={(moduleId) => setSelectedModuleId(moduleId)}
                selectedModuleId={selectedModuleId || undefined}
              />
            )}
          </div>
        ) : activeNav === "rapid-fire" ? (
          <div key="rapid-fire">
            <RapidFirePage managementUnlocked={managementUnlocked} />
          </div>
        ) : activeNav === "stage4" ? (
          <DashboardTrainer
            key="stage4"
            displayName={displayName}
            userEmail={userEmail}
            managementUnlocked={managementUnlocked}
          />
        ) : activeNav === "home" ? (
          <>
            <div className="mobile-v3-only">
              <MobileDashboardV3
                key="home-mobile"
                displayName={displayName}
                setActiveNav={handleNavClick}
                plan={hasVenueMembership && plan === "free" ? "venue_member" : plan}
              />
            </div>
            <div className="desktop-psh-only">
              <PreShiftHome
                key="home"
                displayName={displayName}
                setActiveNav={handleNavClick}
                managementUnlocked={managementUnlocked}
              />
            </div>
          </>
        ) : activeNav === "scenarios" ? (
          <AdvancedScenarios />
        ) : activeNav === "cocktails" ? (
          <Suspense fallback={<CocktailGridSkeleton count={12} />}>
            <CocktailLibrary />
          </Suspense>
        ) : activeNav === "knowledge" ? (
          <Suspense fallback={<CocktailGridSkeleton count={12} />}>
            <KnowledgeBase />
          </Suspense>
        ) : activeNav === "progress" ? (
          <ProgressOverview displayName={displayName} plan={plan} />
        ) : activeNav === "settings" ? (
          <StaffSettingsPanel
            displayName={displayName}
            userEmail={userEmail}
            notifReminders={notifReminders}
            notifWeeklyDigest={notifWeeklyDigest}
            notifAchievementAlerts={notifAchievementAlerts}
          />
        ) : (
          <ComingSoon label={NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? activeNav} />
        )}

        <div className="dashboard-mobile-footer-actions">
          <SignOutButton />
        </div>
      </section>

      <aside className="dashboard-right">
        <RightPanel setActiveNav={handleNavClick} plan={hasVenueMembership && plan === "free" ? "venue_member" : plan} />
      </aside>

      {/* Persistent mobile bottom nav — sits at z-index 45, below V3 home overlay (50) */}
      <MobileBottomNavBar activeNav={activeNav} onNavigate={handleNavClick} />
    </main>
  );
}
