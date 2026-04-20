"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ModuleId = "bartending" | "sales" | "management";

type PillOption = {
  intent: string;
  text: string;
  positive: boolean;
};

type DemoScenario = {
  id: ModuleId;
  category: string;
  title: string;
  prompt: string;
  pills: PillOption[];
};

type EvaluationResult = {
  communication: number;
  hospitalityBehaviour: number;
  problemSolving: number;
  professionalism: number;
  guestExperience: number;
  overallScore: number;
  strengths: string;
  improvement: string;
  improvedResponse: string;
};

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "bartending",
    category: "Bartending",
    title: "First guest acknowledgment",
    prompt:
      "A guest approaches the bar while you are finishing another drink. How do you acknowledge them?",
    pills: [
      {
        intent: "Acknowledge immediately",
        text: "Make eye contact and say 'Be right with you' to show the guest they have been seen",
        positive: true,
      },
      {
        intent: "Finish efficiently",
        text: "Complete the current drink quickly without rushing, then give the guest full attention",
        positive: true,
      },
      {
        intent: "Ignore until free",
        text: "Continue the task and look up only when the current drink is completely finished",
        positive: false,
      },
    ],
  },
  {
    id: "sales",
    category: "Sales",
    title: "Steak pairing recommendation",
    prompt:
      "A guest asks what cocktail you would recommend with their steak. How do you respond?",
    pills: [
      {
        intent: "Pair by flavour",
        text: "Suggest a bold spirit-forward cocktail that complements the richness of red meat",
        positive: true,
      },
      {
        intent: "Ask before suggesting",
        text: "Ask if they prefer sweet, dry or bitter to tailor the recommendation personally",
        positive: true,
      },
      {
        intent: "Name the most expensive",
        text: "Immediately recommend the priciest option without reading the guest's preferences",
        positive: false,
      },
    ],
  },
  {
    id: "management",
    category: "Management",
    title: "Short-notice sick call",
    prompt:
      "A staff member calls in sick 30 minutes before a busy Friday shift. What do you do next?",
    pills: [
      {
        intent: "Contact on-call staff",
        text: "Call available staff immediately with calm urgency and offer a shift incentive",
        positive: true,
      },
      {
        intent: "Reassign and brief",
        text: "Redistribute sections across the team and communicate changes clearly before doors open",
        positive: true,
      },
      {
        intent: "Wait and hope",
        text: "Assume the shift will work itself out without taking any immediate action",
        positive: false,
      },
    ],
  },
];

const SCORE_DIMENSIONS = [
  { key: "communication" as keyof EvaluationResult, label: "Communication" },
  { key: "hospitalityBehaviour" as keyof EvaluationResult, label: "Hospitality" },
  { key: "problemSolving" as keyof EvaluationResult, label: "Problem solving" },
  { key: "professionalism" as keyof EvaluationResult, label: "Professionalism" },
  { key: "guestExperience" as keyof EvaluationResult, label: "Guest experience" },
] as const;

