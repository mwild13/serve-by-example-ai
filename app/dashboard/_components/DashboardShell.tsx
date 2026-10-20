"use client";

import { FormEvent, useState, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSessionGuard } from "@/lib/use-auth-session-guard";
import { isB2BTier } from "@/lib/session";
import ModuleVerify from "@/app/dashboard/_components/ModuleVerify";
import LiveGuestPage from "@/app/dashboard/_components/LiveGuestPage";
import DiagnosticFlow from "@/app/dashboard/_components/DiagnosticFlow";
import ModulesPage from "@/app/dashboard/_components/modules/ModulesPage";
import DrillPage from "@/app/dashboard/_components/DrillPage";
import RushPage from "@/app/dashboard/_components/RushPage";
import ChallengesPage from "@/app/dashboard/_components/ChallengesPage";
import { CocktailGridSkeleton } from "@/components/ui/Skeletons";
const CocktailLibrary = lazy(() => import("@/app/dashboard/_components/knowledge-base/CocktailLibrary"));
const KnowledgeBase = lazy(() => import("@/app/dashboard/_components/knowledge-base/KnowledgeBase"));
import MyProgressPage from "@/app/dashboard/_components/progress/MyProgressPage";
import TodayPage from "@/app/dashboard/_components/today/TodayPage";
import StaffSidebar, { type StaffNavId } from "@/app/dashboard/_components/shell/StaffSidebar";
import SessionRefresher from "@/components/ui/SessionRefresher";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { openBillingPortal } from "@/lib/billing-portal";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { normalizeVenueCode } from "@/lib/venue-code";

type NavItem = StaffNavId;

