"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Bell,
  Globe,
  Building2,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { useMobileSession } from "../_lib/mobile-session-context";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

// Mobile bug-fix plan, Phase 3a — the Me page's settings icon used to be a
// dead button with no route. This is that route's real content.
//
// Reused patterns rather than reinvented:
// - Sign out: same supabase.auth.signOut() -> redirect flow as
//   components/ui/SignOutButton.tsx.
// - Display name: same POST /api/profile/update-name as the legacy
//   StaffSettingsPanel (app/dashboard/_components/DashboardShell.tsx).
// - Email/password: same supabase.auth.updateUser() calls as that panel —
//   Auth API calls, not raw table writes, so calling them client-side is
//   fine per CLAUDE.md's API-route rule (that rule is about DB table
//   reads/writes, not Supabase Auth itself).
// - Notifications: unlike the legacy panel (which wrote profiles directly
//   from the client), this goes through a new PATCH /api/profile/
//   notifications route — the legacy direct-write pattern predates this
//   app tree's stricter "always go through an API route" convention and
//   isn't repeated here.
// - Language: reuses the existing LanguageSwitcher component as-is
//   (variant="drawer") rather than duplicating its 19-language list.
// - Join venue: same POST /api/management/join-venue body shape the
//   existing route already expects.
// - Reset progress: new — see app/api/profile/reset-progress/route.ts and
//   20260824_reset_progress_soft_delete.sql for why this is a soft-delete,
//   not a hard one. Requires typing RESET before the button enables, since
//   this is genuinely irreversible from the user's side.
//
// Deliberately NOT included: a dark-mode toggle. The entire /mobile app
// already renders unconditionally on --bg-mobile-dark with no light theme
// implemented anywhere in this tree — a toggle here would have nothing to
// switch to. Also not included: full account deletion — the user asked for
// "reset progress," not account deletion; that stays out of scope for this
// pass (see the mobile bug-fix plan's Phase 3a note on
// app/api/profile/delete/route.ts, which already exists unwired to any UI
// but deletes the account outright with no grace period — a separate,
// bigger piece of work than what was asked here).

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={16} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-mobile-muted)" }}>
          {title}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--border-mobile)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "var(--radius-sm)",
  background: "var(--surface-mobile-alt)",
  border: "1px solid var(--border-mobile)",
  color: "var(--text-mobile)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "var(--radius-pill)",
  border: "none",
  background: "var(--gold-mobile)",
  color: "var(--bg-mobile-dark)",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  alignSelf: "flex-start",
};

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "none",
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        font: "inherit",
        textAlign: "left",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: 14, color: "var(--text-mobile)" }}>{label}</span>
      <span
        style={{
          position: "relative",
          width: 40,
          height: 22,
          borderRadius: "var(--radius-pill)",
          background: checked ? "var(--gold-mobile)" : "var(--surface-mobile-alt)",
          border: "1px solid var(--border-mobile)",
          flexShrink: 0,
          transition: "background 150ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 16,
            height: 16,
            borderRadius: "var(--radius-pill)",
            background: checked ? "var(--bg-mobile-dark)" : "var(--text-mobile-muted)",
            transition: "left 150ms ease",
          }}
        />
      </span>
    </button>
  );
}

