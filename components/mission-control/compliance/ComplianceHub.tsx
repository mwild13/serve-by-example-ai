'use client';

import React from 'react';
import { StaffMember, AustralianState } from '@/lib/management/types';
import { rsaStatus, fssStatus, daysUntilExpiry, normalizeExpiryDate } from './helpers';

interface ComplianceHubProps {
  venueStaff: StaffMember[];
}

export function ComplianceHub({ venueStaff }: ComplianceHubProps) {
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
      {/* Certification Registry */}
      <article className="ops-card" style={{ gridColumn: '1 / -1' }}>
        <div className="ops-card-head">
          <h3>Certification Registry</h3>
          <span>{certRows.length} certificates</span>
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
                      ? '#c2410c'
                      : '#b91c1c';
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
                          <div style={{ color: '#b91c1c', fontSize: '0.7rem', fontStyle: 'italic', marginTop: 4 }}>
                            NSW: Full SITHFAB021 required
                          </div>
                        )}
                        {row.certType === 'FSS' && 'gracePeriodDaysRemaining' in row.status && row.status.gracePeriodDaysRemaining !== undefined && (
                          <div style={{ color: row.status.level >= 2 ? '#b91c1c' : '#c2410c', fontSize: '0.7rem', fontStyle: 'italic', marginTop: 4 }}>
                            {row.status.level === 3 ? 'Appoint FSS immediately' : `${row.status.gracePeriodDaysRemaining}d to appoint FSS`}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        <button className="btn btn-sm" style={{ fontSize: '0.75rem' }}>
                          Verify
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
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        borderLeft: '4px solid #b91c1c',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: '#b91c1c',
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
