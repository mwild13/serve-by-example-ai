import { RotateCcw } from "lucide-react";

// Rendered once from app/mobile/layout.tsx so every /mobile/* route is
// covered without touching each screen. Pure CSS visibility (see
// .mobile-landscape-guard in app/globals.css) — no JS orientation
// detection, which has inconsistent support on iOS Safari.
export default function MobileOrientationGuard() {
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
