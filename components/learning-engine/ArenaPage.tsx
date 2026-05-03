"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AssessmentResult = {
  score: number;
  what_you_did_well: string;
  room_for_improvement: string;
  passed: boolean;
};

type Props = { userId: string };

const MODULE_META: Record<number, { title: string; category: "technical" | "service" | "compliance" }> = {
  1:  { title: "Pouring the Perfect Beer",        category: "technical"   },
  2:  { title: "Wine Knowledge & Service",         category: "technical"   },
  3:  { title: "Cocktail Fundamentals",            category: "technical"   },
  4:  { title: "Coffee / Barista Basics",          category: "technical"   },
  5:  { title: "Carrying Glassware & Trays",       category: "technical"   },
  6:  { title: "Cleaning & Sanitation",            category: "technical"   },
  7:  { title: "Bar Back Efficiency",              category: "technical"   },
  8:  { title: "The Art of the Greeting",          category: "service"     },
  9:  { title: "Managing Table Dynamics",          category: "service"     },
  10: { title: "Anticipatory Service",             category: "service"     },
  11: { title: "Handling Guest Complaints",        category: "service"     },
  12: { title: "Up-selling & Suggestive Sales",    category: "service"     },
  13: { title: "VIP / Table Management",           category: "service"     },
  14: { title: "Phone Etiquette & Reservations",   category: "service"     },
  15: { title: "RSA",                              category: "compliance"  },
  16: { title: "Food Safety & Hygiene",            category: "compliance"  },
  17: { title: "Conflict De-escalation",           category: "compliance"  },
  18: { title: "Emergency Evacuation Protocols",   category: "compliance"  },
  19: { title: "Opening & Closing Procedures",     category: "compliance"  },
  20: { title: "Inventory & Waste Control",        category: "compliance"  },
};

const CATEGORY_ACCENT: Record<"technical" | "service" | "compliance", string> = {
  technical:  "#1E5A3C",
  service:    "#B98220",
  compliance: "#7A4F2C",
};

