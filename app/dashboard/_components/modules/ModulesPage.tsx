"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Search } from "lucide-react";
import MasteryRing from "@/app/dashboard/_components/parts/MasteryRing";
import { isMastered, isStarted, type StepModule } from "@/lib/next-step";

// Modules as a path, not a grid (docs/STAFF_APP.md section 8): one module
// lifted above the list with the reason it's suggested, then all of them as
// rows by level in one panel, the next one marked.
// Replaced DynamicModuleNav. Styles: the sd-modules rules in staff.css.

type Module = StepModule & { description?: string | null };

type Area = "all" | "technical" | "service" | "compliance";

const AREAS: { id: Area; label: string }[] = [
  { id: "all", label: "All" },
  { id: "technical", label: "Behind the bar" },
  { id: "service", label: "Service and sales" },
  { id: "compliance", label: "Safety and compliance" },
];

const AREA_LABEL: Record<string, string> = {
  technical: "Behind the bar",
  service: "Service and sales",
  compliance: "Safety and compliance",
};

const LEVELS = [
  { id: "foundations", label: "Foundations", test: (d: number) => d <= 2 },
  { id: "intermediate", label: "Intermediate", test: (d: number) => d === 3 },
  { id: "advanced", label: "Advanced", test: (d: number) => d >= 4 },
];

function statusText(m: Module): string {
  if (isMastered(m)) return "Mastered";
  if (isStarted(m)) return m.mastery_pct > 0 ? `${m.mastery_pct}% mastered` : "Started";
  return "Not started";
}

function actionText(m: Module): string {
  if (isMastered(m)) return "Go over it";
  if (isStarted(m)) return "Carry on";
  return "Start";
}

