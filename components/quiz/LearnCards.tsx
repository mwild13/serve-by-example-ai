"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LearnCard } from "@/lib/learn-cards";

// The Learn cards a module opens with, before its quiz. Shared by desktop
// ModuleVerify (light) and mobile QuizScreen (dark), like QuizRun.
// Swipe on touch, arrow keys on desktop, or the Back and Next buttons.
// Styles: the .lc rules in app/styles/staff.css.

type Props = {
  cards: LearnCard[];
  /** Called from the last card, or from "Skip to quiz". */
  onDone: () => void;
  /** Starts a test-out instead. Offered on every card when set. */
  onTestOut?: () => void;
  theme: "light" | "dark";
};

/** How far a finger has to travel sideways to count as a swipe. */
const SWIPE_PX = 50;

export default function LearnCards({ cards, onDone, onTestOut, theme }: Props) {
  const [index, setIndex] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const card = cards[index];
  const last = index === cards.length - 1;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.min(Math.max(i + delta, 0), cards.length - 1));
    },
    [cards.length],
  );

  const forward = useCallback(() => {
    if (last) onDone();
    else go(1);
  }, [go, last, onDone]);

  // Desktop keys: left and right arrows.
  useEffect(() => {
    if (theme !== "light") return;
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.key === "ArrowRight") forward();
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [forward, go, theme]);

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: React.PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Mostly sideways, so a scroll down the card isn't read as a swipe.
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) forward();
    else go(-1);
  }

  if (!card) return null;

  return (
    <div className={`qz qz--${theme} lc`}>
      <div className="lc-top">
        <p className="lc-count">Learn {index + 1} of {cards.length}</p>
        <button type="button" className="lc-skip" onClick={onDone}>
          Skip to quiz
        </button>
      </div>

      <div
        key={card.id}
        className="qz-card lc-card"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
        aria-live="polite"
      >
        <h2 className="qz-prompt lc-title">{card.title}</h2>
        <p className="lc-rule">{card.rule}</p>
        <div className="lc-why">
          <p className="lc-why-label">Why it matters</p>
          <p className="lc-why-text">{card.why}</p>
        </div>
      </div>

      <div className="lc-dots" aria-hidden="true">
        {cards.map((c, i) => (
          <span key={c.id} className={i === index ? "lc-dot lc-dot--on" : "lc-dot"} />
        ))}
      </div>

      <div className="lc-nav">
        <button type="button" className="lc-back" onClick={() => go(-1)} disabled={index === 0}>
          Back
        </button>
        <button type="button" className="qz-next lc-forward" onClick={forward}>
          {last ? "Start the quiz" : "Next"}
        </button>
      </div>

      {onTestOut && (
        <p className="lc-testout">
          Know this already?{" "}
          <button type="button" className="lc-testout-link" onClick={onTestOut}>
            Test out
          </button>
        </p>
      )}
    </div>
  );
}
