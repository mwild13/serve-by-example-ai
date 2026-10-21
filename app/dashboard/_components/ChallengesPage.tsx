"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Link2,
  ListOrdered,
  MessageCircleQuestion,
  ScanSearch,
  TextCursorInput,
  Trophy,
} from "lucide-react";
import ChallengeGame, { type ChallengeResult } from "@/components/challenges/ChallengeGame";
import {
  CHALLENGE_AREA_LABEL,
  CHALLENGE_KIND_LABEL,
  CHALLENGE_LIST,
  type Challenge,
  type ChallengeArea,
  type ChallengeKind,
} from "@/lib/challenge-content";
import { TOTAL_CHALLENGES } from "@/lib/challenges";

// Challenges on the staff desktop (docs/CHALLENGES.md): today's challenge up
// top with your record beside it, then all of them as tiles. One can be
// played alone, or all of them in a row for a score. Completions save to
// /api/training/challenges/save and to this device ("sbe_challenges_completed",
// shared with mobile). Styles: the sd-cg rules in staff.css.

const DONE_KEY = "sbe_challenges_completed";
const BEST_KEY = "sbe-challenges-best-run";

const KIND_ICON: Record<ChallengeKind, ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>> = {
  sequence: ListOrdered,
  fill: TextCursorInput,
  match: Link2,
  spot: ScanSearch,
  choice: MessageCircleQuestion,
};

const AREAS: ("all" | ChallengeArea)[] = ["all", "bar", "service", "safety"];

type Play = {
  order: number[];
  pos: number;
  /** All of them in a row, scored. */
  run: boolean;
  /** Missed at least once in this play. */
  missed: number[];
  solved: number[];
};

