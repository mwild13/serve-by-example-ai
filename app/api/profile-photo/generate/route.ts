import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { getUserFromRequest } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Phase C file 08, Half B — AI Profile Photo. Net-new feature, no V3
// extraction (see v4-migration-plan/08-onboarding-diagnostic-and-profile.md).
// Model corrected from the plan's original `gpt-image-2` recommendation: the
// user opted for Fal.ai's `fal-ai/flux/schnell` model instead (~$0.003/image,
// materially cheaper than gpt-image-2 tiers) — decision made 2026-08-18,
// superseding the plan doc's "Locked Decision #1" cost callout.
//
// The 10 style prompts live here, server-side only, keyed by a stable `id`
// the client selects from a matching id/label/thumbnail list in
// AiProfilePhotoScreen.tsx — the client never sends free-text prompt content.
// This isn't just tidiness: without it, this route would be an unauthenticated-
// looking (it's auth-gated, but still) arbitrary-prompt image generator with
// real per-call cost, which is the exact abuse shape the plan's rate-limit
// section warned about.
//
// This route only generates and returns a preview URL — it does NOT persist
// to `profiles.profile_photo_url`. Persistence happens in
// `app/api/profile-photo/save/route.ts`, called only when the user taps
// "Save Portrait." Auto-saving on every generate would silently overwrite a
// user's existing portrait with whatever style they last previewed, even if
// they never confirmed it — same "don't fabricate/assume state" discipline
// applied elsewhere in this migration, just applied to writes instead of
// mock data.

export const dynamic = "force-dynamic";

type StylePrompt = { id: string; prompt: string };

const STYLE_PROMPTS: StylePrompt[] = [
  { id: "classic-bar", prompt: "Professional bartender headshot in a classic wooden bar setting, soft warm lighting, professional uniform" },
  { id: "fine-dining", prompt: "Professional sommelier headshot in an upscale fine dining restaurant, elegant ambient lighting, formal attire" },
  { id: "cocktail-lounge", prompt: "Modern mixologist headshot in a chic mood-lit cocktail lounge, sleek aesthetic, high-end hospitality portrait" },
  { id: "hotel-lobby", prompt: "Luxury hotel concierge staff headshot in a bright grand lobby, polished executive appearance" },
  { id: "rooftop-bar", prompt: "Trendy bartender headshot on a golden hour rooftop bar, cityscape background, vibrant modern portrait" },
  { id: "wine-cellar", prompt: "Expert wine server headshot inside an authentic rustic wine cellar, moody warm lighting, refined style" },
  { id: "coffee-house", prompt: "Artisan barista headshot in a modern craft coffee shop, warm cozy aesthetic, friendly professional look" },
  { id: "beach-club", prompt: "Resort hospitality staff headshot in a bright beach club setting, clean natural daylight, relaxed luxury style" },
  { id: "speakeasy", prompt: "Vintage craft bartender headshot in a secret speakeasy lounge, dramatic shadows, timeless hospitality style" },
  { id: "corporate", prompt: "Hospitality manager professional headshot, neutral modern backdrop, clean crisp business attire" },
];

fal.config({ credentials: process.env.FAL_KEY });

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    // Stricter than the 20/min text-route norm — each call has real,
    // non-trivial per-image cost (Fal Flux Schnell, ~$0.003/image), unlike
    // the cheap gpt-4o-mini text routes elsewhere in this plan.
    if (!rateLimit(`profile-photo:user:${user.id}`, 5) || !rateLimit(`profile-photo:ip:${ip}`, 5)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const styleId = typeof body?.styleId === "string" ? body.styleId : "";
    const style = STYLE_PROMPTS.find((s) => s.id === styleId);
    if (!style) {
      return NextResponse.json({ error: "Invalid style." }, { status: 400 });
    }

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: style.prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
      },
    });

    const imageUrl = result.data.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("[profile-photo/generate] Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
