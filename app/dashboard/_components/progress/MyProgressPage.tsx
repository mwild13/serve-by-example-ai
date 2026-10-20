"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import MasteryRing from "@/app/dashboard/_components/parts/MasteryRing";
import { computeBadges, type CategoryScores, type ModuleSummaryForBadges } from "@/lib/badges";
import { getShiftStreak } from "@/lib/verify-quiz-client";
import type { ShiftStreak } from "@/lib/shift-streak";
import { isMastered, isStarted, type StepModule } from "@/lib/next-step";
import type { StaffNavId } from "@/app/dashboard/_components/shell/StaffSidebar";

// My progress (docs/STAFF_DESKTOP_REDESIGN_PLAN.md, 7.6): one figure, three
// ledgers for Learn, Drill and Live Guest, mastery by area, then badges.
// Replaced ProgressOverview and BadgesView; ?nav=badges opens it at the
// badges. Styles: the sd-progress rules in staff.css.

const AREAS: { id: "technical" | "service" | "compliance"; label: string }[] = [
  { id: "technical", label: "Behind the bar" },
  { id: "service", label: "Service and sales" },
  { id: "compliance", label: "Safety and compliance" },
];

type Ledger = { label: string; value: string; note?: string }[];

function lastTrained(iso: unknown): string {
  if (typeof iso !== "string") return "Not yet";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long" }).format(new Date(iso));
}

