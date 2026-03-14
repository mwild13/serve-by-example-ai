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

const scenario =
  "A guest approaches the bar while you are finishing another drink. How do you acknowledge them?";

export default function DemoPage() {
  const [userResponse, setUserResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, userResponse }),
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
              Respond as if you were working behind the bar, then see how the AI
              evaluates your answer.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="demo-panel">
              <p className="demo-label">Scenario</p>
              <p className="demo-scenario">{scenario}</p>

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
