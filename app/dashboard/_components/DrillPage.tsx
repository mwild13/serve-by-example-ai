"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Flame, Shuffle } from "lucide-react";
import MixedDrill from "@/components/quiz/MixedDrill";
import MasteryRing from "@/app/dashboard/_components/parts/MasteryRing";
import { DRILL_MIN_STARTED, isMastered, isStarted } from "@/lib/next-step";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadModules, loadShiftStreak } from "@/lib/staff-data";

// The mixed drill (Rich update, Phase 10) and the pre-shift drill Today
// opens (Phase 12) on the staff desktop (docs/STAFF_APP.md section 8): the
// drill on the green card, a figure beside it, then the modules it draws
// on. Starting plays components/quiz/MixedDrill.tsx (shared with mobile)
// without its own intro card.

const AREA_LABEL: Record<string, string> = {
  technical: "Behind the bar",
  service: "Service and sales",
  compliance: "Safety and compliance",
};

export default function DrillPage({
  mode = "mixed",
  getToken,
  onOpenModule,
  onBrowseModules,
  onLiveGuest,
}: {
  mode?: "mixed" | "preshift";
  getToken: () => Promise<string>;
  onOpenModule: (moduleId: number) => void;
  onBrowseModules: () => void;
  onLiveGuest: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const { data: loaded, failed } = useStaffData(STAFF_KEYS.modules, loadModules, getToken);
  const { data: streak } = useStaffData(STAFF_KEYS.shiftStreak, loadShiftStreak, getToken);
  const modules = loaded ?? (failed ? [] : undefined);

  const sources = (modules ?? []).filter(isStarted);
  const mastered = sources.filter(isMastered).length;
  const preshift = mode === "preshift";
  const short = !preshift && modules !== undefined && sources.length < DRILL_MIN_STARTED;
  const title = preshift ? "Ready for your shift" : "Mixed Drill";

  if (playing) {
    return (
      <div className="sd-page sd-reading">
        <button type="button" className="sd-back" onClick={() => setPlaying(false)}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          {title}
        </button>
        <div className="sd-docket">
          <MixedDrill
            theme="light"
            mode={mode}
            autoStart
            getToken={getToken}
            onOpenModule={(moduleId) => onOpenModule(moduleId)}
            onBrowseModules={onBrowseModules}
            onLiveGuest={onLiveGuest}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="sd-page">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">{title}</h1>
          <p className="sd-subtitle">
            {preshift
              ? "A quick warm-up before you clock on, built from what you've learnt."
              : "Questions from every module you've started, mixed together. Mixing topics is how it sticks for the shift."}
          </p>
        </div>
      </header>

      <div className="sd-grid">
        <section className="sd-panel sd-step sd-col-8" aria-labelledby="sd-drill-title">
          <p className="sd-label">{preshift ? "Before your shift" : "Practice"}</p>
          <h2 id="sd-drill-title" className="sd-step-title">{preshift ? "Six questions, three minutes" : "Ten questions, mixed"}</h2>
          <p className="sd-step-body">
            {preshift
              ? "What's new at your venue first, then what's due for a refresh, then the rest of your modules."
              : "Never two in a row from the same module, at full difficulty, and each drill leaves out the questions from your last one."}
          </p>
          <p className="sd-hero-meta">
            <span className="sd-hero-meta-item">
              {preshift ? <Flame size={14} strokeWidth={2} aria-hidden /> : <Shuffle size={14} strokeWidth={2} aria-hidden />}
              {preshift ? "Grows your shift streak" : `From ${sources.length} ${sources.length === 1 ? "module" : "modules"}`}
            </span>
            <span>Practice only: your mastery doesn&apos;t change</span>
          </p>
          <div className="sd-actions">
            <button type="button" className="sd-btn sd-btn-primary" onClick={() => setPlaying(true)} disabled={short}>
              {preshift ? "Start" : "Start the drill"}
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
            </button>
            {short && (
              <button type="button" className="sd-btn sd-btn-ghost" onClick={onBrowseModules}>
                Start {DRILL_MIN_STARTED - sources.length} more {DRILL_MIN_STARTED - sources.length === 1 ? "module" : "modules"} to open it
              </button>
            )}
          </div>
        </section>

        <section className="sd-panel sd-col-4 sd-side-figure" aria-label={preshift ? "Shift streak" : "In your drills"}>
          <div className="sd-panel-head">
            <p className="sd-label">{preshift ? "Shift streak" : "In your drills"}</p>
            {preshift && <Flame size={16} strokeWidth={2} className="sd-panel-icon" aria-hidden />}
          </div>
          {preshift ? (
            <>
              <p className="sd-figure">
                {streak?.count ?? 0}
                <span className="sd-figure-unit">{streak?.count === 1 ? "shift" : "shifts"} in a row</span>
              </p>
              <p className="sd-note">
                {streak?.doneToday ? "Done for today. Your streak is safe." : "Finish this drill to add today to your streak."}
              </p>
            </>
          ) : (
            <>
              <p className="sd-figure">
                {sources.length}
                <span className="sd-figure-unit">{sources.length === 1 ? "module" : "modules"} feeding your drills</span>
              </p>
              <span className="sd-bar" aria-hidden>
                <span style={{ width: `${sources.length ? (mastered / sources.length) * 100 : 0}%` }} />
              </span>
              <p className="sd-note">{mastered} of them mastered. Every module you start joins in.</p>
            </>
          )}
        </section>
      </div>

      <section className="sd-section" aria-labelledby="sd-drill-from">
        <div className="sd-section-head">
          <h2 id="sd-drill-from" className="sd-h2">What it draws on</h2>
          <p className="sd-note">Questions from your venue&apos;s menu come in too, once your manager adds them.</p>
        </div>
        <div className="sd-panel sd-panel-flush">
          {modules === undefined ? null : sources.length === 0 ? (
            <p className="sd-empty sd-drill-empty">
              Nothing yet. Start a module and its questions come into your drills.{" "}
              <button type="button" className="sd-textlink" onClick={onBrowseModules}>Open modules</button>
            </p>
          ) : (
            <ul className="sd-list sd-drill-list">
              {sources.map((m) => (
                <li key={m.id}>
                  <button type="button" className="sd-list-row" onClick={() => onOpenModule(m.id)}>
                    <MasteryRing module={m} />
                    <span className="sd-list-main">
                      <span className="sd-list-title">{m.title}</span>
                      <span className="sd-list-meta">{AREA_LABEL[m.category] ?? m.category}</span>
                    </span>
                    <span className="sd-list-action">{isMastered(m) ? "Mastered" : m.mastery_pct > 0 ? `${m.mastery_pct}% mastered` : "Started"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
