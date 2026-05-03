"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type ChatMessage = { role: "assistant" | "user"; content: string };

type SeedContent = {
  opening_line: string;
  context: string;
  goal?: string;
};

type ArenaResult = {
  serviceScore: number;
  strengths: string;
  improvement: string;
  summary: string;
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

const MIN_TURNS_FOR_SCORE = 3;

function buildSeedText(seed: SeedContent): string {
  let text = `${seed.opening_line}\nContext: ${seed.context}`;
  if (seed.goal) text += `\nGoal: ${seed.goal}`;
  return text;
}

export default function ArenaPage({ userId }: Props) {
  const [phase, setPhase] = useState<"select" | "chat" | "result">("select");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [seedContent, setSeedContent] = useState<SeedContent | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ArenaResult | null>(null);

  async function authHeaders(): Promise<Record<string, string>> {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    return headers;
  }

  async function arenaFetch(body: Record<string, unknown>) {
    const headers = await authHeaders();
    const res = await fetch("/api/arena/evaluate", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json() as Record<string, unknown>;
    if (!res.ok) throw new Error((data.error as string | undefined) ?? `Request failed (${res.status})`);
    return data;
  }

  async function startArena(moduleId: number) {
    setSelectedId(moduleId);
    setMessages([]);
    setSeedContent(null);
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: scenario } = await supabase
        .from("scenarios")
        .select("content")
        .eq("module_id", moduleId)
        .eq("scenario_type", "roleplay")
        .eq("scenario_index", 40)
        .maybeSingle();

      if (scenario?.content) {
        const seed = scenario.content as SeedContent;
        setSeedContent(seed);
        setMessages([{ role: "assistant", content: seed.opening_line }]);
        setPhase("chat");
      } else {
        // Fallback: AI-generated opening if seed scenario not found
        const data = await arenaFetch({
          action: "start",
          moduleId,
          moduleTitle: MODULE_META[moduleId]?.title,
          userId,
        });
        setMessages([{ role: "assistant", content: data.opening as string }]);
        setPhase("chat");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start Arena.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply() {
    if (!input.trim() || !selectedId || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const data = await arenaFetch({
        action: "reply",
        moduleId: selectedId,
        moduleTitle: MODULE_META[selectedId]?.title,
        messages: next,
        userId,
        seedScenario: seedContent ? buildSeedText(seedContent) : undefined,
      });
      setMessages([...next, { role: "assistant", content: data.reply as string }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get reply.");
    } finally {
      setLoading(false);
    }
  }

  async function endAndScore() {
    if (!selectedId || loading) return;
    setLoading(true);
    setError(null);
    try {
      const transcript = messages
        .map((m) => `${m.role === "assistant" ? "Guest" : "Staff"}: ${m.content}`)
        .join("\n\n");
      const data = await arenaFetch({
        action: "score",
        moduleId: selectedId,
        moduleTitle: MODULE_META[selectedId]?.title,
        transcript,
        userId,
        seedScenario: seedContent ? buildSeedText(seedContent) : undefined,
      });
      setResult((data.arena as ArenaResult));
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to score session.");
    } finally {
      setLoading(false);
    }
  }

  function resetToSelect() {
    setPhase("select");
    setSelectedId(null);
    setMessages([]);
    setSeedContent(null);
    setResult(null);
    setError(null);
    setInput("");
  }

  const userTurns = messages.filter((m) => m.role === "user").length;

  // ── Module selection ────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div>
        <div
          className="sbe-command-bar sbe-command-bar-active"
          style={{ color: "white", marginBottom: "1.75rem" }}
        >
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">The Arena</span>
            <strong>Choose a module to practice</strong>
            <span className="sbe-command-meta">
              AI roleplay with a Difficult Guest — earn your Service Score
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
                onClick={() => { if (!loading) void startArena(id); }}
                style={{
                  background: "white",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "1.25rem 1.4rem",
                  cursor: loading ? "wait" : "pointer",
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
                  Enter Arena
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
      result.serviceScore >= 75
        ? "#1E5A3C"
        : result.serviceScore >= 50
        ? "#B98220"
        : "#7A4F2C";
    return (
      <div>
        <div
          className="sbe-command-bar sbe-command-bar-active"
          style={{ color: "white", marginBottom: "1.75rem" }}
        >
          <div className="sbe-command-text">
            <span className="sbe-command-eyebrow">The Arena</span>
            <strong>Session Complete</strong>
            <span className="sbe-command-meta">
              {MODULE_META[selectedId!]?.title ?? "Arena"}
            </span>
          </div>
          <button
            onClick={resetToSelect}
            className="sbe-command-btn btn"
            style={{ flexShrink: 0 }}
          >
            New Session
          </button>
        </div>

        <div
          style={{
            background: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: "14px",
            padding: "2rem",
            maxWidth: 540,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                fontSize: "4rem",
                fontWeight: 900,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {result.serviceScore}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Service Score
            </div>
          </div>

          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1b4332", marginBottom: 20 }}>
            {result.summary}
          </p>

          <div style={{ marginBottom: 16 }}>
            <strong
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1E5A3C",
              }}
            >
              Strengths
            </strong>
            <p style={{ marginTop: 4, color: "#374151", fontSize: "0.9rem" }}>{result.strengths}</p>
          </div>

          <div>
            <strong
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#B98220",
              }}
            >
              Coaching Note
            </strong>
            <p style={{ marginTop: 4, color: "#374151", fontSize: "0.9rem" }}>{result.improvement}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat phase ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div
        className="sbe-command-bar sbe-command-bar-active"
        style={{ color: "white", marginBottom: "1.75rem" }}
      >
        <div className="sbe-command-text">
          <span className="sbe-command-eyebrow">The Arena</span>
          <strong>{MODULE_META[selectedId!]?.title ?? "Roleplay"}</strong>
          <span className="sbe-command-meta">Respond to the Difficult Guest</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {userTurns >= MIN_TURNS_FOR_SCORE && (
            <button
              onClick={() => { void endAndScore(); }}
              disabled={loading}
              className="sbe-command-btn btn"
              style={{ flexShrink: 0, background: "#1E5A3C", color: "white" }}
            >
              End &amp; Score
            </button>
          )}
          <button
            onClick={resetToSelect}
            className="sbe-command-btn btn"
            style={{ flexShrink: 0 }}
          >
            Exit
          </button>
        </div>
      </div>

      <div
        style={{
          background: "white",
          border: "1.5px solid #e5e7eb",
          borderRadius: "14px",
          padding: "1.5rem",
          maxWidth: 640,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 16,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius:
                    m.role === "user"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  background: m.role === "user" ? "#1E5A3C" : "#f3f4f6",
                  color: m.role === "user" ? "white" : "#1f2937",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                <div
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    marginBottom: 4,
                    opacity: 0.65,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {m.role === "assistant" ? "Difficult Guest" : "You"}
                </div>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "#f3f4f6",
                  color: "#9ca3af",
                  fontSize: "0.9rem",
                }}
              >
                ...
              </div>
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: "#7a1d1d", fontSize: "0.85rem", marginBottom: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendReply();
              }
            }}
            placeholder="Type your response as the staff member..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1.5px solid #e5e7eb",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          <button
            onClick={() => { void sendReply(); }}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            Send
          </button>
        </div>

        {userTurns < MIN_TURNS_FOR_SCORE && userTurns > 0 && (
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }}>
            {MIN_TURNS_FOR_SCORE - userTurns} more response
            {MIN_TURNS_FOR_SCORE - userTurns > 1 ? "s" : ""} before you can end and score
          </p>
        )}
      </div>
    </div>
  );
}
