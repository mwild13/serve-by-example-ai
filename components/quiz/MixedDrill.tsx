"use client";

import { useCallback, useEffect, useState } from "react";
import QuizRun from "@/components/quiz/QuizRun";
import ShiftDays, { ShiftReminder, streakLine } from "@/components/quiz/ShiftDays";
import type { ShiftStreak } from "@/lib/shift-streak";
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
//
// `mode="preshift"` is the shorter "Ready for your shift" drill (Phase 12),
// which ends with the shift streak and a way into Live Guest.

type Props = {
  theme: "light" | "dark";
  /** A current access token for the API. */
  getToken: () => Promise<string>;
  /** Opens one module's quiz. */
  onOpenModule: (moduleId: number, title: string) => void;
  /** Goes to the module list. */
  onBrowseModules: () => void;
  mode?: "mixed" | "preshift";
  /** Pre-shift only: opens Live Guest for one warm-up conversation. */
  onLiveGuest?: () => void;
  /** Skip the intro card: the page has its own (the staff desktop's DrillPage). */
  autoStart?: boolean;
};

type Status =
  | { kind: "intro" }
  | { kind: "loading" }
  | { kind: "playing"; drill: VerifyQuizStart }
  | { kind: "done"; summary: DrillSummary }
  | { kind: "locked"; message: string }
  | { kind: "error"; message: string };

export default function MixedDrill({ theme, getToken, onOpenModule, onBrowseModules, mode = "mixed", onLiveGuest, autoStart = false }: Props) {
  const [status, setStatus] = useState<Status>({ kind: autoStart ? "loading" : "intro" });
  const drill = status.kind === "playing" ? status.drill : null;

  async function begin() {
    setStatus({ kind: "loading" });
    try {
      setStatus({ kind: "playing", drill: await startDrill(await getToken(), mode) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start the drill.";
      setStatus(err instanceof VerifyQuizError && err.code === "DRILL_NEEDS_MODULES" ? { kind: "locked", message } : { kind: "error", message });
    }
  }

  useEffect(() => {
    // A one-time start when the page has already shown the intro. begin is
    // recreated each render; this runs once, on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoStart) void begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {status.kind === "intro" && mode === "preshift" && (
        <div className="dr-card">
          <h2 className="dr-title">Ready for your shift</h2>
          <p className="dr-text">
            Six quick questions, about three minutes: what&apos;s new at your venue first, then what&apos;s due for a refresh, then
            the rest of your modules.
          </p>
          <p className="dr-text dr-text--muted">Finish it before each shift to build your shift streak.</p>
          <button type="button" className="qz-next" onClick={() => void begin()}>
            Start
          </button>
        </div>
      )}

      {status.kind === "intro" && mode === "mixed" && (
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

      {status.kind === "done" && mode === "preshift" && (
        <PreshiftResult summary={status.summary} getToken={getToken} onLiveGuest={onLiveGuest} />
      )}
      {status.kind === "done" && mode === "mixed" && (
        <DrillResult summary={status.summary} onAgain={() => void begin()} onOpenModule={onOpenModule} />
      )}
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
  // The module with the most misses, if any were missed. Venue content
  // (module id 0) has no module to open.
  const weakest = summary.modules
    .filter((m) => m.moduleId > 0 && m.correct < m.total)
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

function PreshiftResult({
  summary,
  getToken,
  onLiveGuest,
}: {
  summary: DrillSummary;
  getToken: () => Promise<string>;
  onLiveGuest?: () => void;
}) {
  const [streak, setStreak] = useState<ShiftStreak | undefined>(summary.streak);
  return (
    <div className="dr-card">
      <h2 className="dr-title">You&apos;re ready for tonight</h2>
      <p className="dr-text">
        {summary.correct} of {summary.total} right.{" "}
        {summary.correct === summary.total ? "Sharp." : "The explanations you just read are the ones to keep in mind tonight."}
      </p>
      {streak && <p className="dr-streak">{streakLine(streak)}</p>}
      {streak && <ShiftDays streak={streak} getToken={getToken} onSaved={setStreak} />}
      {streak && <ShiftReminder streak={streak} getToken={getToken} onSaved={setStreak} />}
      {onLiveGuest && (
        <div className="dr-actions">
          <button type="button" className="dr-link" onClick={onLiveGuest}>
            Warm up with one Live Guest
          </button>
        </div>
      )}
    </div>
  );
}
