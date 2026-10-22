"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/consent";
import {
  DEMO_GUEST,
  DEMO_TURNS,
  MOOD_LABEL,
  SAFETY_LABEL,
  SPEED_LABEL,
  START_STATE,
  applyChoice,
  calmsFound,
  moneyTotal,
  newCalmsByTurn,
  scoreChoices,
  type DemoChoice,
  type DemoMood,
  type DemoState,
} from "@/lib/demo-guest";

// The order each turn's replies are shown in (indexes into DEMO_TURNS, which
// lists the best first), so the right answer isn't always in the same place.
const SHOW_ORDER = [
  [1, 0, 2],
  [2, 0, 1],
  [2, 1, 0],
];

// How long Sharon "types" before she answers. Skipped under reduced motion.
const TYPING_MS = 900;

const name = DEMO_GUEST.name;

function tone(level: DemoMood): "low" | "mid" | "high" {
  return level <= 2 ? "low" : level === 3 ? "mid" : "high";
}

function Meter({ label, level, text }: { label: string; level: DemoMood; text: string }) {
  return (
    <div className="lgd-dial">
      <span className="lgd-dial-name">{label}</span>
      <span className={`lgd-dial-value lgd-tone-${tone(level)}`}>{text}</span>
      <span className="lgd-pips" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= level ? `lgd-pip lgd-pip-on lgd-tone-${tone(level)}` : "lgd-pip"} />
        ))}
      </span>
    </div>
  );
}

function Dials({ state }: { state: DemoState }) {
  const cost = -moneyTotal(state.money);
  return (
    <div className="lgd-dials" aria-label="The four dials">
      <Meter label="Guest" level={state.mood} text={MOOD_LABEL[state.mood]} />
      <Meter label="Speed" level={state.speed} text={SPEED_LABEL[state.speed]} />
      <Meter label="Safety" level={state.safety} text={SAFETY_LABEL[state.safety]} />
      <div className="lgd-dial">
        <span className="lgd-dial-name">Money</span>
        <span className="lgd-dial-value">{cost === 0 ? "$0" : `$${cost} at cost`}</span>
        <span className="lgd-dial-note">
          {state.money.length === 0
            ? "A remake or a freebie shows here"
            : state.money.map((id) => DEMO_GUEST.money.find((m) => m.id === id)?.label).join(", ")}
        </span>
      </div>
    </div>
  );
}

function Bubble({ who, text }: { who: "guest" | "you"; text: string }) {
  return (
    <li className={`lgd-line lgd-line-${who}`}>
      <span className="lgd-line-who">{who === "guest" ? name : "You"}</span>
      <p className="lgd-bubble">{text}</p>
    </li>
  );
}

