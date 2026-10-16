import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { siteOrigin } from "@/lib/site-url";

// Reset emails sent before 2026-10-17 link here with ?token=&type=recovery.
// New ones link straight to /reset-password?token_hash=, which signs the
// user in with verifyOtp. This route only forwards the old links to that
// page, so it can't become an open redirect. Safe to delete once no reset
// email older than an hour can still be in an inbox unopened.
export async function GET(req: Request) {
  // Reached from the reset email before sign-in, so the key is the IP. The
  // limit is loose: a whole venue can sit behind one address.
  if (!rateLimit(`verify-redirect:ip:${getClientIp(req)}`, 30)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  const type = searchParams.get("type");
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(token) || type !== "recovery") {
    return NextResponse.json({ error: "Invalid link." }, { status: 400 });
  }

  const target = new URL("/reset-password", siteOrigin(req));
  target.searchParams.set("token_hash", token);
  target.searchParams.set("type", type);
  return NextResponse.redirect(target, { status: 302 });
}
