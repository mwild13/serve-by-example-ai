import type { CSSProperties, ReactNode } from "react";

// Foundation piece of the responsive-sizing fix (2026-09-21) — the single
// source of truth for the app-shell frame that every /mobile screen used to
// duplicate inline as `maxWidth: 390`. Sizes off --mobile-frame-max
// (app/globals.css) instead of a literal, so widening the frame for tablets
// later is a one-line CSS change instead of a 24-file migration.
//
// Phase 6 (2026-09-21) — split into two layers. The outer div is full-bleed
// (no maxWidth) and carries the dark background so it always reaches the
// real viewport edge; the inner div is the centered, width-capped content
// frame. Before this split, background lived on the same div as maxWidth,
// so any gap between the frame and the true viewport (true at nearly every
// width once --mobile-frame-max became a clamp() for tablets) showed the
// light marketing `body` background bleeding through the sides. This div
// split only covers the normal-paint case, not iOS rubber-band overscroll
// or the safe-area strip — see the body.mobile-dark-shell class
// (app/globals.css) toggled by MobileOrientationGuard.tsx for that half.
export default function MobileScreenShell({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "var(--mobile-frame-max)",
          margin: "0 auto",
          minHeight: "100dvh",
          fontFamily: "var(--font-body)",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}
