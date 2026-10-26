"use client";

/*
 * ApplicantTest – the applicant's side of an applicant test
 * (docs/APPLICANT_TESTING.md §2).
 *
 * Welcome, with the venue's message and the collection notice, then one item
 * per screen until the last, then a thank you. No timer, no score and no
 * going back. Every answer goes to /api/applicant/[token]/answer with what
 * useAnswerSignals() measured while it was on screen.
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
} from "@/lib/applicant/client";
import { useAnswerSignals } from "@/lib/applicant/use-answer-signals";
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

export default function ApplicantTest({ token, start }: { token: string; start: ApplicantStart }) {
  const [screen, setScreen] = useState<Screen>(start.stage === "resume" ? { stage: "loading" } : start);
  const [error, setError] = useState<string | null>(null);
  const venueName = start.stage === "welcome" || start.stage === "resume" ? start.venueName : "the venue";
  const headingRef = useRef<HTMLHeadingElement>(null);

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
  return <ItemScreen headingRef={headingRef} token={token} screen={screen} onNext={(state) => setScreen(fromState(state))} />;
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
        <li>A short quiz, a task about what to do first, three questions to answer in your own words, and a conversation with a guest.</li>
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
  token,
  screen,
  onNext,
  headingRef,
}: {
  token: string;
  screen: Extract<ApplicantState, { stage: "item" }>;
  onNext: (state: ApplicantState) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { position, progress, item } = screen;
  const signals = useAnswerSignals(position);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(answer: ApplicantAnswer) {
    setBusy(true);
    setError(null);
    try {
      onNext(await submitApplicantAnswer(token, position, answer, signals.read()));
    } catch (err) {
      // Out of step (sent from another tab): reload where the test really is.
      if (err instanceof ApplicantTestError && err.code === "OUT_OF_STEP") {
        try {
          onNext(await currentApplicantItem(token));
          return;
        } catch {
          // Fall through to the message.
        }
      }
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const itemWord = item.kind === "quiz" && item.question.format === "order_steps" ? "Task" : "Question";
  return (
    <section className="ap-card" key={position}>
      <p className="ap-progress">
        Part {progress.sectionNumber} of {progress.sectionCount}: {progress.sectionLabel}
        {progress.itemsInSection > 1 && ` · ${itemWord} ${progress.itemNumber} of ${progress.itemsInSection}`}
      </p>
      <ItemBody item={item} busy={busy} onSubmit={send} noteInput={signals.noteInput} headingRef={headingRef} />
      {error && <p className="ap-error" role="alert">{error}</p>}
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
  if (item.kind === "guest") {
    return (
      <>
        <h1 className="ap-heading" ref={headingRef} tabIndex={-1}>{item.title}</h1>
        <p className="ap-text">{item.setting}</p>
        <p className="ap-text">This conversation isn&apos;t open yet. Your answers so far are saved. Come back to this link soon, or reply to the invite email.</p>
      </>
    );
  }
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

  function move(index: number, by: -1 | 1) {
    const to = index + by;
    if (to < 0 || to >= steps.length) return;
    const next = [...steps];
    [next[index], next[to]] = [next[to], next[index]];
    setSteps(next);
    setMoved(`${next[to].text} moved to number ${to + 1}.`);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(steps.map((s) => s.id)); }}>
      <h1 className="ap-heading" ref={headingRef} tabIndex={-1}>{question.prompt}</h1>
      <p className="ap-small">Put these in the order you would do them, first at the top. Use the arrows to move a step.</p>
      <ol className="ap-steps">
        {steps.map((step, i) => (
          <li key={step.id} className="ap-step">
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
