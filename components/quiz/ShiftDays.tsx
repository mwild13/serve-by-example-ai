"use client";

import { useState } from "react";
import { WEEKDAY_SHORT, shiftDaysText, type ShiftStreak } from "@/lib/shift-streak";
import { saveShiftDays } from "@/lib/verify-quiz-client";

// The shift streak line and the "which days do you work?" picker (Rich
// update, Phase 12). Shown at the end of the pre-shift drill. Styles: the
// .dr-streak and .dr-days rules in app/styles/staff.css.

// Monday first, as a roster reads.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function streakLine(streak: ShiftStreak): string {
  const shifts = streak.count === 1 ? "1 shift" : `${streak.count} shifts`;
  const freezes = streak.freezesLeft === 1 ? "1 freeze left" : `${streak.freezesLeft} freezes left`;
  return `${shifts} in a row, ${freezes}`;
}

export default function ShiftDays({ streak, getToken, onSaved }: { streak: ShiftStreak; getToken: () => Promise<string>; onSaved: (next: ShiftStreak) => void }) {
  const [editing, setEditing] = useState(streak.shiftDays.length === 0);
  const [days, setDays] = useState<number[]>(streak.shiftDays);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(day: number) {
    setDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      onSaved(await saveShiftDays(await getToken(), days));
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your days.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <p className="dr-text dr-text--muted">
        Your shifts: {shiftDaysText(streak.shiftDays)}.{" "}
        <button type="button" className="dr-link dr-link--inline" onClick={() => setEditing(true)}>
          Change
        </button>
      </p>
    );
  }

  return (
    <fieldset className="dr-days">
      <legend className="dr-text">Which days do you usually work? Days off never break your streak.</legend>
      <div className="dr-days-row">
        {ORDER.map((day) => (
          <button
            key={day}
            type="button"
            className={days.includes(day) ? "dr-day dr-day--on" : "dr-day"}
            aria-pressed={days.includes(day)}
            onClick={() => toggle(day)}
          >
            {WEEKDAY_SHORT[day]}
          </button>
        ))}
      </div>
      {error && <p className="dr-text" role="alert">{error}</p>}
      <div className="dr-actions">
        <button type="button" className="qz-check" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : days.length === 0 ? "Every day" : "Save my days"}
        </button>
      </div>
    </fieldset>
  );
}
