'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const SCENARIO =
  'A guest sits at the bar and asks: "I want something smooth but with a bit of a kick — what would you recommend?" Walk me through how you\'d respond.';

type Phase = 'idle' | 'loading' | 'result';

interface EvalResult {
  overallScore: number;
  strengths: string;
  improvement: string;
}

export default function HeroPlayableSandbox() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'idle' && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [phase, result]);

  async function handleSubmit() {
    if (!input.trim() || phase === 'loading') return;
    setPhase('loading');
    setError('');
    try {
      const res = await fetch('/api/demo/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: SCENARIO, userResponse: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setPhase('idle');
        return;
      }
      setResult({
        overallScore: data.overallScore,
        strengths: data.strengths,
        improvement: data.improvement,
      });
      setPhase('result');
    } catch {
      setError('Network error. Please try again.');
      setPhase('idle');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleReset() {
    setPhase('idle');
    setInput('');
    setResult(null);
    setError('');
  }

  return (
    <div className="phone-frame">
      <div className="phone-frame-inner">
        <div className="phone-chat-window">

          {/* Header */}
          <div className="phone-chat-header">
            <div className="phone-chat-header-dot" aria-hidden="true" />
            <span className="phone-chat-header-title">SBE Hospitality Training</span>
            <svg className="phone-chat-header-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1.5 8.5a13 13 0 0 1 21 0M5 12a10 10 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h.01"/>
            </svg>
          </div>

          {/* Messages */}
          <div className="phone-chat-messages" ref={messagesRef}>

            {/* Scenario bubble */}
            <div className="phone-chat-bubble-ai">
              <div className="phone-chat-bubble-label">AI Coach</div>
              <p>{SCENARIO}</p>
            </div>

            {/* User reply */}
            {phase !== 'idle' && (
              <div className="phone-chat-bubble-user">
                <p>{input}</p>
              </div>
            )}

            {/* Loading */}
            {phase === 'loading' && (
              <div className="phone-chat-bubble-ai">
                <div className="phone-chat-typing" aria-label="Evaluating response">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* Result */}
            {phase === 'result' && result && (
              <div className="phone-chat-bubble-ai phone-chat-bubble-result">
                <div className="phone-chat-score">
                  <span className="phone-chat-score-value">{result.overallScore}</span>
                  <span className="phone-chat-score-denom">/25</span>
                </div>
                <p className="phone-chat-feedback">{result.strengths}</p>
                {result.improvement && (
                  <p className="phone-chat-improvement">To improve: {result.improvement}</p>
                )}
                <button className="phone-chat-retry-btn" onClick={handleReset}>
                  Try again
                </button>
              </div>
            )}

          </div>

          {/* Error */}
          {error && (
            <p className="phone-chat-error" role="alert">{error}</p>
          )}

          {/* Input */}
          {phase === 'idle' && (
            <div className="phone-chat-input-bar">
              <textarea
                className="phone-chat-textarea"
                placeholder="Type your response..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={1000}
                aria-label="Your response to the scenario"
              />
              <button
                className="phone-chat-send-btn"
                onClick={handleSubmit}
                disabled={!input.trim()}
                aria-label="Submit response"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          )}

          {/* After result: try more */}
          {phase === 'result' && (
            <div className="phone-chat-cta-row">
              <Link href="/demo" className="phone-chat-more-link">
                Try more scenarios
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
