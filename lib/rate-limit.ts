// In-memory rate limiter for Cloudflare Workers / Edge runtime.
// WARNING: On edge networks with multiple nodes, each node has its own Map.
// For authenticated endpoints, use user-based keys (e.g. ${userId}:${route})
// to prevent IP-rotation attacks. This works because the same user will
// likely hit the same edge node for their session.

const buckets = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key   Unique key (e.g. ${userId}:${route} for auth, or ${ip}:${route} for public)
 * @param limit Max requests per window
 * @param windowMs Window duration in ms (default 60 000 = 1 minute)
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  cleanup();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count < limit) {
    bucket.count++;
    return true;
  }

  return false;
}

/** Extract a client IP from a request (works on Cloudflare + Vercel + generic). */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Generate a rate-limit key for authenticated endpoints.
 * Uses ${userId}:${route} to prevent IP-rotation attacks on edge networks.
 * @param userId User ID from auth token
 * @param route The API route or endpoint identifier
 */
export function getAuthenticatedRateLimitKey(userId: string, route: string): string {
  return `${userId}:${route}`;
}

/**
 * Generate a rate-limit key for public endpoints.
 * Uses ${ip}:${route} for basic DDoS protection.
 * @param ip Client IP address
 * @param route The API route or endpoint identifier
 */
export function getPublicRateLimitKey(ip: string, route: string): string {
  return `${ip}:${route}`;
}
