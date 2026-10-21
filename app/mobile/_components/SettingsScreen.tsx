"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import Screen from "./ui/Screen";
import { Group } from "./ui/parts";
import InstallRow from "./InstallRow";
import AppearancePicker from "./AppearancePicker";
import ShiftDays, { ShiftReminder } from "@/components/quiz/ShiftDays";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useGetToken } from "../_lib/use-staff";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadShiftStreak } from "@/lib/staff-data";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { normalizeVenueCode } from "@/lib/venue-code";
import { openBillingPortal } from "@/lib/billing-portal";

// Settings, from Me. Redesign phase 6 (docs/STAFF_MOBILE_REDESIGN_PLAN.md):
// grouped lists as in iPhone Settings. A row that edits something opens in
// place, one at a time; switches turn notifications on and off. Styles: the
// sm-group and sm-set rules in app/styles/staff.css.
//
// Where each thing is saved:
// - Display name: POST /api/profile/update-name, as on desktop.
// - Email and password: supabase.auth.updateUser(). Auth API calls, not
//   table writes, so they are fine from the client (CLAUDE.md's API-route
//   rule is about table reads and writes).
// - Notifications: GET and PATCH /api/profile/notifications. Both start off;
//   turning one on asks first, because each sends real email, and the route
//   adds the address to the Brevo list and sends a confirmation.
// - Language: the shared LanguageSwitcher (variant="drawer").
// - Join venue: POST /api/management/join-venue. The manager's sign-up link
//   (/dashboard?join=CODE) is forwarded here on a phone by middleware.ts and
//   joined on arrival.
// - Reset progress: POST /api/profile/reset-progress, a soft delete (see
//   20260824_reset_progress_soft_delete.sql). Typing RESET enables it.
// - Delete account: POST /api/profile/delete, typing DELETE, checked on the
//   server too. Subscribers and venue owners get a 409 with the reason.
// - Appearance: this device only (AppearancePicker, lib/mobile-theme.ts).
// - Shift days and the reminder time: the shared pickers from the drill's
//   finish (components/quiz/ShiftDays.tsx), PUT /api/training/shift-streak.

type Editing = "name" | "email" | "password" | "venue" | "reset" | "delete" | null;

