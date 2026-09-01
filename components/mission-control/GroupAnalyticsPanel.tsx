"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WorkspaceHeader } from "@/app/management/dashboard/_components/WorkspaceHeader";
import { EmptyState, OpsKpiCard } from "./manager-ui";
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

  return (
    <section className="ops-grid ops-grid-main">
      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <WorkspaceHeader
          title="Group Analytics"
          description="Cross-venue rollup, computed org-wide"
          meta={summary ? `${summary.totalVenues} venues` : undefined}
        />

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              background: "var(--status-error-bg)",
              border: "1.5px solid var(--status-error)",
              borderRadius: "var(--radius-md)",
              marginBottom: 16,
              fontSize: "0.85rem",
              color: "var(--status-error-text)",
              fontWeight: 600,
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              className="sbe-button-outline sbe-button-outline--sm"
              onClick={handleRetry}
              disabled={retrying}
              style={{ flexShrink: 0 }}
            >
              {retrying ? "Retrying…" : "Retry"}
            </button>
          </div>
        )}

        {!loaded ? (
          <MissionControlKpiSkeleton count={4} />
        ) : !summary || summary.totalVenues === 0 ? (
          <EmptyState
            copy="No venues yet."
            subCopy="Group Analytics populates once your organisation has more than one venue."
            ctaLabel="+ Add venue"
            onCtaClick={onAddVenue}
          />
        ) : (
          <div className="ops-kpi-grid">
            <OpsKpiCard label="Total org headcount" value={String(summary.totalHeadcount)} note={`Across ${summary.totalVenues} venues`} />
            <OpsKpiCard label="Cross-venue avg completion" value={`${summary.avgCompletion}%`} />
            <OpsKpiCard label="Average mastery" value={`${summary.avgMastery}%`} note="Service, sales & product average" />
            <OpsKpiCard
              label="Overall shift-readiness"
              value={`${summary.shiftReadyPct}%`}
              note={`${summary.shiftReadyCount} / ${summary.totalHeadcount} staff shift-ready`}
            />
          </div>
        )}
      </article>

      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ops-card-head">
          <h3>Per-venue breakdown</h3>
          <span>All venues</span>
        </div>
        {!loaded ? (
          <MissionControlTableRowSkeleton rows={4} columns={6} />
        ) : !summary || summary.venues.length === 0 ? (
          <EmptyState copy="No venues yet." ctaLabel="+ Add venue" onCtaClick={onAddVenue} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th style={{ textAlign: "center" }}>Staff</th>
                  <th style={{ textAlign: "center" }}>Avg completion</th>
                  <th style={{ textAlign: "center" }}>Avg scenario score</th>
                  <th style={{ textAlign: "center" }}>Avg sales score</th>
                  <th style={{ textAlign: "center" }}>Shift-ready</th>
                </tr>
              </thead>
              <tbody>
                {summary.venues.map((venue) => (
                  <tr key={venue.venueId}>
                    <td>
                      <button
                        type="button"
                        onClick={() => onSelectVenue(venue.venueId)}
                        style={{ background: "none", border: "none", padding: 0, color: "var(--green-deep)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                      >
                        {venue.venueName}
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>{venue.headcount}</td>
                    <td style={{ textAlign: "center" }}>{venue.headcount ? `${venue.avgCompletion}%` : "–"}</td>
                    <td style={{ textAlign: "center" }}>{venue.headcount ? `${venue.avgScenarioScore}%` : "–"}</td>
                    <td style={{ textAlign: "center" }}>{venue.headcount ? `${venue.avgSalesScore}%` : "–"}</td>
                    <td style={{ textAlign: "center" }}>
                      {venue.headcount ? `${venue.shiftReadyCount}/${venue.headcount} (${venue.shiftReadyPct}%)` : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="ops-card" style={{ gridColumn: "1 / -1" }}>
        <div className="ops-card-head">
          <h3>Cross-venue compliance risk matrix</h3>
          <span>RSA &amp; FSS expirations</span>
        </div>
        {!loaded ? (
          <MissionControlTableRowSkeleton rows={4} columns={5} />
        ) : !summary || summary.complianceRisk.length === 0 ? (
          <EmptyState copy="No venues yet." ctaLabel="+ Add venue" onCtaClick={onAddVenue} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th style={{ textAlign: "center" }}>RSA expiring soon</th>
                  <th style={{ textAlign: "center" }}>RSA expired</th>
                  <th style={{ textAlign: "center" }}>FSS grace closing</th>
                  <th style={{ textAlign: "center" }}>FSS expired</th>
                </tr>
              </thead>
              <tbody>
                {summary.complianceRisk.map((row) => (
                  <tr key={row.venueId}>
                    <td style={{ fontWeight: 700, color: "var(--text)" }}>{row.venueName}</td>
                    <RiskCell count={row.rsaPending} tone="caution" />
                    <RiskCell count={row.rsaExpired} tone="risk" />
                    <RiskCell count={row.fssPending} tone="caution" />
                    <RiskCell count={row.fssExpired} tone="risk" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

function RiskCell({ count, tone }: { count: number; tone: "caution" | "risk" }) {
  if (count === 0) {
    return <td style={{ textAlign: "center", color: "var(--text-muted)" }}>–</td>;
  }
  return (
    <td style={{ textAlign: "center" }}>
      <span className={`mgmt-badge ${tone === "risk" ? "mgmt-badge-risk" : "mgmt-badge-caution"}`}>{count}</span>
    </td>
  );
}
