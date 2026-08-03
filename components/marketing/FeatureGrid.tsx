import type { ReactNode } from 'react';

/*
 * FeatureGrid — the single feature/benefit grid (Pages-Redesign.md §3.1).
 * Replaces `bento-grid`, `sol-feature-grid`, and `benefit-grid`, and retires
 * Unicode-glyph and per-page inline-SVG icons. Icons come from
 * components/icons/MarketingIcons.tsx (content icons) — pass the rendered
 * element into the `icon` slot, e.g. icon={<IconZap />}.
 * Server component.
 *
 * Card variants:
 *   'default' — light surface card
 *   'dark'    — deep green card (use for at most one emphasis card per grid)
 *   'stat'    — big-number stat card; put the number in `title`, unit in `eyebrow`
 */

export type FeatureGridItem = {
  title: string;
  /** Plain string for standard cards; ReactNode for structured content
   *  (e.g. a check-list) — keep it static markup, no interactivity. */
  body?: ReactNode;
  icon?: ReactNode;
  eyebrow?: string;
  variant?: 'default' | 'dark' | 'stat';
};

type Props = {
  items: FeatureGridItem[];
  /** Desktop column count. Collapses to 2 then 1 on smaller screens. */
  columns?: 2 | 3 | 4;
};

export default function FeatureGrid({ items, columns = 3 }: Props) {
  return (
    <div className={`sbe-mkt-featuregrid sbe-mkt-featuregrid-cols-${columns}`}>
      {items.map((item) => {
        const variant = item.variant ?? 'default';
        return (
          <div key={item.title} className={`sbe-mkt-featurecard sbe-mkt-featurecard-${variant}`}>
            {item.icon ? <div className="sbe-mkt-featurecard-icon">{item.icon}</div> : null}
            {item.eyebrow ? <p className="sbe-mkt-featurecard-eyebrow">{item.eyebrow}</p> : null}
            <h3 className="sbe-mkt-featurecard-title">{item.title}</h3>
            {/* div, not p — body may contain block-level markup like a check-list */}
            {item.body ? <div className="sbe-mkt-featurecard-body">{item.body}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
