"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { readAiDailyLimit, useAiDailyLimit } from "@/lib/use-ai-daily-limit";
import AiLimitNotice from "@/components/AiLimitNotice";
import { useMobileSession } from "../../_lib/mobile-session-context";

// Mobile bug-fix plan, Phase 3d — AI chat widget for the Me page's lower
// third, above BottomNav. Chat mechanics (message list, loading state,
// POST /api/coach with {question, language}) are ported from the legacy
// embedded mobile dashboard's AICoachSheet (removed 2026-10-09) — same
// endpoint, same stateless-per-request contract (confirmed
// with the user: v1 ships stateless, no persisted history).
//
// NOT reusing the existing .coach-float-wrap/.coach-float-panel CSS in
// app/globals.css despite it being built for exactly this minimize/expand
// mechanic — that CSS uses light-theme desktop tokens (--surface-raised,
// --green, --line, rgba(255,255,255,...) panels) which would render as a
// jarring white glass panel against this app's dark --*-mobile theme, and
// every other file in app/mobile/ styles with inline `style={{}}` + the
// --*-mobile token set rather than global classes. Built fresh here to match
// both the real color theme and this tree's established convention — the
// *mechanic* (fixed position, minimize-to-pill, expand-to-panel) is what's
// ported, not the stylesheet.

type ChatMessage = { role: "user" | "assistant"; text: string };

const PRESET_QUESTIONS = [
  "Quiz me on tonight's specials",
  "What's the spec for a Negroni?",
  "How do I handle a complaint about a corked wine?",
];

const WIDGET_BOTTOM = "calc(84px + env(safe-area-inset-bottom, 0px))"; // 84px = BottomNav's 64px tab row + 20px indicator strip

// Starts closed (2026-10-14). On the first visit to Me after each sign-in, a
// small "AI Coach" bubble shows beside the button for five seconds. The
// sign-in is identified by the session_id claim in the access token, which
// stays the same when the token refreshes and changes on the next sign-in.
const HINT_KEY = "sbe_ai_coach_hint_session";
const HINT_MS = 5000;

function loginSessionId(token: string): string | null {
  try {
    const part = token.split(".")[1];
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as { session_id?: string; iat?: number };
    return json.session_id ?? null;
  } catch {
    return null;
  }
}

export default function AiCoachWidget() {
  const session = useMobileSession();
  const [minimized, setMinimized] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLimit, setAiLimit] = useAiDailyLimit();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sessionId = loginSessionId(session.token);
    if (!sessionId) return;
    try {
      if (localStorage.getItem(HINT_KEY) === sessionId) return;
      localStorage.setItem(HINT_KEY, sessionId);
    } catch {
      return; // storage blocked: skip the hint rather than show it on every visit
    }
    setShowHint(true);
  }, [session.token]);

  // Separate from the check above, so a re-run of that effect (which finds
  // the session already recorded) cannot cancel the timer.
  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(() => setShowHint(false), HINT_MS);
    return () => window.clearTimeout(timer);
  }, [showHint]);

  function openCoach() {
    setShowHint(false);
    setMinimized(false);
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function askCoach(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading || aiLimit) return;
    setError("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ question: trimmed, language: "en-AU" }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      const limit = res.status === 429 ? readAiDailyLimit(data) : null;
      if (limit) {
        setAiLimit(limit);
        return;
      }
      if (!res.ok || !data.answer) throw new Error(data.error || "Could not get a response.");
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Coach is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input;
    setInput("");
    void askCoach(q);
  }

  if (minimized) {
    return (
      <div
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: `calc(${WIDGET_BOTTOM} + 12px)`,
          width: "100%",
          maxWidth: "var(--mobile-frame-max)",
          padding: "0 20px",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {showHint && (
          <button
            type="button"
            onClick={openCoach}
            className="sbe-coach-hint"
            style={{
              position: "relative",
              pointerEvents: "auto",
              padding: "9px 14px",
              borderRadius: 14,
              background: "var(--surface-mobile)",
              border: "1px solid var(--gold-mobile)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              color: "var(--text-mobile)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            AI Coach
            {/* tail pointing at the button */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -6,
                top: "50%",
                width: 10,
                height: 10,
                marginTop: -5,
                background: "var(--surface-mobile)",
                borderTop: "1px solid var(--gold-mobile)",
                borderRight: "1px solid var(--gold-mobile)",
                transform: "rotate(45deg)",
              }}
            />
          </button>
        )}
        <button
          type="button"
          onClick={openCoach}
          aria-label="Open AI Coach"
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: "var(--radius-pill)",
            background: "var(--gold-mobile)",
            border: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            cursor: "pointer",
          }}
        >
          <Sparkles size={24} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const hasConversation = messages.length > 0 || loading;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: WIDGET_BOTTOM,
        width: "100%",
        maxWidth: "var(--mobile-frame-max)",
        padding: "0 20px",
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "38vh",
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-mobile)",
          border: "1px solid var(--border-mobile)",
          boxShadow: "0 -8px 28px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 10px 16px", borderBottom: "1px solid var(--border-mobile)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "var(--radius-pill)", background: "var(--gold-mobile-bg)" }}>
              <Sparkles size={14} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-mobile)" }}>AI Coach</p>
          </div>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            aria-label="Minimise AI Coach"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile-alt)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={14} strokeWidth={2} color="var(--text-mobile-muted)" aria-hidden="true" />
          </button>
        </div>

        {/* body */}
        {hasConversation ? (
          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "10px 16px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: msg.role === "user" ? "var(--gold-mobile)" : "var(--surface-mobile-alt)",
                  color: msg.role === "user" ? "var(--bg-mobile-dark)" : "var(--text-mobile)",
                  borderRadius: 12,
                  padding: "9px 12px",
                  fontSize: 13,
                  lineHeight: 1.45,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", background: "var(--surface-mobile-alt)", borderRadius: 12, padding: "9px 12px", fontSize: 13, color: "var(--text-mobile-muted)" }}>
                Thinking…
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "12px 16px 4px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-mobile-muted)" }}>
              Ask anything: specs, service scenarios, or a quick quiz.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PRESET_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void askCoach(q)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--gold-mobile-bg)",
                    border: "1px solid var(--gold-mobile)",
                    color: "var(--gold-mobile)",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiLimit ? (
          <AiLimitNotice limit={aiLimit} linkColor="var(--green-mobile)" style={{ margin: "0 16px 8px", fontSize: 11, color: "var(--red-mobile)" }} />
        ) : (
          error && <p style={{ margin: "0 16px 8px", fontSize: 11, color: "var(--red-mobile)" }}>{error}</p>
        )}

        {/* input dock */}
        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, borderTop: "1px solid var(--border-mobile)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the coach…"
            style={{
              flex: 1,
              minWidth: 0,
              padding: "9px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--surface-mobile-alt)",
              border: "1px solid var(--border-mobile)",
              color: "var(--text-mobile)",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !!aiLimit}
            aria-label="Send"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: input.trim() ? "var(--gold-mobile)" : "var(--surface-mobile-alt)",
              cursor: input.trim() ? "pointer" : "default",
              opacity: loading || !input.trim() ? 0.6 : 1,
            }}
          >
            <Send size={15} strokeWidth={2} color={input.trim() ? "var(--bg-mobile-dark)" : "var(--text-mobile-muted)"} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
