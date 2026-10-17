'use client';

// Shared UI primitives for the Manager Control Center.
// Extracted to keep ManagerControlCenter.tsx focused on logic and layout.

import Image from "next/image";

// Shell-shaped loading skeleton, shown two ways:
//  1. As the Suspense `fallback` in app/management/dashboard/page.tsx while
//     the server-started getManagementSnapshot() promise is still pending
//     (streamed, not blocking — see git history ae46df6 for why a blocking
//     `await` was previously removed from that page).
//  2. Inside ManagerControlCenter itself, in the rare case it's ever
//     rendered without initialSnapshot already resolved.
// Kept as one shared component so both paths look identical.
export function MissionControlSkeleton() {
  return (
    <div className="ops-shell mc-shell">
      <aside className="mc-sidebar" style={{ opacity: 0.5, pointerEvents: "none" }}>
        <div className="mc-sidebar-logo">
          <Image src="/logo.webp" alt="Serve By Example" width={36} height={36} className="mc-sidebar-logo-img" />
          <div className="mc-sidebar-logo-text">
            <span className="mc-sidebar-logo-brand">Serve By Example</span>
            <span className="mc-sidebar-logo-sub">Management Console</span>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ background: "var(--line-light)", height: 40, borderRadius: 8 }} />
          <div style={{ background: "var(--line-light)", height: 200, borderRadius: 8, marginTop: 12 }} />
        </div>
      </aside>
      <section className="ops-workspace" style={{ opacity: 0.4, pointerEvents: "none" }}>
        <div style={{ background: "var(--line-light)", height: 60, borderRadius: 8, marginBottom: 20 }} />
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ background: "var(--line-light)", height: 200, borderRadius: 8 }} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ctaLabel/onCtaClick are optional — pass both to render a real actionable
// button (e.g. "+ Add staff") instead of the plain copy-only fallback.
// The fallback (no button) is for genuinely not-yet-built features
// (Scenario builder, Inventory management, Menu engineering etc.) where
// there's nothing to act on yet — it used to show a "Notify Me" button
// that only flipped local React state and never recorded anything, so
// clicking it made a false promise ("You'll be notified...") that reset
// on every reload. Removed rather than wired up, since there's no
// notification mechanism behind it; first-run states that ARE actionable
// (no staff, no certs on file) should always pass a real CTA — see Phase 5
// execution brief, Bottleneck #3.
export function EmptyState({
  copy,
  subCopy,
  tone = "neutral",
  ctaLabel,
  onCtaClick,
}: {
  copy: string;
  /** Overrides the default "This section will populate once your team has
   * data." sub-line. Needed for tone="success" states (see below), where
   * that default would be actively misleading — there's no missing data,
   * everything just checked out clean. */
  subCopy?: string;
  /** "success" renders a green "all clear" treatment (checkmark icon,
   * success colors) instead of the neutral empty-state look. Use it for a
   * genuinely positive zero-count (no active alerts, no urgent flags) —
   * not for "nothing recorded here yet," which should stay tone="neutral"
   * (the default) even when it also happens to have zero items. */
  tone?: "neutral" | "success";
  ctaLabel?: string;
  onCtaClick?: () => void;
}) {
  if (tone === "success") {
    return (
      <div className="ops-empty-state-success">
        <span className="ops-empty-state-success-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
        <div>
          <p className="ops-empty-state-title">{copy}</p>
          {subCopy ? <p className="ops-empty-state-sub">{subCopy}</p> : null}
        </div>
      </div>
    );
  }

  const sub = subCopy ?? "This section will populate once your team has data.";

  if (ctaLabel && onCtaClick) {
    return (
      <div className="ops-empty-state">
        <p className="ops-empty-state-title">{copy}</p>
        <p className="ops-empty-state-sub">{sub}</p>
        <button className="ops-empty-state-btn" onClick={onCtaClick}>
          {ctaLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="ops-empty-state">
      <p className="ops-empty-state-title">{copy}</p>
      <p className="ops-empty-state-sub">{sub}</p>
    </div>
  );
}
