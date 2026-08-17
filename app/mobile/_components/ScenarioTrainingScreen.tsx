"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookmarkPlus,
  Angry,
  TrendingUp,
  Wine,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B.5 — "Start Simulation" routes into the Arena. The 6 category cards
// stay inert (no per-category detail screen exists yet — see v4-migration-plan/04).

type ScenarioCard = {
  title: string;
  attempts: string;
  difficulty: number; // out of 5, matches the Figma "rating-row" bookmark icons
  icon: typeof Angry;
};

const SCENARIOS: ScenarioCard[] = [
  { title: "Difficult Guests", attempts: "12 attempts", difficulty: 4, icon: Angry },
  { title: "Upselling Techniques", attempts: "8 attempts", difficulty: 5, icon: TrendingUp },
  { title: "Wine Pairing Guide", attempts: "5 attempts", difficulty: 3, icon: Wine },
  { title: "Complaint Handling", attempts: "15 attempts", difficulty: 4, icon: AlertTriangle },
  { title: "Team Leadership", attempts: "3 attempts", difficulty: 3, icon: Users },
  { title: "Rush Hour Rush", attempts: "24 attempts", difficulty: 5, icon: Clock },
];

function DifficultyRating({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }} aria-label={`Difficulty ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <BookmarkPlus
          key={i}
          size={12}
          strokeWidth={2}
          color={i < level ? "var(--gold-mobile)" : "var(--text-mobile-muted)"}
          opacity={i < level ? 1 : 0.35}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ScenarioTrainingScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* page-header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-mobile)" }}>Scenario Training</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile-bg)",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold-mobile)" }}>PRO</span>
          </div>
        </div>

        {/* featured-scenario-section */}
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 18,
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              minHeight: 190,
              justifyContent: "flex-end",
            }}
          >
            <Image
              src="/mobile/scenario-banner.png"
              alt=""
              fill
              style={{ objectFit: "cover", zIndex: 0 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1 }} />

            <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gold-mobile)",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--bg-mobile-dark)" }}>NEW RELEASE</span>
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-light-on-dark)",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-mobile)" }}>Advanced</span>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Wine Cork Complaint</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>
                Learn the exact words to say to save a table and upsell a higher premium bottle.
              </p>
            </div>

            <Link
              href="/mobile/arena"
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--gold-mobile)" }}>Start Simulation</span>
              <ArrowRight size={16} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* grid-scenarios */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Category Simulations</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {SCENARIOS.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <div
                  key={scenario.title}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: 14,
                    borderRadius: "var(--radius-lg)",
                    background: "var(--surface-mobile)",
                    border: "1px solid var(--border-mobile)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--surface-mobile-alt)",
                      }}
                    >
                      <Icon size={18} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-mobile-muted)" }}>{scenario.attempts}</span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-mobile)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {scenario.title}
                  </p>
                  <DifficultyRating level={scenario.difficulty} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav active="scenarios" />
    </div>
  );
}
