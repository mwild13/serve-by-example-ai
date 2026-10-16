import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/site-url";

// Password-reset deliverability fix (2026-09-02) — Gmail was flagging our
// reset-password emails as "This message might be dangerous". The email is
// sent from info@servebyexample.co, but the reset link inside it pointed
// straight at the raw Supabase project host
// (<project-ref>.supabase.co/auth/v1/verify?...) — a sender/link domain
// mismatch that's a textbook phishing heuristic. This route lets the link
// in the email live on our own domain instead: it only ever forwards to
// the Supabase Auth verify endpoint for OUR OWN project (NEXT_PUBLIC_SUPABASE_URL),
// nothing else, so it can't be abused as an open redirect. See
// app/api/auth/forgot-password/route.ts, the only caller.
export async function GET(req: Request) {
  // Reached from the reset email before sign-in, so the key is the IP. The
  // limit is loose: a whole venue can sit behind one address.
  if (!rateLimit(`verify-redirect:ip:${getClientIp(req)}`, 30)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  // The email carries the token and type as flat params and this route
  // builds the Supabase link. The email used to carry the whole link as one
  // encoded value, and click tracking decoded it, which split off the type.
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const type = searchParams.get("type");
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(token) || type !== "recovery") {
    return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  }

  // Only ever our own project's verify endpoint and our own reset page, so
  // this can't become an open redirect.
  const target = new URL("/auth/v1/verify", supabaseUrl);
  target.searchParams.set("token", token);
  target.searchParams.set("type", type);
  target.searchParams.set("redirect_to", `${siteOrigin(req)}/reset-password`);

  return NextResponse.redirect(target, { status: 302 });
}
