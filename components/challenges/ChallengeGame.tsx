"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type {
  Challenge,
  ChoiceChallenge,
  FillChallenge,
  MatchChallenge,
  SequenceChallenge,
  SpotChallenge,
} from "@/lib/challenge-content";

// One challenge, whatever its kind, on the staff desktop and on mobile
// (lib/challenge-content.ts). It reports every answer: solved false for a
// miss (the person can try again), solved true once it's right. The page
// decides what a miss costs. Styles: the sd-cg rules in staff.css.

export type ChallengeResult = { solved: boolean };
type GameProps<C> = { challenge: C; onResult: (r: ChallengeResult) => void };

export default function ChallengeGame({ challenge, onResult }: GameProps<Challenge>) {
  switch (challenge.kind) {
    case "sequence":
      return <SequenceGame challenge={challenge} onResult={onResult} />;
    case "fill":
      return <FillGame challenge={challenge} onResult={onResult} />;
    case "match":
      return <MatchGame challenge={challenge} onResult={onResult} />;
    case "spot":
      return <SpotGame challenge={challenge} onResult={onResult} />;
    case "choice":
      return <ChoiceGame challenge={challenge} onResult={onResult} />;
  }
}

function Feedback({ right, explanation, onRetry }: { right: boolean; explanation: string; onRetry?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  return (
    <div ref={ref} className={`sd-cg-feedback ${right ? "is-right" : "is-wrong"}`} role="status">
      <p className="sd-cg-feedback-head">
        {right ? <Check size={16} strokeWidth={2.5} aria-hidden /> : <X size={16} strokeWidth={2.5} aria-hidden />}
        {right ? "That's it" : "Not quite"}
      </p>
      <p className="sd-cg-feedback-body">{explanation}</p>
      {!right && onRetry && (
        <button type="button" className="sd-btn sd-btn-ghost" onClick={onRetry}>
          <RotateCcw size={15} strokeWidth={2} aria-hidden />
          Try again
        </button>
      )}
    </div>
  );
}

function SequenceGame({ challenge, onResult }: GameProps<SequenceChallenge>) {
  const byId = new Map(challenge.steps.map((s) => [s.id, s.text]));
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const pool = challenge.shuffled.filter((id) => !picked.includes(id));
  const correct = challenge.steps.map((s) => s.id);

  function check() {
    const right = picked.every((id, i) => id === correct[i]);
    setChecked(right);
    onResult({ solved: right });
  }

  return (
    <>
      <p className="sd-cg-prompt">{challenge.prompt}</p>
      <ol className="sd-cg-order" aria-label="Your order">
        {correct.map((_, i) => {
          const id = picked[i];
          const state = checked === null || !id ? "" : id === correct[i] ? " is-right" : " is-wrong";
          return (
            <li key={i}>
              <span className="sd-cg-order-num" aria-hidden>{i + 1}</span>
              {id ? (
                <button
                  type="button"
                  className={`sd-cg-chip is-placed${state}`}
                  disabled={checked !== null}
                  onClick={() => setPicked(picked.filter((p) => p !== id))}
                  aria-label={`${byId.get(id)}, step ${i + 1}. Remove`}
                >
                  {byId.get(id)}
                </button>
              ) : (
                <span className="sd-cg-slot">Step {i + 1}</span>
              )}
            </li>
          );
        })}
      </ol>
      {pool.length > 0 && (
        <div className="sd-cg-bank" aria-label="Steps to place">
          {pool.map((id) => (
            <button key={id} type="button" className="sd-cg-chip" onClick={() => setPicked([...picked, id])}>
              {byId.get(id)}
            </button>
          ))}
        </div>
      )}
      {checked === null ? (
        <div className="sd-actions">
          <button type="button" className="sd-btn sd-btn-primary" disabled={pool.length > 0} onClick={check}>
            Check the order
          </button>
          {picked.length > 0 && (
            <button type="button" className="sd-btn sd-btn-ghost" onClick={() => setPicked([])}>
              Clear
            </button>
          )}
        </div>
      ) : (
        <Feedback
          right={checked}
          explanation={challenge.explanation}
          onRetry={() => {
            setPicked([]);
            setChecked(null);
          }}
        />
      )}
    </>
  );
}

function FillGame({ challenge, onResult }: GameProps<FillChallenge>) {
  const [filled, setFilled] = useState<(string | null)[]>(() => challenge.answers.map(() => null));
  const [active, setActive] = useState<number | null>(0);
  const [checked, setChecked] = useState<boolean | null>(null);
  const complete = filled.every(Boolean);

  function place(word: string) {
    if (checked !== null) return;
    const slot = active ?? filled.findIndex((f) => !f);
    if (slot === -1) return;
    const next = filled.map((f, i) => (i === slot ? word : f));
    setFilled(next);
    const after = next.findIndex((f, i) => i > slot && !f);
    const first = next.findIndex((f) => !f);
    setActive(after !== -1 ? after : first !== -1 ? first : null);
  }

  function check() {
    const right = filled.every((f, i) => f === challenge.answers[i]);
    setChecked(right);
    onResult({ solved: right });
  }

  return (
    <>
      <p className="sd-cg-prompt">{challenge.prompt}</p>
      <p className="sd-cg-sentence">
        {challenge.parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < challenge.answers.length && (
              <button
                type="button"
                className={`sd-cg-blank${active === i && checked === null ? " is-active" : ""}${filled[i] ? " is-filled" : ""}${
                  checked === null ? "" : filled[i] === challenge.answers[i] ? " is-right" : " is-wrong"
                }`}
                disabled={checked !== null}
                onClick={() => {
                  if (filled[i]) setFilled(filled.map((f, j) => (j === i ? null : f)));
                  setActive(i);
                }}
                aria-label={filled[i] ? `Blank ${i + 1}: ${filled[i]}. Clear it` : `Blank ${i + 1}, empty`}
              >
                {filled[i] ?? " "}
              </button>
            )}
          </span>
        ))}
      </p>
      <div className="sd-cg-bank" aria-label="Words">
        {challenge.bank.map((word) => {
          const used = filled.includes(word);
          return (
            <button key={word} type="button" className={`sd-cg-chip${used ? " is-used" : ""}`} disabled={used || checked !== null} onClick={() => place(word)}>
              {word}
            </button>
          );
        })}
      </div>
      {checked === null ? (
        <div className="sd-actions">
          <button type="button" className="sd-btn sd-btn-primary" disabled={!complete} onClick={check}>
            Check it
          </button>
        </div>
      ) : (
        <Feedback
          right={checked}
          explanation={challenge.explanation}
          onRetry={() => {
            setFilled(challenge.answers.map(() => null));
            setActive(0);
            setChecked(null);
          }}
        />
      )}
    </>
  );
}

