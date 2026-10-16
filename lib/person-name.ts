// Names typed all in lower case ("richie smith") read as a mistake on a
// greeting or a roster. Fixed where a name is saved and where one is shown.

/**
 * Capitalises each word of a name typed all in lower case: "richie smith"
 * becomes "Richie Smith", "o'brien" becomes "O'Brien". A name with any
 * capital in it is left as typed, so "McDonald" and "de Silva" survive.
 */
export function formatPersonName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed !== trimmed.toLowerCase()) return trimmed;
  return trimmed.replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}

/**
 * A readable name from an email address, for accounts with no name yet:
 * "richie.smith@x.com" becomes "Richie Smith". Digits are dropped, so
 * "richie91@x.com" becomes "Richie". Returns "" when nothing usable is left.
 */
export function nameFromEmail(email: string | null | undefined): string {
  const local = email?.split("@")[0] ?? "";
  const words = local.replace(/\d+/g, " ").split(/[._+\s-]+/).filter(Boolean);
  return words.length ? formatPersonName(words.join(" ").toLowerCase()) : "";
}
