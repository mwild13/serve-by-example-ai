// toolkit_leads ids travel in email links (/api/toolkit-open, /api/unsubscribe).
// Validate the shape before it reaches a query so junk ids never hit the DB.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLeadId(value: string): boolean {
  return UUID_RE.test(value);
}
