"use client";

import { useEffect, useState } from "react";

type PillOption = {
  text: string;
  intent: string;
  positive: boolean;
};

type Scenario = {
  text: string;
  pills: PillOption[];
};

const SCENARIOS: Scenario[] = [
  {
    text: "Friday night, you're in the weeds. Table 22 waves you down ready to order, two cocktails are sweating fast at the bar, and a guest at the bar catches your eye wanting a beer. You have 30 seconds. Walk through your exact first minute: who gets eye contact first, words first, and service first? What do you say to each person to buy time without sounding rushed?",
    pills: [
      { intent: "Prioritise deliberately", text: "Eye contact to sweating drinks, words to hungry table, deliver to bar guest", positive: true },
      { intent: "Communicate buying time", text: "Say 'One second, let me grab your beer' to show you are already moving", positive: true },
      { intent: "Hope they wait quietly", text: "Bounce around without clear language and hope no one gets annoyed", positive: false },
    ],
  },
  {
    text: "A table of four arrives late. The main guest announces loudly: &apos;I&apos;m mates with the Owner. He&apos;d want us looked after.&apos; Throughout the night they complain, send back food, and ask for free drinks. You suspect they&apos;re exaggerating. How do you stay polite and professional while protecting yourself and the venue? What do you actually say when they ask for complimentary drinks?",
    pills: [
      { intent: "Set clear boundaries", text: "Politely decline free items, offer genuine service instead, and stay warm", positive: true },
      { intent: "Protect the venue", text: "Consult manager if pressure continues, never assume the friendship claim", positive: true },
      { intent: "Give in to avoid conflict", text: "Agree to free drinks to keep them happy", positive: false },
    ],
  },
  {
    text: "Tuesday night, 8pm. The venue is dead. Two tables, minimal drinks. You've been standing around for an hour, your phone is in your pocket, your coworker is yawning. The manager is doing paperwork. What do you do for the next hour to stay sharp, look busy, and actually be useful? Name three specific actions.",
    pills: [
      { intent: "Use dead time for growth", text: "Practice a cocktail recipe, deep-clean one section, study a training module you have not finished", positive: true },
      { intent: "Build visible value", text: "Ask the manager if there is a side project you could help with, or re-stock strategically", positive: true },
      { intent: "Phone scrolling and waiting", text: "Stand around waiting for guests, stay glued to your phone", positive: false },
    ],
  },
  {
    text: "A well-dressed couple sits down. The man says: 'Surprise me with something I've never tasted. Use any spirit except gin or vodka. Not too sweet, but I want to taste the alcohol.' His wife wants the same thing, but different, and hates citrus. You have 60 seconds. What two drinks do you make and why? How do you explain each so they feel looked after?",
    pills: [
      { intent: "Show creative confidence", text: "Suggest one spirit-forward, one base-spirit drink with clear flavour logic for each", positive: true },
      { intent: "Educate while serving", text: "Explain why each spirit works and what they will taste, not just rattle off names", positive: true },
      { intent: "Guess and hope", text: "Make two random drinks and hope they like them", positive: false },
    ],
  },
  {
    text: "20 minutes to close. A friendly regular is sitting alone with an empty glass. They seem sad and ask: 'One more? Just a quick one before close?' Legally you can serve them, but something feels off. What do you do? How do you balance being kind, following RSA, and protecting yourself? What do you actually say?",
    pills: [
      { intent: "Trust your instinct", text: "Politely decline, offer water and food instead, check in with empathy", positive: true },
      { intent: "Know your RSA", text: "Use responsible service as the reason, not as an excuse to be cold", positive: true },
      { intent: "Serve anyway", text: "Assume they are fine because you like them", positive: false },
    ],
  },
  {
    text: "Earlier, a guest ordered a well vodka soda. You said: &apos;Oh, you don&apos;t want that. Let me get you something actually nice.&apos; Later, you wondered if it sounded rude. The guest seemed flat after. What&apos;s wrong with that phrase? How could you have offered a premium option without making them feel judged? Write out two better ways to phrase it.",
    pills: [
      { intent: "Affirm before suggesting", text: "Say 'Great choice. Want to trade up to premium for an even smoother experience?'", positive: true },
      { intent: "Respect the initial order", text: "Never imply their choice is bad, only that an upgrade exists", positive: true },
      { intent: "Judge their taste", text: "Tell them well drinks are not worth ordering", positive: false },
    ],
  },
  {
    text: "Busy Saturday. Three things happen: a keg runs out and you have not changed one alone, a guest slips on a wet spot and their shirt is slightly wet (they are angry), and the kitchen is backed up with a restless table. You are the only experienced staff on this section. What do you handle first, second, third? Who do you ask for help? What do you say to each person?",
    pills: [
      { intent: "Prioritise safety first", text: "Check on the wet-shirt guest immediately, apologise, offer to clean their shirt", positive: true },
      { intent: "Delegate and communicate", text: "Call a manager, brief them, ask kitchen for time estimate, reassure the hungry table", positive: true },
      { intent: "Panic and freeze", text: "Try to fix the keg alone while ignoring the guest and hungry table", positive: false },
    ],
  },
  {
    text: "A new starter is on their third shift. You can see they are overwhelmed: making small mistakes, moving slow, looking anxious. The manager is busy. The new person has not asked for help but clearly needs it. You remember feeling exactly like this when you started. How do you offer help without making them feel worse? What do you say? What one small thing could you show them?",
    pills: [
      { intent: "Lead with empathy", text: "Say 'Hey, I remember this shift. Want me to show you a quicker way to do X?'", positive: true },
      { intent: "Make it practical", text: "Teach one small task or shortcut that actually saves them time right now", positive: true },
      { intent: "Make it about judgment", text: "Point out their mistakes or tell them they are too slow", positive: false },
    ],
  },
  {
    text: "A young couple orders one main to share, no entrées or starters. They seem lovely but are watching their budget. They are still smiling but your venue wants higher average spend. How do you gently encourage an extra dish or drink without making them feel poor? Without sounding pushy? Write out what you would say.",
    pills: [
      { intent: "Frame as treating themselves", text: "Say 'That dish pairs beautifully with our house red. Want to add a glass?'", positive: true },
      { intent: "Make it feel celebratory", text: "Suggest something that feels like sharing a special moment, not spending more", positive: true },
      { intent: "Dismiss their choice", text: "Tell them one main is not enough or they should upgrade", positive: false },
    ],
  },
  {
    text: "You just made and served a complex cocktail. The guest takes one sip, makes a face, and politely says: &apos;I&apos;m really sorry, I hate this. It&apos;s not what I expected.&apos; You followed the recipe perfectly. It&apos;s not your fault. But they are unhappy. What do you do? What do you say? How do you leave them happy without setting a precedent that guests avoid paying?",
    pills: [
      { intent: "Own the moment", text: "Say 'No problem, I've got you. What flavour would actually hit the spot?' and remake it", positive: true },
      { intent: "Problem-solve not defend", text: "Focus on fixing their experience, not proving you were right", positive: true },
      { intent: "Take it personally", text: "Get defensive or insist the drink is good", positive: false },
    ],
  },
];

