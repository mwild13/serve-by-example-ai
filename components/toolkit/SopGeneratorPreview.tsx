'use client';

import React, { useState } from 'react';
import SopPreviewDocument from '@/app/toolkit/_components/SopPreviewDocument';

type Step = 'venue' | 'state' | 'pain' | 'preview';

interface VenueOption {
  id: string;
  label: string;
}

interface PainOption {
  id: string;
  label: string;
}

const VENUE_TYPES: VenueOption[] = [
  { id: 'late-night-bar', label: 'Late-Night Bar / Pub' },
  { id: 'cafe', label: 'Cafe or Brunch Venue' },
  { id: 'restaurant', label: 'Full-Service Restaurant' },
  { id: 'hotel-fb', label: 'Hotel F&B' },
  { id: 'club', label: 'Club or Nightclub' }
];

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

const PAIN_POINTS: Record<string, PainOption[]> = {
  'late-night-bar': [
    { id: 'rsa', label: 'Casual staff missing RSA obligations' },
    { id: 'allergen', label: 'Allergen communication failures during service' },
    { id: 'opening-closing', label: 'Opening/closing procedures not followed consistently' },
    { id: 'paperwork', label: 'Pre-start compliance paperwork incomplete' }
  ],
  'cafe': [
    { id: 'allergen', label: 'Allergen communication failures during service' },
    { id: 'opening-closing', label: 'Opening/closing procedures not followed consistently' },
    { id: 'paperwork', label: 'Pre-start compliance paperwork incomplete' },
    { id: 'rsa', label: 'Staff unaware of licensing limitations' }
  ],
  'restaurant': [
    { id: 'allergen', label: 'Allergen communication failures during service' },
    { id: 'rsa', label: 'RSA validation issues on busy nights' },
    { id: 'opening-closing', label: 'FOH/BOH handovers lacking documentation' },
    { id: 'paperwork', label: 'Employee file compliance gaps' }
  ],
  'hotel-fb': [
    { id: 'paperwork', label: 'Pre-start compliance paperwork incomplete' },
    { id: 'rsa', label: 'Cross-venue shift compliance issues' },
    { id: 'allergen', label: 'Kitchen-to-floor accountability gaps' },
    { id: 'opening-closing', label: 'Closing checklist failures' }
  ],
  'club': [
    { id: 'rsa', label: 'Casual staff missing RSA obligations' },
    { id: 'paperwork', label: 'Crowd controller registry gaps' },
    { id: 'opening-closing', label: 'Lockout/curfew procedure compliance' },
    { id: 'allergen', label: 'High-volume floor incident documentation' }
  ]
};

export default function SopGeneratorPreview() {
  const [step, setStep] = useState<Step>('venue');
  const [venueType, setVenueType] = useState<string | null>(null);
  const [auState, setAuState] = useState<string | null>(null);
  const [painPoint, setPainPoint] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleVenueSelect = (id: string) => {
    setVenueType(id);
    setStep('state');
  };

  const handleStateSelect = (state: string) => {
    setAuState(state);
    setStep('pain');
  };

  const handlePainSelect = (id: string) => {
    setPainPoint(id);
    setStep('preview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName) return;

    setEmailStatus('loading');

    // Automatically map industry nomenclature roles based on selection
    let role = 'venue_manager';
    if (venueType === 'cafe' || venueType === 'restaurant') role = 'owner_operator';
    if (venueType === 'hotel-fb') role = 'ops_manager';

    try {
      const response = await fetch('/api/toolkit-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          email,
          role,
          utm_campaign: `sop-preview-${auState?.toLowerCase()}-${painPoint}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsUnlocked(true);
        // Clean transition window delay for state tracking sync
        setTimeout(() => {
          window.location.href = data.redirect;
        }, 1200);
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  };

  return (
    <div className="sop-preview-container" style={{ margin: '2rem auto', maxWidth: '800px' }}>
      
      {/* Step Progress Indicators */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['venue', 'state', 'pain', 'preview'] as Step[]).map((s) => {
          const steps: Step[] = ['venue', 'state', 'pain', 'preview'];
          const currentIndex = steps.indexOf(step);
          const isCompleted = steps.indexOf(s) <= currentIndex;
          return (
            <div 
              key={s} 
              style={{ 
                flex: 1, 
                height: '4px', 
                backgroundColor: isCompleted ? 'var(--green)' : 'var(--line)',
                transition: 'background-color 0.3s ease'
              }} 
            />
          );
        })}
      </div>

      {/* Step 1: Venue Selector */}
      {step === 'venue' && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Select your venue operational footprint:
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Step 1 of 3</p>
          <div className="sop-pill-grid">
            {VENUE_TYPES.map((v) => (
              <button
                key={v.id}
                onClick={() => handleVenueSelect(v.id)}
                className="sop-pill"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Australian State Selector */}
      {step === 'state' && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Select your regulatory jurisdiction:
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Step 2 of 3</p>
          <div className="sop-pill-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {AU_STATES.map((state) => (
              <button
                key={state}
                onClick={() => handleStateSelect(state)}
                className="sop-pill"
                style={{ textAlign: 'center' }}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Pain Point Selector */}
      {step === 'pain' && venueType && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Identify your primary operational friction point:
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Step 3 of 3</p>
          <div className="sop-pill-grid">
            {PAIN_POINTS[venueType]?.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePainSelect(p.id)}
                className="sop-pill"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: SOP Preview Canvas + Email Gate */}
      {step === 'preview' && venueType && painPoint && (
        <div>
          <SopPreviewDocument 
            venueType={venueType} 
            painPoint={painPoint} 
            isUnlocked={isUnlocked} 
          />

          {!isUnlocked && (
            <div className="sop-blur-overlay">
              <div style={{ 
                background: 'var(--bg)', 
                border: '1px solid var(--line)', 
                padding: '2rem', 
                borderRadius: '8px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                maxWidth: '450px',
                width: '100%',
                textAlign: 'center'
              }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
                  Unlock Full SOP Component
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Enter your verification email to unblur and export the complete editable markdown template.
                </p>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      background: 'var(--surface)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '4px',
                      border: '1px solid var(--line)',
                      background: 'var(--surface)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={emailStatus === 'loading'}
                    style={{ padding: '0.75rem', width: '100%', cursor: 'pointer' }}
                  >
                    {emailStatus === 'loading' ? 'Verifying...' : 'Unlock Document'}
                  </button>
                  {emailStatus === 'error' && (
                    <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                      System configuration error. Please try an alternate email address.
                    </p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}