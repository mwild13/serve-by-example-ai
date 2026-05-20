'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import StickyDemoCTA from '@/components/StickyDemoCTA';

const HeroPlayableSandbox = dynamic(
  () => import('@/components/HeroPlayableSandbox'),
  {
    ssr: false,
    loading: () => <div className="phone-frame phone-frame-skeleton" aria-hidden="true" />,
  }
);

type Audience = 'venue' | 'staff';

const COPY: Record<Audience, { subhead: string; cta: string; href: string }> = {
  venue: {
    subhead: 'Scenario-based AI training that gets new staff floor-ready in six weeks, not six months.',
    cta: 'Try the Demo',
    href: '/demo',
  },
  staff: {
    subhead: 'Build the skills that make you the best person on the floor — trained by AI, proven by results.',
    cta: 'Start Training Free',
    href: '/demo',
  },
};

export default function HeroSection() {
  const [audience, setAudience] = useState<Audience>('venue');
  const heroRef = useRef<HTMLElement>(null);
  const copy = COPY[audience];

  return (
    <>
      <section className="hero" ref={heroRef}>
        <div className="container">

          {/* Audience toggle */}
          <div className="audience-toggle" role="group" aria-label="Select audience">
            <button
              className={`audience-pill${audience === 'venue' ? ' audience-pill-active' : ''}`}
              onClick={() => setAudience('venue')}
            >
              For Venue Owners
            </button>
            <button
              className={`audience-pill${audience === 'staff' ? ' audience-pill-active' : ''}`}
              onClick={() => setAudience('staff')}
            >
              For Hospitality Staff
            </button>
          </div>

          <div className="hero-split">
            <div className="hero-left">
              <span className="eyebrow">AI-Powered Hospitality Training</span>
              <h1>From 6 months of onboarding to 6 weeks with AI</h1>
              <p className="hero-sub">{copy.subhead}</p>
              <div className="hero-actions">
                <Link href={copy.href} className="btn btn-primary btn-lg">
                  {copy.cta}
                </Link>
              </div>
              <p className="hero-sub-link">
                <Link href="/how-it-works" className="hero-tertiary-link">
                  How it works
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              </p>
              <p className="hero-roi-anchor">
                <a href="#roi-calculator" className="hero-tertiary-link">
                  See what better training is worth
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                  </svg>
                </a>
              </p>
            </div>
            <div className="hero-right">
              <HeroPlayableSandbox />
            </div>
          </div>

        </div>
      </section>
      <StickyDemoCTA heroRef={heroRef} />
    </>
  );
}