const SCENARIO_INSIGHTS: string[] = [
  "Service sequencing under pressure separates fast bartenders from good bartenders. Composure comes from having a clear priority system in your head before chaos hits.",
  "Boundaries protect both you and the guest. When someone claims a relationship with ownership, professionalism is the only guardrail. Protect the venue gently and it will protect you.",
  "Slow shifts are gold for learning. Staff who grow use dead time to close knowledge gaps, not to scroll phones. Initiative during quiet moments tells managers who to promote.",
  "Creative problem-solving is learned by trying. When you nail an impossible order, you prove to yourself that you know more than you thought. Ask a senior to teach you one gap per week.",
  "RSA judgment lives in grey areas. Your instinct matters. When it says something is off, it usually is. Training teaches the law; experience teaches when the law is not enough.",
  "One rude upsell can undo ten great serves. The skill is not in the pitch, it is in reading whether the guest feels judged. Affirm first, suggest second.",
  "When three crises hit at once, leadership is not about fixing all of them. It is about staying calm, asking for help, and protecting what matters most. Delegate and communicate.",
  "Teaching someone else is one of the best ways to cement your own knowledge. Peer leadership starts with empathy and one small, useful tip. Ask your manager if you can help onboard.",
  "Gentle upselling is an art because it reads the room. Some tables want to treat themselves; some are watching their spend. Both are fine. Adjust your language, not your energy.",
  "Grace under pressure is what separates reactive servers from problem-solvers. When something goes wrong, the guest remembers how you made them feel after, not that the mistake happened.",
];

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

const SCORE_DIMENSIONS = [
  { key: "communication" as keyof EvalResult, label: "Communication" },
  { key: "hospitalityBehaviour" as keyof EvalResult, label: "Hospitality" },
  { key: "problemSolving" as keyof EvalResult, label: "Problem solving" },
  { key: "professionalism" as keyof EvalResult, label: "Professionalism" },
  { key: "guestExperience" as keyof EvalResult, label: "Guest experience" },
] as const;

