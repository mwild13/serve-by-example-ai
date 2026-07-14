"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// ── Ghost chart for zero-data state ──────────────────────────────────────────

function GhostChart({ onNavigate, label }: { onNavigate?: (nav: string) => void; label: string }) {
  return (
    <div
      style={{
        height: 180,
        position: "relative",
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--line)",
        background: "var(--bg-alt)",
        overflow: "hidden",
      }}
    >
      {/* Faint gridlines */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 40,
            right: 16,
            top: `${20 + i * 18}%`,
            height: 1,
            background: "var(--line)",
            opacity: 0.5,
          }}
        />
      ))}
      {/* Faint ghost bars */}
      <div style={{ position: "absolute", bottom: 32, left: 60, right: 16, display: "flex", gap: "16px", alignItems: "flex-end" }}>
        {[40, 60, 45].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: "var(--line)", borderRadius: "4px 4px 0 0", opacity: 0.4 }} />
        ))}
      </div>
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          background: "rgba(245, 242, 233, 0.7)",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600, textAlign: "center", maxWidth: 220 }}>
          {label}
        </span>
        {onNavigate && (
          <button
            onClick={() => onNavigate("challenges")}
            style={{
              color: "var(--green)",
              fontSize: "0.82rem",
              fontWeight: 700,
              background: "none",
              border: "1px solid var(--green)",
              borderRadius: "var(--radius-sm)",
              padding: "5px 14px",
              cursor: "pointer",
            }}
          >
            Start a Challenge
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type ProgressChartProps = {
  hasChartData: boolean;
  barChartData: { name: string; score: number }[];
  radarData: { subject: string; score: number }[];
  onNavigate?: (nav: string) => void;
};

export default function ProgressChart({ hasChartData, barChartData, radarData, onNavigate }: ProgressChartProps) {
  return (
    <div className="progress-analytics">
      <h2 className="progress-analytics-title">Performance Analytics</h2>
      <p className="progress-analytics-sub">
        Visual breakdown of your training scores and mastery dimensions.
      </p>
      <div className="progress-analytics-grid">
        <div className="progress-chart-card">
          <div className="progress-chart-title">Scenario Score History</div>
          <p className="progress-chart-sub">Average scenario scores across your three training areas</p>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barChartData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7a9185" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#7a9185" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e5e1d8", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v ?? 0}/100`, "Score"]}
                />
                <Bar dataKey="score" fill="#1f4e37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <GhostChart onNavigate={onNavigate} label="Your score history will appear here after your first challenge." />
          )}
        </div>

        <div className="progress-chart-card">
          <div className="progress-chart-title">Scenario Evaluation Dimensions</div>
          <p className="progress-chart-sub">Mastery and score spread across all training dimensions</p>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e1d8" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#7a9185" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#b5b0a8" }} axisLine={false} />
                <Radar dataKey="score" stroke="#1f4e37" fill="#1f4e37" fillOpacity={0.22} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <GhostChart label="Your mastery dimensions will appear here once you complete scenarios." />
          )}
        </div>
      </div>
    </div>
  );
}
