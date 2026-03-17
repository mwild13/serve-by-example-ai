"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const DEMO_SCENARIOS = [
  {
    id: "bartending",
    category: "Bartending",
    title: "First guest acknowledgment",
    prompt:
      "A guest approaches the bar while you are finishing another drink. How do you acknowledge them?",
  },
  {
    id: "sales",
    category: "Sales",
    title: "Steak pairing recommendation",
    prompt:
      "A guest asks what cocktail you would recommend with their steak. How do you respond?",
  },
  {
    id: "management",
    category: "Management",
    title: "Short-notice sick call",
    prompt:
      "A staff member calls in sick 30 minutes before a busy Friday shift. What do you do next?",
  },
] as const;

export default function DemoPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<
    (typeof DEMO_SCENARIOS)[number]["id"]
  >("bartending");
  const [userResponse, setUserResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

  const activeScenario =
    DEMO_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ??
    DEMO_SCENARIOS[0];

  function selectScenario(scenarioId: (typeof DEMO_SCENARIOS)[number]["id"]) {
    setSelectedScenarioId(scenarioId);
    setUserResponse("");
    setResult(null);
    setError("");
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: activeScenario.prompt, userResponse }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect to the evaluation service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">Interactive demo</div>
            <h1>Try a real AI hospitality scenario</h1>
            <p className="inner-hero-sub">
              Pick a bartending, sales or management prompt, respond like you are
              on shift, then see how the AI evaluates your answer.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="demo-panel">
              <div className="demo-scenario-picker">
                {DEMO_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    className={`demo-scenario-chip${selectedScenarioId === scenario.id ? " active" : ""}`}
                    onClick={() => selectScenario(scenario.id)}
                  >
                    <span className="demo-scenario-chip-category">{scenario.category}</span>
                    <span>{scenario.title}</span>
                  </button>
                ))}
              </div>

              <p className="demo-label">Scenario</p>
              <p className="demo-scenario">{activeScenario.prompt}</p>

              <label className="demo-label" style={{ marginTop: 32 }}>
                Your response
              </label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type how you would respond to the guest…"
                className="demo-textarea"
              />

              <button
                onClick={handleSubmit}
                disabled={loading || !userResponse.trim()}
                className="btn btn-primary btn-lg"
                style={{ marginTop: 20 }}
              >
                {loading ? "Evaluating…" : "Submit response"}
              </button>

              {error && <div className="demo-error">{error}</div>}
            </div>

            {result && (
              <>
              <div className="demo-panel" style={{ marginTop: 40 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.6rem",
                    marginBottom: 24,
                  }}
                >
                  AI Evaluation
                </h2>

                <div className="demo-scores">
                  <ScoreCard
                    label="Communication"
                    value={result.communication}
                  />
                  <ScoreCard
                    label="Hospitality Behaviour"
                    value={result.hospitalityBehaviour}
                  />
                  <ScoreCard
                    label="Problem Solving"
                    value={result.problemSolving}
                  />
                  <ScoreCard
                    label="Professionalism"
                    value={result.professionalism}
                  />
                  <ScoreCard
                    label="Guest Experience"
                    value={result.guestExperience}
                  />
                  <div className="demo-score-card demo-score-total">
                    <span className="demo-score-label">Overall Score</span>
                    <span className="demo-score-value">
                      {result.overallScore}/25
                    </span>
                  </div>
                </div>

                <div className="demo-feedback">
                  <div>
                    <p className="demo-label">Strengths</p>
                    <p className="demo-feedback-text">{result.strengths}</p>
                  </div>
                  <div>
                    <p className="demo-label">Improvement</p>
                    <p className="demo-feedback-text">{result.improvement}</p>
                  </div>
                  <div>
                    <p className="demo-label">Improved Response</p>
                    <p className="demo-feedback-text">
                      {result.improvedResponse}
                    </p>
                  </div>
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
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="demo-score-card">
      <span className="demo-score-label">{label}</span>
      <span className="demo-score-value">{value}/5</span>
    </div>
  );
}
