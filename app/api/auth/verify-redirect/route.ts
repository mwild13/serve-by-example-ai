import { NextResponse } from "next/server";

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const link = searchParams.get("link");
  if (!link) {
    return NextResponse.json({ error: "Missing link." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(link);
  } catch {
    return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  }

  // Only ever forward to our own Supabase project's auth verify endpoint —
  // never an arbitrary host, so this can't become an open redirect.
  const allowedHost = new URL(supabaseUrl).host;
  if (target.protocol !== "https:" || target.host !== allowedHost || !target.pathname.startsWith("/auth/v1/verify")) {
    return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  }

  return NextResponse.redirect(target, { status: 302 });
}
