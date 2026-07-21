'use client';

import React, { useState, useEffect } from 'react';
import { StaffMember, AustralianState, ManagementSnapshot } from '@/lib/management/types';
import { rsaStatus, fssStatus, daysUntilExpiry, normalizeExpiryDate } from './helpers';

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
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStaffId, setCustomStaffId] = useState('');
  const [customCertName, setCustomCertName] = useState('');
  const [customCertNumber, setCustomCertNumber] = useState('');
  const [customExpiryDate, setCustomExpiryDate] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customSaving, setCustomSaving] = useState(false);
  const [customError, setCustomError] = useState('');
  const [customDeletingId, setCustomDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
    fetch('/api/management/compliance/certifications', { headers })
      .then(r => r.json())
      .then((data: { certs?: CustomCert[] }) => {
        if (Array.isArray(data.certs)) setCustomCerts(data.certs);
      })
      .catch(() => { /* non-blocking */ });
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

  return (
    <section className="ops-grid ops-grid-main">
      {/* Summary tiles */}
      <article className="ops-card" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--line-light)' }}>
          {[
            { label: 'RSA on File', value: `${rsaOnFile} / ${venueStaff.length}`, sub: `${rsaValid} currently valid`, urgent: false },
            { label: 'FSS on File', value: `${fssOnFile} / ${venueStaff.length}`, sub: 'Food safety supervisors', urgent: false },
            { label: 'Expiring ≤ 30d', value: String(expiringSoon), sub: expiringSoon > 0 ? 'Action required' : 'All clear', urgent: expiringSoon > 0 },
          ].map(tile => (
            <div
              key={tile.label}
              style={{
                padding: '20px 24px',
                background: tile.urgent ? 'var(--status-warn-bg, var(--status-amber-bg))' : 'var(--surface)',
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: tile.urgent ? 'var(--status-warn-text, var(--status-amber-text))' : 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>
                {tile.value}
              </div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: '2px' }}>
                {tile.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: tile.urgent ? 'var(--status-warn-text, var(--status-amber-text))' : 'var(--text-soft)', marginTop: '4px' }}>
                {tile.sub}
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Certification Registry */}
      <article className="ops-card" style={{ gridColumn: '1 / -1' }}>
        <div className="ops-card-head">
          <h3>Certification Registry</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{certRows.length} certificates</span>
            <button
              className="btn btn-sm"
              style={{ fontSize: '0.75rem' }}
              onClick={handleExportCsv}
            >
              Export CSV
            </button>
            <button
              className="btn btn-sm"
              style={{ fontSize: '0.75rem', background: 'var(--green)', color: 'var(--surface-raised)', border: 'none' }}
              onClick={() => openModal()}
            >
              + Add cert
            </button>
          </div>
        </div>
        {certRows.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No certifications recorded yet. Staff compliance data will appear here.
          </div>
        ) : (
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Cert Type</th>
                <th style={{ textAlign: 'center' }}>State</th>
                <th>Expiry Date</th>
                <th style={{ textAlign: 'center' }}>Days</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certRows.map((row, idx) => {
                const days = daysUntilExpiry(row.expiryDate);
                const statusColor =
                  row.status.level === 0
                    ? 'var(--text-muted)'
                    : row.status.level <= 2
                      ? 'var(--status-orange)'
                      : 'var(--status-critical-text)';
                const badgeCls =
                  row.status.level === 0
                    ? 'mgmt-badge mgmt-badge-ready'
                    : row.status.level <= 2
                      ? 'mgmt-badge mgmt-badge-caution'
                      : 'mgmt-badge mgmt-badge-risk';
                const expiryDate = normalizeExpiryDate(row.expiryDate);
                return (
                  <React.Fragment key={idx}>
                    <tr style={{ borderBottom: '1px solid var(--line-light)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row.staffName}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>
                        {row.certType}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--text-soft)' }}>
                        {row.state}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-soft)', fontSize: '0.8rem' }}>
                        {expiryDate?.toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: statusColor, fontWeight: days <= 7 ? 700 : 500 }}>
                        {days}d
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        <span className={badgeCls}>{row.status.label}</span>
                        {row.certType === 'RSA' && 'nsw28Day' in row.status && row.status.nsw28Day && (
                          <div style={{ color: 'var(--status-critical-text)', fontSize: '0.7rem', fontStyle: 'italic', marginTop: 4 }}>
                            NSW: Full SITHFAB021 required
                          </div>
                        )}
                        {row.certType === 'FSS' && 'gracePeriodDaysRemaining' in row.status && row.status.gracePeriodDaysRemaining !== undefined && (
                          <div style={{ color: row.status.level >= 2 ? 'var(--status-critical-text)' : 'var(--status-orange)', fontSize: '0.7rem', fontStyle: 'italic', marginTop: 4 }}>
                            {row.status.level === 3 ? 'Appoint FSS immediately' : `${row.status.gracePeriodDaysRemaining}d to appoint FSS`}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        <button
                          className="btn btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => {
                            const staff = venueStaff.find(s => s.id === row.staffId);
                            openModal(staff);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </article>

      {/* FSS Physical Copy Checklist */}
      <article className="ops-card" style={{ gridColumn: '1 / -1' }}>
        <div className="ops-card-head">
          <h3>FSS Onsite Copy Verification</h3>
          <span>{fssStates.size} states</span>
        </div>
        {fssStates.size === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No FSS data recorded yet.
          </div>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            {Array.from(fssStates).map((state) => {
              const hasCopy = venueStaff.some(
                (s) => s.compliance?.rsaJurisdiction === state && s.compliance?.fssOnSiteCopy
              );
              return (
                <div
                  key={state}
                  style={{
                    marginBottom: '16px',
                    padding: '12px 14px',
                    border: '1px solid var(--line-light)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <input type="checkbox" checked={hasCopy} readOnly style={{ cursor: 'pointer' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{state} — Physical FSS copy on-site</span>
                  </div>
                  {!hasCopy && (
                    <div
                      style={{
                        background: 'var(--status-critical-bg)',
                        border: '1px solid var(--status-critical-border)',
                        borderLeft: '4px solid var(--status-critical-text)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--status-critical-text)',
                        marginTop: '8px',
                      }}
                    >
                      Legal requirement: A physical copy of the active FSS certificate must be kept on-premises at all
                      times (NSW Food Authority).
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </article>

      {/* A19 — Custom Certifications */}
      <article className="ops-card" style={{ gridColumn: '1 / -1' }}>
        <div className="ops-card-head">
          <h3>Other Certifications</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{customCerts.length} recorded</span>
            <button
              className="btn btn-sm"
              style={{ fontSize: '0.75rem', background: 'var(--green)', color: 'var(--surface-raised)', border: 'none' }}
              onClick={() => { setShowCustomModal(true); setCustomStaffId(''); setCustomCertName(''); setCustomCertNumber(''); setCustomExpiryDate(''); setCustomNotes(''); setCustomError(''); }}
            >
              + Add cert
            </button>
          </div>
        </div>
        {customCerts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No custom certifications recorded yet. Add First Aid, Barista, Liquor Licence, or any other cert here.
          </div>
        ) : (
          <table className="mgmt-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Certification</th>
                <th>Cert number</th>
                <th>Expiry</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customCerts.map((cert) => {
                const staff = venueStaff.find(s => s.id === cert.venue_staff_id);
                const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
                const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / 86400000) : null;
                const isExpiring = daysLeft !== null && daysLeft <= 30;
                return (
                  <tr key={cert.id} style={{ borderBottom: '1px solid var(--line-light)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{staff?.name ?? '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text)' }}>{cert.cert_name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-soft)', fontSize: '0.8rem' }}>{cert.cert_number ?? '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: isExpiring ? 'var(--status-critical-text)' : 'var(--text-soft)' }}>
                      {expiryDate ? expiryDate.toLocaleDateString() : '—'}
                      {isExpiring && daysLeft !== null && <span style={{ marginLeft: 6, fontSize: '0.72rem', fontWeight: 700 }}>({daysLeft}d)</span>}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.notes ?? '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        className="ops-table-delete-btn"
                        onClick={() => handleDeleteCustomCert(cert.id)}
                        disabled={customDeletingId === cert.id}
                        aria-label={`Delete ${cert.cert_name}`}
                        style={{ opacity: customDeletingId === cert.id ? 0.5 : 1 }}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </article>

      {/* Custom cert entry modal */}
      {showCustomModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowCustomModal(false); }}
        >
          <div style={{ background: 'var(--surface-raised, var(--surface-raised))', borderRadius: 'var(--radius-lg)', padding: '28px 32px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>Add Custom Certification</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                Staff Member
                <select value={customStaffId} onChange={e => setCustomStaffId(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }}>
                  <option value="">— Select staff member —</option>
                  {venueStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </select>
              </label>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                Certification Name
                <input type="text" value={customCertName} onChange={e => setCustomCertName(e.target.value)} placeholder="e.g. First Aid, Barista Certificate, Liquor Licence" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }} />
              </label>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                Certificate Number <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
                <input type="text" value={customCertNumber} onChange={e => setCustomCertNumber(e.target.value)} placeholder="e.g. RSA-NSW-1234567" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }} />
              </label>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                Expiry Date <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
                <input type="date" value={customExpiryDate} onChange={e => setCustomExpiryDate(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }} />
              </label>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                Notes <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
                <textarea rows={2} value={customNotes} onChange={e => setCustomNotes(e.target.value)} placeholder="e.g. Renewed via online course, expires same time as RSA" style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
            </div>
            {customError && <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--status-error-bg, var(--status-critical-bg))', color: 'var(--status-error-text, var(--status-critical-text))', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>{customError}</div>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-sm" onClick={() => setShowCustomModal(false)} style={{ fontSize: '0.85rem' }}>Cancel</button>
              <button className="btn btn-sm" onClick={handleSaveCustomCert} disabled={customSaving} style={{ fontSize: '0.85rem', background: 'var(--green)', color: 'var(--surface-raised)', border: 'none', opacity: customSaving ? 0.6 : 1 }}>{customSaving ? 'Saving…' : 'Save cert'}</button>
            </div>
          </div>
        </div>
      )}

      {/* RSA/FSS cert entry modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: 'var(--surface-raised, var(--surface-raised))',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 32px',
            width: '100%', maxWidth: '480px',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <h3 style={{ margin: '0 0 20px', color: 'var(--text)', fontFamily: 'var(--font-fraunces)' }}>
              {modalStaffId ? 'Edit Certification' : 'Add Certification'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                Staff Member
                <select
                  value={modalStaffId}
                  onChange={e => setModalStaffId(e.target.value)}
                  style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }}
                >
                  <option value="">— Select staff member —</option>
                  {venueStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                RSA Jurisdiction
                <select
                  value={modalJurisdiction}
                  onChange={e => setModalJurisdiction(e.target.value as AustralianState | '')}
                  style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }}
                >
                  <option value="">— Select state —</option>
                  {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                RSA Expiry Date
                <input
                  type="date"
                  value={modalRsaExpiry}
                  onChange={e => setModalRsaExpiry(e.target.value)}
                  style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }}
                />
              </label>

              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                FSS Expiry Date <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(if applicable)</span>
                <input
                  type="date"
                  value={modalFssExpiry}
                  onChange={e => setModalFssExpiry(e.target.value)}
                  style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.875rem' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-soft)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={modalFssOnSite} onChange={e => setModalFssOnSite(e.target.checked)} />
                  FSS physical copy on-site
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-soft)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={modalIsJunior} onChange={e => setModalIsJunior(e.target.checked)} />
                  Is junior / supervised
                </label>
              </div>
            </div>

            {modalError && (
              <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--status-error-bg, var(--status-critical-bg))', color: 'var(--status-error-text, var(--status-critical-text))', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                className="btn btn-sm"
                onClick={() => setShowModal(false)}
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm"
                onClick={handleSave}
                disabled={modalSaving}
                style={{ fontSize: '0.85rem', background: 'var(--green)', color: 'var(--surface-raised)', border: 'none', opacity: modalSaving ? 0.6 : 1 }}
              >
                {modalSaving ? 'Saving…' : 'Save cert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State-Specific Guidance */}
      <article className="ops-card" style={{ gridColumn: '1 / -1' }}>
        <div className="ops-card-head">
          <h3>State-Specific Guidance</h3>
          <span>All jurisdictions</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {Array.from(fssStates)
            .sort()
            .map((state) => (
              <details
                key={state}
                style={{
                  marginBottom: '12px',
                  padding: '10px 12px',
                  border: '1px solid var(--line-light)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                <summary style={{ fontWeight: 600, color: 'var(--text)', userSelect: 'none' }}>
                  {state}
                </summary>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line-light)', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>RSA Expiry:</strong> {stateGuidance[state].rsaExpiry}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Refresher Course:</strong> {stateGuidance[state].refresher}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>FSS Expiry:</strong> {stateGuidance[state].fssExpiry}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Grace Period:</strong> {stateGuidance[state].grace}
                  </div>
                  <div style={{ color: 'var(--text)', fontStyle: 'italic' }}>
                    <strong>Key Notes:</strong> {stateGuidance[state].notes}
                  </div>
                </div>
              </details>
            ))}
        </div>
      </article>
    </section>
  );
}
