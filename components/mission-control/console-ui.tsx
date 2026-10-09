import type { ReactNode } from "react";
import { Download } from "lucide-react";

// Shared parts for every console tab other than Overview. Styles are the
// "MANAGER CONSOLE — PAGES" block in app/globals.css; the rules behind them
// are in docs/MANAGER_CONSOLE.md section 6.

/** Title, one-sentence description and the tab's actions. One per tab. */
export function PageHead({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mc-page-head">
      <div>
        <h1 className="mc-page-title">{title}</h1>
        {description && <p className="mc-page-desc">{description}</p>}
      </div>
      {actions && <div className="mc-page-actions">{actions}</div>}
    </header>
  );
}

export interface Stat {
  label: string;
  /** Pass null when there is nothing to show yet; the cell reads "No data". */
  value: string | null;
  sub?: string;
  /** Red figure. Reserved for a count that is a legal problem. */
  alert?: boolean;
}

/** A ruled strip of figures. Wraps to as many rows as the width needs. */
export function StatRow({ items }: { items: Stat[] }) {
  return (
    <dl className="mc-stats">
      {items.map((item) => (
        <div key={item.label} className="mc-stat">
          <dt className="mc-stat-label">{item.label}</dt>
          <dd className={`mc-figure${item.alert ? " is-alert" : ""}${item.value === null ? " is-empty" : ""}`} style={{ margin: 0 }}>
            {item.value ?? "No data"}
          </dd>
          {item.sub && <dd className="mc-stat-sub" style={{ margin: 0 }}>{item.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** A titled panel. `flush` lets a table or list run to the panel's edges. */
export function Panel({
  title,
  description,
  aside,
  flush = false,
  children,
}: {
  title?: string;
  description?: string;
  aside?: ReactNode;
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="mc-panel">
      {title && (
        <div className="mc-panel-head">
          <div>
            <h2 className="mc-panel-title" style={description ? undefined : { margin: 0 }}>{title}</h2>
            {description && <p className="mc-panel-desc">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      <div className={flush ? "mc-panel-flush" : "mc-panel-body"}>{children}</div>
    </section>
  );
}

export type StatusTone = "ok" | "warn" | "alert" | "neutral";

/** Status as text beside a dot. Never a filled pill. */
export function StatusText({ tone = "neutral", children, title }: { tone?: StatusTone; children: ReactNode; title?: string }) {
  return (
    <span className={`mc-status${tone === "neutral" ? "" : ` is-${tone}`}`} title={title}>
      {children}
    </span>
  );
}

/** A horizontal bar for a 0 to 100 value, with the figure beside it. */
export function BarCell({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span className="mc-cell-bar">
      <span className="mc-progress-track" aria-hidden="true">
        <span className="mc-progress-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="mc-cell-bar-value">{label ?? `${pct}%`}</span>
    </span>
  );
}

export function ExportButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="mc-btn mc-btn-quiet" onClick={onClick}>
      <Download size={16} strokeWidth={1.75} aria-hidden="true" />
      {label}
    </button>
  );
}

/** Builds a CSV from rows of text and hands it to the browser to save. */
export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function percent(value: number | null | undefined, emptyWhenZero = true): string {
  if (value == null || (emptyWhenZero && value <= 0)) return "–";
  return `${Math.round(value)}%`;
}
