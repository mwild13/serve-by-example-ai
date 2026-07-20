/**
 * PricingIcons.tsx
 *
 * Centralised icon exports for the membership/pricing page.
 *
 * Rules:
 * - All custom SVGs use `currentColor` so they inherit font colour from parent.
 * - strokeWidth is strictly 1.5 or 1.75 — never the Lucide default of 2.
 * - No Tailwind utility classes. Colours via CSS custom properties only.
 * - Lucide wrappers forward all props so callers can override size/style if
 *   needed, but strokeWidth is locked to 1.5 at the wrapper level.
 */

import {
  Zap,
  Layers,
  TrendingUp,
  Timer,
  Gamepad2,
  Users,
  LayoutDashboard,
  Trophy,
  ShieldCheck,
  BarChart2,
  PhoneCall,
  Network,
  Code2,
  Paintbrush,
  Lock,
  Globe,
  Headphones,
  type LucideProps,
} from "lucide-react";

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

/** Slightly smaller green checkmark — used inside the 5-feature list on each pricing card. */
export function CardCheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Gold right-chevron — used before "Everything in [Tier]" inheritance rows
 * on the pricing cards to visually distinguish them from standalone features.
 */
export function InheritIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ─── Lucide Wrappers ─────────────────────────────────────────────────────────
//
// Each wrapper locks strokeWidth to 1.5 and forwards all other props.
// Callers may still override `size` and `style` as needed.

type IconProps = Omit<LucideProps, "strokeWidth">;

/** Neural Scenario Forge — AI Arena */
export function ZapIcon(props: IconProps) {
  return <Zap strokeWidth={1.5} {...props} />;
}

/** Mastery Protocol Engine — 40-module library */
export function LayersIcon(props: IconProps) {
  return <Layers strokeWidth={1.5} {...props} />;
}

/** Dynamic Skill Calibration — ELO + spaced repetition */
export function TrendingUpIcon(props: IconProps) {
  return <TrendingUp strokeWidth={1.5} {...props} />;
}

/** Rapid Deploy Drilling — rapid-fire quiz mode */
export function TimerIcon(props: IconProps) {
  return <Timer strokeWidth={1.5} {...props} />;
}

/** Reflex Scenario Challenges — tap-based mini-games */
export function Gamepad2Icon(props: IconProps) {
  return <Gamepad2 strokeWidth={1.5} {...props} />;
}

/** Staff seats */
export function UsersIcon(props: IconProps) {
  return <Users strokeWidth={1.5} {...props} />;
}

/** Command & Compliance Centre — Mission Control dashboard */
export function LayoutDashboardIcon(props: IconProps) {
  return <LayoutDashboard strokeWidth={1.5} {...props} />;
}

/** Competitive Performance Index — staff leaderboards */
export function TrophyIcon(props: IconProps) {
  return <Trophy strokeWidth={1.5} {...props} />;
}

/** Compliance Pulse Monitoring — cross-team compliance */
export function ShieldCheckIcon(props: IconProps) {
  return <ShieldCheck strokeWidth={1.5} {...props} />;
}

/** Cohort analytics and trend reporting */
export function BarChart2Icon(props: IconProps) {
  return <BarChart2 strokeWidth={1.5} {...props} />;
}

/** Onboarding sessions / guided setup call */
export function PhoneCallIcon(props: IconProps) {
  return <PhoneCall strokeWidth={1.5} {...props} />;
}

/** Franchise Command Network — multi-venue */
export function NetworkIcon(props: IconProps) {
  return <Network strokeWidth={1.5} {...props} />;
}

/** Custom module development */
export function Code2Icon(props: IconProps) {
  return <Code2 strokeWidth={1.5} {...props} />;
}

/** White-label options */
export function PaintbrushIcon(props: IconProps) {
  return <Paintbrush strokeWidth={1.5} {...props} />;
}

/** Data isolation / Secure Single-Session Architecture */
export function LockIcon(props: IconProps) {
  return <Lock strokeWidth={1.5} {...props} />;
}

/** Language runtime translation / Multilingual Activation Layer */
export function GlobeIcon(props: IconProps) {
  return <Globe strokeWidth={1.5} {...props} />;
}

/** Support / dedicated account manager */
export function HeadphonesIcon(props: IconProps) {
  return <Headphones strokeWidth={1.5} {...props} />;
}
