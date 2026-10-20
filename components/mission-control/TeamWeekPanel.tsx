"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GOAL_KINDS,
  GOAL_LABEL,
  weekLabel,
  type GoalKind,
  type GuestOption,
  type ManagerWeek,
} from "@/lib/team-week-shared";
import { PageHead, Panel, StatRow } from "./console-ui";

// The This Week tab (Rich update, Phase 16): set the team's goal and the
// guest of the week, and print the briefing card for the pre-shift meeting.
// Team totals only, never who. Reads and writes /api/management/team-week
// itself, like Venue Content. Server side: lib/team-week.ts.

type Props = {
  venueId: string;
  venueName: string | undefined;
  sessionToken: string | null;
};

const AREA_LABEL: Record<GuestOption["area"], string> = {
  technical: "Behind the bar",
  service: "Service and sales",
  compliance: "Safety and compliance",
};
const LEVEL_LABEL: Record<GuestOption["level"], string> = { 1: "gentle", 2: "tricky", 3: "hard" };

function dayLabel(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-AU", { day: "numeric", month: "long", timeZone: "UTC" });
}

function goalText(kind: GoalKind, n: number): string {
  return `${n.toLocaleString("en-AU")} ${n === 1 ? GOAL_LABEL[kind].one : GOAL_LABEL[kind].many}`;
}

