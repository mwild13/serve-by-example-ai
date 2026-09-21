"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

// Rendered once from app/mobile/layout.tsx so every /mobile/* route is
// covered without touching each screen. The landscape guard itself is pure
// CSS visibility (see .mobile-landscape-guard in app/globals.css) — no JS
// orientation detection, which has inconsistent support on iOS Safari.
//
// Phase 6 (2026-09-21) — this component is also the single mount point for
// toggling `body.mobile-dark-shell` (app/globals.css) for the lifetime of
// the /mobile route tree. MobileScreenShell's own dark background only
// covers the normal-paint case; it can't reach iOS Safari's elastic
// overscroll (rubber-banding past the top/bottom reveals body's own
// background, not any div inside it) or the home-indicator safe-area strip
// on notched iPhones. Piggybacking on this existing always-mounted
// component avoids adding a second near-identical side-effect-only
// component just for this.
export default function MobileOrientationGuard() {
  useEffect(() => {
    document.body.classList.add("mobile-dark-shell");
    return () => {
      document.body.classList.remove("mobile-dark-shell");
    };
  }, []);

  return (
    <div className="mobile-landscape-guard" role="alert" aria-live="assertive">
      <RotateCcw size={40} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Rotate your device to continue</p>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text-mobile-muted)" }}>
        This app is designed for portrait mode.
      </p>
    </div>
  );
}
