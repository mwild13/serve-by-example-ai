"use client";

import { useMemo } from "react";
import { KB_ENTRIES, KB_CATEGORIES, type KBEntry } from "@/lib/knowledge-base";

type Props = {
  /** Tags from the failed scenario/question for matching */
  tags: string[];
  /** The score the user achieved */
  score: number;
  /** Max score */
  maxScore: number;
  /** Callback to navigate to the knowledge base */
  onNavigateToKB?: () => void;
};

/**
 * RecommenderCard: Shown after a failed attempt (score < pass threshold).
 * Matches scenario tags against KB_ENTRIES to suggest relevant study material.
 */
export default function RecommenderCard({ tags, score, maxScore, onNavigateToKB }: Props) {
  const recommendations = useMemo(() => {
    if (tags.length === 0) return [];

    const tagSet = new Set(tags.map((t) => t.toLowerCase()));

    // Score each KB entry by how many tags match
    const scored: Array<{ entry: KBEntry; matches: number }> = [];
    for (const entry of KB_ENTRIES) {
      const matches = entry.tags.filter((t) => tagSet.has(t.toLowerCase())).length;
      if (matches > 0) {
        scored.push({ entry, matches });
      }
    }

    // Sort by match count descending, take top 3
    scored.sort((a, b) => b.matches - a.matches);
    return scored.slice(0, 3).map((s) => s.entry);
  }, [tags]);

  if (recommendations.length === 0) return null;

  const pct = Math.round((score / maxScore) * 100);

  return (
    <div className="rec-card">
      <div className="rec-header">
        <span className="rec-icon">&#128218;</span>
        <div>
          <strong className="rec-title">Knowledge Gap Detected</strong>
          <p className="rec-subtitle">
            You scored {score}/{maxScore} ({pct}%). Review these topics to strengthen your next attempt.
          </p>
        </div>
      </div>

      <div className="rec-suggestions">
        {recommendations.map((entry) => {
          const catMeta = KB_CATEGORIES[entry.category];
          return (
            <div key={`${entry.category}-${entry.title}`} className="rec-suggestion">
              <span
                className="rec-badge"
                style={{ background: catMeta.color + "22", color: catMeta.color }}
              >
                {catMeta.label}
              </span>
              <strong className="rec-suggestion-title">{entry.title}</strong>
              <p className="rec-suggestion-preview">
                {entry.content.slice(0, 100)}...
              </p>
            </div>
          );
        })}
      </div>

      {onNavigateToKB && (
        <button className="btn btn-secondary rec-kb-link" onClick={onNavigateToKB}>
          Open 101 Knowledge Base &rarr;
        </button>
      )}
    </div>
  );
}
