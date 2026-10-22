import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { FlameIcon } from "./icons";

// The small parts every /mobile screen is built from
// (docs/zHistorical/STAFF_MOBILE_REDESIGN_PLAN.md section 2.3). Styles: the "STAFF
// MOBILE" block in app/styles/staff.css. No state here, so a server
// component can use them too.

type Icon = ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;

export function Section({
  title,
  link,
  note,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  /** Plain text on the right, such as "3 of 12 mastered". */
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="sm-section">
      <div className="sm-section-head">
        <h2 className="sm-section-title">{title}</h2>
        {note && <p className="sm-section-note">{note}</p>}
        {link && (
          <Link href={link.href} className="sm-section-link">
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** The one hero card on a screen, with two cards showing behind it. */
export function StackCard({ label, labelEnd, title, body, children }: { label: string; labelEnd?: string; title: string; body: ReactNode; children?: ReactNode }) {
  return (
    <div className="sm-stack">
      <section className="sm-hero" aria-label={title}>
        <div className="sm-hero-head">
          <p className="sm-hero-kicker">
            <span>{label}</span>
            {labelEnd && <span>{labelEnd}</span>}
          </p>
          <h2 className="sm-hero-title">{title}</h2>
          <p className="sm-hero-body">{body}</p>
        </div>
        {children}
      </section>
    </div>
  );
}

/**
 * A grouped list, as in iPhone Settings: a small-capitals title above the
 * card, rows inside it, and an optional line under it.
 */
export function Group({
  id,
  title,
  foot,
  footTone,
  children,
}: {
  id?: string;
  title?: string;
  foot?: string;
  footTone?: "good" | "alarm";
  children: ReactNode;
}) {
  return (
    <section id={id} className="sm-group" aria-label={title}>
      {title && <h2 className="sm-group-title">{title}</h2>}
      <div className="sm-card sm-rows">{children}</div>
      {foot && (
        <p className={`sm-group-foot${footTone ? ` sm-group-foot--${footTone}` : ""}`} role={footTone === "alarm" ? "alert" : undefined}>
          {foot}
        </p>
      )}
    </section>
  );
}

export function RowList({ children }: { children: ReactNode }) {
  return <div className="sm-card sm-rows">{children}</div>;
}

/** A tappable row: icon, bold label, an optional line under it, a count, a chevron. */
export function Row({ href, icon: RowIcon, iconCircle, label, sub, end }: { href: string; icon?: Icon; iconCircle?: boolean; label: string; sub?: string; end?: ReactNode }) {
  return (
    <Link href={href} className="sm-row">
      {RowIcon && (
        <span className={iconCircle ? "sm-icon-circle" : "sm-row-icon"}>
          <RowIcon size={iconCircle ? 20 : 22} strokeWidth={2.2} aria-hidden />
        </span>
      )}
      <span className="sm-row-text">
        <span className="sm-row-label">{label}</span>
        {sub && <span className="sm-row-sub">{sub}</span>}
      </span>
      {end}
      <ChevronRight className="sm-chevron" size={20} strokeWidth={2.6} aria-hidden="true" />
    </Link>
  );
}

export function Pill({ tone, children }: { tone?: "gold" | "accent"; children: ReactNode }) {
  return <span className={`sm-pill${tone ? ` sm-pill--${tone}` : ""}`}>{children}</span>;
}

export function ProgressBar({ value, max, label, gold }: { value: number; max: number; label: string; gold?: boolean }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`sm-bar${gold ? " sm-bar--gold" : ""}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ButtonLink({ href, variant, children }: { href: string; variant: "primary" | "hero" | "gold" | "secondary"; children: ReactNode }) {
  return (
    <Link href={href} className={`sm-btn sm-btn--block sm-btn--${variant}`}>
      {children}
    </Link>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** The photo, or initials when there's none, in its gold ring. Size it with a class. */
export function AvatarFace({ name, photoUrl, size, className }: { name: string; photoUrl: string | null; size: number; className?: string }) {
  return (
    <span className={`sm-avatar-face${className ? ` ${className}` : ""}`}>
      {photoUrl ? <Image src={photoUrl} alt="" width={size} height={size} unoptimized /> : initials(name)}
    </span>
  );
}

/** The person's photo or initials in a gold ring, with the shift streak on it. */
export function Avatar({ name, photoUrl, streak, small }: { name: string; photoUrl: string | null; streak?: number | null; small?: boolean }) {
  const label = streak != null ? `Your profile. Shift streak: ${streak}` : "Your profile";
  return (
    <Link href="/mobile/progress" className={`sm-avatar${small ? " sm-avatar--small" : ""}`} aria-label={label}>
      <AvatarFace name={name} photoUrl={photoUrl} size={small ? 32 : 46} />
      {streak != null && (
        <span className="sm-streak">
          {!small && <FlameIcon />}
          {streak}
        </span>
      )}
    </Link>
  );
}

export function Card({ active, children }: { active?: boolean; children: ReactNode }) {
  return <div className={`sm-card sm-card--pad${active ? " sm-card--active" : ""}`}>{children}</div>;
}

/** A ring with the figure in the middle, as on the "Keep going" card. */
export function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 19;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" role="img" aria-label={label} style={{ flexShrink: 0 }}>
      <circle className="sm-ring-track" cx="23" cy="23" r={r} fill="none" strokeWidth="5" />
      {/* Nothing at 0: a round cap on a zero-length line draws a dot. */}
      {filled > 0 && (
        <circle
          className="sm-ring-fill"
          cx="23"
          cy="23"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 23 23)"
        />
      )}
      <text className="sm-ring-text" x="23" y="27" textAnchor="middle">
        {Math.round(value)}
      </text>
    </svg>
  );
}

const WEEK = [1, 2, 3, 4, 5, 6, 0];
const LETTER = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAME = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Monday to Sunday: gold where a pre-shift drill was finished, a ring on
 * today, a filled dot on the other shift days, a small dot on days off.
 */
export function ShiftDots({ shiftDays, weekDone, weekday }: { shiftDays: number[]; weekDone: number[]; weekday: number }) {
  return (
    <ul className="sm-days" aria-label="Your shifts this week">
      {WEEK.map((day) => {
        const done = weekDone.includes(day);
        const shift = shiftDays.length === 0 || shiftDays.includes(day);
        const today = day === weekday;
        const state = done ? "done" : today ? "today" : shift ? "a shift day" : "a day off";
        const classes = ["sm-day", done && "sm-day--done", today && "sm-day--today", !done && (shift ? "sm-day--shift" : "sm-day--off")];
        return (
          <li key={day} className={classes.filter(Boolean).join(" ")}>
            <span aria-hidden="true">{LETTER[day]}</span>
            <span className="sm-day-dot" aria-hidden="true">
              {done && <Check size={13} strokeWidth={3.2} />}
            </span>
            <span className="sr-only">
              {DAY_NAME[day]}: {state}
              {today && done ? ", today" : ""}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** A square photo with the title on a fade at the bottom. */
export function PhotoCard({ href, src, title, sub, tag }: { href: string; src: string; title: string; sub?: string; tag?: string }) {
  return (
    <Link href={href} className="sm-photo">
      <Image src={src} alt="" width={204} height={204} sizes="204px" />
      {tag && <span className="sm-photo-tag">{tag}</span>}
      <span className="sm-photo-caption">
        <span className="sm-photo-title">{title}</span>
        {sub && <span className="sm-photo-sub">{sub}</span>}
      </span>
    </Link>
  );
}
