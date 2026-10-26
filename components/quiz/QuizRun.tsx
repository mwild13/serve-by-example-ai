"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  QuizAnswer,
  QuizFormat,
  QuizGoal,
  QuizOption,
  QuizProgress,
  QuizQuestionView,
  VerifyAnswerResult,
  VerifyQuizStart,
} from "@/lib/verify-quiz-client";
import { useDragReorder } from "@/lib/use-drag-reorder";

// One module quiz run, shared by desktop ModuleVerify (light) and mobile
// QuizScreen (dark), and one mixed drill (MixedDrill, both themes). The server sends one question at a time and grades every
// answer (lib/verify-quiz.ts); this component only shows what it says.
// Styles: the .qz rules in app/styles/staff.css.

type Props = {
  start: VerifyQuizStart;
  /** Grades one answer on the server. Rejects on a network or server error. */
  submit: (position: number, answer: QuizAnswer) => Promise<VerifyAnswerResult>;
  /** Called when the person moves on from the final answer, with that answer's result. */
  onFinish: (passed: boolean, last: VerifyAnswerResult) => void;
  onError: (message: string) => void;
  theme: "light" | "dark";
};

const FORMAT_LABEL: Record<QuizFormat, string> = {
  true_false: "True or false",
  best_line: "Pick the best line",
  multiple_choice: "Choose one",
  order_steps: "Put in order",
  spot_mistake: "Spot the mistake",
  number: "Enter a number",
  which_glass: "Pick the glass",
};

/** Answered by tapping one option. */
function isChoice(format: QuizFormat): boolean {
  return format !== "order_steps" && format !== "number";
}