export default function ModulesPage({
  getToken,
  onOpenModule,
}: {
  getToken: () => Promise<string>;
  onOpenModule: (moduleId: number) => void;
}) {
  const [modules, setModules] = useState<Module[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [area, setArea] = useState<Area>("all");
  const [query, setQuery] = useState("");
  const hereRef = useRef<HTMLLIElement | null>(null);
  const [herePos, setHerePos] = useState<"in" | "above" | "below">("in");

  useEffect(() => {
    let cancelled = false;
    getToken()
      .then((token) => fetch("/api/training/modules?sort=recommended", { headers: { Authorization: `Bearer ${token}` } }))
      .then((r) => (r.ok ? (r.json() as Promise<{ modules: Module[] }>) : Promise.reject(new Error("Could not load the modules."))))
      .then((data) => {
        if (!cancelled) setModules(data.modules);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the modules.");
      });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const all = useMemo(() => modules ?? [], [modules]);
  const featured = all.find((m) => m.recommended) ?? null;
  const alsoSuggested = all.filter((m) => m.recommended && m.id !== featured?.id).slice(0, 2);
  const mastered = all.filter(isMastered).length;
  const started = all.filter((m) => isStarted(m) && !isMastered(m)).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (m) =>
        (area === "all" || m.category === area) &&
        (!q || m.title.toLowerCase().includes(q) || (m.description ?? "").toLowerCase().includes(q)),
    );
  }, [all, area, query]);

  const counts = useMemo(() => {
    const out: Record<Area, number> = { all: all.length, technical: 0, service: 0, compliance: 0 };
    for (const m of all) if (m.category in out) out[m.category as Area] += 1;
    return out;
  }, [all]);

  // "Where I'm up to", once the marked row has scrolled out of view.
  const hereId = featured?.id ?? null;
  useEffect(() => {
    const el = hereRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setHerePos("in");
      else setHerePos(entry.boundingClientRect.top < 0 ? "above" : "below");
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hereId, shown]);

  const featuredCta = featured ? (isStarted(featured) ? "Carry on" : "Start this module") : "";

  return (
    <div className="sd-page sd-modules">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">Modules</h1>
          <p className="sd-subtitle">Short cards, then a quiz. Pass the quiz and the module is mastered.</p>
        </div>
        {modules && (
          <p className="sd-pagehead-aside">
            <strong>{mastered}</strong> of {all.length} mastered{started > 0 ? `, ${started} on the go` : ""}
          </p>
        )}
      </header>

      {error && <p className="sd-error" role="alert">{error}</p>}

      {!modules && !error && (
        <div className="sd-panel">
          <div className="sd-wait" aria-hidden="true">
            <span className="sd-skel sd-skel-label" />
            <span className="sd-skel sd-skel-title" />
            <span className="sd-skel sd-skel-line" />
          </div>
        </div>
      )}

      {featured && (
        <section className="sd-panel sd-feature" aria-labelledby="sd-feature-title">
          <div className="sd-feature-main">
            <p className="sd-label sd-label-accent">{featured.recommendation_reason ?? "Suggested next"}</p>
            <h2 id="sd-feature-title" className="sd-feature-title">{featured.title}</h2>
            {featured.description && <p className="sd-feature-body">{featured.description}</p>}
            <button type="button" className="sd-btn sd-btn-primary" onClick={() => onOpenModule(featured.id)}>
              {featuredCta}
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          {alsoSuggested.length > 0 && (
            <div className="sd-feature-also">
              <p className="sd-label">Also suggested</p>
              <ul className="sd-list">
                {alsoSuggested.map((m) => (
                  <li key={m.id}>
                    <button type="button" className="sd-list-row" onClick={() => onOpenModule(m.id)}>
                      <MasteryRing module={m} />
                      <span className="sd-list-main">
                        <span className="sd-list-title">{m.title}</span>
                        <span className="sd-list-meta">{AREA_LABEL[m.category] ?? m.category}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {modules && (
        <>
          <div className="sd-toolbar">
            <div className="sd-tabs" role="tablist" aria-label="Area">
              {AREAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="tab"
                  aria-selected={area === a.id}
                  className={`sd-tab${area === a.id ? " is-active" : ""}`}
                  onClick={() => setArea(a.id)}
                >
                  {a.label}
                  <span className="sd-tab-count">{counts[a.id]}</span>
                </button>
              ))}
            </div>
            <label className="sd-search">
              <Search size={16} strokeWidth={2} aria-hidden />
              <span className="sd-visually-hidden">Find a module</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a module" />
            </label>
          </div>

          {shown.length === 0 ? (
            <p className="sd-empty">No module matches &ldquo;{query}&rdquo;.</p>
          ) : (
            <div className="sd-panel sd-panel-flush">
              {LEVELS.map((level) => {
                const rows = shown.filter((m) => level.test(m.difficulty_level));
                if (rows.length === 0) return null;
                const done = rows.filter(isMastered).length;
                return (
                  <section key={level.id} aria-labelledby={`sd-level-${level.id}`}>
                    <div className="sd-rows-head">
                      <h2 id={`sd-level-${level.id}`} className="sd-label">{level.label}</h2>
                      <p className="sd-note">{done} of {rows.length} mastered</p>
                    </div>
                    <ol className="sd-rows">
                      {rows.map((m) => {
                        const here = m.id === hereId;
                        return (
                          <li key={m.id} ref={here ? hereRef : undefined} className={`sd-row-item${here ? " is-here" : ""}`}>
                            <button type="button" className="sd-row" onClick={() => onOpenModule(m.id)}>
                              <MasteryRing module={m} />
                              <span className="sd-row-main">
                                <span className="sd-row-title">
                                  {m.title}
                                  {here && <span className="sd-tag">Up next</span>}
                                </span>
                                {m.description && <span className="sd-row-desc">{m.description}</span>}
                              </span>
                              <span className="sd-row-area">{AREA_LABEL[m.category] ?? m.category}</span>
                              <span className="sd-row-status">{statusText(m)}</span>
                              <span className="sd-row-action">
                                {actionText(m)}
                                <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

      {hereId !== null && herePos !== "in" && (
        <button
          type="button"
          className="sd-return"
          onClick={() =>
            hereRef.current?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "center",
            })
          }
        >
          {herePos === "above" ? <ArrowUp size={16} strokeWidth={2} aria-hidden /> : <ArrowDown size={16} strokeWidth={2} aria-hidden />}
          Where I&apos;m up to
        </button>
      )}
    </div>
  );
}
