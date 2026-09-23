import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Persists the flattened composite (background + cutout, canvas-rendered
// client-side — see lib/photo-composite.ts) into Supabase Storage and
// updates profiles.profile_photo_url. Replaces the old contract of
// { url: string } pointing at either a fal.media result or one of the
// now-deleted static base-plate images — there's no URL to validate
// anymore, only bytes, which closes that whole allow-list class of bug
// (isAllowedPhotoUrl/PLATE_PATH_RE, both removed).
//
// No durable per-day cap here — saving/re-saving or just switching which
// background is composited was never gated by the old feature either, only
// generation was (see remove-background/route.ts). A lighter burst
// throttle still applies below.

export const dynamic = "force-dynamic";

const COMPOSITE_DATA_URL_RE = /^data:image\/webp;base64,([A-Za-z0-9+/=]+)$/;
// exportCompositeBlob (lib/photo-composite.ts) targets ~150-300KB raw at
// COMPOSITE_SIZE (1024x1024) WebP/0.8 quality; base64 inflates that by
// ~33%. This cap is a generous backstop against a modified client, not the
// normal path.
const MAX_COMPOSITE_BASE64_CHARS = 4_000_000;

function parseCompositeDataUrl(value: unknown): Buffer | null {
  if (typeof value !== "string" || value.length > MAX_COMPOSITE_BASE64_CHARS) return null;
  const match = COMPOSITE_DATA_URL_RE.exec(value);
  if (!match) return null;
  return Buffer.from(match[1], "base64");
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(`profile-photo-save:user:${user.id}`, 10) || !rateLimit(`profile-photo-save:ip:${ip}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const buffer = parseCompositeDataUrl(body.image);
    if (!buffer) {
      return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const path = `${user.id}/profile-photo.webp`;

    const { error: uploadError } = await admin.storage
      .from("profile-photos")
      .upload(path, buffer, { contentType: "image/webp", upsert: true });

    if (uploadError) {
      console.error("[profile-photo/save] Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to save your photo" }, { status: 500 });
    }

    const { data: publicUrlData } = admin.storage.from("profile-photos").getPublicUrl(path);
    // The storage path is fixed per user, so its public URL never changes
    // between saves — a cache-busting query param keeps <Image>/browser
    // caches from showing a stale photo right after a re-save.
    const url = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ profile_photo_url: url })
      .eq("id", user.id);

    if (updateError) {
      console.error("[profile-photo/save] Supabase error:", updateError);
      return NextResponse.json({ error: "Failed to save your photo" }, { status: 500 });
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("[profile-photo/save] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
