"use client";

import { useState } from "react";
import { WEEKDAY_SHORT, reminderTimeText, shiftDaysText, type ShiftStreak } from "@/lib/shift-streak";
import { saveShiftDays } from "@/lib/verify-quiz-client";
import { pushSupport, turnOffPush, turnOnPush } from "@/lib/push-client";

// The shift streak line, the "which days do you work?" picker and "When
// should we remind you?" (Rich update, Phase 12). Shown at the end of the
// pre-shift drill. Styles: the .dr-streak, .dr-days and .dr-remind rules in
// app/styles/staff.css.

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

// Every half hour from 5am to 11:30pm.
const TIMES = Array.from({ length: 38 }, (_, i) => {
  const minutes = 5 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/** "When should we remind you?": a push on shift days, at the chosen time. */
export function ShiftReminder({ streak, getToken, onSaved }: { streak: ShiftStreak; getToken: () => Promise<string>; onSaved: (next: ShiftStreak) => void }) {
  const [time, setTime] = useState(streak.reminderTime ?? "");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // Read in the browser only; the server render has no navigator.
  const [support] = useState(() => (typeof window === "undefined" ? "unsupported" : pushSupport()));

  async function choose(next: string) {
    setTime(next);
    setSaving(true);
    setNote(null);
    try {
      const token = await getToken();
      // Save the time first, so it's kept even if this phone can't take notifications yet.
      onSaved(await saveShiftDays(token, undefined, next || null));
      if (next) {
        await turnOnPush(token);
        setNote(`We'll remind you at ${reminderTimeText(next)} on ${shiftDaysText(streak.shiftDays)}.`);
      } else {
        await turnOffPush(token);
        setNote("Reminders are off.");
      }
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save your reminder.");
    } finally {
      setSaving(false);
    }
  }

  if (support === "unsupported") return null;
  if (support === "install") {
    return (
      <p className="dr-text dr-text--muted">
        Want a reminder before each shift? On iPhone, add Serve By Example to your Home Screen first (tap Share, then Add to
        Home Screen) and open it from there.
      </p>
    );
  }

  return (
    <div className="dr-remind">
      <label className="dr-text" htmlFor="dr-remind-time">
        When should we remind you?
      </label>
      <select id="dr-remind-time" className="dr-select" value={time} disabled={saving} onChange={(e) => void choose(e.target.value)}>
        <option value="">No reminder</option>
        {TIMES.map((t) => (
          <option key={t} value={t}>
            {reminderTimeText(t)} on shift days
          </option>
        ))}
      </select>
      {note && <p className="dr-text dr-text--muted" role="status">{note}</p>}
    </div>
  );
}

