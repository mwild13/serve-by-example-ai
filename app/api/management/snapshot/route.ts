import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { getManagementSnapshot } from "@/lib/management/service";

// Same data path as app/management/dashboard/page.tsx (admin client, rows
// scoped to the caller in the query). Behind requireManager() because
// getManagementSnapshot() auto-provisions a first venue — it used to do that
// for any signed-in account that called this route (audit 2026-09-30, Phase 2).
export async function GET(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-snapshot", limit: 60 });
  if (!gate.ok) return gate.response;
  const { user, admin } = gate.ctx;

  try {
    const snapshot = await getManagementSnapshot(admin, user.id);
    return new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return managementErrorResponse(error, "Failed to fetch snapshot", "snapshot GET", 500);
  }
}