export default function AdvancedScenarios() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const currentScenario = SCENARIOS[scenarioIndex];
  const currentInsight = SCENARIO_INSIGHTS[scenarioIndex];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.key === "?" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        setShowHelp((v) => !v);
      }
      if (event.key === "Escape") {
        setShowHelp(false);
        if (result) { setResult(null); setResponse(""); }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result]);

  function nextScenario() {
    const prev = result?.overallScore ?? null;
    setLastScore(prev);
    const next = (scenarioIndex + 1) % SCENARIOS.length;
    setScenarioIndex(next);
    setResponse("");
    setResult(null);
    setError("");
  }

  function applyPill(text: string) {
    setResponse(text);
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
      {/* Command bar — always visible */}
      <div className="sbe-command-bar sbe-command-bar-active">
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">Advanced Scenarios</span>
          <strong>Scenario {scenarioIndex + 1} of {SCENARIOS.length}</strong>
          <span className="sbe-command-meta">💡 Real-world challenges</span>
        </div>
      </div>

      {/* Help shortcut hint */}
      <div className="sbe-help-hint">
        Press <kbd>?</kbd> for shortcuts
        <button className="sbe-help-btn" onClick={() => setShowHelp(true)} aria-label="Show keyboard shortcuts">?</button>
      </div>

      {/* Help modal */}
      {showHelp && (
        <div className="sbe-help-overlay" onClick={() => setShowHelp(false)}>
          <div className="sbe-help-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Keyboard shortcuts</h3>
            <ul className="sbe-shortcut-list">
              <li><kbd>Ctrl</kbd>+<kbd>Enter</kbd> <span>Submit / check response</span></li>
              <li><kbd>Esc</kbd> <span>Dismiss result / exit focus</span></li>
              <li><kbd>?</kbd> <span>Toggle this help panel</span></li>
            </ul>
            <button className="btn btn-primary" onClick={() => setShowHelp(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* Active scenario view — input phase */}
      {!result && (
        <div className="trainer-panel">
          <div className="trainer-scenario">
            <span className="trainer-label">Scenario {scenarioIndex + 1} of {SCENARIOS.length}</span>
            <p>{currentScenario.text}</p>
          </div>

          <div className="trainer-pills">
            <span className="trainer-hint">Choose an approach — or write your own response below</span>
            <div className="chat-actions sbe-intent-pills">
              {currentScenario.pills.map((pill) => (
                <button
                  key={pill.text}
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
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(); }}
              rows={4}
            />
            <div className="trainer-actions">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !response.trim()}
                type="button"
              >
                {loading ? "Evaluating…" : "Check my response"}
              </button>
              <button className="btn btn-secondary" onClick={nextScenario} type="button">
                Skip →
              </button>
            </div>
          </div>

          {error && <div className="trainer-error">{error}</div>}
        </div>
      )}

      {/* Result view */}
      {result && (() => {
        const delta = lastScore !== null ? result.overallScore - lastScore : null;
        const weakest = [...SCORE_DIMENSIONS].sort((a, b) => (result[a.key] as number) - (result[b.key] as number))[0];
        const strongest = [...SCORE_DIMENSIONS].sort((a, b) => (result[b.key] as number) - (result[a.key] as number))[0];
        return (
          <div className="trainer-result">
            <div className="sbe-score-hero">
              <div className="sbe-score-number">
                <span className="sbe-score-val">{result.overallScore}</span>
                <span className="sbe-score-denom">/25</span>
              </div>
              {delta !== null && delta !== 0 && (
                <span className={`sbe-score-delta ${delta > 0 ? "sbe-delta-up" : "sbe-delta-down"}`}>
                  {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`} from last attempt
                </span>
              )}
              {delta === null && <span className="sbe-score-delta sbe-delta-first">First attempt on this scenario</span>}
            </div>

            <div className="sbe-dimension-list">
              {SCORE_DIMENSIONS.map(({ key, label }) => {
                const val = result[key] as number;
                const icon = val >= 4 ? "✔" : val === 3 ? "⚠" : "✖";
                const cls = val >= 4 ? "sbe-dim-good" : val === 3 ? "sbe-dim-warn" : "sbe-dim-miss";
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

            {currentInsight && (
              <div className="sbe-scenario-insight">
                <strong>💡 Why this matters</strong>
                <p>{currentInsight}</p>
              </div>
            )}

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
              <button className="btn btn-primary" onClick={nextScenario} type="button">
                Next scenario →
              </button>
              <button className="btn btn-secondary" onClick={() => { setResult(null); setResponse(""); }} type="button">
                Try again
              </button>
            </div>
          </div>
        );
      })()}
    </>
  );
}
