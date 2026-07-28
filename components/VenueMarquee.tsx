"use client";

const SEGMENTS = ["HOTELS", "BARS", "RESTAURANTS", "PUBS", "FRANCHISES"];

function MarqueeTrack({ prefix }: { prefix: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
    >
      {SEGMENTS.map((segment) => (
        <span
          key={`${prefix}-${segment}`}
          style={{ display: "inline-flex", alignItems: "center" }}
        >
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

export default function VenueMarquee() {
  return (
    <div className="venue-marquee" aria-label="Venue types we serve">
      {/* Visible first track (for screen readers) */}
      <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, position: "absolute", left: "-9999px" }}>
        {SEGMENTS.join(", ")}
      </span>
      <div className="venue-marquee-track">
        <MarqueeTrack prefix="a" />
        <MarqueeTrack prefix="b" />
        <MarqueeTrack prefix="c" />
      </div>
    </div>
  );
}