const ARENA_SEED_SCENARIOS: Record<number, { situation: string; context: string; task: string }> = {
  1:  { situation: "A guest sends back a schooner of draught, complaining it's 'mostly head and tastes flat.' You notice the glass feels warm to the touch.",
        context: "The pub is packed and you are mid-rush.",
        task: "Explain how you fix the drink and handle the guest professionally." },
  2:  { situation: "A guest says: 'I usually like a heavy red, something like a Cabernet, but I want to try an Australian Shiraz. Is the one from the Barossa very different?'",
        context: "A couple is looking at the wine list. One is a confident heavy-red drinker curious about local varietals.",
        task: "Explain the profile difference and make a confident recommendation." },
  3:  { situation: "A guest yells over the music: 'I want something sweet but strong, not too fruity, maybe with gin? But I hate tonic. Just make me something good!'",
        context: "It is 9 PM on a Saturday, the bar is three-deep, and a rowdy hens party has arrived.",
        task: "Describe what you recommend and how you handle this efficiently." },
  4:  { situation: "A customer shouts their order over the grinder: 'Can I get a large skinny cap, extra hot, and a flat white on soy?'",
        context: "It is the 8 AM weekday rush and you already have five dockets on the machine.",
        task: "Explain how you confirm the order and manage the queue professionally." },
  5:  { situation: "You are clearing a large table with heavy schooner glasses, wine glasses, and a half-full water jug. A guest tries to help by handing you a stack of unstable plates while you are mid-lift.",
        context: "The bistro is busy and your load is already at safe capacity.",
        task: "Describe how you respond to protect your load while keeping the guest feeling appreciated." },
  6:  { situation: "While clearing the floor, you notice a broken glass and a spilled drink near the high-traffic entrance to the toilets.",
        context: "You are the only staff member on the floor and you have three drinks in your hand.",
        task: "Explain your immediate actions to secure the hazard and protect guest safety." },
  7:  { situation: "The bartender yells that they are out of clean schooner glasses and the ice bin is empty.",
        context: "The main bar is getting slammed and you are currently restocking the coolroom.",
        task: "Explain how you prioritise your next 60 seconds and why." },
  8:  { situation: "A local regular and a group of tourists who look lost arrive at the bar at the same time.",
        context: "You are mid-pour on a Guinness and cannot leave your station.",
        task: "Describe exactly how you acknowledge both parties within three seconds without abandoning your pour." },
  9:  { situation: "Two guests at a table of eight are ready to order, but the other six are deep in conversation with their menus closed.",
        context: "The kitchen closes in 15 minutes.",
        task: "Explain how you move the table along professionally without making anyone feel rushed." },
  10: { situation: "You notice a guest in the lounge has just finished their Shiraz and is looking around the room for staff.",
        context: "You are currently heading to the bistro with another table's order.",
        task: "Describe how you handle this check-in without dropping your current task." },
  11: { situation: "A guest pushes to the front of the bar: 'Mate, we ordered our parmys 45 minutes ago. Those guys next to us sat down after we did and they are already eating. What is going on?'",
        context: "It is a busy Sunday session and the bistro is slammed.",
        task: "Explain how you empathise, investigate, and resolve this without blaming the kitchen in front of the guest." },
  12: { situation: "A guest asks: 'What lagers do you have on tap?'",
        context: "You have a standard house pour and a premium local craft lager that was just tapped, costing $2 more.",
        task: "Explain how you steer them toward the premium option naturally and without being pushy." },
  13: { situation: "A VIP regular who always spends big arrives without a booking: 'Hey, I am here for my usual booth. You know I always sit there.'",
        context: "It is a fully committed Saturday night and their usual booth is occupied by a family.",
        task: "Explain how you protect the seated guests while retaining the VIP's goodwill." },
  14: { situation: "The phone rings during the lunch rush. A guest wants to book a table for twenty people tonight.",
        context: "Your system shows you are already at full capacity for tonight.",
        task: "Explain how you deliver the bad news warmly and protect the relationship for a future booking." },
  15: { situation: "It is Friday night, 11:30 PM. A regular stumbles up, leaning heavily against the counter. He slaps a $50 note down: 'Mate, just give us one more schooner of New and a shot of JD. I am fine, I promise.'",
        context: "The guest is clearly intoxicated and other patrons are watching.",
        task: "Explain how you refuse service firmly and compassionately in compliance with RSA, without escalating or humiliating the guest." },
  16: { situation: "You are about to run a tray of food when you notice the Gluten Free burger is on the same plate as a regular bun.",
        context: "The guest is a known coeliac and the food is about to leave the pass.",
        task: "Explain what you say to the kitchen and how you manage the guest's wait without alarming them." },
  17: { situation: "A group in the TAB area are getting loud, swearing, and leaning over other patrons' tables.",
        context: "Other guests are visibly uncomfortable. You have approached to settle them down.",
        task: "Explain your approach to de-escalate without confrontation and protect the comfort of surrounding guests." },
  18: { situation: "The fire alarm starts ringing during a busy Friday night service.",
        context: "Patrons are confused — some are trying to finish their drinks, others are heading back for their bags.",
        task: "Explain how you take command of the room calmly and direct all guests to the exit without creating panic." },
  19: { situation: "You have just completed the final till count at 2 AM and you are $100 short.",
        context: "Your lift home is waiting outside and the alarm needs to be set.",
        task: "Explain the correct protocol you follow before leaving, and why skipping it is not an option." },
  20: { situation: "You notice a co-worker is consistently over-pouring spirits and forgetting to ring up staff drinks for their mates.",
        context: "This has been happening repeatedly and is hitting the venue's gross profit.",
        task: "Explain how you address this — whether directly with the co-worker or by escalating to management — and why." },
};

