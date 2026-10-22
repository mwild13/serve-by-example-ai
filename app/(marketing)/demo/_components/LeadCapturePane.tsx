"use client";

// Same wording as the guarantee on the home page, pricing and solution pages.
const GUARANTEE_COPY =
  "If your team's training engagement doesn't noticeably increase in the first 14 days, you won't be charged. No questions asked.";

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
        <strong>14-Day Performance Guarantee.</strong> {GUARANTEE_COPY}
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
    // A section, not an aside: it sits inside <main>, and an aside there is a
    // landmark nested in another.
    <section className="demo-right-pane" aria-label="After the demo">
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
    </section>
  );
}
