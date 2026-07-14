'use client';

import React from 'react';

interface SopPreviewDocumentProps {
  venueType: string;
  painPoint: string;
  isUnlocked: boolean;
}

const SOP_CONTENT_DATABASE: Record<string, { title: string; risk: string; visible: string[]; realHidden: string[] }> = {
  'rsa': {
    title: 'Staff Onboarding SOP — Responsible Service Protocol',
    risk: 'REGULATORY RISK NOTICE: Non-compliance with state-specific shift registry laws results in baseline venue site infringement notices.',
    visible: [
      'Verify valid state-issued competency cards prior to shift commencement.',
      'Walk through physical location of floor incident register and entry timeline rules.',
      'Confirm supervisor verification structure for patron service refusal paths.'
    ],
    realHidden: [
      'Document unique identifier values chronologically inside compliance log framework.',
      'Execute secondary supervisor authorization checklist upon refusal escalation.',
      'Enforce chronological incident data logging within legal operating hours.'
    ]
  },
  'allergen': {
    title: 'Staff Onboarding SOP — Allergen Communication Protocol',
    risk: 'OPERATIONAL RISK NOTICE: Cross-contamination reporting failure creates immediate public liability and duty of care exposures.',
    visible: [
      'Isolate docket processing parameters for verified allergen-sensitive patron seating profiles.',
      'Execute direct verification check between service staff and head kitchen operator.',
      'Cross-reference line prep inventory charts for non-disclosed ingredient updates.'
    ],
    realHidden: [
      'Run complete sanitation processes across primary staging lines prior to meal drops.',
      'Execute manual double-signature checks on out-of-sequence food modifications.',
      'Verify table designation data tracking across floor and POS architecture logs.'
    ]
  },
  'opening-closing': {
    title: 'Staff Onboarding SOP — Opening & Closing Compliance Log',
    risk: 'SECURITY RISK NOTICE: Failure to execute structural lockouts triggers insurance validation and local zoning non-compliance hazards.',
    visible: [
      'Confirm physical perimeter structural locks align with local operational regulations.',
      'Audit internal camera arrays and terminal shutdowns according to closure guidelines.',
      'Re-verify primary environmental control systems are completely deactivated post-service.'
    ],
    realHidden: [
      'Execute deep storage clearing checks for non-authorized personnel elements.',
      'Log mechanical access key registers chronologically at shift crossover.',
      'Synchronize hardware safe locks and register counts under supervisor verification.'
    ]
  },
  'paperwork': {
    title: 'Staff Onboarding SOP — Pre-Start Compliance Framework',
    risk: 'COMPLIANCE RISK NOTICE: Unlogged shift histories expose the corporate footprint to systemic fair work audit reviews.',
    visible: [
      'Verify verified identity components and core structural details before scheduling.',
      'Process emergency coordination paths and critical location access records.',
      'Execute baseline onboarding signatures across internal policy declarations.'
    ],
    realHidden: [
      'Populate localized tracking infrastructure records to match regulatory parameters.',
      'Execute historical profile validation assessments on variable talent assets.',
      'Lock profile compliance statuses inside operations archives prior to active duty.'
    ]
  }
};

// Mask generator creating variable-length DOM obfuscation block elements
const DUMMY_ROWS = [
  '█████████ ████ ███████ ██ ████ ████████████████████',
  '███████ ████████ ██████ █████ ████████',
  '███████████ ████ ██████████ ██████ ████████████'
];

export default function SopPreviewDocument({ venueType: _venueType, painPoint, isUnlocked }: SopPreviewDocumentProps) {
  const contentKey = ['rsa', 'allergen', 'opening-closing', 'paperwork'].includes(painPoint) ? painPoint : 'rsa';
  const data = SOP_CONTENT_DATABASE[contentKey];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ borderBottom: '2px solid var(--line)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', textTransform: 'capitalize', color: 'var(--text-main)' }}>
          {data.title}
        </h2>
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          borderLeft: '4px solid var(--gold)', 
          background: 'rgba(169, 129, 42, 0.03)',
          fontSize: '0.85rem',
          color: 'var(--text-main)',
          lineHeight: '1.4'
        }}>
          {data.risk}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', width: '60px' }}>Item</th>
            <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Required Verification Step</th>
          </tr>
        </thead>
        <tbody>
          {/* Always Visible Unblurred Teaser Rows */}
          {data.visible.map((row, index) => (
            <tr key={`visible-${index}`} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '1rem 0', fontWeight: 'bold', color: 'var(--green)' }}>0{index + 1}</td>
              <td style={{ padding: '1rem 0', color: 'var(--text-main)' }}>{row}</td>
            </tr>
          ))}

          {/* Secure Blurred Container Section */}
          {(isUnlocked ? data.realHidden : DUMMY_ROWS).map((row, index) => (
            <tr 
              key={`hidden-${index}`} 
              style={{ 
                borderBottom: '1px solid var(--line)',
                filter: isUnlocked ? 'none' : 'blur(4px)',
                transition: 'filter 0.5s ease',
                userSelect: isUnlocked ? 'auto' : 'none',
                pointerEvents: isUnlocked ? 'auto' : 'none'
              }}
            >
              <td style={{ padding: '1rem 0', fontWeight: 'bold', color: isUnlocked ? 'var(--green)' : 'var(--line)' }}>
                0{index + 4}
              </td>
              <td style={{ padding: '1rem 0', color: isUnlocked ? 'var(--text-main)' : 'var(--line)', letterSpacing: isUnlocked ? 'normal' : '2px' }}>
                {row}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}