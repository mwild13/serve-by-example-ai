import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/site-url";
import { syncBrevo } from "@/lib/notifications/brevo";
import { isUnsubscribeKind, verifyUnsubscribeToken } from "@/lib/notifications/unsubscribe-token";

// Turns one notification email off from a signed link, without signing in.
//
// Two callers:
// - The confirm button on /notifications/unsubscribe (a form post). Redirects
//   back to that page showing it is done.
// - Mail apps' own unsubscribe button (RFC 8058 one-click), which posts
//   "List-Unsubscribe=One-Click" to the URL in the List-Unsubscribe header.
//   Answers 200 with no redirect.
//
// Only POST changes anything: link scanners open every link in an email
// with GET, so a GET unsubscribe would switch people off at random.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  if (!rateLimit(`notifications-unsubscribe:ip:${getClientIp(req)}`, 20)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  const secret = process.env.NOTIFICATIONS_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  // The one-click post carries the ids in the query string; the page's form
  // carries them in the body.
  const url = new URL(req.url);
  const form = await req.formData().catch(() => null);
  const field = (name: string) => {
    const fromForm = form?.get(name);
    return typeof fromForm === "string" && fromForm ? fromForm : url.searchParams.get(name) ?? "";
  };
  const userId = field("u");
  const kind = field("k");
  const token = field("t");
  const oneClick = form?.get("List-Unsubscribe") === "One-Click";

  // A form post goes back to the page, which explains; a mail app gets JSON.
  const fail = (status: number, error: string, reason: "invalid" | "failed") => {
    if (oneClick) return NextResponse.json({ error }, { status });
    const page = new URL("/notifications/unsubscribe", siteOrigin(req));
    page.searchParams.set("error", reason);
    return NextResponse.redirect(page, { status: 303 });
  };

  if (!UUID_PATTERN.test(userId) || !isUnsubscribeKind(kind) || !(await verifyUnsubscribeToken(secret, userId, kind, token))) {
    return fail(400, "This unsubscribe link is not valid.", "invalid");
  }

  const admin = createSupabaseAdminClient();
  const column = kind === "digest" ? "notif_weekly_digest" : "notif_reminders";
  const { data: before, error: readError } = await admin
    .from("profiles")
    .select("notif_reminders, notif_weekly_digest")
    .eq("id", userId)
    .maybeSingle();
  if (readError) {
    console.error("[notifications/unsubscribe] read failed:", readError.message);
    return fail(500, "Could not unsubscribe. Please try again.", "failed");
  }

  if (before?.[column]) {
    const { error } = await admin.from("profiles").update({ [column]: false }).eq("id", userId);
    if (error) {
      console.error("[notifications/unsubscribe] update failed:", error.message);
      return fail(500, "Could not unsubscribe. Please try again.", "failed");
    }
    // Keep the Brevo contact in step, as turning it off in Settings does.
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    if (email) {
      const otherStillOn = kind === "digest" ? !!before.notif_reminders : !!before.notif_weekly_digest;
      await syncBrevo(email, { [kind]: false }, otherStillOn, { confirm: false });
    }
  }

  if (oneClick) return NextResponse.json({ ok: true });

  const done = new URL("/notifications/unsubscribe", siteOrigin(req));
  done.searchParams.set("done", kind);
  return NextResponse.redirect(done, { status: 303 });
}