export default function QuizRun({ start, submit, onFinish, onError, theme }: Props) {
  const goal = start.goal;
  const [question, setQuestion] = useState<QuizQuestionView>(start.question);
  const [progress, setProgress] = useState<QuizProgress>(start.progress);
  const [graded, setGraded] = useState<VerifyAnswerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [order, setOrder] = useState<QuizOption[]>(start.question.steps ?? []);
  const [numberText, setNumberText] = useState("");
  // Blocks a second answer (tap + keypress) while the first is in flight.
  const checkingRef = useRef(false);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const answer = useCallback(
    async (value: QuizAnswer) => {
      if (graded || checkingRef.current) return;
      checkingRef.current = true;
      setChecking(true);
      if (typeof value === "string") setChosen(value);
      try {
        const result = await submit(question.position, value);
        setGraded(result);
        setProgress(result.progress);
      } catch (err) {
        onError(err instanceof Error ? err.message : "Could not check that answer.");
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    },
    [graded, onError, question.position, submit],
  );

  const next = useCallback(() => {
    if (!graded) return;
    if (graded.status !== "active" || !graded.next) {
      onFinish(graded.status === "passed", graded);
      return;
    }
    setQuestion(graded.next);
    setOrder(graded.next.steps ?? []);
    setGraded(null);
    setChosen(null);
    setNumberText("");
  }, [graded, onFinish]);

  // Focus moves to Next once an answer is graded, so Enter carries on.
  useEffect(() => {
    if (graded) nextButtonRef.current?.focus();
  }, [graded]);

  // Desktop keys: T and F, or 1 to 9 for the options.
  useEffect(() => {
    if (theme !== "light") return;
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || graded) return;
      if (question.format === "true_false") {
        if (e.key === "t" || e.key === "T") void answer("true");
        if (e.key === "f" || e.key === "F") void answer("false");
        return;
      }
      if (isChoice(question.format) && question.options) {
        const index = Number(e.key) - 1;
        const option = question.options[index];
        if (option) void answer(option.id);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [answer, graded, question, theme]);

  function move(index: number, delta: number) {
    setOrder((steps) => {
      const to = index + delta;
      if (to < 0 || to >= steps.length) return steps;
      const out = [...steps];
      [out[index], out[to]] = [out[to], out[index]];
      return out;
    });
  }

  function submitNumber() {
    const value = Number(numberText.trim().replace(",", "."));
    if (numberText.trim() === "" || !Number.isFinite(value)) return;
    void answer(value);
  }

  const done = graded !== null && graded.status !== "active";

  return (
    <div className={`qz qz--${theme}`}>
      <QuizProgressBar goal={goal} progress={progress} />

      <div key={question.position} className="qz-card">
        <p className="qz-format">
          {question.moduleTitle ? `${question.moduleTitle} · ${FORMAT_LABEL[question.format]}` : FORMAT_LABEL[question.format]}
        </p>
        <h2 className="qz-prompt">{question.prompt}</h2>

        {isChoice(question.format) && question.options && (
          <div className={question.format === "true_false" ? "qz-options qz-options--pair" : "qz-options"}>
            {question.options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                className={optionClass(option.id, chosen, graded)}
                onClick={() => void answer(option.id)}
                disabled={graded !== null || checking}
              >
                {theme === "light" && question.format !== "true_false" && (
                  <span className="qz-option-key" aria-hidden="true">{index + 1}</span>
                )}
                <span>{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {question.format === "order_steps" && (
          <OrderSteps
            steps={graded && Array.isArray(graded.correctAnswer) ? stepsInOrder(order, graded.correctAnswer) : order}
            locked={graded !== null || checking}
            graded={graded}
            onMove={move}
            onReorder={setOrder}
            onCheck={() => void answer(order.map((s) => s.id))}
          />
        )}

        {question.format === "number" && (
          <form
            className="qz-number"
            onSubmit={(e) => {
              e.preventDefault();
              submitNumber();
            }}
          >
            <label className="qz-number-field">
              <span className="qz-visually-hidden">Your answer{question.unit ? ` in ${question.unit}` : ""}</span>
              <input
                className="qz-number-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={numberText}
                onChange={(e) => setNumberText(e.target.value)}
                disabled={graded !== null || checking}
              />
              {question.unit && <span className="qz-number-unit">{question.unit}</span>}
            </label>
            {!graded && (
              <button type="submit" className="qz-check" disabled={checking || numberText.trim() === ""}>
                Check
              </button>
            )}
          </form>
        )}

        {checking && <p className="qz-checking">Checking…</p>}

        {graded && (
          <div className={graded.correct ? "qz-feedback qz-feedback--right" : "qz-feedback qz-feedback--wrong"} role="status">
            <p className="qz-feedback-title">{graded.correct ? "Correct" : correctAnswerText(question, graded)}</p>
            <p className="qz-feedback-text">{graded.explanation}</p>
            {!graded.correct && graded.status === "active" && progress.owed > 0 && (
              <p className="qz-feedback-note">This one comes back soon in a different form.</p>
            )}
          </div>
        )}

        {graded && (
          <button ref={nextButtonRef} type="button" className="qz-next" onClick={next}>
            {done ? (graded.status === "passed" ? "Finish" : "See result") : "Next question"}
          </button>
        )}
      </div>
    </div>
  );
}

function QuizProgressBar({ goal, progress }: { goal: QuizGoal; progress: QuizProgress }) {
  if (goal.drill) {
    const answered = progress.correct + progress.misses;
    return (
      <div className="qz-progress">
        <div className="qz-progress-track" aria-hidden="true">
          <div className="qz-progress-fill" style={{ width: `${(answered / Math.max(goal.correct, 1)) * 100}%` }} />
        </div>
        <p className="qz-progress-text">
          <span>{answered} of {goal.correct} answered</span>
          <span>{progress.correct} right</span>
        </p>
      </div>
    );
  }
  const share = Math.min(progress.correct / Math.max(goal.correct, 1), 1);
  const missesLeft = Math.max(goal.maxMisses - progress.misses, 0);
  return (
    <div className="qz-progress">
      <div className="qz-progress-track" aria-hidden="true">
        <div className="qz-progress-fill" style={{ width: `${share * 100}%` }} />
      </div>
      <p className="qz-progress-text">
        <span>{Math.min(progress.correct, goal.correct)} of {goal.correct} correct</span>
        {goal.formats > 1 && <span>{Math.min(progress.formats, goal.formats)} of {goal.formats} question types</span>}
        <span>{missesLeft === 1 ? "1 miss left" : `${missesLeft} misses left`}</span>
      </p>
    </div>
  );
}

function OrderSteps({
  steps,
  locked,
  graded,
  onMove,
  onReorder,
  onCheck,
}: {
  steps: QuizOption[];
  locked: boolean;
  graded: VerifyAnswerResult | null;
  onMove: (index: number, delta: number) => void;
  /** Dragging a step to a new place (mouse, or a finger on the grip). */
  onReorder: (steps: QuizOption[]) => void;
  onCheck: () => void;
}) {
  const { listRef: dragListRef, dragging, onPointerDown: onDragStart } = useDragReorder({ items: steps, onChange: onReorder, disabled: locked || graded !== null });
  return (
    <div className="qz-order">
      {!graded && <p className="qz-order-hint">Drag the steps into order, or use the arrows.</p>}
      <ol className="qz-order-list" ref={dragListRef}>
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`${graded ? (graded.correct ? "qz-step qz-step--right" : "qz-step qz-step--shown") : "qz-step"}${dragging === index ? " qz-step--dragging" : ""}`}
            onPointerDown={onDragStart}
            data-drag-index={index}
          >
            {!graded && (
              <span className="qz-step-grip" aria-hidden="true" onPointerDown={onDragStart} data-drag-index={index} data-drag-grip="">
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="6" cy="4" r="1.3" /><circle cx="10" cy="4" r="1.3" /><circle cx="6" cy="8" r="1.3" /><circle cx="10" cy="8" r="1.3" /><circle cx="6" cy="12" r="1.3" /><circle cx="10" cy="12" r="1.3" /></svg>
              </span>
            )}
            <span className="qz-step-number" aria-hidden="true">{index + 1}</span>
            <span className="qz-step-text">{step.text}</span>
            {!graded && (
              <span className="qz-step-moves">
                <button
                  type="button"
                  className="qz-step-move"
                  onClick={() => onMove(index, -1)}
                  disabled={locked || index === 0}
                  aria-label={`Move "${step.text}" up`}
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button
                  type="button"
                  className="qz-step-move"
                  onClick={() => onMove(index, 1)}
                  disabled={locked || index === steps.length - 1}
                  aria-label={`Move "${step.text}" down`}
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!graded && (
        <button type="button" className="qz-check" onClick={onCheck} disabled={locked}>
          Check order
        </button>
      )}
    </div>
  );
}

function optionClass(id: string, chosen: string | null, graded: VerifyAnswerResult | null): string {
  let cls = "qz-option";
  if (graded) {
    if (graded.correctAnswer === id) cls += " qz-option--right";
    else if (chosen === id) cls += " qz-option--wrong";
    else cls += " qz-option--faded";
  } else if (chosen === id) {
    cls += " qz-option--chosen";
  }
  return cls;
}

/** After grading, the steps are shown in the right order. */
function stepsInOrder(steps: QuizOption[], ids: string[]): QuizOption[] {
  return ids.map((id) => steps.find((s) => s.id === id)).filter((s): s is QuizOption => s !== undefined);
}

function correctAnswerText(question: QuizQuestionView, graded: VerifyAnswerResult): string {
  if (question.format === "number" && typeof graded.correctAnswer === "number") {
    return `Not quite. The answer is ${graded.correctAnswer}${question.unit ? ` ${question.unit}` : ""}.`;
  }
  if (question.format === "order_steps") return "Not quite. Here's the right order.";
  return "Not quite.";
}
