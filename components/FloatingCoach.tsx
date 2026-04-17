"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function getCurrentLanguage() {
  if (typeof document === "undefined") {
    return "en-US";
  }

  return document.documentElement.getAttribute("data-ui-language") || "en-US";
}

export default function FloatingCoach() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMinimized, setIsMinimized] = useState(true);
  const [isAnswerCompact, setIsAnswerCompact] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const outputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.classList.add("ai-coach-enabled");
    return () => {
      document.body.classList.remove("ai-coach-enabled");
    };
  }, []);

  useEffect(() => {
    if (!outputRef.current) {
      return;
    }

    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateKeyboardOffset = () => {
      const vv = window.visualViewport;
      if (!vv) {
        setKeyboardOffset(0);
        return;
      }

      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset > 40 ? offset : 0);
    };

    const handleFocusIn = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      setIsInputFocused(false);
      window.setTimeout(updateKeyboardOffset, 100);
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateKeyboardOffset);
      vv.addEventListener("scroll", updateKeyboardOffset);
    }

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    window.addEventListener("orientationchange", updateKeyboardOffset);

    updateKeyboardOffset();

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updateKeyboardOffset);
        vv.removeEventListener("scroll", updateKeyboardOffset);
      }

      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("orientationchange", updateKeyboardOffset);
    };
  }, []);

  async function askCoach(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          language: getCurrentLanguage(),
        }),
      });

      const data = (await res.json()) as { answer?: string; error?: string };

      if (!res.ok || !data.answer) {
        throw new Error(data.error || "Could not get a response.");
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.answer || "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Coach is unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input;
    setInput("");
    await askCoach(question);
  }

  const coachWrapStyle = {
    "--coach-keyboard-offset": `${keyboardOffset}px`,
  } as CSSProperties;

  return (
    <div
      className={`coach-float-wrap${isMinimized ? " minimized" : ""}${keyboardOffset > 0 ? " keyboard-open" : ""}${isInputFocused ? " input-focused" : ""}`}
      data-no-translate="true"
      style={coachWrapStyle}
    >
      <div className="coach-float-panel">
        {isMinimized ? (
          <button
            type="button"
            className="coach-expand-btn"
            onClick={() => setIsMinimized(false)}
            aria-label="Expand AI Coach"
          >
            AI Coach
          </button>
        ) : (
          <>
            {(messages.length > 0 || isLoading) ? (
              <>
                <div className="coach-output-controls">
                  <button
                    type="button"
                    className="coach-output-toggle"
                    onClick={() => setIsAnswerCompact((prev) => !prev)}
                  >
                    {isAnswerCompact ? "Show more" : "Show less"}
                  </button>
                </div>
                <div
                  className={`coach-float-output${isAnswerCompact ? " compact" : ""}`}
                  ref={outputRef}
                  aria-live="polite"
                >
                  {messages.map((msg, index) => (
                    <div key={`${msg.role}-${index}`} className={`coach-msg coach-msg-${msg.role}`}>
                      {msg.text}
                    </div>
                  ))}
                  {isLoading ? <div className="coach-msg coach-msg-assistant">Thinking...</div> : null}
                </div>
              </>
            ) : null}

            {error ? <div className="coach-float-error">{error}</div> : null}

            <form className="coach-float-input" onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask AI Coach Anything..."
                aria-label="Ask AI Coach"
              />
              <button type="submit" className="coach-send-btn" disabled={isLoading || !input.trim()} aria-label="Send">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                className="coach-minimize-btn"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize AI Coach"
              >
                ㅡ
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
