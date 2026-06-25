"use client";

export default function VenueMarquee() {
  const segments = [
    "HOTELS",
    "BARS",
    "RESTAURANTS",
    "FINE DINING",
    "PUB GROUPS",
    "FRANCHISE SYSTEMS",
    "HOTEL F&B",
  ];

  const renderTrack = (keyPrefix: string) =>
    segments.map((segment, i) => (
      <span key={`${keyPrefix}-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
        {i > 0 && (
          <span style={{ color: "var(--gold)", margin: "0 16px", fontSize: "12px" }}>·</span>
        )}
        <span
          style={{
            color: "var(--bg)",
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontFamily: "var(--font-manrope)",
          }}
        >
          {segment}
        </span>
      </span>
    ));

  return (
    <div className="venue-marquee">
      <div className="venue-marquee-track">
        <span style={{ display: "inline-flex", alignItems: "center", paddingRight: "32px" }}>
          {renderTrack("a")}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", paddingRight: "32px" }}>
          {renderTrack("b")}
        </span>
      </div>
    </div>
  );
}
