import { Check } from "lucide-react";
import { isMastered, isStarted, type StepModule } from "@/lib/next-step";

// The staff desktop's mastery ring (sd-ring rules in app/styles/staff.css),
// shared by Modules and My progress.

/** A mastery ring: empty, a brass arc as mastery grows, a full ring with a tick once mastered. */
export default function MasteryRing({ module }: { module: StepModule }) {
  const r = 11;
  const c = 2 * Math.PI * r;
  const done = isMastered(module);
  const pct = done ? 100 : module.mastery_pct;
  return (
    <span className={`sd-ring${done ? " is-done" : ""}${isStarted(module) ? " is-started" : ""}`} aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle className="sd-ring-track" cx="14" cy="14" r={r} />
        {pct > 0 && (
          <circle
            className="sd-ring-arc"
            cx="14"
            cy="14"
            r={r}
            strokeDasharray={`${(pct / 100) * c} ${c}`}
            transform="rotate(-90 14 14)"
          />
        )}
      </svg>
      {done ? <Check size={13} strokeWidth={2.5} /> : isStarted(module) && pct === 0 ? <span className="sd-ring-dot" /> : null}
    </span>
  );
}
