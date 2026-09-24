import Link from 'next/link';
import Image from 'next/image';
import HeroStickyBar from './HeroStickyBar';

/*
 * Homepage hero — Pages-Redesign.md §6.1.
 * Server component: static markup, no client state.
 * Copy is LOCKED by SBE-Marketing-Audit-July2026.md — do not reword the
 * headline, subhead, or CTA without a new audit pass.
 */

const TRUST_ITEMS = [
  '3× faster onboarding',
  '100+ modules & scenarios',
  '19 languages',
];

export default function HeroSection() {
  return (
    <section className="sbe-mkt-hero">
      <div className="container sbe-mkt-hero-grid">

        {/* ── Heading: eyebrow + h1 (mobile: first) ── */}
        <div className="sbe-mkt-hero-heading">
          <p className="sbe-mkt-hero-eyebrow">Built for Australian pubs, bars &amp; venues</p>

          <h1 className="sbe-mkt-hero-h1">Turn 6 Months of Onboarding Into 6 Weeks.</h1>
        </div>

        {/* ── Product screenshot (mobile: after the CTAs) ── */}
        <div className="sbe-mkt-hero-teaser">
          <Image
            src="/shots/HERO SHOT1.png"
            alt="Serve By Example on desktop and mobile — manager console, pre-shift home screen, and cocktail drink library"
            width={2123}
            height={1258}
            priority
            sizes="(max-width: 900px) 90vw, 58vw"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* ── Details: subhead, CTA, trust list (mobile: copy first, trust row last) ── */}
        <div className="sbe-mkt-hero-details">
          <p className="sbe-mkt-hero-sub">
            Deliver the exact standard your best manager enforces, without pulling them off the floor.
          </p>

          <div className="sbe-mkt-hero-actions">
            <div className="sbe-mkt-hero-btn-row">
              <Link
                href="/login?intent=trial&tier=boutique"
                className="sbe-mkt-hero-cta"
              >
                Start Free Trial
              </Link>
              <Link href="/how-it-works" className="sbe-mkt-hero-secondary">
                How it works
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
            <p className="sbe-mkt-hero-microcopy">
              14-day free trial. No credit card required. Set up in under 10 minutes.
            </p>
          </div>

          <ul className="sbe-mkt-hero-trust" aria-label="Platform facts">
            {TRUST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <HeroStickyBar />
    </section>
  );
}
