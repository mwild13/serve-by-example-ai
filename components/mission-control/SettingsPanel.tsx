"use client";

import { useState, type FormEvent, type MutableRefObject } from "react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { Check, Circle } from "lucide-react";
import { TrialBillingSection } from "./TrialBillingSection";
import { PageHead } from "./console-ui";
import { tierDisplayName } from "@/lib/session";

// Extracted from ManagerControlCenter.tsx (Phase 5, Task — line-count
// reduction toward the 3,200-line target). Covers the Settings tab: Venue
// setup (venue rename/add/delete, staff limits, join code, sign-up link),
// Billing, and Account sub-tabs.
//
// NOTE ON SCOPE: the extraction brief described this block as covering
// "notifications toggle, integration configs, and member management forms."
// None of those exist inside the actual Settings tab as written — there's a
// separate top-level "notifications" section elsewhere in the nav, and
// member/staff management already lives in StaffDirectoryTable.tsx. This
// extraction covers what's actually here: Venue setup / Billing / Account.
//
// All state and callbacks are kept in the parent and passed down as props,
// per the "keep existing state hooks/callbacks intact as props from the
// parent" instruction — this component is purely presentational.
//
// Layout (October 2026): one narrow column. Each setting is a row with its
// heading and a one-line note on the left and its controls on the right,
// divided by hairlines. No cards.

type SettingsTab = "setup" | "billing" | "account";

export interface SettingsPanelProps {
  settingsTab: SettingsTab;
  setSettingsTab: (tab: SettingsTab) => void;
  snapshot: ManagementSnapshot;
  selectedVenue: ManagementSnapshot["venues"][0] | undefined;
  selectedVenueId: string;
  setSelectedVenueId: (id: string) => void;
  isMultiVenue: boolean;
  handleAddVenue: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  newVenueName: string;
  setNewVenueName: (name: string) => void;
  isSaving: boolean;
  copiedVenueId: string | null;
  setCopiedVenueId: (id: string | null) => void;
  copyTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setVenueDeleteConfirm: (v: { venueId: string; venueName: string } | null) => void;
  handleRenameVenue: (e: FormEvent) => void | Promise<void>;
  renameVenueName: string;
  setRenameVenueName: (name: string) => void;
  renameSaving: boolean;
  venueStaff: ManagementSnapshot["staff"];
  seatUsage: { used: number; max: number; unlimited: boolean } | null;
  accountDisplayName: string;
  setAccountDisplayName: (name: string) => void;
  accountSaving: boolean;
  setAccountSaving: (v: boolean) => void;
  accountSaved: boolean;
  setAccountSaved: (v: boolean) => void;
  sessionToken: string | null;
  trialTier?: string | null;
  trialEndsAt?: string | null;
  daysRemaining?: number;
  plan?: string;
}

