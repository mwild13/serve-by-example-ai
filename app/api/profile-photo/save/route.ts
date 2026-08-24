import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Phase C file 08, Half B — persists the URL the user explicitly confirmed
// via "Save Portrait" into profiles.profile_photo_url. Separate from
// /generate on purpose: generating a preview should never silently commit a
// user's profile photo before they've chosen to keep it. See
// v4-migration-plan/08-onboarding-diagnostic-and-profile.md.
//
// No Supabase Storage bucket — Fal's returned URLs are hosted on Fal's own
// CDN (fal.media), which is durable, so re-uploading into our own bucket
// would just be a redundant copy for a feature with no stated multi-photo/
// history requirement. Revisit only if Fal URL longevity becomes a problem
// in practice or the product grows a "photo history" requirement.
//
// Phase D (2026-08-25): a no-selfie generation now returns our own static
// base-plate URL directly (see generate/route.ts) instead of always being a
// Fal-hosted result — isAllowedPhotoUrl (renamed from isAllowedFalUrl)
// accepts that shape too now, scoped tightly to the exact
// public/mobile/{men,women}/ai-style-*.png plates so this stays a real
// allow-list, not a same-origin free-for-all.

export const dynamic = "force-dynamic";

const PLATE_PATH_RE = /^\/mobile\/(men|women)\/ai-style-[a-z-]+\.png$/;

function isAllowedPhotoUrl(url: string, requestOrigin: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && parsed.hostname.endsWith(".fal.media")) return true;
    // Same-origin static base plate — deliberately not https-only like the
    // fal.media branch above, since requestOrigin is itself http in local
    // dev (matching whatever protocol the current request actually used).
    return parsed.origin === requestOrigin && PLATE_PATH_RE.test(parsed.pathname);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url : "";
    const requestOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
    if (!isAllowedPhotoUrl(url, requestOrigin)) {
      return NextResponse.json({ error: "Invalid photo URL." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ profile_photo_url: url })
      .eq("id", user.id);

    if (error) {
      console.error("[profile-photo/save] Supabase error:", error);
      return NextResponse.json({ error: "Failed to save portrait" }, { status: 500 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("[profile-photo/save] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
