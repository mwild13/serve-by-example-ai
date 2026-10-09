'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StaffMember, AustralianState, ManagementSnapshot } from '@/lib/management/types';
import { rsaStatus, fssStatus, daysUntilExpiry, normalizeExpiryDate } from './helpers';
import { Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/mission-control/manager-ui';
import { ExportButton, PageHead, Panel, StatRow, StatusText } from '@/components/mission-control/console-ui';
import { MissionControlTableRowSkeleton } from '@/components/ui/Skeletons';

interface CustomCert {
  id: string;
  venue_staff_id: string;
  cert_name: string;
  cert_number: string | null;
  expiry_date: string | null;
  notes: string | null;
}

const AU_STATES: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];

interface ComplianceHubProps {
  venueStaff: StaffMember[];
  sessionToken?: string | null;
  onSnapshotUpdate?: (snapshot: ManagementSnapshot) => void;
}

export function ComplianceHub({ venueStaff, sessionToken, onSnapshotUpdate }: ComplianceHubProps) {
  // A19 — Custom certifications
  const [customCerts, setCustomCerts] = useState<CustomCert[]>([]);
  const [customCertsLoaded, setCustomCertsLoaded] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStaffId, setCustomStaffId] = useState('');
  const [customCertName, setCustomCertName] = useState('');
  const [customCertNumber, setCustomCertNumber] = useState('');
  const [customExpiryDate, setCustomExpiryDate] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customSaving, setCustomSaving] = useState(false);
  const [customError, setCustomError] = useState('');
  const [customDeletingId, setCustomDeletingId] = useState<string | null>(null);

  // Sampled once per mount (memoized) for a day-granularity expiry
  // countdown. react-hooks/purity still flags any Date.now() call reachable
  // from render, even memoized ones — there's no render-pure way to seed a
  // "current time" value, so this is an intentional, scoped exception.
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), []);

  useEffect(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
    fetch('/api/management/compliance/certifications', { headers })
      .then(r => r.json())
      .then((data: { certs?: CustomCert[] }) => {
        if (Array.isArray(data.certs)) setCustomCerts(data.certs);
      })
      .catch(() => { /* non-blocking */ })
      .finally(() => setCustomCertsLoaded(true));
  }, [sessionToken]);

  async function handleSaveCustomCert() {
    if (!customStaffId || !customCertName.trim()) { setCustomError('Staff member and cert name are required'); return; }
    setCustomSaving(true);
    setCustomError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
      const res = await fetch('/api/management/compliance/certifications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          venueStaffId: customStaffId,
          certName: customCertName.trim(),
          certNumber: customCertNumber.trim() || null,
          expiryDate: customExpiryDate || null,
          notes: customNotes.trim() || null,
        }),
      });
      const data = await res.json() as { cert?: CustomCert; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      if (data.cert) setCustomCerts(prev => [data.cert!, ...prev]);
      setShowCustomModal(false);
      setCustomStaffId(''); setCustomCertName(''); setCustomCertNumber(''); setCustomExpiryDate(''); setCustomNotes('');
    } catch (e) {
      setCustomError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setCustomSaving(false);
    }
  }

  async function handleDeleteCustomCert(certId: string) {
    setCustomDeletingId(certId);
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
      await fetch(`/api/management/compliance/certifications?id=${encodeURIComponent(certId)}`, { method: 'DELETE', headers });
      setCustomCerts(prev => prev.filter(c => c.id !== certId));
    } catch { /* silent */ } finally {
      setCustomDeletingId(null);
    }
  }

  // RSA/FSS cert entry modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStaffId, setModalStaffId] = useState('');
  const [modalJurisdiction, setModalJurisdiction] = useState<AustralianState | ''>('');
  const [modalRsaExpiry, setModalRsaExpiry] = useState('');
  const [modalFssExpiry, setModalFssExpiry] = useState('');
  const [modalFssOnSite, setModalFssOnSite] = useState(false);
  const [modalIsJunior, setModalIsJunior] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  function openModal(staff?: StaffMember) {
    setModalStaffId(staff?.id ?? '');
    setModalJurisdiction((staff?.compliance?.rsaJurisdiction ?? '') as AustralianState | '');
    setModalRsaExpiry(staff?.compliance?.rsaExpiryDate?.split('T')[0] ?? '');
    setModalFssExpiry(staff?.compliance?.fssExpiryDate?.split('T')[0] ?? '');
    setModalFssOnSite(staff?.compliance?.fssOnSiteCopy ?? false);
    setModalIsJunior(staff?.isJunior ?? false);
    setModalError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!modalStaffId) { setModalError('Select a staff member'); return; }
    setModalSaving(true);
    setModalError('');
    try {
      const res = await fetch('/api/management/staff', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          staffId: modalStaffId,
          ...(modalJurisdiction ? { rsaJurisdiction: modalJurisdiction } : {}),
          rsaExpiryDate: modalRsaExpiry || null,
          fssExpiryDate: modalFssExpiry || null,
          fssOnSiteCopy: modalFssOnSite,
          isJunior: modalIsJunior,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      onSnapshotUpdate?.(data);
      setShowModal(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setModalSaving(false);
    }
  }

  function handleExportCsv() {
    const headers = ['Staff Name', 'Role', 'RSA Jurisdiction', 'RSA Expiry', 'RSA Status', 'FSS Expiry', 'FSS Status'];
    const rows = venueStaff.map(s => [
      s.name,
      s.role,
      s.compliance?.rsaJurisdiction ?? '—',
      s.compliance?.rsaExpiryDate ? new Date(s.compliance.rsaExpiryDate).toLocaleDateString() : '—',
      rsaStatus(s.compliance).label,
      s.compliance?.fssExpiryDate ? new Date(s.compliance.fssExpiryDate).toLocaleDateString() : '—',
      fssStatus(s.compliance).label,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-register.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Summary tile counts
  const rsaOnFile = venueStaff.filter(s => s.compliance?.rsaExpiryDate).length;
  const rsaValid = venueStaff.filter(s => s.compliance?.rsaExpiryDate && rsaStatus(s.compliance).level < 3).length;
  const fssOnFile = venueStaff.filter(s => s.compliance?.fssExpiryDate).length;
  const expiringSoon = venueStaff.filter(s => {
    const level = rsaStatus(s.compliance).level;
    return level === 1 || level === 2;
  }).length;

  // Generate certification registry rows for all staff
  const certRows = venueStaff.flatMap((staff) => {
    const rows = [];
    // RSA row
    if (staff.compliance?.rsaExpiryDate) {
      const status = rsaStatus(staff.compliance);
      rows.push({
        staffId: staff.id,
        staffName: staff.name,
        certType: 'RSA',
        state: staff.compliance.rsaJurisdiction || '—',
        expiryDate: staff.compliance.rsaExpiryDate,
        status,
        record: staff.compliance,
      });
    }
    // FSS row
    if (staff.compliance?.fssExpiryDate) {
      const status = fssStatus(staff.compliance);
      rows.push({
        staffId: staff.id,
        staffName: staff.name,
        certType: 'FSS',
        state: staff.compliance.rsaJurisdiction || '—',
        expiryDate: staff.compliance.fssExpiryDate,
        status,
        record: staff.compliance,
      });
    }
    return rows;
  });

  // Get unique FSS states for checklist
  const fssStates = new Set(
    venueStaff
      .filter((s) => s.compliance?.rsaJurisdiction)
      .map((s) => s.compliance!.rsaJurisdiction)
  );

  // State guidance data
  const stateGuidance: Record<
    AustralianState,
    {
      rsaExpiry: string;
      refresher: string;
      fssExpiry: string;
      grace: string;
      notes: string;
    }
  > = {
    NSW: {
      rsaExpiry: '5 years',
      refresher: 'SITHFAB021 course',
      fssExpiry: '5 years',
      grace: '30 days',
      notes: 'Expired >28 days requires full course re-enrolment',
    },
    VIC: {
      rsaExpiry: 'No formal expiry',
      refresher: '3-year refresher + sexual harassment module (recommended)',
      fssExpiry: 'No formal expiry',
      grace: 'N/A',
      notes: 'Annual refresh recommended; sexual harassment module now mandatory',
    },
    QLD: {
      rsaExpiry: 'No formal expiry',
      refresher: '3–5 year refresher (recommended)',
      fssExpiry: 'No formal expiry',
      grace: 'N/A',
      notes: 'RSA registration must be maintained even after no expiry',
    },
    WA: {
      rsaExpiry: 'No formal expiry',
      refresher: '3–5 year refresher (recommended)',
      fssExpiry: 'No formal expiry',
      grace: 'N/A',
      notes: 'RSA registration remains active indefinitely',
    },
    SA: {
      rsaExpiry: 'No formal expiry',
      refresher: '3–5 year refresher (recommended)',
      fssExpiry: 'No formal expiry',
      grace: 'N/A',
      notes: 'RSA is retained for life once issued',
    },
    TAS: {
      rsaExpiry: 'No formal expiry',
      refresher: '3–5 year refresher (recommended)',
      fssExpiry: 'No formal expiry',
      grace: 'N/A',
      notes: 'RSA does not expire',
    },
    NT: {
      rsaExpiry: 'No formal expiry',
      refresher: '3–5 year refresher (recommended)',
      fssExpiry: 'No formal expiry',
      grace: 'N/A',
      notes: 'RSA is not required for hospitality service in NT',
    },
    ACT: {
      rsaExpiry: 'No formal expiry',
      refresher: '3–5 year refresher (recommended)',
      fssExpiry: 'No formal expiry',
      grace: 'N/A',
      notes: 'RSA registration remains active indefinitely',
    },
  };

  const expiredCount = venueStaff.filter(s => s.compliance?.rsaExpiryDate && rsaStatus(s.compliance).level === 3).length;

  function openCustomModal() {
    setShowCustomModal(true);
    setCustomStaffId('');
    setCustomCertName('');
    setCustomCertNumber('');
    setCustomExpiryDate('');
    setCustomNotes('');
    setCustomError('');
  }

  return (
    <div className="mc-page">
      <PageHead
        title="Compliance"
        description="RSA, food safety supervisor and other certificates for this venue."
        actions={
          <>
            {certRows.length > 0 && <ExportButton label="Export CSV" onClick={handleExportCsv} />}
            {venueStaff.length > 0 && (
              <button type="button" className="mc-btn mc-btn-primary" onClick={() => openModal()}>Add certificate</button>
            )}
          </>
        }
      />

      <StatRow
        items={[
          { label: 'RSA on file', value: `${rsaOnFile} of ${venueStaff.length}`, sub: `${rsaValid} currently valid` },
          { label: 'RSA expired', value: String(expiredCount), sub: expiredCount > 0 ? 'Cannot serve until renewed' : 'None expired', alert: expiredCount > 0 },
          { label: 'Expiring within 30 days', value: String(expiringSoon), sub: expiringSoon > 0 ? 'Book renewals now' : 'Nothing due' },
          { label: 'Food safety supervisors', value: `${fssOnFile} of ${venueStaff.length}`, sub: 'With an FSS certificate on file' },
        ]}
      />

      {/* Certificate register */}
      <Panel
        title="RSA and food safety certificates"
        aside={<span className="mc-panel-count">{certRows.length} {certRows.length === 1 ? 'certificate' : 'certificates'}</span>}
        flush
      >
        {certRows.length === 0 ? (
          <div className="mc-panel-body">
            <EmptyState
              copy="No certificates recorded yet. Add a staff member's RSA or FSS record to start tracking."
              ctaLabel={venueStaff.length > 0 ? "+ Add certificate" : undefined}
              onCtaClick={venueStaff.length > 0 ? () => openModal() : undefined}
            />
          </div>
        ) : (
          <div className="mc-table-wrap">
            <table className="mc-table">
              <thead>
                <tr>
                  <th>Staff member</th>
                  <th>Certificate</th>
                  <th>State</th>
                  <th>Expires</th>
                  <th className="is-num">Days left</th>
                  <th>Status</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {certRows.map((row, idx) => {
                  const days = daysUntilExpiry(row.expiryDate);
                  const tone = row.status.level === 0 ? 'ok' : row.status.level <= 2 ? 'warn' : 'alert';
                  const expiryDate = normalizeExpiryDate(row.expiryDate);
                  return (
                    <tr key={idx}>
                      <td className="is-main">{row.staffName}</td>
                      <td>{row.certType}</td>
                      <td className="is-soft">{row.state}</td>
                      <td className="is-soft">{expiryDate?.toLocaleDateString('en-AU')}</td>
                      <td className="is-num" style={days < 0 ? { color: 'var(--status-error-text)', fontWeight: 600 } : undefined}>
                        {days < 0 ? `${Math.abs(days)} overdue` : days}
                      </td>
                      <td>
                        <StatusText tone={tone}>{row.status.level === 0 ? 'Current' : /^\d+d$/.test(row.status.label) ? 'Due soon' : row.status.label}</StatusText>
                        {row.certType === 'RSA' && 'nsw28Day' in row.status && row.status.nsw28Day && (
                          <div className="mc-row-meta">NSW: the full SITHFAB021 course is required</div>
                        )}
                        {row.certType === 'FSS' && 'gracePeriodDaysRemaining' in row.status && row.status.gracePeriodDaysRemaining !== undefined && (
                          <div className="mc-row-meta">
                            {row.status.level === 3 ? 'Appoint a supervisor now' : `${row.status.gracePeriodDaysRemaining} days to appoint a supervisor`}
                          </div>
                        )}
                      </td>
                      <td className="is-num">
                        <button
                          type="button"
                          className="mc-btn mc-btn-quiet mc-btn-sm"
                          onClick={() => openModal(venueStaff.find(s => s.id === row.staffId))}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* FSS on-site copy. A standing reminder, not a breach, so it is never red. */}
      {fssStates.size > 0 && (
        <Panel title="Certificate copy on site" description="A printed copy of the current food safety supervisor certificate must be kept at the venue." flush>
          <ul className="mc-rows">
            {Array.from(fssStates).map((state) => {
              const hasCopy = venueStaff.some((s) => s.compliance?.rsaJurisdiction === state && s.compliance?.fssOnSiteCopy);
              return (
                <li key={state} className="mc-row">
                  <span className="mc-row-main mc-row-title">{state}</span>
                  {hasCopy ? <StatusText tone="ok">Copy on site</StatusText> : <StatusText tone="warn">No copy recorded</StatusText>}
                </li>
              );
            })}
          </ul>
          <p className="mc-panel-note">To record a copy, edit the supervisor&apos;s certificate above and tick &quot;FSS physical copy on-site&quot;.</p>
        </Panel>
      )}

      {/* A19 — Custom certifications */}
      <Panel
        title="Other certificates"
        description="First aid, barista, liquor licence or anything else you track."
        aside={<button type="button" className="mc-btn mc-btn-sm" onClick={openCustomModal}>Add certificate</button>}
        flush
      >
        {!customCertsLoaded ? (
          <div className="mc-panel-body"><MissionControlTableRowSkeleton rows={3} columns={5} /></div>
        ) : customCerts.length === 0 ? (
          <p className="mc-panel-note" style={{ borderTop: 'none' }}>None recorded yet.</p>
        ) : (
          <div className="mc-table-wrap">
            <table className="mc-table">
              <thead>
                <tr>
                  <th>Staff member</th>
                  <th>Certificate</th>
                  <th>Number</th>
                  <th>Expires</th>
                  <th>Notes</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {customCerts.map((cert) => {
                  const staff = venueStaff.find(s => s.id === cert.venue_staff_id);
                  const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
                  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - now) / 86400000) : null;
                  const isExpired = daysLeft !== null && daysLeft < 0;
                  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
                  return (
                    <tr key={cert.id}>
                      <td className="is-main">{staff?.name ?? '–'}</td>
                      <td>{cert.cert_name}</td>
                      <td className="is-soft">{cert.cert_number ?? '–'}</td>
                      <td>
                        {!expiryDate ? <span className="is-soft">–</span> : isExpired ? (
                          <StatusText tone="alert">Expired {expiryDate.toLocaleDateString('en-AU')}</StatusText>
                        ) : isExpiring ? (
                          <StatusText tone="warn">{expiryDate.toLocaleDateString('en-AU')} ({daysLeft} days)</StatusText>
                        ) : (
                          <span className="is-soft">{expiryDate.toLocaleDateString('en-AU')}</span>
                        )}
                      </td>
                      <td className="is-soft" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cert.notes ?? undefined}>{cert.notes ?? '–'}</td>
                      <td className="is-num">
                        <button
                          type="button"
                          className="mc-icon-btn"
                          onClick={() => handleDeleteCustomCert(cert.id)}
                          disabled={customDeletingId === cert.id}
                          aria-label={`Delete ${cert.cert_name}`}
                          title="Delete"
                        >
                          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Custom cert entry modal */}
      {showCustomModal && (
        <div
          className="mc-dialog-backdrop"
          onClick={e => { if (e.target === e.currentTarget) setShowCustomModal(false); }}
        >
          <div className="mc-dialog" role="dialog" aria-modal="true">
            <h3 className="mc-dialog-title">Add a certificate</h3>
            <div className="mc-dialog-fields">
              <label className="mc-field">
                Staff member
                <select value={customStaffId} onChange={e => setCustomStaffId(e.target.value)} className="mc-input">
                  <option value="">Select a staff member</option>
                  {venueStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </select>
              </label>
              <label className="mc-field">
                Certificate name
                <input type="text" value={customCertName} onChange={e => setCustomCertName(e.target.value)} placeholder="e.g. First Aid, Barista Certificate, Liquor Licence" className="mc-input" />
              </label>
              <label className="mc-field">
                Certificate number <span style={{ fontWeight: 400, color: 'var(--mc-text-muted)' }}>(optional)</span>
                <input type="text" value={customCertNumber} onChange={e => setCustomCertNumber(e.target.value)} placeholder="e.g. RSA-NSW-1234567" className="mc-input" />
              </label>
              <label className="mc-field">
                Expiry date <span style={{ fontWeight: 400, color: 'var(--mc-text-muted)' }}>(optional)</span>
                <input type="date" value={customExpiryDate} onChange={e => setCustomExpiryDate(e.target.value)} className="mc-input" />
              </label>
              <label className="mc-field">
                Notes <span style={{ fontWeight: 400, color: 'var(--mc-text-muted)' }}>(optional)</span>
                <textarea rows={2} value={customNotes} onChange={e => setCustomNotes(e.target.value)} placeholder="e.g. Renewed via online course, expires same time as RSA" className="mc-input" />
              </label>
            </div>
            {customError && <div className="mc-error" role="alert" style={{ marginTop: 16 }}>{customError}</div>}
            <div className="mc-dialog-actions">
              <button type="button" className="mc-btn mc-btn-quiet" onClick={() => setShowCustomModal(false)}>Cancel</button>
              <button type="button" className="mc-btn mc-btn-primary" onClick={handleSaveCustomCert} disabled={customSaving}>{customSaving ? 'Saving…' : 'Save certificate'}</button>
            </div>
          </div>
        </div>
      )}

      {/* RSA/FSS cert entry modal */}
      {showModal && (
        <div
          className="mc-dialog-backdrop"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="mc-dialog" role="dialog" aria-modal="true">
            <h3 className="mc-dialog-title">
              {modalStaffId ? 'Edit certificate' : 'Add certificate'}
            </h3>

            <div className="mc-dialog-fields">
              <label className="mc-field">
                Staff member
                <select
                  value={modalStaffId}
                  onChange={e => setModalStaffId(e.target.value)}
                  className="mc-input"
                >
                  <option value="">Select a staff member</option>
                  {venueStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </label>

              <label className="mc-field">
                RSA state
                <select
                  value={modalJurisdiction}
                  onChange={e => setModalJurisdiction(e.target.value as AustralianState | '')}
                  className="mc-input"
                >
                  <option value="">Select a state</option>
                  {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label className="mc-field">
                RSA Expiry date
                <input
                  type="date"
                  value={modalRsaExpiry}
                  onChange={e => setModalRsaExpiry(e.target.value)}
                  className="mc-input"
                />
              </label>

              <label className="mc-field">
                FSS Expiry date <span style={{ fontWeight: 400, color: 'var(--mc-text-muted)' }}>(if applicable)</span>
                <input
                  type="date"
                  value={modalFssExpiry}
                  onChange={e => setModalFssExpiry(e.target.value)}
                  className="mc-input"
                />
              </label>

              <div style={{ display: 'flex', gap: '8px 24px', flexWrap: 'wrap' }}>
                <label className="mc-check">
                  <input type="checkbox" checked={modalFssOnSite} onChange={e => setModalFssOnSite(e.target.checked)} />
                  FSS physical copy on-site
                </label>
                <label className="mc-check">
                  <input type="checkbox" checked={modalIsJunior} onChange={e => setModalIsJunior(e.target.checked)} />
                  Is junior / supervised
                </label>
              </div>
            </div>

            {modalError && (
              <div className="mc-error" role="alert" style={{ marginTop: 16 }}>
                {modalError}
              </div>
            )}

            <div className="mc-dialog-actions">
              <button type="button" className="mc-btn mc-btn-quiet" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="mc-btn mc-btn-primary" onClick={handleSave} disabled={modalSaving}>
                {modalSaving ? 'Saving…' : 'Save certificate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State rules reference */}
      {fssStates.size > 0 && (
        <Panel title="Rules by state" description="For the states your staff hold certificates in." flush>
          <div className="mc-table-wrap">
            <table className="mc-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>RSA expiry</th>
                  <th>Refresher</th>
                  <th>FSS expiry</th>
                  <th>Grace period</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(fssStates).sort().map((state) => (
                  <tr key={state}>
                    <td className="is-main">{state}</td>
                    <td>{stateGuidance[state].rsaExpiry}</td>
                    <td className="is-soft">{stateGuidance[state].refresher}</td>
                    <td>{stateGuidance[state].fssExpiry}</td>
                    <td className="is-soft">{stateGuidance[state].grace}</td>
                    <td className="is-soft" style={{ minWidth: 220 }}>{stateGuidance[state].notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
