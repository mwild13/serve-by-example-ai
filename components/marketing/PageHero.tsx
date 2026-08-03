import Link from 'next/link';
import type { ReactNode } from 'react';

/*
 * PageHero — the single sub-page hero (Pages-Redesign.md §3.1, §6.2).
 * Replaces every hand-coded `.inner-hero` / `.sol-hero` block.
 * Server component: no state, no handlers.
 *
 * Variants:
 *   'default'  — light (--bg-alt), standard sub-page
 *   'solution' — light (--bg), gold eyebrow accent for /solutions/*
 *   'dark'     — navy anchor (--bg-dark), reserved for /for-venues and /pricing only
 */

export type PageHeroAction = {
  label: string;
  href: string;
  /** Exactly one 'primary' per hero. Everything else renders as a text link. */
  variant?: 'primary' | 'secondary';
};

export type PageHeroCrumb = {
  label: string;
  href?: string;
};

type Props = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  breadcrumb?: PageHeroCrumb[];
  actions?: PageHeroAction[];
  variant?: 'default' | 'solution' | 'dark';
  /** Compact mode: reduced padding, no min-height. Use where content below
   *  the hero must stay near the fold (e.g. /pricing). */
  compact?: boolean;
  /** Optional right-column slot (product still, stat, illustration).
   *  When omitted the copy column takes the full width. */
  media?: ReactNode;
};

export default function PageHero({
  title,
  eyebrow,
  subtitle,
  breadcrumb,
  actions,
  variant = 'default',
  compact = false,
  media,
}: Props) {
  return (
    <section
      className={`sbe-mkt-pagehero sbe-mkt-pagehero-${variant}${compact ? ' sbe-mkt-pagehero-compact' : ''}`}
    >
      <div className={`container sbe-mkt-pagehero-grid${media ? ' has-media' : ''}`}>
        <div className="sbe-mkt-pagehero-copy">
          {breadcrumb && breadcrumb.length > 0 ? (
            <nav aria-label="Breadcrumb" className="sbe-mkt-pagehero-crumbs">
              <ol>
                {breadcrumb.map((crumb, i) => (
                  <li key={crumb.label}>
                    {crumb.href ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <span aria-current={i === breadcrumb.length - 1 ? 'page' : undefined}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          {eyebrow ? <p className="sbe-mkt-pagehero-eyebrow">{eyebrow}</p> : null}

          <h1 className="sbe-mkt-pagehero-title">{title}</h1>

          {subtitle ? <p className="sbe-mkt-pagehero-subtitle">{subtitle}</p> : null}

          {actions && actions.length > 0 ? (
            <div className="sbe-mkt-pagehero-actions">
              {actions.map((action) =>
                action.variant === 'primary' ? (
                  <Link key={action.label} href={action.href} className="sbe-mkt-btn-primary">
                    {action.label}
                  </Link>
                ) : (
                  <Link key={action.label} href={action.href} className="sbe-mkt-btn-text">
                    {action.label}
                  </Link>
                ),
              )}
            </div>
          ) : null}
        </div>

        {media ? <div className="sbe-mkt-pagehero-media">{media}</div> : null}
      </div>
    </section>
  );
}