/** A row that opens a small form under itself. */
function EditRow({
  label,
  value,
  open,
  onToggle,
  danger,
  children,
}: {
  label: string;
  value?: string;
  open: boolean;
  onToggle: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <>
      <button
        type="button"
        className={`sm-row sm-set-row${danger ? " sm-set-row--danger" : ""}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        <span className="sm-set-label">{label}</span>
        {value && <span className="sm-set-value">{value}</span>}
        <ChevronRight className={`sm-chevron sm-set-chevron${open ? " is-open" : ""}`} size={20} strokeWidth={2.6} aria-hidden="true" />
      </button>
      {open && (
        <div id={id} className="sm-set-edit">
          {children}
        </div>
      )}
    </>
  );
}

/** An iPhone-style switch with its label. */
function SwitchRow({ label, sub, checked, onChange, disabled }: { label: string; sub: string; checked: boolean; onChange: (next: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="sm-row sm-set-row"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="sm-row-text">
        <span className="sm-set-label">{label}</span>
        <span className="sm-row-sub">{sub}</span>
      </span>
      <span className="sm-switch" aria-hidden="true" />
    </button>
  );
}

/** A labelled text box. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="sm-field">
      <span className="sm-field-label">{label}</span>
      {children}
    </label>
  );
}

/** Asks before a notification is turned on. */
function ConfirmSheet({ title, body, onConfirm, onClose }: { title: string; body: string; onConfirm: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="sm-sheet sm-set-sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <div className="sm-sheet-grabber" aria-hidden="true" />
      <h2 id={titleId} className="sm-sheet-title">
        {title}
      </h2>
      <p className="sm-set-sheet-body">{body}</p>
      <div className="sm-set-actions">
        <button type="button" className="sm-btn sm-btn--secondary" onClick={() => ref.current?.close()}>
          Cancel
        </button>
        <button type="button" className="sm-btn sm-btn--primary" onClick={onConfirm}>
          Yes, turn on
        </button>
      </div>
    </dialog>
  );
}

export default function SettingsScreen() {
  const session = useMobileSession();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const getToken = useGetToken();
  const { data: streak, set: setStreak } = useStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken);
  const [editing, setEditing] = useState<Editing>(null);
  const toggle = (which: Exclude<Editing, null>) => setEditing((current) => (current === which ? null : which));

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

  // Home's notifications card links to /mobile/settings#notifications. The
  // section sits below the fold, so bring it into view once the toggles have
  // loaded.
  useEffect(() => {
    if (notifLoaded && window.location.hash === "#notifications") {
      document.getElementById("notifications")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [notifLoaded]);

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
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  // ── Subscription and billing ── same Stripe portal as the Manager Console
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  async function handleManageBilling() {
    setBillingLoading(true);
    setBillingError(null);
    const failure = await openBillingPortal(session.token, "mobile");
    if (failure) {
      setBillingError(failure);
      setBillingLoading(false);
    }
  }

  // ── Delete account ──
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  async function handleJoinVenue(code: string = venueCode) {
    const trimmed = normalizeVenueCode(code);
    if (!trimmed) {
      setVenueStatus("error");
      setVenueMessage("Please enter a valid venue code.");
      return;
    }
    setVenueStatus("saving");
    setVenueMessage(null);
    try {
      const res = await fetch("/api/management/join-venue", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ venueCode: trimmed }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string; venueName?: string; alreadyLinked?: boolean } | null;
      if (!res.ok) throw new Error(body?.error ?? "Could not join venue.");
      setVenueStatus("saved");
      setVenueMessage(
        body?.alreadyLinked
          ? `Already connected to ${body?.venueName ?? "this venue"}.`
          : `Joined ${body?.venueName ?? "venue"}. Restart the app to see your new access.`,
      );
      setVenueCode("");
    } catch (err) {
      setVenueStatus("error");
      setVenueMessage(err instanceof Error ? err.message : "Could not join venue.");
    }
  }

  // The manager's staff sign-up link is /dashboard?join=CODE. On a phone,
  // middleware.ts forwards it here, so join once on arrival the same way
  // desktop Settings does (StaffSettingsPanel in DashboardShell.tsx) instead
  // of leaving the code unused. Ref-guarded so it fires once per mount.
  const hasAutoJoined = useRef(false);
  useEffect(() => {
    if (hasAutoJoined.current) return;
    const url = new URL(window.location.href);
    const joinCode = url.searchParams.get("join");
    if (!joinCode) return;
    hasAutoJoined.current = true;
    url.searchParams.delete("join");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time join kicked off by the deep link, not state synced from an external source.
    void handleJoinVenue(joinCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: the join code comes from the URL, not from props or state.
  }, []);

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

  async function handleDeleteAccount() {
    setDeleteStatus("saving");
    setDeleteError(null);
    try {
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: deleteConfirmText }),
      });
      if (!res.ok) {
        // 409s carry a user-facing reason (active subscription, venue owner).
        const data: { error?: string } = await res.json().catch(() => ({}));
        throw new Error(res.status === 409 && data.error ? data.error : "Something went wrong. Try again.");
      }
      // The auth user no longer exists; clear the local session too.
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeleteStatus("error");
      setDeleteError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nameLabel = nameStatus === "saving" ? "Saving…" : nameStatus === "saved" ? "Saved" : "Save name";
  const emailLabel = emailStatus === "saving" ? "Saving…" : emailStatus === "saved" ? "Check your inbox to confirm" : "Update email";
  const passwordLabel = passwordStatus === "saving" ? "Saving…" : passwordStatus === "saved" ? "Password updated" : "Update password";

  return (
    <Screen title="Settings" back={{ href: "/mobile/progress", label: "Me" }}>
      <div className="sm-set">
        <Group title="Account">
          <EditRow label="Name" value={displayName} open={editing === "name"} onToggle={() => toggle("name")}>
            <Field label="Display name">
              <input className="sm-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
            </Field>
            <button type="button" className="sm-btn sm-btn--primary" onClick={handleSaveName} disabled={nameStatus === "saving"}>
              {nameLabel}
            </button>
            {nameStatus === "error" && <p className="sm-set-error">Couldn&apos;t save your name. Try again.</p>}
          </EditRow>
          <EditRow label="Email" value={session.userEmail} open={editing === "email"} onToggle={() => toggle("email")}>
            <Field label="Email">
              <input className="sm-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" inputMode="email" />
            </Field>
            <button type="button" className="sm-btn sm-btn--primary" onClick={handleSaveEmail} disabled={emailStatus === "saving"}>
              {emailLabel}
            </button>
            {emailStatus === "error" && <p className="sm-set-error">Couldn&apos;t update your email.</p>}
          </EditRow>
          <EditRow label="Password" value="Change" open={editing === "password"} onToggle={() => toggle("password")}>
            <Field label="New password">
              <input className="sm-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" autoComplete="new-password" />
            </Field>
            <Field label="Confirm password">
              <input className="sm-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" autoComplete="new-password" />
            </Field>
            {passwordError && <p className="sm-set-error">{passwordError}</p>}
            {passwordStatus === "error" && <p className="sm-set-error">Couldn&apos;t update your password.</p>}
            <button type="button" className="sm-btn sm-btn--primary" onClick={handleSavePassword} disabled={passwordStatus === "saving"}>
              {passwordLabel}
            </button>
          </EditRow>
          <SetLink href="/mobile/ai-photo" label="Profile photo" value={session.profilePhotoUrl ? "Change" : "Add"} />
        </Group>

        <Group id="notifications" title="Email" foot="Off until you turn them on. Turn them off again any time.">
          <SwitchRow
            label="Training reminders"
            sub="Sunday night, ready for the week"
            checked={notifReminders}
            disabled={!notifLoaded}
            onChange={(next) => handleNotifToggle("reminders", next)}
          />
          <SwitchRow
            label="Weekly progress digest"
            sub="Monday morning"
            checked={notifWeeklyDigest}
            disabled={!notifLoaded}
            onChange={(next) => handleNotifToggle("digest", next)}
          />
        </Group>

        {confirmingNotif && (
          <ConfirmSheet
            title={confirmingNotif === "digest" ? "Turn on the weekly digest?" : "Turn on training reminders?"}
            body={`${
              confirmingNotif === "digest"
                ? `A short email on your progress every Monday morning, sent to ${session.userEmail}.`
                : `A reminder email every Sunday night to get ready for the week ahead, sent to ${session.userEmail}.`
            } You can turn it off again any time.`}
            onConfirm={confirmNotifOptIn}
            onClose={() => setConfirmingNotif(null)}
          />
        )}

        {streak && (
          <Group title="Shifts">
            <div className="sm-row sm-set-row sm-set-stack sm-set-shifts">
              <ShiftDays streak={streak} getToken={getToken} onSaved={setStreak} />
            </div>
            <div className="sm-row sm-set-row sm-set-stack sm-set-shifts">
              <ShiftReminder streak={streak} getToken={getToken} onSaved={setStreak} />
            </div>
          </Group>
        )}

        <Group title="This phone" foot="Appearance is saved on this phone only.">
          <div className="sm-row sm-set-row sm-set-stack">
            <span className="sm-set-label">Appearance</span>
            <AppearancePicker />
          </div>
          <div className="sm-row sm-set-row sm-set-lang">
            <span className="sm-set-label">Language</span>
            <LanguageSwitcher variant="drawer" />
          </div>
          <InstallRow />
        </Group>

        <Group title="Venue" foot={venueMessage ?? undefined} footTone={venueStatus === "error" ? "alarm" : venueStatus === "saved" ? "good" : undefined}>
          {session.hasVenueMembership ? (
            <div className="sm-row sm-set-row">
              <span className="sm-set-label">Venue team</span>
              <span className="sm-set-value">{session.venueMembershipPaused ? "Paused" : "Linked"}</span>
            </div>
          ) : (
            <EditRow label="Join your venue" value="Enter code" open={editing === "venue"} onToggle={() => toggle("venue")}>
              <Field label="Your manager's venue code">
                <input
                  className="sm-input sm-input--code"
                  value={venueCode}
                  onChange={(e) => setVenueCode(e.target.value.toUpperCase())}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={8}
                  placeholder="K7P3QX"
                />
              </Field>
              <button type="button" className="sm-btn sm-btn--primary" onClick={() => handleJoinVenue()} disabled={venueStatus === "saving"}>
                {venueStatus === "saving" ? "Joining…" : "Join"}
              </button>
            </EditRow>
          )}
        </Group>

        {session.hasBillingAccount && (
          <Group title="Plan" foot={billingError ?? "Update your card, download invoices or cancel. Opens our secure billing page, run by Stripe."} footTone={billingError ? "alarm" : undefined}>
            <button type="button" className="sm-row sm-set-row" onClick={handleManageBilling} disabled={billingLoading}>
              <span className="sm-set-label">Manage billing</span>
              <span className="sm-set-value">{billingLoading ? "Opening…" : ""}</span>
              <ChevronRight className="sm-chevron" size={20} strokeWidth={2.6} aria-hidden="true" />
            </button>
          </Group>
        )}

        <Group title="Help">
          <SetLink href="/mobile/help" label="Help and FAQ" />
          <SetLink href="/mobile/contact" label="Contact support" />
          <SetLink href="/mobile/report-bug" label="Report a bug" />
        </Group>

        <Group title="Legal">
          <SetLink href="/mobile/terms" label="Terms of Service" />
          <SetLink href="/mobile/privacy" label="Privacy Policy" />
        </Group>

        <Group title="Your data">
          {resetStatus === "done" ? (
            <div className="sm-row sm-set-row">
              <Check className="sm-set-done" size={20} strokeWidth={2.6} aria-hidden="true" />
              <span className="sm-set-label">Progress reset. Your account and venue are untouched.</span>
            </div>
          ) : (
            <EditRow label="Reset progress" open={editing === "reset"} onToggle={() => toggle("reset")} danger>
              <p className="sm-set-note">
                Clears all module, scenario and challenge progress so you start again from zero. Your account, sign-in and
                venue are kept. This can&apos;t be undone.
              </p>
              <Field label="Type RESET to confirm">
                <input className="sm-input" value={resetConfirmText} onChange={(e) => setResetConfirmText(e.target.value)} placeholder="RESET" autoCapitalize="characters" autoComplete="off" />
              </Field>
              {resetStatus === "error" && <p className="sm-set-error">Something went wrong. Try again.</p>}
              <button type="button" className="sm-btn sm-btn--danger" onClick={handleResetProgress} disabled={resetConfirmText !== "RESET" || resetStatus === "saving"}>
                {resetStatus === "saving" ? "Resetting…" : "Permanently reset"}
              </button>
            </EditRow>
          )}
          <EditRow label="Delete account" open={editing === "delete"} onToggle={() => toggle("delete")} danger>
            <p className="sm-set-note">
              Permanently deletes your account, sign-in and training history. Your venue keeps its roster record of you,
              without your progress. This can&apos;t be undone.
            </p>
            <Field label="Type DELETE to confirm">
              <input className="sm-input" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" autoCapitalize="characters" autoComplete="off" />
            </Field>
            {deleteStatus === "error" && deleteError && <p className="sm-set-error">{deleteError}</p>}
            <button type="button" className="sm-btn sm-btn--danger" onClick={handleDeleteAccount} disabled={deleteConfirmText !== "DELETE" || deleteStatus === "saving"}>
              {deleteStatus === "saving" ? "Deleting…" : "Permanently delete"}
            </button>
          </EditRow>
        </Group>

        <Group>
          <button type="button" className="sm-row sm-set-row sm-set-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </Group>
      </div>
    </Screen>
  );
}

function SetLink({ href, label, value }: { href: string; label: string; value?: string }) {
  return (
    <Link href={href} className="sm-row sm-set-row">
      <span className="sm-set-label">{label}</span>
      {value && <span className="sm-set-value">{value}</span>}
      <ChevronRight className="sm-chevron" size={20} strokeWidth={2.6} aria-hidden="true" />
    </Link>
  );
}
