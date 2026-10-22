"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenText, Check, LockKeyhole, Martini, Search, Sparkles } from "lucide-react";
import Screen from "./ui/Screen";
import { ButtonLink, Card, Pill, ProgressRing, Row, RowList, Section } from "./ui/parts";
import { useMobileSession } from "../_lib/mobile-session-context";
import { useGetToken } from "../_lib/use-staff";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadModules, type StaffModule } from "@/lib/staff-data";
import { isMastered, isStarted } from "@/lib/next-step";
import { moduleHref } from "@/lib/home-feed";
import { COCKTAILS } from "@/lib/cocktails";
import { KB_ENTRIES } from "@/lib/knowledge-base";

// The Learn tab (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md, phase 4): modules as a
// path, as on the staff desktop's Modules page (ModulesPage.tsx). The
// suggested module on top with the reason, the skill check until it's done,
// then every module as a row under its level, the suggested one marked "Up
// next". The practice games moved to the Practise tab; the reference library
// stays here at the foot. Styles: the sm- rules in app/styles/staff.css.

type Area = "all" | "technical" | "service" | "compliance";

const AREAS: { id: Area; label: string }[] = [
  { id: "all", label: "All" },
  { id: "technical", label: "Bar" },
  { id: "service", label: "Service" },
  { id: "compliance", label: "Safety" },
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

function statusText(m: StaffModule): string {
  if (isMastered(m)) return "Mastered";
  if (isStarted(m)) return m.mastery_pct > 0 ? `${m.mastery_pct}% mastered` : "Started";
  return "Not started";
}

export default function LearnScreen() {
  const session = useMobileSession();
  const getToken = useGetToken();
  const { data: modules, failed } = useStaffData(STAFF_KEYS.modules, loadModules, getToken);
  const [area, setArea] = useState<Area>("all");
  const [query, setQuery] = useState("");

  const all = useMemo(() => modules ?? [], [modules]);
  const allowed = useMemo(() => new Set(session.allowedModules), [session.allowedModules]);
  const featured = all.find((m) => m.recommended && allowed.has(m.id)) ?? null;
  const mastered = all.filter(isMastered).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (m) =>
        (area === "all" || m.category === area) &&
        (!q || m.title.toLowerCase().includes(q) || (m.description ?? "").toLowerCase().includes(q)),
    );
  }, [all, area, query]);

  return (
    <Screen title="Learn" kicker={modules ? `${mastered} of ${all.length} mastered` : " "} tab="learn">
      <div className="sm-learn">
        {failed && !modules && (
          <Card>
            <p className="sm-learn-empty">Could not load the modules. Check your connection, then open Learn again.</p>
          </Card>
        )}

        {!modules && !failed && <div className="sm-skel" style={{ height: 210, borderRadius: 22 }} aria-label="Loading" />}

        {featured && (
          <div className="sm-card sm-card--active sm-learn-feature">
            <p className="sm-kicker sm-learn-reason">
              <Sparkles size={14} strokeWidth={2.4} aria-hidden="true" />
              {featured.recommendation_reason ?? "Suggested next"}
            </p>
            <h2 className="sm-learn-feature-title">{featured.title}</h2>
            {featured.description && <p className="sm-card-sub">{featured.description}</p>}
            <ButtonLink href={moduleHref(featured)} variant="primary">
              {isStarted(featured) ? "Continue" : "Start this module"}
              <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
            </ButtonLink>
          </div>
        )}

        {!session.skillCheckDone && session.allowedModules.length > 0 && (
          <Card>
            <div className="sm-learn-check">
              <p className="sm-card-title">Skip what you already know</p>
              <p className="sm-card-sub">
                Take the two-minute skill check. Areas you know start on harder questions, and any module can be mastered
                straight away with its test-out.
              </p>
              <Link href="/mobile/onboarding" className="sm-textlink">
                Start the skill check
              </Link>
            </div>
          </Card>
        )}
      </div>

      {modules && (
        <>
          <div className="sm-learn-tools">
            <div className="sm-segment" role="radiogroup" aria-label="Area">
              {AREAS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={area === a.id}
                  className="sm-segment-option"
                  onClick={() => setArea(a.id)}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <label className="sm-search">
              <Search size={18} strokeWidth={2.2} aria-hidden="true" />
              <span className="sr-only">Find a module</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a module" />
            </label>
          </div>

          {shown.length === 0 && (
            <p className="sm-learn-empty sm-learn-empty--loose">No module matches &ldquo;{query.trim()}&rdquo;.</p>
          )}

          {LEVELS.map((level) => {
            const rows = shown.filter((m) => level.test(m.difficulty_level));
            if (rows.length === 0) return null;
            return (
              <Section key={level.id} title={level.label} note={`${rows.filter(isMastered).length} of ${rows.length} mastered`}>
                <RowList>
                  {rows.map((m) => (
                    <ModuleRow key={m.id} module={m} locked={!allowed.has(m.id)} upNext={m.id === featured?.id} />
                  ))}
                </RowList>
              </Section>
            );
          })}
        </>
      )}

      <Section title="Look it up">
        <RowList>
          <Row href="/mobile/cocktails" icon={Martini} label="Cocktail library" end={<Pill>{COCKTAILS.length}</Pill>} />
          <Row href="/mobile/knowledge" icon={BookOpenText} label="Knowledge base" end={<Pill>{KB_ENTRIES.length}</Pill>} />
        </RowList>
      </Section>
    </Screen>
  );
}

/** One module: its mastery ring, title, area and where they're up to. Locked ones open the plans. */
function ModuleRow({ module: m, locked, upNext }: { module: StaffModule; locked: boolean; upNext: boolean }) {
  const done = isMastered(m);
  return (
    <Link href={locked ? "/membership" : moduleHref(m)} className={`sm-row sm-module${upNext ? " is-next" : ""}`}>
      {locked ? (
        <span className="sm-module-mark" aria-hidden="true">
          <LockKeyhole size={18} strokeWidth={2.2} />
        </span>
      ) : done ? (
        <span className="sm-module-mark sm-module-mark--done" aria-hidden="true">
          <Check size={20} strokeWidth={3} />
        </span>
      ) : isStarted(m) ? (
        <ProgressRing value={m.mastery_pct} label={`${m.mastery_pct} percent mastered`} />
      ) : (
        <span className="sm-module-mark sm-module-mark--todo" aria-hidden="true" />
      )}
      <span className="sm-row-text">
        <span className="sm-row-label">{m.title}</span>
        <span className="sm-row-sub">
          {AREA_LABEL[m.category] ?? "Module"}. {locked ? "On a paid plan" : statusText(m)}
        </span>
      </span>
      {upNext && <Pill tone="accent">Up next</Pill>}
    </Link>
  );
}
