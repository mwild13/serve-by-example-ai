"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type ProgressOverviewProps = {
  displayName: string;
  plan: string;
};

type ModuleSummary = {
  id: number;
  title: string;
  category: "technical" | "service" | "compliance";
  mastered: boolean;
  attempted: boolean;
};

type TrainingData = {
  modules: ModuleSummary[];
  reviewDue: number;
};

const EMPTY: TrainingData = { modules: [], reviewDue: 0 };

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  service: "Service",
  compliance: "Compliance",
};

const CATEGORY_CERT_LABELS: Record<string, string> = {
  technical: "Technical Specialist",
  service: "Service Expert",
  compliance: "Compliance Ready",
};

const CATEGORY_COACH: Record<string, string[]> = {
  technical: [
    "Acknowledge guests within 3 seconds of them reaching the bar.",
    "Name the spirit, the modifier, and the garnish when describing a cocktail.",
    "Recover a missed order gracefully — acknowledge, apologise, deliver.",
  ],
  service: [
    "Offer one premium alternative per order — even when not asked.",
    "Lead with flavour language, not price, when recommending upgrades.",
    "Close every recommendation with a confident 'Would you like to try that?'",
  ],
  compliance: [
    "When reassigning tasks, name the person and the specific job out loud.",
    "Give one piece of specific, observable feedback after every shift.",
    "Pre-brief your team on the top 2 risks before a busy service starts.",
  ],
};

