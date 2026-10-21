"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import Screen from "./ui/Screen";
import { Card, ProgressBar, Section } from "./ui/parts";
import { useTrainingProgress } from "../_lib/use-training-progress";
import { badgeProgressText, badgesFromProgress, readVisitStreak, type Badge } from "@/lib/badges";

// Every badge, from Me (docs/STAFF_MOBILE_REDESIGN_PLAN.md, phase 6). Badges
// are worked out on the device from /api/training/progress
// (lib/badges.ts badgesFromProgress, shared with the staff desktop), never
// stored as unlocked rows. The streak badges count days visited in a row on
// this device, which is a different count from the shift streak.

const GROUPS: { id: Badge["category"]; label: string }[] = [
  { id: "technical", label: "Behind the bar" },
  { id: "service", label: "Service and sales" },
  { id: "compliance", label: "Safety and compliance" },
  { id: "streak", label: "Days in a row" },
  { id: "special", label: "Special" },
];

export default function BadgesGalleryScreen() {
  const { status, data, error, refetch } = useTrainingProgress();
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    // Browser-only read on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisits(readVisitStreak());
  }, []);

  const badges = useMemo(() => (data ? badgesFromProgress(data, visits) : []), [data, visits]);
  const earned = badges.filter((b) => b.earned).length;
  const back = { href: "/mobile/progress", label: "Me" };

  if (status === "error" || (status !== "loading" && !data)) {
    return (
      <Screen title="Badges" back={back}>
        <div className="sm-me">
          <Card>
            <p className="sm-card-title">Badges not loading</p>
            <p className="sm-card-sub">{error ?? "Check your connection, then try again."}</p>
            <button type="button" className="sm-btn sm-btn--secondary sm-btn--block sm-me-retry" onClick={refetch}>
              Try again
            </button>
          </Card>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Badges" back={back}>
      <div className="sm-me">
        {!data ? (
          <div className="sm-skel" style={{ height: 92 }} aria-label="Loading" />
        ) : (
          <Card>
            <p className="sm-me-stat-figure">
              {earned}
              <span className="sm-figure-of"> of {badges.length} earned</span>
            </p>
            <ProgressBar value={earned} max={badges.length} label={`${earned} of ${badges.length} badges earned`} gold />
          </Card>
        )}
      </div>

      {data &&
        GROUPS.map((group) => {
          const list = badges.filter((b) => b.category === group.id);
          if (list.length === 0) return null;
          return (
            <Section key={group.id} title={group.label} note={`${list.filter((b) => b.earned).length} of ${list.length}`}>
              <div className="sm-card sm-rows">
                {list.map((b) => (
                  <BadgeRow key={b.id} badge={b} />
                ))}
              </div>
            </Section>
          );
        })}
    </Screen>
  );
}

function BadgeRow({ badge: b }: { badge: Badge }) {
  return (
    <div className={`sm-row sm-badge${b.earned ? " is-earned" : ""}`}>
      {b.earned ? (
        <span className="sm-badge-mark" aria-hidden="true">
          <Check size={20} strokeWidth={3} />
        </span>
      ) : (
        <span className="sm-module-mark sm-module-mark--todo" aria-hidden="true" />
      )}
      <span className="sm-row-text">
        <span className="sm-row-label">
          {b.label}
          <span className="sr-only">{b.earned ? ", earned" : ", not earned yet"}</span>
        </span>
        <span className="sm-row-sub">{b.description}</span>
        {!b.earned && b.progress && b.progress.current > 0 && <span className="sm-badge-progress">{badgeProgressText(b.progress)}</span>}
      </span>
    </div>
  );
}
