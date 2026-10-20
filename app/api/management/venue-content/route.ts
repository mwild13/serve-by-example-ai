import { NextResponse } from "next/server";
import { managementErrorResponse, requireManager } from "@/lib/management/auth";
import { cleanUserText, linkAbortSignal, readJsonBody } from "@/lib/ai-guard";
import { AI_DAILY_LIMIT_PAID, aiDailyLimitResponse, consumeAiAllowance } from "@/lib/ai-usage";
import { reportError } from "@/lib/report-error";
import {
  draftVenueQuestions,
  itemView,
  sydneyToday,
  type ItemRow,
  type StoredVenueQuestion,
  type VenueItemInput,
} from "@/lib/venue-content";
import {
  VENUE_CONTENT_DETAILS_MAX,
  VENUE_CONTENT_KINDS,
  VENUE_CONTENT_TITLE_MAX,
  type VenueContentKind,
} from "@/lib/venue-content-shared";

export const dynamic = "force-dynamic";

const ROUTE = "/api/management/venue-content";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BODY_BYTES = 8 * 1024;
const ITEM_COLUMNS = "id, kind, title, details, ends_on, created_at, venue_content_questions(id, status, question, created_at)";
/** Items listed per venue, newest first. */
const LIST_LIMIT = 50;
const DRAFT_TIMEOUT_MS = 25_000;

type Gate = Extract<Awaited<ReturnType<typeof requireManager>>, { ok: true }>["ctx"];

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function bad(error: string, code = "INVALID_INPUT"): Response {
  return NextResponse.json({ error, code }, { status: 400 });
}

async function loadItem(ctx: Gate, itemId: string): Promise<(ItemRow & { venue_id: string }) | null> {
  const { data, error } = await ctx.admin
    .from("venue_content_items")
    .select(`venue_id, ${ITEM_COLUMNS}`)
    .eq("id", itemId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as ItemRow & { venue_id: string };
  await ctx.assertOwnsVenue(row.venue_id);
  return row;
}

/** Drafts questions for an item and saves them as drafts. False when the AI call failed. */
async function draftAndSave(ctx: Gate, req: Request, item: VenueItemInput & { id: string; venueId: string }): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DRAFT_TIMEOUT_MS);
  const unlink = linkAbortSignal(controller, req.signal);
  let drafted: StoredVenueQuestion[];
  try {
    drafted = await draftVenueQuestions(item, controller.signal);
  } catch (error) {
    console.error(`[${ROUTE}] draft failed:`, error);
    await reportError(error, { route: ROUTE, url: req.url });
    return false;
  } finally {
    clearTimeout(timeout);
    unlink();
  }
  if (drafted.length === 0) return false;
  const { error } = await ctx.admin
    .from("venue_content_questions")
    .insert(drafted.map((question) => ({ item_id: item.id, venue_id: item.venueId, question, status: "draft" })));
  if (error) throw error;
  return true;
}

async function itemResponse(ctx: Gate, itemId: string, draftFailed = false): Promise<Response> {
  const row = await loadItem(ctx, itemId);
  if (!row) return NextResponse.json({ error: "That item has been taken down.", code: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ item: itemView(row), ...(draftFailed ? { draftFailed: true } : {}) });
}

/** The venue's items and their questions, newest first. */
export async function GET(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-venue-content", limit: 60 });
  if (!gate.ok) return gate.response;
  const ctx = gate.ctx;
  try {
    const venueId = new URL(req.url).searchParams.get("venueId");
    if (!isUuid(venueId)) return bad("Choose a venue.");
    await ctx.assertOwnsVenue(venueId);
    const { data, error } = await ctx.admin
      .from("venue_content_items")
      .select(ITEM_COLUMNS)
      .eq("venue_id", venueId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT);
    if (error) throw error;
    const today = sydneyToday();
    return NextResponse.json({ items: ((data ?? []) as unknown as ItemRow[]).map((row) => itemView(row, today)) });
  } catch (error) {
    return managementErrorResponse(error, "Could not load venue content.", ROUTE, 500);
  }
}

