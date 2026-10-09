"use client";

const GUARANTEE_COPY =
  "Onboard your team in under 5 minutes. If your staff doesn't complete their first live scenario within 7 days, you pay $0.";

type CtaGuaranteeBlockProps = {
  pulse?: boolean;
};

export function CtaGuaranteeBlock({ pulse = false }: CtaGuaranteeBlockProps) {
  return (
    <div className="demo-cta-stack">
      <a href="/login" className={`sbe-mkt-btn-primary${pulse ? " demo-cta-pulse" : ""}`}>
        Create my free account
      </a>
      <a href="/membership" className="sbe-mkt-btn-text">See pricing</a>
      <p className="demo-guarantee">
        <strong>Our No-Brainer Guarantee:</strong> {GUARANTEE_COPY}
      </p>
    </div>
  );
}

const SOLUTIONS_LINKS = [
  { href: "/solutions/pub-groups", label: "Pub groups" },
  { href: "/solutions/fine-dining", label: "Fine dining and bars" },
  { href: "/solutions/hotel-fb", label: "Hotel F&B" },
  { href: "/solutions/franchise-systems", label: "Franchise systems" },
];

type LeadCapturePaneProps = {
  pulseKey: number;
  hasResult: boolean;
};

export default function LeadCapturePane({ pulseKey, hasResult }: LeadCapturePaneProps) {
  return (
    <aside className="demo-right-pane">
      <p className="sbe-mkt-kicker">After the demo</p>
      <h2>See the full platform in action</h2>
      <p>
        This demo is just a taste. A full account unlocks unlimited scenarios, a personalised
        AI Coach, progress tracking, and leaderboard rankings, all built for hospitality.
      </p>

      <CtaGuaranteeBlock key={pulseKey} pulse={hasResult} />

      <div className="demo-solutions">
        <p className="sbe-mkt-plan-tier">Which solution fits your venue?</p>
        <ul>
          {SOLUTIONS_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
