// Signed one-click unsubscribe links for the digest and reminder emails.
// The Spam Act needs an unsubscribe that works without signing in, so the
// link carries the user id and an HMAC of it; nothing else is trusted.
// Web Crypto, so it runs the same on Cloudflare Workers and in Vitest.

/** The two flags, named as the notifications route and Settings name them. */
export type UnsubscribeKind = "digest" | "reminders";

export function isUnsubscribeKind(value: unknown): value is UnsubscribeKind {
  return value === "digest" || value === "reminders";
}

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

/** Compares two strings in time that does not depend on where they differ. */
export function safeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export function unsubscribeToken(secret: string, userId: string, kind: UnsubscribeKind): Promise<string> {
  return hmac(secret, `unsubscribe:${kind}:${userId}`);
}

export async function verifyUnsubscribeToken(
  secret: string,
  userId: string,
  kind: UnsubscribeKind,
  token: string,
): Promise<boolean> {
  if (!token) return false;
  return safeEqual(await unsubscribeToken(secret, userId, kind), token);
}

/** The page a person lands on from the email, where they confirm. */
export function unsubscribePageUrl(origin: string, userId: string, kind: UnsubscribeKind, token: string): string {
  const params = new URLSearchParams({ u: userId, k: kind, t: token });
  return `${origin}/notifications/unsubscribe?${params.toString()}`;
}

/** The endpoint mail apps post to for one-click unsubscribe (RFC 8058). */
export function unsubscribeApiUrl(origin: string, userId: string, kind: UnsubscribeKind, token: string): string {
  const params = new URLSearchParams({ u: userId, k: kind, t: token });
  return `${origin}/api/notifications/unsubscribe?${params.toString()}`;
}