/** Adds an item and drafts its questions. The item is kept even if drafting fails. */
export async function POST(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-venue-content-add", limit: 10 });
  if (!gate.ok) return gate.response;
  const ctx = gate.ctx;
  try {
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { venueId, kind, title, details, endsOn } = read.body;

    if (!isUuid(venueId)) return bad("Choose a venue.");
    if (typeof kind !== "string" || !(VENUE_CONTENT_KINDS as readonly string[]).includes(kind)) return bad("Choose what you're adding.");
    if (typeof title !== "string" || !title.trim() || title.length > VENUE_CONTENT_TITLE_MAX) {
      return bad(`Give it a name of up to ${VENUE_CONTENT_TITLE_MAX} characters.`);
    }
    if (typeof details !== "string" || details.trim().length < 10 || details.length > VENUE_CONTENT_DETAILS_MAX) {
      return bad(`Add the details, between 10 and ${VENUE_CONTENT_DETAILS_MAX} characters.`);
    }
    if (endsOn !== undefined && endsOn !== null && (typeof endsOn !== "string" || !DATE_PATTERN.test(endsOn) || Number.isNaN(Date.parse(endsOn)))) {
      return bad("Check the end date.");
    }
    if (typeof endsOn === "string" && endsOn < sydneyToday()) return bad("The end date has already passed.");

    await ctx.assertOwnsVenue(venueId);
    if (!(await consumeAiAllowance(ctx.admin, ctx.user.id, AI_DAILY_LIMIT_PAID))) return aiDailyLimitResponse();

    const input: VenueItemInput = {
      kind: kind as VenueContentKind,
      title: cleanUserText(title),
      details: cleanUserText(details),
      endsOn: typeof endsOn === "string" ? endsOn : null,
    };
    const { data: created, error } = await ctx.admin
      .from("venue_content_items")
      .insert({ venue_id: venueId, created_by: ctx.user.id, kind: input.kind, title: input.title, details: input.details, ends_on: input.endsOn })
      .select("id")
      .single();
    if (error || !created) throw error ?? new Error("venue_content_items insert returned no row");

    const drafted = await draftAndSave(ctx, req, { ...input, id: created.id as string, venueId });
    return itemResponse(ctx, created.id as string, !drafted);
  } catch (error) {
    return managementErrorResponse(error, "Could not add that item.", ROUTE, 500);
  }
}

/**
 * One change:
 *   { action: "approve" | "reject", questionId }
 *   { action: "redraft", itemId }  replaces the drafts not yet approved
 *   { action: "archive", itemId }  takes the item and its questions out of drills
 */
export async function PATCH(req: Request) {
  const gate = await requireManager(req, { rateKey: "mgmt-venue-content-edit", limit: 60 });
  if (!gate.ok) return gate.response;
  const ctx = gate.ctx;
  try {
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const { action, itemId, questionId } = read.body;

    if (action === "approve" || action === "reject") {
      if (!isUuid(questionId)) return bad("Choose a question.");
      const { data: question, error } = await ctx.admin
        .from("venue_content_questions")
        .select("item_id")
        .eq("id", questionId)
        .maybeSingle();
      if (error) throw error;
      const item = question ? await loadItem(ctx, question.item_id as string) : null;
      if (!item) return NextResponse.json({ error: "That question has gone.", code: "NOT_FOUND" }, { status: 404 });
      const { error: updateError } = await ctx.admin
        .from("venue_content_questions")
        .update({ status: action === "approve" ? "approved" : "rejected", reviewed_by: ctx.user.id, reviewed_at: new Date().toISOString() })
        .eq("id", questionId);
      if (updateError) throw updateError;
      return itemResponse(ctx, item.id);
    }

    if (action === "redraft" || action === "archive") {
      if (!isUuid(itemId)) return bad("Choose an item.");
      const item = await loadItem(ctx, itemId);
      if (!item) return NextResponse.json({ error: "That item has been taken down.", code: "NOT_FOUND" }, { status: 404 });

      if (action === "archive") {
        const { error } = await ctx.admin
          .from("venue_content_items")
          .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", itemId);
        if (error) throw error;
        return NextResponse.json({ archived: itemId });
      }

      if (!(await consumeAiAllowance(ctx.admin, ctx.user.id, AI_DAILY_LIMIT_PAID))) return aiDailyLimitResponse();
      const { error: clearError } = await ctx.admin
        .from("venue_content_questions")
        .delete()
        .eq("item_id", itemId)
        .eq("status", "draft");
      if (clearError) throw clearError;
      const drafted = await draftAndSave(ctx, req, {
        id: item.id,
        venueId: item.venue_id,
        kind: item.kind,
        title: item.title,
        details: item.details,
        endsOn: item.ends_on,
      });
      return itemResponse(ctx, item.id, !drafted);
    }

    return bad("Unknown action.");
  } catch (error) {
    return managementErrorResponse(error, "Could not save that change.", ROUTE, 500);
  }
}
