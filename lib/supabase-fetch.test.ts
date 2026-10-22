import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabaseFetch } from "@/lib/supabase-fetch";

const URL_ = "https://project.supabase.co/rest/v1/profiles?id=eq.1";
let calls = 0;

function stubFetch(...outcomes: Array<number | Error>) {
  calls = 0;
  vi.stubGlobal("fetch", async () => {
    const outcome = outcomes[Math.min(calls++, outcomes.length - 1)];
    if (outcome instanceof Error) throw outcome;
    return new Response(null, { status: outcome });
  });
}

// Runs the call while letting the retry pauses pass instantly.
async function run(init?: RequestInit) {
  const pending = supabaseFetch(URL_, init);
  pending.catch(() => undefined);
  await vi.runAllTimersAsync();
  return pending;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("supabaseFetch", () => {
  it("tries a read again after a gateway error and returns the good answer", async () => {
    stubFetch(503, 502, 200);
    expect((await run()).status).toBe(200);
    expect(calls).toBe(3);
  });

  it("tries a read again after a network failure", async () => {
    stubFetch(new TypeError("fetch failed"), 200);
    expect((await run({ method: "GET" })).status).toBe(200);
    expect(calls).toBe(2);
  });

  it("gives up after three tries and passes the last answer or error on", async () => {
    stubFetch(503);
    expect((await run()).status).toBe(503);
    expect(calls).toBe(3);

    stubFetch(new TypeError("fetch failed"));
    await expect(run()).rejects.toThrow("fetch failed");
    expect(calls).toBe(3);
  });

  it.each(["POST", "PATCH", "DELETE"])("sends a %s once, even when it fails", async (method) => {
    stubFetch(503, 200);
    expect((await run({ method })).status).toBe(503);
    expect(calls).toBe(1);

    stubFetch(new TypeError("fetch failed"), 200);
    await expect(run({ method })).rejects.toThrow("fetch failed");
    expect(calls).toBe(1);
  });

  it("does not retry answers that won't change on a second try", async () => {
    for (const status of [400, 401, 404, 500]) {
      stubFetch(status, 200);
      expect((await run()).status).toBe(status);
      expect(calls).toBe(1);
    }
  });

  it("does not retry a request that was cancelled", async () => {
    const controller = new AbortController();
    controller.abort();
    stubFetch(new DOMException("aborted", "AbortError"), 200);
    await expect(run({ signal: controller.signal })).rejects.toThrow("aborted");
    expect(calls).toBe(1);
  });
});
