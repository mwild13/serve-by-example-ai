"use client";

interface TrialBillingSectionProps {
  trialTier: string;
  trialEndsAt: string;
  daysRemaining: number;
  staffCount: number;
  scenariosRun: number;
}

const TIER_CONFIG: Record<string, { label: string; monthly: number; yearly: number; seats: string; venues: string }> = {
  boutique:     { label: "Boutique",   monthly: 79,  yearly: 790,   seats: "15", venues: "1 venue" },
  venue_single: { label: "Boutique",   monthly: 79,  yearly: 790,   seats: "15", venues: "1 venue" },
  commercial:   { label: "Commercial", monthly: 149, yearly: 1490,  seats: "35", venues: "Multiple venues" },
  venue_multi:  { label: "Commercial", monthly: 149, yearly: 1490,  seats: "35", venues: "Multiple venues" },
};

export function TrialBillingSection({
  trialTier,
  trialEndsAt,
  daysRemaining,
  staffCount,
  scenariosRun,
}: TrialBillingSectionProps) {
  const config = TIER_CONFIG[trialTier] ?? TIER_CONFIG.boutique;
  const isUrgent = daysRemaining <= 3;
  const daysElapsed = 14 - daysRemaining;
  const progressPct = Math.min(100, (daysElapsed / 14) * 100);
  const expiryDate = new Date(trialEndsAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const urgentColor   = "var(--gold-warm)";
  const healthyColor  = "var(--green)";
  const accentColor   = isUrgent ? urgentColor : healthyColor;

  return (
    <div>
      {/* ── Trial countdown header ── */}
      <div
        style={{
          padding: "22px 24px 16px",
          background: isUrgent ? "var(--gold-light)" : "var(--surface)",
          borderBottom: "1px solid var(--line)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "white",
                  background: accentColor,
                  padding: "3px 10px", borderRadius: "999px",
                }}
              >
                {config.label} Trial
              </span>
              {isUrgent && (
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: urgentColor }}>
                  Action needed
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "1.5rem", fontWeight: 700, color: "var(--text)",
                fontFamily: "var(--font-fraunces)", lineHeight: 1.1,
              }}
            >
              {daysRemaining === 0
                ? "Your trial ends today"
                : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 2 }}>Trial ends</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-soft)" }}>{expiryDate}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 999, background: "var(--line-light)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              borderRadius: 999,
              background: accentColor,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Trial started</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{daysElapsed} of 14 days used</span>
        </div>
      </div>

      {/* ── Trial activity stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {[
          {
            value: daysRemaining === 0 ? "Today" : String(daysRemaining),
            label: "Days left",
            sub: "in your trial",
          },
          {
            value: String(staffCount),
            label: "Staff added",
            sub: "during trial",
          },
          {
            value: String(scenariosRun),
            label: "Scenarios run",
            sub: "by your team",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: "16px 12px",
              textAlign: "center",
              borderRight: i < 2 ? "1px solid var(--line)" : undefined,
            }}
          >
            <div
              style={{
                fontSize: "1.6rem", fontWeight: 700, color: "var(--text)",
                fontFamily: "var(--font-fraunces)", lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.05em", color: "var(--text-muted)", marginTop: 4,
              }}
            >
              {stat.label}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 1 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column body: consequences + pricing ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {/* When your trial ends */}
        <div style={{ padding: "20px 24px", borderRight: "1px solid var(--line)" }}>
          <div
            style={{
              fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 14,
            }}
          >
            When your trial ends
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { good: false, text: "Your manager dashboard access is paused" },
              { good: false, text: "Staff training sessions are suspended" },
              { good: true,  text: "All your data is saved for 30 days" },
              { good: true,  text: "Add billing now and nothing changes" },
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 17, height: 17,
                    borderRadius: "50%",
                    background: item.good ? "var(--green-light)" : (isUrgent ? "rgba(169,129,42,0.12)" : "var(--bg-alt)"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    {item.good ? (
                      <path d="M1.5 4l1.8 1.8 3.2-3.6" stroke="var(--green)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <path d="M2 2l4 4M6 2l-4 4" stroke={isUrgent ? "var(--gold-warm)" : "var(--text-muted)"} strokeWidth="1.3" strokeLinecap="round"/>
                    )}
                  </svg>
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-soft)", lineHeight: 1.45 }}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing cards */}
        <div style={{ padding: "20px 24px" }}>
          <div
            style={{
              fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 14,
            }}
          >
            Continue with {config.label}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {/* Monthly */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--line)",
                background: "var(--surface)",
              }}
            >
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 4 }}>
                Monthly
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-fraunces)", lineHeight: 1 }}>
                AUD ${config.monthly}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 3 }}>per month</div>
            </div>

            {/* Annual — recommended */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--green)",
                background: "var(--green-light)",
              }}
            >
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--green)", marginBottom: 4 }}>
                Annual — save 17%
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-fraunces)", lineHeight: 1 }}>
                AUD ${config.yearly}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--green)", marginTop: 3 }}>per year</div>
            </div>
          </div>

          {/* Features included */}
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              `Up to ${config.seats} staff seats`,
              config.venues,
              "Full 40-module training library",
              "AI Arena + Scenario Training",
              "Manager Mission Control",
              "Cancel anytime",
            ].map((feat, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="5.5" cy="5.5" r="5" fill="var(--green-light)" stroke="var(--green)" strokeWidth="0.75"/>
                  <path d="M3 5.5l1.7 1.7 3-3" stroke="var(--green)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── CTA footer ── */}
      <div
        style={{
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>
            Keep your team&apos;s training running
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 3 }}>
            Add your billing details now to keep your team&apos;s training running without interruption.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <a
            href="/contact"
            style={{
              fontSize: "0.85rem", fontWeight: 600, color: "var(--text-soft)",
              textDecoration: "underline", textDecorationColor: "var(--line)",
            }}
          >
            Talk to us first
          </a>
          <a
            href="/pricing"
            style={{
              display: "inline-block",
              padding: "10px 22px",
              borderRadius: "var(--radius-sm)",
              background: isUrgent ? "var(--gold-warm)" : "var(--green)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Add billing details
          </a>
        </div>
      </div>
    </div>
  );
}
