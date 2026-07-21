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
};

export default function MobileLearnHub({
  setActiveNav,
  isPremium,
  progressData,
}: {
  setActiveNav: (nav: NavItem) => void;
  isPremium: boolean;
  progressData?: Record<string, unknown> | null;
}) {
  const masteredCount = progressData?.moduleProgress
    ? Object.values(progressData.moduleProgress as Record<string, { scenariosMastered?: number }>)
        .filter((p) => (p.scenariosMastered ?? 0) >= 1).length
    : null;
  const totalModules = progressData?.allModules
    ? (progressData.allModules as unknown[]).length
    : 40;
  const moduleDesc =
    masteredCount !== null && masteredCount > 0
      ? `${masteredCount} of ${totalModules} modules mastered`
      : `${totalModules} modules across bartending, service and management`;

  const sections: Section[] = [
    {
      id: "module",
      title: "Training Modules",
      desc: moduleDesc,
      icon: <IcBook s={26} />,
      tint: "var(--green-light)",
      iconColor: "var(--green)",
      locked: !isPremium,
    },
    {
      id: "stage4",
      title: "Scenario Training",
      desc: "Written practice scenarios based on real service situations",
      icon: <IcTarget s={26} />,
      tint: "var(--gold-light)",
      iconColor: "var(--gold)",
      locked: !isPremium,
    },
    {
      id: "scenarios",
      title: "Live Scenarios",
      desc: "Live roleplay evaluation powered by AI",
      icon: <IcCpu s={26} />,
      tint: "var(--green-light)",
      iconColor: "var(--green)",
      locked: !isPremium,
    },
    {
      id: "challenges",
      title: "Challenges",
      desc: "Interactive tap-based mini-games, always free",
      icon: <IcStar s={26} />,
      tint: "var(--gold-light)",
      iconColor: "var(--gold)",
      locked: false,
    },
  ];

  return (
    <div style={{ fontFamily: "var(--font-manrope, system-ui, sans-serif)", color: "var(--text)" }}>
      {/* Green header — matches other page headers */}
      <div style={{ background: "var(--green)", padding: "20px 16px 16px", borderRadius: "0 0 32px 32px", boxShadow: "0 4px 20px rgba(15,45,29,0.18)" }}>
        <span style={{
          fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "block",
        }}>
          Training
        </span>
        <h1 style={{
          fontFamily: "var(--font-fraunces, Georgia, serif)",
          fontSize: 22, fontWeight: 600, color: "var(--surface-raised)", margin: "2px 0 0",
        }}>
          Training Hub
        </h1>
      </div>

      <div style={{ padding: "20px 16px 24px" }}>
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
              <div style={{ marginBottom: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{s.title}</span>
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

      {/* Quick Reference */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
          Quick Reference
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            {
              id: "cocktails" as NavItem,
              title: "Cocktail Library",
              desc: "38 curated cocktail specs",
              tint: "var(--gold-light)",
              color: "var(--gold)",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 4h12l-5 7v6M6 4l6 7M18 4l-6 7M9 20h6" />
                </svg>
              ),
            },
            {
              id: "knowledge" as NavItem,
              title: "101 Knowledge",
              desc: "Quick-reference hospitality facts",
              tint: "var(--green-light)",
              color: "var(--green)",
              icon: <IcBook s={20} />,
            },
          ].map((ref) => (
            <button
              key={ref.id}
              onClick={() => isPremium && setActiveNav(ref.id)}
              disabled={!isPremium}
              style={{
                background: "var(--surface)", border: "1px solid var(--line-light)",
                borderRadius: "var(--radius-md)", padding: "14px 12px",
                textAlign: "left", cursor: isPremium ? "pointer" : "default",
                opacity: isPremium ? 1 : 0.6,
                display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: ref.tint, color: ref.color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {ref.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginBottom: 3 }}>{ref.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4 }}>{ref.desc}</div>
              </div>
              {!isPremium && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
                  <IcLock s={12} />
                </div>
              )}
            </button>
          ))}
        </div>
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
    </div>
  );
}
