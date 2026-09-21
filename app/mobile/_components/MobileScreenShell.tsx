import type { CSSProperties, ReactNode } from "react";

// Foundation piece of the responsive-sizing fix (2026-09-21) — the single
// source of truth for the app-shell frame that every /mobile screen used to
// duplicate inline as `maxWidth: 390`. Sizes off --mobile-frame-max
// (app/globals.css) instead of a literal, so widening the frame for tablets
// later is a one-line CSS change instead of a 24-file migration.
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
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "var(--mobile-frame-max)",
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