export default function GuestDemo() {
  const [picks, setPicks] = useState<DemoChoice[]>([]);
  const [typing, setTyping] = useState(false);
  const [answered, setAnswered] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = picks.slice(0, answered).reduce(applyChoice, START_STATE);
  const finished = answered === DEMO_TURNS.length;
  const turn = picks.length;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Keep the newest line in view as the conversation grows. At the end the
  // reveal scrolls itself into view instead.
  useEffect(() => {
    if (picks.length === 0 || answered === DEMO_TURNS.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [picks.length, answered]);

  useEffect(() => {
    if (!finished) return;
    const end = picks.reduce(applyChoice, START_STATE);
    const { score, passed } = scoreChoices(picks, end);
    trackEvent("demo_complete", { guest: DEMO_GUEST.id, score, passed: passed ? 1 : 0 });
  }, [finished, picks]);

  function choose(choice: DemoChoice) {
    if (typing || finished) return;
    if (picks.length === 0) trackEvent("demo_start", { guest: DEMO_GUEST.id });
    const next = [...picks, choice];
    setPicks(next);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setAnswered(next.length);
      return;
    }
    setTyping(true);
    timer.current = setTimeout(() => {
      setTyping(false);
      setAnswered(next.length);
    }, TYPING_MS);
  }

  function restart() {
    if (timer.current) clearTimeout(timer.current);
    setPicks([]);
    setAnswered(0);
    setTyping(false);
  }

  return (
    <section className="lgd container" aria-label={`Live Guest demo: ${DEMO_GUEST.title}`}>
      <div className="lgd-grid">
        <div className="lgd-convo">
          <div className="lgd-scene">
            <p className="sbe-mkt-kicker">
              {name} · {DEMO_GUEST.title}
            </p>
            <p className="lgd-scene-text">{DEMO_GUEST.setting}</p>
          </div>

          <ol className="lgd-lines" aria-live="polite">
            <Bubble who="guest" text={DEMO_GUEST.opening} />
            {picks.map((choice, i) => (
              <Fragment key={i}>
                <Bubble who="you" text={choice.text} />
                {i < answered ? <Bubble who="guest" text={choice.reply} /> : null}
              </Fragment>
            ))}
          </ol>

          {typing ? (
            <p className="lgd-typing">
              <span className="lgd-typing-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              {name} is answering
            </p>
          ) : null}

          {!finished && !typing ? (
            <div className="lgd-choices" role="group" aria-label={`Reply ${turn + 1} of ${DEMO_TURNS.length}`}>
              <p className="lgd-choices-label">
                Reply {turn + 1} of {DEMO_TURNS.length}: what do you say?
              </p>
              {SHOW_ORDER[turn].map((idx) => {
                const choice = DEMO_TURNS[turn][idx];
                return (
                  <button key={idx} type="button" className="lgd-choice" onClick={() => choose(choice)}>
                    {choice.text}
                  </button>
                );
              })}
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        <aside className="lgd-side" aria-label="How the conversation is going">
          <p className="lgd-side-title">How it&apos;s going</p>
          <Dials state={state} />
          <p className="lgd-side-note">
            In the app the dials stay hidden until the end, like on a real shift. Here you can watch them move.
          </p>
        </aside>
      </div>

      {finished ? <Reveal picks={picks} onAgain={restart} /> : null}
    </section>
  );
}

function Reveal({ picks, onAgain }: { picks: DemoChoice[]; onAgain: () => void }) {
  const end = picks.reduce(applyChoice, START_STATE);
  const { score, passed, capped } = scoreChoices(picks, end);
  const found = calmsFound(picks);
  const freshCalms = newCalmsByTurn(picks);
  const setOff = new Set(picks.flatMap((c) => c.setOff));
  const states = picks.reduce<DemoState[]>((acc, c) => [...acc, applyChoice(acc[acc.length - 1], c)], [START_STATE]);
  const ref = useRef<HTMLDivElement>(null);

  // Bring the result into view when the conversation ends.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }, []);

  return (
    <div className="lgd-reveal" ref={ref}>
      <div className={passed ? "lgd-verdict lgd-verdict-pass" : "lgd-verdict lgd-verdict-fail"}>
        <p className="lgd-verdict-title">
          {passed ? `${name} left happy.` : `${name} left ${MOOD_LABEL[end.mood].toLowerCase()}.`}
        </p>
        <p className="lgd-verdict-score">
          Score {score} · {passed ? "Passed" : "Not passed: 75 to pass"}
          {capped ? " · Sending the chicken back out unsafe caps the score at 40" : ""}
        </p>
      </div>

      <div className="lgd-reveal-grid">
        <div>
          <h2 className="lgd-reveal-title">What {name} was thinking</h2>
          <ol className="lgd-thoughts">
            {picks.map((c, i) => (
              <li key={i} className="lgd-thought">
                <p className="lgd-thought-you">You: &ldquo;{c.text}&rdquo;</p>
                <p className="lgd-thought-shift">
                  {MOOD_LABEL[states[i].mood]} <span aria-hidden="true">&rarr;</span>
                  <span className="sr-only"> became </span> {MOOD_LABEL[states[i + 1].mood]}
                </p>
                <p className="lgd-thought-text">{c.thought}</p>
                {freshCalms[i].map((h) => (
                  <p key={h} className="lgd-thought-help">Helped: {h}</p>
                ))}
                {c.setOff.map((s) => (
                  <p key={s} className="lgd-thought-worse">Made it worse: {s}</p>
                ))}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="lgd-reveal-title">What {name} wanted</h2>
          <p className="lgd-wants">{DEMO_GUEST.wants}</p>
          <h3 className="lgd-list-title">What helps ({found.length} of {DEMO_GUEST.calms.length} found)</h3>
          <ul className="lgd-checks">
            {DEMO_GUEST.calms.map((c) => (
              <li key={c} className={found.includes(c) ? "lgd-check lgd-check-yes" : "lgd-check"}>
                <span className="sr-only">{found.includes(c) ? "Found: " : "Missed: "}</span>
                {c}
              </li>
            ))}
          </ul>
          <h3 className="lgd-list-title">What makes it worse</h3>
          <ul className="lgd-checks">
            {DEMO_GUEST.setsOff.map((s) => (
              <li key={s} className={setOff.has(s) ? "lgd-check lgd-check-no" : "lgd-check"}>
                <span className="sr-only">{setOff.has(s) ? "You did this: " : ""}</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lgd-console">
        <div className="lgd-console-copy">
          <p className="sbe-mkt-kicker">Manager side</p>
          <h2 className="lgd-reveal-title">This lands in the Manager Console as it happens.</h2>
          <p>
            You see who has sorted which guests, how the guest felt at each turn, and what every reply did to speed,
            safety and money. No chasing anyone for updates.
          </p>
        </div>
        <div className="lgd-console-row" aria-label="Example row in the Manager Console">
          <span className="lgd-console-avatar" aria-hidden="true">Y</span>
          <span className="lgd-console-who">
            <strong>You</strong>
            <span>Floor · Live Guest: {DEMO_GUEST.title}</span>
          </span>
          <span className="lgd-console-score">{score}</span>
          <span className={passed ? "lgd-console-status lgd-console-ready" : "lgd-console-status lgd-console-follow"}>
            {passed ? "Ready" : "Needs follow-up"}
          </span>
        </div>
      </div>

      <div className="lgd-next">
        <div>
          <h2 className="lgd-reveal-title">{name} is one of 60 guests.</h2>
          <p>
            In the app nobody picks from a list. Your team types what they would actually say, and the guest answers
            whatever they type.
          </p>
        </div>
        <div className="lgd-next-actions">
          <Link href="/login?intent=trial&tier=boutique" className="sbe-mkt-btn-primary">
            Start my 14-day trial
          </Link>
          <button type="button" className="sbe-mkt-btn-text" onClick={onAgain}>
            Talk to {name} again
          </button>
        </div>
      </div>
    </div>
  );
}
