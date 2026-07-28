"use client";

const GUARANTEE_COPY =
  "14-Day Performance Guarantee: If training engagement doesn’t measurably increase within your first 14 days, you won’t be charged. No questions asked.";

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
          <a href="/login?intent=trial&tier=boutique" className="btn btn-gold btn-lg">Start Free Trial</a>
          <a href="/pricing" className="btn btn-outline-light btn-lg">See pricing</a>
        </>
      ) : (
        <>
          <a href="/login?intent=trial&tier=boutique" className="btn btn-primary btn-lg">Start Free Trial</a>
          <a href="/pricing" className="btn btn-secondary btn-lg">See pricing</a>
        </>
      )}
    </div>
  );
}


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
      </aside>
    </div>
  );
}
