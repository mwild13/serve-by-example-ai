"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const STARTER_PROMPTS = [
  "What's the recipe for a Sazerac?",
  "How should I recover a guest complaint quickly?",
  "Give me a simple upsell line for premium spirits.",
];

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
  const [isListening, setIsListening] = useState(false);
  const outputRef = useRef<HTMLDivElement | null>(null);

  const canUseVoice = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const win = window as Window & {
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
    };

    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }, []);

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

  function handleVoiceInput() {
    if (!canUseVoice || isListening) {
      return;
    }

    const win = window as Window & {
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
    };

    const Recognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.lang = getCurrentLanguage();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setInput((prev) => `${prev} ${transcript}`.trim());
    };

    recognition.onerror = () => {
      setError("Voice input failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  }

  return (
    <div className="coach-float-wrap" data-no-translate="true">
      <div className="coach-float-panel">
        <div className="coach-float-head">
          <strong>AI Training Coach</strong>
          <span>24/7 instant shift support</span>
        </div>

        <div className="coach-float-output" ref={outputRef} aria-live="polite">
          {messages.length === 0 ? (
            <div className="coach-float-empty">
              <p>Ask recipes, service standards, policy checks, or upsell ideas.</p>
              <div className="coach-float-prompts">
                {STARTER_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => void askCoach(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`coach-msg coach-msg-${msg.role}`}>
                {msg.text}
              </div>
            ))
          )}
          {isLoading ? <div className="coach-msg coach-msg-assistant">Thinking...</div> : null}
        </div>

        {error ? <div className="coach-float-error">{error}</div> : null}

        <form className="coach-float-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask AI Coach anything..."
            aria-label="Ask AI Coach"
          />
          {canUseVoice ? (
            <button
              type="button"
              className={`coach-voice-btn${isListening ? " listening" : ""}`}
              onClick={handleVoiceInput}
              aria-label="Use voice input"
            >
              {isListening ? "Listening" : "Voice"}
            </button>
          ) : null}
          <button type="submit" className="coach-send-btn" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
