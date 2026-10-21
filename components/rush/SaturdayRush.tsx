"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BARBACK_AWAY,
  RUSH_LENGTH,
  RUSH_SECONDS,
  barbackFree,
  clockText,
  meterLabel,
  playRush,
  rushResult,
  type Meter,
  type MomentKind,
  type RushMove,
  type RushResult,
  type Verdict,
} from "@/lib/rush/engine";
import { newRushSeed, saveRush, type RushStats } from "@/lib/rush/client";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadRushStats } from "@/lib/staff-data";

// Saturday Rush (Rich update, Phase 15): a timed Saturday night shift in
// twelve moments, shared by desktop (light) and mobile (dark) like QuizRun.
// The game runs here from a seed with no network; the finished shift is
// saved to /api/training/rush, which replays it for the score. Styles: .rush
// rules in app/styles/staff.css, on the .qz theme colours.

/** "room" is the staff desktop's green (docs/STAFF_DESKTOP_REDESIGN_PLAN.md); it keeps the desktop keys. */
type Props = { getToken: () => Promise<string>; theme: "light" | "dark" | "room" };

const KIND_LABEL: Record<MomentKind, string> = {
  queue: "The queue",
  docket: "A docket",
  stock: "Stock",
  safety: "Safety",
  team: "The team",
  sales: "Sales",
};

const VERDICT_LABEL: Record<Verdict, string> = {
  best: "Best call",
  ok: "Fair enough",
  poor: "Costly",
  breach: "A rule you can't break",
};

const METERS: { id: Meter; name: string }[] = [
  { id: "guest", name: "Guests" },
  { id: "speed", name: "Speed" },
  { id: "money", name: "Money" },
  { id: "safety", name: "Safety" },
];

/** How long a call's verdict shows before the next moment. */
const FLASH_MS = 1100;

function Bar({ label, value, low }: { label: string; value: number; low?: boolean }) {
  return (
    <div className={low ? "rush-stock rush-stock--low" : "rush-stock"}>
      <span className="rush-stock-label">{label}</span>
      <span className="rush-stock-track" aria-hidden="true">
        <span className="rush-stock-fill" style={{ width: `${value}%` }} />
      </span>
      <span className="qz-visually-hidden">{Math.round(value)} percent</span>
    </div>
  );
}

