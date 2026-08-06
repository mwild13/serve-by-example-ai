"use client";

import { useState } from "react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { EmptyState } from "./manager-ui";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap, line-count reduction). Covers the Leaderboards tab: tab switcher,
// podium, season banner, and ranked list.
//
// UX upgrades applied here (Phase 5 execution brief, Friction #6):
//   1. Podium is now additive, not duplicative — each podium card shows a
//      points breakdown and (for 2nd/3rd) the gap to the leader, neither of
//      which appears in the list below. The list keeps the full ranked view,
//      the Recognise action, and per-person point breakdown — context the
//      podium doesn't have room for.
//   2. Points are no longer a bare number a manager has to reverse-engineer
//      from the caption formula — getPointsBreakdown() returns a
//      plain-English gloss ("44 training + 18 scenario") shown inline next
//      to every points figure, podium and list alike.
//
// leaderboardTab is local UI-only state — nothing outside this tab reads it.

type LeaderboardTab = "progress" | "score" | "active";

export interface LeaderboardBoardProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
  onSelectStaff: (staffId: string) => void;
  onRecognise: (member: { id: string; name: string }) => void;
  onAddStaff: () => void;
}

const PODIUM_COLORS = ["var(--status-amber)", "var(--color-slate)", "var(--status-bronze)"];
const PODIUM_LABELS = ["1st", "2nd", "3rd"];

