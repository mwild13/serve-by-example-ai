// Priority-3 offline resilience (2026-08-22) — a small localStorage retry
// queue, scoped to exactly one write path: POST /api/training/challenges/save.
//
// Why only this endpoint: v4-migration-plan/10-error-handling-offline-
// resilience.md originally specced both training/save and challenges/save as
// "safe to replay upserts." Direct verification of the actual write logic
// before building this showed that's only true for challenges/save (a pure
// upsert on `(user_id, challenge_index)` — replaying it is a harmless no-op).
// training/save's recordAttempt() (lib/mastery.ts) is a read-then-accumulate
// write (total_attempts + 1, cumulative Elo, streak increments) — a blind
// retry of an ambiguous failure (server actually processed it, client just
// didn't see the response) would double-count the attempt. training/save
// intentionally keeps its existing direct try/catch-with-retry-button UX
// instead (ScenarioPracticeScreen.tsx, QuizScreen.tsx) — no queue for it.
//
// Storage key follows the house "sbe-" hyphenated convention (lib/streak.ts,
// AiProfilePhotoScreen.tsx's draft key) — not the one legacy underscore
// exception ("sbe_challenges_completed", a deliberate V3-parity key name,
// not the style to copy).

const QUEUE_KEY = "sbe-retry-queue";
const MAX_QUEUE_LENGTH = 50; // defensive cap — in practice never exceeds 5 (one per challengeIndex)

type QueuedRequest = {
  url: string;
  body: { challengeIndex: number };
  timestamp: number;
};

function readQueue(): QueuedRequest[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? (JSON.parse(stored) as QueuedRequest[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedRequest[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* ignore — quota exceeded or private-browsing storage denial, same
       best-effort tolerance as every other localStorage write in app/mobile */
  }
}

/** Call from a failed challenges/save request's catch/non-ok branch. */
export function enqueueRetry(body: { challengeIndex: number }): void {
  const queue = readQueue();
  queue.push({ url: "/api/training/challenges/save", body, timestamp: Date.now() });
  writeQueue(queue.length > MAX_QUEUE_LENGTH ? queue.slice(queue.length - MAX_QUEUE_LENGTH) : queue);
}

/**
 * Attempts to flush every queued request. Removes only the ones that
 * succeed (2xx); anything that fails again (still offline, still rate
 * limited, etc.) stays queued for the next flush attempt. Returns the
 * number of requests still pending after this attempt, for
 * MobileSessionProvider to surface as `pendingSyncCount`.
 */
export async function flushRetryQueue(token: string): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  const results = await Promise.allSettled(
    queue.map((item) =>
      fetch(item.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(item.body),
      }).then((res) => {
        if (!res.ok) throw new Error(`Retry failed (${res.status})`);
      }),
    ),
  );

  const stillPending = queue.filter((_, i) => results[i].status === "rejected");
  writeQueue(stillPending);
  return stillPending.length;
}

/** Read-only peek at how many requests are currently queued, for initial UI state. */
export function getPendingCount(): number {
  return readQueue().length;
}
