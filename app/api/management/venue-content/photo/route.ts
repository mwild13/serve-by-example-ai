import { NextResponse } from "next/server";
import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { linkAbortSignal, readJsonBody } from "@/lib/ai-guard";
import { AI_DAILY_LIMIT_PAID, aiDailyLimitResponse, consumeAiAllowance } from "@/lib/ai-usage";
import { reportError } from "@/lib/report-error";
import { MENU_PHOTO_MAX_CHARS, isMenuPhoto, readMenuPhoto } from "@/lib/venue-content";

export const dynamic = "force-dynamic";

const ROUTE = "/api/management/venue-content/photo";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const READ_TIMEOUT_MS = 30_000;

/**
 * Reads a photo of the menu into a list of items (Rich update, Phase 11,
 * part two). Nothing is saved: the manager ticks the items they want, and
 * each one is then added through POST /api/management/venue-content like a
 * typed item. The photo is sent to OpenAI and not kept.
 */
export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-venue-content-photo", limit: 5 });
  if (!gate.ok) return gate.response;
  const ctx = gate.ctx;
  try {
    const read = await readJsonBody(req, MENU_PHOTO_MAX_CHARS + 1024);
    if (!read.ok) return read.response;
    const { venueId, image } = read.body;
    if (typeof venueId !== "string" || !UUID_PATTERN.test(venueId)) {
      return NextResponse.json({ error: "Choose a venue.", code: "INVALID_INPUT" }, { status: 400 });
    }
    if (!isMenuPhoto(image)) {
      return NextResponse.json({ error: "That photo couldn't be read. Try a JPEG or PNG under about 2 MB.", code: "INVALID_INPUT" }, { status: 400 });
    }
    await ctx.assertOwnsVenue(venueId);
    if (!(await consumeAiAllowance(ctx.admin, ctx.user.id, AI_DAILY_LIMIT_PAID))) return aiDailyLimitResponse();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), READ_TIMEOUT_MS);
    const unlink = linkAbortSignal(controller, req.signal);
    try {
      const items = await readMenuPhoto(image, controller.signal);
      return NextResponse.json({ items });
    } catch (error) {
      console.error(`[${ROUTE}] read failed:`, error);
      await reportError(error, { route: ROUTE, url: req.url });
      return NextResponse.json({ error: "The menu couldn't be read this time. Try again, or a clearer photo.", code: "READ_FAILED" }, { status: 502 });
    } finally {
      clearTimeout(timeout);
      unlink();
    }
  } catch (error) {
    return managementErrorResponse(error, "Could not read that photo.", ROUTE, 500);
  }
}
