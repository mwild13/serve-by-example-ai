-- Rotate any venue codes outside the 4-digit range (1000–9999) to a new
-- random 4-digit value. Sequential codes assigned before this migration
-- (e.g. 120, 121, 122…) are replaced here. Codes already in range are
-- left untouched.
--
-- Run this once in the Supabase SQL Editor. Safe to re-run: WHERE clause
-- limits updates to codes that need changing.

UPDATE venues
SET venue_code = (1000 + floor(random() * 9000))::integer
WHERE venue_code IS NOT NULL
  AND (venue_code < 1000 OR venue_code > 9999);
