"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { BadgeProgressRing } from "@/components/learning-engine/BadgeProgressRing";
import BadgeStreakSection from "@/components/learning-engine/BadgeStreakSection";
import {
  computeBadges,
  countEarned,
  type Badge,
  type ModuleSummaryForBadges,
  type CategoryScores,
} from "@/lib/badges";

interface BadgesViewProps {
  onBack?: () => void;
}

function BadgeCard({ badge, isSpecial = false }: { badge: Badge; isSpecial?: boolean }) {
  const inProgress = !badge.earned && badge.progress && badge.progress.current > 0;
  const stateClass = badge.earned
    ? "badge-card--earned"
    : inProgress
    ? "badge-card--progress"
    : "badge-card--locked";
  const specialClass = isSpecial && !badge.earned ? " badge-card--special" : "";

  const barWidth = badge.progress
    ? `${Math.max(4, Math.min(100, Math.round((badge.progress.current / badge.progress.required) * 100)))}%`
    : "4px";

  return (
    <div className={`badge-card ${stateClass}${specialClass}`}>
      <div className="badge-card-icon">
        {badge.earned ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>

      {isSpecial && !badge.earned && (
        <span className="badge-what-it-takes">What it takes:</span>
      )}

      <div className="badge-card-label">{badge.label}</div>
      <div className="badge-card-desc">{badge.description}</div>

      {!badge.earned && (
        <div className="badge-card-progress">
          <div className="badge-progress-bar">
            <div className="badge-progress-fill" style={{ width: barWidth }} />
          </div>
          {badge.progress && (
            <span className="badge-progress-label">
              {badge.progress.current} / {badge.progress.required} {badge.progress.unit}
            </span>
          )}
        </div>
      )}
      {badge.earned && <div className="badge-card-earned-tick">Earned</div>}
    </div>
  );
}

function BadgeSection({
  title,
  subtitle,
  badges,
  isSpecial = false,
  onGoToModules,
}: {
  title: string;
  subtitle: string;
  badges: Badge[];
  isSpecial?: boolean;
  onGoToModules?: () => void;
}) {
  const earned = badges.filter((b) => b.earned).length;
  const hasEarned = earned > 0;

  return (
    <div className="badge-section">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          flex: 1,
          borderLeft: hasEarned ? "3px solid var(--gold)" : "none",
          paddingLeft: hasEarned ? 12 : 0,
        }}>
          <h2 style={{
            fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px",
            color: "var(--text)", opacity: hasEarned ? 1 : 0.7,
          }}>
            {title}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>{subtitle}</p>
        </div>
        <span style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: "var(--radius-pill)",
          background: hasEarned ? "var(--gold-dim)" : "var(--bg-alt)",
          color: hasEarned ? "var(--gold)" : "var(--text-muted)",
          border: `1px solid ${hasEarned ? "var(--gold)" : "var(--line)"}`,
          flexShrink: 0,
          whiteSpace: "nowrap" as const,
        }}>
          {earned} / {badges.length} earned
        </span>
      </div>

      {!hasEarned ? (
        <div className="badge-nudge-card">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
          <p className="badge-nudge-card-title">Start earning {title} badges</p>
          <p className="badge-nudge-card-desc">
            Complete your first {title.toLowerCase()} module to begin unlocking achievements.
          </p>
          <button className="badge-nudge-btn" type="button" onClick={onGoToModules}>
            Go to Modules
          </button>
        </div>
      ) : (
        <div className="badge-grid">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} isSpecial={isSpecial} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BadgesView({ onBack }: BadgesViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [badgeData, setBadgeData] = useState<{
    badges: ReturnType<typeof computeBadges>;
    modules: ModuleSummaryForBadges[];
    scores: CategoryScores;
    bestStreak: number;
    sbeElite: number;
    earnedCount: number;
    totalBadgeCount: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch("/api/training/progress", {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        });
        const res = await r.json();

        const allMods = (res.allModules as { id: number; category: string }[]) ?? [];
        const moduleProgress = (res.moduleProgress as Record<number, { mastery?: number; scenariosAttempted?: number }>) ?? {};

        const modules: ModuleSummaryForBadges[] = allMods.map((m) => {
          const p = moduleProgress[m.id] ?? {};
          return {
            category: m.category as "technical" | "service" | "compliance",
            mastered: (p.mastery ?? 0) >= 80,
            attempted: (p.scenariosAttempted ?? 0) > 0,
          };
        });

        const catAvg = (cat: string) => {
          const mods = allMods.filter((m) => m.category === cat);
          if (mods.length === 0) return 0;
          return Math.round(
            mods.reduce((sum, m) => sum + (moduleProgress[m.id]?.mastery ?? 0), 0) / mods.length
          );
        };

        const scores: CategoryScores = {
          bartending: catAvg("technical"),
          sales: catAvg("service"),
          management: catAvg("compliance"),
        };

        const bestStreak = (res.bestCorrectStreak as number) ?? 0;
        const sbeElite = (res.sbeEliteNumber as number) ?? 0;

        const allBadges = computeBadges(modules, scores, 0, bestStreak, sbeElite);
        const nonStreakBadges = allBadges.filter((b) => b.category !== "streak");
        const earnedCount = countEarned(nonStreakBadges);
        const totalBadgeCount = nonStreakBadges.length;

        setBadgeData({ badges: allBadges, modules, scores, bestStreak, sbeElite, earnedCount, totalBadgeCount });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "4rem 0", textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--line)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading badges…</p>
      </div>
    );
  }

  if (error || !badgeData) {
    return (
      <div style={{ padding: "2rem", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Failed to load badge data. Please refresh.</p>
      </div>
    );
  }

  const { badges, modules, scores, bestStreak, sbeElite, earnedCount, totalBadgeCount } = badgeData;
  const nonStreakBadges = badges.filter((b) => b.category !== "streak");
  const technical  = nonStreakBadges.filter((b) => b.category === "technical");
  const service    = nonStreakBadges.filter((b) => b.category === "service");
  const compliance = nonStreakBadges.filter((b) => b.category === "compliance");
  const special    = nonStreakBadges.filter((b) => b.category === "special");

  return (
    <div className="badge-page">
      <div className="container">

        <div className="badge-hero-strip">
          <div>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              color: "#fff",
              margin: "0 0 6px",
              lineHeight: 1.15,
            }}>
              Your Badges
            </h1>
            <p style={{
              color: "var(--gold-light)",
              fontSize: "0.9rem",
              opacity: 0.85,
              margin: 0,
            }}>
              {earnedCount} of {totalBadgeCount} earned – keep going
            </p>
            {onBack && (
              <button
                onClick={onBack}
                className="badge-back-link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                ← Back to dashboard
              </button>
            )}
          </div>
          <BadgeProgressRing earned={earnedCount} total={totalBadgeCount} />
        </div>

        <BadgeSection
          title="Technical"
          subtitle="Bartending and product knowledge"
          badges={technical}
          onGoToModules={onBack}
        />
        <BadgeSection
          title="Service"
          subtitle="Sales, upselling, and guest experience"
          badges={service}
          onGoToModules={onBack}
        />
        <BadgeSection
          title="Compliance"
          subtitle="RSA, operations, and shift leadership"
          badges={compliance}
          onGoToModules={onBack}
        />

        <BadgeStreakSection
          modules={modules}
          scores={scores}
          bestStreak={bestStreak}
          sbeElite={sbeElite}
        />

        <BadgeSection
          title="Special"
          subtitle="Platform-wide achievements"
          badges={special}
          isSpecial
          onGoToModules={onBack}
        />

      </div>
    </div>
  );
}
