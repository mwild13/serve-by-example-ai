"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  LIVE_GUEST_MAX_RECORDING_SECONDS,
  LiveGuestError,
  speakLiveGuestLine,
  transcribeLiveGuestReply,
} from "@/lib/live-guest-client";
import { MicrophoneError, startRecording, voiceSupported, type Recording } from "@/lib/voice-recorder";

// Live Guest voice (Rich update, Phase 14), for components/live-guest/LiveGuest.tsx.
// With voice on, the guest's lines are read aloud and the staff member can
// speak a reply, which is written into the reply box to check and send.
// Voice on or off is remembered on this device.

const STORAGE_KEY = "sbe-live-guest-voice";

// Voice on or off, kept in localStorage and shared by every Live Guest on the page.
const listeners = new Set<() => void>();
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function readVoiceOn(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}
function writeVoiceOn(on: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Not remembered on this device; it still changes for this visit.
  }
  sessionOverride = on;
  listeners.forEach((l) => l());
}
/** What was chosen this visit, for when storage is blocked. */
let sessionOverride: boolean | null = null;
const noSubscribe = () => () => {};
const offOnServer = () => false;

/** A short silent WAV, played inside a tap so iPhones let later audio play. */
function silentClip(): string {
  const samples = 800;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 16000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

export type GuestVoice = {
  /** False when this browser can't record or play audio: voice isn't offered. */
  supported: boolean;
  on: boolean;
  toggle: () => void;
  /** Call inside a tap or key press, before anything async, so audio can play later. */
  unlock: () => void;
  play: (sessionId: string, line: number) => Promise<void>;
  /** The line being read aloud, or null. */
  playing: number | null;
  stopPlaying: () => void;
  recording: boolean;
  seconds: number;
  transcribing: boolean;
  startTalking: () => Promise<void>;
  stopTalking: (sessionId: string, turn: number) => Promise<string | null>;
  cancelTalking: () => void;
  error: string | null;
  clearError: () => void;
  /** Forget the audio for a finished conversation. */
  reset: () => void;
  /** What to do when a recording reaches 30 seconds: usually stopTalking. */
  setAutoStop: (fn: () => void) => void;
};

export function useGuestVoice(getToken: () => Promise<string>): GuestVoice {
  const supported = useSyncExternalStore(noSubscribe, voiceSupported, offOnServer);
  const on = useSyncExternalStore(subscribe, () => sessionOverride ?? readVoiceOn(), offOnServer);
  const [playing, setPlaying] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clips = useRef(new Map<string, string>());
  const recordingRef = useRef<Recording | null>(null);
  const autoStop = useRef<(() => void) | null>(null);
  const unlocked = useRef(false);

  useEffect(() => {
    if (!recording) return;
    const started = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250);
    return () => window.clearInterval(id);
  }, [recording]);

  const stopPlaying = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(null);
  }, []);

  const reset = useCallback(() => {
    stopPlaying();
    recordingRef.current?.cancel();
    recordingRef.current = null;
    setRecording(false);
    for (const url of clips.current.values()) URL.revokeObjectURL(url);
    clips.current.clear();
  }, [stopPlaying]);

  useEffect(() => reset, [reset]);

  const unlock = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlaying(null);
    }
    if (unlocked.current) return;
    unlocked.current = true;
    const audio = audioRef.current;
    const silent = silentClip();
    audio.src = silent;
    audio.play().catch(() => {
      // Some browsers still refuse; the replay buttons cover it.
    }).finally(() => URL.revokeObjectURL(silent));
  }, []);

  const toggle = useCallback(() => {
    const next = !on;
    setError(null);
    if (next) unlock();
    else stopPlaying();
    writeVoiceOn(next);
  }, [on, stopPlaying, unlock]);

  const play = useCallback(
    async (sessionId: string, line: number) => {
      const key = `${sessionId}:${line}`;
      try {
        let url = clips.current.get(key);
        if (!url) {
          setPlaying(line);
          url = URL.createObjectURL(await speakLiveGuestLine(await getToken(), sessionId, line));
          clips.current.set(key, url);
        }
        if (!audioRef.current) unlock();
        const audio = audioRef.current!;
        audio.pause();
        audio.src = url;
        setPlaying(line);
        await audio.play();
      } catch (err) {
        setPlaying(null);
        // A browser that won't autoplay throws NotAllowedError: the play button still works.
        if (err instanceof DOMException && err.name === "NotAllowedError") return;
        setError(err instanceof LiveGuestError ? err.message : "The guest's voice didn't load. You can read the line instead.");
      }
    },
    [getToken, unlock],
  );

  const startTalking = useCallback(async () => {
    setError(null);
    stopPlaying();
    try {
      setSeconds(0);
      recordingRef.current = await startRecording(LIVE_GUEST_MAX_RECORDING_SECONDS, () => autoStop.current?.());
      setRecording(true);
    } catch (err) {
      setError(err instanceof MicrophoneError ? err.message : "We couldn't use the microphone. Type your reply instead.");
    }
  }, [stopPlaying]);

  const stopTalking = useCallback(
    async (sessionId: string, turn: number): Promise<string | null> => {
      const current = recordingRef.current;
      recordingRef.current = null;
      setRecording(false);
      if (!current) return null;
      setTranscribing(true);
      try {
        const audio = await current.stop();
        if (audio.size === 0) throw new LiveGuestError("We didn't catch that. Try again, or type it.", "NOTHING_HEARD", 422);
        return await transcribeLiveGuestReply(await getToken(), sessionId, turn, audio);
      } catch (err) {
        setError(err instanceof Error ? err.message : "We couldn't write that out. Try again, or type your reply.");
        return null;
      } finally {
        setTranscribing(false);
      }
    },
    [getToken],
  );

  const clearError = useCallback(() => setError(null), []);
  const setAutoStop = useCallback((fn: () => void) => {
    autoStop.current = fn;
  }, []);

  const cancelTalking = useCallback(() => {
    recordingRef.current?.cancel();
    recordingRef.current = null;
    setRecording(false);
  }, []);

  return {
    supported,
    on,
    toggle,
    unlock,
    play,
    playing,
    stopPlaying,
    recording,
    seconds,
    transcribing,
    startTalking,
    stopTalking,
    cancelTalking,
    error,
    clearError,
    reset,
    setAutoStop,
  };
}
