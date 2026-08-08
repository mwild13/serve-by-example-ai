"use client";

import Image from "next/image";

/*
 * LogoMarquee — Pages-Redesign.md §3.1 / §5.3.
 * Extension of VenueMarquee: renders real venue logos when provided, and
 * falls back to the existing text-category track until logos exist.
 *
 * Honesty rule: only pass `logos` for venues that are real, named customers
 * with permission. Until then the text fallback states categories, which is
 * true, rather than implying customers that don't exist.
 *
 * Client component only because the underlying marquee CSS animation
 * pattern was; it holds no state.
 */

const SEGMENTS = ["HOTELS", "BARS", "RESTAURANTS", "PUBS", "FRANCHISES"];

type MarqueeLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type Props = {
  /** Real customer logos. Omit to render the category-text fallback. */
  logos?: MarqueeLogo[];
};

function TextTrack({ prefix }: { prefix: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
    >
      {SEGMENTS.map((segment) => (
        <span key={`${prefix}-${segment}`} style={{ display: "inline-flex", alignItems: "center" }}>
          <span
            style={{
              color: "var(--bg)",
              fontSize: "12px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "var(--font-manrope)",
              padding: "0 32px",
            }}
          >
            {segment}
          </span>
          <span style={{ color: "var(--gold)", fontSize: "12px", flexShrink: 0 }}>·</span>
        </span>
      ))}
    </span>
  );
}

function LogoTrack({ prefix, logos }: { prefix: string; logos: MarqueeLogo[] }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
    >
      {logos.map((logo) => (
        <span
          key={`${prefix}-${logo.src}`}
          style={{ display: "inline-flex", alignItems: "center", padding: "0 32px" }}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            style={{ height: "28px", width: "auto", opacity: 0.85 }}
          />
        </span>
      ))}
    </span>
  );
}

export default function LogoMarquee({ logos }: Props) {
  const hasLogos = logos && logos.length > 0;
  return (
    <div
      className="venue-marquee"
      aria-label={hasLogos ? "Venues using Serve By Example" : "Venue types we serve"}
    >
      {/* Screen-reader text */}
      <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, position: "absolute", left: "-9999px" }}>
        {hasLogos ? logos.map((l) => l.alt).join(", ") : SEGMENTS.join(", ")}
      </span>
      <div className="venue-marquee-track">
        {["a", "b", "c"].map((prefix) =>
          hasLogos ? (
            <LogoTrack key={prefix} prefix={prefix} logos={logos} />
          ) : (
            <TextTrack key={prefix} prefix={prefix} />
          ),
        )}
      </div>
    </div>
  );
}
