"use client";

const GUARANTEE_COPY =
  "Onboard your team in under 5 minutes. If your staff doesn't complete their first live scenario within 7 days, you pay $0.";

type CtaGuaranteeBlockProps = {
  variant: "dark" | "light";
  pulse?: boolean;
};

export function CtaGuaranteeBlock({ variant, pulse = false }: CtaGuaranteeBlockProps) {
  const badgeClass =
    variant === "dark"
      ? `demo-guarantee-badge${pulse ? " demo-cta-pulse" : ""}`
      : `demo-guarantee-badge-light${pulse ? " demo-cta-pulse" : ""}`;

  return (
    <div className="demo-cta-stack">
      <div className={badgeClass}>
        <span>
          <strong>Our No-Brainer Guarantee:</strong> {GUARANTEE_COPY}
        </span>
      </div>
      {variant === "dark" ? (
        <>
          <a href="/login" className="btn btn-gold btn-lg">Create free account</a>
          <a href="/pricing" className="btn btn-outline-light btn-lg">See pricing</a>
        </>
      ) : (
        <>
          <a href="/login" className="btn btn-primary btn-lg">Create free account</a>
          <a href="/pricing" className="btn btn-secondary btn-lg">See pricing</a>
        </>
      )}
    </div>
  );
}

const SOLUTIONS_LINKS = [
  { href: "/solutions/pub-groups", label: "Pub Groups" },
  { href: "/solutions/fine-dining", label: "Fine Dining & Bars" },
  { href: "/solutions/hotel-fb", label: "Hotel F&B" },
  { href: "/solutions/franchise-systems", label: "Franchise Systems" },
  { href: "/solutions/multi-venue", label: "Multi-Venue Groups" },
];

type LeadCapturePaneProps = {
  pulseKey: number;
  hasResult: boolean;
};

export default function LeadCapturePane({ pulseKey, hasResult }: LeadCapturePaneProps) {
  return (
    <div className="sbe-mkt-scope">
      <aside className="demo-right-pane">
        <div>
          <h2>See the full platform in action</h2>
          <p>
            This demo is just a taste. A full account unlocks unlimited scenarios, a
            personalised AI Coach, progress tracking, and leaderboard rankings — all built
            for hospitality.
          </p>
        </div>

        <CtaGuaranteeBlock key={pulseKey} variant="dark" pulse={hasResult} />

        <div className="demo-solutions-links-wrap">
          <p className="demo-solutions-links-label">Which solution fits your venue?</p>
          <div className="demo-solutions-links">
            {SOLUTIONS_LINKS.map((link, i) => (
              <span key={link.href}>
                {i > 0 && <span className="sep">· </span>}
                <a href={link.href}>{link.label}</a>
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
