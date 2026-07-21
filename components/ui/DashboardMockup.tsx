const NAV = [
  { section: "TRAINING", items: ["Programs", "Scenarios"] },
  { section: "PEOPLE", items: ["Staff", "Teams", "Roles & Permissions"] },
  { section: "OPERATIONS", items: ["Inventory", "Menu Items", "Compliance"] },
  { section: "PERFORMANCE", items: ["Analytics", "Reports", "Leaderboards", "Notifications"] },
  { section: "AI COACH", items: ["Ask AI Coach", "Predictive Insights"] },
  { section: "ADMIN", items: ["Settings", "Billing", "Sign out"] },
];

const STATS = [
  { label: "TOTAL STAFF", value: "18", sub: "Current roster", trend: null },
  { label: "ACTIVE THIS WEEK", value: "14", sub: "Staff engaged in training", trend: "22%", up: true },
  { label: "TRAINING COMPLETION", value: "71%", sub: "Across all modules", trend: "18%", up: true },
  { label: "AVG SCENARIO SCORE", value: "82%", sub: "Service + sales + product", trend: "12%", up: true },
  { label: "UPSELL PERFORMANCE", value: "38%", sub: "Revenue impact lever", trend: "24%", up: true },
  { label: "PRIMARY VENUE", value: "The Anchor", sub: "Switches all manager views", trend: null },
];

const INSIGHTS = [
  { icon: "↑", text: "Training completion up 18% this week. 14 of 18 staff active, strongest engagement week on record.", color: "var(--status-success)", bg: "var(--status-success-bg)", border: "var(--status-success-border)" },
  { icon: "→", text: "Upsell performance at 38%. 3 staff above 50%. Recommend them as team sales mentors this shift.", color: "var(--status-info)", bg: "var(--status-info-bg)", border: "var(--status-info-border)" },
  { icon: "●", text: "Alex completed all 4 bartending stages with a 91% avg score. Ready for floor leadership.", color: "var(--status-achievement)", bg: "var(--status-achievement-bg)", border: "var(--status-achievement-border)" },
];

const SHIFTS = [
  { time: "11:00", label: "Opening Bar · Floor" },
  { time: "15:00", label: "Afternoon · All" },
  { time: "17:00", label: "Evening Service · Bar" },
  { time: "20:00", label: "Late · Bar + Floor" },
];

const TEAM_SUMMARY = [
  { label: "TOTAL STAFF", value: "18" },
  { label: "ACTIVE TODAY", value: "11" },
  { label: "NEEDS ATTENTION", value: "2" },
  { label: "INACTIVE", value: "5" },
];