export function SettingsPanel({
  settingsTab,
  setSettingsTab,
  snapshot,
  selectedVenue,
  selectedVenueId,
  setSelectedVenueId,
  isMultiVenue,
  handleAddVenue,
  newVenueName,
  setNewVenueName,
  isSaving,
  copiedVenueId,
  setCopiedVenueId,
  copyTimeoutRef,
  setVenueDeleteConfirm,
  handleRenameVenue,
  renameVenueName,
  setRenameVenueName,
  renameSaving,
  venueStaff,
  seatUsage,
  accountDisplayName,
  setAccountDisplayName,
  accountSaving,
  setAccountSaving,
  accountSaved,
  setAccountSaved,
  sessionToken,
  trialTier,
  trialEndsAt,
  daysRemaining,
  plan,
}: SettingsPanelProps) {
  // Local-only UI state for the "Manage billing in Stripe" button — nothing
  // outside the Billing tab reads it. Previously this click handler had no
  // error handling at all: a failed fetch (401/404/502) or a missing `url`
  // in the response left the button looking clicked with zero feedback.
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  async function handleManageBilling() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
      const res = await fetch("/api/billing/portal", { method: "POST", headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setPortalError(
          typeof data.error === "string"
            ? data.error
            : "Couldn't open the Stripe billing portal. Please try again or contact support.",
        );
        setPortalLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setPortalError("Couldn't reach the billing service. Check your connection and try again.");
      setPortalLoading(false);
    }
  }

  // The same origin on server and client would differ, so the link is built
  // from the code alone and the origin is added when it is copied or shown.
  const joinCode = selectedVenue?.venueCode;
  const joinPath = joinCode ? `/dashboard?join=${joinCode}` : null;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://servebyexample.co";

  function copyWithFeedback(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedVenueId(key);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopiedVenueId(null), 2000);
  }

  async function handleSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = accountDisplayName.trim();
    if (!name) return;
    setAccountSaving(true);
    setAccountSaved(false);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
      // /api/profile/update-name reads body.displayName (not `name`).
      const res = await fetch("/api/profile/update-name", { method: "POST", headers, body: JSON.stringify({ displayName: name }) });
      if (res.ok) {
        // accountDisplayName feeds the top header's account menu, so this
        // alone updates it; no refetch needed.
        setAccountDisplayName(name);
        setAccountSaved(true);
      } else {
        console.error("Account name save failed:", res.status, await res.text().catch(() => ""));
      }
    } catch (err) {
      console.error("Account name save failed:", err);
    } finally {
      setAccountSaving(false);
    }
  }

  const setupSteps = [
    { label: "Add a venue", done: snapshot.venues.length > 0 },
    { label: "Staff join code ready", done: Boolean(joinCode) },
    { label: "Invite staff members", done: venueStaff.length > 0 },
    { label: "First staff member trained", done: venueStaff.some((s) => s.progress > 0) },
  ];
  const stepsDone = setupSteps.filter((step) => step.done).length;

  // Org-wide seat usage (tierSeatLimit()/countActiveSeats()), not the stale
  // per-venue venues.staff_limit column. seatUsage may briefly be null while
  // it loads; fall back to this venue's staff count so it never reads "0".
  const seatsUsed = seatUsage?.used ?? venueStaff.length;
  const seatsUnlimited = seatUsage?.unlimited ?? false;
  const seatLimit = seatUsage?.max ?? null;
  const seatPct = !seatsUnlimited && seatLimit && seatLimit > 0 ? Math.min(100, Math.round((seatsUsed / seatLimit) * 100)) : 0;
  const seatsFull = !seatsUnlimited && seatLimit != null && seatsUsed >= seatLimit;
  const seatsNearlyFull = !seatsUnlimited && seatPct >= 90;

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "setup", label: "Venue" },
    { key: "billing", label: "Billing" },
    { key: "account", label: "Account" },
  ];

  return (
    <div className="mc-page mc-page-narrow">
      <PageHead title="Settings" />

      <div className="mc-tabs" role="tablist" aria-label="Settings">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={settingsTab === tab.key}
            className={`mc-tab${settingsTab === tab.key ? " active" : ""}`}
            onClick={() => setSettingsTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {settingsTab === "setup" && (
        <div>
          {stepsDone < setupSteps.length && (
            <section className="mc-setting">
              <div>
                <h2 className="mc-setting-title">Getting set up</h2>
                <p className="mc-setting-desc">{stepsDone} of {setupSteps.length} steps done.</p>
              </div>
              <ul className="mc-check-list">
                {setupSteps.map((step) => (
                  <li key={step.label} className={step.done ? "is-done" : undefined}>
                    {step.done ? <Check size={18} strokeWidth={2.25} aria-hidden="true" /> : <Circle size={18} strokeWidth={1.75} aria-hidden="true" />}
                    {step.label}
                    <span className="sr-only">{step.done ? " (done)" : " (to do)"}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isMultiVenue ? (
            <section className="mc-setting">
              <div>
                <h2 className="mc-setting-title">Venues</h2>
                <p className="mc-setting-desc">Add a venue, copy its staff sign-up link, or remove one you no longer run.</p>
              </div>
              <div className="mc-setting-body">
                <label className="mc-field">
                  Venue shown in the console
                  <select className="mc-input" value={selectedVenueId} onChange={(event) => setSelectedVenueId(event.target.value)}>
                    {snapshot.venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>{venue.name}</option>
                    ))}
                  </select>
                </label>
                {snapshot.venues.length > 0 && (
                  <ul className="mc-rows" style={{ borderTop: "1px solid var(--mc-line-soft)", borderBottom: "1px solid var(--mc-line-soft)" }}>
                    {snapshot.venues.map((venue) => (
                      <li key={venue.id} className="mc-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <span className="mc-row-main mc-row-title">{venue.name}</span>
                        {venue.venueCode && (
                          <button
                            type="button"
                            className="mc-btn mc-btn-quiet mc-btn-sm"
                            onClick={() => copyWithFeedback(`${window.location.origin}/dashboard?join=${venue.venueCode}`, venue.id)}
                          >
                            {copiedVenueId === venue.id ? "Copied" : "Copy sign-up link"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="mc-btn mc-btn-danger mc-btn-sm"
                          onClick={() => setVenueDeleteConfirm({ venueId: venue.id, venueName: venue.name })}
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form className="mc-inline-form" onSubmit={handleAddVenue}>
                  <label className="mc-field">
                    Add a venue
                    <input className="mc-input" value={newVenueName} onChange={(event) => setNewVenueName(event.target.value)} placeholder="Venue name" required />
                  </label>
                  <button type="submit" className="mc-btn mc-btn-primary" disabled={isSaving}>{isSaving ? "Saving…" : "Add venue"}</button>
                </form>
              </div>
            </section>
          ) : (
            <section className="mc-setting">
              <div>
                <h2 className="mc-setting-title">Venue name</h2>
                <p className="mc-setting-desc">Shown to your staff and at the top of this console.</p>
              </div>
              <form className="mc-inline-form" onSubmit={handleRenameVenue}>
                <label className="mc-field">
                  Venue name
                  <input className="mc-input" value={renameVenueName} onChange={(event) => setRenameVenueName(event.target.value)} placeholder="Your venue name" required />
                </label>
                <button type="submit" className="mc-btn mc-btn-primary" disabled={renameSaving}>{renameSaving ? "Saving…" : "Save"}</button>
              </form>
            </section>
          )}

          <section className="mc-setting">
            <div>
              <h2 className="mc-setting-title">Staff sign-up</h2>
              <p className="mc-setting-desc">
                Two ways for staff to join {selectedVenue?.name ?? "your venue"}. Once someone joins, their training shows in your staff list.
              </p>
            </div>
            {joinCode && joinPath ? (
              <div className="mc-setting-body">
                <div>
                  <span className="mc-caps">Sign-up link</span>
                  <div className="mc-inline-form" style={{ marginTop: 6 }}>
                    <input className="mc-input" style={{ flex: "1 1 260px" }} readOnly value={`${origin}${joinPath}`} aria-label="Staff sign-up link" suppressHydrationWarning />
                    <button type="button" className="mc-btn mc-btn-primary" onClick={() => copyWithFeedback(`${window.location.origin}${joinPath}`, `signup-${selectedVenue?.id}`)}>
                      {copiedVenueId === `signup-${selectedVenue?.id}` ? "Copied" : "Copy link"}
                    </button>
                  </div>
                  <p className="mc-setting-desc" style={{ marginTop: 8 }}>Send this to new staff. It signs them up and links them to this venue in one step.</p>
                </div>
                <div>
                  <span className="mc-caps">Join code</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 6 }}>
                    <span className="mc-code">{joinCode}</span>
                    <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" onClick={() => copyWithFeedback(String(joinCode), `code-${selectedVenue?.id}`)}>
                      {copiedVenueId === `code-${selectedVenue?.id}` ? "Copied" : "Copy code"}
                    </button>
                  </div>
                  <p className="mc-setting-desc" style={{ marginTop: 8 }}>For staff who already have an account: in their training app they open Settings, choose Join Venue and enter this code.</p>
                </div>
              </div>
            ) : (
              <p className="mc-setting-desc">No join code was found for this venue. Refresh the page to try again.</p>
            )}
          </section>

          <section className="mc-setting">
            <div>
              <h2 className="mc-setting-title">Plan limits</h2>
              <p className="mc-setting-desc">What your current plan includes.</p>
            </div>
            <div className="mc-setting-body">
              <dl className="mc-dl">
                <div>
                  <dt>Staff seats</dt>
                  <dd>{seatsUnlimited ? `${seatsUsed} used, unlimited` : `${seatsUsed} of ${seatLimit ?? "…"} used`}</dd>
                </div>
                <div>
                  {/* No tier has an enforced venue cap: multi-venue tiers are
                      unlimited and single-venue tiers are exactly one. */}
                  <dt>Venues</dt>
                  <dd>{isMultiVenue ? "Unlimited" : "1"}</dd>
                </div>
              </dl>
              {!seatsUnlimited && seatLimit != null && (
                <span className="mc-progress-track" aria-hidden="true">
                  <span className="mc-progress-fill" style={{ width: `${seatPct}%` }} />
                </span>
              )}
              {seatsNearlyFull && (
                <p className="mc-setting-desc" style={{ color: "var(--mc-text)" }}>
                  {seatsFull ? "Every staff seat is in use." : `${seatPct}% of your staff seats are in use.`}{" "}
                  <a href="/pricing" className="mc-link">Upgrade your plan</a> to add more.
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {settingsTab === "account" && (
        <div>
          <section className="mc-setting">
            <div>
              <h2 className="mc-setting-title">Your name</h2>
              <p className="mc-setting-desc">Shown in the account menu at the top right.</p>
            </div>
            <form className="mc-inline-form" onSubmit={handleSaveName}>
              <label className="mc-field">
                Display name
                <input
                  className="mc-input"
                  value={accountDisplayName}
                  onChange={(event) => { setAccountDisplayName(event.target.value); setAccountSaved(false); }}
                  placeholder="Your name"
                  required
                />
              </label>
              <button className="mc-btn mc-btn-primary" type="submit" disabled={accountSaving}>{accountSaving ? "Saving…" : "Save"}</button>
              {accountSaved && <span className="mc-saved" role="status" style={{ alignSelf: "center" }}>Saved</span>}
            </form>
          </section>
          <section className="mc-setting">
            <div>
              <h2 className="mc-setting-title">Password</h2>
              <p className="mc-setting-desc">You will be taken to the password reset page.</p>
            </div>
            <div>
              <a href="/reset-password" className="mc-btn mc-btn-quiet">Change password</a>
            </div>
          </section>
        </div>
      )}

      {settingsTab === "billing" && (
        trialTier && trialEndsAt && typeof daysRemaining === "number" ? (
          <section className="mc-panel">
            <div className="mc-panel-body" style={{ paddingTop: 20 }}>
              <TrialBillingSection
                trialTier={trialTier}
                trialEndsAt={trialEndsAt}
                daysRemaining={daysRemaining}
                staffCount={venueStaff.length}
                scenariosRun={snapshot.staff.reduce((sum, m) => sum + (m.scenariosAttempted ?? 0), 0)}
              />
            </div>
          </section>
        ) : (
          <div>
            <section className="mc-setting">
              <div>
                <h2 className="mc-setting-title">Your plan</h2>
                <p className="mc-setting-desc">Invoices, payment method and plan changes are handled in Stripe.</p>
              </div>
              <div className="mc-setting-body">
                <dl className="mc-dl">
                  <div>
                    <dt>Current plan</dt>
                    <dd>{tierDisplayName(plan)}</dd>
                  </div>
                  <div>
                    <dt>Staff seats in use</dt>
                    <dd>{seatsUsed}</dd>
                  </div>
                </dl>
                <div>
                  <button type="button" className="mc-btn mc-btn-primary" disabled={portalLoading} onClick={handleManageBilling}>
                    {portalLoading ? "Opening Stripe…" : "Manage billing in Stripe"}
                  </button>
                </div>
                {portalError && <p className="mc-error" role="alert">{portalError}</p>}
              </div>
            </section>
          </div>
        )
      )}
    </div>
  );
}
