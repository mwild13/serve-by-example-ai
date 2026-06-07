"use client";

import { useEffect, useState } from "react";
import { computeBadges, type ModuleSummaryForBadges, type CategoryScores, type Badge } from "@/lib/badges";

type Props = {
  modules: ModuleSummaryForBadges[];
  scores: CategoryScores;
  bestStreak: number;
  sbeElite: number;
};

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className={`badge-card ${badge.earned ? "badge-card--earned" : "badge-card--locked"}`}>
      <div className="badge-card-icon">
        {badge.earned ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>
      <div className="badge-card-label">{badge.label}</div>
      <div className="badge-card-desc">{badge.description}</div>
      {!badge.earned && badge.progress && (
        <div className="badge-card-progress">
          <div className="badge-progress-bar">
            <div
              className="badge-progress-fill"
              style={{ width: `${Math.min(100, Math.round((badge.progress.current / badge.progress.required) * 100))}%` }}
            />
          </div>
          <span className="badge-progress-label">
            {badge.progress.current} / {badge.progress.required} {badge.progress.unit}
          </span>
        </div>
      )}
      {badge.earned && <div className="badge-card-earned-tick">Earned</div>}
    </div>
  );
}

export default function BadgeStreakSection({ modules, scores, bestStreak, sbeElite }: Props) {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem("sbe-streak-count") ?? "0", 10);
      setStreak(isNaN(count) ? 0 : count);
    } catch {
      setStreak(0);
    }
  }, []);

  if (streak === null) {
    return (
      <div className="badge-streak-zone">
        <div className="badge-section">
          <div className="badge-section-header">
            <h2>Streak Badges</h2>
            <p>Training consistency rewards</p>
          </div>
          <div className="badge-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="badge-card badge-card--skeleton" aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allBadges = computeBadges(modules, scores, streak, bestStreak, sbeElite);
  const streakBadges = allBadges.filter((b) => b.category === "streak");

  return (
    <div className="badge-streak-zone">
      <div className="badge-section">
        <div className="badge-section-header">
          <span style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: "4px" }}>Achievements</span>
          <h2>Streak Badges</h2>
          <p>Training consistency rewards</p>
        </div>
        <div className="badge-grid">
          {streakBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
}
