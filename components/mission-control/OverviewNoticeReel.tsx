"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { ManagerSection } from "@/lib/management/types";
import type { OverviewNotice } from "@/lib/management/notices";

// The notice bar at the top of the Overview tab. Replaces the stacked
// compliance banners with one line that steps through what a manager should
// know today (lib/management/notices.ts builds the sentences, most urgent
// first). It carries no status colour: the RSA tile below shows the count.
//
// Rotation stops while the bar is hovered, focused or paused, and never
// starts for visitors who ask for reduced motion, so nobody has to chase a
// sentence. Previous, next and pause are always available.

const ROTATE_MS = 7000;

export function OverviewNoticeReel({ notices, onNav }: { notices: OverviewNotice[]; onNav: (section: ManagerSection) => void }) {
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);

  const count = notices.length;
  const index = count > 0 ? position % count : 0;
  const rotating = count > 1 && !paused && !held;

  useEffect(() => {
    if (!rotating) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setPosition((p) => p + 1), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [rotating]);

  if (count === 0) return null;
  const notice = notices[index];
  const step = (by: number) => setPosition((index + by + count) % count);

  return (
    <section
      className="mc-reel"
      aria-label="Team notices"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div key={notice.id} className="mc-reel-item" aria-live={rotating ? "off" : "polite"}>
        <span className="mc-reel-label">{notice.label}</span>
        <p className="mc-reel-text">{notice.text}</p>
        <button type="button" className="mc-reel-link" onClick={() => onNav(notice.section)}>
          Review
        </button>
      </div>

      {count > 1 && (
        <div className="mc-reel-controls">
          <span className="mc-reel-count">{index + 1} of {count}</span>
          <button type="button" className="mc-reel-btn" onClick={() => step(-1)} aria-label="Previous notice">
            <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button type="button" className="mc-reel-btn" onClick={() => step(1)} aria-label="Next notice">
            <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="mc-reel-btn"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume notices" : "Pause notices"}
            aria-pressed={paused}
          >
            {paused ? <Play size={16} strokeWidth={1.75} aria-hidden="true" /> : <Pause size={16} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  );
}
