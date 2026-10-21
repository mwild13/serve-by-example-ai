"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { readAiDailyLimit, useAiDailyLimit } from "@/lib/use-ai-daily-limit";
import AiLimitNotice from "@/components/AiLimitNotice";
import { useMobileSession } from "../../_lib/mobile-session-context";

// The AI Coach on Me: a button above the tab bar that opens a small chat.
// POST /api/coach with {question, language}, one question at a time, no
// saved history. Redesign phase 6: on the sm-coach rules in
// app/styles/staff.css, bottle green rather than gold (gold is for streaks
// and goals), and a 16px text box so iPhone doesn't zoom in on it.

type ChatMessage = { role: "user" | "assistant"; text: string };

const PRESET_QUESTIONS = [
  "Quiz me on tonight's specials",
  "What's the spec for a Negroni?",
  "How do I handle a complaint about a corked wine?",
];

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
    // Browser-only check, once per sign-in.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="sm-coach sm-coach--closed">
        {showHint && (
          <button type="button" onClick={openCoach} className="sm-coach-hint">
            AI Coach
          </button>
        )}
        <button type="button" onClick={openCoach} aria-label="Open AI Coach" className="sm-coach-fab">
          <Sparkles size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    );
  }

  const hasConversation = messages.length > 0 || loading;

  return (
    <div className="sm-coach">
      <div className="sm-card sm-coach-panel" role="dialog" aria-label="AI Coach">
        <div className="sm-coach-head">
          <span className="sm-icon-circle sm-coach-icon" aria-hidden="true">
            <Sparkles size={16} strokeWidth={2.2} />
          </span>
          <p className="sm-card-title">AI Coach</p>
          <button type="button" onClick={() => setMinimized(true)} aria-label="Close AI Coach" className="sm-icon-btn sm-coach-close">
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        {hasConversation ? (
          <div ref={scrollRef} className="sm-coach-body" aria-live="polite">
            {messages.map((msg, i) => (
              <p key={i} className={`sm-coach-msg${msg.role === "user" ? " sm-coach-msg--me" : ""}`}>
                {msg.text}
              </p>
            ))}
            {loading && <p className="sm-coach-msg sm-coach-msg--wait">Thinking…</p>}
          </div>
        ) : (
          <div className="sm-coach-intro">
            <p className="sm-card-sub">Ask anything: specs, service, or a quick quiz.</p>
            <div className="sm-coach-chips">
              {PRESET_QUESTIONS.map((q) => (
                <button key={q} type="button" className="sm-coach-chip" onClick={() => void askCoach(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiLimit ? (
          <AiLimitNotice limit={aiLimit} linkColor="var(--sm-good)" style={{ margin: "0 16px 8px", fontSize: 13, color: "var(--sm-alarm)" }} />
        ) : (
          error && <p className="sm-coach-error">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="sm-coach-form">
          <label className="sr-only" htmlFor="sm-coach-input">
            Your question
          </label>
          <input
            id="sm-coach-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the coach"
            className="sm-input sm-coach-input"
            enterKeyHint="send"
          />
          <button type="submit" disabled={loading || !input.trim() || !!aiLimit} aria-label="Send" className="sm-coach-send">
            <Send size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
