"use client";

import { useEffect, useState } from "react";

type Module = "bartending" | "sales" | "management";

type PillOption = {
  text: string;
  intent: string;
  positive: boolean;
};

type Scenario = {
  text: string;
  pills: PillOption[];
};

const SCENARIOS: Record<Module, Scenario[]> = {
  bartending: [
    {
      text: "The 'Surprise Me' guest says they like gin but are tired of a G&T. How do you ask clarifying questions, make a tailored recommendation, and then build it confidently?",
      pills: [
        { intent: "Clarify taste first", text: "Ask preferred flavour profile (citrus, herbal, bitter, sweet)", positive: true },
        { intent: "Recommend with confidence", text: "Suggest one drink and explain why it fits", positive: true },
        { intent: "Guess blindly", text: "Make any gin cocktail without asking questions", positive: false },
      ],
    },
    {
      text: "You have three orders at once: Mojito, Guinness, and house Chardonnay. Describe your exact workflow and mise-en-place so speed does not damage quality.",
      pills: [
        { intent: "Sequence efficiently", text: "Start Guinness first, build Mojito while it settles, then pour wine", positive: true },
        { intent: "Protect quality", text: "Set up glassware and garnish before touching bottles", positive: true },
        { intent: "Chaotic approach", text: "Bounce between drinks without a plan", positive: false },
      ],
    },
    {
      text: "A guest asks for a Brandy Frappé. Explain the recipe, correct glassware, and key technique to prepare this classic correctly.",
      pills: [
        { intent: "Show product knowledge", text: "Confirm ingredients and method before preparing", positive: true },
        { intent: "Communicate confidence", text: "Tell the guest what style they can expect (refreshing/brandy-led)", positive: true },
        { intent: "Pretend familiarity", text: "Make a random brandy drink and call it a Frappé", positive: false },
      ],
    },
    {
      text: "A guest wants a Margarita made with Scotch. How do you guide them professionally toward a better fit while still making them feel heard?",
      pills: [
        { intent: "Guide and suggest", text: "Explain why Scotch shifts the profile and suggest a Penicillin or Whisky Sour", positive: true },
        { intent: "Offer customisation boundaries", text: "Offer a custom riff with clear flavour expectations", positive: true },
        { intent: "Dismiss the request", text: "Tell them that request is wrong and refuse abruptly", positive: false },
      ],
    },
    {
      text: "It is 10 minutes to closing and a group asks for six complicated cocktails. How do you balance hospitality, speed, and team communication?",
      pills: [
        { intent: "Set expectations early", text: "Acknowledge warmly, explain realistic options, and offer a streamlined recommendation", positive: true },
        { intent: "Coordinate the team", text: "Split prep tasks and keep ticket communication tight", positive: true },
        { intent: "Overpromise", text: "Accept everything silently and let service collapse", positive: false },
      ],
    },
    {
      text: "A guest wants to understand Bourbon vs Rye through a three-whiskey flight. What do you choose and how do you explain each pour?",
      pills: [
        { intent: "Curate intentionally", text: "Pick one approachable bourbon, one high-rye bourbon, and one rye", positive: true },
        { intent: "Educate clearly", text: "Highlight sweetness vs spice, mash bill, and finish", positive: true },
        { intent: "Generic service", text: "Pour any three and let them figure it out", positive: false },
      ],
    },
    {
      text: "A guest asks for a 'strong but smooth' cocktail. How do you recommend something that matches both requests without overwhelming them?",
      pills: [
        { intent: "Taste-based recommendation", text: "Offer spirit-forward options with softer texture (e.g. Old Fashioned variation)", positive: true },
        { intent: "Set flavour expectations", text: "Explain alcohol intensity vs perceived smoothness", positive: true },
        { intent: "One-size-fits-all", text: "Automatically serve the highest-ABV drink", positive: false },
      ],
    },
    {
      text: "A guest asks why your Martini tastes better than usual. How do you explain vermouth handling, brand choice, and technique in a way that builds trust?",
      pills: [
        { intent: "Show process detail", text: "Explain chilled glass, fresh vermouth storage, dilution control, and proper stirring", positive: true },
        { intent: "Build confidence", text: "Translate technique into guest-facing quality language", positive: true },
        { intent: "Vague answer", text: "Say it is just the house style with no explanation", positive: false },
      ],
    },
    {
      text: "You believe a guest is intoxicated but they insist on another round of shots for the group. How do you decline service with tact and safety focus?",
      pills: [
        { intent: "Responsible refusal", text: "Decline politely, offer water/food, and involve support if needed", positive: true },
        { intent: "Calm de-escalation", text: "Keep tone neutral and avoid confrontation in front of others", positive: true },
        { intent: "Avoid conflict", text: "Serve the shots anyway to keep them happy", positive: false },
      ],
    },
    {
      text: "A guest orders a Sazerac. Walk through the exact spec, including the rinse, spirit choice, and garnish protocol.",
      pills: [
        { intent: "Technical accuracy", text: "Use correct base spirit, proper absinthe rinse, and lemon peel expression", positive: true },
        { intent: "Execution clarity", text: "Describe glass prep, dilution, and service language", positive: true },
        { intent: "Loose build", text: "Treat it like a generic stirred whiskey cocktail", positive: false },
      ],
    },
  ],
  sales: [
    {
      text: "A couple sits at the bar and orders two cocktails but has not opened the food menu. How do you introduce a snack or small plate in a way that feels helpful rather than pushy?",
      pills: [
        { intent: "Make it feel additive", text: "Suggest a snack that complements the cocktails they chose", positive: true },
        { intent: "Keep it low-pressure", text: "Frame it as something easy to share while they settle in", positive: true },
        { intent: "Push too hard", text: "Tell them they should really order food immediately", positive: false },
      ],
    },
    {
      text: "A table of eight is undecided and still reading menus. How do you recommend two appetizers for the table while positioning them as the best way to start?",
      pills: [
        { intent: "Lead the table", text: "Recommend two crowd-pleasers and explain why they work for sharing", positive: true },
        { intent: "Buy decision time", text: "Frame the starters as something to enjoy while mains are decided", positive: true },
        { intent: "Stay passive", text: "Wait for them to ask for appetizer ideas", positive: false },
      ],
    },
    {
      text: "A guest orders the sirloin, but your ribeye is the stronger premium sell. How do you describe the ribeye so the upsell feels natural and justified?",
      pills: [
        { intent: "Sell with value", text: "Explain the richer marbling, flavour and eating experience", positive: true },
        { intent: "Respect choice", text: "Keep the guest in control while highlighting the upgrade clearly", positive: true },
        { intent: "Pressure the guest", text: "Tell them the sirloin is not worth ordering", positive: false },
      ],
    },
    {
      text: "A guest asks, 'What's good tonight?' How do you answer by spotlighting one chef's special and pairing it with a wine or cocktail recommendation?",
      pills: [
        { intent: "Be specific", text: "Recommend one standout special and explain why it is performing well", positive: true },
        { intent: "Pair intelligently", text: "Attach a concrete beverage match to lift the overall order", positive: true },
        { intent: "Stay vague", text: "Say everything is good and leave it at that", positive: false },
      ],
    },
    {
      text: "A table says they are too full for dessert, but you know they are celebrating a birthday. How do you pivot to a shared dessert without sounding salesy?",
      pills: [
        { intent: "Make it celebratory", text: "Suggest one dessert to share as a small birthday moment", positive: true },
        { intent: "Reduce commitment", text: "Frame it as a few bites rather than a full extra course", positive: true },
        { intent: "Push the full dessert menu", text: "Insist they should all have a dessert each", positive: false },
      ],
    },
    {
      text: "A guest orders an espresso. How do you pair it immediately with a small dessert like tiramisu or a cookie plate as the perfect companion?",
      pills: [
        { intent: "Natural pairing", text: "Link the espresso to a small dessert as a classic finishing combination", positive: true },
        { intent: "Keep the scale right", text: "Offer a light option that feels easy to say yes to", positive: true },
        { intent: "Ignore the opening", text: "Serve the coffee and move on without mentioning dessert", positive: false },
      ],
    },
    {
      text: "A guest points to the house wine. How do you describe it briefly and then offer a taste of the next-tier premium glass without sounding pushy?",
      pills: [
        { intent: "Anchor then trade up", text: "Confirm the house option, then mention a premium by-the-glass upgrade with one clear benefit", positive: true },
        { intent: "Use sampling well", text: "Offer a taste to lower the decision risk", positive: true },
        { intent: "Dismiss the first choice", text: "Tell them the house wine is not very good", positive: false },
      ],
    },
    {
      text: "A guest orders a well vodka soda. How do you suggest a premium vodka and explain why it will make the drink smoother and cleaner?",
      pills: [
        { intent: "Explain the difference simply", text: "Highlight smoother finish and cleaner taste in the same serve", positive: true },
        { intent: "Keep the upsell relevant", text: "Recommend one specific premium vodka rather than a generic upsell", positive: true },
        { intent: "Upsell mechanically", text: "Ask 'Do you want premium?' without context", positive: false },
      ],
    },
    {
      text: "A table of four orders four different glasses of wine. How do you suggest a bottle they could all enjoy, while making the value case clearly?",
      pills: [
        { intent: "Do the maths for them", text: "Show how the bottle compares favourably against four individual glasses", positive: true },
        { intent: "Sell the shared experience", text: "Frame the bottle as a better table experience, not just a cheaper option", positive: true },
        { intent: "Overcomplicate it", text: "List too many bottle options and confuse the table", positive: false },
      ],
    },
    {
      text: "You overhear that a table is celebrating an anniversary. How do you acknowledge it and suggest Champagne or a special dessert so it feels personal rather than scripted?",
      pills: [
        { intent: "Personal recognition", text: "Acknowledge the occasion warmly and make one tailored suggestion", positive: true },
        { intent: "Enhance the moment", text: "Position the drink or dessert as part of the celebration", positive: true },
        { intent: "Force the sale", text: "Push the most expensive Champagne immediately", positive: false },
      ],
    },
  ],
  management: [
    {
      text: "A junior staff member shows great attitude but limited experience and has been stuck running food for months. How do you create a stepped progression plan that keeps them engaged and gives them a path forward?",
      pills: [
        { intent: "Build a progression path", text: "Set clear next skills, shadow shifts, and milestone check-ins", positive: true },
        { intent: "Keep them motivated", text: "Explain how good attitude and consistency lead to expanded responsibility", positive: true },
        { intent: "Leave them in limbo", text: "Keep them doing the same support role without a development plan", positive: false },
      ],
    },
    {
      text: "You have an experienced senior team member who is technically brilliant but hesitant to step into leadership. How do you back them and build their confidence?",
      pills: [
        { intent: "Coach with belief", text: "Name the leadership traits you already see and offer a supported first step", positive: true },
        { intent: "Reduce the leap", text: "Give them small leadership moments before a formal title change", positive: true },
        { intent: "Pressure them abruptly", text: "Tell them to step up immediately or miss their chance", positive: false },
      ],
    },
    {
      text: "Your company wants to implement structured progression plans like a formal development program. How do you introduce it to the team and get buy-in from skeptical staff?",
      pills: [
        { intent: "Make it relevant", text: "Connect the program to pay growth, confidence, and future opportunities", positive: true },
        { intent: "Set shared goals", text: "Help each person choose individual goals rather than forcing a generic plan", positive: true },
        { intent: "Impose it top-down", text: "Roll it out as mandatory admin with no explanation", positive: false },
      ],
    },
    {
      text: "A talented overseas staff member is invaluable, but their visa expires in 8 months. How do you start early conversations about sponsorship and a realistic pathway?",
      pills: [
        { intent: "Start early and clearly", text: "Open the conversation well before deadlines and explain business realities honestly", positive: true },
        { intent: "Create mutual value", text: "Discuss what the venue needs and what support the employee would need to stay", positive: true },
        { intent: "Delay the topic", text: "Wait until the visa is nearly over before raising it", positive: false },
      ],
    },
    {
      text: "You want to build a culture of reflection and continuous improvement. How do you implement a simple weekly 'I learned' practice without making it feel like homework?",
      pills: [
        { intent: "Keep it lightweight", text: "Ask each person to share one practical lesson from the week in a quick huddle", positive: true },
        { intent: "Normalize learning", text: "Model it yourself so the practice feels safe and useful", positive: true },
        { intent: "Overcomplicate it", text: "Turn it into a formal written assignment every week", positive: false },
      ],
    },
    {
      text: "A strong staff member resigns for only slightly more pay, saying they did not feel valued or see growth opportunities. How do you use that feedback before others follow?",
      pills: [
        { intent: "Treat it as system feedback", text: "Review recognition, progression, and manager communication patterns immediately", positive: true },
        { intent: "Act before attrition spreads", text: "Hold retention conversations with your key team members now", positive: true },
        { intent: "Write it off", text: "Assume they only left for money and change nothing", positive: false },
      ],
    },
    {
      text: "You want to improve morale and alignment with 5-minute pre-shift check-ins. How do you make these huddles useful rather than another empty meeting?",
      pills: [
        { intent: "Keep it focused", text: "Recognise wins, flag priorities, and align on the service goal of the shift", positive: true },
        { intent: "Build connection", text: "Use a consistent but brief format that includes team energy, not just tasks", positive: true },
        { intent: "Let it drag", text: "Turn it into a long lecture before every shift", positive: false },
      ],
    },
    {
      text: "Your team has been working excessive hours during a busy period. How do you restructure rosters to protect work-life balance without losing service standards?",
      pills: [
        { intent: "Prioritise sustainability", text: "Reduce repeated overloading, rotate tough shifts, and identify fatigue risks early", positive: true },
        { intent: "Protect performance long-term", text: "Explain that sustainable rosters support better service and lower turnover", positive: true },
        { intent: "Normalise burnout", text: "Keep stretching the same reliable staff because they can handle it", positive: false },
      ],
    },
    {
      text: "You want a simple, cost-free peer recognition system. How do you set it up so it feels authentic and builds appreciation rather than awkwardness?",
      pills: [
        { intent: "Make it specific", text: "Ask for concrete examples of helpful actions rather than generic praise", positive: true },
        { intent: "Keep it visible and simple", text: "Use a quick weekly nomination moment with genuine manager follow-through", positive: true },
        { intent: "Force participation", text: "Require everyone to nominate someone every shift", positive: false },
      ],
    },
    {
      text: "Owners see team building as an expense rather than an investment. How do you make the case for allocating budget to retention-focused culture activities?",
      pills: [
        { intent: "Use business logic", text: "Tie culture spend to retention, recruitment cost, and service consistency", positive: true },
        { intent: "Show operational upside", text: "Explain how stronger loyalty reduces turnover disruption and training drag", positive: true },
        { intent: "Pitch it emotionally only", text: "Argue that team bonding is just nice to have", positive: false },
      ],
    },
    {
      text: "A junior staff member apologises to a customer for a senior colleague's difficult manner during training. How do you coach both staff members to present a united front?",
      pills: [
        { intent: "Coach both sides", text: "Address the senior's warmth and the junior's front-of-house professionalism separately", positive: true },
        { intent: "Protect the guest experience", text: "Reinforce that internal frustrations should never be offloaded onto customers", positive: true },
        { intent: "Ignore the dynamic", text: "Treat it as personality clash and leave it unresolved", positive: false },
      ],
    },
    {
      text: "Tension is building between front-of-house and kitchen, with blame-shifting during busy services. How do you improve communication before it becomes toxic?",
      pills: [
        { intent: "Reset shared goals", text: "Bring both teams together around service outcomes rather than departmental blame", positive: true },
        { intent: "Create practical fixes", text: "Agree clearer call times, escalation rules, and post-service debriefs", positive: true },
        { intent: "Pick a side", text: "Back one department publicly and hope the other adapts", positive: false },
      ],
    },
    {
      text: "A sudden crisis happens while you are off-site. How do you identify and empower the right interim leader from the floor?",
      pills: [
        { intent: "Choose trusted calmness", text: "Pick the person others naturally follow under pressure, not just the loudest voice", positive: true },
        { intent: "Clarify authority", text: "Give explicit decision rights and support boundaries before stepping away", positive: true },
        { intent: "Choose by tenure alone", text: "Appoint the longest-serving person without considering trust or leadership", positive: false },
      ],
    },
    {
      text: "You have recently been promoted and keep micromanaging former peers. How do you learn to delegate properly without losing standards?",
      pills: [
        { intent: "Delegate with clarity", text: "Set the outcome, guardrails, and follow-up point instead of controlling each step", positive: true },
        { intent: "Let others grow", text: "Accept that some variation is part of development and not always failure", positive: true },
        { intent: "Hold every detail", text: "Keep taking tasks back whenever they are not done your exact way", positive: false },
      ],
    },
    {
      text: "During a busy crisis, one staff member froze or abandoned their post. After service, how do you distinguish between someone who tried but failed and someone who gave up?",
      pills: [
        { intent: "Diagnose before judging", text: "Ask what they saw, thought, and attempted before deciding the response", positive: true },
        { intent: "Match response to cause", text: "Use coaching for capability gaps and firmer accountability for disengagement", positive: true },
        { intent: "Treat all failure the same", text: "Issue the same warning without understanding what happened", positive: false },
      ],
    },
    {
      text: "A new staff member is unsure about gaming room responsible service requirements and a patron is showing early distress. How do you turn this into a teaching moment while staying compliant?",
      pills: [
        { intent: "Protect compliance first", text: "Step in immediately, support the patron appropriately, and explain the why afterward", positive: true },
        { intent: "Teach in context", text: "Use the live situation to reinforce duty of care and procedure", positive: true },
        { intent: "Delay action", text: "Wait until later and hope the issue settles on its own", positive: false },
      ],
    },
    {
      text: "A regular guest is becoming intoxicated, but the team likes them and a junior staff member is unsure how to cut them off. How do you support the staff member and handle the guest?",
      pills: [
        { intent: "Back the junior staff member", text: "Step in visibly, reinforce the decision, and keep the interaction respectful", positive: true },
        { intent: "Use it as protocol training", text: "Debrief the incident to strengthen future confidence and consistency", positive: true },
        { intent: "Protect the relationship over safety", text: "Let the regular slide because they are well-known", positive: false },
      ],
    },
    {
      text: "You are onboarding new staff and want to start with the venue's 'why' instead of only task lists. How do you do that in a practical, meaningful way?",
      pills: [
        { intent: "Connect purpose to behaviour", text: "Explain the service philosophy and how it shapes everyday decisions on the floor", positive: true },
        { intent: "Make it concrete", text: "Use real examples of what great service looks like in your venue", positive: true },
        { intent: "Stay purely procedural", text: "Skip the purpose and only cover tasks and rules", positive: false },
      ],
    },
    {
      text: "You want to give your management team more visibility over business finances and decisions. How do you introduce financial literacy without overwhelming them?",
      pills: [
        { intent: "Start with essentials", text: "Focus on a few useful metrics like labour, margin, and average spend first", positive: true },
        { intent: "Build confidence gradually", text: "Translate numbers into operational choices they can actually influence", positive: true },
        { intent: "Dump raw data", text: "Expose full financial detail all at once without context", positive: false },
      ],
    },
    {
      text: "You want junior staff to build better relationships with regulars. How do you introduce a simple 'regulars file' system without making it creepy or overly formal?",
      pills: [
        { intent: "Keep it respectful", text: "Track useful service notes like names, favourite orders, and harmless preferences", positive: true },
        { intent: "Make it practical", text: "Explain how it helps newer staff deliver warmer, more confident service", positive: true },
        { intent: "Overcollect data", text: "Encourage staff to record overly personal details about guests", positive: false },
      ],
    },
  ],
};