export function LeaderboardBoard({ venueStaff, selectedVenueName, onSelectStaff, onRecognise, onAddStaff }: LeaderboardBoardProps) {
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>("progress");

  const sorted = {
    progress: [...venueStaff].sort((a, b) => b.progress - a.progress),
    score: [...venueStaff].sort((a, b) => {
      const avgA = (a.serviceScore + a.salesScore + a.productScore) / 3;
      const avgB = (b.serviceScore + b.salesScore + b.productScore) / 3;
      return avgB - avgA;
    }),
    active: [...venueStaff].filter((s) => s.status === "on-track").sort((a, b) => {
      const parseLastActive = (str: string) => {
        if (!str) return 999;
        if (str.includes("today")) return 0;
        if (str.includes("yesterday")) return 1;
        const match = str.match(/(\d+)\s*day/);
        return match ? parseInt(match[1]) : 999;
      };
      return parseLastActive(a.lastActive) - parseLastActive(b.lastActive);
    }),
  };
  const ranked = sorted[leaderboardTab];
  const tabLabels: { key: LeaderboardTab; label: string }[] = [
    { key: "progress", label: "Training progress" },
    { key: "score", label: "Scenario score" },
    { key: "active", label: "On track" },
  ];
  const getValue = (s: typeof venueStaff[0]) => {
    if (leaderboardTab === "progress") return `${parseFloat(s.progress.toFixed(1))}%`;
    if (leaderboardTab === "score") return `${Math.round((s.serviceScore + s.salesScore + s.productScore) / 3)}%`;
    return s.lastActive || "No activity";
  };
  // Plain-English points breakdown — "44 training + 18 scenario", not just a
  // number the manager has to reverse the formula to understand.
  const getPointsBreakdown = (s: typeof venueStaff[0]) => {
    const trainingPts = Math.round(s.progress * 1.2);
    const scenarioPts = Math.round((s.serviceScore + s.salesScore + s.productScore) / 3 * 0.8);
    const total = trainingPts + scenarioPts;
    const dominant = trainingPts >= scenarioPts ? "training" : "scenario score";
    return { total, trainingPts, scenarioPts, dominant };
  };

  return (
    <section className="ops-grid ops-grid-main">
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ops-card-head">
          <h3>Leaderboards</h3>
          <span>{selectedVenueName}</span>
        </div>
        {venueStaff.length === 0 ? (
          <EmptyState
            copy="No leaderboard data yet. Add staff to start ranking progress."
            ctaLabel="+ Add staff"
            onCtaClick={onAddStaff}
          />
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
              {tabLabels.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setLeaderboardTab(t.key)}
                  style={{
                    padding: "7px 16px", borderRadius: 999, border: "1.5px solid",
                    borderColor: leaderboardTab === t.key ? "var(--color-mastery-technical)" : "var(--line)",
                    background: leaderboardTab === t.key ? "var(--color-mastery-technical)" : "transparent",
                    color: leaderboardTab === t.key ? "white" : "var(--text-soft)",
                    fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
              {leaderboardTab === "progress" && (
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: 4, alignSelf: "center" }}>
                  Points = Training completion (×1.2) + Avg scenario score (×0.8)
                </span>
              )}
            </div>
            {ranked.length > 0 && (
              // Full-width podium (Phase 5 UX Refinement Pass) — previously a
              // flex row pinned to the card's left third with ~250px of dead
              // whitespace beside it. Now a 3-column grid spanning the full
              // card, with 1st place visually elevated (negative margin +
              // larger badge) and a solid, high-contrast rank badge per
              // place instead of a thin colored underline.
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[1, 0, 2].map((pos) => {
                  const m = ranked[pos];
                  if (!m) return <div key={pos} />;
                  const isFirst = pos === 0;
                  const points = getPointsBreakdown(m);
                  const leaderPoints = ranked[0] ? getPointsBreakdown(ranked[0]).total : points.total;
                  const gapToLeader = leaderPoints - points.total;
                  return (
                    <div
                      key={m.id}
                      style={{
                        textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: isFirst ? "28px 16px 20px" : "20px 16px 16px",
                        marginTop: isFirst ? 0 : 20,
                        borderRadius: 14,
                        background: `${PODIUM_COLORS[pos]}0f`,
                        border: `${isFirst ? 2 : 1.5}px solid ${PODIUM_COLORS[pos]}${isFirst ? "" : "60"}`,
                      }}
                    >
                      {/* Solid, high-contrast rank badge — replaces the old thin
                          colored underline bar with something that actually
                          reads as a medal at a glance. */}
                      <div style={{
                        width: isFirst ? 44 : 34, height: isFirst ? 44 : 34, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: PODIUM_COLORS[pos], color: "var(--surface-raised)",
                        fontWeight: 800, fontSize: isFirst ? "1.15rem" : "0.95rem",
                        boxShadow: `0 2px 8px ${PODIUM_COLORS[pos]}50`,
                      }}>
                        {pos + 1}
                      </div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: PODIUM_COLORS[pos], textTransform: "uppercase", letterSpacing: "0.06em" }}>{PODIUM_LABELS[pos]}</div>
                      <div style={{ fontWeight: 700, fontSize: isFirst ? "1.05rem" : "0.92rem", color: "var(--text)" }}>{m.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{m.role}</div>
                      <div style={{
                        padding: "4px 14px", borderRadius: 999, fontWeight: 800, fontSize: "0.9rem",
                        background: PODIUM_COLORS[pos] + "20", color: PODIUM_COLORS[pos], border: `1.5px solid ${PODIUM_COLORS[pos]}40`,
                      }}>{getValue(m)}</div>
                      {/* Added context vs. the list below: points breakdown, plus how far
                          behind the leader (only meaningful for 2nd/3rd) */}
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {points.total} pts · {points.trainingPts} training + {points.scenarioPts} scenario
                      </div>
                      {!isFirst && gapToLeader > 0 && (
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--status-orange)" }}>
                          −{gapToLeader} pts behind leader
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Season banner */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", padding: "10px 14px", background: "var(--bg-alt)", borderRadius: 8, border: "1px solid var(--line)" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {new Date().toLocaleString("default", { month: "long" })} Champions · {selectedVenueName}
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{ranked.length} ranked</span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {ranked.slice(0, 8).map((member, idx) => {
                const medalColors = ["var(--status-amber)", "var(--color-slate)", "var(--status-bronze)"];
                const isTop3 = idx < 3;
                const points = getPointsBreakdown(member);
                return (
                  <li
                    key={member.id}
                    onClick={() => onSelectStaff(member.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      background: isTop3 ? `${PODIUM_COLORS[idx]}08` : "var(--bg-alt)",
                      border: `1.5px solid ${isTop3 ? PODIUM_COLORS[idx] + "40" : "var(--line)"}`,
                      transition: "box-shadow 0.15s, transform 0.1s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLLIElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLLIElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLLIElement).style.boxShadow = "none"; (e.currentTarget as HTMLLIElement).style.transform = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        background: isTop3 ? medalColors[idx] : "var(--bg-alt)",
                        border: isTop3 ? "none" : "1.5px solid var(--line)",
                      }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isTop3 ? "white" : "var(--text-muted)" }}>{idx + 1}</span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text)" }}>{member.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{member.role}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: isTop3 ? PODIUM_COLORS[idx] : "var(--text-soft)" }}>{getValue(member)}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }} title={`${points.trainingPts} pts from training completion + ${points.scenarioPts} pts from scenario score`}>
                          {points.total} pts — mostly from {points.dominant}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecognise({ id: member.id, name: member.name });
                        }}
                        style={{ padding: "5px 10px", borderRadius: 6, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text-soft)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        Recognise
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </article>
    </section>
  );
}
