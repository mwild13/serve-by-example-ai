/**
 * voice.ts – Live Guest voice (Rich update, Phase 14).
 *
 * Push to talk, not a live call. The staff member records a reply
 * (POST /api/live-guest/listen), it's written out as text and put in the
 * reply box, where they can fix it before sending it through the same text
 * turn as a typed reply. The guest's lines are read aloud
 * (POST /api/live-guest/speak), always from the stored conversation, never
 * from text the browser sends. Audio is never stored: only the text is kept,
 * as with a typed reply.
 *
 * Each recording and each line read aloud counts as one voice clip against
 * VOICE_DAILY_CLIPS (bump_voice_usage, 20261027_live_guest_voice.sql).
 * Recordings stop at 30 seconds, so the cap is a cap on minutes.
 */

import "server-only";
import type { GuestBrief, Mood } from "@/lib/live-guest/guests";

/** Clips a person can use in a Sydney day: about ten voice conversations. */
export const VOICE_DAILY_CLIPS = 80;
/**
 * The browser stops recording at 30 seconds (LIVE_GUEST_MAX_RECORDING_SECONDS
 * in lib/live-guest-client.ts), and 30 seconds of its compressed audio is
 * well under this.
 */
export const MAX_RECORDING_BYTES = 1_000_000;

/** What browsers record in: Chrome and Firefox webm or ogg, Safari mp4. */
const RECORDING_TYPES: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
};

/** The file extension for a recording's type ("audio/webm;codecs=opus" is webm), or null if it isn't one. */
export function recordingExtension(type: string): string | null {
  return RECORDING_TYPES[type.split(";")[0].trim().toLowerCase()] ?? null;
}

const MASCULINE = ["ash", "echo", "verse", "cedar", "ballad"] as const;
const FEMININE = ["coral", "marin", "shimmer", "sage"] as const;
const NEUTRAL = ["alloy", "sage", "verse"] as const;

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** How the brief refers to the guest, from the pronouns in `who`. */
export function guestPronouns(brief: GuestBrief): "he" | "she" | "they" {
  const words = brief.who.toLowerCase().match(/[a-z']+/g) ?? [];
  const count = (list: string[]) => words.filter((w) => list.includes(w)).length;
  const he = count(["he", "him", "his", "he's", "himself"]);
  const she = count(["she", "her", "hers", "she's", "herself"]);
  if (he > she) return "he";
  if (she > he) return "she";
  return "they";
}

/** A voice that suits the guest, and the same one every time for that guest. */
export function voiceFor(brief: GuestBrief): string {
  const pronouns = guestPronouns(brief);
  const voices = pronouns === "he" ? MASCULINE : pronouns === "she" ? FEMININE : NEUTRAL;
  return voices[hash(brief.id) % voices.length];
}

const MOOD_DELIVERY: Record<Mood, string> = {
  1: "fuming: clipped, sharp and fed up, but not shouting",
  2: "annoyed: a bit short and impatient",
  3: "neutral: matter-of-fact",
  4: "happy: relaxed and friendly",
  5: "delighted: warm and upbeat",
};

/** How the line is read: the person, an Australian accent, and the mood they're in. */
export function speechInstructions(brief: GuestBrief, mood: Mood): string {
  return [
    `You are voicing a character in a hospitality training conversation. Character: ${brief.who}`,
    "Accent: a natural, everyday Australian accent. Not exaggerated, not a caricature.",
    `Mood right now: ${MOOD_DELIVERY[mood]}.`,
    "Speak like a real person in a busy Australian venue: natural pace, casual, no performance. Read the words exactly as written.",
  ].join("\n");
}

/** Words the transcriber should expect, so "schooner" isn't written as "scooner". */
const HOSPITALITY_WORDS =
  "schooner, middy, pot, pint, jug, tinnie, stubby, spirits, RSA, Espresso Martini, Aperol Spritz, flat white, long black, skinny cap, soy, oat, keg, tap, ice well, coeliac, gluten free, allergy, EpiPen, docket, pass, sold out, mate, no worries";

/**
 * The transcription hint: Australian English, the hospitality words, and the
 * guest's last line, so the reply is heard in context. It's a hint only: the
 * transcript is what the staff member said, and they can fix it.
 */
export function transcriptionPrompt(lastGuestLine: string): string {
  return `A staff member in an Australian bar, pub or restaurant answering a guest, in Australian English. Words that may come up: ${HOSPITALITY_WORDS}. The guest just said: "${lastGuestLine.slice(0, 300)}"`;
}
