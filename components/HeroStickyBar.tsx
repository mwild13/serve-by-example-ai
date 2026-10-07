"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/*
 * Mobile sticky CTA bar. Hidden (CSS) until the user scrolls past the
 * first-viewport hero fold, then slides up. Desktop never shows it.
 * Defaults to the homepage trial CTA; other pages (e.g. /advisory) pass
 * their own label and destination.
 */

type Props = {
  label?: string;
  cta?: string;
  href?: string;
};

export default function HeroStickyBar({
  label = "14-day free trial",
  cta = "Start Free Trial",
  href = "/login?intent=trial&tier=boutique",
}: Props) {
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
      <span className="sbe-mkt-hero-sticky-label">{label}</span>
      <Link
        href={href}
        className="sbe-mkt-hero-cta sbe-mkt-hero-cta-compact"
        tabIndex={visible ? 0 : -1}
      >
        {cta}
      </Link>
    </div>
  );
}
