import Link from "next/link";

interface TrialStatusPillProps {
  trialTier: string;
  trialEndsAt: string;
  daysRemaining: number;
}

const TIER_LABEL: Record<string, string> = {
  boutique: "Boutique",
  commercial: "Commercial",
  venue_single: "Boutique",
  venue_multi: "Commercial",
};

export function TrialStatusPill({ trialTier, trialEndsAt: _trialEndsAt, daysRemaining }: TrialStatusPillProps) {
  const isUrgent = daysRemaining <= 3;
  const tierLabel = TIER_LABEL[trialTier] ?? "Trial";

  const timeLabel =
    daysRemaining === 0
      ? "Trial ends today"
      : daysRemaining === 1
      ? "1 day left"
      : `${daysRemaining} days left`;

  return (
    <Link
      href="/management/dashboard?tab=settings&subtab=billing"
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: "var(--radius-sm)",
        border: `1.5px solid ${isUrgent ? "var(--gold)" : "var(--line)"}`,
        background: isUrgent ? "var(--gold-light)" : "var(--bg-alt)",
        textDecoration: "none",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 2,
        }}
      >
        {tierLabel} Trial
      </div>
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color: isUrgent ? "var(--gold-warm)" : "var(--text-soft)",
        }}
      >
        {timeLabel}
      </div>
      <div
        style={{
          fontSize: "0.72rem",
          color: isUrgent ? "var(--gold)" : "var(--text-muted)",
          marginTop: 3,
        }}
      >
        Add billing to continue
      </div>
    </Link>
  );
}
