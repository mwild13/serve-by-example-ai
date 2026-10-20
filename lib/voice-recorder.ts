// Push-to-talk recording for Live Guest voice (Rich update, Phase 14), in
// the browser. Chrome and Firefox record webm (Opus), Safari mp4 (AAC). The
// recording stops by itself at maxSeconds. Nothing is kept on the device.

export function voiceSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof window.Audio !== "undefined"
  );
}

function recordingType(): string | undefined {
  for (const type of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}

export type Recording = {
  /** Stops and gives back the audio. */
  stop: () => Promise<Blob>;
  /** Stops and throws the audio away. */
  cancel: () => void;
};

export class MicrophoneError extends Error {
  constructor(message: string, readonly denied: boolean) {
    super(message);
    this.name = "MicrophoneError";
  }
}

/** Asks for the microphone (the first time) and starts recording. `onAutoStop` fires if maxSeconds is reached. */
export async function startRecording(maxSeconds: number, onAutoStop: () => void): Promise<Recording> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch (err) {
    const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
    throw new MicrophoneError(
      denied
        ? "The microphone is blocked. Allow it for this site in your browser settings, or type your reply."
        : "We couldn't use the microphone. Type your reply instead.",
      denied,
    );
  }
  const type = recordingType();
  const recorder = new MediaRecorder(stream, type ? { mimeType: type, audioBitsPerSecond: 32000 } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(chunks, { type: recorder.mimeType || type || "audio/webm" }));
    };
  });
  const timer = window.setTimeout(onAutoStop, maxSeconds * 1000);
  recorder.start();

  return {
    stop: () => {
      window.clearTimeout(timer);
      if (recorder.state !== "inactive") recorder.stop();
      return stopped;
    },
    cancel: () => {
      window.clearTimeout(timer);
      chunks.length = 0;
      if (recorder.state !== "inactive") recorder.stop();
    },
  };
}
