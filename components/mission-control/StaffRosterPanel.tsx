"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { EmptyState, MasteryMicroGrid } from "./manager-ui";
import { WorkspaceHeader } from "@/app/management/dashboard/_components/WorkspaceHeader";
import { rsaStatus } from "./compliance/helpers";
import type { ManagementSnapshot, StaffRole, StaffMember } from "@/lib/management/types";

type MembershipRow = {
  id: string;
  staff_email: string;
  staff_name?: string;
  venue_id: string | null;
  status: string;
  created_at: string;
};

export type StaffRosterPanelProps = {
  snapshot: ManagementSnapshot;
  selectedVenueId: string;
  selectedVenue: ManagementSnapshot["venues"][0] | undefined;
  venueStaff: ManagementSnapshot["staff"];
  selectedStaffId?: string;
  sessionToken: string | null;
  onSnapshotUpdate: (updated: ManagementSnapshot) => void;
  onOpenCoachingDrawer: (staffId: string) => void;
};

const STAFF_ROLE_OPTIONS: StaffRole[] = [
  "Bartender",
  "Floor",
  "Supervisor",
  "Manager",
  "New Staff",
];

function parseLastActiveDays(lastActive: string): number {
  if (!lastActive) return 0;
  const m = lastActive.match(/(\d+)\s*(day|week|month)/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  if (isNaN(n)) return 0;
  if (m[2] === 'week') return n * 7;
  if (m[2] === 'month') return n * 30;
  return n;
}

function readinessPill(member: StaffMember): { label: string; dot: string; bg: string; color: string } {
  const rsaStat = rsaStatus(member.compliance);
  if (rsaStat.level === 3)
    return { label: 'At Risk', dot: '○', bg: '#fff1f2', color: '#b91c1c' };
  if (member.status === 'attention' || rsaStat.level === 2)
    return { label: 'Caution', dot: '◐', bg: '#fff7ed', color: '#c2410c' };
  return { label: 'Ready', dot: '●', bg: '#dcfce7', color: '#16a34a' };
}

export default function StaffRosterPanel({
  selectedVenueId,
  selectedVenue,
  venueStaff,
  selectedStaffId,
  sessionToken,
  onSnapshotUpdate,
  onOpenCoachingDrawer,
}: StaffRosterPanelProps) {
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>("all");
  const [openRosterSections, setOpenRosterSections] = useState<Set<string>>(new Set(["Bar Team"]));
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [membershipSeats, setMembershipSeats] = useState<{ used: number; max: number }>({ used: 0, max: 0 });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [membershipsLoaded, setMembershipsLoaded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ staffId: string; staffName: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const apiFetch = useCallback((url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
    }
    return fetch(url, { ...options, headers });
  }, [sessionToken]);

  async function loadMemberships() {
    try {
      const res = await apiFetch("/api/management/memberships");
      if (!res.ok) {
        setMembershipsLoaded(true);
        return;
      }
      const data = await res.json();
      setMemberships(data.memberships ?? []);
      setMembershipSeats({ used: data.seatUsage?.used ?? 0, max: data.seatUsage?.max ?? 0 });
    } catch (err) {
      console.error("Failed to load memberships:", err);
    } finally {
      setMembershipsLoaded(true);
    }
  }

  useEffect(() => {
    if (!membershipsLoaded && sessionToken) {
      loadMemberships();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  const toggleRosterSection = useCallback((label: string) => {
    setOpenRosterSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  async function handleInviteStaff(e: FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const res = await apiFetch("/api/management/memberships", {
        method: "POST",
        body: JSON.stringify({
          staffEmail: inviteEmail.trim(),
          staffName: inviteName.trim() || undefined,
          venueId: selectedVenueId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error ?? "Failed to invite"); return; }
      setInviteEmail("");
      setInviteName("");
      await loadMemberships();
    } catch { setInviteError("Network error"); } finally { setInviteLoading(false); }
  }

  async function handleRemoveMembership(id: string) {
    try {
      const res = await apiFetch("/api/management/memberships", {
        method: "DELETE",
        body: JSON.stringify({ membershipId: id }),
      });
      if (res.ok) await loadMemberships();
    } catch { /* silent */ }
  }

  function handleDeleteStaff(staffId: string, staffName: string) {
    setDeleteConfirm({ staffId, staffName });
  }

  async function confirmDeleteStaff() {
    if (!deleteConfirm) return;
    const { staffId } = deleteConfirm;
    setDeleteConfirm(null);
    setIsSaving(true);
    try {
      const response = await apiFetch(
        `/api/management/staff?staffId=${encodeURIComponent(staffId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) return;
      const result = await response.json() as ManagementSnapshot;
      onSnapshotUpdate(result);
    } catch { /* silent */ } finally {
      setIsSaving(false);
    }
  }

  const filteredStaff = venueStaff.filter((m) => staffRoleFilter === "all" || m.role === staffRoleFilter);

  return (
    <>
      {/* ── Staff Directory ── */}
      <section className="ops-grid ops-grid-main">
        <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
          <WorkspaceHeader
            title="Staff directory"
            description="Click any row to open the coaching profile"
            actions={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--mcc-border)", background: "var(--mcc-bg)", color: "var(--mcc-ink-700)", fontSize: "0.82rem", cursor: "pointer" }}
                  aria-label="Filter by role"
                >
                  <option value="all">All roles</option>
                  {STAFF_ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <span style={{ fontSize: "0.82rem", color: "var(--mcc-ink-500)" }}>
                  {filteredStaff.length} {filteredStaff.length === 1 ? "person" : "people"} · {selectedVenue?.name}
                </span>
              </div>
            }
          />
          {venueStaff.length ? (
            <div className="ops-table-wrap">
              <table className="ops-table ops-staff-table">
                <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--surface-raised)" }}>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Connection</th>
                    <th>Module mastery</th>
                    <th>Last active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => {
                    const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    const email = member.email ?? `${member.name.split(" ")[0].toLowerCase()}@sbe.io`;
                    const isReady = member.progress >= 70;
                    const barColor = member.progress >= 70 ? "#16a34a" : member.progress >= 40 ? "#f59e0b" : "#dc2626";
                    return (
                      <tr
                        key={member.id}
                        className={selectedStaffId === member.id ? "active" : ""}
                        onClick={() => onOpenCoachingDrawer(member.id)}
                      >
                        <td>
                          <div className="ops-staff-avatar">{initials}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <strong>{member.name}</strong>
                            {isReady && <span style={{ padding: "1px 7px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 700, background: "#dcfce7", color: "#15803d", flexShrink: 0 }}>Ready</span>}
                          </div>
                        </td>
                        <td><div className="ops-email-icon-cell" title={email}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                          </svg>
                        </div></td>
                        <td>{member.role}</td>
                        <td style={{ minWidth: 90 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 999 }}>
                              <div style={{ height: "100%", width: `${member.progress}%`, background: barColor, borderRadius: 999, transition: "width 0.3s" }} />
                            </div>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--mcc-ink-700)", width: 30, textAlign: "right" }}>{Math.round(member.progress)}%</span>
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const pill = readinessPill(member);
                            return (
                              <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, background: pill.bg, color: pill.color }}>
                                {pill.dot} {pill.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td>
                          {member.staffUserId ? (
                            <span className="ops-badge ops-badge-active">Connected</span>
                          ) : member.email ? (
                            <span className="ops-badge ops-badge-pending">Invited</span>
                          ) : (
                            <span className="ops-badge ops-badge-removed">No account</span>
                          )}
                        </td>
                        <td>
                          <MasteryMicroGrid
                            scenariosMastered={member.scenariosMastered}
                            scenariosAttempted={member.scenariosAttempted}
                          />
                        </td>
                        <td>
                          {(() => {
                            const days = member.lastActiveDays ?? parseLastActiveDays(member.lastActive);
                            const lastActiveStyle = days > 30
                              ? { color: '#b91c1c', fontWeight: 700 }
                              : days > 14 ? { color: '#c2410c' } : {};
                            return <span style={lastActiveStyle}>{member.lastActive}</span>;
                          })()}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="ops-table-delete-btn"
                            onClick={(e) => { e.stopPropagation(); handleDeleteStaff(member.id, member.name); }}
                            disabled={isSaving}
                            aria-label={`Remove ${member.name}`}
                          >
                            &times;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState copy="No staff added yet. Hit + Add staff to build your first roster entry." />
          )}
        </article>
      </section>

      {/* ── Roster Overview ── */}
      <section style={{ marginTop: 12 }}>
        <article className="ops-card">
          <div className="ops-card-head">
            <h3>Roster overview</h3>
            <span>by team</span>
          </div>
          {[
            { label: "Bar Team", roles: ["Bartender"] },
            { label: "Floor Team", roles: ["Floor"] },
            { label: "Leadership Team", roles: ["Supervisor", "Manager"] },
            { label: "New Staff", roles: ["New Staff"] },
          ].map((group) => {
            const groupMembers = venueStaff.filter((m) => group.roles.includes(m.role));
            if (!groupMembers.length) return null;
            const isOpen = openRosterSections.has(group.label);
            return (
              <div key={group.label} className="ops-roster-accordion">
                <button
                  type="button"
                  className="ops-roster-accordion-head"
                  onClick={() => toggleRosterSection(group.label)}
                >
                  <span className="ops-roster-label">{group.label}</span>
                  <span className="ops-roster-count">{groupMembers.length} {groupMembers.length === 1 ? "member" : "members"}</span>
                  <span className="ops-roster-toggle">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div className="ops-roster-body">
                    <table className="ops-table ops-roster-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Progress</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupMembers.map((m) => {
                          const initials = m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                          return (
                            <tr key={`roster-${m.id}`} onClick={() => onOpenCoachingDrawer(m.id)} style={{ cursor: "pointer" }}>
                              <td><div className="ops-staff-avatar ops-staff-avatar-sm">{initials}</div></td>
                              <td><strong>{m.name}</strong></td>
                              <td>{m.role}</td>
                              <td>
                                <div className="ops-progress-inline">
                                  <div className="ops-progress-inline-bar">
                                    <div className="ops-progress-inline-fill" style={{ width: `${Math.max(0, Math.min(100, m.progress))}%` }} />
                                  </div>
                                  <span>{parseFloat(m.progress.toFixed(2))}%</span>
                                </div>
                              </td>
                              <td>
                                {(() => {
                                  const lbl = m.status === "on-track" && m.progress === 0 ? "Not started" : m.status === "on-track" ? "On track" : m.status === "attention" ? "Attention" : "Inactive";
                                  const sty = m.status === "on-track" && m.progress === 0 ? { background: "#f3f4f6", color: "#6b7280" } : m.status === "on-track" ? { background: "#dcfce7", color: "#16a34a" } : m.status === "attention" ? { background: "#fff7ed", color: "#c2410c" } : { background: "#fff1f2", color: "#b91c1c" };
                                  return <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, ...sty }}>{lbl}</span>;
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {!venueStaff.length && <EmptyState copy="No staff data for this venue yet." />}
        </article>
      </section>

      {/* ── Staff invites & seat management ── */}
      <section className="ops-grid ops-grid-main" style={{ marginTop: 16 }}>
        <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
          <div className="ops-card-head">
            <h3>Staff invites &amp; seat management</h3>
            <span>{membershipSeats.used} / {membershipSeats.max || "∞"} seats used</span>
          </div>

          <form className="ops-action-form" onSubmit={handleInviteStaff} style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label className="label">
                Name
                <input
                  className="input"
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                />
              </label>
              <label className="label">
                Staff email
                <input
                  className="input"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="staff@venue.com"
                  required
                />
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={inviteLoading} style={{ marginTop: 4 }}>
              {inviteLoading ? "Inviting..." : "Invite staff member"}
            </button>
          </form>
          {inviteError && <p className="ops-notice ops-notice-error">{inviteError}</p>}

          {memberships.length > 0 ? (
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Invited</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((m) => {
                    const steps = [
                      { label: "Invited", done: true },
                      { label: "Registered", done: m.status === "active" || m.status === "connected" },
                      { label: "Training active", done: m.status === "active" },
                    ];
                    return (
                      <tr key={m.id}>
                        <td>
                          {m.staff_email}
                          <br />
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                            {steps.map((step, si) => (
                              <span key={step.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "1px 6px", borderRadius: 999, background: step.done ? "#dcfce7" : "#f3f4f6", color: step.done ? "#15803d" : "#9ca3af" }}>{step.label}</span>
                                {si < steps.length - 1 && <span style={{ color: "#e5e7eb", fontSize: "0.65rem" }}>→</span>}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td><span className={`ops-badge ops-badge-${m.status}`}>{m.status}</span></td>
                        <td>{new Date(m.created_at).toLocaleDateString()}</td>
                        <td>
                          {m.status !== "removed" && (
                            <button
                              type="button"
                              className="ops-table-delete-btn"
                              onClick={() => handleRemoveMembership(m.id)}
                              aria-label={`Remove ${m.staff_email}`}
                            >
                              &times;
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState copy="No staff invites yet. Invite team members by email to give them sponsored access to training modules." />
          )}
        </article>
      </section>

      {/* ── Delete staff confirmation modal ── */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: 12, padding: "28px 32px",
              maxWidth: 400, width: "calc(100% - 48px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
              Remove staff member?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.55 }}>
              Are you sure you want to remove <strong>{deleteConfirm.staffName}</strong> from the roster? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                  background: "white", fontWeight: 600, fontSize: "0.875rem",
                  cursor: "pointer", color: "#374151",
                }}
              >
                No, keep
              </button>
              <button
                type="button"
                onClick={confirmDeleteStaff}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none",
                  background: "#dc2626", color: "white",
                  fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                }}
              >
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
