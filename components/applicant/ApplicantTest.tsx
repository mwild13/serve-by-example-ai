"use client";

/*
 * ApplicantTest – the applicant's side of an applicant test
 * (docs/APPLICANT_TESTING.md §2).
 *
 * Welcome, with the venue's message and the collection notice, then one item
 * per screen until the last, then a thank you. No timer, no score and no
 * going back. Every answer goes to /api/applicant/[token]/answer with what
 * useAnswerSignals() measured while it was on screen.
 *
 * The server sends the next item ahead with each one, so answering shows it
 * straight away while the answer saves in the background. Saves go one at a
 * time, in order, and are retried; if one can't be saved, the page goes back
 * to where the server says the test is.
 */

import { useEffect, useRef, useState } from "react";
import {
  ApplicantTestError,
  WRITTEN_MAX_CHARS,
  WRITTEN_MIN_CHARS,
  currentApplicantItem,
  startApplicantTest,
  submitApplicantAnswer,
  type ApplicantAnswer,
  type ApplicantItemView,
  type ApplicantState,
  type SignalsPayload,
} from "@/lib/applicant/client";
import { useAnswerSignals } from "@/lib/applicant/use-answer-signals";
import { moveItem } from "@/lib/reorder";
import { useDragReorder } from "@/lib/use-drag-reorder";
import type { QuizOption, QuizQuestionView } from "@/lib/verify-quiz-client";

export type ApplicantStart =
  | { stage: "welcome"; venueName: string; firstName: string; intro: string; trackLabel: string }
  | { stage: "resume"; venueName: string }
  | { stage: "finished" }
  | { stage: "closed"; reason: "expired" | "withdrawn" }
  | { stage: "invalid" };

type Screen =
  | ApplicantStart
  | { stage: "loading" }
  | Extract<ApplicantState, { stage: "item" }>;

function fromState(state: ApplicantState): Screen {
  return state;
}

/** Tries a save up to three times for a dropped connection or a busy server. A refused answer isn't retried. */
async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  const waits = [800, 2000];
  for (let attempt = 0; ; attempt++) {
    try {
      return await run();
    } catch (err) {
      const retryable = !(err instanceof ApplicantTestError) || err.status >= 500 || err.status === 429;
      if (!retryable || attempt >= waits.length) throw err;
      await new Promise((resolve) => setTimeout(resolve, waits[attempt]));
    }
  }
}