function readDone(): number[] {
  try {
    const stored = localStorage.getItem(DONE_KEY);
    return stored ? (JSON.parse(stored) as number[]).filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function saveDone(index: number) {
  try {
    const done = readDone();
    if (!done.includes(index)) localStorage.setItem(DONE_KEY, JSON.stringify([...done, index]));
  } catch {}
  // In the background; the device copy above shows it straight away.
  void fetch("/api/training/challenges/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeIndex: index }),
  }).catch(() => undefined);
}

/** Today's: the first not yet done, starting from a place that moves each day. */
function pickToday(done: number[], now: Date): Challenge {
  const day = Math.floor(now.getTime() / 86_400_000);
  for (let k = 0; k < CHALLENGE_LIST.length; k++) {
    const c = CHALLENGE_LIST[(day + k) % CHALLENGE_LIST.length];
    if (!done.includes(c.index)) return c;
  }
  return CHALLENGE_LIST[day % CHALLENGE_LIST.length];
}

function KindTag({ kind }: { kind: ChallengeKind }) {
  const Icon = KIND_ICON[kind];
  return (
    <span className="sd-cg-kind">
      <Icon size={14} strokeWidth={2} aria-hidden />
      {CHALLENGE_KIND_LABEL[kind]}
    </span>
  );
}

export default function ChallengesPage() {
  const [done, setDone] = useState<number[]>([]);
  const [best, setBest] = useState<number | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [area, setArea] = useState<"all" | ChallengeArea>("all");
  const [play, setPlay] = useState<Play | null>(null);
  const [finished, setFinished] = useState<Play | null>(null);

  useEffect(() => {
    // Browser-only reads on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDone(readDone());
    setNow(new Date());
    try {
      const stored = localStorage.getItem(BEST_KEY);
      if (stored !== null) setBest(parseInt(stored, 10));
    } catch {}
  }, []);

  const today = useMemo(() => (now ? pickToday(done, now) : null), [done, now]);
  const shown = CHALLENGE_LIST.filter((c) => area === "all" || c.area === area);

  const start = useCallback((order: number[], run: boolean) => {
    setFinished(null);
    setPlay({ order, pos: 0, run, missed: [], solved: [] });
    window.scrollTo({ top: 0 });
  }, []);

  const current = play ? CHALLENGE_LIST[play.order[play.pos]] : null;

  function onResult({ solved }: ChallengeResult) {
    if (!play) return;
    const index = play.order[play.pos];
    if (!solved) {
      if (!play.missed.includes(index)) setPlay({ ...play, missed: [...play.missed, index] });
      return;
    }
    if (play.solved.includes(index)) return;
    saveDone(index);
    setDone((d) => (d.includes(index) ? d : [...d, index]));
    setPlay({ ...play, solved: [...play.solved, index] });
  }

  function next() {
    if (!play) return;
    if (play.pos + 1 < play.order.length) {
      setPlay({ ...play, pos: play.pos + 1 });
      window.scrollTo({ top: 0 });
      return;
    }
    if (play.run) {
      const score = play.order.filter((i) => play.solved.includes(i) && !play.missed.includes(i)).length;
      if (best === null || score > best) {
        setBest(score);
        try {
          localStorage.setItem(BEST_KEY, String(score));
        } catch {}
      }
      setFinished(play);
    }
    setPlay(null);
  }

  // ── Playing ──
  if (play && current) {
    const solvedNow = play.solved.includes(current.index);
    const nextUp = !play.run ? CHALLENGE_LIST.find((c) => c.index !== current.index && !done.includes(c.index)) : null;
    return (
      <div className="sd-page sd-reading">
        <button type="button" className="sd-back" onClick={() => setPlay(null)}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          All challenges
        </button>
        {play.run && (
          <ol className="sd-cg-progress" aria-label={`Challenge ${play.pos + 1} of ${play.order.length}`}>
            {play.order.map((i, k) => (
              <li
                key={i}
                className={
                  k < play.pos || (k === play.pos && solvedNow)
                    ? play.missed.includes(i) || !play.solved.includes(i)
                      ? "is-missed"
                      : "is-right"
                    : k === play.pos
                      ? "is-now"
                      : ""
                }
              />
            ))}
          </ol>
        )}
        <div className="sd-docket sd-cg-docket">
          <div className="sd-cg-head">
            <KindTag kind={current.kind} />
            <span className="sd-note">
              {play.run ? `${play.pos + 1} of ${play.order.length}` : CHALLENGE_AREA_LABEL[current.area]}
            </span>
          </div>
          <h1 className="sd-cg-title">{current.title}</h1>
          <ChallengeGame key={`${current.index}-${play.pos}`} challenge={current} onResult={onResult} />
          {(solvedNow || play.run) && (
            <div className="sd-actions sd-cg-next">
              {play.run ? (
                <button type="button" className={`sd-btn ${solvedNow ? "sd-btn-primary" : "sd-btn-ghost"}`} onClick={next}>
                  {play.pos + 1 < play.order.length ? (solvedNow ? "Next challenge" : "Skip this one") : "See your score"}
                  <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
                </button>
              ) : (
                <>
                  {nextUp && (
                    <button type="button" className="sd-btn sd-btn-primary" onClick={() => start([nextUp.index], false)}>
                      Next: {nextUp.title}
                      <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
                    </button>
                  )}
                  <button type="button" className={`sd-btn ${nextUp ? "sd-btn-ghost" : "sd-btn-primary"}`} onClick={() => setPlay(null)}>
                    Back to challenges
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── A run's score ──
  if (finished) {
    const firstTime = finished.order.filter((i) => finished.solved.includes(i) && !finished.missed.includes(i));
    const toRedo = finished.order.filter((i) => !firstTime.includes(i));
    const score = firstTime.length;
    return (
      <div className="sd-page sd-reading">
        <button type="button" className="sd-back" onClick={() => setFinished(null)}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          All challenges
        </button>
        <section className="sd-docket sd-cg-score" aria-labelledby="sd-cg-score-title">
          <Trophy size={28} strokeWidth={1.75} className="sd-cg-score-icon" aria-hidden />
          <p className="sd-label">Your run</p>
          <h1 id="sd-cg-score-title" className="sd-figure sd-cg-score-figure">
            {score}
            <span className="sd-figure-of">of {finished.order.length} first time</span>
          </h1>
          <p className="sd-cg-score-line">
            {score === finished.order.length
              ? "A clean sweep. Every one right first time."
              : best !== null && score >= best
                ? "That's your best run yet."
                : `Your best run is ${best} of ${TOTAL_CHALLENGES}.`}
          </p>
          {toRedo.length > 0 && (
            <>
              <p className="sd-label sd-cg-redo-label">Worth another go</p>
              <ul className="sd-list sd-cg-redo">
                {toRedo.map((i) => (
                  <li key={i}>
                    <button type="button" className="sd-list-row" onClick={() => start([i], false)}>
                      <span className="sd-list-main">
                        <span className="sd-list-title">{CHALLENGE_LIST[i].title}</span>
                        <span className="sd-list-meta">{CHALLENGE_KIND_LABEL[CHALLENGE_LIST[i].kind]}</span>
                      </span>
                      <span className="sd-list-action">Try again</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="sd-actions">
            <button type="button" className="sd-btn sd-btn-primary" onClick={() => start(CHALLENGE_LIST.map((c) => c.index), true)}>
              Play all {TOTAL_CHALLENGES} again
            </button>
            <button type="button" className="sd-btn sd-btn-ghost" onClick={() => setFinished(null)}>
              Back to challenges
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ── The list ──
  const doneCount = CHALLENGE_LIST.filter((c) => done.includes(c.index)).length;
  return (
    <div className="sd-page sd-cg">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">Challenges</h1>
          <p className="sd-subtitle">
            {TOTAL_CHALLENGES} quick games from behind the bar to the floor. About a minute each, tap to answer, no typing.
          </p>
        </div>
      </header>

      <div className="sd-grid">
        <section className="sd-panel sd-step sd-col-8" aria-labelledby="sd-cg-today" aria-busy={!today}>
          {today ? (
            <>
              <p className="sd-label">Today&apos;s challenge</p>
              <h2 id="sd-cg-today" className="sd-step-title">{today.title}</h2>
              <p className="sd-step-body">{today.pitch}</p>
              <p className="sd-hero-meta">
                <KindTag kind={today.kind} />
                <span>{CHALLENGE_AREA_LABEL[today.area]}</span>
                {done.includes(today.index) && <span>Done before</span>}
              </p>
              <div className="sd-actions">
                <button type="button" className="sd-btn sd-btn-primary" onClick={() => start([today.index], false)}>
                  Play it
                  <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
                </button>
                <button
                  type="button"
                  className="sd-btn sd-btn-ghost"
                  onClick={() => start(CHALLENGE_LIST.map((c) => c.index), true)}
                >
                  Play all {TOTAL_CHALLENGES} in a row
                </button>
              </div>
            </>
          ) : (
            <div className="sd-wait" aria-hidden="true">
              <span className="sd-skel sd-skel-label" />
              <span className="sd-skel sd-skel-title" />
              <span className="sd-skel sd-skel-line" />
            </div>
          )}
        </section>

        <section className="sd-panel sd-col-4 sd-cg-record" aria-label="Your record">
          <div className="sd-panel-head">
            <p className="sd-label">Your record</p>
            <Trophy size={16} strokeWidth={2} className="sd-panel-icon" aria-hidden />
          </div>
          <p className="sd-figure">
            {doneCount}
            <span className="sd-figure-of">of {TOTAL_CHALLENGES}</span>
            <span className="sd-figure-unit">challenges done</span>
          </p>
          <span className="sd-bar" aria-hidden>
            <span style={{ width: `${(doneCount / TOTAL_CHALLENGES) * 100}%` }} />
          </span>
          <p className="sd-note">
            {best !== null
              ? `Best run: ${best} of ${TOTAL_CHALLENGES} right first time.`
              : `Play all ${TOTAL_CHALLENGES} in a row to set a best run.`}
          </p>
        </section>
      </div>

      <section className="sd-cg-all" aria-labelledby="sd-cg-all-title">
        <div className="sd-cg-all-head">
          <h2 id="sd-cg-all-title" className="sd-h2">All challenges</h2>
          <div className="sd-tabs" role="tablist" aria-label="Area">
            {AREAS.map((a) => (
              <button
                key={a}
                type="button"
                role="tab"
                aria-selected={area === a}
                className={`sd-tab${area === a ? " is-active" : ""}`}
                onClick={() => setArea(a)}
              >
                {a === "all" ? "All" : CHALLENGE_AREA_LABEL[a]}
                <span className="sd-tab-count">
                  {a === "all" ? CHALLENGE_LIST.length : CHALLENGE_LIST.filter((c) => c.area === a).length}
                </span>
              </button>
            ))}
          </div>
        </div>
        <ul className="sd-cg-tiles">
          {shown.map((c) => {
            const isDone = done.includes(c.index);
            return (
              <li key={c.slug}>
                <button type="button" className={`sd-cg-tile${isDone ? " is-done" : ""}`} onClick={() => start([c.index], false)}>
                  <KindTag kind={c.kind} />
                  <span className="sd-cg-tile-title">{c.title}</span>
                  <span className="sd-cg-tile-pitch">{c.pitch}</span>
                  <span className="sd-cg-tile-foot">
                    {isDone ? (
                      <span className="sd-cg-done">
                        <Check size={14} strokeWidth={2.5} aria-hidden />
                        Done
                      </span>
                    ) : (
                      <span className="sd-cg-new">Not played</span>
                    )}
                    <span className="sd-cg-play">
                      {isDone ? "Play again" : "Play"}
                      <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
