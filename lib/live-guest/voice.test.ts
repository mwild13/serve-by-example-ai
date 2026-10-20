import { describe, expect, it } from "vitest";
import { GUEST_BRIEFS, findGuest } from "./guests";
import { guestPronouns, recordingExtension, speechInstructions, transcriptionPrompt, voiceFor } from "./voice";

const VOICES = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse", "marin", "cedar"];

describe("recordings", () => {
  it("accept what browsers record, codecs and all, and nothing else", () => {
    expect(recordingExtension("audio/webm;codecs=opus")).toBe("webm");
    expect(recordingExtension("audio/mp4")).toBe("mp4");
    expect(recordingExtension("Audio/Ogg; codecs=opus")).toBe("ogg");
    expect(recordingExtension("video/mp4")).toBeNull();
    expect(recordingExtension("")).toBeNull();
  });

  it("hint the transcriber with Australian bar words and the guest's last line, kept short", () => {
    const prompt = transcriptionPrompt("Can I get a schooner?" + "x".repeat(1000));
    expect(prompt).toContain("Australian English");
    expect(prompt).toContain("schooner, middy");
    expect(prompt.length).toBeLessThan(800);
  });
});

describe("guest voices", () => {
  it("give every guest one of OpenAI's voices, the same one every time", () => {
    for (const g of GUEST_BRIEFS) {
      expect(VOICES, g.id).toContain(voiceFor(g));
      expect(voiceFor(g)).toBe(voiceFor(g));
    }
  });

  it("read the guest's pronouns from the brief", () => {
    expect(guestPronouns(findGuest("flat-schooner")!)).toBe("he");
    expect(guestPronouns(findGuest("shouted-coffee")!)).toBe("she");
    expect(guestPronouns(GUEST_BRIEFS.find((g) => g.id === "blind-corridor")!)).toBe("they");
  });

  it("vary the voices across the guests", () => {
    expect(new Set(GUEST_BRIEFS.map(voiceFor)).size).toBeGreaterThanOrEqual(6);
  });

  it("are told the accent and the mood", () => {
    const linh = findGuest("shouted-coffee")!;
    const text = speechInstructions(linh, 2);
    expect(text).toContain("Australian accent");
    expect(text).toContain("annoyed");
    expect(text).toContain(linh.who);
    expect(speechInstructions(linh, 5)).toContain("delighted");
  });
});