const SCENARIO_INSIGHTS: Record<Module, string[]> = {
  bartending: [
    "Great bartenders turn vague preferences into clear questions, then convert that information into a recommendation that feels personal and assured.",
    "Fast service looks effortless when the sequence is deliberate, because workflow protects both speed and drink quality.",
    "Classic credibility comes from accurate specs, correct glassware, and the confidence to explain what makes the drink true to style.",
    "Guest trust grows when you redirect with respect, offering a better-fit alternative instead of correcting them with ego.",
    "Late-night hospitality is not about saying yes to everything. It is about setting honest boundaries while still giving the group a good finish.",
    "A strong flight teaches contrast, so the guest leaves understanding why each pour is different rather than just tasting three whiskies.",
    "Strong and smooth are different ideas, and the best recommendation balances alcohol presence with texture, dilution, and flavour comfort.",
    "Technique becomes value when the guest can feel the difference in the glass and understand why your process improves the drink.",
    "Responsible service protects the guest, the team, and the venue's licence in a single decision, so tact matters as much as firmness.",
    "Precision classics reveal whether your fundamentals are truly solid, because small misses in prep or garnish change the whole serve.",
  ],
  sales: [
    "The best upsells solve the moment the guest is already in, so the suggestion feels helpful instead of like a separate sales pitch.",
    "Early starters create momentum for the table and make indecision easier, which improves both guest comfort and average spend.",
    "Premium sells land when the value is sensory and specific, giving the guest a reason to trade up beyond just paying more.",
    "One confident recommendation with a clear pairing gives guests direction and often lifts the entire order naturally.",
    "Celebration selling works best when it protects the mood, lowers the commitment, and makes the extra feel like part of the occasion.",
    "Coffee moments are powerful because they open the door to one final, low-friction add-on that still feels natural.",
    "Sampling lowers risk and lets the guest experience the upgrade for themselves, which is usually stronger than a hard sell.",
    "Spirit upgrades work when the guest can picture the difference in the exact drink they already want, not in abstract product language.",
    "Bottles sell best as a better shared experience, with value and convenience supporting the recommendation rather than leading it.",
    "Occasion-based selling feels genuine when the recommendation matches the emotion at the table and adds to the memory, not the pressure.",
  ],
  management: [
    "People stay engaged when progress is visible, because effort feels worthwhile when staff can see where it leads next.",
    "Future leaders usually need staged opportunities more than a sudden title, so confidence grows through supported repetition.",
    "Development programs gain buy-in when staff can see personal upside, not just another layer of process or admin.",
    "Early sponsorship conversations build trust because they replace uncertainty with realism and give both sides time to plan properly.",
    "Reflection only sticks when it is short, safe, and clearly useful enough to become part of the team's rhythm.",
    "Resignations often expose culture gaps long before the next person leaves, so one departure can be valuable operating feedback.",
    "Short huddles matter when they sharpen focus and energy, rather than becoming another place where information goes to die.",
    "Sustainable rostering protects service standards by protecting the people delivering them shift after shift.",
    "Recognition feels real when it notices behaviour and contribution specifically, not when it becomes forced praise.",
    "Culture investment is easiest to defend when it is tied to turnover, consistency, recruitment cost, and operational stability.",
    "Unified leadership means coaching disagreements privately while maintaining a calm, consistent service standard in front of guests.",
    "Cross-team tension usually improves when both sides are reset around one guest outcome instead of defending their own department.",
    "In a crisis, calm influence beats loud seniority because people follow the person who creates clarity under pressure.",
    "Delegation is not lowering standards. It is creating clear ownership, support, and accountability without hovering over every detail.",
    "Good managers separate capability gaps from commitment problems before reacting, because the right fix depends on the real cause.",
    "Compliance training lands better when staff can see duty of care in real time, not only in a policy document.",
    "Backing junior staff publicly teaches the whole team that safety standards and responsible service are applied consistently.",
    "Purpose-led onboarding gives new staff a reason behind the rules, which makes standards easier to remember and live.",
    "Financial literacy builds stronger managers when numbers are tied to decisions they can actually influence on the floor.",
    "Guest memory systems should deepen warmth and continuity, never cross into collecting details that feel intrusive or performative.",
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

const MODULE_META: Record<Module, { label: string; badge: string; description: string; progress: number; nextUp: string; color: string }> = {
  bartending: {
    label: "Bartending Training",
    badge: "72% complete",
    description: "Next: Guest acknowledgement",
    progress: 72,
    nextUp: "Guest acknowledgement",
    color: "var(--green)",
  },
  sales: {
    label: "Sales Training",
    badge: "48% complete",
    description: "Next: Objection handling",
    progress: 48,
    nextUp: "Objection handling",
    color: "var(--gold)",
  },
  management: {
    label: "Management Training",
    badge: "31% complete",
    description: "Next: Delegation under pressure",
    progress: 31,
    nextUp: "Delegation under pressure",
    color: "var(--green-mid)",
  },
};

const SCORE_DIMENSIONS = [
  { key: "communication" as keyof EvalResult, label: "Communication" },
  { key: "hospitalityBehaviour" as keyof EvalResult, label: "Hospitality" },
  { key: "problemSolving" as keyof EvalResult, label: "Problem solving" },
  { key: "professionalism" as keyof EvalResult, label: "Professionalism" },
  { key: "guestExperience" as keyof EvalResult, label: "Guest experience" },
] as const;

export default function DashboardTrainer({
  displayName,
  defaultModule,
}: {
  displayName: string;
  defaultModule?: Module;
}) {
  const [activeModule, setActiveModule] = useState<Module | null>(defaultModule ?? null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const currentScenario = activeModule ? SCENARIOS[activeModule][scenarioIndex] : null;
  const currentInsight = activeModule ? SCENARIO_INSIGHTS[activeModule][scenarioIndex] : null;

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

  function selectModule(mod: Module) {
    setActiveModule(mod);
    setScenarioIndex(0);
    setResponse("");
    setResult(null);
    setLastScore(null);
    setError("");
  }

  function nextScenario() {
    if (!activeModule) return;
    const prev = result?.overallScore ?? null;
    setLastScore(prev);
    const next = (scenarioIndex + 1) % SCENARIOS[activeModule].length;
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
      {/* Command bar — always visible, drives one action */}
      {!activeModule && (
        <div className="sbe-command-bar">
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">Recommended for you</span>
            <strong>Continue Bartending Training</strong>
            <span className="sbe-command-meta">⏱ ~6 min &nbsp;&nbsp; ⭐ +1 streak &nbsp;&nbsp; Next: Guest acknowledgement</span>
          </div>
          <button className="btn btn-primary sbe-command-btn" onClick={() => selectModule("bartending")}>
            Continue training →
          </button>
        </div>
      )}

      {/* Active module command bar */}
      {activeModule && !result && (
        <div className="sbe-command-bar sbe-command-bar-active">
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">{MODULE_META[activeModule].label}</span>
            <strong>Scenario {scenarioIndex + 1} of {SCENARIOS[activeModule].length}</strong>
            <span className="sbe-command-meta">{MODULE_META[activeModule].badge}</span>
          </div>
          <button className="btn btn-secondary sbe-back-btn" onClick={() => { setActiveModule(null); setResult(null); setResponse(""); }}>
            ← Back
          </button>
        </div>
      )}

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

      {/* Header */}
      {!activeModule && (
        <>
          <h1 className="dash-welcome">Welcome back, {displayName}.</h1>
          <p className="dash-copy">Choose a module to pick up where you left off — or follow the recommendation above.</p>
        </>
      )}

      {/* Module cards */}
      {!result && (
        <div className="dash-cards">
          {(Object.keys(MODULE_META) as Module[]).map((mod) => (
            <div
              key={mod}
              className={`dash-card${activeModule === mod ? " dash-card-active" : ""}`}
              onClick={() => selectModule(mod)}
              style={activeModule === mod ? { borderColor: MODULE_META[mod].color, boxShadow: `0 0 0 3px ${MODULE_META[mod].color}22` } : {}}
            >
              <h3>{MODULE_META[mod].label}</h3>
              <div className="dash-card-progress-row">
                <div className="dash-card-progress-bar">
                  <div className="dash-card-progress-fill" style={{ width: `${MODULE_META[mod].progress}%`, background: MODULE_META[mod].color }} />
                </div>
                <span className="dash-card-progress-pct">{MODULE_META[mod].progress}%</span>
              </div>
              <p className="dash-card-next">Next: {MODULE_META[mod].nextUp}</p>
              {activeModule === mod && <span className="dash-card-badge">Active</span>}
            </div>
          ))}
        </div>
      )}

      {/* Training session */}
      {activeModule && currentScenario && (
        <div className="trainer-panel">
          <div className="trainer-scenario">
            <span className="trainer-label">Scenario {scenarioIndex + 1} of {SCENARIOS[activeModule].length}</span>
            <p>{currentScenario.text}</p>
          </div>

          {!result && (
            <>
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
                  >
                    {loading ? "Evaluating…" : "Check my response"}
                  </button>
                  <button className="btn btn-secondary" onClick={nextScenario}>
                    Skip →
                  </button>
                </div>
              </div>
            </>
          )}

          {error && <div className="trainer-error">{error}</div>}

          {/* AI Result — visceral, focused feedback */}
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
                  <button className="btn btn-primary" onClick={nextScenario}>
                    I&apos;m ready →
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setResult(null); setResponse(""); }}>
                    Try again
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Default state — no module selected */}
      {!activeModule && (
        <div className="chat-box">
          <div className="chat-prompt">
            AI Coach: Use the recommendation above, or pick a module to begin a scored scenario session.
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


