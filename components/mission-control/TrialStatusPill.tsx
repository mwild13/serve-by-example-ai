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
// .mc-upgrade-card-rail is the only part shown while the sidebar is an icon
// rail (see ".mc-sidebar.collapsed .mc-upgrade-card" in globals.css).
export function TrialStatusPill({ trialTier, trialEndsAt: _trialEndsAt, daysRemaining, isExpired = false }: TrialStatusPillProps) {
  const tierLabel = TIER_LABEL[trialTier] ?? "Trial";

  if (isExpired) {
    return (
      <Link
        href="/management/dashboard?tab=settings&subtab=billing"
        className="mc-upgrade-card expired"
        title={`${tierLabel} trial expired. Add billing to restore access`}
      >
        <span className="mc-upgrade-card-rail">
          <strong>Trial</strong>
          ended
        </span>
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
    <Link
      href="/management/dashboard?tab=settings&subtab=billing"
      className="mc-upgrade-card"
      title={`Upgrade plan. ${tierLabel} trial, ${timeLabel.toLowerCase()}`}
    >
      <span className="mc-upgrade-card-rail">
        <strong>{daysRemaining}</strong>
        {daysRemaining === 1 ? "day" : "days"}
      </span>
      <div className="mc-upgrade-card-head">
        <span className="mc-upgrade-card-title">Upgrade plan</span>
        <span className="mc-upgrade-card-days">{timeLabel}</span>
      </div>
      <div className="mc-upgrade-card-desc">{tierLabel} trial. Keep using all features</div>
      <div className="mc-upgrade-card-btn">Upgrade</div>
    </Link>
  );
}
