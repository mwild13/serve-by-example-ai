/**
 * scripts/vapid-keys.mjs
 *
 * Makes the VAPID key pair for shift reminders (lib/web-push.ts). Run it once,
 * yourself, and paste the two values into Cloudflare as secrets. The private
 * key is printed to your terminal only; it is never written to a file.
 *
 *   node scripts/vapid-keys.mjs
 *
 * Cloudflare (Workers & Pages, the project, Settings, Variables and Secrets),
 * Production and Preview, type Secret:
 *   VAPID_PUBLIC_KEY   the first value
 *   VAPID_PRIVATE_JWK  the second value, the whole {...} line
 * Optional, plain text: VAPID_SUBJECT = mailto:info@servebyexample.co
 *
 * Making a new pair later signs everyone out of reminders: their browsers
 * have to allow notifications again.
 */
import { webcrypto } from "node:crypto";

const { publicKey, privateKey } = await webcrypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const raw = new Uint8Array(await webcrypto.subtle.exportKey("raw", publicKey));
const jwk = await webcrypto.subtle.exportKey("jwk", privateKey);
const b64url = (bytes) => Buffer.from(bytes).toString("base64url");

console.log("VAPID_PUBLIC_KEY");
console.log(b64url(raw));
console.log("");
console.log("VAPID_PRIVATE_JWK (secret: paste into Cloudflare, don't share or commit it)");
console.log(JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, d: jwk.d }));
