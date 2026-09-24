"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/*
 * Mobile sticky trial bar. Hidden (CSS) until the user scrolls past the
 * first-viewport hero fold, then slides up. Desktop never shows it.
 */
export default function HeroStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sbe-mkt-hero-sticky${visible ? " sbe-mkt-hero-sticky--visible" : ""}`}
      aria-hidden={!visible}
    >
      <span className="sbe-mkt-hero-sticky-label">14-day free trial</span>
      <Link
        href="/login?intent=trial&tier=boutique"
        className="sbe-mkt-hero-cta sbe-mkt-hero-cta-compact"
        tabIndex={visible ? 0 : -1}
      >
        Start Free Trial
      </Link>
    </div>
  );
}