function MatchGame({ challenge, onResult }: GameProps<MatchChallenge>) {
  const [left, setLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = matched.length === challenge.pairs.length;

  function pickRight(pair: number) {
    if (left === null || matched.includes(pair)) return;
    if (pair === left) {
      const next = [...matched, pair];
      setMatched(next);
      setLeft(null);
      setWrong(null);
      if (next.length === challenge.pairs.length) onResult({ solved: true });
    } else {
      setWrong(pair);
      onResult({ solved: false });
    }
  }

  return (
    <>
      <p className="sd-cg-prompt">{challenge.prompt}</p>
      <div className="sd-cg-match">
        <div>
          <p className="sd-label">{challenge.leftLabel}</p>
          <ul>
            {challenge.pairs.map((p, i) => {
              const isDone = matched.includes(i);
              return (
                <li key={p.left}>
                  <button
                    type="button"
                    className={`sd-cg-chip${left === i ? " is-selected" : ""}${isDone ? " is-right" : ""}`}
                    disabled={isDone}
                    aria-pressed={left === i}
                    onClick={() => {
                      setLeft(i);
                      setWrong(null);
                    }}
                  >
                    {p.left}
                    {isDone && <Check size={15} strokeWidth={2.5} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="sd-label">{challenge.rightLabel}</p>
          <ul>
            {challenge.rightOrder.map((i) => {
              const isDone = matched.includes(i);
              return (
                <li key={challenge.pairs[i].right}>
                  <button
                    type="button"
                    className={`sd-cg-chip${isDone ? " is-right" : ""}${wrong === i ? " is-wrong" : ""}`}
                    disabled={isDone || left === null}
                    onClick={() => pickRight(i)}
                  >
                    {challenge.pairs[i].right}
                    {isDone && <Check size={15} strokeWidth={2.5} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {!done && (
        <p className="sd-note" aria-live="polite">
          {wrong !== null
            ? `${challenge.pairs[wrong].right} isn't the one. Try another.`
            : left === null
              ? `Pick a ${challenge.leftLabel.toLowerCase()} first.`
              : `Now pick its ${challenge.rightLabel.toLowerCase()}.`}
        </p>
      )}
      {done && <Feedback right explanation={challenge.explanation} />}
    </>
  );
}

function SpotGame({ challenge, onResult }: GameProps<SpotChallenge>) {
  const [tapped, setTapped] = useState<string | null>(null);
  const right = tapped !== null && !!challenge.lines.find((l) => l.id === tapped)?.wrong;

  return (
    <>
      <p className="sd-cg-prompt">{challenge.prompt}</p>
      <div className="sd-cg-card">
        <p className="sd-cg-card-title">{challenge.cardTitle}</p>
        <ul>
          {challenge.lines.map((line) => {
            const state = tapped === line.id ? (line.wrong ? " is-right" : " is-wrong") : "";
            return (
              <li key={line.id}>
                <button
                  type="button"
                  className={`sd-cg-line${state}`}
                  disabled={tapped !== null}
                  onClick={() => {
                    setTapped(line.id);
                    onResult({ solved: !!line.wrong });
                  }}
                >
                  {line.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {tapped !== null && <Feedback right={right} explanation={challenge.explanation} onRetry={() => setTapped(null)} />}
    </>
  );
}

function ChoiceGame({ challenge, onResult }: GameProps<ChoiceChallenge>) {
  const [chosen, setChosen] = useState<string | null>(null);
  const right = chosen !== null && !!challenge.options.find((o) => o.id === chosen)?.correct;

  return (
    <>
      <p className="sd-cg-prompt">{challenge.prompt}</p>
      <ul className="sd-cg-options">
        {challenge.options.map((o, i) => {
          const state = chosen === o.id ? (o.correct ? " is-right" : " is-wrong") : "";
          return (
            <li key={o.id}>
              <button
                type="button"
                className={`sd-cg-option${state}`}
                disabled={chosen !== null}
                onClick={() => {
                  setChosen(o.id);
                  onResult({ solved: !!o.correct });
                }}
              >
                <span className="sd-cg-option-key" aria-hidden>{String.fromCharCode(65 + i)}</span>
                {o.text}
              </button>
            </li>
          );
        })}
      </ul>
      {chosen !== null && <Feedback right={right} explanation={challenge.explanation} onRetry={() => setChosen(null)} />}
    </>
  );
}