export default function SaturdayRush({ getToken, theme }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [seed, setSeed] = useState(0);
  const [moves, setMoves] = useState<RushMove[]>([]);
  const [callBarback, setCallBarback] = useState(false);
  const [flash, setFlash] = useState<{ verdict: Verdict | null } | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [left, setLeft] = useState(RUSH_SECONDS);
  const { data: cachedStats, set: setStats } = useStaffData(STAFF_KEYS.rush, loadRushStats, getToken);
  const stats = cachedStats ?? null;
  const [saved, setSaved] = useState<"saving" | "saved" | "failed" | null>(null);
  const hiddenAt = useRef<number | null>(null);
  // One call per moment, even if the clock and a tap land together.
  const committed = useRef(-1);

  const run = useMemo(() => playRush(seed, moves), [seed, moves]);
  const moment = phase === "playing" ? run.current : null;
  const index = moves.length;


  const start = useCallback(() => {
    setSeed(newRushSeed());
    committed.current = -1;
    setMoves([]);
    setCallBarback(false);
    setFlash(null);
    setSaved(null);
    setLeft(RUSH_SECONDS);
    setDeadline(Date.now() + RUSH_SECONDS * 1000);
    setPhase("playing");
  }, []);

  const commit = useCallback(
    (pick: number | null) => {
      if (!moment || flash || committed.current === index) return;
      committed.current = index;
      const move: RushMove = { pick, barback: callBarback };
      setFlash({ verdict: pick === null ? null : moment.choices[pick].verdict });
      window.setTimeout(() => {
        setMoves((m) => [...m, move]);
        setFlash(null);
        setCallBarback(false);
        setLeft(RUSH_SECONDS);
        setDeadline(Date.now() + RUSH_SECONDS * 1000);
      }, FLASH_MS);
    },
    [callBarback, flash, index, moment],
  );

  // The clock. Freezing when it runs out counts as a move.
  useEffect(() => {
    if (!moment || flash) return;
    const id = window.setInterval(() => {
      if (hiddenAt.current !== null) return;
      const remaining = Math.max(0, (deadline - Date.now()) / 1000);
      setLeft(remaining);
      if (remaining <= 0) commit(null);
    }, 100);
    return () => window.clearInterval(id);
  }, [commit, deadline, flash, moment]);

  // Switching away from the tab pauses the shift.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) hiddenAt.current = Date.now();
      else if (hiddenAt.current !== null) {
        const away = Date.now() - hiddenAt.current;
        hiddenAt.current = null;
        setDeadline((d) => d + away);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // The shift is over: show it, and save it.
  useEffect(() => {
    if (phase !== "playing" || run.current !== null || moves.length < RUSH_LENGTH) return;
    const finished = moves;
    const shiftSeed = seed;
    const id = window.setTimeout(() => {
      setPhase("done");
      setSaved("saving");
      getToken()
        .then((token) => saveRush(token, shiftSeed, finished))
        .then((answer) => {
          setSaved(answer ? "saved" : "failed");
          if (answer) setStats({ best: answer.best, shifts: answer.shifts });
        })
        .catch(() => setSaved("failed"));
    }, 0);
    return () => window.clearTimeout(id);
  }, [getToken, moves, phase, run, seed, setStats]);

  // Desktop keys: 1 to 4 to choose, B for the bar-back.
  useEffect(() => {
    if (!moment || theme === "dark") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= moment.choices.length) commit(n - 1);
      if (e.key.toLowerCase() === "b" && barbackFree(run.state, index)) setCallBarback((c) => !c);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, index, moment, run.state, theme]);

  if (phase === "intro") {
    return (
      <div className={`qz qz--${theme} rush`}>
        <div className="dr-card">
          <p className="dr-title">Saturday night, 9:30pm</p>
          <p className="dr-text">
            Two hours behind a busy bar in twelve moments. The queue grows, the ice and glasses run down, and you get{" "}
            {RUSH_SECONDS} seconds for each call.
          </p>
          <ul className="rush-rules">
            <li>Pick what you&apos;d really do. Freeze and the queue notices.</li>
            <li>Call the bar-back for ice and glasses whenever you like. They&apos;re then away for {BARBACK_AWAY} moments.</li>
            <li>Scored on guests, speed, money and safety. Some rules can&apos;t be broken.</li>
          </ul>
          {stats && stats.shifts > 0 && (
            <p className="dr-text dr-text--muted">
              Your best: {stats.best} from {stats.shifts} shift{stats.shifts === 1 ? "" : "s"}
            </p>
          )}
          <div className="dr-actions">
            <button type="button" className="qz-next" onClick={start}>
              Start the shift
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done" || !moment) {
    return <Debrief run={run} saved={saved} stats={stats} onAgain={start} theme={theme} />;
  }

  const { state } = run;
  const free = barbackFree(state, index);
  const awayUntil = clockText(moment.clock + (state.barbackFreeAt - index) * 10);

  return (
    <div className={`qz qz--${theme} rush`}>
      <div className="rush-top">
        <p className="rush-clock">{clockText(moment.clock)}</p>
        <p className="rush-count">
          Moment {index + 1} of {RUSH_LENGTH}
        </p>
      </div>

      <div className="rush-bar">
        <div className="rush-queue">
          <span className="rush-stock-label">Waiting</span>
          <span className="rush-queue-dots" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={i < state.queue ? "rush-dot rush-dot--on" : "rush-dot"} />
            ))}
          </span>
          <span className="rush-queue-n">{state.queue}</span>
        </div>
        <Bar label="Ice" value={state.ice} low={state.ice <= 30} />
        <Bar label="Glasses" value={state.glasses} low={state.glasses <= 30} />
        <button
          type="button"
          className={callBarback ? "rush-barback rush-barback--on" : "rush-barback"}
          onClick={() => setCallBarback((c) => !c)}
          disabled={!free || flash !== null}
          aria-pressed={callBarback}
        >
          {!free ? `Bar-back away till ${awayUntil}` : callBarback ? "Bar-back on it" : "Call the bar-back"}
        </button>
      </div>

      <div className="rush-meters" aria-label="How the shift is going">
        {METERS.map((m) => (
          <span key={m.id} className="rush-meter">
            <span className="rush-meter-name">{m.name}</span>
            <span className="rush-meter-value">{meterLabel(m.id, state.meters[m.id])}</span>
          </span>
        ))}
      </div>

      <div className="qz-card rush-card">
        <div className="rush-timer" aria-hidden="true">
          <span className="rush-timer-fill" style={{ width: `${(left / RUSH_SECONDS) * 100}%` }} />
        </div>
        <p className="qz-format">{KIND_LABEL[moment.kind]}</p>
        <p className="rush-situation">{moment.situation}</p>
        <div className="qz-options" role="group" aria-label="What do you do?">
          {moment.choices.map((c, i) => (
            <button
              key={c.text}
              type="button"
              className="qz-option"
              onClick={() => commit(i)}
              disabled={flash !== null}
            >
              <span className="qz-option-key" aria-hidden="true">{i + 1}</span>
              {c.text}
            </button>
          ))}
        </div>
        <p className="rush-flash" role="status">
          {flash
            ? flash.verdict === null
              ? "You froze. The queue noticed."
              : flash.verdict === "best"
                ? "Good call."
                : flash.verdict === "breach"
                  ? "That's a rule you can't break."
                  : "Noted. See the debrief."
            : `${Math.ceil(left)} seconds`}
        </p>
      </div>
    </div>
  );
}

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-AU")}`;
}

