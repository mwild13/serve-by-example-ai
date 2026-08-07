import Link from "next/link";

interface TrialStatusPillProps {
  trialTier: string;
  trialEndsAt: string;
  daysRemaining: number;
  isExpired?: boolean;
}

const TIER_LABEL: Record<string, string> = {
  boutique: "Boutique",
  commercial: "Commercial",
  venue_single: "Boutique",
  venue_multi: "Commercial",
};

// Restyled to match the Figma "Upgrade plan" sidebar widget (dark ink card,
// days-remaining chip, white CTA). Logic/branches unchanged from the
// original — only the presentation layer moved from inline styles to the
// .mc-upgrade-card family in globals.css.
export function TrialStatusPill({ trialTier, trialEndsAt: _trialEndsAt, daysRemaining, isExpired = false }: TrialStatusPillProps) {
  const tierLabel = TIER_LABEL[trialTier] ?? "Trial";

  if (isExpired) {
    return (
      <Link href="/management/dashboard?tab=settings&subtab=billing" className="mc-upgrade-card expired">
        <div className="mc-upgrade-card-head">
          <span className="mc-upgrade-card-title">{tierLabel} trial expired</span>
        </div>
        <div className="mc-upgrade-card-desc">Add billing to restore access</div>
        <div className="mc-upgrade-card-btn">Reactivate</div>
      </Link>
    );
  }

  const timeLabel =
    daysRemaining === 0
      ? "Ends today"
      : daysRemaining === 1
      ? "1 day left"
      : `${daysRemaining} days left`;

  return (
    <Link href="/management/dashboard?tab=settings&subtab=billing" className="mc-upgrade-card">
      <div className="mc-upgrade-card-head">
        <span className="mc-upgrade-card-title">Upgrade plan</span>
        <span className="mc-upgrade-card-days">{timeLabel}</span>
      </div>
      <div className="mc-upgrade-card-desc">{tierLabel} trial — keep using all features</div>
      <div className="mc-upgrade-card-btn">Upgrade</div>
    </Link>
  );
}
