"use client";

import { useState, type ComponentType } from "react";
import { ArrowLeft, ArrowRight, Banknote, Gauge, ShieldCheck, Timer, Users } from "lucide-react";
import SaturdayRush from "@/components/rush/SaturdayRush";
import { RUSH_BREACH_MAX, RUSH_LENGTH, RUSH_SECONDS } from "@/lib/rush/engine";
import { useStaffData } from "@/lib/staff-cache";
import { STAFF_KEYS, loadRushStats } from "@/lib/staff-data";

// Saturday Rush on the staff desktop (docs/STAFF_APP.md section 8): the
// shift on the green card with your best beside it, then how the four dials
// score you. Starting plays the game (components/rush/SaturdayRush.tsx,
// shared with mobile) without its own intro card.

type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>;

const DIALS: { name: string; icon: Icon; text: string }[] = [
  { name: "Guests", icon: Users, text: "How the people at your bar feel. Waits, mix-ups and how you speak to them move it." },
  { name: "Speed", icon: Gauge, text: "How fast the queue moves. Freezing on a call costs the most." },
  { name: "Money", icon: Banknote, text: "What you take against what you waste. A better sale adds to it; remakes and wasted pours take away." },
  { name: "Safety", icon: ShieldCheck, text: "Responsible service and broken glass. Some calls here break a rule you can't break." },
];

export default function RushPage({ getToken }: { getToken: () => Promise<string> }) {
  const [playing, setPlaying] = useState(false);
  const { data: stats } = useStaffData(STAFF_KEYS.rush, loadRushStats, getToken);

  if (playing) {
    return (
      <div className="sd-page sd-reading sd-rush">
        <button type="button" className="sd-back" onClick={() => setPlaying(false)}>
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          Saturday Rush
        </button>
        <SaturdayRush theme="room" getToken={getToken} autoStart />
      </div>
    );
  }

  const played = !!stats && stats.shifts > 0;
  return (
    <div className="sd-page">
      <header className="sd-pagehead">
        <div>
          <h1 className="sd-title">Saturday Rush</h1>
          <p className="sd-subtitle">A busy Saturday night against the clock. Every call moves the guests, the speed, the money and the safety.</p>
        </div>
      </header>

      <div className="sd-grid">
        <section className="sd-panel sd-step sd-col-8" aria-labelledby="sd-rush-title">
          <p className="sd-label">Your shift</p>
          <h2 id="sd-rush-title" className="sd-step-title">Saturday night, 9:30pm</h2>
          <p className="sd-step-body">
            Two hours behind a packed bar in {RUSH_LENGTH} moments. The queue grows, the ice and glasses run down, and the
            bar-back can only be in one place at a time.
          </p>
          <p className="sd-hero-meta">
            <span className="sd-hero-meta-item">
              <Timer size={14} strokeWidth={2} aria-hidden />
              {RUSH_SECONDS} seconds a call
            </span>
            <span>Under four minutes</span>
            <span>Keys 1 to 4 choose, B calls the bar-back</span>
          </p>
          <div className="sd-actions">
            <button type="button" className="sd-btn sd-btn-primary" onClick={() => setPlaying(true)}>
              Start the shift
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </section>

        <section className="sd-panel sd-col-4 sd-side-figure" aria-label="Your best">
          <div className="sd-panel-head">
            <p className="sd-label">Your best</p>
          </div>
          {played ? (
            <>
              <p className="sd-figure">
                {stats.best ?? 0}
                <span className="sd-figure-of">of 100</span>
                <span className="sd-figure-unit">
                  from {stats.shifts} {stats.shifts === 1 ? "shift" : "shifts"}
                </span>
              </p>
              <span className="sd-bar" aria-hidden>
                <span style={{ width: `${stats.best ?? 0}%` }} />
              </span>
              <p className="sd-note">Every shift is different, so it&apos;s worth another go.</p>
            </>
          ) : (
            <p className="sd-note">No shifts yet. Your first one sets the score to beat.</p>
          )}
        </section>
      </div>

      <section className="sd-section" aria-labelledby="sd-rush-scored">
        <div className="sd-section-head">
          <h2 id="sd-rush-scored" className="sd-h2">How you&apos;re scored</h2>
          <p className="sd-note">
            Your score out of 100 is the four dials, plus how many of the best calls you made. Break a rule you can&apos;t
            break and it can&apos;t go above {RUSH_BREACH_MAX}.
          </p>
        </div>
        <ul className="sd-dials">
          {DIALS.map((d) => (
            <li key={d.name} className="sd-panel sd-dial">
              <d.icon size={18} strokeWidth={2} className="sd-dial-icon" aria-hidden />
              <p className="sd-dial-name">{d.name}</p>
              <p className="sd-note">{d.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