export default function ArenaPage({ userId: _userId }: Props) {
  const [phase, setPhase] = useState<"select" | "writing" | "result">("select");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  async function authHeaders(): Promise<Record<string, string>> {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    return headers;
  }

  function selectModule(moduleId: number) {
    setSelectedId(moduleId);
    setResponse("");
    setError(null);
    setResult(null);
    setPhase("writing");
  }

  async function submitResponse() {
    if (!response.trim() || !selectedId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const seed = ARENA_SEED_SCENARIOS[selectedId]!;
      const scenario = `Situation: ${seed.situation}\nContext: ${seed.context}\nTask: ${seed.task}`;
      const headers = await authHeaders();
      const res = await fetch("/api/arena/evaluate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "evaluate",
          moduleId: selectedId,
          moduleTitle: MODULE_META[selectedId]?.title,
          scenario,
          response: response.trim(),
        }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) throw new Error((data.error as string | undefined) ?? `Request failed (${res.status})`);
      setResult(data.assessment as AssessmentResult);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setPhase("select");
    setSelectedId(null);
    setResponse("");
    setResult(null);
    setError(null);
  }

  // ── Module selection ────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div>
        <div
          className="sbe-command-bar sbe-command-bar-active"
          style={{ color: "white", marginBottom: "1.75rem" }}
        >
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">AI Scenarios</span>
            <strong>Choose a scenario to assess</strong>
            <span className="sbe-command-meta">
              Read the scenario, write your full response, receive an AI score out of 100
            </span>
          </div>
        </div>

        {error && <p style={{ color: "#7a1d1d", marginBottom: 12 }}>{error}</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {Object.entries(MODULE_META).map(([idStr, meta]) => {
            const id = Number(idStr);
            const accent = CATEGORY_ACCENT[meta.category];
            return (
              <div
                key={id}
                onClick={() => selectModule(id)}
                style={{
                  background: "white",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "1.25rem 1.4rem",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,106,79,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: accent,
                    textTransform: "uppercase",
                  }}
                >
                  {meta.category}
                </span>
                <strong
                  style={{
                    display: "block",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#1b4332",
                    marginTop: 6,
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {meta.title}
                </strong>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#92400e",
                    background: "#fef3c7",
                    borderRadius: "999px",
                    padding: "3px 12px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Start Assessment
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Result screen ───────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    const scoreColor =
      result.score >= 75 ? "#1E5A3C" : result.score >= 50 ? "#B98220" : "#7A4F2C";
    const meta = MODULE_META[selectedId!];
    return (
      <div>
        <div
          className="sbe-command-bar sbe-command-bar-active"
          style={{ color: "white", marginBottom: "1.75rem" }}
        >
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">AI Scenarios</span>
            <strong>Assessment Complete</strong>
            <span className="sbe-command-meta">{meta?.title ?? "Scenario"}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setPhase("writing"); setResult(null); setResponse(""); setError(null); }}
              className="sbe-command-btn btn"
              style={{ flexShrink: 0 }}
            >
              Try Again
            </button>
            <button
              onClick={reset}
              className="sbe-command-btn btn"
              style={{ flexShrink: 0 }}
            >
              All Scenarios
            </button>
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: "14px",
            padding: "2rem",
            maxWidth: 560,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "4rem", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                {result.score}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                out of 100
              </div>
            </div>
            <div
              style={{
                padding: "6px 16px",
                borderRadius: "999px",
                background: result.passed ? "#d1fae5" : "#fee2e2",
                color: result.passed ? "#065f46" : "#7f1d1d",
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "0.04em",
              }}
            >
              {result.passed ? "Passed" : "Not Yet"}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <strong
              style={{
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1E5A3C",
              }}
            >
              What you did well
            </strong>
            <p style={{ marginTop: 6, color: "#374151", fontSize: "0.9rem", lineHeight: 1.55 }}>
              {result.what_you_did_well}
            </p>
          </div>

          <div>
            <strong
              style={{
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#B98220",
              }}
            >
              Room for improvement
            </strong>
            <p style={{ marginTop: 6, color: "#374151", fontSize: "0.9rem", lineHeight: 1.55 }}>
              {result.room_for_improvement}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Writing phase ───────────────────────────────────────────────────────────
  const seed = ARENA_SEED_SCENARIOS[selectedId!];
  const meta = MODULE_META[selectedId!];
  const accent = meta ? CATEGORY_ACCENT[meta.category] : "#1E5A3C";

  return (
    <div>
      <div
        className="sbe-command-bar sbe-command-bar-active"
        style={{ color: "white", marginBottom: "1.75rem" }}
      >
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">AI Scenarios</span>
          <strong>{meta?.title ?? "Scenario"}</strong>
          <span className="sbe-command-meta">Read the scenario, then write your full response below</span>
        </div>
        <button onClick={reset} className="sbe-command-btn btn" style={{ flexShrink: 0 }}>
          Exit
        </button>
      </div>

      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {seed && (
          <div
            style={{
              background: "white",
              border: `1.5px solid ${accent}22`,
              borderLeft: `4px solid ${accent}`,
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: accent,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {meta?.category} — Scenario
            </div>
            <p style={{ fontWeight: 700, color: "#1b4332", fontSize: "0.95rem", lineHeight: 1.55, marginBottom: 10 }}>
              {seed.situation}
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: 10 }}>
              <strong style={{ color: "#374151" }}>Context:</strong> {seed.context}
            </p>
            <p style={{ color: "#374151", fontSize: "0.85rem", lineHeight: 1.5 }}>
              <strong>Your task:</strong> {seed.task}
            </p>
          </div>
        )}

        <div
          style={{
            background: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
          }}
        >
          <label
            htmlFor="arena-response"
            style={{
              display: "block",
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#6b7280",
              marginBottom: 10,
            }}
          >
            Your response
          </label>
          <textarea
            id="arena-response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write exactly what you would say and do in this situation. Be specific — the AI evaluates based on Australian hospitality standards."
            disabled={submitting}
            rows={8}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              fontSize: "0.9rem",
              lineHeight: 1.55,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              color: "#1f2937",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ color: "#7a1d1d", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>
          )}

          <button
            onClick={() => { void submitResponse(); }}
            disabled={submitting || !response.trim()}
            className="btn btn-primary"
            style={{ marginTop: 14, width: "100%", padding: "12px", fontSize: "0.95rem", fontWeight: 700 }}
          >
            {submitting ? "Evaluating..." : "Submit for Evaluation"}
          </button>
        </div>
      </div>
    </div>
  );
}
