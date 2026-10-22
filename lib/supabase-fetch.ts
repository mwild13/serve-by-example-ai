// The fetch the server-side Supabase clients use. Supabase is reached over
// HTTPS, one request per query, so there is no pooled connection to drop;
// what does happen is a request failing on the network or Supabase's gateway
// answering 502/503/504 for a moment. A read (GET or HEAD: selects and
// auth.getUser) is tried again twice, after a short pause. Anything else
// (inserts, updates, deletes and rpc calls, all POST/PATCH/DELETE) is sent
// once: repeating a write that did land would apply it twice.

const RETRY_STATUSES = new Set([502, 503, 504]);
const PAUSES_MS = [150, 400];

function methodOf(input: RequestInfo | URL, init?: RequestInit): string {
  return (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
}

function pathOf(input: RequestInfo | URL): string {
  try {
    // Path only: the query string carries ids and filters.
    return new URL(input instanceof Request ? input.url : input.toString()).pathname;
  } catch {
    return "unknown";
  }
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = methodOf(input, init);
  if (method !== "GET" && method !== "HEAD") return fetch(input, init);

  for (let attempt = 0; ; attempt++) {
    const last = attempt >= PAUSES_MS.length;
    try {
      const res = await fetch(input, init);
      if (last || !RETRY_STATUSES.has(res.status)) return res;
      console.warn(JSON.stringify({ event: "supabase_read_retry", path: pathOf(input), status: res.status, attempt: attempt + 1 }));
    } catch (error) {
      // A cancelled request stays cancelled.
      if (last || init?.signal?.aborted) throw error;
      console.warn(JSON.stringify({ event: "supabase_read_retry", path: pathOf(input), error: error instanceof Error ? error.message : String(error), attempt: attempt + 1 }));
    }
    await pause(PAUSES_MS[attempt]);
  }
}
