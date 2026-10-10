// Staff join codes. New venues get 6 characters from an alphabet without
// look-alikes (no 0/O, 1/I/L): 31^6 ≈ 887M codes, against 9,000 for the old
// 4-digit codes, which existing venues keep. Shared by the server (generate,
// look up) and the join forms (validate before submitting). Format is also
// enforced by the venues_venue_code_format CHECK constraint.

export const VENUE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const VENUE_CODE_LENGTH = 6;

const NEW_CODE = new RegExp(`^[${VENUE_CODE_ALPHABET}]{${VENUE_CODE_LENGTH}}$`);
const LEGACY_CODE = /^[0-9]{4}$/;

export function generateVenueCode(): string {
  // Rejection sampling keeps every character equally likely.
  const limit = 256 - (256 % VENUE_CODE_ALPHABET.length);
  let code = "";
  while (code.length < VENUE_CODE_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    for (const b of bytes) {
      if (b < limit && code.length < VENUE_CODE_LENGTH) code += VENUE_CODE_ALPHABET[b % VENUE_CODE_ALPHABET.length];
    }
  }
  return code;
}

/** Canonical form of a typed or linked code, or null if it can't be a valid code. */
export function normalizeVenueCode(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const code = String(raw).toUpperCase().replace(/[\s-]/g, "");
  return NEW_CODE.test(code) || LEGACY_CODE.test(code) ? code : null;
}
