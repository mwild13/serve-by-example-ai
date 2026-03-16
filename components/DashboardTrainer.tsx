"use client";

import { useState } from "react";

type Module = "bartending" | "sales" | "management";

type Scenario = {
  text: string;
  pills: string[];
};

const SCENARIOS: Record<Module, Scenario[]> = {
  bartending: [
    {
      text: "A guest approaches the bar while you are finishing another drink. How do you acknowledge them?",
      pills: ["Make eye contact and nod", "Say 'I'll be right with you'", "Hold up one finger and smile"],
    },
    {
      text: "A guest orders a Negroni but you're out of Campari. How do you handle this?",
      pills: ["Apologise and suggest an alternative", "Offer a similar bitter cocktail", "Ask what flavour profile they enjoy"],
    },
    {
      text: "Two guests are waiting and you notice one has an empty glass. What do you do first?",
      pills: ["Greet the waiting guest first", "Offer to refresh the empty glass", "Acknowledge both and multitask"],
    },
    {
      text: "A guest asks you to make their cocktail 'stronger'. How do you respond professionally?",
      pills: ["Explain the standard recipe", "Offer a spirit-forward alternative", "Ask what they felt was missing"],
    },
    {
      text: "You realise mid-pour that you've grabbed the wrong spirit. What do you do?",
      pills: ["Stop, discard and start again", "Tell the guest immediately", "Check before pouring in future"],
    },
  ],
  sales: [
    {
      text: "A customer says, 'I usually drink vodka soda — what would you recommend that's similar but a bit more premium?'",
      pills: ["Suggest a clean premium spirit", "Ask a taste question first", "Recommend based on style"],
    },
    {
      text: "A table of four is ordering cocktails. How do you naturally upsell to premium spirits without being pushy?",
      pills: ["Mention the top-shelf options naturally", "Describe the taste difference", "Let them ask first"],
    },
    {
      text: "A guest hesitates when you mention a $22 cocktail. How do you handle the price objection?",
      pills: ["Justify the quality and ingredients", "Offer a mid-range alternative", "Focus on the experience, not price"],
    },
    {
      text: "A couple finishes their dinner and hasn't ordered dessert drinks. How do you suggest them?",
      pills: ["Offer a dessert wine pairing", "Mention a signature digestif", "Ask if they'd like something sweet to finish"],
    },
    {
      text: "A guest is browsing the menu and looks unsure. What do you say to help them decide?",
      pills: ["Ask what mood they're in", "Share your personal recommendation", "Describe a popular choice"],
    },
  ],
  management: [
    {
      text: "A staff member calls in sick 30 minutes before a busy Friday shift. How do you respond?",
      pills: ["Call available staff immediately", "Redistribute tasks across the team", "Inform the team calmly and adjust"],
    },
    {
      text: "You notice a bartender is consistently slow during service. How do you address this?",
      pills: ["Have a private conversation", "Observe and identify the cause first", "Offer coaching and support"],
    },
    {
      text: "A guest complains loudly about slow service in front of other tables. What do you do?",
      pills: ["Calmly move the conversation aside", "Apologise and offer a resolution", "Acknowledge publicly and resolve quickly"],
    },
    {
      text: "Two staff members have a disagreement mid-shift. How do you handle it without disrupting service?",
      pills: ["Separate them and address later", "Step in immediately and de-escalate", "Assign them different sections"],
    },
    {
      text: "Your venue is falling short of weekly sales targets. How do you brief your team?",
      pills: ["Share the data transparently", "Focus on upselling opportunities", "Set a group goal with incentives"],
    },
  ],
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

const MODULE_META: Record<Module, { label: string; description: string; color: string }> = {
  bartending: {
    label: "Bartending Training",
    description: "Classic cocktails, service standards and bar knowledge.",
    color: "var(--green)",
  },
  sales: {
    label: "Sales Training",
    description: "Upselling, recommendations and guest communication.",
    color: "var(--gold)",
  },
  management: {
    label: "Management Training",
    description: "Leadership, standards, coaching and venue decisions.",
    color: "var(--green-mid)",
  },
};

export default function DashboardTrainer({ displayName }: { displayName: string }) {
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState("");

  const currentScenario = activeModule ? SCENARIOS[activeModule][scenarioIndex] : null;

  function selectModule(mod: Module) {
    setActiveModule(mod);
    setScenarioIndex(0);
    setResponse("");
    setResult(null);
    setError("");
  }

  function nextScenario() {
    if (!activeModule) return;
    const next = (scenarioIndex + 1) % SCENARIOS[activeModule].length;
    setScenarioIndex(next);
    setResponse("");
    setResult(null);
    setError("");
  }

  function usePill(pill: string) {
    setResponse(pill);
    setResult(null);
    setError("");
  }

  async function handleSubmit() {
    if (!currentScenario || !response.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: currentScenario.text, userResponse: response }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Header */}
      <h1 className="dash-welcome">Welcome, {displayName}.</h1>
      <p className="dash-copy">
        {activeModule
          ? `${MODULE_META[activeModule].label} — scenario ${scenarioIndex + 1} of ${SCENARIOS[activeModule].length}`
          : "Choose a module below to start your AI training session."}
      </p>

      {/* Module cards */}
      <div className="dash-cards">
        {(Object.keys(MODULE_META) as Module[]).map((mod) => (
          <div
            key={mod}
            className={`dash-card${activeModule === mod ? " dash-card-active" : ""}`}
            onClick={() => selectModule(mod)}
            style={activeModule === mod ? { borderColor: MODULE_META[mod].color, boxShadow: `0 0 0 3px ${MODULE_META[mod].color}22` } : {}}
          >
            <h3>{MODULE_META[mod].label}</h3>
            <p>{MODULE_META[mod].description}</p>
            {activeModule === mod && (
              <span className="dash-card-badge">Active</span>
            )}
          </div>
        ))}
      </div>

      {/* Training session */}
      {activeModule && currentScenario && (
        <div className="trainer-panel">
          <div className="trainer-scenario">
            <span className="trainer-label">AI Scenario</span>
            <p>{currentScenario.text}</p>
          </div>

          <div className="trainer-pills">
            <span className="trainer-hint">Quick responses — or write your own below</span>
            <div className="chat-actions">
              {currentScenario.pills.map((pill) => (
                <div
                  key={pill}
                  className={`chat-pill${response === pill ? " chat-pill-active" : ""}`}
                  onClick={() => usePill(pill)}
                >
                  {pill}
                </div>
              ))}
            </div>
          </div>

          <div className="trainer-input-row">
            <textarea
              className="trainer-textarea"
              placeholder="Type your full response here…"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
            />
            <div className="trainer-actions">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !response.trim()}
              >
                {loading ? "Evaluating…" : "Submit response"}
              </button>
              <button className="btn btn-secondary" onClick={nextScenario}>
                Next scenario →
              </button>
            </div>
          </div>

          {error && <div className="trainer-error">{error}</div>}

          {/* AI Result */}
          {result && (
            <div className="trainer-result">
              <div className="trainer-result-header">
                <span className="trainer-label">AI Evaluation</span>
                <span className="trainer-score">{result.overallScore}/25</span>
              </div>

              <div className="trainer-scores">
                {[
                  ["Communication", result.communication],
                  ["Hospitality", result.hospitalityBehaviour],
                  ["Problem Solving", result.problemSolving],
                  ["Professionalism", result.professionalism],
                  ["Guest Experience", result.guestExperience],
                ].map(([label, value]) => (
                  <div key={label as string} className="trainer-score-row">
                    <span className="trainer-score-label">{label as string}</span>
                    <div className="trainer-score-bar-wrap">
                      <div
                        className="trainer-score-bar"
                        style={{ width: `${((value as number) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="trainer-score-val">{value as number}/5</span>
                  </div>
                ))}
              </div>

              <div className="trainer-feedback">
                <div className="trainer-feedback-block trainer-feedback-good">
                  <strong>Strengths</strong>
                  <p>{result.strengths}</p>
                </div>
                <div className="trainer-feedback-block trainer-feedback-improve">
                  <strong>Improvement</strong>
                  <p>{result.improvement}</p>
                </div>
                <div className="trainer-feedback-block trainer-feedback-example">
                  <strong>Improved Response</strong>
                  <p>{result.improvedResponse}</p>
                </div>
              </div>

              <div className="trainer-after">
                <button className="btn btn-primary" onClick={nextScenario}>
                  Next scenario →
                </button>
                <button className="btn btn-secondary" onClick={() => { setResult(null); setResponse(""); }}>
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Default state — no module selected */}
      {!activeModule && (
        <div className="chat-box">
          <div className="chat-prompt">
            AI Coach: Click any training module above to start a real scenario session. You'll respond to situations and get instant, scored feedback.
          </div>
          <div className="chat-actions">
            <div className="chat-pill" onClick={() => selectModule("bartending")}>Start Bartending</div>
            <div className="chat-pill" onClick={() => selectModule("sales")}>Start Sales</div>
            <div className="chat-pill" onClick={() => selectModule("management")}>Start Management</div>
          </div>
        </div>
      )}
    </>
  );
}