export default function ApplicantTest({ token, start }: { token: string; start: ApplicantStart }) {
  const [screen, setScreen] = useState<Screen>(start.stage === "resume" ? { stage: "loading" } : start);
  const [error, setError] = useState<string | null>(null);
  const venueName = start.stage === "welcome" || start.stage === "resume" ? start.venueName : "the venue";
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Answers waiting to save, in order. `saving` is true while the screen waits on one.
  const saves = useRef<Promise<void>>(Promise.resolve());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /** A state from the server. The item already on screen stays as it is, so its options don't reshuffle. */
  function applyServer(state: ApplicantState) {
    setScreen((prev) => {
      if (state.stage !== "item") return state;
      if (prev.stage === "item" && prev.position === state.position) return { ...prev, upcoming: state.upcoming };
      if (prev.stage === "item" && prev.position > state.position) return prev;
      return state;
    });
  }

  function answer(position: number, value: ApplicantAnswer, signals: SignalsPayload) {
    setSaveError(null);
    const ahead = screen.stage === "item" && screen.position === position ? screen.upcoming : null;
    if (ahead) setScreen({ stage: "item", ...ahead, upcoming: null });
    else setSaving(true);

    saves.current = saves.current.then(async () => {
      try {
        applyServer(await withRetry(() => submitApplicantAnswer(token, position, value, signals)));
      } catch (err) {
        // Couldn't save it: go back to where the server says the test is, and say so.
        try {
          const state = await currentApplicantItem(token);
          setScreen(fromState(state));
          if (state.stage === "item" && state.position <= position) {
            setSaveError(err instanceof ApplicantTestError && err.status < 500 ? err.message : "Your last answer didn't save, so it's back on screen. Please answer it again.");
          }
        } catch {
          setScreen({ stage: "loading" });
          setError("We can't reach the test right now. Check your connection, then reload this page. Your answers so far are saved.");
        }
      } finally {
        setSaving(false);
      }
    });
  }

  // A return visit: carry on from the item on screen when they left.
  useEffect(() => {
    if (start.stage !== "resume") return;
    let live = true;
    currentApplicantItem(token)
      .then((state) => live && setScreen(fromState(state)))
      .catch((err: unknown) => live && setError(err instanceof Error ? err.message : "Something went wrong. Reload the page."));
    return () => {
      live = false;
    };
  }, [start.stage, token]);

  // Each new screen starts at the top, with its heading in focus for screen readers.
  const screenKey = screen.stage === "item" ? `item-${screen.position}` : screen.stage;
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus();
  }, [screenKey]);

  if (screen.stage === "invalid") {
    return <Notice headingRef={headingRef} heading="This link isn't working" body="Check you opened the whole link from the email. If it still doesn't work, ask the venue to send it again." />;
  }
  if (screen.stage === "closed") {
    return screen.reason === "expired" ? (
      <Notice headingRef={headingRef} heading="This link has expired" body="Reply to the invite email to ask the venue for a new link. Anything you answered is saved." />
    ) : (
      <Notice headingRef={headingRef} heading="This test has been closed" body="The venue has closed this test. Reply to the invite email if you have questions." />
    );
  }
  if (screen.stage === "finished") {
    return <Notice headingRef={headingRef} heading="Thank you" body={`Your answers have gone to ${venueName}. They'll be in touch about the next step.`} />;
  }
  if (screen.stage === "loading" || screen.stage === "resume") {
    return error ? (
      <Notice headingRef={headingRef} heading="That didn't load" body={error} />
    ) : (
      <p className="ap-loading" role="status">Loading your test…</p>
    );
  }
  if (screen.stage === "welcome") {
    return <Welcome headingRef={headingRef} start={screen} token={token} onStarted={(state) => setScreen(fromState(state))} />;
  }
  return <ItemScreen key={screen.position} headingRef={headingRef} screen={screen} busy={saving} error={saveError} onAnswer={answer} />;
}

function Notice({ heading, body, headingRef }: { heading: string; body: string; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <section className="ap-card">
      <h1 className="ap-heading" ref={headingRef} tabIndex={-1}>{heading}</h1>
      <p className="ap-text">{body}</p>
    </section>
  );
}

