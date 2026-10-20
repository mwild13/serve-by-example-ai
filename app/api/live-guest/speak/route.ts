import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/ai-guard";
import { VOICE_MODELS, getOpenAIClient } from "@/lib/openai";
import { reportError } from "@/lib/report-error";
import { startMoodFor } from "@/lib/live-guest/difficulty";
import { refuse, voiceAccess } from "@/lib/live-guest/voice-access";
import { speechInstructions, voiceFor } from "@/lib/live-guest/voice";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;

/**
 * Reads one of the guest's lines aloud (Phase 14). `line` 0 is the opening
 * line and n is the guest's answer to reply n, always taken from the stored
 * conversation, so this can't be used to read out any other text. Returns
 * MP3. Nothing is stored. See lib/live-guest/voice.ts.
 */
export async function POST(req: Request) {
  try {
    const read = await readJsonBody(req, MAX_BODY_BYTES);
    if (!read.ok) return read.response;
    const line = Number(read.body.line);
    if (!Number.isInteger(line) || line < 0) return refuse("Invalid request.", "INVALID_REQUEST", 400);

    const access = await voiceAccess(req, read.body.sessionId, "speak", (session) =>
      line <= session.turns.length ? null : refuse("That line hasn't been said yet.", "NO_LINE", 409),
    );
    if (access instanceof NextResponse) return access;
    const { session, brief } = access;
    const text = line === 0 ? brief.opening : session.turns[line - 1].guest;
    const mood = line === 0 ? startMoodFor(brief, session.difficulty) : session.turns[line - 1].mood;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let audio: ArrayBuffer;
    try {
      const speech = await getOpenAIClient().audio.speech.create(
        {
          model: VOICE_MODELS.speech,
          voice: voiceFor(brief),
          input: text,
          instructions: speechInstructions(brief, mood),
          response_format: "mp3",
        },
        { signal: controller.signal },
      );
      audio = await speech.arrayBuffer();
    } finally {
      clearTimeout(timeout);
    }

    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("live-guest/speak error:", error);
    await reportError(error, { route: "/api/live-guest/speak", url: req.url });
    return refuse("The guest's voice didn't load. You can read the line instead.", "SPEAK_FAILED", 500);
  }
}
