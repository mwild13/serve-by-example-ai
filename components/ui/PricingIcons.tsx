/**
 * PricingIcons.tsx
 *
 * Centralised icon exports for the membership/pricing page.
 *
 * Rules:
 * - All custom SVGs use `currentColor` so they inherit font colour from parent.
 * - strokeWidth is strictly 1.5 or 1.75 — never the Lucide default of 2.
 * - No Tailwind utility classes. Colours via CSS custom properties only.
 */

// ─── Custom SVG Icons ────────────────────────────────────────────────────────

/** Green checkmark — used in the comparison matrix for binary "included" states. */
export function IncludedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--green)", flexShrink: 0 }}
      aria-label="Included"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Muted dash — used in the comparison matrix for binary "not included" states. */
export function ExcludedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--text-muted)", flexShrink: 0 }}
      aria-label="Not included"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Right-angle tree connector — used before nested sub-feature rows in the
 * comparison matrix to show parent-child hierarchy.
 */
export function TreeConnector() {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "var(--line)", flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      <line
        x1="4"
        y1="0"
        x2="4"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="12"
        x2="14"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
