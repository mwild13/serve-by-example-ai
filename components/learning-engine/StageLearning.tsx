"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import RapidFireQuiz from "@/components/learning-engine/RapidFireQuiz";
import DescriptorSelector from "@/components/learning-engine/DescriptorSelector";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  LEVEL1_QUESTIONS,
  LEVEL2_DESCRIPTORS,
  LEVEL3_DESCRIPTORS,
  type Module,
} from "@/lib/scaffolded-questions";

type StageLevel = 1 | 2 | 3 | 4;

type Props = {
  moduleId: number;
  managementUnlocked: boolean;
  initialStage?: StageLevel;
  overrideModuleName?: string;
  /** When set, forces this module key for content lookup instead of inferring from moduleId */
  scaffoldedModuleKey?: Module;
};

const STAGE_META: Record<StageLevel, { name: string; subtitle: string }> = {
  1: { name: "Stage 1: Recall", subtitle: "True or false — quick knowledge checks" },
  2: { name: "Stage 2: Application", subtitle: "Select the correct descriptors for each scenario" },
  3: { name: "Stage 3: Advanced Application", subtitle: "Deeper descriptor challenges with shuffled options" },
  4: { name: "Stage 4: Real-World Scenarios", subtitle: "AI-evaluated roleplay scenarios" },
};

type Scenario = {
  id: string;
  module_id: number;
  scenario_index: number;
  scenario_type: string;
  prompt: string;
  content: Record<string, unknown>;
  difficulty: number;
};

type ModuleProgress = {
  completed: boolean;
  score: number;
};

// Maps moduleId 1-3 to the legacy string keys used in user_level_progress.
const LEGACY_MODULE_NAMES: Record<number, string> = { 1: "bartending", 2: "sales", 3: "management" };
// Quick Drill sub-modules that aren't valid level-progress keys → map to parent module
const QUICK_DRILL_MODULE_MAP: Record<string, string> = {
  beer: "bartending",
  wine: "bartending",
  cocktails: "bartending",
};

// Map module IDs 1-3 to their correct topic question banks.
// DB module ID 1 = "Pouring the Perfect Beer"
// DB module ID 2 = "Wine Knowledge & Service"
// DB module ID 3 = "Cocktail Fundamentals"
const SCAFFOLDED_MODULE_KEY: Record<number, Module> = {
  1: "beer",
  2: "wine",
  3: "cocktails",
};

