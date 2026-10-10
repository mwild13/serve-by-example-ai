"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Send } from "lucide-react";
import type { ManagementSnapshot } from "@/lib/management/types";
import { PageHead } from "./console-ui";

// The Ask AI Coach tab. Extracted from ManagerControlCenter.tsx in October
// 2026 and laid out to fill the window: the conversation on the left with
// the question box pinned to its foot, starting points on the right.
//
// Messages and the submit handler stay in the parent, because other tabs can
// pre-fill a question (Teams' "Ask AI Coach" link) before this one mounts.
//
// Each question is answered on its own: /api/management/coach is not sent
// earlier messages. Saved history exists so the manager can read back, and
// "New chat" deletes it for this venue after one confirmation.

type CoachMessage = { role: "user" | "coach"; content: string };

const SUGGESTIONS = [
  "Who needs the most attention this week?",
  "Which staff are falling behind on training?",
  "What are my top upselling risks?",
  "Who is close to full mastery?",
  "Summarise this venue's performance.",
];

export interface AICoachPanelProps {
  venueName: string | undefined;
  messages: CoachMessage[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Deletes the saved conversation for this venue. Resolves false if it could not be deleted. */
  onNewChat: () => Promise<boolean>;
  needsAttention: ManagementSnapshot["staff"];
}

export function AICoachPanel({ venueName, messages, input, setInput, loading, onSubmit, onNewChat, needsAttention }: AICoachPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, loading]);

  function startFrom(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  async function handleConfirmNewChat() {
    setClearing(true);
    setClearError(false);
    const ok = await onNewChat();
    setClearing(false);
    if (ok) setConfirming(false);
    else setClearError(true);
  }

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="mc-page mc-coach-page">
      <PageHead
        title="Ask AI Coach"
        description={`Answers drawn from ${venueName ?? "your venue"}'s staff, training and scores.`}
        actions={
          messages.length === 0 ? undefined : confirming ? (
            <div className="mc-coach-confirm" role="alertdialog" aria-label="Delete this conversation">
              <span>{clearError ? "Could not delete. Try again?" : "Delete this conversation for good?"}</span>
              <button type="button" className="mc-btn mc-btn-danger mc-btn-sm" onClick={handleConfirmNewChat} disabled={clearing}>
                {clearing ? "Deleting…" : "Delete"}
              </button>
              <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" onClick={() => { setConfirming(false); setClearError(false); }} disabled={clearing}>
                Keep it
              </button>
            </div>
          ) : (
            <button type="button" className="mc-btn mc-btn-quiet" onClick={() => setConfirming(true)}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              New chat
            </button>
          )
        }
      />

      <div className="mc-coach">
        <section className="mc-panel mc-coach-chat" aria-label="Conversation">
          <div className="mc-coach-messages" aria-live="polite">
            {messages.length === 0 && !loading ? (
              <div className="mc-coach-empty">
                <h3>What would you like to know?</h3>
                <p>Ask about a person, a team or the venue as a whole. Pick a starting point on the right or type your own question below.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`mc-coach-msg${message.role === "user" ? " is-user" : ""}`}>
                  {message.role === "coach" && <span className="mc-caps mc-coach-msg-label">AI Coach</span>}
                  <p>{message.content}</p>
                </div>
              ))
            )}
            {loading && (
              <div className="mc-coach-msg" role="status" aria-label="AI Coach is writing">
                <span className="mc-caps mc-coach-msg-label">AI Coach</span>
                <div className="mc-coach-thinking"><span style={{ width: "90%" }} /><span style={{ width: "75%" }} /><span style={{ width: "55%" }} /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="mc-coach-form" onSubmit={onSubmit}>
            <div className="mc-coach-form-row">
              <textarea
                ref={inputRef}
                className="mc-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your staff, training or venue performance"
                aria-label="Your question"
                disabled={loading}
                rows={1}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (canSend) event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button type="submit" className="mc-btn mc-btn-primary" disabled={!canSend}>
                {loading ? "Thinking…" : "Send"}
                {!loading && <Send size={16} strokeWidth={1.75} aria-hidden="true" />}
              </button>
            </div>
            <p className="mc-coach-hint">Press Enter to send, Shift and Enter for a new line. Do not share salary or financial details.</p>
          </form>
        </section>

        <aside className="mc-panel mc-coach-aside" aria-label="Starting points">
          <span className="mc-caps">Suggested questions</span>
          <div>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" className="mc-row" onClick={() => startFrom(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
          {needsAttention.length > 0 && (
            <>
              <span className="mc-caps">Ask about someone who needs follow-up</span>
              <div>
                {needsAttention.slice(0, 5).map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    className="mc-row"
                    onClick={() => startFrom(`${member.name} (${member.role}, ${Math.round(member.progress)}% training, last active ${member.lastActive}): `)}
                  >
                    <span className="mc-row-main">
                      <span className="mc-row-title" style={{ display: "block" }}>{member.name}</span>
                      <span className="mc-row-meta">{member.role} · {Math.round(member.progress)}% complete</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