function Welcome({
  start,
  token,
  onStarted,
  headingRef,
}: {
  start: Extract<ApplicantStart, { stage: "welcome" }>;
  token: string;
  onStarted: (state: ApplicantState) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const venue = start.venueName;

  async function begin() {
    setBusy(true);
    setError(null);
    try {
      onStarted(await startApplicantTest(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <section className="ap-card">
      <p className="ap-eyebrow">{venue} · {start.trackLabel}</p>
      <h1 className="ap-heading" ref={headingRef} tabIndex={-1}>{start.firstName ? `Hi ${start.firstName}` : "Hello"}</h1>
      {start.intro.split(/\n{2,}/).map((p, i) => (
        <p className="ap-text" key={i}>{p}</p>
      ))}

      <h2 className="ap-subheading">What to expect</h2>
      <ul className="ap-list">
        <li>About 30 minutes, with no time limit. Take the time you need to show how you think.</li>
        <li>A short quiz, two tasks about what to do first, and four situations to answer in your own words.</li>
        <li>One question at a time. Once you answer, you move on.</li>
        <li>You can close the page and come back to the same link until you finish.</li>
      </ul>

      <div className="ap-notice">
        <h2 className="ap-subheading">How your answers are used</h2>
        <p className="ap-small">
          {venue} will see your answers and how you worked through them, including how long each one took, when text was pasted in and when you left the page.
          Serve By Example runs this test for {venue} and keeps your answers for 12 months, or until {venue} deletes them. Your answers are not used to train AI.
          To ask for them to be deleted, reply to the invite email.
        </p>
        <label className="ap-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I&apos;ve read this and I&apos;m happy to go ahead.</span>
        </label>
      </div>

      {error && <p className="ap-error" role="alert">{error}</p>}
      <button type="button" className="btn btn-primary btn-block ap-action" disabled={!agreed || busy} onClick={begin}>
        {busy ? "Starting…" : "Start"}
      </button>
    </section>
  );
}

function ItemScreen({
  screen,
  busy,
  error,
  onAnswer,
  headingRef,
}: {
  screen: Extract<ApplicantState, { stage: "item" }>;
  busy: boolean;
  error: string | null;
  onAnswer: (position: number, answer: ApplicantAnswer, signals: SignalsPayload) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { position, progress, item } = screen;
  const signals = useAnswerSignals(position);

  const itemWord = item.kind === "quiz" && item.question.format === "order_steps" ? "Task" : "Question";
  return (
    <section className="ap-card">
      <p className="ap-progress">
        Part {progress.sectionNumber} of {progress.sectionCount}: {progress.sectionLabel}
        {progress.itemsInSection > 1 && ` · ${itemWord} ${progress.itemNumber} of ${progress.itemsInSection}`}
      </p>
      {error && <p className="ap-error" role="alert">{error}</p>}
      <ItemBody item={item} busy={busy} onSubmit={(answer) => onAnswer(position, answer, signals.read())} noteInput={signals.noteInput} headingRef={headingRef} />
    </section>
  );
}

function ItemBody({
  item,
  busy,
  onSubmit,
  noteInput,
  headingRef,
}: {
  item: ApplicantItemView;
  busy: boolean;
  onSubmit: (answer: ApplicantAnswer) => void;
  noteInput: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  if (item.kind === "written") return <WrittenItem item={item} busy={busy} onSubmit={onSubmit} noteInput={noteInput} headingRef={headingRef} />;
  const q = item.question;
  if (q.format === "order_steps") return <OrderItem question={q} busy={busy} onSubmit={onSubmit} headingRef={headingRef} />;
  if (q.format === "number") return <NumberItem question={q} busy={busy} onSubmit={onSubmit} noteInput={noteInput} headingRef={headingRef} />;
  return <ChoiceItem question={q} busy={busy} onSubmit={onSubmit} headingRef={headingRef} />;
}

type ItemProps<T> = {
  busy: boolean;
  onSubmit: (answer: ApplicantAnswer) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
} & T;

function ChoiceItem({ question, busy, onSubmit, headingRef }: ItemProps<{ question: QuizQuestionView }>) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (picked) onSubmit(picked); }}>
      <fieldset className="ap-fieldset">
        <legend className="ap-legend"><h1 className="ap-heading" ref={headingRef} tabIndex={-1}>{question.prompt}</h1></legend>
        {(question.options ?? []).map((option) => (
          <label key={option.id} className={`ap-option${picked === option.id ? " is-picked" : ""}`}>
            <input type="radio" name={`q-${question.position}`} value={option.id} checked={picked === option.id} onChange={() => setPicked(option.id)} />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      <button type="submit" className="btn btn-primary btn-block ap-action" disabled={!picked || busy}>{busy ? "Saving…" : "Next"}</button>
    </form>
  );
}

function OrderItem({ question, busy, onSubmit, headingRef }: ItemProps<{ question: QuizQuestionView }>) {
  const [steps, setSteps] = useState<QuizOption[]>(question.steps ?? []);
  const [moved, setMoved] = useState<string | null>(null);
  const { listRef: dragListRef, dragging, onPointerDown: onDragStart } = useDragReorder({ items: steps, onChange: setSteps, disabled: busy });

  function move(index: number, by: -1 | 1) {
    const to = index + by;
    if (to < 0 || to >= steps.length) return;
    const next = moveItem(steps, index, to);
    setSteps(next);
    setMoved(`${next[to].text} moved to number ${to + 1}.`);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(steps.map((s) => s.id)); }}>
      <h1 className="ap-heading" ref={headingRef} tabIndex={-1}>{question.prompt}</h1>
      <p className="ap-small">Put these in the order you would do them, first at the top. Drag a step, or use the arrows.</p>
      <ol className="ap-steps" ref={dragListRef}>
        {steps.map((step, i) => (
          <li key={step.id} className={`ap-step${dragging === i ? " is-dragging" : ""}`} onPointerDown={onDragStart} data-drag-index={i}>
            <span className="ap-step-grip" aria-hidden="true" onPointerDown={onDragStart} data-drag-index={i} data-drag-grip="">
              <svg viewBox="0 0 16 16" width="16" height="16"><circle cx="6" cy="4" r="1.3" /><circle cx="10" cy="4" r="1.3" /><circle cx="6" cy="8" r="1.3" /><circle cx="10" cy="8" r="1.3" /><circle cx="6" cy="12" r="1.3" /><circle cx="10" cy="12" r="1.3" /></svg>
            </span>
            <span className="ap-step-number" aria-hidden="true">{i + 1}</span>
            <span className="ap-step-text">{step.text}</span>
            <span className="ap-step-moves">
              <button type="button" className="ap-move" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move "${step.text}" up`}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="ap-move" onClick={() => move(i, 1)} disabled={i === steps.length - 1} aria-label={`Move "${step.text}" down`}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </span>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">{moved}</p>
      <button type="submit" className="btn btn-primary btn-block ap-action" disabled={busy}>{busy ? "Saving…" : "This is my order"}</button>
    </form>
  );
}

function NumberItem({ question, busy, onSubmit, noteInput, headingRef }: ItemProps<{ question: QuizQuestionView; noteInput: () => void }>) {
  const [value, setValue] = useState("");
  const parsed = Number(value);
  const valid = value.trim() !== "" && Number.isFinite(parsed);
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit(parsed); }}>
      <h1 className="ap-heading" ref={headingRef} tabIndex={-1}>
        <label htmlFor={`n-${question.position}`}>{question.prompt}</label>
      </h1>
      <div className="ap-number">
        <input
          id={`n-${question.position}`}
          className="ap-input"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={noteInput}
          autoComplete="off"
        />
        {question.unit && <span className="ap-unit">{question.unit}</span>}
      </div>
      <button type="submit" className="btn btn-primary btn-block ap-action" disabled={!valid || busy}>{busy ? "Saving…" : "Next"}</button>
    </form>
  );
}

function WrittenItem({
  item,
  busy,
  onSubmit,
  noteInput,
  headingRef,
}: ItemProps<{ item: Extract<ApplicantItemView, { kind: "written" }>; noteInput: () => void }>) {
  const [text, setText] = useState("");
  const length = text.trim().length;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (length >= WRITTEN_MIN_CHARS) onSubmit(text); }}>
      <p className="ap-text">{item.setting}</p>
      <h1 className="ap-heading" ref={headingRef} tabIndex={-1}>
        <label htmlFor="ap-written">{item.prompt}</label>
      </h1>
      <p className="ap-small" id="ap-written-hint">Say what you would do and why, in the order you would do it. A few sentences is plenty.</p>
      <textarea
        id="ap-written"
        className="ap-textarea"
        rows={8}
        maxLength={WRITTEN_MAX_CHARS}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={noteInput}
        aria-describedby="ap-written-hint ap-written-count"
      />
      <p className="ap-count" id="ap-written-count">{text.length} of {WRITTEN_MAX_CHARS} characters</p>
      <button type="submit" className="btn btn-primary btn-block ap-action" disabled={length < WRITTEN_MIN_CHARS || busy}>{busy ? "Saving…" : "Next"}</button>
    </form>
  );
}