// Build rich fallback scenarios from scaffolded-questions.ts for modules 1-3
// For modules 4-20, use generic content so training is always functional
function getFallbackScenarios(moduleId: number, overrideKey?: Module): Scenario[] {
  const moduleKey = overrideKey ?? SCAFFOLDED_MODULE_KEY[moduleId];

  if (moduleKey) {
    const l1 = LEVEL1_QUESTIONS[moduleKey];
    const l2 = LEVEL2_DESCRIPTORS[moduleKey];
    const l3 = LEVEL3_DESCRIPTORS[moduleKey];

    const quizScenarios: Scenario[] = l1.map((q, i) => ({
      id: `scaffolded-${moduleId}-l1-${i}`,
      module_id: moduleId,
      scenario_index: i,
      scenario_type: "quiz",
      prompt: q.question,
      content: { answer: String(q.answer), explanation: q.explanation },
      difficulty: 1,
    }));

    const l2Scenarios: Scenario[] = l2.map((q, i) => ({
      id: `scaffolded-${moduleId}-l2-${i}`,
      module_id: moduleId,
      scenario_index: 20 + i,
      scenario_type: "descriptor_l2",
      prompt: q.prompt,
      content: {
        descriptors: q.descriptors,
        correctIndices: q.correctIndices,
        explanation: q.explanation,
      },
      difficulty: 2,
    }));

    const l3Scenarios: Scenario[] = l3.map((q, i) => ({
      id: `scaffolded-${moduleId}-l3-${i}`,
      module_id: moduleId,
      scenario_index: 30 + i,
      scenario_type: "descriptor_l3",
      prompt: q.prompt,
      content: {
        descriptors: q.descriptors,
        correctIndices: q.correctIndices,
        explanation: q.explanation,
      },
      difficulty: 3,
    }));

    return [...quizScenarios, ...l2Scenarios, ...l3Scenarios, {
      id: `scaffolded-${moduleId}-l4-0`,
      module_id: moduleId,
      scenario_index: 40,
      scenario_type: "roleplay",
      prompt: `You are on shift and a guest needs your help. Demonstrate your ${moduleKey} knowledge by walking through your approach step by step.`,
      content: { context: `Real-world scenario for ${moduleKey}.`, evaluation_criteria: ["Empathy", "Knowledge", "Problem-solving", "Communication"] },
      difficulty: 4,
    }];
  }

  // Generic fallback for modules 4-20
  const moduleTopics: Record<number, { topic: string; keyword: string }> = {
    4: { topic: "coffee preparation", keyword: "coffee and espresso" },
    5: { topic: "carrying glassware", keyword: "carrying trays safely" },
    6: { topic: "cleaning procedures", keyword: "cleaning and sanitation" },
    7: { topic: "bar back duties", keyword: "bar operations" },
    8: { topic: "greeting guests", keyword: "welcoming customers" },
    9: { topic: "table management", keyword: "managing tables" },
    10: { topic: "anticipatory service", keyword: "anticipating guest needs" },
    11: { topic: "complaint handling", keyword: "handling complaints" },
    12: { topic: "upselling", keyword: "suggesting and upselling" },
    13: { topic: "VIP service", keyword: "VIP and table management" },
    14: { topic: "phone etiquette", keyword: "phone and reservations" },
    15: { topic: "responsible service of alcohol", keyword: "RSA compliance" },
    16: { topic: "food safety", keyword: "food hygiene" },
    17: { topic: "conflict de-escalation", keyword: "managing conflict" },
    18: { topic: "emergency protocols", keyword: "emergency procedures" },
    19: { topic: "opening and closing", keyword: "venue procedures" },
    20: { topic: "inventory control", keyword: "stock management" },
  };

  const info = moduleTopics[moduleId] || { topic: "hospitality", keyword: "service" };

  return [
    { id: `fallback-${moduleId}-1`, module_id: moduleId, scenario_index: 0, scenario_type: "quiz", prompt: `Proper technique is essential in ${info.topic}.`, content: { answer: "true", explanation: `Good technique in ${info.topic} is fundamental to quality service.` }, difficulty: 1 },
    { id: `fallback-${moduleId}-2`, module_id: moduleId, scenario_index: 1, scenario_type: "quiz", prompt: `You can skip ${info.topic} training if you have prior experience.`, content: { answer: "false", explanation: `Every venue has specific standards. Even experienced staff need to learn house procedures.` }, difficulty: 1 },
    { id: `fallback-${moduleId}-3`, module_id: moduleId, scenario_index: 2, scenario_type: "quiz", prompt: `Guest satisfaction improves when staff are skilled in ${info.topic}.`, content: { answer: "true", explanation: `Proficiency in ${info.topic} directly contributes to a positive guest experience.` }, difficulty: 1 },
    { id: `fallback-${moduleId}-4`, module_id: moduleId, scenario_index: 3, scenario_type: "quiz", prompt: `Speed is more important than quality when it comes to ${info.topic}.`, content: { answer: "false", explanation: `Quality should never be compromised. Rushed ${info.topic} leads to errors and dissatisfaction.` }, difficulty: 2 },
    { id: `fallback-${moduleId}-5`, module_id: moduleId, scenario_index: 4, scenario_type: "quiz", prompt: `Understanding ${info.topic} helps you handle difficult situations at work.`, content: { answer: "true", explanation: `Strong ${info.topic} knowledge gives you confidence to adapt when things don't go to plan.` }, difficulty: 2 },
    {
      id: `fallback-${moduleId}-6`, module_id: moduleId, scenario_index: 5, scenario_type: "descriptor_l2",
      prompt: `A guest asks for help with ${info.keyword}. Which TWO actions best reflect professional service?`,
      content: { descriptors: [`Respond promptly and with a smile`, `Ignore the request`, `Apply proper ${info.topic} technique`, `Guess without checking`, `Tell the guest to wait indefinitely`], correctIndices: [0, 2], explanation: `Promptness and applying correct technique are the cornerstones of professional service.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-7`, module_id: moduleId, scenario_index: 6, scenario_type: "descriptor_l2",
      prompt: `You notice a problem during ${info.keyword}. Which TWO steps should you take?`,
      content: { descriptors: [`Address it immediately before it escalates`, `Ignore it and hope it resolves`, `Inform your supervisor if needed`, `Blame a colleague`, `Walk away from the situation`], correctIndices: [0, 2], explanation: `Acting quickly and involving your supervisor when appropriate are hallmarks of responsible service.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-11`, module_id: moduleId, scenario_index: 10, scenario_type: "descriptor_l2",
      prompt: `A guest gives you direct feedback about ${info.topic}. Which TWO responses demonstrate professionalism?`,
      content: { descriptors: [`Thank them sincerely and acknowledge what they said`, `Take note and escalate to a supervisor if needed`, `Dismiss the feedback politely without acting on it`, `Argue with the guest's point`, `Apologise repeatedly without taking any action`], correctIndices: [0, 1], explanation: `Acknowledging feedback and escalating appropriately are signs of professional maturity — guests who give feedback are giving you a chance to improve.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-12`, module_id: moduleId, scenario_index: 11, scenario_type: "descriptor_l2",
      prompt: `Before starting a ${info.topic} task, which TWO preparation steps ensure a quality outcome?`,
      content: { descriptors: [`Check all required equipment is available and in working order`, `Review any relevant procedures or standards before starting`, `Wing it and figure it out as you go`, `Start immediately without any preparation`, `Ask a colleague to do it instead of preparing yourself`], correctIndices: [0, 1], explanation: `Checking your equipment and reviewing procedures before you start prevents errors and ensures consistent quality — preparation is professionalism.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-13`, module_id: moduleId, scenario_index: 12, scenario_type: "descriptor_l2",
      prompt: `During a busy service involving ${info.keyword}, a colleague needs assistance. Which TWO actions are appropriate?`,
      content: { descriptors: [`Offer to help once your own duties are covered`, `Communicate clearly about what you can assist with and for how long`, `Ignore the request and stay focused on your own station`, `Take over their entire role without being asked`, `Complain about the extra workload`], correctIndices: [0, 1], explanation: `Good teamwork means helping when you have capacity, with honest communication about your availability — not abandoning your own post.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-14`, module_id: moduleId, scenario_index: 13, scenario_type: "descriptor_l2",
      prompt: `A new team member is struggling with ${info.topic}. Which TWO mentoring approaches are most effective?`,
      content: { descriptors: [`Demonstrate the correct technique and explain the reason behind it`, `Encourage them by acknowledging that everyone finds it hard at first`, `Tell them to figure it out on their own`, `Report them to management immediately`, `Take over without letting them try again`], correctIndices: [0, 1], explanation: `Showing the correct method with an explanation, combined with empathy, builds long-term confidence and skill. Taking over without coaching creates dependency.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-19`, module_id: moduleId, scenario_index: 18, scenario_type: "descriptor_l2",
      prompt: `A rush of guests arrives during ${info.keyword}. Which TWO approaches keep service quality high?`,
      content: { descriptors: [`Stay composed and address one guest at a time`, `Ask a colleague for backup if workload exceeds capacity`, `Rush through each guest with minimal attention`, `Make guests feel dismissed to serve everyone faster`, `Wait until the rush passes before helping anyone`], correctIndices: [0, 1], explanation: `Composure and calling for backup maintain quality without sacrificing speed — rushing always costs more than it saves.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-20`, module_id: moduleId, scenario_index: 19, scenario_type: "descriptor_l2",
      prompt: `Your supervisor asks you to handle ${info.topic} in a way you believe is incorrect. Which TWO responses are appropriate?`,
      content: { descriptors: [`Follow the instruction and note your concern privately`, `Raise your concern respectfully at the next right moment`, `Refuse the instruction immediately on the floor`, `Ignore the instruction without explanation`, `Complain to other staff in front of guests`], correctIndices: [0, 1], explanation: `Following reasonable instructions while raising concerns through the right channel is how professional teams operate.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-21`, module_id: moduleId, scenario_index: 20, scenario_type: "descriptor_l2",
      prompt: `You are asked to take on a ${info.topic} task outside your usual responsibilities. Which TWO responses show professionalism?`,
      content: { descriptors: [`Confirm you understand the task and ask any clarifying questions`, `Attempt it with genuine effort even if it is unfamiliar`, `Refuse because it is not your usual role`, `Do it carelessly since it is not normally your job`, `Wait for someone else to volunteer`], correctIndices: [0, 1], explanation: `Adaptability and willingness to step up — with clear understanding first — are marks of a professional who grows into greater responsibility.` },
      difficulty: 2,
    },
    {
      id: `fallback-${moduleId}-8`, module_id: moduleId, scenario_index: 7, scenario_type: "descriptor_l3",
      prompt: `During a busy shift involving ${info.keyword}, which THREE behaviours demonstrate excellence?`,
      content: { descriptors: [`Maintain composure under pressure`, `Prioritise tasks by urgency`, `Cut corners to save time`, `Communicate clearly with your team`, `Dismiss guest feedback`], correctIndices: [0, 1, 3], explanation: `Composure, prioritisation, and clear communication are the key pillars of excellence.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-9`, module_id: moduleId, scenario_index: 8, scenario_type: "descriptor_l3",
      prompt: `A guest gives feedback about ${info.keyword}. Which THREE responses show professionalism?`,
      content: { descriptors: [`Thank them for the feedback`, `Dismiss what they said`, `Take note of what can be improved`, `Argue with the guest`, `Follow up to ensure satisfaction`], correctIndices: [0, 2, 4], explanation: `Thanking guests, noting improvements, and following up are signs of professional service recovery.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-15`, module_id: moduleId, scenario_index: 14, scenario_type: "descriptor_l3",
      prompt: `A colleague is struggling during service related to ${info.topic}. Which THREE actions show leadership?`,
      content: { descriptors: [`Step in and help without being asked`, `Communicate clearly about what you can cover`, `Ignore it and focus on your own station only`, `Flag it to a supervisor if needed`, `Criticise them in front of guests`], correctIndices: [0, 1, 3], explanation: `Proactive support, clear communication, and escalation when needed are the hallmarks of a team leader.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-16`, module_id: moduleId, scenario_index: 15, scenario_type: "descriptor_l3",
      prompt: `You are training a new staff member on ${info.topic}. Which THREE approaches build confidence and skill fastest?`,
      content: { descriptors: [`Demonstrate the correct technique and explain the reason why`, `Let them attempt the task first, then coach on what to improve`, `Tell them to read the manual and figure it out`, `Give specific and constructive feedback after each attempt`, `Take over every time they make a small error`], correctIndices: [0, 1, 3], explanation: `Show, let them try, and give targeted feedback. Taking over creates dependency; reading alone without practice builds nothing.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-17`, module_id: moduleId, scenario_index: 16, scenario_type: "descriptor_l3",
      prompt: `Service standards are slipping on your section due to ${info.keyword} issues. Which THREE steps address the root cause?`,
      content: { descriptors: [`Identify the specific step where quality breaks down`, `Retrain the relevant technique on the next quiet shift`, `Blame the front-of-house team without investigating`, `Implement a quick checklist to standardise the process`, `Accept the lower standard to keep the peace`], correctIndices: [0, 1, 3], explanation: `Diagnosis, targeted retraining, and a checklist create a system fix rather than a band-aid.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-18`, module_id: moduleId, scenario_index: 17, scenario_type: "descriptor_l3",
      prompt: `A VIP guest has a complaint about ${info.topic} on arrival. Which THREE actions resolve the situation professionally?`,
      content: { descriptors: [`Acknowledge the issue immediately and apologise sincerely`, `Offer a tangible remedy without overpromising`, `Make excuses and explain why it wasn't your fault`, `Escalate to a manager while staying with the guest`, `Walk away and let someone else handle it`], correctIndices: [0, 1, 3], explanation: `Acknowledge, remedy, and escalate with the guest. Excuses and abandonment destroy the relationship.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-22`, module_id: moduleId, scenario_index: 21, scenario_type: "descriptor_l3",
      prompt: `A difficult situation arises during ${info.keyword} that you cannot resolve alone. Which THREE responses demonstrate maturity?`,
      content: { descriptors: [`Acknowledge the issue to the affected guest`, `Escalate to your supervisor with clear context`, `Keep the guest informed while a workaround is found`, `Pretend the issue does not exist`, `Walk away and let someone else deal with it`], correctIndices: [0, 1, 2], explanation: `Acknowledge, escalate with context, and keep the guest informed — these three actions are the professional standard for problems that exceed your authority.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-23`, module_id: moduleId, scenario_index: 22, scenario_type: "descriptor_l3",
      prompt: `You observe a consistent gap in how your team approaches ${info.topic}. Which THREE actions are most effective?`,
      content: { descriptors: [`Document the gap with specific examples`, `Raise it in the next team meeting constructively`, `Model the correct approach yourself`, `Ignore it to avoid conflict`, `Publicly criticise underperforming team members`], correctIndices: [0, 1, 2], explanation: `Documentation, constructive discussion, and leading by example create lasting improvement without damaging morale.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-24`, module_id: moduleId, scenario_index: 23, scenario_type: "descriptor_l3",
      prompt: `Your supervisor gives you critical feedback after a difficult shift involving ${info.keyword}. Which THREE responses reflect emotional intelligence?`,
      content: { descriptors: [`Listen without interrupting or becoming defensive`, `Ask clarifying questions to understand the feedback`, `Thank them for taking the time to give feedback`, `Argue that the shift was harder than usual`, `Dismiss the feedback as unfair immediately`], correctIndices: [0, 1, 2], explanation: `Listening, clarifying, and expressing gratitude for feedback are habits of high performers — defensiveness closes the feedback loop permanently.` },
      difficulty: 3,
    },
    {
      id: `fallback-${moduleId}-25`, module_id: moduleId, scenario_index: 24, scenario_type: "descriptor_l3",
      prompt: `You notice your own performance slipping under pressure during ${info.keyword}. Which THREE actions show self-awareness?`,
      content: { descriptors: [`Acknowledge the pressure internally and refocus on the next task`, `Ask a colleague to cover one task while you reset`, `Communicate honestly with your team if you need a moment`, `Pretend nothing is wrong and push through with declining quality`, `Take your frustration out on a colleague or guest`], correctIndices: [0, 1, 2], explanation: `Self-awareness, strategic delegation, and honest communication are how resilient hospitality professionals handle pressure — not silence and declining output.` },
      difficulty: 3,
    },
    { id: `fallback-${moduleId}-10`, module_id: moduleId, scenario_index: 9, scenario_type: "roleplay", prompt: `A guest approaches you with a concern about ${info.topic}. How do you handle this situation?`, content: { context: `Testing ${info.topic} knowledge under pressure.`, evaluation_criteria: [`Empathy`, `Knowledge`, `Problem-solving`, `Communication`] }, difficulty: 4 },
  ];
}

export default function StageLearning({ moduleId, managementUnlocked, initialStage, overrideModuleName, scaffoldedModuleKey }: Props) {
  const [currentStage, setCurrentStage] = useState<StageLevel>(initialStage ?? 1);
  const [moduleName, setModuleName] = useState<string>(overrideModuleName ?? "Training Module");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<StageLevel, ModuleProgress>>({
    1: { completed: false, score: 0 },
    2: { completed: false, score: 0 },
    3: { completed: false, score: 0 },
    4: { completed: false, score: 0 },
  });
  const [sessionProgress, setSessionProgress] = useState<StageLevel[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // Fetch module metadata and scenarios
  useEffect(() => {
    async function fetchModuleData() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setLoading(false);
          return;
        }

        // Quick Drills pass scaffoldedModuleKey explicitly. Their moduleIds (1=bartending,
        // 2=sales, 3=management) collide with DB module IDs (1=Beer, 2=Wine, 3=Cocktails).
        // Always use scaffolded questions when the key is explicitly provided — never fetch DB.
        if (scaffoldedModuleKey) {
          setScenarios(getFallbackScenarios(moduleId, scaffoldedModuleKey));
          setLoading(false);
          return;
        }

        // Fetch module details (skip if name is already provided via prop)
        if (!overrideModuleName) {
          const moduleRes = await fetch(`/api/training/modules/${moduleId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (moduleRes.ok) {
            const moduleData = await moduleRes.json();
            setModuleName(moduleData.title || "Training Module");
          }
        }

        // Fetch scenarios for this module
        const scenariosRes = await fetch(`/api/training/modules/${moduleId}/scenarios`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (scenariosRes.ok) {
          const scenariosData = await scenariosRes.json();
          const dbScenarios: Scenario[] = scenariosData.scenarios || [];

          if (dbScenarios.length > 0) {
            // Validate quiz scenarios: must have content.answer of exactly "true" or "false"
            // Badly formatted questions (e.g. "What is the drinking age?", answer: "18")
            // appear in the T/F UI but both buttons always score wrong — silent UX breakage.
            const validScenarios = dbScenarios.filter((s: Scenario) => {
              if (s.scenario_type !== "quiz") return true;
              const answer = String(
                (s.content as { answer?: unknown })?.answer ?? ""
              )
                .toLowerCase()
                .trim();
              return answer === "true" || answer === "false";
            });

            const dbQuizCount = validScenarios.filter(
              (s: Scenario) => s.scenario_type === "quiz"
            ).length;

            // Stage 1 requires 5 consecutive correct — need at least 5 unique questions.
            const MIN_QUIZ_QUESTIONS = 5;

            // Stage 2 max = 6 questions; 6 unique fills exactly one shuffle round = no repeats.
            // Stage 3 max = 7 questions; 7 unique fills exactly one shuffle round = no repeats.
            // Below these thresholds the generic fallback (9 L2 / 10 L3) is used instead.
            const MIN_L2_QUESTIONS = 6;
            const MIN_L3_QUESTIONS = 7;
            const dbL2Count = validScenarios.filter(
              (s: Scenario) => s.scenario_type === "descriptor_l2"
            ).length;
            const dbL3Count = validScenarios.filter(
              (s: Scenario) => s.scenario_type === "descriptor_l3"
            ).length;
            const hasEnoughDescriptors =
              dbL2Count >= MIN_L2_QUESTIONS && dbL3Count >= MIN_L3_QUESTIONS;

            if (dbQuizCount < MIN_QUIZ_QUESTIONS) {
              // Not enough valid T/F questions in DB.
              // Supplement Stage 1 with fallback quiz questions while keeping DB
              // descriptor/roleplay content if it exists and is sufficient.
              const fallback = getFallbackScenarios(moduleId, scaffoldedModuleKey);
              const fallbackQuiz = fallback.filter(
                (s: Scenario) => s.scenario_type === "quiz"
              );
              const dbNonQuiz = validScenarios.filter(
                (s: Scenario) => s.scenario_type !== "quiz"
              );

              if (hasEnoughDescriptors && dbNonQuiz.length >= 4) {
                // Good descriptor/roleplay data in DB — just replace quiz layer
                setScenarios([...fallbackQuiz, ...dbNonQuiz]);
              } else {
                // Full fallback (DB data too sparse overall)
                setScenarios(fallback);
              }
            } else if (!hasEnoughDescriptors) {
              // DB has quiz but not enough descriptor scenarios — use full scaffolded set
              // so stages 2 and 3 have varied questions that cycle properly
              setScenarios(getFallbackScenarios(moduleId, scaffoldedModuleKey));
            } else {
              setScenarios(validScenarios);
            }
          } else {
            // DB scenarios not yet seeded — use fallback so training works
            setScenarios(getFallbackScenarios(moduleId, scaffoldedModuleKey));
          }
        } else {
          // API error — use fallback scenarios
          setScenarios(getFallbackScenarios(moduleId, scaffoldedModuleKey));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load module data");
        console.error("Error fetching module data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId, overrideModuleName, scaffoldedModuleKey]);

  // Get scenarios for current stage — memoized so the array reference is stable.
  // A new array reference on every render would trigger RapidFireQuiz's useEffect,
  // reshuffling and resetting questionIndex mid-quiz.
  const stageScenarios = useMemo((): Scenario[] => {
    const stageTypeMap: Record<StageLevel, string> = {
      1: "quiz",
      2: "descriptor_l2",
      3: "descriptor_l3",
      4: "roleplay",
    };
    return scenarios.filter((s) => s.scenario_type === stageTypeMap[currentStage]);
  }, [scenarios, currentStage]);

  // Handle stage completion
  const handleStageComplete = useCallback(
    async (score: number) => {
      setProgress((prev) => ({
        ...prev,
        [currentStage]: { completed: true, score },
      }));

      setSessionProgress((prev) => (prev.includes(currentStage) ? prev : [...prev, currentStage]));
      setShowSummary(true);

      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        // Stages 1-3 write directly to level-progress (no session cookie required).
        // This is the primary badge write — it always runs regardless of whether
        // the mastery save below succeeds.
        const rawModule = scaffoldedModuleKey ?? LEGACY_MODULE_NAMES[moduleId] ?? null;
        const levelModule = rawModule ? (QUICK_DRILL_MODULE_MAP[rawModule] ?? rawModule) : null;
        if (levelModule && currentStage <= 3) {
          await fetch("/api/training/level-progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              module: levelModule,
              currentLevel: currentStage,
              [`level${currentStage}Score`]: score,
              [`level${currentStage}Completed`]: true,
            }),
          }).catch((err) => console.error("Level progress write failed:", err));
        }

        // Also fire the mastery save — requires sbe_session_id cookie.
        // May fail for users without a stamped session; that is acceptable
        // because the level-progress write above already secured badge data.
        // Stage 1-3 scores are 0-5 (consecutive correct); scale to 0-25 for the mastery engine.
        // Stage 4 scores are already 0-25 from the AI evaluator.
        const masteryScore = currentStage === 4 ? score : Math.min(score * 5, 25);
        await fetch("/api/training/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            moduleId,
            stageLevel: currentStage,
            scenarioIndex: currentStage - 1,
            overallScore: masteryScore,
            completed: true,
          }),
        }).catch((err) => console.error("Mastery save failed:", err));
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    },
    [currentStage, moduleId, scaffoldedModuleKey]
  );

  const meta = STAGE_META[currentStage];

  if (loading) {
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center" }}>
          <div className="spinner" style={{ marginBottom: "16px" }}></div>
          <p>Loading module content...</p>
        </div>
      </div>
    );
  }

  if (error || stageScenarios.length === 0) {
    return (
      <div className="stage-container">
        <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-soft)" }}>
          <p>{error || "No scenarios available for this stage"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-container">
      {/* Module header — keyed to currentStage so it remounts on every stage change,
          guaranteeing the heading text is never stale after a stage transition */}
      <div key={`stage-header-${currentStage}`} className="stage-header">
        <h2 style={{ marginBottom: "8px" }}>{moduleName}</h2>
        <h1 className="stage-title">{meta.name}</h1>
        <p className="stage-subtitle">{meta.subtitle}</p>
      </div>

      {/* Session summary with forward navigation */}
      {showSummary && sessionProgress.length > 0 && (
        <div className="stage-summary-card">
          <div className="stage-summary-header">
            <span className="stage-summary-icon">◆</span>
            <strong>Stage {currentStage} complete!</strong>
          </div>
          <div className="stage-summary-stats">
            <div className="stage-summary-stat">
              <span className="stage-summary-num">{sessionProgress.length}</span>
              <span className="stage-summary-label">stage{sessionProgress.length !== 1 ? "s" : ""} completed</span>
            </div>
          </div>
          {currentStage < 4 && (
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "12px" }}
              onClick={() => {
                setCurrentStage((currentStage + 1) as StageLevel);
                setShowSummary(false);
              }}
            >
              Continue to Stage {currentStage + 1} →
            </button>
          )}
          <button className="stage-summary-dismiss" onClick={() => setShowSummary(false)}>
            {currentStage < 4 ? "Stay on this stage" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Stage progression */}
      <div className="stage-progress">
        {(
          [1, 2, 3, 4] as StageLevel[]
        ).map((stage) => {
          const stageProgress = progress[stage];
          const isCompleted = stageProgress.completed;
          const isCurrent = stage === currentStage;

          return (
            <button
              key={stage}
              className={`stage-progress-item${isCurrent ? " stage-progress-item-active" : ""}${isCompleted ? " stage-progress-item-completed" : ""}`}
              onClick={() => {
                setShowSummary(false);
                setCurrentStage(stage);
              }}
            >
              <span className="stage-progress-number">{stage}</span>
              <span className="stage-progress-label">Stage {stage}</span>
              {isCompleted && <span className="stage-progress-badge">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Stage content — each stage gets a stable key so it mounts fresh when
          the stage changes and never carries over stale answer state */}
      {currentStage === 1 && (
        <RapidFireQuiz
          key={`quiz-${moduleId}-stage-1`}
          scenarios={stageScenarios}
          moduleId={moduleId}
          onComplete={handleStageComplete}
        />
      )}

      {(currentStage === 2 || currentStage === 3) && (
        <DescriptorSelector
          key={`descriptor-${moduleId}-stage-${currentStage}`}
          scenarios={stageScenarios}
          moduleId={moduleId}
          level={currentStage}
          onComplete={handleStageComplete}
        />
      )}

      {currentStage === 4 && (
        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-soft)" }}>
          <p>Stage 4 advanced scenarios coming soon</p>
        </div>
      )}

      {/* Navigation */}
      <div className="stage-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentStage(Math.max(1, currentStage - 1) as StageLevel)}
          disabled={currentStage === 1}
        >
          ← Previous Stage
        </button>

        <button
          className="btn btn-primary"
          onClick={() => setCurrentStage(Math.min(4, currentStage + 1) as StageLevel)}
          disabled={currentStage === 4 || !progress[currentStage].completed}
        >
          Next Stage →
        </button>
      </div>
    </div>
  );
}
