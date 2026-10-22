import Link from 'next/link';
import Image from 'next/image';
import HeroStickyBar from './HeroStickyBar';

/*
 * Homepage hero — Pages-Redesign.md §6.1.
 * Server component: static markup, no client state.
 * Copy rewritten 2026-10-23 (owner approved): the buyer's moment ("Friday
 * night") instead of outcome figures there is no customer evidence for yet
 * (ACCC: claims need reasonable grounds when made). Every item in the trust
 * row is a count anyone can check in the product.
 */

const TRUST_ITEMS = [
  '40 training modules',
  '60 practice guests',
  '19 languages',
];

export default function HeroSection() {
  return (
    <section className="sbe-mkt-hero">
      <div className="container sbe-mkt-hero-grid">

        {/* ── Heading: eyebrow + h1 (mobile: first) ── */}
        <div className="sbe-mkt-hero-heading">
          <p className="sbe-mkt-hero-eyebrow">Built for Australian pubs, bars &amp; venues</p>

          <h1 className="sbe-mkt-hero-h1">Know who&rsquo;s ready for Friday night.</h1>
        </div>

        {/* ── Product screenshot (mobile: after the CTAs) ── */}
        <div className="sbe-mkt-hero-teaser">
          <Image
            src="/shots/hero-devices.webp"
            alt="Serve By Example on a laptop and two phones: the manager's staff list with readiness, a Live Guest conversation, and the staff home screen"
            width={2400}
            height={1477}
            priority
            sizes="(max-width: 900px) 90vw, 58vw"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* ── Details: subhead, CTA, trust list (mobile: copy first, trust row last) ── */}
        <div className="sbe-mkt-hero-details">
          <p className="sbe-mkt-hero-sub">
            Your staff train on their phones with guests who talk back. You see who&rsquo;s ready, and whose RSA runs out next month, without pulling your best manager off the floor.
          </p>

          <div className="sbe-mkt-hero-actions">
            <div className="sbe-mkt-hero-btn-row">
              <Link
                href="/login?intent=trial&tier=boutique"
                className="sbe-mkt-hero-cta"
              >
                Start my free trial
              </Link>
              <Link href="/demo" className="sbe-mkt-hero-secondary">
                Try the 2-minute demo
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
              14 days free · Cancel anytime · Set up in 10 minutes
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