export default function ProgressOverview({ displayName, plan }: ProgressOverviewProps) {
  const [data, setData] = useState<TrainingData>(EMPTY);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const r = await fetch("/api/training/progress", {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        });
        const res = await r.json();

        if (res.allModules && res.moduleProgress) {
          const modules: ModuleSummary[] = (res.allModules as { id: number; title: string; category: string }[]).map((m) => {
            const p = res.moduleProgress[m.id] ?? { scenariosAttempted: 0, scenariosMastered: 0 };
            return {
              id: m.id,
              title: m.title,
              category: m.category as "technical" | "service" | "compliance",
              mastered: (p.scenariosMastered ?? 0) >= 1,
              attempted: (p.scenariosAttempted ?? 0) > 0,
            };
          });
          setData({
            modules,
            reviewDue: Array.isArray(res.reviewQueue) ? res.reviewQueue.length : 0,
          });
        }
      } catch {
        // non-critical
      }
    }
    void load();
  }, []);

  const masteredCount = data.modules.filter((m) => m.mastered).length;
  const totalCount = data.modules.length || 20;

  const categoryGroups: Record<string, ModuleSummary[]> = {
    technical: data.modules.filter((m) => m.category === "technical"),
    service: data.modules.filter((m) => m.category === "service"),
    compliance: data.modules.filter((m) => m.category === "compliance"),
  };

  const categoryCerts = (["technical", "service", "compliance"] as const).map((cat) => ({
    category: cat,
    label: CATEGORY_CERT_LABELS[cat],
    mastered: categoryGroups[cat].filter((m) => m.mastered).length,
    total: categoryGroups[cat].length,
    certified: categoryGroups[cat].length > 0 && categoryGroups[cat].every((m) => m.mastered),
  }));

  const certifiedCategories = categoryCerts.filter((c) => c.certified).length;

  const weakestCategory = (["technical", "service", "compliance"] as const).reduce(
    (weakest, cat) => {
      const wLen = categoryGroups[weakest].length;
      const cLen = categoryGroups[cat].length;
      const wPct = wLen > 0 ? categoryGroups[weakest].filter((m) => m.mastered).length / wLen : 1;
      const cPct = cLen > 0 ? categoryGroups[cat].filter((m) => m.mastered).length / cLen : 1;
      return cPct < wPct ? cat : weakest;
    },
    "technical" as "technical" | "service" | "compliance",
  );

  const COACH_COMMANDS = CATEGORY_COACH[weakestCategory];

  const recommendedNext =
    masteredCount === 0
      ? "Start with Module 1: Pouring the Perfect Beer — it's the fastest way to build your foundation."
      : masteredCount === totalCount
      ? "All modules mastered. Run Arena sessions to stay sharp."
      : `Focus on ${CATEGORY_LABELS[weakestCategory]} modules — ${categoryGroups[weakestCategory].filter((m) => m.mastered).length}/${categoryGroups[weakestCategory].length} mastered so far.`;

  const highlights: string[] = [];
  if (masteredCount === 0) {
    highlights.push("Complete your first module verify to start tracking wins here.");
  } else {
    highlights.push(`${masteredCount} module${masteredCount !== 1 ? "s" : ""} mastered — keep going.`);
    for (const c of categoryCerts) {
      if (c.certified) highlights.push(`${c.label} certification earned.`);
      else if (c.mastered > 0) highlights.push(`${c.mastered}/${c.total} ${CATEGORY_LABELS[c.category]} modules done.`);
    }
  }

  return (
    <div className="progress-overview">
      <div className="progress-hero">
        <div>
          <span className="eyebrow">How I&rsquo;m improving</span>
          <h1>{displayName}&rsquo;s training momentum</h1>
          <p>
            Real movement, not just numbers.
            {plan === "free"
              ? " Free access shows your baseline — upgrade to unlock deeper coaching."
              : " Your paid plan prioritises the highest-impact scenarios first."}
          </p>
        </div>
        <div className="progress-next-card">
          <span className="progress-next-label">Recommended next session</span>
          <strong>{recommendedNext}</strong>
          <p>
            {masteredCount === 0
              ? "Complete a module verify to unlock personalised training recommendations."
              : `${masteredCount} of ${totalCount} modules mastered. Keep going.`}
          </p>
        </div>
      </div>

      <div style={{
        background: "#f5f3ee",
        borderRadius: 12,
        padding: "18px 24px",
        marginBottom: 24,
        border: "1.5px solid #e5e1d8",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <strong style={{
            fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#0B2B1E",
          }}>
            Total Mastery
          </strong>
          <span style={{
            fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
            fontSize: "0.8rem",
            color: "#6b6860",
          }}>
            {masteredCount}/{totalCount} modules mastered
          </span>
        </div>
        <div style={{ background: "#e5e1d8", borderRadius: 6, height: 8, overflow: "hidden" }}>
          <div style={{
            background: "#0B2B1E",
            height: "100%",
            width: `${Math.round((masteredCount / totalCount) * 100)}%`,
            borderRadius: 6,
            transition: "width 0.4s ease",
          }} />
        </div>
        <p style={{
          margin: "8px 0 0",
          fontSize: "0.75rem",
          color: "#a39e95",
          fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}>
          {masteredCount === 0
            ? "Complete and verify each module to track your mastery."
            : masteredCount === totalCount
            ? "All modules mastered — full mastery achieved."
            : `${totalCount - masteredCount} module${totalCount - masteredCount !== 1 ? "s" : ""} remaining.`}
        </p>
      </div>

      <div className="progress-metric-grid">
        <article className="progress-metric-card sbe-momentum-card">
          <span className="sbe-momentum-icon">◈</span>
          <strong className="progress-metric-value">{masteredCount}/{totalCount} mastered</strong>
          <p>Modules verified across all 3 training categories.</p>
        </article>
        <article className="progress-metric-card sbe-momentum-card">
          <span className="sbe-momentum-icon">↑</span>
          <strong className="progress-metric-value">{certifiedCategories}/3 categories</strong>
          <p>Technical, Service, and Compliance certification status.</p>
        </article>
        <article className="progress-metric-card sbe-momentum-card">
          <span className="sbe-momentum-icon">→</span>
          <strong className="progress-metric-value">
            {data.reviewDue > 0
              ? `${data.reviewDue} review${data.reviewDue !== 1 ? "s" : ""} due`
              : `${CATEGORY_LABELS[weakestCategory]} focus`}
          </strong>
          <p>
            {data.reviewDue > 0
              ? "Spaced repetition items ready for review."
              : "Your weakest category — prioritise these modules."}
          </p>
        </article>
      </div>

      <div className="progress-layout">
        <section className="progress-panel">
          <div className="progress-panel-header">
            <h2>Module mastery</h2>
            <span>Pass each module verify to mark as mastered</span>
          </div>

          <div className="progress-module-list">
            {(["technical", "service", "compliance"] as const).map((cat) => (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: "0.73rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#6b6860",
                  marginBottom: 8,
                  fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                }}>
                  {CATEGORY_LABELS[cat]}
                </div>
                {categoryGroups[cat].map((module) => (
                  <div key={module.id} className="progress-module-item" style={{ marginBottom: 8 }}>
                    <div className="progress-module-top">
                      <strong style={{ fontSize: "0.85rem" }}>{module.title}</strong>
                      <span className="progress-status-chip">
                        {module.mastered ? "Mastered" : module.attempted ? "In progress" : "Not started"}
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: module.mastered ? "100%" : "0%", background: module.mastered ? "#0B2B1E" : undefined }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="progress-panel">
          <div className="progress-panel-header">
            <h2>Category Certifications</h2>
            <span>Master all modules in a category to certify</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 10 }}>
              {categoryCerts.map((cert) => (
                <div
                  key={cert.category}
                  style={{
                    background: cert.certified ? "#0B2B1E" : "#f5f3ee",
                    borderRadius: 10,
                    padding: "18px 12px",
                    textAlign: "center",
                    border: cert.certified ? "none" : "1.5px solid #e5e1d8",
                  }}
                >
                  <div style={{
                    fontSize: 26,
                    lineHeight: 1,
                    marginBottom: 8,
                    color: cert.certified ? "#a3e635" : "#c9c4bb",
                    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}>
                    {cert.certified ? "★" : "–"}
                  </div>
                  <strong style={{
                    display: "block",
                    fontSize: "0.76rem",
                    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                    fontWeight: 600,
                    color: cert.certified ? "#fff" : "#5a5650",
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}>
                    {cert.label}
                  </strong>
                  <span style={{
                    fontSize: "0.68rem",
                    color: cert.certified ? "rgba(255,255,255,0.6)" : "#a39e95",
                    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif",
                  }}>
                    {cert.certified ? "Certified" : `${cert.mastered}/${cert.total} mastered`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="progress-panel progress-panel-stack">
          <div className="progress-panel-block">
            <div className="progress-panel-header">
              <h2>Coach focus for your next shift</h2>
              <span>Based on your weakest category: {CATEGORY_LABELS[weakestCategory]}</span>
            </div>
            <ul className="sbe-command-list">
              {COACH_COMMANDS.map((cmd) => (
                <li key={cmd}>
                  <span className="sbe-command-arrow">→</span>
                  {cmd}
                </li>
              ))}
            </ul>
          </div>

          <div className="progress-panel-block">
            <div className="progress-panel-header">
              <h2>Progress highlights</h2>
              <span>Based on your training so far</span>
            </div>
            <ul className="progress-list">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
