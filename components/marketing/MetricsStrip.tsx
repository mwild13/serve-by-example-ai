/*
 * MetricsStrip — the single horizontal stat-row band (Pages-Redesign.md §3.1).
 * Replaces per-page `metrics-strip` markup on /solutions/* and anywhere else
 * a stat band is needed. Reuses the existing .metrics-strip* CSS.
 * Server component.
 *
 * Honesty rule (§5.3 / reconciliation report): values must be real platform
 * facts or capacities — never fabricated customer outcomes.
 */

export type Metric = {
  value: string;
  label: string;
};

type Props = {
  metrics: Metric[];
  /** Small footnote line under the row (e.g. methodology disclaimer). */
  disclaimer?: string;
};

export default function MetricsStrip({ metrics, disclaimer }: Props) {
  return (
    <section className="section trust-section trust-section-green metrics-strip">
      <div className="container">
        <div className="metrics-strip-row">
          {metrics.map((m) => (
            <div key={m.label} className="metrics-strip-item">
              <div className="metrics-strip-value">{m.value}</div>
              <div className="metrics-strip-label">{m.label}</div>
            </div>
          ))}
        </div>
        {disclaimer ? <p className="metrics-strip-disclaimer">{disclaimer}</p> : null}
      </div>
    </section>
  );
}
