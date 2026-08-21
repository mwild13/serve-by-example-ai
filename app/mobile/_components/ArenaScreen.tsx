"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Send } from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileSession } from "../_lib/mobile-session-context";

// Phase C file 04 — wired to the real single-shot POST /api/arena/evaluate
// endpoint (Locked Decision #2: one static scenario, one typed response, one
// score — this is not a multi-turn conversation, so the chat-shell layout
// below displays a single exchange, not a live thread). Scenario payload
// comes from ScenarioTrainingScreen's "Start Simulation" link via query
// params; falls back to the same copy if Arena is opened directly.

const DEFAULT_MODULE_ID = 11;
const DEFAULT_MODULE_TITLE = "Handling Guest Complaints";
const DEFAULT_SCENARIO =
  "A guest sends back a bottle of wine, claiming it's corked, but you can tell from the cork and the smell that it is fine — it's just not to their taste. They are becoming insistent and slightly hostile about wanting a refund or a replacement bottle immediately.";

const SUGGESTED_REPLIES = ["Apologize & Validate", "Ask Taste Questions", "Offer Different Pour"];

type Assessment = {
  score: number;
  what_you_did_well: string;
  room_for_improvement: string;
  passed: boolean;
};

export default function ArenaScreen() {
  const session = useMobileSession();
  const searchParams = useSearchParams();

  const moduleId = Number(searchParams.get("moduleId") ?? DEFAULT_MODULE_ID) || DEFAULT_MODULE_ID;
  const moduleTitle = searchParams.get("moduleTitle") ?? DEFAULT_MODULE_TITLE;
  const scenario = searchParams.get("scenario") ?? DEFAULT_SCENARIO;

  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/arena/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          action: "evaluate",
          moduleId,
          moduleTitle,
          scenario,
          response: trimmed,
        }),
      });

      if (res.status === 429) {
        setError("Too many requests. Try again in a minute.");
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Evaluation failed (${res.status})`);
      }

      const data = (await res.json()) as { assessment: Assessment };
      setAssessment(data.assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100dvh",
        background: "var(--bg-mobile-dark)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={20} strokeWidth={2} color="var(--gold-mobile)" aria-hidden="true" />
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-mobile)" }}>Live Arena</p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile-bg)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold-mobile)" }}>PRO</span>
          </div>
        </div>

        {/* scenario-card */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: 16,
              borderRadius: "var(--radius-md)",
              background: "var(--surface-mobile)",
              border: "1px solid var(--border-mobile)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--gold-mobile)", textTransform: "uppercase" }}>
                {moduleTitle}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-mobile-muted)" }}>{scenario}</p>
          </div>
        </div>

        {/* transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 20px 16px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "var(--radius-pill)",
                background: "var(--avatar-mobile-bg)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mobile)" }}>G</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxWidth: 260,
                padding: 12,
                borderRadius: "12px 12px 12px 4px",
                background: "var(--surface-mobile)",
                border: "1px solid var(--border-mobile)",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-mobile-muted)" }}>Guest</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: "18px", color: "var(--text-mobile)" }}>{scenario}</p>
            </div>
          </div>

          {response && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "flex-end" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxWidth: 260,
                  padding: 12,
                  borderRadius: "12px 12px 4px 12px",
                  background: "var(--gold-mobile-bg)",
                  border: "1px solid var(--gold-mobile)",
                }}
              >
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--gold-mobile)" }}>You</p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: "18px", color: "var(--text-mobile)" }}>{response}</p>
              </div>
            </div>
          )}

          {submitting && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>Evaluating your response…</p>
          )}

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: "var(--red-mobile)" }}>{error}</p>
          )}

          {assessment && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 16,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-mobile)",
                border: `1px solid ${assessment.passed ? "var(--green-mobile)" : "var(--red-mobile)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-mobile)" }}>
                  Score: {assessment.score}/100
                </p>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: assessment.passed ? "var(--green-mobile)" : "var(--red-mobile)",
                    textTransform: "uppercase",
                  }}
                >
                  {assessment.passed ? "Passed" : "Not yet"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                <strong style={{ color: "var(--text-mobile)" }}>What you did well: </strong>
                {assessment.what_you_did_well}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-mobile-muted)" }}>
                <strong style={{ color: "var(--text-mobile)" }}>Room for improvement: </strong>
                {assessment.room_for_improvement}
              </p>
            </div>
          )}

          {!assessment && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 20 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-mobile-muted)" }}>SUGGESTED RESPONSES</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SUGGESTED_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    disabled={submitting}
                    onClick={() => setResponse(reply)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-pill)",
                      background: "var(--gold-mobile-bg)",
                      border: "1px solid var(--gold-mobile)",
                      color: "var(--gold-mobile)",
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: submitting ? "default" : "pointer",
                      opacity: submitting ? 0.6 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* input-dock */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 16,
            background: "var(--surface-mobile)",
            borderTop: "1px solid var(--border-mobile)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-mobile-dark)",
            }}
          >
            <input
              type="text"
              placeholder="Type your response to the guest..."
              value={response}
              disabled={submitting || !!assessment}
              onChange={(e) => setResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(response);
              }}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--text-mobile)",
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => submit(response)}
            disabled={submitting || !!assessment || !response.trim()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-pill)",
              background: "var(--gold-mobile)",
              border: "none",
              flexShrink: 0,
              cursor: submitting || !!assessment || !response.trim() ? "default" : "pointer",
              opacity: submitting || !!assessment || !response.trim() ? 0.6 : 1,
            }}
            aria-label="Send response"
          >
            <Send size={16} strokeWidth={2} color="var(--bg-mobile-dark)" aria-hidden="true" />
          </button>
        </div>

        <BottomNav active="learn" />
      </div>
    </div>
  );
}
