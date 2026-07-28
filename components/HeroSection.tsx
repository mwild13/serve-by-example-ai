'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container">

        <h1>Turn 6 Months of Onboarding Into 6 Weeks.</h1>

        <p className="hero-sub" style={{ marginTop: 20 }}>
          Deliver the exact standard your best manager enforces, without pulling them off the floor.
        </p>

        <div className="hero-cta-tiles">
          <Link href="/login?intent=trial&tier=boutique" className="hero-cta-tile hero-cta-tile-primary mkt-sharp-btn">
            Start Free Trial
          </Link>
        </div>
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link href="/how-it-works" style={{ fontSize: "0.9rem", color: "var(--text-soft)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            How it works
          </Link>
        </div>

        <div className="hero-showcase">
          <Image
            src="/shots/257shots_so.webp"
            alt="Serve By Example staff training dashboard"
            width={1400}
            height={875}
            priority
            sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1280px) 90vw, 1080px"
            className="hero-showcase-img"
          />
        </div>

      </div>
    </section>
  );
}
