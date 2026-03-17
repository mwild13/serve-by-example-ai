"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";
import DashboardTrainer from "@/components/DashboardTrainer";
import AdvancedScenarios from "@/components/AdvancedScenarios";
import CocktailLibrary from "@/components/CocktailLibrary";
import ProgressOverview from "@/components/ProgressOverview";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type NavItem = "home" | "bartending" | "sales" | "management" | "scenarios" | "cocktails" | "progress" | "settings";

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "bartending", label: "Bartending Training" },
  { id: "sales", label: "Sales Training" },
  { id: "management", label: "Management Training" },
  { id: "scenarios", label: "Advanced Scenarios" },
  { id: "cocktails", label: "Cocktail Library" },
  { id: "progress", label: "How I'm improving" },
  { id: "settings", label: "Settings" },
];

const TRAINER_MODULES: Partial<Record<NavItem, "bartending" | "sales" | "management">> = {
  home: undefined,
  bartending: "bartending",
  sales: "sales",
  management: "management",
};

const AVATAR_CHOICES = ["😀", "😎", "🙂", "🤠", "🥳", "🧠", "🫶", "😺"];

function StaffSettingsPanel({
  displayName,
  userEmail,
  savedAvatar,
  notifReminders,
  notifWeeklyDigest,
  notifAchievementAlerts,
}: {
  displayName: string;
  userEmail: string;
  savedAvatar: string;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  notifAchievementAlerts: boolean;
}) {
  const [avatar, setAvatar] = useState(savedAvatar || AVATAR_CHOICES[0]);
  const [profileName, setProfileName] = useState(displayName);
  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  const [enableReminders, setEnableReminders] = useState(notifReminders);
  const [enableWeeklyDigest, setEnableWeeklyDigest] = useState(notifWeeklyDigest);
  const [enableAchievementAlerts, setEnableAchievementAlerts] = useState(notifAchievementAlerts);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifError, setNotifError] = useState("");

  async function handleDisplayNameUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileName.trim()) {
      setProfileError("Name cannot be empty.");
      setProfileMessage("");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const trimmedName = profileName.trim();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: userError } = await supabase.auth.updateUser({
        data: { display_name: trimmedName },
      });
      if (userError) {
        throw userError;
      }

      if (user?.id) {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ display_name: trimmedName })
          .eq("id", user.id);

        if (profileUpdateError) {
          throw profileUpdateError;
        }
      }

      setProfileName(trimmedName);
      setProfileMessage("Name updated successfully.");
    } catch (updateError) {
      setProfileError(updateError instanceof Error ? updateError.message : "Unable to update name.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAvatarChange(option: string) {
    setAvatar(option);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from("profiles").update({ avatar: option }).eq("id", user.id);
      }
    } catch {
      // avatar state is already updated locally; silent fail
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

  return (
    <div className="staff-settings-wrap">
      <div className="card">
        <h3>Profile avatar</h3>
        <p>Choose a face emoji for your training identity.</p>
        <div className="staff-avatar-preview" aria-label="Selected avatar">
          <span>{avatar}</span>
          <strong>{profileName}</strong>
          <form
            className="staff-settings-form staff-avatar-name-form"
            onSubmit={handleDisplayNameUpdate}
          >
            <label className="label staff-avatar-name-label" htmlFor="staff-display-name">
              <input
                id="staff-display-name"
                className="input"
                type="text"
                aria-label="Display name"
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
        </div>
        {profileError ? <div className="auth-status auth-status-error">{profileError}</div> : null}
        {profileMessage ? <div className="auth-status auth-status-success">{profileMessage}</div> : null}
        <div className="staff-avatar-grid" role="listbox" aria-label="Avatar choices">
          {AVATAR_CHOICES.map((option) => (
            <button
              key={option}
              type="button"
              className={`staff-avatar-choice${avatar === option ? " active" : ""}`}
              onClick={() => handleAvatarChange(option)}
              aria-pressed={avatar === option}
            >
              {option}
            </button>
          ))}
        </div>
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

      <div className="card sbe-trust-card">
        <h3>Account activity</h3>
        <p>You&apos;re always in control of your account and training data.</p>
        <div className="sbe-trust-list">
          <div className="sbe-trust-row">
            <span className="sbe-trust-label">Last login</span>
            <span className="sbe-trust-value">Today, this session</span>
          </div>
          <div className="sbe-trust-row">
            <span className="sbe-trust-label">Active sessions</span>
            <span className="sbe-trust-value">1 session (this device)</span>
          </div>
          <div className="sbe-trust-row">
            <span className="sbe-trust-label">Training data usage</span>
            <span className="sbe-trust-value">Your responses are used only to generate your personal feedback scores. They are never shared with other staff or venues.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🚧</div>
      <h2 style={{ marginBottom: 8 }}>{label}</h2>
      <p style={{ color: "var(--text-soft)" }}>
        This module is coming soon. Keep training with the modules available now!
      </p>
    </div>
  );
}

