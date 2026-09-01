"use client";

import { useState, type FormEvent, type MutableRefObject } from "react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { TrialBillingSection } from "./TrialBillingSection";
import { EmptyState } from "@/components/mission-control/manager-ui";
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

  return (
    <section className="ops-grid ops-grid-main">
      <div className="mcc-tab-bar" style={{ gridColumn: "1 / -1", marginBottom: 4 }}>
        <button type="button" className={`mcc-tab${settingsTab === "setup" ? " mcc-tab-active" : ""}`} onClick={() => setSettingsTab("setup")}>Venue setup</button>
        <button type="button" className={`mcc-tab${settingsTab === "billing" ? " mcc-tab-active" : ""}`} onClick={() => setSettingsTab("billing")}>Billing</button>
        <button type="button" className={`mcc-tab${settingsTab === "account" ? " mcc-tab-active" : ""}`} onClick={() => setSettingsTab("account")}>Account</button>
      </div>
      {settingsTab === "setup" && (<>
      {/* ── Setup progress tracker ── */}
      {(() => {
        const steps = [
          { label: "Add a venue", done: snapshot.venues.length > 0 },
          { label: "Staff join code ready", done: !!selectedVenue?.venueCode },
          { label: "Invite staff members", done: venueStaff.length > 0 },
          { label: "First staff member trained", done: venueStaff.some((s) => s.progress > 0) },
        ];
        const completedCount = steps.filter((s) => s.done).length;
        const allDone = completedCount === steps.length;
        return (
          <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
            <div className="ops-card-head">
              <h3>Setup checklist</h3>
              <span style={{ color: allDone ? "var(--status-success-strong)" : "var(--text-muted)" }}>{completedCount}/{steps.length} complete</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {steps.map((step) => (
                <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: step.done ? "var(--status-success-bg)" : "var(--bg-alt)", border: `1.5px solid ${step.done ? "var(--status-success-border)" : "var(--line)"}` }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: step.done ? "var(--status-success)" : "var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {step.done
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="2" fill="white"/></svg>
                    }
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: step.done ? "var(--status-success-strong)" : "var(--text-soft)" }}>{step.label}</span>
                </div>
              ))}
            </div>
            {allDone && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--status-success-subtle)", borderRadius: 8, fontSize: "0.82rem", color: "var(--status-success-strong)", fontWeight: 600 }}>
                Venue setup complete. Your team is ready to train.
              </div>
            )}
          </article>
        );
      })()}
      <article className="ops-card">
        <div className="ops-card-head">
          <h3>Venue setup</h3>
        </div>
        <div className="ops-venue-manager">
          {isMultiVenue ? (
            <>
              <label className="label">
                Active venue
                <select
                  className="input"
                  value={selectedVenueId}
                  onChange={(event) => setSelectedVenueId(event.target.value)}
                >
                  {snapshot.venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </label>
              <form className="ops-venue-form" onSubmit={handleAddVenue}>
                <label className="label">
                  Add new venue
                  <input
                    className="input"
                    value={newVenueName}
                    onChange={(event) => setNewVenueName(event.target.value)}
                    placeholder="New Venue Name"
                    required
                  />
                </label>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Add venue"}
                </button>
              </form>
              <div className="ops-venue-list">
                {snapshot.venues.length === 0 ? (
                  // .ops-venue-row-empty (the class this used to render with)
                  // was never defined in globals.css — this text rendered
                  // completely unstyled, easy to miss next to the styled
                  // "Add venue" form above it. EmptyState is an improvement,
                  // not just a consolidation, here.
                  <EmptyState copy="No venues found. Create your first venue to get started." />
                ) : (
                  snapshot.venues.map((venue) => (
                    <div key={venue.id} className="ops-venue-row">
                      <strong>{venue.name}</strong>
                      <div style={{ display: "flex", gap: 8 }}>
                        {venue.venueCode && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              const url = `${window.location.origin}/dashboard?join=${venue.venueCode}`;
                              navigator.clipboard.writeText(url);
                              setCopiedVenueId(venue.id);
                              if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
                              copyTimeoutRef.current = setTimeout(() => setCopiedVenueId(null), 2000);
                            }}
                          >
                            {copiedVenueId === venue.id ? "Copied!" : "Share link"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setVenueDeleteConfirm({ venueId: venue.id, venueName: venue.name })}
                          disabled={isSaving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleRenameVenue}>
              <label className="label">
                Venue name
                <input
                  className="input"
                  value={renameVenueName}
                  onChange={(event) => setRenameVenueName(event.target.value)}
                  placeholder="Your venue name"
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={renameSaving} style={{ marginTop: 8 }}>
                {renameSaving ? "Saving..." : "Save changes"}
              </button>
            </form>
          )}
        </div>
      </article>

      <article className="ops-card">
        <div className="ops-card-head">
          <h3>Manager limits</h3>
        </div>
        {(() => {
          // Real org-wide seat usage (tierSeatLimit()/countActiveSeats(),
          // the same helper the "Staff invites & seat management" card
          // uses) — not the stale, per-venue `venues.staff_limit` column,
          // which never updated after a tier change (an Enterprise upgrade
          // kept showing whatever cap was true the day a venue was first
          // created). seatUsage is fetched once on mount and may briefly be
          // null; fall back to the current venue's staff count so the card
          // never flashes "0 / …" while it loads.
          const staffUsed = seatUsage?.used ?? venueStaff.length;
          const isUnlimited = seatUsage?.unlimited ?? false;
          const staffLimit = seatUsage?.max ?? null;
          const pct = !isUnlimited && staffLimit && staffLimit > 0 ? Math.min(100, Math.round((staffUsed / staffLimit) * 100)) : 0;
          const isWarning = !isUnlimited && pct >= 90;
          const isFull = !isUnlimited && staffLimit != null && staffUsed >= staffLimit;
          return (
            <>
              <dl className="ops-settings-list">
                <div>
                  <dt>Staff limit</dt>
                  <dd>
                    <span style={{ fontWeight: 700 }}>
                      {staffUsed} / {isUnlimited ? "Unlimited" : staffLimit ?? "…"}
                    </span>
                    {!isUnlimited && <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 4 }}>seats used</span>}
                    {!isUnlimited && staffLimit != null && (
                      <div style={{ marginTop: 6, height: 6, background: "var(--bg-alt)", borderRadius: 999, overflow: "hidden", maxWidth: 180, border: "none", padding: 0 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: isFull ? "var(--status-critical)" : isWarning ? "var(--status-warning)" : "var(--color-mastery-technical)", borderRadius: 999, transition: "width 0.3s ease", border: "none", padding: 0 }} />
                      </div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Venue Limit</dt>
                  {/* No tier in this codebase has a documented/enforced venue
                      cap — the old "5 Venues Maximum" was fabricated with no
                      backing config anywhere. Multi-venue tiers (commercial,
                      enterprise, venue_multi) are honestly unlimited; single-
                      venue tiers are exactly 1 by product design. */}
                  <dd>{isMultiVenue ? "Unlimited venues" : "1 Venue"}</dd>
                </div>
              </dl>
              {isWarning && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: isFull ? "var(--status-critical-light)" : "var(--status-yellow-bg)", border: `1px solid ${isFull ? "var(--status-critical-border)" : "var(--color-amber-badge)"}`, fontSize: "0.82rem", color: isFull ? "var(--status-critical-badge)" : "var(--status-amber-text)" }}>
                  {isFull ? "Staff limit reached." : `Approaching your staff limit (${pct}% used).`}{" "}
                  <a href="/pricing" style={{ color: "inherit", fontWeight: 700, textDecoration: "underline" }}>Upgrade your plan</a> to add more seats.
                </div>
              )}
            </>
          );
        })()}
      </article>

      {selectedVenue?.venueCode && (
        <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
          <div className="ops-card-head">
            <h3>Staff join code</h3>
          </div>
          <p style={{ marginBottom: "1rem", color: "var(--ops-text-soft, var(--color-text-muted))" }}>
            Share this code with your staff. They enter it in their training dashboard under <strong>Settings → Join Venue</strong> to link their account and sync their training data here.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "var(--ip-green)",
              background: "var(--status-success-bg)",
              border: "2px solid var(--status-success-border)",
              borderRadius: "12px",
              padding: "0.5rem 1.5rem",
              userSelect: "all",
            }}>
              {selectedVenue.venueCode}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(String(selectedVenue.venueCode))}
            >
              Copy code
            </button>
          </div>
          <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--ops-text-soft, var(--color-text-faint))" }}>
            Once a staff member joins, their training progress will appear in real time in your staff directory.
          </p>
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>What your staff will see</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--text-soft)" }}>
              <span style={{ padding: "3px 10px", borderRadius: 6, background: "var(--status-success-bg)", border: "1px solid var(--status-success-border)", fontWeight: 600, color: "var(--status-success-strong)" }}>Settings</span>
              <span style={{ color: "var(--text-muted)" }}>→</span>
              <span style={{ padding: "3px 10px", borderRadius: 6, background: "var(--status-success-bg)", border: "1px solid var(--status-success-border)", fontWeight: 600, color: "var(--status-success-strong)" }}>Join Venue</span>
              <span style={{ color: "var(--text-muted)" }}>→ Enter code</span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 800, color: "var(--ip-green)", background: "var(--bg-green-pale)", padding: "2px 8px", borderRadius: 4 }}>{selectedVenue?.venueCode}</span>
            </div>
          </div>
        </article>
      )}

      <article className="ops-card">
        <div className="ops-card-head">
          <h3>Staff sign-up link</h3>
        </div>
        <p className="ops-settings-hint">
          Share this link with staff to let them sign up and join your venue directly. No email setup required.
        </p>
        {selectedVenue?.venueCode ? (
          <div style={{ marginTop: 16 }}>
            <input
              className="input"
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : "https://servebyexample.co"}/dashboard?join=${selectedVenue.venueCode}`}
              style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: "0.8rem", marginBottom: 8 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => {
                const url = `${window.location.origin}/dashboard?join=${selectedVenue.venueCode}`;
                navigator.clipboard.writeText(url);
                setCopiedVenueId(`signup-${selectedVenue.id}`);
                if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
                copyTimeoutRef.current = setTimeout(() => setCopiedVenueId(null), 2000);
              }}
            >
              {copiedVenueId === `signup-${selectedVenue.id}` ? "Copied!" : "Copy sign-up link"}
            </button>
          </div>
        ) : (
          <p style={{ color: "var(--ops-text-soft, var(--color-text-faint))", fontSize: 13, marginTop: 12 }}>
            No join code found for this venue. Try refreshing the page.
          </p>
        )}
      </article>
      </>)}
      {settingsTab === "account" && (
        <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
          <div className="ops-card-head">
            <h3>Account settings</h3>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const name = accountDisplayName.trim();
              if (!name) return;
              setAccountSaving(true);
              setAccountSaved(false);
              try {
                const headers: Record<string, string> = { "Content-Type": "application/json" };
                if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
                const res = await fetch("/api/profile/update-name", {
                  method: "POST",
                  headers,
                  body: JSON.stringify({ name }),
                });
                if (res.ok) setAccountSaved(true);
              } catch { /* silent */ } finally {
                setAccountSaving(false);
              }
            }}
            style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}
          >
            <label className="label">
              Display name
              <input
                className="input"
                value={accountDisplayName}
                onChange={(e) => { setAccountDisplayName(e.target.value); setAccountSaved(false); }}
                placeholder="Your name"
                required
              />
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={accountSaving}>
                {accountSaving ? "Saving..." : "Save name"}
              </button>
              {accountSaved && (
                <span style={{ fontSize: "0.82rem", color: "var(--green)", fontWeight: 600 }}>Saved</span>
              )}
            </div>
          </form>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line-light)" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: 10 }}>
              Need to update your password?
            </p>
            <a
              href="/reset-password"
              style={{ fontSize: "0.875rem", color: "var(--green)", fontWeight: 600, textDecoration: "none" }}
            >
              Change password →
            </a>
          </div>
        </article>
      )}
      {settingsTab === "billing" && (
        <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
          {trialTier && trialEndsAt && typeof daysRemaining === "number" ? (
            <TrialBillingSection
              trialTier={trialTier}
              trialEndsAt={trialEndsAt}
              daysRemaining={daysRemaining}
              staffCount={venueStaff.length}
              scenariosRun={snapshot.staff.reduce((sum, m) => sum + (m.scenariosAttempted ?? 0), 0)}
            />
          ) : (
            <>
              <div className="ops-card-head">
                <h3>Billing overview</h3>
              </div>
              <dl className="ops-settings-list">
                <div>
                  <dt>Current plan</dt>
                  <dd>{tierDisplayName(plan)} Plan</dd>
                </div>
                <div>
                  <dt>Seats used</dt>
                  <dd>{venueStaff.length} active staff seats</dd>
                </div>
                <div>
                  <dt>Next invoice</dt>
                  <dd>Managed via Stripe</dd>
                </div>
              </dl>
              <div style={{ marginTop: "20px" }}>
                <button
                  className="btn"
                  style={{ fontSize: "0.875rem", opacity: portalLoading ? 0.7 : 1, cursor: portalLoading ? "wait" : "pointer" }}
                  disabled={portalLoading}
                  onClick={handleManageBilling}
                >
                  {portalLoading ? "Opening Stripe…" : "Manage billing in Stripe"}
                </button>
                {portalError && (
                  <div
                    role="alert"
                    style={{
                      marginTop: 10, padding: "10px 14px", borderRadius: 8,
                      background: "var(--status-critical-bg)", border: "1.5px solid var(--status-critical-border)",
                      color: "var(--status-critical-text)", fontSize: "0.82rem", maxWidth: 480,
                    }}
                  >
                    {portalError}
                  </div>
                )}
              </div>
            </>
          )}
        </article>
      )}
    </section>
  );
}
