import Link from 'next/link';

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

const ARENA_DIMENSIONS: { label: string; score: number }[] = [
  { label: 'Empathy', score: 9 },
  { label: 'Product knowledge', score: 8 },
  { label: 'De-escalation', score: 9 },
  { label: 'Upsell timing', score: 7 },
  { label: 'Policy accuracy', score: 10 },
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

        {/* ── Right column: layered product teaser (HTML, not a screenshot) ── */}
        <div className="sbe-mkt-hero-teaser" aria-hidden="true">

          {/* Base layer: Pre-Shift Brief card */}
          <div className="sbe-mkt-teaser-card sbe-mkt-teaser-brief">
            <div className="sbe-mkt-teaser-card-head">
              <span className="sbe-mkt-teaser-kicker">Pre-Shift Brief</span>
              <span className="sbe-mkt-teaser-live">Friday · 5:40 pm</span>
            </div>
            <p className="sbe-mkt-teaser-title">Welcome back, David</p>
            <p className="sbe-mkt-teaser-body">
              You&rsquo;ve completed 7 sessions. 1 module is due for spaced repetition.
            </p>
            <div className="sbe-mkt-teaser-focus">
              <span className="sbe-mkt-teaser-focus-label">Focus for tonight</span>
              <p>When reassigning tasks, name the person and the specific job out loud.</p>
            </div>
            <div className="sbe-mkt-teaser-progress">
              <span>Training progress</span>
              <div className="sbe-mkt-teaser-progress-track">
                <div className="sbe-mkt-teaser-progress-fill" style={{ width: '68%' }} />
              </div>
              <span className="sbe-mkt-teaser-progress-num">27 of 40 modules</span>
            </div>
          </div>

          {/* Overlay layer: AI Arena score card */}
          <div className="sbe-mkt-teaser-card sbe-mkt-teaser-arena">
            <div className="sbe-mkt-teaser-card-head">
              <span className="sbe-mkt-teaser-kicker">AI Arena</span>
              <span className="sbe-mkt-teaser-score">8.6</span>
            </div>
            <p className="sbe-mkt-teaser-arena-scenario">
              &ldquo;A regular disputes his tab at last call&rdquo;
            </p>
            <ul className="sbe-mkt-teaser-dims">
              {ARENA_DIMENSIONS.map((d) => (
                <li key={d.label}>
                  <span className="sbe-mkt-teaser-dim-label">{d.label}</span>
                  <span className="sbe-mkt-teaser-dim-track">
                    <span
                      className="sbe-mkt-teaser-dim-fill"
                      style={{ width: `${d.score * 10}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Accent layer: manager visibility pill */}
          <div className="sbe-mkt-teaser-pill">
            Synced to Manager Console
          </div>
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