function StaffSettingsPanel({
  displayName,
  userEmail,
  notifReminders,
  notifWeeklyDigest,
  initialJoinCode,
  hasBillingAccount,
}: {
  displayName: string;
  userEmail: string;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  initialJoinCode?: string;
  hasBillingAccount: boolean;
}) {
  const router = useRouter();
  const [profileName, setProfileName] = useState(displayName);
  const [email, setEmail] = useState(userEmail);
  const [password, setPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // ── Subscription and billing ── a paying staff member manages or cancels
  // their own plan in the Stripe portal, the same one the Manager Console opens.
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  async function handleManageBilling() {
    setBillingLoading(true);
    setBillingError("");
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const failure = await openBillingPortal(session?.access_token, "dashboard");
    if (failure) {
      setBillingError(failure);
      setBillingLoading(false);
    }
  }

  const [venueCode, setVenueCode] = useState(initialJoinCode ?? "");
  const [joinVenueStatus, setJoinVenueStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [joinVenueMessage, setJoinVenueMessage] = useState("");

  const [enableReminders, setEnableReminders] = useState(notifReminders);
  const [enableWeeklyDigest, setEnableWeeklyDigest] = useState(notifWeeklyDigest);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifError, setNotifError] = useState("");

  // ── Delete account ── same route and DELETE phrase as mobile Settings
  // (app/mobile/_components/SettingsScreen.tsx). See
  // app/api/profile/delete/route.ts for what is deleted vs kept.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
      // The panel takes its starting values from the server page, and it is
      // remounted each time Settings opens, so refresh the page's data or
      // the old name comes back until a full reload.
      router.refresh();
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
      // Goes through the API: clients can no longer write profiles directly
      // (audit 2026-09-30, Phase 2). Achievement alerts are no longer stored —
      // see app/api/profile/notifications/route.ts.
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in.");
      const res = await fetch("/api/profile/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ notifReminders: enableReminders, notifWeeklyDigest: enableWeeklyDigest }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save preferences.");
      setNotifMessage("Notification preferences saved.");
      // Same as the name: without this, reopening Settings shows the old ticks.
      router.refresh();
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setIsSavingNotifications(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in.");
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ confirm: deleteConfirmText }),
      });
      if (!res.ok) {
        // 409s carry a user-facing reason (active subscription, venue owner).
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(res.status === 409 && data.error ? data.error : "Could not delete your account. Please try again.");
      }
      // The auth user no longer exists; clear the local session too.
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete your account. Please try again.");
      setIsDeleting(false);
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

  async function submitJoinVenue(code: string) {
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

  async function handleJoinVenue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = normalizeVenueCode(venueCode);
    if (!code) {
      setJoinVenueStatus("error");
      setJoinVenueMessage("Please enter a valid venue code.");
      return;
    }
    await submitJoinVenue(code);
  }

  // Arriving via the "Staff sign-up link" (?join=CODE) used to only
  // pre-fill this field and leave the new staff member to notice it and
  // click "Connect to venue" themselves — silently missing that step meant
  // they never actually joined, and the manager's staff/compliance counts
  // never included them. That link's own copy promises "join your venue
  // directly", so auto-submit once here rather than waiting for a manual
  // click. Ref-guarded so it only ever fires once per mount, and a manual
  // code entry (no initialJoinCode) is completely unaffected.
  const hasAutoJoined = useRef(false);
  useEffect(() => {
    if (!initialJoinCode || hasAutoJoined.current) return;
    const code = normalizeVenueCode(initialJoinCode);
    if (!code) return;
    hasAutoJoined.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberately kicking off the join request as soon as this one-time deep-link condition is met, not syncing from an external source.
    submitJoinVenue(code);
  }, [initialJoinCode]);

  return (
    <div className="sd-page">
      <header className="sd-head">
        <p className="sd-kicker">Account</p>
        <h1 className="sd-title">Settings</h1>
      </header>
      <div className="sd-docket sd-settings">
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
          <p>Choose which training emails you get. Both are off until you turn them on.</p>
          <form className="staff-settings-form" onSubmit={handleNotificationsSave}>
            <div className="staff-toggle-list">
              <label>
                <input type="checkbox" checked={enableReminders} onChange={(event) => setEnableReminders(event.target.checked)} />
                <span>Sunday night training reminders</span>
              </label>
              <label>
                <input type="checkbox" checked={enableWeeklyDigest} onChange={(event) => setEnableWeeklyDigest(event.target.checked)} />
                <span>Monday weekly progress digest</span>
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
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={8}
                value={venueCode}
                onChange={(e) => setVenueCode(e.target.value.toUpperCase())}
                placeholder="e.g. K7P3QX"
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

      {hasBillingAccount && (
        <div className="card">
          <h3>Subscription and billing</h3>
          <p>Update your card, download invoices, or cancel your plan. This opens our secure billing page, run by Stripe.</p>
          <button type="button" className="btn btn-primary" onClick={handleManageBilling} disabled={billingLoading}>
            {billingLoading ? "Opening..." : "Manage billing"}
          </button>
          {billingError && <div className="auth-status auth-status-error">{billingError}</div>}
        </div>
      )}

      <div className="card">
        <h3>Delete account</h3>
        <p>Permanently delete your account, sign-in and training history. Your venue keeps its roster record of you, without your progress.</p>
        {!deleteOpen ? (
          <button type="button" className="btn btn-secondary" style={{ color: "var(--red-text)" }} onClick={() => setDeleteOpen(true)}>
            Delete account
          </button>
        ) : (
          <form className="staff-settings-form" onSubmit={handleDeleteAccount}>
            <label className="label" htmlFor="delete-account-confirm">
              This can&apos;t be undone. Type DELETE to confirm.
              <input
                id="delete-account-confirm"
                className="input"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </label>
            {deleteError ? <div className="auth-status auth-status-error">{deleteError}</div> : null}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "var(--red-text)", borderColor: "var(--red-text)" }}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Permanently delete"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setDeleteOpen(false); setDeleteConfirmText(""); setDeleteError(""); }}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </div>
  );
}

