"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "./manager-ui";
import { PageHead, Panel, StatRow } from "./console-ui";
import { MissionControlKpiSkeleton, MissionControlTableRowSkeleton } from "@/components/ui/Skeletons";
import type { OrgGroupSummary } from "@/lib/management/group-summary";

// Dedicated multi-venue rollup (Mission Control Batch 5). Deliberately
// fetches its own data from /api/management/group-summary rather than
// deriving KPIs from the snapshot already held in ManagerControlCenter's
// state — the whole point of the new endpoint is that org-wide totals are
// computed server-side from a small aggregate, not by reducing over
// snapshot.staff (every staff row across every venue) in the browser.
export function GroupAnalyticsPanel({
  sessionToken,
  onSelectVenue,
  onAddVenue,
}: {
  sessionToken: string | null;
  onSelectVenue: (venueId: string) => void;
  onAddVenue: () => void;
}) {
  const [summary, setSummary] = useState<OrgGroupSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const hasFetched = useRef(false);

  const apiFetch = useCallback((url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
    return fetch(url, { ...options, headers });
  }, [sessionToken]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await apiFetch("/api/management/group-summary");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as OrgGroupSummary;
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch group summary:", err);
      setError("We couldn't load your cross-venue rollup. Check your connection and try again.");
    } finally {
      setLoaded(true);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (!sessionToken || hasFetched.current) return;
    hasFetched.current = true;
    load();
  }, [sessionToken, load]);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    load().finally(() => setRetrying(false));
  }, [load]);

  const hasVenues = Boolean(summary && summary.totalVenues > 0);

  return (
    <div className="mc-page">
      <PageHead
        title="All venues"
        description={summary ? `Training and compliance across your ${summary.totalVenues} venues. Select a venue to open it.` : "Training and compliance across every venue."}
      />

      {error && (
        <div className="mc-error" role="alert" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span>{error}</span>
          <button type="button" className="mc-btn mc-btn-quiet mc-btn-sm" onClick={handleRetry} disabled={retrying}>
            {retrying ? "Retrying…" : "Retry"}
          </button>
        </div>
      )}

      {!loaded ? (
        <MissionControlKpiSkeleton count={4} />
      ) : !summary || !hasVenues ? (
        <Panel>
          <EmptyState
            copy="No venues yet."
            subCopy="This page fills in once your organisation has more than one venue."
            ctaLabel="+ Add venue"
            onCtaClick={onAddVenue}
          />
        </Panel>
      ) : (
        <StatRow
          items={[
            { label: "Staff", value: String(summary.totalHeadcount), sub: `Across ${summary.totalVenues} venues` },
            { label: "Training completed", value: `${summary.avgCompletion}%`, sub: "Average across all venues" },
            { label: "Average mastery", value: `${summary.avgMastery}%`, sub: "Service, sales and product" },
            { label: "Shift readiness", value: `${summary.shiftReadyPct}%`, sub: `${summary.shiftReadyCount} of ${summary.totalHeadcount} staff cleared to work` },
          ]}
        />
      )}

      {(!loaded || hasVenues) && (
        <>
          <Panel title="By venue" flush>
            {!loaded || !summary ? (
              <div className="mc-panel-body"><MissionControlTableRowSkeleton rows={4} columns={6} /></div>
            ) : (
              <div className="mc-table-wrap">
                <table className="mc-table">
                  <thead>
                    <tr>
                      <th>Venue</th>
                      <th className="is-num">Staff</th>
                      <th className="is-num">Training completed</th>
                      <th className="is-num">Scenario score</th>
                      <th className="is-num">Sales score</th>
                      <th className="is-num">Cleared to work</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.venues.map((venue) => (
                      <tr key={venue.venueId}>
                        <td className="is-main">
                          <button type="button" className="mc-link" onClick={() => onSelectVenue(venue.venueId)}>{venue.venueName}</button>
                        </td>
                        <td className="is-num">{venue.headcount}</td>
                        <td className="is-num">{venue.headcount ? `${venue.avgCompletion}%` : "–"}</td>
                        <td className="is-num">{venue.headcount ? `${venue.avgScenarioScore}%` : "–"}</td>
                        <td className="is-num">{venue.headcount ? `${venue.avgSalesScore}%` : "–"}</td>
                        <td className="is-num">{venue.headcount ? `${venue.shiftReadyCount} of ${venue.headcount}` : "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Certificates by venue" description="RSA and food safety supervisor certificates that are expired or close to it." flush>
            {!loaded || !summary ? (
              <div className="mc-panel-body"><MissionControlTableRowSkeleton rows={4} columns={5} /></div>
            ) : (
              <div className="mc-table-wrap">
                <table className="mc-table">
                  <thead>
                    <tr>
                      <th>Venue</th>
                      <th className="is-num">RSA expiring soon</th>
                      <th className="is-num">RSA expired</th>
                      <th className="is-num">FSS grace period ending</th>
                      <th className="is-num">FSS expired</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.complianceRisk.map((row) => (
                      <tr key={row.venueId}>
                        <td className="is-main">{row.venueName}</td>
                        <RiskCell count={row.rsaPending} />
                        <RiskCell count={row.rsaExpired} expired />
                        <RiskCell count={row.fssPending} />
                        <RiskCell count={row.fssExpired} expired />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

// A zero is a dash. An expired count is the one place this page uses red.
function RiskCell({ count, expired = false }: { count: number; expired?: boolean }) {
  if (count === 0) return <td className="is-num is-soft">–</td>;
  return (
    <td className="is-num is-main" style={expired ? { color: "var(--status-error-text)" } : undefined}>
      {count}
    </td>
  );
}
