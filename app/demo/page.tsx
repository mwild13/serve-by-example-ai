"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ScenarioSimulatorPane, {
  type ModuleId,
  type DemoScenario,
} from "./_components/ScenarioSimulatorPane";
import LeadCapturePane from "./_components/LeadCapturePane";
import DemoMinimalFooter from "./_components/DemoMinimalFooter";
import type { EvalTab, EvaluationResult, ScoreDimension } from "./_components/EvaluationTabs";

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

const SCORE_DIMENSIONS: readonly ScoreDimension[] = [
  { key: "communication", label: "Communication" },
  { key: "hospitalityBehaviour", label: "Hospitality" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "professionalism", label: "Professionalism" },
  { key: "guestExperience", label: "Guest experience" },
];

export default function DemoPage() {
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>("bartending");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");
  const [activeEvalTab, setActiveEvalTab] = useState<EvalTab>("metrics");
  const [submitCount, setSubmitCount] = useState(0);

  const activeScenario = DEMO_SCENARIOS.find((s) => s.id === activeModuleId)!;

  function selectModule(id: ModuleId) {
    setActiveModuleId(id);
    setResponse("");
    setResult(null);
    setError("");
    setActiveEvalTab("metrics");
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

  function handleRetry() {
    setResult(null);
    setResponse("");
    setActiveEvalTab("metrics");
  }

  async function handleSubmit() {
    if (!response.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/demo/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: activeScenario.prompt, userResponse: response }),
      });
      const data = (await res.json()) as EvaluationResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
        setSubmitCount((c) => c + 1);
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
        <section className="inner-hero demo-inner-hero">
          <div className="container">
            <div className="eyebrow">Interactive demo</div>
            <h1>Try a real hospitality scenario</h1>
            <p className="inner-hero-sub">
              Pick a module, respond like you are on shift, then see how the system evaluates your answer.
            </p>
          </div>
        </section>

        <section className="container demo-dual-pane">
          <ScenarioSimulatorPane
            scenarios={DEMO_SCENARIOS}
            activeModuleId={activeModuleId}
            activeScenario={activeScenario}
            response={response}
            loading={loading}
            result={result}
            error={error}
            activeEvalTab={activeEvalTab}
            dimensions={SCORE_DIMENSIONS}
            onSelectModule={selectModule}
            onApplyPill={applyPill}
            onResponseChange={setResponse}
            onSubmit={() => void handleSubmit()}
            onSkip={handleSkip}
            onRetry={handleRetry}
            onTabChange={setActiveEvalTab}
          />
          <LeadCapturePane pulseKey={submitCount} hasResult={!!result} />
        </section>
      </main>

      <DemoMinimalFooter />
    </div>
  );
}
