/**
 * PricingIcons.tsx
 *
 * Centralised icon exports for the membership/pricing page.
 *
 * Rules:
 * - All custom SVGs use `currentColor` so they inherit font colour from parent.
 * - strokeWidth is strictly 1.5 or 1.75 — never the Lucide default of 2.
 * - No Tailwind utility classes. Colours via CSS custom properties only.
 * - `tone="dark"` swaps to colours that read on the dark navbar-style panel.
 */

type IconTone = "light" | "dark";

interface IconProps {
  tone?: IconTone;
  size?: number;
}

// ─── Custom SVG Icons ────────────────────────────────────────────────────────

/** Checkmark — used in the comparison matrix for binary "included" states. */
export function IncludedIcon({ tone = "light", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        color: tone === "dark" ? "var(--gold-warm)" : "var(--green)",
        flexShrink: 0,
      }}
      aria-label="Included"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Muted dash — used in the comparison matrix for binary "not included" states. */
export function ExcludedIcon({ tone = "light", size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        color:
          tone === "dark"
            ? "var(--text-light-faint-on-dark)"
            : "var(--text-muted)",
        flexShrink: 0,
      }}
      aria-label="Not included"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
