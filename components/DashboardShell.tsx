"use client";

import { FormEvent, useState, useEffect, Suspense, lazy } from "react";
import Image from "next/image";
import SignOutButton from "@/components/ui/SignOutButton";
import DashboardTrainer from "@/components/learning-engine/DashboardTrainer";
import ModuleVerify from "@/components/learning-engine/ModuleVerify";
import ArenaPage from "@/components/learning-engine/ArenaPage";
import DiagnosticFlow from "@/components/learning-engine/DiagnosticFlow";
import DynamicModuleNav from "@/components/learning-engine/DynamicModuleNav";
import RapidFirePage from "@/components/learning-engine/RapidFirePage";
import ChallengesPage from "@/components/learning-engine/ChallengesPage";
import { CocktailGridSkeleton } from "@/components/ui/Skeletons";
const CocktailLibrary = lazy(() => import("@/components/knowledge-base/CocktailLibrary"));
const KnowledgeBase = lazy(() => import("@/components/knowledge-base/KnowledgeBase"));
import ProgressOverview from "@/components/learning-engine/ProgressOverview";
import PreShiftHome from "@/components/learning-engine/PreShiftHome";
import MobileDashboardV3 from "@/components/learning-engine/MobileDashboardV3";
const MobileLearnHub = lazy(() => import("@/components/learning-engine/MobileLearnHub"));
import SessionRefresher from "@/components/ui/SessionRefresher";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type NavItem = "home" | "mobile-learn" | "module" | "rapid-fire" | "stage4" | "scenarios" | "challenges" | "cocktails" | "knowledge" | "progress" | "badges" | "settings";

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "module", label: "Modules" },
  { id: "stage4", label: "Scenario Training" },
  { id: "scenarios", label: "AI Scenarios" },
  { id: "challenges", label: "Challenges" },
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
  initialJoinCode,
}: {
  displayName: string;
  userEmail: string;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  notifAchievementAlerts: boolean;
  initialJoinCode?: string;
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

  const [venueCode, setVenueCode] = useState(initialJoinCode ?? "");
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
    <>
      <div className="sbe-command-bar sbe-command-bar-active" style={{ marginBottom: 0 }}>
        <div>
          <span className="sbe-command-eyebrow">Me</span>
          <strong>Account &amp; Settings</strong>
        </div>
      </div>
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

      <div className="card">
        <h3>Language</h3>
        <p>Choose the language for your training content. Scenarios and scored feedback will be delivered in the language you select.</p>
        <LanguageSwitcher variant="drawer" />
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
    </>
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

// Persistent bottom nav — shown on all non-home mobile screens (z-index: 45)
function MobileBottomNavBar({
  activeNav,
  onNavigate,
}: {
  activeNav: NavItem;
  onNavigate: (id: NavItem) => void;
}) {
  const tabs = [
    {
      id: "home" as NavItem, label: "Home",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.2 12 3l9 7.2"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5.5h5V20"/></svg>,
    },
    {
      id: "mobile-learn" as NavItem, label: "Learn",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.5A1.5 1.5 0 0 0 5 20V4.5Z"/><path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H19"/></svg>,
    },
    {
      id: "progress" as NavItem, label: "Progress",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5v1.5A3 3 0 0 0 8 9.5M16 5h3v1.5a3 3 0 0 1-3 3M12 12v3.5M9 20h6M10 17.5h4"/></svg>,
    },
    {
      id: "settings" as NavItem, label: "Me",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></svg>,
    },
  ];

  const activeTab =
    activeNav === "mobile-learn" || activeNav === "module" || activeNav === "rapid-fire" ||
    activeNav === "stage4" || activeNav === "scenarios" || activeNav === "challenges" ||
    activeNav === "cocktails" || activeNav === "knowledge"
      ? "mobile-learn"
    : activeNav === "progress" || activeNav === "badges"
      ? "progress"
    : activeNav === "settings"
      ? "settings"
    : "home";

  return (
    <nav className="mobile-bottom-nav" role="tablist" aria-label="Main navigation">
      {tabs.map(({ id, label, icon }) => {
        const on = activeTab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={on}
            aria-label={label}
            onClick={() => onNavigate(id)}
            style={{
              flex: 1, minHeight: 44, minWidth: 44, border: "none", background: "transparent",
              cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 3, padding: 0, position: "relative",
              color: on ? "var(--gold-warm)" : "rgba(245,242,233,0.55)",
              fontFamily: "var(--font-manrope, system-ui, sans-serif)",
              transition: "color .2s ease",
            }}
          >
            {icon}
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
            {on && (
              <span style={{
                width: 4, height: 4, borderRadius: "50%", background: "var(--gold-warm)",
                position: "absolute", bottom: 7,
                boxShadow: "0 0 8px rgba(196,154,47,0.8)",
              }} />
            )}
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
  initialToken = "",
}: {
  displayName: string;
  plan: string;
  userEmail: string;
  managementUnlockedInitial: boolean;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  notifAchievementAlerts: boolean;
  hasVenueMembership?: boolean;
  initialToken?: string;
}) {
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [joinCodeFromUrl, setJoinCodeFromUrl] = useState<string | undefined>(undefined);
  const [managementUnlocked] = useState(managementUnlockedInitial);
  // Phase 4: Dynamic module system
  const [userId, setUserId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [userToken, setUserToken] = useState<string>(initialToken);

  // Initialize dark mode from localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem("sbe-dark-mode") === "1") {
        document.documentElement.classList.add("sbe-dark");
      }
    } catch {}
  }, []);

  // Auto-navigate to settings and pre-fill venue code if ?join= is in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get("join");
      if (joinCode) {
        setJoinCodeFromUrl(joinCode);
        setActiveNav("settings");
        const url = new URL(window.location.href);
        url.searchParams.delete("join");
        window.history.replaceState({}, "", url.toString());
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
          } else {
            // Show diagnostic if not completed (only for B2B users - check plan)
            const userPlan = profile?.plan || plan;
            const isBB2User = userPlan === "single-venue" || userPlan === "multi-venue";
            const hasDiagnostic = profile?.diagnostic_completed === true;

            if (!hasDiagnostic && isBB2User) {
              setShowDiagnostic(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking diagnostic status:", error);
      }
    }

    checkDiagnostic();
  }, [plan]);

  const PREMIUM_NAV_ITEMS: NavItem[] = ["module", "stage4", "scenarios", "cocktails", "knowledge"];
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

  return (
    <main className="dashboard-shell">
      <SessionRefresher />

      <aside className="dashboard-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 16 }}>
          <div style={{ backgroundColor: "#f5f5f5", padding: "6px", borderRadius: "8px", flexShrink: 0 }}>
            <Image src="/logo.png" alt="SBE" width={38} height={38} style={{ borderRadius: 10, display: "block" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Serve By Example</span>
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
            onComplete={() => {
              setShowDiagnostic(false);
              setActiveNav("module");
            }}
          />
        )}

        {activeNav === "module" ? (
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
                <ModuleVerify
                  key={`module-${selectedModuleId}`}
                  moduleId={selectedModuleId}
                  userId={userId}
                  onArena={() => handleNavClick("scenarios")}
                  nextModuleId={selectedModuleId < 40 ? selectedModuleId + 1 : undefined}
                  onComplete={() => setSelectedModuleId(selectedModuleId < 40 ? selectedModuleId + 1 : null)}
                />
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
            <RapidFirePage userId={userId} />
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
                onSelectModule={(id) => { setSelectedModuleId(id); handleNavClick("module"); }}
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
        ) : activeNav === "mobile-learn" ? (
          <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>}>
            <MobileLearnHub setActiveNav={handleNavClick} isPremium={isPremium} />
          </Suspense>
        ) : activeNav === "scenarios" ? (
          <ArenaPage userId={userId} />
        ) : activeNav === "challenges" ? (
          <ChallengesPage />
        ) : activeNav === "cocktails" ? (
          <Suspense fallback={<CocktailGridSkeleton count={12} />}>
            <CocktailLibrary />
          </Suspense>
        ) : activeNav === "knowledge" ? (
          <Suspense fallback={<CocktailGridSkeleton count={12} />}>
            <KnowledgeBase />
          </Suspense>
        ) : activeNav === "progress" ? (
          <ProgressOverview
            displayName={displayName}
            plan={plan}
            onSelectModule={(moduleId) => {
              setSelectedModuleId(moduleId);
              handleNavClick("module");
            }}
            onNavigate={(nav) => handleNavClick(nav as NavItem)}
          />
        ) : activeNav === "settings" ? (
          <StaffSettingsPanel
            displayName={displayName}
            userEmail={userEmail}
            notifReminders={notifReminders}
            notifWeeklyDigest={notifWeeklyDigest}
            notifAchievementAlerts={notifAchievementAlerts}
            initialJoinCode={joinCodeFromUrl}
          />
        ) : (
          <ComingSoon label={NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? activeNav} />
        )}

      </section>

      {/* Persistent mobile bottom nav — hidden on Home tab where MobileDashboardV3 renders its own nav */}
      {activeNav !== "home" && <MobileBottomNavBar activeNav={activeNav} onNavigate={handleNavClick} />}
    </main>
  );
}