export default function SettingsScreen() {
  const session = useMobileSession();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // ── Display name ──
  const [displayName, setDisplayName] = useState(session.displayName);
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Email ──
  const [email, setEmail] = useState(session.userEmail);
  const [emailStatus, setEmailStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Password ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ── Notifications ──
  // Notifications pass (2026-08-25): both toggles now default OFF (opt-in,
  // not opt-out) — a real notification cadence (weekly digest, reminders)
  // shouldn't be pre-enabled for every user without them choosing it.
  // "Achievement alerts" is removed entirely per explicit ask — badges/
  // progress are already visible on the Me page, a push alert for them is
  // redundant. The `notif_achievement_alerts` DB column is left in place
  // (unused legacy column) rather than migrated away, matching this repo's
  // convention of not chasing every dead column immediately.
  //
  // Turning EITHER toggle on requires confirming in a small dialog first
  // (confirmingNotif below) — each toggle sends real recurring email, so a
  // one-tap accidental enable shouldn't silently opt someone in. Confirming
  // is what actually flips the toggle + persists it; the PATCH route also
  // adds the user's email to the Brevo notifications list and sends a
  // branded confirmation email (see app/api/profile/notifications/route.ts).
  const [notifReminders, setNotifReminders] = useState(false);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [confirmingNotif, setConfirmingNotif] = useState<"reminders" | "digest" | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      try {
        const res = await fetch("/api/profile/notifications", {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          notifReminders: boolean;
          notifWeeklyDigest: boolean;
        };
        if (!cancelled) {
          setNotifReminders(data.notifReminders);
          setNotifWeeklyDigest(data.notifWeeklyDigest);
          setNotifLoaded(true);
        }
      } catch {
        // Leave defaults — non-critical read.
      }
    }
    void loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [session.token]);

  async function saveNotification(patch: Partial<{ notifReminders: boolean; notifWeeklyDigest: boolean }>) {
    try {
      await fetch("/api/profile/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify(patch),
      });
    } catch {
      // Optimistic UI already reflects the toggle; a failed save here just
      // means it reverts on next load — acceptable for a low-stakes pref.
    }
  }

  function handleNotifToggle(which: "reminders" | "digest", next: boolean) {
    // Turning OFF never needs confirmation — only opting IN does.
    if (!next) {
      if (which === "reminders") {
        setNotifReminders(false);
        void saveNotification({ notifReminders: false });
      } else {
        setNotifWeeklyDigest(false);
        void saveNotification({ notifWeeklyDigest: false });
      }
      return;
    }
    setConfirmingNotif(which);
  }

  function confirmNotifOptIn() {
    if (confirmingNotif === "reminders") {
      setNotifReminders(true);
      void saveNotification({ notifReminders: true });
    } else if (confirmingNotif === "digest") {
      setNotifWeeklyDigest(true);
      void saveNotification({ notifWeeklyDigest: true });
    }
    setConfirmingNotif(null);
  }

  // ── Join venue ──
  const [venueCode, setVenueCode] = useState("");
  const [venueStatus, setVenueStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [venueMessage, setVenueMessage] = useState<string | null>(null);

  // ── Reset progress ──
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function handleSaveName() {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    setNameStatus("saving");
    try {
      const res = await fetch("/api/profile/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ displayName: trimmed }),
      });
      if (!res.ok) throw new Error();
      setNameStatus("saved");
      router.refresh();
    } catch {
      setNameStatus("error");
    }
  }

  async function handleSaveEmail() {
    const trimmed = email.trim();
    if (!trimmed || trimmed === session.userEmail) return;
    setEmailStatus("saving");
    try {
      const { error } = await supabase.auth.updateUser({ email: trimmed });
      if (error) throw error;
      setEmailStatus("saved");
    } catch {
      setEmailStatus("error");
    }
  }

  async function handleSavePassword() {
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setPasswordStatus("saving");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordStatus("saved");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordStatus("error");
    }
  }

  async function handleJoinVenue() {
    const trimmed = venueCode.trim();
    if (!trimmed) return;
    setVenueStatus("saving");
    setVenueMessage(null);
    try {
      const res = await fetch("/api/management/join-venue", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ venueCode: trimmed }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string; venueName?: string } | null;
      if (!res.ok) throw new Error(body?.error ?? "Could not join venue.");
      setVenueStatus("saved");
      setVenueMessage(`Joined ${body?.venueName ?? "venue"}. Restart the app to see your new access.`);
      setVenueCode("");
    } catch (err) {
      setVenueStatus("error");
      setVenueMessage(err instanceof Error ? err.message : "Could not join venue.");
    }
  }

  async function handleResetProgress() {
    setResetStatus("saving");
    try {
      const res = await fetch("/api/profile/reset-progress", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error();
      setResetStatus("done");
    } catch {
      setResetStatus("error");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <ArrowLeft size={24} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)", textTransform: "uppercase" }}>Me</span>
        </button>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text-mobile)" }}>Settings</p>
      </div>

      {/* Account */}
      <SectionCard title="Account" icon={User}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Display name</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <button type="button" onClick={handleSaveName} disabled={nameStatus === "saving"} style={primaryButtonStyle}>
            {nameStatus === "saving" ? "Saving…" : nameStatus === "saved" ? "Saved" : "Save name"}
          </button>
        </div>

        <div style={{ height: 1, background: "var(--border-mobile)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
          <button type="button" onClick={handleSaveEmail} disabled={emailStatus === "saving"} style={primaryButtonStyle}>
            {emailStatus === "saving" ? "Saving…" : emailStatus === "saved" ? "Check your inbox to confirm" : "Update email"}
          </button>
          {emailStatus === "error" && <p style={{ margin: 0, fontSize: 12, color: "var(--red-mobile)" }}>Couldn&apos;t update email.</p>}
        </div>

        <div style={{ height: 1, background: "var(--border-mobile)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Change password</label>
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New password" style={inputStyle} />
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm password" style={inputStyle} />
          {passwordError && <p style={{ margin: 0, fontSize: 12, color: "var(--red-mobile)" }}>{passwordError}</p>}
          <button type="button" onClick={handleSavePassword} disabled={passwordStatus === "saving"} style={primaryButtonStyle}>
            {passwordStatus === "saving" ? "Saving…" : passwordStatus === "saved" ? "Password updated" : "Update password"}
          </button>
        </div>

        <div style={{ height: 1, background: "var(--border-mobile)" }} />

        <Link href="/mobile/ai-photo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}>
          <span style={{ fontSize: 14, color: "var(--text-mobile)" }}>Profile photo</span>
          <ChevronRight size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
        </Link>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" icon={Bell}>
        <ToggleRow label="Training reminders" checked={notifReminders} disabled={!notifLoaded} onChange={(next) => handleNotifToggle("reminders", next)} />
        <ToggleRow label="Weekly progress digest" checked={notifWeeklyDigest} disabled={!notifLoaded} onChange={(next) => handleNotifToggle("digest", next)} />
      </SectionCard>

      {confirmingNotif && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
          }}
          onClick={() => setConfirmingNotif(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 390,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
              borderTopLeftRadius: "var(--radius-lg)",
              borderTopRightRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              borderBottom: "none",
            }}
          >
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>
              {confirmingNotif === "digest" ? "Turn on weekly progress digest?" : "Turn on training reminders?"}
            </p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "var(--text-mobile-muted)" }}>
              {confirmingNotif === "digest"
                ? `You'll get a short email summary of your progress every Monday morning, sent to ${session.userEmail}.`
                : `You'll get a training reminder email every Sunday night to help you get ready for the week ahead, sent to ${session.userEmail}.`}
              {" "}You can turn this off again any time.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setConfirmingNotif(null)}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-mobile)",
                  background: "none",
                  color: "var(--text-mobile)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button type="button" onClick={confirmNotifOptIn} style={{ ...primaryButtonStyle, flex: 1, alignSelf: "auto", textAlign: "center" }}>
                Yes, turn on
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language */}
      <SectionCard title="Language" icon={Globe}>
        <LanguageSwitcher variant="drawer" />
      </SectionCard>

      {/* Venue */}
      <SectionCard title="Venue" icon={Building2}>
        {session.hasVenueMembership ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile)" }}>
            {session.venueMembershipPaused ? "Your venue access is currently paused." : "You're linked to a venue team."}
          </p>
        ) : (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-mobile-muted)" }}>Join a venue by code</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={venueCode} onChange={(e) => setVenueCode(e.target.value)} placeholder="e.g. 4821" style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={handleJoinVenue} disabled={venueStatus === "saving"} style={primaryButtonStyle}>
                {venueStatus === "saving" ? "Joining…" : "Join"}
              </button>
            </div>
            {venueMessage && (
              <p style={{ margin: 0, fontSize: 12, color: venueStatus === "error" ? "var(--red-mobile)" : "var(--green-mobile)" }}>{venueMessage}</p>
            )}
          </>
        )}
      </SectionCard>

      {/* Support */}
      <SectionCard title="Support" icon={AlertTriangle}>
        {[
          { label: "Report a Bug", href: "/mobile/report-bug" },
          { label: "Help & FAQ", href: "/mobile/help" },
          { label: "Contact support", href: "/mobile/contact" },
          { label: "Terms of Service", href: "/mobile/terms" },
          { label: "Privacy Policy", href: "/mobile/privacy" },
        ].map((link) => (
          <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}>
            <span style={{ fontSize: 14, color: "var(--text-mobile)" }}>{link.label}</span>
            <ChevronRight size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          </Link>
        ))}
      </SectionCard>

      {/* Learning data — destructive */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} strokeWidth={2} color="var(--red-mobile)" aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--red-mobile)" }}>
            Learning Data
          </p>
        </div>
        <div style={{ padding: 16, borderRadius: "var(--radius-lg)", background: "var(--surface-mobile)", border: "1px solid var(--red-mobile)" }}>
          {resetStatus === "done" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Check size={16} strokeWidth={2} color="var(--green-mobile)" aria-hidden="true" />
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile)" }}>Progress reset. Your account and venue access are untouched.</p>
            </div>
          ) : !resetOpen ? (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-mobile-muted)" }}>
                Clear all module, scenario, and challenge progress to start training again from zero. Your account, sign-in, and venue membership are kept.
              </p>
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                style={{ padding: "10px 16px", borderRadius: "var(--radius-pill)", border: "1px solid var(--red-mobile)", background: "none", color: "var(--red-mobile)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Reset progress
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--red-mobile)" }}>This can&apos;t be undone.</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                Type RESET to confirm you want to permanently clear your training progress.
              </p>
              <input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET"
                style={inputStyle}
              />
              {resetStatus === "error" && <p style={{ margin: 0, fontSize: 12, color: "var(--red-mobile)" }}>Something went wrong — try again.</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleResetProgress}
                  disabled={resetConfirmText !== "RESET" || resetStatus === "saving"}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    background: "var(--red-mobile)",
                    color: "var(--bg-mobile-dark)",
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: resetConfirmText !== "RESET" ? "default" : "pointer",
                    opacity: resetConfirmText !== "RESET" ? 0.5 : 1,
                  }}
                >
                  {resetStatus === "saving" ? "Resetting…" : "Permanently reset"}
                </button>
                <button
                  type="button"
                  onClick={() => { setResetOpen(false); setResetConfirmText(""); }}
                  style={{ padding: "10px 16px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-mobile)", background: "none", color: "var(--text-mobile)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: "0 20px 32px" }}>
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "12px 0",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-mobile)",
            background: "var(--surface-mobile)",
            color: "var(--text-mobile)",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <LogOut size={16} strokeWidth={2} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}
