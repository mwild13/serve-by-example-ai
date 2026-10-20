"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { GOAL_LABEL, type TeamWeek } from "@/lib/team-week-shared";

// This week at the venue (Rich update, Phase 16), on staff Home: the team
// goal the manager set and the guest of the week. Team totals only, never
// who. Shows nothing until the manager has set something. Styles: .tw rules
// in app/styles/staff.css, on the .qz theme colours.

type Props = {
  getToken: () => Promise<string>;
  theme: "light" | "dark";
  /** Mobile links to the Live Guest page; desktop switches tab. */
  liveGuestHref?: string;
  onLiveGuest?: () => void;
  /** Spacing around the card, only there when the card is. */
  outer?: CSSProperties;
};

export default function TeamWeekCard({
  getToken,
  theme,
  liveGuestHref,
  onLiveGuest,
  outer,
}: Props) {
  const [week, setWeek] = useState<TeamWeek | null>(null);

  useEffect(() => {
    let cancelled = false;
    getToken()
      .then((token) =>
        fetch("/api/training/team-week", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { week: TeamWeek | null } | null) => {
        if (!cancelled) setWeek(data?.week ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  if (!week || (!week.goal && !week.guest)) return null;
  const { goal, guest } = week;
  const pct = goal
    ? Math.min(100, Math.round((goal.progress / goal.target) * 100))
    : 0;
  const cta = "Talk to them";

  return (
    <div style={outer}>
      <section
        className={`qz--${theme} tw`}
        aria-label={`This week at ${week.venueName}`}
      >
        <p className="tw-label">This week at {week.venueName}</p>
        {goal && (
          <div className="tw-goal">
            <p className="tw-goal-text">
              <strong>{goal.progress.toLocaleString("en-AU")}</strong> of{" "}
              {goal.target.toLocaleString("en-AU")} {GOAL_LABEL[goal.kind].many}{" "}
              between us
              {goal.progress >= goal.target ? ". Goal reached!" : ""}
            </p>
            <span className="tw-bar" aria-hidden="true">
              <span className="tw-bar-fill" style={{ width: `${pct}%` }} />
            </span>
          </div>
        )}
        {guest && (
          <div className="tw-guest">
            <p className="tw-guest-text">
              <strong>Guest of the week:</strong> {guest.title}.{" "}
              {guest.sorted > 0
                ? `${guest.sorted} of the team ${guest.sorted === 1 ? "has" : "have"} sorted it.`
                : "Be the first to sort it."}
            </p>
            {liveGuestHref ? (
              <Link className="tw-link" href={liveGuestHref}>
                {cta}
              </Link>
            ) : onLiveGuest ? (
              <button type="button" className="tw-link" onClick={onLiveGuest}>
                {cta}
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
