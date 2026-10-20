import { NextResponse } from "next/server";
import { cleanUserText } from "@/lib/ai-guard";
import { VOICE_MODELS, getOpenAIClient } from "@/lib/openai";
import { reportError } from "@/lib/report-error";
import { refuse, voiceAccess } from "@/lib/live-guest/voice-access";
import { MAX_RECORDING_BYTES, recordingExtension, transcriptionPrompt } from "@/lib/live-guest/voice";
import { LIVE_GUEST_MAX_REPLY_CHARS } from "@/lib/live-guest-client";

export const dynamic = "force-dynamic";

/** The recording plus the two small form fields. */
const MAX_BODY_BYTES = MAX_RECORDING_BYTES + 16 * 1024;

/**
 * Writes out one spoken Live Guest reply (Phase 14). The text goes back to
 * the reply box, where the staff member can fix it before sending it to
 * /api/live-guest/turn like a typed reply. The audio is passed to OpenAI and
 * never stored. See lib/live-guest/voice.ts.
 */
export async function POST(req: Request) {
  try {
    const length = Number(req.headers.get("content-length"));
    if (!Number.isFinite(length) || length <= 0) return refuse("Invalid request.", "INVALID_REQUEST", 400);
    if (length > MAX_BODY_BYTES) return refuse("That recording is too long. Keep it under 30 seconds.", "RECORDING_TOO_LONG", 413);

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return refuse("Invalid request.", "INVALID_REQUEST", 400);
    }
    const audio = form.get("audio");
    const turn = Number(form.get("turn"));
    if (!(audio instanceof Blob) || audio.size === 0 || !Number.isInteger(turn) || turn < 0) {
      return refuse("Invalid request.", "INVALID_REQUEST", 400);
    }
    if (audio.size > MAX_RECORDING_BYTES) return refuse("That recording is too long. Keep it under 30 seconds.", "RECORDING_TOO_LONG", 413);
    const extension = recordingExtension(audio.type);
    if (!extension) return refuse("This browser recorded in a format we can't read. Type your reply instead.", "UNSUPPORTED_AUDIO", 415);

    const access = await voiceAccess(req, form.get("sessionId"), "listen", (session) =>
      session.turn_count === turn ? null : refuse("That reply is out of step. Reload and try again.", "TURN_MISMATCH", 409),
    );
    if (access instanceof NextResponse) return access;
    const { session, brief } = access;
    const lastGuestLine = session.turns.length > 0 ? session.turns[session.turns.length - 1].guest : brief.opening;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let text: string;
    try {
      const file = new File([await audio.arrayBuffer()], `reply.${extension}`, { type: audio.type.split(";")[0] });
      const result = await getOpenAIClient().audio.transcriptions.create(
        { file, model: VOICE_MODELS.transcribe, language: "en", prompt: transcriptionPrompt(lastGuestLine), response_format: "json" },
        { signal: controller.signal },
      );
      text = cleanUserText(result.text ?? "").slice(0, LIVE_GUEST_MAX_REPLY_CHARS).trim();
    } finally {
      clearTimeout(timeout);
    }

    if (!text) return refuse("We didn't catch that. Try again a bit closer to the phone, or type it.", "NOTHING_HEARD", 422);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("live-guest/listen error:", error);
    await reportError(error, { route: "/api/live-guest/listen", url: req.url });
    return refuse("We couldn't write that out. Try again, or type your reply.", "LISTEN_FAILED", 500);
  }
}
