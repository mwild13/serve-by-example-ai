"use client";

import { useCallback, useState } from "react";
import QuizRun from "@/components/quiz/QuizRun";
import {
  VerifyQuizError,
  startDrill,
  submitDrillAnswer,
  type DrillSummary,
  type QuizAnswer,
  type VerifyQuizStart,
} from "@/lib/verify-quiz-client";

// A mixed drill (Rich update, Phase 10), shared by desktop DrillPage (light)
// and mobile DrillScreen (dark): the intro, the run through QuizRun, and the
// summary. The server plans and grades it (lib/drill.ts). Styles: the .dr
// rules in app/styles/staff.css, on the .qz theme colours.

type Props = {
  theme: "light" | "dark";
  /** A current access token for the API. */
  getToken: () => Promise<string>;
  /** Opens one module's quiz. */
  onOpenModule: (moduleId: number, title: string) => void;
  /** Goes to the module list. */
  onBrowseModules: () => void;
};

type Status =
  | { kind: "intro" }
  | { kind: "loading" }
  | { kind: "playing"; drill: VerifyQuizStart }
  | { kind: "done"; summary: DrillSummary }
  | { kind: "locked"; message: string }
  | { kind: "error"; message: string };

export default function MixedDrill({ theme, getToken, onOpenModule, onBrowseModules }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "intro" });
  const drill = status.kind === "playing" ? status.drill : null;

  async function begin() {
    setStatus({ kind: "loading" });
    try {
      setStatus({ kind: "playing", drill: await startDrill(await getToken()) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start the drill.";
      setStatus(err instanceof VerifyQuizError && err.code === "DRILL_NEEDS_MODULES" ? { kind: "locked", message } : { kind: "error", message });
    }
  }

  const submit = useCallback(
    async (position: number, answer: QuizAnswer) => {
      if (!drill) throw new Error("The drill hasn't started.");
      return submitDrillAnswer(await getToken(), drill.attemptId, position, answer);
    },
    [drill, getToken],
  );

  const finish = useCallback((_passed: boolean, last: { summary?: DrillSummary }) => {
    setStatus(last.summary ? { kind: "done", summary: last.summary } : { kind: "error", message: "The drill ended early. Start another one." });
  }, []);

  const fail = useCallback((message: string) => setStatus({ kind: "error", message }), []);

  if (status.kind === "playing") {
    return <QuizRun key={status.drill.attemptId} start={status.drill} submit={submit} onFinish={finish} onError={fail} theme={theme} />;
  }

  return (
    <div className={`qz qz--${theme} dr`}>
      {status.kind === "intro" && (
        <div className="dr-card">
          <h2 className="dr-title">Ten questions, mixed</h2>
          <p className="dr-text">
            Questions from every module you&apos;ve started, at full difficulty, one module after another. Each drill
            leaves out the questions from your last one.
          </p>
          <p className="dr-text dr-text--muted">Practice only: a drill never changes your mastery.</p>
          <button type="button" className="qz-next" onClick={() => void begin()}>
            Start the drill
          </button>
        </div>
      )}

      {status.kind === "loading" && <p className="dr-text dr-text--muted">Building your drill…</p>}

      {status.kind === "locked" && (
        <div className="dr-card">
          <h2 className="dr-title">Not yet</h2>
          <p className="dr-text">{status.message}</p>
          <button type="button" className="qz-next" onClick={onBrowseModules}>
            Go to modules
          </button>
        </div>
      )}

      {status.kind === "error" && (
        <div className="dr-card">
          <p className="dr-text">{status.message}</p>
          <button type="button" className="qz-next" onClick={() => void begin()}>
            Try again
          </button>
        </div>
      )}

      {status.kind === "done" && <DrillResult summary={status.summary} onAgain={() => void begin()} onOpenModule={onOpenModule} />}
    </div>
  );
}

function DrillResult({
  summary,
  onAgain,
  onOpenModule,
}: {
  summary: DrillSummary;
  onAgain: () => void;
  onOpenModule: (moduleId: number, title: string) => void;
}) {
  // The module with the most misses, if any were missed.
  const weakest = summary.modules
    .filter((m) => m.correct < m.total)
    .sort((a, b) => (b.total - b.correct) - (a.total - a.correct) || a.correct / a.total - b.correct / b.total)[0];

  return (
    <div className="dr-card">
      <p className="dr-score">
        {summary.correct} <span>of {summary.total} right</span>
      </p>
      <p className="dr-text dr-text--muted">
        {summary.correct === summary.total
          ? "Every one right. Start another drill to keep it sharp."
          : summary.correct / Math.max(summary.total, 1) >= 0.7
            ? "Good drill. The misses show where to look next."
            : "A tough one. Have a look at the module you missed most, then try another drill."}
      </p>

      <ul className="dr-modules">
        {summary.modules.map((m) => (
          <li key={m.moduleId} className={m.moduleId === weakest?.moduleId ? "dr-module dr-module--weak" : "dr-module"}>
            <span className="dr-module-title">{m.title}</span>
            <span className="dr-module-score">
              {m.correct} of {m.total}
            </span>
          </li>
        ))}
      </ul>

      <div className="dr-actions">
        <button type="button" className="qz-next" onClick={onAgain}>
          Another drill
        </button>
        {weakest && (
          <button type="button" className="dr-link" onClick={() => onOpenModule(weakest.moduleId, weakest.title)}>
            Go over {weakest.title}
          </button>
        )}
      </div>
    </div>
  );
}
