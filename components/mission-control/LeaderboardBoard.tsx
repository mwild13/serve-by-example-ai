"use client";

import { useState } from "react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { EmptyState } from "./manager-ui";
import { PageHead, Panel } from "./console-ui";
import { parseLastActiveDays } from "@/lib/management/needs-attention";

// Extracted from ManagerControlCenter.tsx (Phase 5 — component extraction
// roadmap, line-count reduction). Covers the Leaderboards tab: tab switcher,
// podium, season banner, and ranked list.
//
// One ranked list (October 2026). The earlier gold, silver and bronze podium
// repeated the top three rows in colour; rank is now a plain numeral and the
// order carries the meaning. Points are shown with their make-up
// ("44 training + 18 scenario") so a manager never has to work back from a
// formula.
//
// leaderboardTab is local UI-only state — nothing outside this tab reads it.

type LeaderboardTab = "progress" | "score" | "active";

export interface LeaderboardBoardProps {
  venueStaff: ManagementSnapshot["staff"];
  selectedVenueName: string | undefined;
  onSelectStaff: (staffId: string) => void;
  onAddStaff: () => void;
}

export function LeaderboardBoard({ venueStaff, selectedVenueName, onSelectStaff, onAddStaff }: LeaderboardBoardProps) {
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>("progress");

  const sorted = {
    progress: [...venueStaff].sort((a, b) => b.progress - a.progress),
    score: [...venueStaff].sort((a, b) => {
      const avgA = (a.serviceScore + a.salesScore + a.productScore) / 3;
      const avgB = (b.serviceScore + b.salesScore + b.productScore) / 3;
      return avgB - avgA;
    }),
    active: [...venueStaff]
      .filter((s) => s.status === "on-track")
      .sort((a, b) => (parseLastActiveDays(a.lastActive) ?? 999) - (parseLastActiveDays(b.lastActive) ?? 999)),
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
  const month = new Date().toLocaleString("en-AU", { month: "long" });
  const shown = ranked.slice(0, 10);
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
    <div className="mc-page">
      <PageHead
        title="Leaderboards"
        description={`${month} standings for ${selectedVenueName ?? "your venue"}. Select a person to open their profile.`}
      />

      {venueStaff.length === 0 ? (
        <Panel>
          <EmptyState copy="No leaderboard data yet. Add staff to start ranking progress." ctaLabel="+ Add staff" onCtaClick={onAddStaff} />
        </Panel>
      ) : (
        <>
          <div className="mc-tabs" role="tablist" aria-label="Rank by">
            {tabLabels.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={leaderboardTab === tab.key}
                className={`mc-tab${leaderboardTab === tab.key ? " active" : ""}`}
                onClick={() => setLeaderboardTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Panel flush>
            {shown.length === 0 ? (
              <p className="mc-panel-empty" style={{ padding: "24px" }}>No one is on track yet.</p>
            ) : (
              <div className="mc-table-wrap">
                <table className="mc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "4rem" }}>Rank</th>
                      <th>Staff member</th>
                      <th className="is-num">{leaderboardTab === "progress" ? "Training completed" : leaderboardTab === "score" ? "Scenario score" : "Last active"}</th>
                      <th className="is-num">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((member, index) => {
                      const points = getPointsBreakdown(member);
                      return (
                        <tr
                          key={member.id}
                          className="is-clickable"
                          tabIndex={0}
                          aria-label={`Open ${member.name}`}
                          onClick={() => onSelectStaff(member.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelectStaff(member.id);
                            }
                          }}
                        >
                          <td className="mc-rank">{index + 1}</td>
                          <td>
                            <div className="mc-row-title">{member.name}</div>
                            <div className="mc-row-meta">{member.role}</div>
                          </td>
                          <td className="is-num is-main">{getValue(member)}</td>
                          <td className="is-num">
                            <div>{points.total}</div>
                            <div className="mc-row-meta">{points.trainingPts} training + {points.scenarioPts} scenario</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mc-panel-note">
              Points are training completion × 1.2 plus average scenario score × 0.8.
              {ranked.length > shown.length ? ` Showing the top ${shown.length} of ${ranked.length}.` : ""}
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