function Debrief({
  run,
  saved,
  stats,
  onAgain,
  theme,
}: {
  run: ReturnType<typeof playRush>;
  saved: "saving" | "saved" | "failed" | null;
  stats: RushStats | null;
  onAgain: () => void;
  theme: Props["theme"];
}) {
  const result: RushResult = rushResult(run);
  const newBest = saved === "saved" && stats?.best === result.score && stats.shifts > 1;
  return (
    <div className={`qz qz--${theme} rush`}>
      <div className={result.breach ? "lg-verdict lg-verdict--fail" : result.score >= 70 ? "lg-verdict lg-verdict--pass" : "lg-verdict lg-verdict--fail"}>
        <p className="lg-verdict-title">{result.rating}</p>
        <p className="lg-verdict-score">
          Score {result.score}
          {newBest ? " · A new best" : stats?.best != null ? ` · Your best ${stats.best}` : ""}
        </p>
      </div>

      <div className="rush-totals">
        <span><strong>{result.served}</strong> served</span>
        <span><strong>{result.walked}</strong> walked out</span>
        <span><strong>{money(result.takings)}</strong> through the till</span>
        <span><strong>{money(result.waste)}</strong> wasted</span>
        <span><strong>{result.bestCalls} of {RUSH_LENGTH}</strong> best calls</span>
      </div>

      <div className="lg-dials">
        {METERS.map((m) => (
          <div key={m.id} className="lg-dial">
            <span className="lg-dial-name">{m.name}</span>
            <span className="lg-dial-value">{meterLabel(m.id, result.meters[m.id])}</span>
          </div>
        ))}
      </div>

      <h3 className="lg-reveal-title">The shift, call by call</h3>
      <ol className="rush-review">
        {run.played.map(({ moment, choice, barback }) => {
          const picked = choice === null ? null : moment.choices[choice];
          const best = moment.choices.find((c) => c.verdict === "best")!;
          return (
            <li key={moment.templateId} className="lg-thought">
              <span className="lg-thought-you">
                {clockText(moment.clock)} · {KIND_LABEL[moment.kind]}
                {barback ? " · You called the bar-back" : ""}
              </span>
              <p className="rush-review-situation">{moment.situation}</p>
              <p className={`rush-review-pick rush-review-pick--${picked?.verdict ?? "froze"}`}>
                {picked ? `${VERDICT_LABEL[picked.verdict]}: ${picked.text}` : "You froze"}
              </p>
              {picked?.verdict !== "best" && <p className="rush-review-best">Best call: {best.text}</p>}
              <p className="rush-review-why">{moment.why}</p>
            </li>
          );
        })}
      </ol>

      {saved === "failed" && <p className="lg-muted">This shift couldn&apos;t be saved, so it won&apos;t count towards your best.</p>}

      <div className="lc-nav">
        <button type="button" className="qz-next" onClick={onAgain}>
          Another shift
        </button>
      </div>
    </div>
  );
}
