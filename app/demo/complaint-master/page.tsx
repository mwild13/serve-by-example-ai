"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Scenario = {
  id: string;
  title: string;
  situation: string;
  guestLine: string;
};

type EvalResult = {
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

const SCENARIOS: Scenario[] = [
  {
    id: "wrong-order",
    title: "Wrong order delivered",
    situation:
      "A table of four has been waiting 35 minutes. When the food arrives, one guest's steak is cooked well-done instead of medium-rare as ordered. The guest is visibly annoyed.",
    guestLine:
      '"This isn\'t what I ordered. I specifically asked for medium-rare and this is completely overcooked. This is ridiculous."',
  },
  {
    id: "long-wait",
    title: "Excessive wait at the bar",
    situation:
      "A guest has been waiting at the bar for nearly 10 minutes on a moderately busy Friday evening. They are now flagging you down with clear frustration.",
    guestLine:
      '"Excuse me — I\'ve been standing here for ages. Does anyone actually work at this bar?"',
  },
  {
    id: "noisy-neighbours",
    title: "Disruptive table nearby",
    situation:
      "A couple has approached you quietly to complain that the table next to them has been excessively loud and rude throughout their dinner, affecting their experience.",
    guestLine:
      '"We came here for a nice evening and those people have ruined it. We\'re really not happy and we feel like nothing has been done about it."',
  },
];

type Stage = "intro" | "practice" | "result" | "complete";

export default function ComplaintMasterPage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const scenario = SCENARIOS[scenarioIndex];
  const isLastScenario = scenarioIndex === SCENARIOS.length - 1;

  async function handleSubmit() {
    if (response.trim().length < 10) return;
    setLoading(true);
    setError("");

    try {
      const fullScenario = `${scenario.situation}\n\nGuest says: ${scenario.guestLine}`;
      const res = await fetch("/api/demo/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: fullScenario, userResponse: response.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setResult(data as EvalResult);
      setScores((prev) => [...prev, data.overallScore]);
      setStage("result");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (isLastScenario) {
      setStage("complete");
    } else {
      setScenarioIndex((i) => i + 1);
      setResponse("");
      setResult(null);
      setError("");
      setStage("practice");
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setEmailSending(false);
    setEmailSent(true);
  }

  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  function scoreLabel(score: number) {
    if (score >= 22) return "Excellent";
    if (score >= 17) return "Good";
    if (score >= 12) return "Developing";
    return "Needs Work";
  }

  function scoreColour(score: number) {
    if (score >= 22) return "var(--green)";
    if (score >= 17) return "var(--gold)";
    return "var(--text-soft)";
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="inner-hero cm-hero">
          <div className="container">
            <span className="eyebrow">Free Training Tool</span>
            <h1>Complaint Master</h1>
            <p className="inner-hero-sub">
              Practice turning unhappy guests into loyal ones. Three real hospitality complaint
              scenarios, scored instantly by AI — in Australian English, the way it happens on the
              floor.
            </p>
          </div>
        </section>

        <section className="section cm-section">
          <div className="container cm-container">
            {/* ── Intro ── */}
            {stage === "intro" && (
              <div className="cm-intro-card">
                <div className="cm-intro-meta">
                  <div className="cm-intro-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    3 scenarios
                  </div>
                  <div className="cm-intro-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    5 minutes
                  </div>
                  <div className="cm-intro-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    AI scored
                  </div>
                </div>
                <p className="cm-intro-body">
                  Each scenario puts you in a real service moment. Write your response as you would
                  say it on the floor — the AI evaluates you across five dimensions: communication,
                  hospitality behaviour, problem solving, professionalism, and guest experience.
                </p>
                <p className="cm-intro-note">No sign-up required. Free, forever.</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setStage("practice")}
                >
                  Start practising
                </button>
              </div>
            )}

            {/* ── Practice ── */}
            {stage === "practice" && (
              <div className="cm-practice">
                <div className="cm-progress">
                  {SCENARIOS.map((_, i) => (
                    <div
                      key={i}
                      className={`cm-progress-dot${i < scenarioIndex ? " cm-progress-dot-done" : ""}${i === scenarioIndex ? " cm-progress-dot-active" : ""}`}
                    />
                  ))}
                  <span className="cm-progress-label">
                    Scenario {scenarioIndex + 1} of {SCENARIOS.length}
                  </span>
                </div>

                <div className="cm-scenario-card">
                  <span className="eyebrow">{scenario.title}</span>
                  <p className="cm-situation">{scenario.situation}</p>
                  <blockquote className="cm-guest-line">{scenario.guestLine}</blockquote>
                </div>

                <label className="cm-response-label" htmlFor="cm-response">
                  How do you respond?
                </label>
                <textarea
                  id="cm-response"
                  className="cm-response-input"
                  placeholder="Write your response as you'd say it — don't overthink it, just respond naturally..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  maxLength={2000}
                />
                <div className="cm-char-count">{response.length} / 2000</div>

                {error && <p className="cm-error">{error}</p>}

                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading || response.trim().length < 10}
                >
                  {loading ? (
                    <>
                      <span className="drill-spinner" aria-hidden="true" />
                      Evaluating&hellip;
                    </>
                  ) : (
                    "Submit response"
                  )}
                </button>
              </div>
            )}

            {/* ── Result ── */}
            {stage === "result" && result && (
              <div className="cm-result">
                <div className="cm-result-score-row">
                  <div className="cm-result-score">
                    <span
                      className="cm-result-score-num"
                      style={{ color: scoreColour(result.overallScore) }}
                    >
                      {result.overallScore}
                    </span>
                    <span className="cm-result-score-denom">/25</span>
                  </div>
                  <div className="cm-result-score-label">
                    <strong>{scoreLabel(result.overallScore)}</strong>
                    <span>Scenario {scenarioIndex + 1} of {SCENARIOS.length}</span>
                  </div>
                </div>

                <div className="cm-result-dims">
                  {[
                    ["Communication", result.communication],
                    ["Hospitality Behaviour", result.hospitalityBehaviour],
                    ["Problem Solving", result.problemSolving],
                    ["Professionalism", result.professionalism],
                    ["Guest Experience", result.guestExperience],
                  ].map(([label, val]) => (
                    <div key={label as string} className="cm-result-dim">
                      <span className="cm-result-dim-label">{label as string}</span>
                      <div className="cm-result-dim-bar-track">
                        <div
                          className="cm-result-dim-bar-fill"
                          style={{ width: `${((val as number) / 5) * 100}%` }}
                        />
                      </div>
                      <span className="cm-result-dim-val">{val as number}/5</span>
                    </div>
                  ))}
                </div>

                <div className="cm-result-feedback">
                  <div className="cm-result-feedback-block">
                    <h4>What you did well</h4>
                    <p>{result.strengths}</p>
                  </div>
                  <div className="cm-result-feedback-block">
                    <h4>One improvement</h4>
                    <p>{result.improvement}</p>
                  </div>
                  <div className="cm-result-feedback-block cm-result-model">
                    <h4>Model response</h4>
                    <p>{result.improvedResponse}</p>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleNext}>
                  {isLastScenario ? "See my results" : "Next scenario"}
                </button>
              </div>
            )}

            {/* ── Complete ── */}
            {stage === "complete" && (
              <div className="cm-complete">
                <div className="cm-complete-score">
                  <span
                    className="cm-complete-score-num"
                    style={{ color: scoreColour(avgScore) }}
                  >
                    {avgScore}
                  </span>
                  <span className="cm-complete-score-label">avg / 25 across 3 scenarios</span>
                  <span className="cm-complete-score-grade">{scoreLabel(avgScore)}</span>
                </div>

                <p className="cm-complete-body">
                  {avgScore >= 20
                    ? "That&rsquo;s a strong result. You handle guest complaints with composure and care. On the Serve By Example platform, you&rsquo;d be competing near the top of the AI Arena leaderboard."
                    : avgScore >= 14
                    ? "Solid foundation. A bit more practice on structure and specificity will get your scores into the excellent range — and that&rsquo;s exactly what our full platform is built to deliver."
                    : "Complaint handling is one of the hardest skills in hospitality. The good news: it&rsquo;s entirely trainable. Our full platform has structured coaching paths that build these skills rapidly."}
                </p>

                <div className="cm-complete-cta-group">
                  <Link href="/demo" className="btn btn-primary btn-lg">
                    Try more scenarios on the full platform
                  </Link>
                  <Link href="/pricing" className="btn btn-secondary btn-lg">
                    Get full access
                  </Link>
                </div>

                <div className="cm-complete-email">
                  {emailSent ? (
                    <p className="cm-email-thanks">
                      Thanks — we&rsquo;ll send your score summary shortly.
                    </p>
                  ) : (
                    <form className="cm-email-form" onSubmit={handleEmailSubmit}>
                      <label htmlFor="cm-email" className="cm-email-label">
                        Email me my score summary
                      </label>
                      <div className="cm-email-row">
                        <input
                          id="cm-email"
                          type="email"
                          placeholder="you@yourvenue.com.au"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="roi-email-input"
                          required
                        />
                        <button
                          type="submit"
                          className="roi-email-btn"
                          disabled={emailSending}
                        >
                          {emailSending ? "Sending…" : "Send"}
                        </button>
                      </div>
                    </form>
                  )}
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
