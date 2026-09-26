"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/marketing/PageHero";
import ScenarioSimulatorPane, {
  type ModuleId,
  type DemoScenario,
} from "./_components/ScenarioSimulatorPane";
import LeadCapturePane from "./_components/LeadCapturePane";
import DemoMinimalFooter from "./_components/DemoMinimalFooter";
import type { EvalTab, EvaluationResult, ScoreDimension } from "./_components/EvaluationTabs";
import { DEMO_PROMPTS } from "@/lib/demo-scenarios";

// The server gives OpenAI 20 seconds; this leaves room for the round trip.
const REQUEST_TIMEOUT_MS = 30_000;

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "bartending",
    category: "Bartending",
    title: "First guest acknowledgment",
    prompt: DEMO_PROMPTS.bartending,
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
    prompt: DEMO_PROMPTS.sales,
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
    prompt: DEMO_PROMPTS.management,
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

  // The in-flight evaluation, if any. Anything that changes the scenario or
  // the answer cancels it, so a late result can never land on a different
  // scenario than the one it graded.
  const inFlight = useRef<AbortController | null>(null);

  function cancelInFlight() {
    const controller = inFlight.current;
    if (!controller) return;
    inFlight.current = null;
    controller.abort();
    setLoading(false);
  }

  useEffect(() => {
    return () => {
      const controller = inFlight.current;
      inFlight.current = null;
      controller?.abort();
    };
  }, []);

  function selectModule(id: ModuleId) {
    cancelInFlight();
    setActiveModuleId(id);
    setResponse("");
    setResult(null);
    setError("");
    setActiveEvalTab("metrics");
  }

  function applyPill(text: string) {
    cancelInFlight();
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
    cancelInFlight();
    setResult(null);
    setResponse("");
    setActiveEvalTab("metrics");
  }

  async function handleSubmit() {
    if (inFlight.current || !response.trim()) return;
    const controller = new AbortController();
    inFlight.current = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/demo/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: activeScenario.id, userResponse: response }),
        signal: controller.signal,
      });
      const data = (await res.json()) as EvaluationResult & { error?: string };
      if (inFlight.current !== controller) return;
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
        setSubmitCount((c) => c + 1);
      }
    } catch {
      if (inFlight.current !== controller) return;
      setError(
        controller.signal.aborted
          ? "That took too long. Please try again."
          : "Failed to connect to the evaluation service.",
      );
    } finally {
      clearTimeout(timeout);
      if (inFlight.current === controller) {
        inFlight.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <PageHero
          compact
          eyebrow="Interactive demo"
          title="Try a real hospo scenario"
          subtitle="Pick a module, respond, have your answer evaluated."
        />

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