export default function DemoPage() {
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>("bartending");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

  // Derived — never reset back to default because activeModuleId is the single source of truth
  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeModuleId)!;

  function selectModule(id: ModuleId) {
    setActiveModuleId(id);
    setResponse("");
    setResult(null);
    setError("");
  }

  function applyPill(text: string) {
    setResponse(text);
    setResult(null);
    setError("");
  }

  function handleSkip() {
    const idx = DEMO_SCENARIOS.findIndex((s) => s.id === activeModuleId);
    const next = DEMO_SCENARIOS[(idx + 1) % DEMO_SCENARIOS.length];
    selectModule(next.id);
  }

  async function handleSubmit() {
    if (!response.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: activeScenario.prompt, userResponse: response }),
      });
      const data = await res.json() as EvaluationResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to the evaluation service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">Interactive demo</div>
            <h1>Try a real AI hospitality scenario</h1>
            <p className="inner-hero-sub">
              Pick a module, respond like you are on shift, then see how the AI evaluates your answer.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">

            {/* Module picker */}
            <div className="demo-scenario-picker" style={{ marginBottom: 32 }}>
              {DEMO_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={`demo-scenario-chip${activeModuleId === scenario.id ? " active" : ""}`}
                  onClick={() => selectModule(scenario.id)}
                >
                  <span className="demo-scenario-chip-category">{scenario.category}</span>
                  <span>{scenario.title}</span>
                </button>
              ))}
            </div>

            {/* Training-style scenario panel */}
            {!result && (
              <div className="trainer-panel" key={activeModuleId}>
                <div className="trainer-scenario">
                  <span className="trainer-label">{activeScenario.category} scenario</span>
                  <p>{activeScenario.prompt}</p>
                </div>

                <div className="trainer-pills">
                  <span className="trainer-hint">Choose an approach — or write your own response below</span>
                  <div className="chat-actions sbe-intent-pills">
                    {activeScenario.pills.map((pill) => (
                      <button
                        key={pill.intent}
                        type="button"
                        className={`sbe-intent-pill${response === pill.text ? " sbe-intent-pill-active" : ""}${!pill.positive ? " sbe-intent-pill-negative" : ""}`}
                        onClick={() => applyPill(pill.text)}
                      >
                        <span className="sbe-intent-icon">{pill.positive ? "✅" : "❌"}</span>
                        {pill.intent}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="trainer-input-row">
                  <textarea
                    className="trainer-textarea"
                    placeholder="Write your full response here…"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void handleSubmit();
                    }}
                    rows={4}
                  />
                  <div className="trainer-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => void handleSubmit()}
                      disabled={loading || !response.trim()}
                      type="button"
                    >
                      {loading ? "Evaluating…" : "Check my response"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleSkip}
                      type="button"
                    >
                      Skip →
                    </button>
                  </div>
                </div>

                {error && <div className="trainer-error">{error}</div>}
              </div>
            )}

            {/* AI Result — same style as the real training */}
            {result && (() => {
              const weakest = [...SCORE_DIMENSIONS].sort(
                (a, b) => (result[a.key] as number) - (result[b.key] as number),
              )[0];
              const strongest = [...SCORE_DIMENSIONS].sort(
                (a, b) => (result[b.key] as number) - (result[a.key] as number),
              )[0];
              return (
                <>
                  <div className="trainer-result">
                    <div className="sbe-score-hero">
                      <div className="sbe-score-number">
                        <span className="sbe-score-val">{result.overallScore}</span>
                        <span className="sbe-score-denom">/25</span>
                      </div>
                      <span className="sbe-score-delta sbe-delta-first">Demo evaluation</span>
                    </div>

                    <div className="sbe-dimension-list">
                      {SCORE_DIMENSIONS.map(({ key, label }) => {
                        const val = result[key] as number;
                        const icon = val >= 4 ? "✔" : val === 3 ? "⚠" : "✖";
                        const cls =
                          val >= 4 ? "sbe-dim-good" : val === 3 ? "sbe-dim-warn" : "sbe-dim-miss";
                        return (
                          <div key={key} className={`sbe-dimension-row ${cls}`}>
                            <span className="sbe-dim-icon">{icon}</span>
                            <span className="sbe-dim-label">{label}</span>
                            <span className="sbe-dim-score">{val}/5</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="sbe-coach-tip">
                      <strong>Coach focus for your next attempt</strong>
                      <p>→ {result.improvement}</p>
                    </div>

                    <details className="sbe-full-feedback">
                      <summary>See full feedback</summary>
                      <div className="trainer-feedback">
                        <div className="trainer-feedback-block trainer-feedback-good">
                          <strong>✔ {strongest.label} — strength</strong>
                          <p>{result.strengths}</p>
                        </div>
                        <div className="trainer-feedback-block trainer-feedback-improve">
                          <strong>✖ {weakest.label} — missed opportunity</strong>
                          <p>{result.improvement}</p>
                        </div>
                        <div className="trainer-feedback-block trainer-feedback-example">
                          <strong>Stronger response</strong>
                          <p>{result.improvedResponse}</p>
                        </div>
                      </div>
                    </details>

                    <div className="trainer-after">
                      <button
                        className="btn btn-secondary"
                        onClick={handleSkip}
                        type="button"
                      >
                        Try another module →
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => { setResult(null); setResponse(""); }}
                        type="button"
                      >
                        Try again
                      </button>
                    </div>
                  </div>

                  <div className="demo-cta-panel">
                    <div className="demo-cta-emoji">🎯</div>
                    <h2 className="demo-cta-heading">Like what you see?</h2>
                    <p className="demo-cta-copy">
                      This is just a taste. A full account gives you unlimited scenarios, a personalised
                      AI coach, progress tracking, and leaderboard rankings — all built for hospitality.
                    </p>
                    <div className="demo-cta-actions">
                      <a href="/login" className="btn btn-primary btn-lg">Create free account ✨</a>
                      <a href="/pricing" className="btn btn-outline btn-lg">See pricing</a>
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