export default function DashboardMockup() {
  return (
    <div className="dashboard-mockup-outer" style={{
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
      border: "1px solid var(--line)",
      display: "flex",
      background: "var(--surface)",
      fontSize: "11px",
      lineHeight: 1.4,
      minHeight: "560px",
    }}>

      {/* ── Left Sidebar ─────────────────────────── */}
      <div style={{ width: "180px", background: "var(--green)", color: "white", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "14px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--green-mid)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "9px", flexShrink: 0 }}>SBE</div>
            <span style={{ fontWeight: 700, fontSize: "10.5px", lineHeight: 1.2 }}>Serve By Example</span>
          </div>
        </div>

        {/* WORKSPACE - active item */}
        <div style={{ padding: "10px 8px 4px" }}>
          <div style={{ fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", padding: "0 6px 4px", textTransform: "uppercase" }}>WORKSPACE</div>
          <div style={{ padding: "6px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.14)", marginBottom: "1px", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "7px", fontSize: "10.5px" }}>
            <span style={{ width: "13px", height: "13px", background: "rgba(255,255,255,0.25)", borderRadius: "3px", flexShrink: 0 }} />
            Overview
          </div>
        </div>

        {/* Nav sections */}
        <div style={{ padding: "0 8px", flex: 1, overflow: "hidden" }}>
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div style={{ fontSize: "7.5px", fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em", padding: "7px 6px 3px", textTransform: "uppercase" }}>{section}</div>
              {items.map(item => (
                <div key={item} style={{ padding: "4px 8px", color: "rgba(255,255,255,0.68)", display: "flex", alignItems: "center", gap: "6px", borderRadius: "5px", fontSize: "10px" }}>
                  <span style={{ width: "10px", height: "10px", background: "rgba(255,255,255,0.12)", borderRadius: "2px", flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--viz-neutral-light)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div>
            <h3 style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: 800, color: "var(--text)" }}>Venue performance mission control</h3>
            <p style={{ margin: 0, fontSize: "9.5px", color: "var(--text-muted)" }}>Daily operational visibility for training, service quality, sales performance and venue consistency.</p>
          </div>
          <div style={{ background: "var(--green)", color: "white", borderRadius: "10px", padding: "10px 14px", textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "7.5px", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.7, textTransform: "uppercase", marginBottom: "3px" }}>Venue Health Score</div>
            <div style={{ fontSize: "22px", fontWeight: 900, lineHeight: 1 }}>82<span style={{ fontSize: "13px", opacity: 0.8 }}>/100</span></div>
            <div style={{ fontSize: "8px", opacity: 0.65, marginTop: "3px" }}>Service 28 | Product 27 | Sales 27</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ padding: "7px 20px", borderBottom: "1px solid var(--viz-neutral-light)", display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "7.5px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginRight: "2px" }}>Quick Actions</span>
          {["+ Add staff", "+ Assign training", "+ Create program", "+ Add inventory"].map(action => (
            <div key={action} style={{ padding: "3px 9px", background: "var(--surface-raised)", border: "1px solid var(--viz-neutral-light)", borderRadius: "5px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "9.5px" }}>{action}</div>
          ))}
        </div>

        {/* Live data banner */}
        <div style={{ margin: "10px 20px 0", padding: "8px 12px", background: "var(--status-success-bg)", border: "1.5px solid var(--status-success-border)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--status-success)", flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 700, color: "var(--green)", fontSize: "9.5px" }}>Live manager data connected</span>
            <span style={{ color: "var(--green-deep)", fontSize: "8.5px", marginLeft: "6px" }}>Staff, inventory and training programs syncing in real time.</span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ padding: "10px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "7px" }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ padding: "9px 11px", background: "var(--surface-raised)", border: "1px solid var(--viz-neutral-light)", borderRadius: "8px" }}>
              <div style={{ fontSize: "7.5px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "3px" }}>{stat.label}</div>
              <div style={{ fontSize: "17px", fontWeight: 900, color: "var(--text)", lineHeight: 1.1, marginBottom: "3px" }}>{stat.value}</div>
              {stat.trend && (
                <div style={{ marginBottom: "2px" }}>
                  <span style={{ fontSize: "7.5px", fontWeight: 800, color: stat.up ? "var(--status-success)" : "var(--status-critical)", background: stat.up ? "var(--status-success-bg)" : "var(--status-error-bg)", borderRadius: "3px", padding: "1px 4px" }}>
                    {stat.up ? "↑" : "↓"} {stat.trend} THIS WEEK
                  </span>
                </div>
              )}
              <div style={{ fontSize: "8.5px", color: "var(--text-muted)" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Manager Insights */}
        <div style={{ padding: "0 20px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontWeight: 800, fontSize: "11.5px", color: "var(--text)" }}>Manager insights</span>
            <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>Auto-generated from staff data</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {INSIGHTS.map((insight, i) => (
              <div key={i} style={{ padding: "7px 11px", background: insight.bg, border: `1.5px solid ${insight.border}`, borderRadius: "7px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: insight.color, fontWeight: 700, fontSize: "10px", flexShrink: 0, marginTop: "1px" }}>{insight.icon}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "9px", lineHeight: 1.5 }}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ borderTop: "1px solid var(--viz-neutral-light)", display: "flex", gap: "0", marginTop: "auto" }}>
          {["Snapshot", "Staff Performance", "Inventory Intel"].map((tab, i) => (
            <div key={tab} style={{ padding: "9px 16px", fontSize: "10px", fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "var(--green)" : "var(--text-muted)", borderBottom: i === 0 ? "2px solid var(--green)" : "2px solid transparent", cursor: "default" }}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ──────────────────────────── */}
      <div style={{ width: "196px", borderLeft: "1px solid var(--viz-neutral-light)", display: "flex", flexDirection: "column", flexShrink: 0 }}>

        {/* Team Summary */}
        <div style={{ padding: "14px 13px 10px", borderBottom: "1px solid var(--viz-neutral-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontWeight: 800, fontSize: "11px", color: "var(--text)" }}>Team summary</span>
            <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>Today</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
            {TEAM_SUMMARY.map(stat => (
              <div key={stat.label} style={{ padding: "6px 8px", background: "var(--surface)", border: "1px solid var(--viz-neutral-light)", borderRadius: "6px" }}>
                <div style={{ fontSize: "7px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2px" }}>{stat.label}</div>
                <div style={{ fontSize: "15px", fontWeight: 900, color: "var(--text)" }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Shifts */}
        <div style={{ padding: "12px 13px 10px", borderBottom: "1px solid var(--viz-neutral-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
            <span style={{ fontWeight: 800, fontSize: "11px", color: "var(--text)" }}>Upcoming shifts</span>
            <span style={{ fontSize: "8px", color: "var(--text-muted)" }}>Today</span>
          </div>
          {SHIFTS.map(shift => (
            <div key={shift.time} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "4px 7px", background: "var(--surface)", borderRadius: "5px", marginBottom: "3px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--green)", width: "34px", flexShrink: 0 }}>{shift.time}</span>
              <span style={{ fontSize: "9px", color: "var(--text-secondary)" }}>{shift.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ padding: "12px 13px" }}>
          <span style={{ fontWeight: 800, fontSize: "11px", color: "var(--text)", display: "block", marginBottom: "7px" }}>Quick actions</span>
          {["→ View full roster", "→ Export staff list", "→ Bulk assign training"].map(action => (
            <div key={action} style={{ fontSize: "9px", color: "var(--text-secondary)", padding: "5px 0", borderBottom: "1px solid var(--border-subtle)", fontWeight: 500 }}>{action}</div>
          ))}
        </div>

        {/* AI Coach button */}
        <div style={{ padding: "10px 13px", marginTop: "auto" }}>
          <div style={{ background: "var(--green)", color: "white", borderRadius: "8px", padding: "8px 0", textAlign: "center", fontWeight: 700, fontSize: "10px" }}>AI Coach</div>
        </div>
      </div>

    </div>
  );
}
