"use client";

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-line-short" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line-med" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton-line skeleton-line-cell" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton-line skeleton-line-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

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