const DAILY_CHALLENGES = [
  {
    emoji: "🍸",
    title: "Perfect the Martini",
    desc: "Describe the classic variants and how to read a guest's preference.",
    nav: "bartending" as NavItem,
  },
  {
    emoji: "💬",
    title: "Upsell without pressure",
    desc: "Practise guiding a guest from the house wine to a premium option.",
    nav: "sales" as NavItem,
  },
  {
    emoji: "🔥",
    title: "Survive a rush",
    desc: "Handle three simultaneous orders while keeping guests happy.",
    nav: "scenarios" as NavItem,
  },
  {
    emoji: "🤝",
    title: "Difficult guest recovery",
    desc: "Turn a frustrated guest into a loyal advocate in under 2 minutes.",
    nav: "scenarios" as NavItem,
  },
  {
    emoji: "📋",
    title: "Menu knowledge drill",
    desc: "Describe today's specials confidently and pair them with drinks.",
    nav: "bartending" as NavItem,
  },
  {
    emoji: "🧠",
    title: "Management mindset",
    desc: "Walk through how to brief a new hire on service standards.",
    nav: "management" as NavItem,
  },
  {
    emoji: "🎯",
    title: "Sales target scenario",
    desc: "Your venue needs to hit a cover target — walk through your plan.",
    nav: "sales" as NavItem,
  },
];

function RightPanel({ setActiveNav }: { setActiveNav: (nav: NavItem) => void }) {
  // Pick a challenge based on the day of the year so it rotates daily but is consistent per day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const challenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  const quickStarts: { emoji: string; label: string; nav: NavItem }[] = [
    { emoji: "🍹", label: "Bartending", nav: "bartending" },
    { emoji: "💼", label: "Sales", nav: "sales" },
    { emoji: "🎭", label: "Advanced Scenarios", nav: "scenarios" },
    { emoji: "📈", label: "My progress", nav: "progress" },
  ];

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
            <span className="rp-stat-value">🔥 1</span>
            <span className="rp-stat-key">Day streak</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">0</span>
            <span className="rp-stat-key">Sessions</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">—</span>
            <span className="rp-stat-key">Top score</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">0</span>
            <span className="rp-stat-key">Badges</span>
          </div>
        </div>
      </div>

      {/* Quick-start shortcuts */}
      <div className="rp-section">
        <p className="rp-label">Jump back in</p>
        <div className="rp-quickstart-list">
          {quickStarts.map((q) => (
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

export default function DashboardShell({
  displayName,
  plan,
  userEmail,
  savedAvatar,
  managementUnlockedInitial,
  notifReminders,
  notifWeeklyDigest,
  notifAchievementAlerts,
}: {
  displayName: string;
  plan: string;
  userEmail: string;
  savedAvatar: string;
  managementUnlockedInitial: boolean;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  notifAchievementAlerts: boolean;
}) {
  const [activeNav, setActiveNav] = useState<NavItem>("home");
  const [managementUnlocked, setManagementUnlocked] = useState(managementUnlockedInitial);
  const [managementCode, setManagementCode] = useState("");
  const [managementCodeError, setManagementCodeError] = useState("");
  const [managementCodeMessage, setManagementCodeMessage] = useState("");
  const [isUnlockingManagement, setIsUnlockingManagement] = useState(false);

  const isTrainerNav = activeNav in TRAINER_MODULES;
  const defaultModule = TRAINER_MODULES[activeNav];

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
      setActiveNav("management");
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
      <aside className="dashboard-sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 16 }}>
          <div style={{ backgroundColor: "#f5f5f5", padding: "6px", borderRadius: "8px", flexShrink: 0 }}>
            <Image src="/logo.ico" alt="SBE AI" width={38} height={38} style={{ borderRadius: 10, display: "block" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Serve By Example</span>
        </div>

        <div className="mockup-nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`mockup-nav-item${activeNav === item.id ? " active" : ""}`}
              onClick={() => setActiveNav(item.id)}
              style={{ cursor: "pointer" }}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            background: "white",
            border: "1px solid #e7decb",
            borderRadius: 22,
            padding: 18,
          }}
        >
          <strong style={{ display: "block", marginBottom: 6 }}>
            {plan === "multi-venue" ? "Multi-Venue plan" : plan === "single-venue" ? "Single Venue plan" : plan === "pro" ? "Pro plan" : "Free plan"}
          </strong>
          <div style={{ color: "var(--text-soft)", fontSize: ".95rem" }}>
            {plan === "free"
              ? "Demo access. Upgrade to unlock full modules."
              : plan === "pro"
              ? "Pro member access with bartender, sales and management modules."
              : "Venue plan access with team management dashboards."}
          </div>
        </div>

        <SignOutButton />
      </aside>

      <section className="dashboard-main">
        {activeNav === "management" && !managementUnlocked ? (
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
        ) : isTrainerNav ? (
          <DashboardTrainer
            key={activeNav}
            displayName={displayName}
            defaultModule={defaultModule}
          />
        ) : activeNav === "scenarios" ? (
          <AdvancedScenarios />
        ) : activeNav === "cocktails" ? (
          <CocktailLibrary />
        ) : activeNav === "progress" ? (
          <ProgressOverview displayName={displayName} plan={plan} />
        ) : activeNav === "settings" ? (
          <StaffSettingsPanel
            displayName={displayName}
            userEmail={userEmail}
            savedAvatar={savedAvatar}
            notifReminders={notifReminders}
            notifWeeklyDigest={notifWeeklyDigest}
            notifAchievementAlerts={notifAchievementAlerts}
          />
        ) : (
          <ComingSoon label={NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? activeNav} />
        )}
      </section>

      <aside className="dashboard-right">
        <RightPanel setActiveNav={setActiveNav} />
      </aside>
    </main>
  );
}
