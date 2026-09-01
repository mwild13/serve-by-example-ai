"use client";

export function CocktailGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="cocktail-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card cocktail-skeleton-card">
          <div className="skeleton-line skeleton-line-short" />
          <div className="skeleton-line skeleton-line-badge" />
          <div className="skeleton-line skeleton-line-med" />
        </div>
      ))}
    </div>
  );
}

// Mission Control's secondary background fetches (memberships, custom
// certs, etc.) used to leave stateful lists at their initial `[]` while
// loading, which rendered as a false "nothing here yet" EmptyState for a
// moment before the real data arrived — a flash of stale/incorrect content.
// These two variants reuse the same .skeleton-* primitives as
// CocktailGridSkeleton above, just laid out as a table or a KPI-card row
// instead of a card grid, so callers don't hand-roll a one-off shimmer block.
export function MissionControlTableRowSkeleton({
  rows = 4,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="skeleton-table" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="skeleton-line skeleton-line-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function MissionControlKpiSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-grid" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-line-short" />
          <div className="skeleton-line skeleton-line-med" />
        </div>
      ))}
    </div>
  );
}
