import Link from 'next/link';
import Image from 'next/image';

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

        {/* ── Left column: copy ── */}
        <div className="sbe-mkt-hero-copy">
          <p className="sbe-mkt-hero-eyebrow">Built for Australian pubs, bars &amp; venues</p>

          <h1 className="sbe-mkt-hero-h1">Turn 6 Months of Onboarding Into 6 Weeks.</h1>

          <p className="sbe-mkt-hero-sub">
            Deliver the exact standard your best manager enforces, without pulling them off the floor.
          </p>

          <div className="sbe-mkt-hero-actions">
            <Link
              href="/login?intent=trial&tier=boutique"
              className="sbe-mkt-hero-cta"
            >
              Start Free Trial
            </Link>
            <p className="sbe-mkt-hero-microcopy">
              14-day free trial. No credit card required. Set up in under 10 minutes.
            </p>
            <Link href="/how-it-works" className="sbe-mkt-hero-secondary">
              How it works
            </Link>
          </div>

          <ul className="sbe-mkt-hero-trust" aria-label="Platform facts">
            {TRUST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {/* ── Right column: real product screenshot ── */}
        <div className="sbe-mkt-hero-teaser">
          <Image
            src="/shots/HERO SHOT.png"
            alt="Serve By Example on desktop and mobile — manager console, pre-shift home screen, and cocktail drink library"
            width={1335}
            height={1207}
            priority
            sizes="(max-width: 900px) 90vw, 42vw"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* ── Mobile sticky CTA bar ── */}
      <div className="sbe-mkt-hero-sticky">
        <span className="sbe-mkt-hero-sticky-label">14-day free trial</span>
        <Link
          href="/login?intent=trial&tier=boutique"
          className="sbe-mkt-hero-cta sbe-mkt-hero-cta-compact"
        >
          Start Free Trial
        </Link>
      </div>
    </section>
  );
}
