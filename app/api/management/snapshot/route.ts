import { getUserFromRequest } from "@/lib/supabase-server";
import { getManagementSnapshot } from "@/lib/management/service";

export async function GET(req: Request) {
  const { user, supabase } = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const snapshot = await getManagementSnapshot(supabase, user.id);
    return new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch management snapshot:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch snapshot" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