export default function DashboardShell({
  displayName,
  plan,
  userEmail,
  managementUnlockedInitial: _managementUnlockedInitial,
  notifReminders,
  notifWeeklyDigest,
  hasVenueMembership = false,
  venueMembershipPaused = false,
  hasBillingAccount = false,
  initialToken = "",
  checkoutSuccess = false,
  initialNav,
}: {
  displayName: string;
  plan: string;
  userEmail: string;
  managementUnlockedInitial: boolean;
  notifReminders: boolean;
  notifWeeklyDigest: boolean;
  hasVenueMembership?: boolean;
  venueMembershipPaused?: boolean;
  hasBillingAccount?: boolean;
  initialToken?: string;
  checkoutSuccess?: boolean;
  initialNav?: string;
}) {
  const router = useRouter();

  // Auth safety guard: detect and recover from cookie/localStorage desync
  const [authErrorMessage, setAuthErrorMessage] = useState("");
  const authGuard = useAuthSessionGuard((msg) => setAuthErrorMessage(msg));

  const NAV_IDS = new Set<NavItem>(["home","module","drill","rush","live-guest","challenges","cocktails","knowledge","progress","badges","settings"]);
  // Scenario Training ("stage4") and the AI Arena ("scenarios") were retired
  // in the Rich update, Phase 8: old links open Live Guest instead. Rapid
  // Fire's module picker became the mixed drill in Phase 10.
  const RETIRED_NAV: Record<string, NavItem> = { stage4: "live-guest", scenarios: "live-guest", "rapid-fire": "drill" };
  const [activeNav, setActiveNav] = useState<NavItem>(
    NAV_IDS.has(initialNav as NavItem) ? (initialNav as NavItem) : RETIRED_NAV[initialNav ?? ""] ?? "home"
  );
  const [joinCodeFromUrl, setJoinCodeFromUrl] = useState<string | undefined>(undefined);
  const [showPaymentBanner, setShowPaymentBanner] = useState(checkoutSuccess);
  // Phase 4: Dynamic module system
  const [userId, setUserId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [drillMode, setDrillMode] = useState<"mixed" | "preshift">("mixed");
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [userToken, setUserToken] = useState<string>(initialToken);

  // Auto-navigate to settings and pre-fill venue code if ?join= is in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get("join");
      if (joinCode) {
        // One-time redirect derived from the URL on mount, not reactive state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJoinCodeFromUrl(joinCode);
        setActiveNav("settings");
        const url = new URL(window.location.href);
        url.searchParams.delete("join");
        window.history.replaceState({}, "", url.toString());
      }
      if (params.get("checkout") === "success") {
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        window.history.replaceState({}, "", url.toString());
        // Re-render server component after webhook has had time to update the DB
        const t = setTimeout(() => router.refresh(), 3000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [router]);

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
            .select("diagnostic_completed, tier")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("[DashboardShell] Error fetching diagnostic status:", profileError);
          } else {
            // Show diagnostic if not completed (only for B2B users - check plan)
            const userPlan = profile?.tier || plan;
            const isBB2User = isB2BTier(userPlan);
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

  // Centralized progress data – fetched once on mount, refreshed on sync button press
  const [progressData, setProgressData] = useState<Record<string, unknown> | null>(null);
  const fetchProgress = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch("/api/training/progress", {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      setProgressData(await r.json() as Record<string, unknown>);
    } catch { /* non-critical */ }
  }, []);
  // fetchProgress is async — its setState call happens after the awaited
  // fetch resolves, not synchronously within this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchProgress(); }, [fetchProgress]);

  // Live Guest isn't here: Pro and free open it and see its upgrade prompt.
  const PREMIUM_NAV_ITEMS: NavItem[] = ["module", "drill", "rush", "cocktails", "knowledge"];
  const envAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const ADMIN_EMAILS = envAdminEmails;
  const isAdmin = ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(userEmail.toLowerCase());
  const isPremium = isAdmin || plan !== "free" || hasVenueMembership;

  function handleNavClick(id: NavItem) {
    if (id === "drill") setDrillMode("mixed");
    if (!isPremium && PREMIUM_NAV_ITEMS.includes(id)) {
      router.push("/pricing");
      return;
    }
    setActiveNav(id);
  }

  const getToken = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Session expired. Please sign in again.");
    return session.access_token;
  }, []);

  function openModule(moduleId: number) {
    setSelectedModuleId(moduleId);
    handleNavClick("module");
  }

  const lockedIds = isPremium ? [] : PREMIUM_NAV_ITEMS;
  const liveGuestOpen = isAdmin || isB2BTier(plan) || hasVenueMembership;

  // If auth guard detected an error or is still initializing, show defensive UI
  if (authGuard.hasError) {
    return (
      <main className="sd-shell sd-shell-alone">
        <div className="sd-recover">
          <h1 className="sd-title">Signing you back in</h1>
          <p>{authGuard.errorMessage || "Your session is being restored. One moment."}</p>
          <button type="button" className="sd-btn sd-btn-brass" onClick={() => router.push("/login")}>
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="sd-shell">
      <SessionRefresher />

      {authErrorMessage && (
        <div className="sd-toast" role="alert">
          {authErrorMessage}
        </div>
      )}

      <StaffSidebar
        active={activeNav}
        onNavigate={handleNavClick}
        lockedIds={lockedIds}
        displayName={displayName}
        plan={plan}
        sponsored={hasVenueMembership}
      />

      <section className="sd-main">
        {showPaymentBanner && (
          <div className="sd-notice" role="status">
            <span>Payment successful. Your Pro plan is now active.</span>
            <button type="button" className="sd-icon-btn" onClick={() => setShowPaymentBanner(false)} aria-label="Dismiss">
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
        )}

        {venueMembershipPaused && (
          <div className="sd-notice sd-notice-warn" role="status">
            <span>
              <strong>Training is paused.</strong> Your venue&apos;s trial has ended. Ask your manager to restore access.
            </span>
          </div>
        )}

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

        {activeNav === "home" ? (
          <TodayPage
            key="home"
            displayName={displayName}
            progressData={progressData}
            hasModuleAccess={isPremium}
            liveGuestOpen={liveGuestOpen}
            getToken={getToken}
            onNavigate={handleNavClick}
            onOpenModule={openModule}
            onStartPreshift={() => {
              setDrillMode("preshift");
              setActiveNav("drill");
            }}
          />
        ) : activeNav === "module" ? (
          selectedModuleId ? (
            <div key={`module-${selectedModuleId}`} className="sd-reading">
              <button type="button" className="sd-back sd-back-room" onClick={() => setSelectedModuleId(null)}>
                <ArrowLeft size={16} strokeWidth={2} aria-hidden />
                All modules
              </button>
              <div className="sd-docket">
                <ModuleVerify
                  moduleId={selectedModuleId}
                  onLiveGuest={() => handleNavClick("live-guest")}
                  nextModuleId={selectedModuleId < 40 ? selectedModuleId + 1 : undefined}
                  onComplete={() => setSelectedModuleId(selectedModuleId < 40 ? selectedModuleId + 1 : null)}
                />
              </div>
            </div>
          ) : (
            <ModulesPage key="module" getToken={getToken} onOpenModule={(moduleId) => setSelectedModuleId(moduleId)} />
          )
        ) : activeNav === "drill" ? (
          <DrillPage
            key={`drill-${drillMode}`}
            mode={drillMode}
            getToken={getToken}
            onOpenModule={openModule}
            onLiveGuest={() => handleNavClick("live-guest")}
            onBrowseModules={() => {
              setSelectedModuleId(null);
              handleNavClick("module");
            }}
          />
        ) : activeNav === "rush" ? (
          <RushPage getToken={getToken} />
        ) : activeNav === "live-guest" ? (
          <LiveGuestPage getToken={getToken} />
        ) : activeNav === "challenges" ? (
          <ChallengesPage />
        ) : activeNav === "cocktails" ? (
          <div className="sd-page">
            <header className="sd-head">
              <p className="sd-kicker">Look it up</p>
              <h1 className="sd-title">Cocktails</h1>
              <p className="sd-lede">38 classic cocktails across 10 styles, with the spec, the glass and the garnish.</p>
            </header>
            <div className="sd-docket">
              <Suspense fallback={<CocktailGridSkeleton count={12} />}>
                <CocktailLibrary />
              </Suspense>
            </div>
          </div>
        ) : activeNav === "knowledge" ? (
          <div className="sd-page">
            <header className="sd-head">
              <p className="sd-kicker">Look it up</p>
              <h1 className="sd-title">Knowledge Base</h1>
            </header>
            <div className="sd-docket">
              <Suspense fallback={<CocktailGridSkeleton count={12} />}>
                <KnowledgeBase />
              </Suspense>
            </div>
          </div>
        ) : activeNav === "progress" || activeNav === "badges" ? (
          <MyProgressPage
            key="progress"
            progressData={progressData}
            getToken={getToken}
            openAtBadges={activeNav === "badges"}
            onOpenModule={openModule}
            onNavigate={handleNavClick}
          />
        ) : (
          <StaffSettingsPanel
            displayName={displayName}
            userEmail={userEmail}
            notifReminders={notifReminders}
            notifWeeklyDigest={notifWeeklyDigest}
            initialJoinCode={joinCodeFromUrl}
            hasBillingAccount={hasBillingAccount}
          />
        )}
      </section>
    </main>
  );
}
