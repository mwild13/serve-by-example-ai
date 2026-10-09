"use client";

import { FormEvent, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/mission-control/manager-ui";
import { MissionControlTableRowSkeleton } from "@/components/ui/Skeletons";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { ExportButton, PageHead, StatusText } from "@/components/mission-control/console-ui";
import { rsaStatus, readinessPill } from "@/components/mission-control/compliance/helpers";
import type { ManagementSnapshot, StaffRole } from "@/lib/management/types";

type MembershipRow = {
  id: string;
  staff_email: string;
  venue_id: string | null;
  status: string;
  role?: string;
  created_at: string;
};

export type StaffDirectoryTableProps = {
  snapshot: ManagementSnapshot;
  selectedVenueId: string;
  selectedVenue: ManagementSnapshot["venues"][0] | undefined;
  venueStaff: ManagementSnapshot["staff"];
  selectedStaffId?: string;
  sessionToken: string | null;
  /** False for a duty manager — hides the Staff/Duty Manager invite selector
   * below so only the venue owner can grant duty-manager access. See
   * lib/session.ts's isOwnerLevelRole. Defaults true (owner) so an existing
   * caller that hasn't been updated to pass this still sees today's behavior. */
  isOwnerLevel?: boolean;
  onSnapshotUpdate: (updated: ManagementSnapshot) => void;
  onOpenCoachingDrawer: (staffId: string) => void;
  onAddStaff: () => void;
  handleExportStaff: () => void;
};

type InviteTab = "pending" | "joined";

// Invites shown before "Show more". A group's full invite history can run
// to hundreds of rows, so the card pages instead of rendering them all.
const INVITE_PAGE_SIZE = 10;

const STAFF_ROLE_OPTIONS: StaffRole[] = [
  "Bartender",
  "Floor",
  "Supervisor",
  "Manager",
  "New Staff",
];

// NOTE: readinessPill() is imported from ./compliance/helpers — the same
// shared function the Overview tab's Needs Attention card uses. This file
// used to define its own local readinessPill() that ignored
// trainingProgress entirely, which is why every staff member here rendered
// a green "Ready" pill regardless of 0% completion while Overview correctly
// showed amber/red (Phase 5 execution brief, Friction #1 — dual-status
// bug). Do not reintroduce a second implementation here.

export default function StaffDirectoryTable({
  selectedVenueId,
  selectedVenue,
  venueStaff,
  selectedStaffId,
  sessionToken,
  isOwnerLevel = true,
  onSnapshotUpdate,
  onOpenCoachingDrawer,
  onAddStaff,
  handleExportStaff,
}: StaffDirectoryTableProps) {
  const inviteEmailRef = useRef<HTMLInputElement>(null);
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>("all");
  const [openRosterSections, setOpenRosterSections] = useState<Set<string>>(new Set(["Bar Team"]));
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [membershipSeats, setMembershipSeats] = useState<{ used: number; max: number; unlimited: boolean }>({ used: 0, max: 0, unlimited: false });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTab, setInviteTab] = useState<InviteTab>("pending");
  const [inviteSearch, setInviteSearch] = useState("");
  // Paging resets whenever the venue, tab or search changes: the count only
  // applies to the view it was raised in.
  const [invitePage, setInvitePage] = useState<{ key: string; count: number }>({ key: "", count: INVITE_PAGE_SIZE });
  const [inviteRole, setInviteRole] = useState<"staff" | "duty_manager">("staff");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [membershipsLoaded, setMembershipsLoaded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ staffId: string; staffName: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());
  const [resentIds, setResentIds] = useState<Set<string>>(new Set());

  // Compliance form state (per-row expandable)
  const [complianceOpen, setComplianceOpen] = useState<Set<string>>(new Set());
  const [complianceDraft, setComplianceDraft] = useState<Record<string, {
    jurisdiction: string; rsaExpiry: string; fssExpiry: string;
    fssOnSite: boolean; isJunior: boolean; managerNotes: string;
  }>>({});
  const [complianceSaving, setComplianceSaving] = useState<Set<string>>(new Set());

  // Inline staff edit state
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<StaffRole>('New Staff');
  const [editSaving, setEditSaving] = useState(false);
  const [editAccessLevel, setEditAccessLevel] = useState<"staff" | "duty_manager">("staff");

  // Emails currently holding duty-manager access, derived from the same
  // memberships list already loaded for the invites panel below — avoids a
  // second fetch just to know who's already promoted.
  const dutyManagerEmails = useMemo(
    () => new Set(memberships.filter((m) => m.role === "duty_manager").map((m) => m.staff_email.toLowerCase())),
    [memberships],
  );

  // The API returns every invite the owner has sent, across all venues.
  // Scope the card to the selected venue; invites with no venue (sent before
  // a venue was selected) belong to the whole group, so show them everywhere.
  const venueInvites = useMemo(
    () => memberships.filter((m) => m.venue_id === selectedVenueId || m.venue_id === null),
    [memberships, selectedVenueId],
  );
  const pendingInvites = useMemo(() => venueInvites.filter((m) => m.status !== "active"), [venueInvites]);
  const joinedInvites = useMemo(() => venueInvites.filter((m) => m.status === "active"), [venueInvites]);
  const inviteQuery = inviteSearch.trim().toLowerCase();
  const tabInvites = inviteTab === "pending" ? pendingInvites : joinedInvites;
  const filteredInvites = inviteQuery
    ? tabInvites.filter((m) => m.staff_email.toLowerCase().includes(inviteQuery))
    : tabInvites;
  const invitePageKey = `${selectedVenueId}|${inviteTab}|${inviteQuery}`;
  const inviteVisibleCount = invitePage.key === invitePageKey ? invitePage.count : INVITE_PAGE_SIZE;
  const visibleInvites = filteredInvites.slice(0, inviteVisibleCount);

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

  const loadMemberships = useCallback(async () => {
    try {
      const res = await apiFetch("/api/management/memberships");
      if (!res.ok) {
        setMembershipsLoaded(true);
        return;
      }
      const data = await res.json();
      setMemberships(data.memberships ?? []);
      setMembershipSeats({
        used: data.seatUsage?.used ?? 0,
        max: data.seatUsage?.max ?? 0,
        unlimited: data.seatUsage?.unlimited === true,
      });
    } catch (err) {
      console.error("Failed to load memberships:", err);
    } finally {
      setMembershipsLoaded(true);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (!membershipsLoaded && sessionToken) {
      // Legitimate mount-time data fetch (external system: the memberships
      // API) — loadMemberships eventually calls setState once the response
      // resolves, which react-hooks/set-state-in-effect can't distinguish
      // from a synchronous setState call in the effect body.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadMemberships();
    }
  }, [sessionToken, membershipsLoaded, loadMemberships]);

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
          venueId: selectedVenueId || undefined,
          // Only ever sent as "duty_manager" when the selector below is
          // visible (isOwnerLevel), but the API route re-checks the
          // inviting user's own role server-side regardless — this client
          // gate is a UX convenience, not the security boundary.
          role: isOwnerLevel ? inviteRole : "staff",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error ?? "Failed to invite"); return; }
      setInviteEmail("");
      setInviteRole("staff");
      // Show the new invite: it lands in Pending.
      setInviteTab("pending");
      setInviteSearch("");
      // The membership record can be created successfully while the Brevo
      // send itself silently fails (bad sender, missing API key, etc.) — the
      // old code only checked res.ok and reported "sent" either way.
      if (!data.inviteSent) {
        setInviteError(
          data.inviteEmailError
            ? `Staff member added, but the invite email failed to send: ${data.inviteEmailError}`
            : "Staff member added, but the invite email could not be sent. They can still join using your venue code."
        );
      }
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

  async function handleResendInvite(membershipId: string) {
    setResendingIds(prev => new Set(prev).add(membershipId));
    setInviteError("");
    try {
      const res = await apiFetch("/api/management/memberships/resend", {
        method: "POST",
        body: JSON.stringify({ membershipId }),
      });
      const data = await res.json().catch(() => ({} as { emailSent?: boolean; error?: string }));
      // This used to be entirely silent on failure — no error state, no
      // res.ok check even shown to the manager — so a rejected resend just
      // looked like nothing happened when the button was clicked.
      if (res.ok && data.emailSent) {
        setResentIds(prev => new Set(prev).add(membershipId));
        setTimeout(() => setResentIds(prev => { const next = new Set(prev); next.delete(membershipId); return next; }), 3000);
      } else {
        setInviteError(data.error ? `Resend failed: ${data.error}` : "Resend failed. Please try again.");
      }
    } catch {
      setInviteError("Resend failed: network error.");
    } finally {
      setResendingIds(prev => { const next = new Set(prev); next.delete(membershipId); return next; });
    }
  }

  function toggleComplianceForm(member: ManagementSnapshot["staff"][0]) {
    setComplianceOpen(prev => {
      const next = new Set(prev);
      if (next.has(member.id)) {
        next.delete(member.id);
      } else {
        next.add(member.id);
        setComplianceDraft(d => ({
          ...d,
          [member.id]: {
            jurisdiction: member.compliance?.rsaJurisdiction ?? '',
            rsaExpiry: member.compliance?.rsaExpiryDate?.split('T')[0] ?? '',
            fssExpiry: member.compliance?.fssExpiryDate?.split('T')[0] ?? '',
            fssOnSite: member.compliance?.fssOnSiteCopy ?? false,
            isJunior: member.isJunior ?? false,
            managerNotes: member.managerNotes ?? '',
          },
        }));
      }
      return next;
    });
  }

  async function saveCompliance(staffId: string) {
    const draft = complianceDraft[staffId];
    if (!draft) return;
    setComplianceSaving(prev => new Set(prev).add(staffId));
    try {
      const res = await apiFetch('/api/management/staff', {
        method: 'PATCH',
        body: JSON.stringify({
          staffId,
          ...(draft.jurisdiction ? { rsaJurisdiction: draft.jurisdiction } : {}),
          rsaExpiryDate: draft.rsaExpiry || null,
          fssExpiryDate: draft.fssExpiry || null,
          fssOnSiteCopy: draft.fssOnSite,
          isJunior: draft.isJunior,
          managerNotes: draft.managerNotes || null,
        }),
      });
      const data = await res.json() as ManagementSnapshot;
      if (!res.ok) throw new Error((data as unknown as { error: string }).error ?? 'Save failed');
      onSnapshotUpdate(data);
      setComplianceOpen(prev => { const next = new Set(prev); next.delete(staffId); return next; });
    } catch (e) {
      console.error('Compliance save failed:', e);
    } finally {
      setComplianceSaving(prev => { const next = new Set(prev); next.delete(staffId); return next; });
    }
  }

  function startEditStaff(member: ManagementSnapshot["staff"][0]) {
    setEditingStaffId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
    setEditAccessLevel(
      member.email && dutyManagerEmails.has(member.email.toLowerCase()) ? "duty_manager" : "staff",
    );
  }

  async function saveEditStaff(staffId: string, email: string | undefined, accessLevelChanged: boolean) {
    setEditSaving(true);
    try {
      const res = await apiFetch('/api/management/staff', {
        method: 'PATCH',
        body: JSON.stringify({ staffId, name: editName.trim(), role: editRole }),
      });
      const data = await res.json() as ManagementSnapshot;
      if (!res.ok) throw new Error((data as unknown as { error: string }).error ?? 'Update failed');
      onSnapshotUpdate(data);

      // Access level lives on organization_members/profiles, not
      // venue_staff — a separate call, only fired when it actually changed
      // and there's an email to match against (self-serve venue-code joins
      // and legacy staff rows sometimes have none, in which case there's no
      // membership row to promote — this silently no-ops rather than erroring).
      if (accessLevelChanged && email) {
        const accessRes = await apiFetch('/api/management/memberships', {
          method: 'PATCH',
          body: JSON.stringify({ staffEmail: email, role: editAccessLevel }),
        });
        if (!accessRes.ok) {
          const accessData = await accessRes.json().catch(() => ({}));
          setInviteError(accessData.error ?? 'Failed to update access level.');
        } else {
          await loadMemberships();
        }
      }

      setEditingStaffId(null);
    } catch (e) {
      console.error('Staff edit failed:', e);
    } finally {
      setEditSaving(false);
    }
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
    <div className="mc-page">
      {/* ── Staff Directory ── */}
      <PageHead
        title="Staff"
        description={`${filteredStaff.length} ${filteredStaff.length === 1 ? "person" : "people"} at ${selectedVenue?.name ?? "this venue"}. Select a row to open that person's coaching profile.`}
        actions={
          <>
            <select
              className="mc-input"
              style={{ width: "auto", minHeight: 42 }}
              value={staffRoleFilter}
              onChange={(e) => setStaffRoleFilter(e.target.value)}
              aria-label="Filter by role"
            >
              <option value="all">All roles</option>
              {STAFF_ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ExportButton label="Export" onClick={handleExportStaff} />
            <button type="button" className="mc-btn mc-btn-primary" onClick={onAddStaff}>Add staff</button>
          </>
        }
      />
      <section className="ops-grid ops-grid-main">
        <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
          {venueStaff.length ? (
            <div className="ops-table-wrap">
              <table className="ops-table ops-staff-table">
                {/* Streamlined to 4 essential columns (Phase 5 UX Refinement
                    Pass, "5pm shift test"): Staff (name+role), Readiness
                    (traffic light), Progress, Action. Contact, Connection,
                    Module mastery, and Last active moved into the coaching
                    drawer that already opens on row click — this table is
                    the glance view, the drawer is the detail view. */}
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>Staff</th>
                    <th>Training</th>
                    <th>Readiness</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => {
                    const initials = member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                    const email = member.email;
                    const isEditing = editingStaffId === member.id;
                    const isCertOpen = complianceOpen.has(member.id);
                    const draft = complianceDraft[member.id];
                    const isCertSaving = complianceSaving.has(member.id);
                    return (
                      <Fragment key={member.id}>
                        <tr
                          className={selectedStaffId === member.id ? "active" : ""}
                          onClick={() => !isEditing && onOpenCoachingDrawer(member.id)}
                          style={{ cursor: isEditing ? 'default' : 'pointer' }}
                        >
                          <td>
                            <div className="ops-staff-avatar">{initials}</div>
                          </td>
                          <td onClick={isEditing ? e => e.stopPropagation() : undefined}>
                            {isEditing ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <input
                                  value={editName}
                                  onChange={e => setEditName(e.target.value)}
                                  onClick={e => e.stopPropagation()}
                                  style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '0.85rem', width: '100%' }}
                                />
                                <select
                                  value={editRole}
                                  onChange={e => setEditRole(e.target.value as StaffRole)}
                                  onClick={e => e.stopPropagation()}
                                  style={{ padding: '4px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '0.8rem' }}
                                >
                                  {STAFF_ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {/* Access level (Mission Control) is separate from the
                                    job-title Role select above — owner-only, and only
                                    meaningful for staff with an email (nothing to match
                                    a membership row against otherwise). */}
                                {isOwnerLevel && email && (
                                  <select
                                    value={editAccessLevel}
                                    onChange={e => setEditAccessLevel(e.target.value as "staff" | "duty_manager")}
                                    onClick={e => e.stopPropagation()}
                                    style={{ padding: '4px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '0.8rem' }}
                                  >
                                    <option value="staff">Staff — training only</option>
                                    <option value="duty_manager">Duty Manager — Mission Control</option>
                                  </select>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <strong>{member.name}</strong>
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); startEditStaff(member); }}
                                    className="mc-icon-btn"
                                    aria-label={`Edit ${member.name}`}
                                    title="Edit name and role"
                                  >
                                    <Pencil size={15} strokeWidth={1.75} aria-hidden="true" />
                                  </button>
                                </div>
                                <div className="mc-row-meta">
                                  {member.role}
                                  {email && dutyManagerEmails.has(email.toLowerCase()) ? " · Duty manager" : ""}
                                  {email ? ` · ${email}` : ""}
                                </div>
                              </div>
                            )}
                          </td>
                          <td style={{ minWidth: 200 }}>
                            <span className="mc-cell-bar">
                              <span className="mc-progress-track" aria-hidden="true">
                                <span className="mc-progress-fill" style={{ width: `${Math.max(0, Math.min(100, member.progress))}%` }} />
                              </span>
                              <span className="mc-cell-bar-value">{Math.round(member.progress)}%</span>
                            </span>
                          </td>
                          <td>
                            {(() => {
                              // An expired RSA blocks the person from service whatever their training says.
                              if (rsaStatus(member.compliance).level === 3) {
                                return <StatusText tone="alert" title="RSA expired">Blocked</StatusText>;
                              }
                              const pill = readinessPill(member.compliance, member.status, member.progress);
                              return <StatusText tone={pill.label === "Ready" ? "ok" : "warn"}>{pill.label === "Caution" ? "Needs follow-up" : pill.label}</StatusText>;
                            })()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    className="mc-btn mc-btn-primary mc-btn-sm"
                                    onClick={e => {
                                      e.stopPropagation();
                                      const wasDutyManager = !!member.email && dutyManagerEmails.has(member.email.toLowerCase());
                                      const isNowDutyManager = editAccessLevel === "duty_manager";
                                      saveEditStaff(member.id, member.email, wasDutyManager !== isNowDutyManager);
                                    }}
                                    disabled={editSaving}
                                  >
                                    {editSaving ? 'Saving…' : 'Save'}
                                  </button>
                                  <button
                                    type="button"
                                    className="mc-btn mc-btn-quiet mc-btn-sm"
                                    onClick={e => { e.stopPropagation(); setEditingStaffId(null); }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); toggleComplianceForm(member); }}
                                    className="mc-btn mc-btn-quiet mc-btn-sm"
                                    aria-expanded={isCertOpen}
                                  >
                                    {isCertOpen ? 'Close' : member.compliance?.rsaExpiryDate ? 'Certificates' : 'Add certificate'}
                                  </button>
                                  <button
                                    type="button"
                                    className="mc-icon-btn"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteStaff(member.id, member.name); }}
                                    disabled={isSaving}
                                    aria-label={`Remove ${member.name}`}
                                    title="Remove from venue"
                                  >
                                    <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isCertOpen && draft && (
                          <tr style={{ background: 'var(--bg-alt)' }}>
                            <td colSpan={5} style={{ padding: '14px 20px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', alignItems: 'flex-end' }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                                  RSA Jurisdiction
                                  <select
                                    value={draft.jurisdiction}
                                    onChange={e => setComplianceDraft(d => ({ ...d, [member.id]: { ...d[member.id], jurisdiction: e.target.value } }))}
                                    style={{ display: 'block', marginTop: '3px', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.8rem' }}
                                  >
                                    <option value="">— State —</option>
                                    {['NSW','VIC','QLD','WA','SA','TAS','NT','ACT'].map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </label>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                                  RSA Expiry
                                  <input type="date" value={draft.rsaExpiry}
                                    onChange={e => setComplianceDraft(d => ({ ...d, [member.id]: { ...d[member.id], rsaExpiry: e.target.value } }))}
                                    style={{ display: 'block', marginTop: '3px', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.8rem' }}
                                  />
                                </label>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                                  FSS Expiry <span style={{ fontWeight: 400 }}>(optional)</span>
                                  <input type="date" value={draft.fssExpiry}
                                    onChange={e => setComplianceDraft(d => ({ ...d, [member.id]: { ...d[member.id], fssExpiry: e.target.value } }))}
                                    style={{ display: 'block', marginTop: '3px', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.8rem' }}
                                  />
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-soft)', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={draft.fssOnSite}
                                      onChange={e => setComplianceDraft(d => ({ ...d, [member.id]: { ...d[member.id], fssOnSite: e.target.checked } }))} />
                                    FSS copy on-site
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-soft)', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={draft.isJunior}
                                      onChange={e => setComplianceDraft(d => ({ ...d, [member.id]: { ...d[member.id], isJunior: e.target.checked } }))} />
                                    Is junior / supervised
                                  </label>
                                </div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-soft)', width: '100%' }}>
                                  Manager notes <span style={{ fontWeight: 400 }}>(private)</span>
                                  <textarea
                                    rows={2}
                                    value={draft.managerNotes}
                                    onChange={e => setComplianceDraft(d => ({ ...d, [member.id]: { ...d[member.id], managerNotes: e.target.value } }))}
                                    placeholder="e.g. On probation until August, night shifts only"
                                    style={{ display: 'block', width: '100%', marginTop: '3px', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: '0.8rem', resize: 'vertical', minWidth: '220px' }}
                                  />
                                </label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() => saveCompliance(member.id)}
                                    disabled={isCertSaving}
                                    style={{ fontSize: '0.8rem', background: 'var(--green)', color: 'var(--surface-raised)', border: 'none', opacity: isCertSaving ? 0.6 : 1 }}
                                  >
                                    {isCertSaving ? 'Saving…' : 'Save cert'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() => toggleComplianceForm(member)}
                                    style={{ fontSize: '0.8rem' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              copy="No staff added yet. Hit + Add staff to build your first roster entry."
              ctaLabel="+ Add staff"
              onCtaClick={onAddStaff}
            />
          )}
        </article>
      </section>

      {/* ── Roster Overview ── */}
      <section>
        <article className="ops-card">
          <div className="ops-card-head">
            <h3>By team</h3>
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
                  <ChevronDown size={16} strokeWidth={2} aria-hidden="true" style={{ transform: isOpen ? "rotate(180deg)" : undefined, color: "var(--mc-text-muted)" }} />
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
                                  <span>{Math.round(m.progress)}%</span>
                                </div>
                              </td>
                              <td>
                                {(() => {
                                  if (m.status === "on-track" && m.progress === 0) return <StatusText>Not started</StatusText>;
                                  if (m.status === "on-track") return <StatusText tone="ok">On track</StatusText>;
                                  if (m.status === "attention") return <StatusText tone="warn">Needs follow-up</StatusText>;
                                  return <StatusText>Inactive</StatusText>;
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
          {!venueStaff.length && (
            <EmptyState
              copy="No staff data for this venue yet."
              ctaLabel="+ Add staff"
              onCtaClick={onAddStaff}
            />
          )}
        </article>
      </section>

      {/* ── Staff invites & seat management ── */}
      <section className="ops-grid ops-grid-main">
        <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
          <div className="ops-card-head">
            <h3>Staff invites &amp; seat management</h3>
            {/* Skeleton until loadMemberships resolves: the initial
                { used: 0, max: 0 } would otherwise flash as a real answer. */}
            {membershipsLoaded ? (
              <span>
                {membershipSeats.unlimited
                  ? `${membershipSeats.used} seats used · Unlimited`
                  : membershipSeats.max === 0
                    ? "No staff seats on this plan"
                    : `${membershipSeats.used} / ${membershipSeats.max} seats used`}
              </span>
            ) : (
              <span className="skeleton-line skeleton-line-badge" style={{ marginBottom: 0 }} />
            )}
          </div>

          {/* No Name field: organization_members has no name column, so a
              typed name was dropped. Staff set their own name at sign-up. */}
          <form
            className={`ops-invite-form${isOwnerLevel ? "" : " ops-invite-form-no-role"}`}
            onSubmit={handleInviteStaff}
            style={{ marginTop: 14 }}
          >
            <label className="label">
              Staff email
              <input
                ref={inviteEmailRef}
                className="input"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="staff@venue.com"
                required
              />
            </label>
            {/* Only the venue owner can grant duty-manager access — a duty
                manager inviting someone else only ever sends role: "staff"
                (enforced server-side too, see memberships/route.ts). */}
            {isOwnerLevel && (
              <label className="label">
                Access level
                <select
                  className="input"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "staff" | "duty_manager")}
                >
                  <option value="staff">Staff — training only</option>
                  <option value="duty_manager">Duty Manager — Mission Control (no Billing)</option>
                </select>
              </label>
            )}
            <button className="btn btn-primary" type="submit" disabled={inviteLoading}>
              {inviteLoading ? "Inviting..." : inviteRole === "duty_manager" ? "Invite duty manager" : "Invite staff member"}
            </button>
          </form>
          {/* .ops-notice was never defined in globals.css — the manager
              never actually saw this text. auth-status-error is a real,
              styled class used elsewhere for the same purpose. */}
          {inviteError && <p className="auth-status auth-status-error" style={{ marginBottom: 12 }}>{inviteError}</p>}

          {!membershipsLoaded ? (
            <MissionControlTableRowSkeleton rows={3} columns={4} />
          ) : venueInvites.length > 0 ? (
            <>
              <div className="ops-invite-toolbar">
                <div className="ops-invite-tabs" role="tablist" aria-label="Invite status">
                  <button
                    type="button"
                    role="tab"
                    className="ops-invite-tab"
                    aria-selected={inviteTab === "pending"}
                    onClick={() => setInviteTab("pending")}
                  >
                    Pending ({pendingInvites.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className="ops-invite-tab"
                    aria-selected={inviteTab === "joined"}
                    onClick={() => setInviteTab("joined")}
                  >
                    Joined ({joinedInvites.length})
                  </button>
                </div>
                {tabInvites.length > INVITE_PAGE_SIZE && (
                  <input
                    className="ops-search-input"
                    type="search"
                    value={inviteSearch}
                    onChange={(e) => setInviteSearch(e.target.value)}
                    placeholder="Search by email"
                    aria-label="Search invites by email"
                  />
                )}
              </div>

              {visibleInvites.length > 0 ? (
                <div className="ops-table-wrap">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Access</th>
                        <th>{inviteTab === "pending" ? "Invited" : "Since"}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleInvites.map((m) => (
                        <tr key={m.id}>
                          <td>{m.staff_email}</td>
                          <td>{m.role === "duty_manager" ? "Duty Manager" : "Staff"}</td>
                          <td>{new Date(m.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                              {m.status !== "active" && (
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  style={{ fontSize: "0.75rem", padding: "3px 10px", opacity: resendingIds.has(m.id) ? 0.6 : 1 }}
                                  disabled={resendingIds.has(m.id)}
                                  onClick={() => handleResendInvite(m.id)}
                                >
                                  {resentIds.has(m.id) ? "Sent!" : resendingIds.has(m.id) ? "Sending..." : "Resend"}
                                </button>
                              )}
                              <button
                                type="button"
                                className="ops-table-delete-btn"
                                onClick={() => handleRemoveMembership(m.id)}
                                aria-label={`Remove ${m.staff_email}`}
                              >
                                &times;
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ margin: "8px 0", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  {inviteQuery
                    ? "No invites match that email."
                    : inviteTab === "pending"
                      ? "No pending invites for this venue. Everyone you've invited has joined."
                      : "No one has joined from an invite at this venue yet."}
                </p>
              )}

              {filteredInvites.length > visibleInvites.length && (
                <div className="ops-invite-more">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setInvitePage({ key: invitePageKey, count: inviteVisibleCount + INVITE_PAGE_SIZE })}
                  >
                    Show more ({filteredInvites.length - visibleInvites.length} left)
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              copy="No staff invites for this venue yet. Invite team members by email to give them sponsored access to training modules."
              ctaLabel="Invite by email"
              onCtaClick={() => inviteEmailRef.current?.focus()}
            />
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
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700, color: "var(--color-ink)" }}>
              Remove staff member?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.55 }}>
              Are you sure you want to remove <strong>{deleteConfirm.staffName}</strong> from the roster? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "1.5px solid var(--viz-neutral-light)",
                  background: "white", fontWeight: 600, fontSize: "0.875rem",
                  cursor: "pointer", color: "var(--text-secondary)",
                }}
              >
                No, keep
              </button>
              <button
                type="button"
                onClick={confirmDeleteStaff}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none",
                  background: "var(--status-critical)", color: "white",
                  fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                }}
              >
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
