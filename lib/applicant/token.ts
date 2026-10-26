// The link in an applicant's invite email: /apply/<token>. The token is 32
// random bytes; only its SHA-256 hash is stored (applicant_tests.token_hash),
// so a database read can't be turned back into working links.
// Web Crypto, so it runs the same on Cloudflare Workers and in Vitest.

const TOKEN_BYTES = 32;
/** 32 bytes in base64url, no padding. */
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isApplicantTokenShape(value: unknown): value is string {
  return typeof value === "string" && TOKEN_SHAPE.test(value);
}

export async function hashApplicantToken(token: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
}

/** A new token for an invite, and the hash to store. */
export async function createApplicantToken(): Promise<{ token: string; hash: string }> {
  const token = toBase64Url(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));
  return { token, hash: await hashApplicantToken(token) };
}

export function applicantTestUrl(origin: string, token: string): string {
  return `${origin.replace(/\/+$/, "")}/apply/${token}`;
}
