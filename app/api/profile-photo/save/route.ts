import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { rateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/ai-guard";

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

// WebP from most browsers; JPEG from iOS, whose canvas cannot encode WebP
// (see exportCompositeBlob).
const COMPOSITE_DATA_URL_RE = /^data:image\/(webp|jpeg);base64,([A-Za-z0-9+/=]+)$/;
const PHOTO_EXTENSIONS = { webp: "webp", jpeg: "jpg" } as const;
type PhotoFormat = keyof typeof PHOTO_EXTENSIONS;
// exportCompositeBlob (lib/photo-composite.ts) targets ~150-300KB raw at
// COMPOSITE_SIZE (1024x1024) WebP/0.8 quality; base64 inflates that by
// ~33%. This cap is a generous backstop against a modified client, not the
// normal path.
const MAX_COMPOSITE_BASE64_CHARS = 4_000_000;

/** The bytes must be what the data URL claims, since the file is public. */
function hasImageSignature(buffer: Buffer, format: PhotoFormat): boolean {
  if (format === "jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  return (
    buffer.length > 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

function parseCompositeDataUrl(value: unknown): { buffer: Buffer; format: PhotoFormat } | null {
  if (typeof value !== "string" || value.length > MAX_COMPOSITE_BASE64_CHARS) return null;
  const match = COMPOSITE_DATA_URL_RE.exec(value);
  if (!match) return null;
  const format = match[1] as PhotoFormat;
  const buffer = Buffer.from(match[2], "base64");
  return hasImageSignature(buffer, format) ? { buffer, format } : null;
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rateLimit(`profile-photo-save:user:${user.id}`, 10)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const read = await readJsonBody(req, 4_500_000, { requireJsonContentType: false });
    if (!read.ok) return read.response;
    const body = read.body;
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = parseCompositeDataUrl(body.image);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { buffer, format } = parsed;
    const path = `${user.id}/profile-photo.${PHOTO_EXTENSIONS[format]}`;

    const { error: uploadError } = await admin.storage
      .from("profile-photos")
      .upload(path, buffer, { contentType: `image/${format}`, upsert: true });

    if (uploadError) {
      console.error("[profile-photo/save] Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to save your photo" }, { status: 500 });
    }

    // One photo per user: drop the copy in the other format, if any, so a
    // stale public file is not left behind. Best effort.
    const otherFormat: PhotoFormat = format === "webp" ? "jpeg" : "webp";
    await admin.storage
      .from("profile-photos")
      .remove([`${user.id}/profile-photo.${PHOTO_EXTENSIONS[otherFormat]}`]);

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
