"use client";

import Image from "next/image";
import { Settings, History } from "lucide-react";
import BottomNav from "./BottomNav";

// Phase B skeleton — dumb UI only. Matches the Figma "me-progress" frame 1:1
// visually; no data fetching, routing, or interaction is wired up yet.

const STATS = [
  { value: "12/40", label: "Modules Done", color: "var(--text-mobile)" },
  { value: "12 Days", label: "Active Streak", color: "var(--green-mobile)" },
  { value: "4,850", label: "Total XP", color: "var(--gold-mobile)" },
];

const SKILLS = [
  { label: "Spirits", pct: 85 },
  { label: "Wine", pct: 60 },
  { label: "Beer", pct: 45 },
  { label: "Cocktails", pct: 90 },
  { label: "Sales", pct: 70 },
  { label: "Management", pct: 30 },
  { label: "Service", pct: 55 },
  { label: "Hygiene", pct: 95 },
  { label: "Safety", pct: 80 },
];

const ACTIVITY_LOG = [
  { title: "Completed Old Fashioned Lesson", time: "2 hours ago", xp: "+50 XP" },
  { title: "Passed Wine Pairings Challenge", time: "Yesterday", xp: "+120 XP" },
  { title: "Started Inventory Management", time: "3 days ago", xp: "+10 XP" },
];

function SkillRing({ label, pct }: { label: string; pct: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = (1 - pct / 100) * circ;

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--surface-mobile-alt)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke="var(--gold-mobile)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 24 24)"
        />
        <text x="24" y="28" textAnchor="middle" fill="var(--text-mobile)" fontSize="13" fontWeight="700">
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-mobile-muted)", textAlign: "center" }}>{label}</span>
    </div>
  );
}

export default function ProgressScreen() {
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
        {/* profile-header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, overflow: "hidden", flexShrink: 0 }}>
              <Image src="/mobile/avatar-large.png" alt="" width={64} height={64} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>USERNAME</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gold-mobile)" }}>Senior Bartender</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>The Grand Hotel</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Settings"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Settings size={20} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          </button>
        </div>

        {/* stats-row */}
        <div style={{ display: "flex", gap: 10, padding: "0 20px 20px" }}>
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: 12,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-mobile-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* mastery-grid-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 20px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Mastery Skills Breakdown</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            {[SKILLS.slice(0, 3), SKILLS.slice(3, 6), SKILLS.slice(6, 9)].map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 12, width: "100%" }}>
                {row.map((skill) => (
                  <SkillRing key={skill.label} label={skill.label} pct={skill.pct} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* recent-activity-section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-mobile)" }}>Recent Activity Log</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {ACTIVITY_LOG.map((entry) => (
              <div
                key={entry.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-mobile)",
                  border: "1px solid var(--border-mobile)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: "var(--surface-mobile-alt)",
                    flexShrink: 0,
                  }}
                >
                  <History size={16} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-mobile)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {entry.title}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-mobile-muted)" }}>{entry.time}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green-mobile)", flexShrink: 0 }}>{entry.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}
