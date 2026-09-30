import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { getOrgGroupSummary } from "@/lib/management/service";

// Cross-venue KPI rollup for the Group Analytics view (Batch 5). Mirrors
// app/api/management/snapshot/route.ts's auth/error shape, but the payload
// is the small OrgGroupSummary aggregate — see getOrgGroupSummary() — not
// the full snapshot, so this never ships raw per-staff rows to the browser.
// Behind requireManager() like the snapshot route, since it builds on
// getManagementSnapshot() (audit 2026-09-30, Phase 2).
export async function GET(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-group-summary", limit: 60 });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const summary = await getOrgGroupSummary(admin, user.id);
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return managementErrorResponse(error, "Failed to fetch group summary", "group-summary GET", 500);
  }
}
