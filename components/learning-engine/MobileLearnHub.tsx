"use client";

type NavItem =
  | "home" | "mobile-learn" | "module" | "rapid-fire" | "stage4"
  | "scenarios" | "challenges" | "cocktails" | "knowledge"
  | "progress" | "badges" | "settings";

const ICON_STROKE = {
  fill: "none", stroke: "currentColor",
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

function IcBook({ s = 24 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.5A1.5 1.5 0 0 0 5 20V4.5Z" />
      <path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H19" />
    </svg>
  );
}

function IcTarget({ s = 24 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="currentColor" />
    </svg>
  );
}

function IcCpu({ s = 24 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </svg>
  );
}

function IcStar({ s = 24 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
    </svg>
  );
}

function IcLock({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="1.8" aria-hidden="true">
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

function IcChevron({ s = 18 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...ICON_STROKE} strokeWidth="2" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

type Section = {
  id: NavItem;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tint: string;
  iconColor: string;
  locked: boolean;
  badge?: string;
};

export default function MobileLearnHub({
  setActiveNav,
  isPremium,
}: {
  setActiveNav: (nav: NavItem) => void;
  isPremium: boolean;
}) {
  const sections: Section[] = [
    {
      id: "module",
      title: "Training Modules",
      desc: "40 modules across bartending, service and management",
      icon: <IcBook s={26} />,
      tint: "var(--green-light)",
      iconColor: "var(--green)",
      locked: !isPremium,
      badge: "40 modules",
    },
    {
      id: "stage4",
      title: "Scenario Training",
      desc: "Written practice scenarios based on real service situations",
      icon: <IcTarget s={26} />,
      tint: "var(--gold-light)",
      iconColor: "var(--gold)",
      locked: !isPremium,
      badge: "Pro",
    },
    {
      id: "scenarios",
      title: "Live Scenarios",
      desc: "Live roleplay evaluation powered by AI",
      icon: <IcCpu s={26} />,
      tint: "var(--green-light)",
      iconColor: "var(--green)",
      locked: !isPremium,
      badge: "Pro",
    },
    {
      id: "challenges",
      title: "Challenges",
      desc: "Interactive tap-based mini-games — always free",
      icon: <IcStar s={26} />,
      tint: "var(--gold-light)",
      iconColor: "var(--gold)",
      locked: false,
      badge: "Free",
    },
  ];

  return (
    <div style={{
      padding: "24px 16px 24px",
      fontFamily: "var(--font-manrope, system-ui, sans-serif)",
      color: "var(--text)",
    }}>
      <h1 style={{
        fontFamily: "var(--font-fraunces, Georgia, serif)",
        fontSize: 26, fontWeight: 600, margin: "0 0 6px",
        color: "var(--text)",
      }}>
        Training Hub
      </h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px" }}>
        Choose your training format
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => !s.locked && setActiveNav(s.id)}
            disabled={s.locked}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              width: "100%", textAlign: "left", cursor: s.locked ? "default" : "pointer",
              background: "var(--surface)", border: "1px solid var(--line-light)",
              borderRadius: "var(--radius-lg)",
              padding: "16px", boxShadow: "var(--shadow-sm)",
              opacity: s.locked ? 0.7 : 1,
              transition: "transform .12s ease",
            }}
            onMouseDown={(e) => { if (!s.locked) (e.currentTarget as HTMLElement).style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            {/* Icon tile */}
            <div style={{
              width: 52, height: 52, borderRadius: "var(--radius-md)", flexShrink: 0,
              background: s.tint, color: s.iconColor,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {s.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{s.title}</span>
                {s.badge && (
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
                    color: s.locked ? "var(--text-muted)" : "var(--green)",
                    background: s.locked ? "var(--bg-alt)" : "var(--green-light)",
                    padding: "2px 7px", borderRadius: 99,
                  }}>
                    {s.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4 }}>{s.desc}</div>
            </div>

            {/* Right icon */}
            <div style={{ color: s.locked ? "var(--text-muted)" : "var(--text-soft)", flexShrink: 0 }}>
              {s.locked ? <IcLock s={18} /> : <IcChevron s={18} />}
            </div>
          </button>
        ))}
      </div>

      {!isPremium && (
        <div style={{
          marginTop: 20, padding: "14px 16px",
          background: "var(--gold-light)", borderRadius: "var(--radius-md)",
          border: "1px solid var(--line)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Unlock full training access
          </div>
          <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5 }}>
            Upgrade to Pro to access all 40 modules, scenario training, and Live Scenarios.
          </div>
          <a
            href="/pricing"
            style={{
              display: "inline-block", marginTop: 10,
              background: "var(--green)", color: "var(--bg)",
              fontSize: 13, fontWeight: 700, padding: "8px 16px",
              borderRadius: 99, textDecoration: "none",
            }}
          >
            View plans
          </a>
        </div>
      )}
    </div>
  );
}
