"use client";

import { Award } from "lucide-react";
import { CATEGORY_LABELS, type ModuleSummary } from "./progress-types";

const CHALLENGE_LABELS = ["Sequence Sort", "Fill the Blank", "Match Pair", "Spot the Error", "Multiple Choice"];

// ── Skill meter (10 segments) ────────────────────────────────────────────────

function SkillMeter({ skillLevel }: { skillLevel: number }) {
  return (
    <div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {Array.from({ length: 10 }, (_, i) => {
          const filled = i < skillLevel;
          const isCurrent = i === skillLevel - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: "10px",
                borderRadius: "5px",
                background: filled ? "var(--green)" : "var(--line)",
                boxShadow: isCurrent ? "0 0 0 3px var(--gold-light)" : "none",
                transition: `background 120ms ${i * 40}ms ease`,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
          Skill Level {skillLevel} / 10
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          {skillLevel <= 3 ? "Apprentice" : skillLevel <= 6 ? "Specialist" : skillLevel <= 9 ? "Expert" : "Master"}
        </span>
      </div>
    </div>
  );
}

// ── Challenge progress cluster ───────────────────────────────────────────────

function ChallengeCluster({ completed, onNavigate }: { completed: number[]; onNavigate?: (nav: string) => void }) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
        {CHALLENGE_LABELS.map((label, i) => {
          const done = completed.includes(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                border: done ? "none" : "1.5px solid var(--line)",
                background: done ? "var(--green-light)" : "transparent",
                color: done ? "var(--green)" : "var(--text-muted)",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              {done ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l6 6L20 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
              {label}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
          {completed.length} of 5 complete
        </p>
        {completed.length < 5 && onNavigate && (
          <button
            onClick={() => onNavigate("challenges")}
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--green)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Go to Challenges
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type ProgressSummaryProps = {
  displayName: string;
  plan: string;
  skillLevel: number;
  masteredCount: number;
  totalCount: number;
  bestModuleMastery: number;
  weakestCategory: "technical" | "service" | "compliance";
  totalSessions: number;
  badgesEarned: number;
  totalBadgeCount: number;
  firstUnmastered: ModuleSummary | null;
  challengesCompleted: number[];
  onSelectModule?: (moduleId: number) => void;
  onNavigate?: (nav: string) => void;
};

export default function ProgressSummary({
  displayName,
  plan,
  skillLevel,
  masteredCount,
  totalCount,
  bestModuleMastery,
  weakestCategory,
  totalSessions,
  badgesEarned,
  totalBadgeCount,
  firstUnmastered,
  challengesCompleted,
  onSelectModule,
  onNavigate,
}: ProgressSummaryProps) {
  return (
    <>
      {/* Skill meter */}
      <div className="progress-hub-header">
        <h1>{displayName}&rsquo;s Progress Hub</h1>
        <SkillMeter skillLevel={skillLevel} />
      </div>

      {/* Stats + recommended */}
      <div className="progress-hub-hero-grid">
        <div className="progress-hub-stats-grid">
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Modules Mastered</span>
            <span className="progress-hub-stat-value">{masteredCount}/{totalCount}</span>
            <div className="progress-hub-stat-mini-track">
              <div className="progress-hub-stat-mini-fill" style={{ width: `${Math.round((masteredCount / Math.max(totalCount, 1)) * 100)}%` }} />
            </div>
            <p className="progress-hub-stat-sub">verified across all categories</p>
          </div>
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Best Module Mastery</span>
            <span className="progress-hub-stat-value">{bestModuleMastery}%</span>
            <p className="progress-hub-stat-sub">highest single module score</p>
          </div>
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Focus Area</span>
            <span className="progress-hub-stat-value" style={{ fontSize: "1.05rem" }}>{CATEGORY_LABELS[weakestCategory]}</span>
            <p className="progress-hub-stat-sub">weakest category · priority training</p>
          </div>
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Sessions Completed</span>
            <span className="progress-hub-stat-value">{totalSessions}</span>
            <p className="progress-hub-stat-sub">total training sessions</p>
          </div>
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Badge Collection</span>
            <div className="progress-hub-badge-row">
              {[0, 1, 2].map((i) => (
                <Award key={i} size={22} className={i < badgesEarned ? "progress-hub-badge-icon" : "progress-hub-badge-icon--empty"} />
              ))}
            </div>
            <p className="progress-hub-stat-sub">{badgesEarned}/{totalBadgeCount} earned</p>
          </div>
          <div className="progress-hub-stat-card">
            <span className="progress-hub-stat-label">Current Standing</span>
            <span className="progress-hub-stat-value">Level {skillLevel}</span>
            <p className="progress-hub-stat-sub">of 10 · {skillLevel <= 3 ? "Apprentice" : skillLevel <= 6 ? "Specialist" : skillLevel <= 9 ? "Expert" : "Master"}</p>
          </div>
        </div>

        <div className="progress-hub-recommended">
          <span className="progress-hub-rec-eyebrow">Recommended next session</span>
          {firstUnmastered ? (
            <>
              <span className="progress-hub-rec-title">{firstUnmastered.title}</span>
              <p className="progress-hub-rec-sub">
                {plan === "free"
                  ? "Free access active. Upgrade to unlock deeper coaching."
                  : `${masteredCount} of ${totalCount} modules mastered. Keep going.`}
              </p>
              {onSelectModule && (
                <button className="progress-hub-rec-btn" onClick={() => onSelectModule(firstUnmastered.id)}>
                  Start Module &rarr;
                </button>
              )}
            </>
          ) : (
            <>
              <span className="progress-hub-rec-title">All modules complete. Run AI Scenario sessions to stay sharp.</span>
              {onNavigate && (
                <button className="progress-hub-rec-btn" onClick={() => onNavigate("scenarios")}>
                  Enter AI Scenarios &rarr;
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Challenges cluster */}
      <div className="progress-mastery-list-v2">
        <h2 className="progress-mastery-list-v2-title">Challenges</h2>
        <p className="progress-mastery-list-v2-sub">
          5 interactive question types. Completion is tracked on this device.
        </p>
        <div style={{ marginTop: 12 }}>
          <ChallengeCluster completed={challengesCompleted} onNavigate={onNavigate} />
        </div>
      </div>
    </>
  );
}