export function TeamWeekPanel({ venueId, venueName, sessionToken }: Props) {
  const [week, setWeek] = useState<ManagerWeek | null>(null);
  const [guests, setGuests] = useState<GuestOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [kind, setKind] = useState<GoalKind>("correct_answers");
  const [target, setTarget] = useState("");
  const [guestId, setGuestId] = useState("");
  const [saving, setSaving] = useState<"goal" | "guest" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const apply = useCallback((data: { week: ManagerWeek; guests: GuestOption[] }) => {
    setWeek(data.week);
    setGuests(data.guests);
    const goal = data.week.goal;
    setKind(goal?.kind ?? "correct_answers");
    setTarget(String(goal?.target ?? data.week.suggested[goal?.kind ?? "correct_answers"]));
    setGuestId(data.week.guest?.id ?? "");
  }, []);

  useEffect(() => {
    if (!venueId || !sessionToken) return;
    let cancelled = false;
    fetch(`/api/management/team-week?venueId=${venueId}`, { headers: { Authorization: `Bearer ${sessionToken}` } })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.week) setLoadError(data?.error ?? "Could not load this week.");
        else apply(data);
      })
      .catch(() => !cancelled && setLoadError("Could not load this week. Check your connection."));
    return () => {
      cancelled = true;
    };
  }, [apply, sessionToken, venueId]);

  async function save(part: "goal" | "guest", body: Record<string, unknown>) {
    if (!sessionToken) return;
    setSaving(part);
    setSaveError(null);
    try {
      const res = await fetch("/api/management/team-week", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ venueId, ...body }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.week) setSaveError(data?.error ?? "Could not save. Try again.");
      else apply(data);
    } catch {
      setSaveError("Could not save. Check your connection.");
    } finally {
      setSaving(null);
    }
  }

  if (!venueId) {
    return (
      <div className="mc-page">
        <PageHead title="This Week" description="Choose a venue at the top to set its goal and guest of the week." />
      </div>
    );
  }

  const goal = week?.goal ?? null;
  const guest = week?.guest ?? null;
  const brief = week?.briefing ?? null;
  const targetNumber = Number(target);
  const targetOk = Number.isInteger(targetNumber) && targetNumber >= 1 && targetNumber <= 100000;
  const goalChanged = !goal || goal.kind !== kind || goal.target !== targetNumber;

  return (
    <div className="mc-page">
      <PageHead
        title="This Week"
        description={`A goal for the whole team at ${venueName ?? "your venue"}, one guest for everyone to practise, and a briefing card for your pre-shift meeting. Staff see team totals only, never who.`}
        actions={
          <button type="button" className="mc-btn" onClick={() => window.print()} disabled={!brief}>
            Print the briefing card
          </button>
        }
      />

      {loadError && <p className="mc-error" role="alert">{loadError}</p>}

      <StatRow
        items={[
          { label: week ? weekLabel(week.weekStart) : "This week", value: week ? `${week.teamSize}` : null, sub: "in the team" },
          {
            label: "Team goal",
            value: goal ? `${Math.min(100, Math.round((goal.progress / goal.target) * 100))}%` : week ? "Not set" : null,
            sub: goal ? `${goalText(goal.kind, goal.progress)} of ${goal.target.toLocaleString("en-AU")}` : undefined,
          },
          {
            label: "Guest of the week",
            value: guest ? `${guest.sorted} sorted` : week ? "Not set" : null,
            sub: guest ? `${guest.tried} of the team have talked to them` : undefined,
          },
        ]}
      />

      {saveError && <p className="mc-error" role="alert">{saveError}</p>}

      <Panel title="Team goal" description="One thing the whole team works towards this week, Monday to Sunday. Staff see the team's total on their Home screen.">
        <form
          className="mc-tw-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (targetOk) void save("goal", { goal: { kind, target: targetNumber } });
          }}
        >
          <label className="mc-field">
            What to count
            <select
              className="mc-input"
              value={kind}
              onChange={(e) => {
                const next = e.target.value as GoalKind;
                setKind(next);
                if (week) setTarget(String(week.suggested[next]));
              }}
            >
              {GOAL_KINDS.map((k) => (
                <option key={k} value={k}>
                  {GOAL_LABEL[k].many.replace(/^./, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
            <span className="mc-vc-hint">{GOAL_LABEL[kind].hint}</span>
          </label>
          <label className="mc-field">
            Target this week
            <input className="mc-input" type="number" min={1} max={100000} inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} />
            {week && <span className="mc-vc-hint">About {week.suggested[kind]} suits a team of {week.teamSize}.</span>}
          </label>
          <div className="mc-tw-actions">
            <button type="submit" className="mc-btn mc-btn-primary" disabled={!targetOk || saving !== null || !goalChanged}>
              {saving === "goal" ? "Saving…" : goal ? "Update the goal" : "Set the goal"}
            </button>
            {goal && (
              <button type="button" className="mc-btn" disabled={saving !== null} onClick={() => void save("goal", { goal: null })}>
                Clear
              </button>
            )}
          </div>
        </form>
        {goal && (
          <div className="mc-tw-progress" aria-label={`${goal.progress} of ${goal.target}`}>
            <span className="mc-tw-progress-fill" style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }} />
          </div>
        )}
      </Panel>

      <Panel title="Guest of the week" description="Pick one Live Guest guest for the whole team. They show first in everyone's Live Guest list this week.">
        <form
          className="mc-tw-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (guestId) void save("guest", { guestId });
          }}
        >
          <label className="mc-field">
            Guest
            <select className="mc-input" value={guestId} onChange={(e) => setGuestId(e.target.value)}>
              <option value="">Choose a guest</option>
              {(Object.keys(AREA_LABEL) as GuestOption["area"][]).map((area) => (
                <optgroup key={area} label={AREA_LABEL[area]}>
                  {guests
                    .filter((g) => g.area === area)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({LEVEL_LABEL[g.level]})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="mc-tw-actions">
            <button type="submit" className="mc-btn mc-btn-primary" disabled={!guestId || saving !== null || guestId === guest?.id}>
              {saving === "guest" ? "Saving…" : guest ? "Change the guest" : "Send to the team"}
            </button>
            {guest && (
              <button type="button" className="mc-btn" disabled={saving !== null} onClick={() => void save("guest", { guestId: null })}>
                Clear
              </button>
            )}
          </div>
        </form>
        {guest && <p className="mc-vc-explain">{guest.setting}</p>}
      </Panel>

      {brief && week && (
        <section className="mc-panel mc-briefing" aria-label="Briefing card">
          <div className="mc-panel-body">
            <p className="mc-vc-format">Briefing card · {week.venueName}</p>
            <h2 className="mc-briefing-title">
              The last seven days, {dayLabel(brief.from)} to {dayLabel(brief.to)}
            </h2>
            <ul className="mc-briefing-numbers">
              <li><strong>{brief.daysTrained}</strong> days trained across the team</li>
              <li>
                <strong>{brief.correct}</strong> of {brief.answered} answers right
                {brief.answered > 0 ? ` (${Math.round((brief.correct / brief.answered) * 100)}%)` : ""}
              </li>
              <li><strong>{brief.guestTalks}</strong> Live Guest conversations, <strong>{brief.guestPasses}</strong> passed</li>
              <li><strong>{brief.rushShifts}</strong> Saturday Rush shifts</li>
            </ul>
            {goal && (
              <p className="mc-briefing-line">
                <strong>This week&apos;s goal:</strong> {goalText(goal.kind, goal.target)} between us. We&apos;re on {goal.progress.toLocaleString("en-AU")}.
              </p>
            )}
            {guest && (
              <p className="mc-briefing-line">
                <strong>Guest of the week:</strong> {guest.title}. {guest.sorted} of us have sorted it so far.
              </p>
            )}

            <h3 className="mc-briefing-sub">What the team got wrong</h3>
            {brief.missed.length === 0 ? (
              <p className="mc-vc-explain">
                Nothing missed by two or more people this week. Either it&apos;s going well, or not many quizzes have been done yet.
              </p>
            ) : (
              <ol className="mc-briefing-misses">
                {brief.missed.map((m) => (
                  <li key={m.prompt}>
                    <p className="mc-vc-format">{m.moduleTitle} · missed by {m.people} people</p>
                    <p className="mc-vc-prompt">{m.prompt}</p>
                    <p className="mc-vc-explain"><strong>The answer:</strong> {m.answer}</p>
                    <p className="mc-briefing-say"><strong>Say:</strong> {m.line}</p>
                  </li>
                ))}
              </ol>
            )}
            <p className="mc-briefing-foot">Team totals only. A question shows here once two or more people have missed it, so no one is singled out.</p>
          </div>
        </section>
      )}
    </div>
  );
}
