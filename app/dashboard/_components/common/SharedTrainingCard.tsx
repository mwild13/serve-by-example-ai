"use client";

// ── Shared Training Card ────────────────────────────────────────────────────
// Unified card shell for the Modules / Scenarios / Live Scenarios training
// surfaces. Styling lives in app/globals.css under "Shared Training Card"
// (`.shared-training-card` / `.stc-*`) — this file owns markup and the prop
// contract, globals.css owns the look, per project convention (no Tailwind,
// no invented hex values, tokens only).
//
// NOTE: none of the three existing pages (DynamicModuleNav.tsx, ArenaPage.tsx,
// trainer/ModuleSelectGrid.tsx) have been migrated onto this component yet.
// This is the target shell for that future migration — built from the same
// tokens those pages already use, not a retroactive restyle of them.
//
// `onClick`, `selected`, and `className` aren't in the original slot list —
// added because all three real cards this is meant to replace are clickable
// with a selected/active state, and a "shared shell" that can't express that
// isn't actually reusable yet. Everything else follows the requested prop
// names exactly.

export interface SharedTrainingCardProps {
  /** Category tag or "★ Recommended"-style badge, top-left of the header row. Omit when the card has nothing to say here (e.g. an unattempted Live Scenario). */
  topBadge?: React.ReactNode;
  /** Card title. The only prop that's always required. */
  title: string;
  /** Optional supporting copy below the title — module description, recommendation reason, etc. */
  description?: string;
  /** 0-100. Omit entirely (rather than passing 0) to hide the progress row for cards with nothing to show yet — mirrors how ArenaPage.tsx only renders a score bar once a scenario has been attempted. */
  progressValue?: number;
  /** Text next to the bar, e.g. "100% mastery" or "Best: 85/100". Only shown when `progressValue` is also provided. */
  progressLabel?: string;
  /** Right-aligned header slot — difficulty label, status chip, etc. */
  metaRight?: React.ReactNode;
  /** Footer content, typically a CTA link/button. Rendered as-is — compose a flex row inside it yourself if you need a status line alongside the CTA (see the three existing cards for that pattern). */
  footerAction?: React.ReactNode;
  /** Makes the whole card clickable (hover lift + pointer cursor + keyboard-activatable). Omit for a purely static card. */
  onClick?: () => void;
  /** Visual "selected/active" state — the same border+glow treatment DynamicModuleNav.tsx and trainer/ModuleSelectGrid.tsx already use for the currently-open module. */
  selected?: boolean;
  /** Escape hatch for page-specific accents (e.g. the arena-card passed/attempted background tint) without reaching for inline styles. */
  className?: string;
}

export default function SharedTrainingCard({
  topBadge,
  title,
  description,
  progressValue,
  progressLabel,
  metaRight,
  footerAction,
  onClick,
  selected = false,
  className,
}: SharedTrainingCardProps) {
  const hasProgress = typeof progressValue === "number";
  const clampedProgress = hasProgress ? Math.min(100, Math.max(0, progressValue as number)) : 0;
  const isInteractive = typeof onClick === "function";

  const classNames = [
    "shared-training-card",
    isInteractive ? "shared-training-card--interactive" : "",
    selected ? "shared-training-card--selected" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <div
      className={classNames}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      {(topBadge || metaRight) && (
        <div className="stc-header">
          <span>{topBadge}</span>
          {metaRight && <span className="stc-meta-right">{metaRight}</span>}
        </div>
      )}

      <h3 className="stc-title">{title}</h3>

      {description && <p className="stc-subtext">{description}</p>}

      {hasProgress && (
        <div className="stc-progress-row">
          <div className="stc-progress-track">
            {/* Percentage width is inherently per-instance data — every progress bar
                in this codebase (dash-card, arena-card, DynamicModuleNav's inline card)
                sets this one value inline for the same reason. Not a deviation from
                "avoid inline styles"; it's the one value that can't be a static class. */}
            <div className="stc-progress-fill" style={{ width: `${clampedProgress}%` }} />
          </div>
          {progressLabel && <span className="stc-progress-label">{progressLabel}</span>}
        </div>
      )}

      {footerAction && <div className="stc-footer">{footerAction}</div>}
    </div>
  );
}
