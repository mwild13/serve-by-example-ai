import { getUserFromRequest } from "@/lib/supabase-server";
import { getOrgGroupSummary } from "@/lib/management/service";

// Cross-venue KPI rollup for the Group Analytics view (Batch 5). Mirrors
// app/api/management/snapshot/route.ts's auth/error shape, but the payload
// is the small OrgGroupSummary aggregate — see getOrgGroupSummary() — not
// the full snapshot, so this never ships raw per-staff rows to the browser.
export async function GET(req: Request) {
  const { user, supabase } = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const summary = await getOrgGroupSummary(supabase, user.id);
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch group summary:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch group summary" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