/** The daily-visit streak the streak badges count (lib/streak.ts), read only. */
function visitStreak(): number {
  try {
    return parseInt(localStorage.getItem("sbe-streak-count") ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

export default function MyProgressPage({
  progressData,
  getToken,
  openAtBadges,
  onOpenModule,
  onNavigate,
}: {
  progressData: Record<string, unknown> | null;
  getToken: () => Promise<string>;
  openAtBadges: boolean;
  onOpenModule: (moduleId: number) => void;
  onNavigate: (id: StaffNavId) => void;
}) {
  const [modules, setModules] = useState<StepModule[] | null>(null);
  const [streak, setStreak] = useState<ShiftStreak | null>(null);
  const [rush, setRush] = useState<{ best: number | null; shifts: number } | null>(null);
  const [visits, setVisits] = useState(0);
  const badgesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Browser-only read on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisits(visitStreak());
    let cancelled = false;
    getToken()
      .then((token) =>
        Promise.allSettled([
          fetch("/api/training/modules", { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
            r.ok ? (r.json() as Promise<{ modules: StepModule[] }>) : Promise.reject(new Error("modules")),
          ),
          getShiftStreak(token),
          fetch("/api/training/rush", { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
            r.ok ? (r.json() as Promise<{ best: number | null; shifts: number }>) : Promise.reject(new Error("rush")),
          ),
        ]),
      )
      .then(([mods, shift, rushStats]) => {
        if (cancelled) return;
        setModules(mods.status === "fulfilled" ? mods.value.modules : []);
        if (shift.status === "fulfilled") setStreak(shift.value);
        if (rushStats.status === "fulfilled") setRush(rushStats.value);
      })
      .catch(() => {
        if (!cancelled) setModules([]);
      });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  useEffect(() => {
    if (openAtBadges && modules) badgesRef.current?.scrollIntoView({ block: "start" });
  }, [openAtBadges, modules]);

  const all = useMemo(() => modules ?? [], [modules]);
  const total = all.length || 40;
  const mastered = all.filter(isMastered).length;
  const going = all.filter((m) => isStarted(m) && !isMastered(m)).length;
  const firstDay = modules !== null && all.every((m) => !isStarted(m));
  const firstModule = all.find((m) => m.recommended) ?? all[0];

  const reviewDue = Array.isArray(progressData?.reviewQueue) ? (progressData.reviewQueue as unknown[]).length : 0;
  const passes = typeof progressData?.arenaModuleCount === "number" ? progressData.arenaModuleCount : 0;
  const challenges = typeof progressData?.challengesCompleted === "number" ? progressData.challengesCompleted : 0;
  const totalChallenges = typeof progressData?.totalChallenges === "number" ? progressData.totalChallenges : 5;

  const learn: Ledger = [
    { label: "Modules mastered", value: `${mastered} of ${total}` },
    { label: "On the go", value: String(going) },
    { label: "Due for review", value: String(reviewDue), note: reviewDue > 0 ? "A mixed drill brings them back" : undefined },
  ];
  const drill: Ledger = [
    { label: "Shift streak", value: streak ? `${streak.count} ${streak.count === 1 ? "shift" : "shifts"}` : "None yet" },
    { label: "Freezes left", value: streak ? String(streak.freezesLeft) : "2" },
    { label: "Saturday Rush best", value: rush?.best != null ? `${rush.best}` : "Not played", note: rush && rush.shifts > 0 ? `${rush.shifts} ${rush.shifts === 1 ? "shift" : "shifts"} played` : undefined },
  ];
  const live: Ledger = [
    { label: "Guests sorted", value: String(passes) },
    { label: "Challenges done", value: `${challenges} of ${totalChallenges}` },
    { label: "Last trained", value: lastTrained(progressData?.lastAttemptAt) },
  ];

  // Badges, worked out as they always were: from /api/training/progress.
  const badges = useMemo(() => {
    const allModules = Array.isArray(progressData?.allModules) ? (progressData.allModules as { id: number; category: string }[]) : [];
    const mp = (progressData?.moduleProgress as Record<number, { mastery?: number; scenariosAttempted?: number }>) ?? {};
    const summaries: ModuleSummaryForBadges[] = allModules.map((m) => ({
      category: m.category as ModuleSummaryForBadges["category"],
      mastered: (mp[m.id]?.mastery ?? 0) >= 80,
      attempted: (mp[m.id]?.scenariosAttempted ?? 0) > 0,
    }));
    const mastery = (progressData?.mastery as Partial<CategoryScores> | undefined) ?? {};
    const scores: CategoryScores = { bartending: mastery.bartending ?? 0, sales: mastery.sales ?? 0, management: mastery.management ?? 0 };
    const list = computeBadges(
      summaries,
      scores,
      visits,
      typeof progressData?.bestCorrectStreak === "number" ? progressData.bestCorrectStreak : 0,
      typeof progressData?.sbeEliteNumber === "number" ? progressData.sbeEliteNumber : 0,
    );
    return [...list.filter((b) => b.earned), ...list.filter((b) => !b.earned)];
  }, [progressData, visits]);
  const earned = badges.filter((b) => b.earned).length;
  const nextBadge = badges.find((b) => !b.earned && b.progress && b.progress.current > 0) ?? badges.find((b) => !b.earned);

  return (
    <div className="sd-page sd-progress">
      <header className="sd-head">
        <p className="sd-kicker">Me</p>
        <h1 className="sd-title">My progress</h1>
        <p className="sd-lede">Your training so far: what you&apos;ve mastered, how you&apos;re keeping it sharp, and the guests you&apos;ve sorted.</p>
      </header>

      {modules === null ? (
        <div className="sd-tonight-wait" aria-hidden="true">
          <span className="sd-skel sd-skel-kicker" />
          <span className="sd-skel sd-skel-title" />
          <span className="sd-skel sd-skel-line" />
        </div>
      ) : firstDay ? (
        <section className="sd-feature sd-progress-first" aria-labelledby="sd-first">
          <div className="sd-feature-main">
            <p className="sd-kicker sd-kicker-brass">Nothing to show yet</p>
            <h2 id="sd-first" className="sd-feature-title">Your first module will show here</h2>
            <p className="sd-feature-body">
              Start {firstModule ? firstModule.title : "a module"}. Once you&apos;ve passed its quiz, this page fills in: modules
              mastered, your shift streak, guests sorted and badges.
            </p>
            {firstModule && (
              <button type="button" className="sd-btn sd-btn-brass" onClick={() => onOpenModule(firstModule.id)}>
                Start {firstModule.title}
                <ArrowRight size={18} strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="sd-progress-hero" aria-label="Modules mastered">
            <p className="sd-progress-figure">
              {mastered}
              <span>of {total} modules mastered</span>
            </p>
            <span className="sd-meter sd-progress-meter" aria-hidden="true">
              <span style={{ width: `${(mastered / total) * 100}%` }} />
            </span>
          </section>

          <section className="sd-ledgers" aria-label="Where you're at">
            {[
              { title: "Learn", rows: learn },
              { title: "Drill", rows: drill },
              { title: "Live Guest", rows: live },
            ].map((col, i) => (
              <div key={col.title} className="sd-ledger">
                <p className="sd-path-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="sd-path-name">{col.title}</h2>
                <dl>
                  {col.rows.map((row) => (
                    <div key={row.label} className="sd-ledger-row">
                      <dt>{row.label}</dt>
                      <dd>
                        {row.value}
                        {row.note && <span>{row.note}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </section>
        </>
      )}

      {modules !== null && all.length > 0 && (
        <section className="sd-areas" aria-labelledby="sd-areas-title">
          <div className="sd-section-head">
            <h2 id="sd-areas-title" className="sd-h2">Mastery by area</h2>
            <button type="button" className="sd-link" onClick={() => onNavigate("module")}>All modules</button>
          </div>
          <div className="sd-areas-grid">
            {AREAS.map((area) => {
              const list = all.filter((m) => m.category === area.id);
              return (
                <div key={area.id} className="sd-area">
                  <h3 className="sd-area-title">
                    {area.label}
                    <span>{list.filter(isMastered).length} of {list.length}</span>
                  </h3>
                  <ul>
                    {list.map((m) => (
                      <li key={m.id}>
                        <button type="button" className="sd-area-item" onClick={() => onOpenModule(m.id)}>
                          <MasteryRing module={m} />
                          <span>{m.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section ref={badgesRef} id="badges" className="sd-badges" aria-labelledby="sd-badges-title">
        <div className="sd-section-head">
          <h2 id="sd-badges-title" className="sd-h2">Badges</h2>
          <p className="sd-section-lede">{earned} of {badges.length} earned</p>
        </div>
        {nextBadge && (
          <div className="sd-badge-next">
            <p className="sd-kicker sd-kicker-brass">Next to earn</p>
            <p className="sd-badge-next-title">{nextBadge.label}</p>
            <p className="sd-badge-next-text">{nextBadge.description}</p>
            {nextBadge.progress && (
              <>
                <span className="sd-meter" aria-hidden="true">
                  <span style={{ width: `${Math.min(100, (nextBadge.progress.current / nextBadge.progress.required) * 100)}%` }} />
                </span>
                <p className="sd-meta">
                  {nextBadge.progress.unit.startsWith("%")
                    ? `${nextBadge.progress.current}% of ${nextBadge.progress.required}%${nextBadge.progress.unit.slice(1)}`
                    : `${nextBadge.progress.current} of ${nextBadge.progress.required} ${nextBadge.progress.unit}`}
                </p>
              </>
            )}
          </div>
        )}
        <ul className="sd-badge-list">
          {badges.map((b) => (
            <li key={b.id} className={`sd-badge${b.earned ? " is-earned" : ""}`}>
              <span className="sd-badge-mark" aria-hidden="true">{b.earned ? <Check size={14} strokeWidth={2.5} /> : null}</span>
              <span className="sd-badge-text">
                <span className="sd-badge-label">
                  {b.label}
                  <span className="sd-visually-hidden">{b.earned ? ", earned" : ", not earned yet"}</span>
                </span>
                <span className="sd-badge-desc">{b.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
