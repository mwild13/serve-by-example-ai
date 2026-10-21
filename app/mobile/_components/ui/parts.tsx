import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FlameIcon } from "./icons";

// The small parts every /mobile screen is built from
// (docs/STAFF_MOBILE_REDESIGN_PLAN.md section 2.3). Styles: the "STAFF
// MOBILE" block in app/styles/staff.css. No state here, so a server
// component can use them too.

type Icon = ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;

export function Section({ title, link, children }: { title: string; link?: { href: string; label: string }; children: ReactNode }) {
  return (
    <section className="sm-section">
      <div className="sm-section-head">
        <h2 className="sm-section-title">{title}</h2>
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

export function RowList({ children }: { children: ReactNode }) {
  return <div className="sm-card sm-rows">{children}</div>;
}

/** A tappable row: icon, bold label, an optional line under it, a count, a chevron. */
export function Row({ href, icon: RowIcon, label, sub, end }: { href: string; icon?: Icon; label: string; sub?: string; end?: ReactNode }) {
  return (
    <Link href={href} className="sm-row">
      {RowIcon && (
        <span className="sm-row-icon">
          <RowIcon size={22} strokeWidth={2.2} aria-hidden />
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

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="sm-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
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

/** The person's photo or initials in a gold ring, with the shift streak on it. */
export function Avatar({ name, photoUrl, streak, small }: { name: string; photoUrl: string | null; streak?: number | null; small?: boolean }) {
  const size = small ? 32 : 46;
  const label = streak != null ? `Your profile. Shift streak: ${streak}` : "Your profile";
  return (
    <Link href="/mobile/progress" className={`sm-avatar${small ? " sm-avatar--small" : ""}`} aria-label={label}>
      <span className="sm-avatar-face">
        {photoUrl ? <Image src={photoUrl} alt="" width={size} height={size} unoptimized /> : initials(name)}
      </span>
      {streak != null && (
        <span className="sm-streak">
          {!small && <FlameIcon />}
          {streak}
        </span>
      )}
    </Link>
  );
}
