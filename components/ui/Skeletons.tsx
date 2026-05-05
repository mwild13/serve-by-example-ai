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
