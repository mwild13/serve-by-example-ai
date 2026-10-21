"use client";

import MixedDrill from "@/components/quiz/MixedDrill";
import { DRILL_MIN_STARTED, isMastered, isStarted } from "@/lib/next-step";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadModules } from "@/lib/staff-data";

// Desktop host for the mixed drill (Rich update, Phase 10) and the pre-shift
// drill Today opens (Phase 12), on the green room
// (docs/STAFF_APP.md section 8): the drill in a panel, what feeds it
// beside it. The drill itself is components/quiz/MixedDrill.tsx,
// shared with mobile.
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
  const { data: loaded, failed } = useStaffData(STAFF_KEYS.modules, loadModules, getToken);
  const modules = loaded ?? (failed ? [] : undefined);

  const sources = (modules ?? []).filter(isStarted);
  const preshift = mode === "preshift";

  return (
    <div className="sd-page">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">{preshift ? "Ready for your shift" : "Mixed Drill"}</h1>
          <p className="sd-subtitle">{preshift ? "Six questions from what you've learnt, about three minutes. Finish it and your shift streak grows." : "Ten questions from every module you've started, never two in a row from the same one. Mixing topics is how it sticks for the shift."}</p>
        </div>
      </header>
      <div className="sd-split">
        <div className="sd-docket">
          <MixedDrill
            theme="light"
            mode={mode}
            getToken={getToken}
            onOpenModule={(moduleId) => onOpenModule(moduleId)}
            onBrowseModules={onBrowseModules}
            onLiveGuest={onLiveGuest}
          />
        </div>
        <aside className="sd-panel sd-side" aria-label="What the drill draws on">
          <div className="sd-panel-head">
            <p className="sd-label">In your drills</p>
          </div>
          {modules === undefined ? null : sources.length === 0 ? (
            <p className="sd-note">Nothing yet. Every module you start comes into your drills.</p>
          ) : (
            <ul className="sd-side-list">
              {sources.map((m) => (
                <li key={m.id}>
                  <span>{m.title}</span>
                  <span className="sd-side-meta">{isMastered(m) ? "Mastered" : "Started"}</span>
                </li>
              ))}
            </ul>
          )}
          {modules !== undefined && !preshift && sources.length < DRILL_MIN_STARTED && (
            <p className="sd-note">
              Start {DRILL_MIN_STARTED - sources.length} more {DRILL_MIN_STARTED - sources.length === 1 ? "module" : "modules"} and mixed drills open.
            </p>
          )}
          <p className="sd-note">Questions from your venue&apos;s menu come in too, once your manager adds them.</p>
        </aside>
      </div>
    </div>
  );
}
