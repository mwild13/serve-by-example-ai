import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { user } = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!rateLimit(`trial-modal-shown:user:${user.id}`, 20)) {
    return new Response(JSON.stringify({ error: "Too many requests. Try again in a minute." }), { status: 429, headers: { "Content-Type": "application/json" } });
  }

  const admin = createSupabaseAdminClient();
  await admin
    .from("profiles")
    .update({ trial_grace_modal_shown: true })
    .eq("id", user.id);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
