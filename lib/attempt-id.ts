/**
 * Client-side idempotency keys for graded submissions (/api/evaluate,
 * /api/arena/evaluate). The server records each attempt id once, so:
 *   - resubmitting the same thing after a failure reuses the id, and a
 *     request that did land but lost its response isn't counted twice
 *   - after a successful submit the next one gets a new id
 * See record_attempt() in supabase/migrations/20261002_atomic_attempts_and_verify_quiz.sql.
 */
export type AttemptIdKeeper = {
  /** The id for this submission; `key` identifies what's being submitted. */
  idFor(key: string): string;
  /** Call once a submission has succeeded. */
  settle(): void;
};

export function createAttemptIdKeeper(newId: () => string = () => crypto.randomUUID()): AttemptIdKeeper {
  let current: { key: string; id: string } | null = null;
  return {
    idFor(key) {
      if (!current || current.key !== key) current = { key, id: newId() };
      return current.id;
    },
    settle() {
      current = null;
    },
  };
}
