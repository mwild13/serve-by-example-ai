-- 6-character alphanumeric staff join codes (audit 2026-09-30, H2).
--
-- venue_code was an integer (4 digits, 9,000 possibilities, guessable).
-- New venues now get 6 characters from ABCDEFGHJKMNPQRSTUVWXYZ23456789
-- (no 0/O, 1/I/L), about 887M possibilities, generated in lib/venue-code.ts.
-- Existing 4-digit codes are kept as-is ('4821' stays '4821'), so codes
-- already handed to staff keep working.
--
-- APPLY THIS BEFORE deploying the app code that generates letter codes:
-- inserting 'K7P3QX' into the old integer column fails. The current
-- production code keeps working against the text column (it inserts and
-- looks up 4-digit numbers, which PostgREST compares as text).
--
-- The sequential default (nextval('venue_code_seq')) is dropped: sequential
-- codes are trivially guessable, and the app always supplies a code.
-- The unique index venues_venue_code_key is rebuilt by the type change.
--
-- Rollback: supabase/rollbacks/20261001b_venue_code_alphanumeric_rollback.sql

ALTER TABLE public.venues ALTER COLUMN venue_code DROP DEFAULT;

ALTER TABLE public.venues ALTER COLUMN venue_code TYPE text USING venue_code::text;

ALTER TABLE public.venues ADD CONSTRAINT venues_venue_code_format
  CHECK (venue_code ~ '^([0-9]{4}|[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6})$');

-- Verification (expect: data_type text, column_default null, 0 bad codes):
--   SELECT data_type, column_default FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='venues' AND column_name='venue_code';
--   SELECT count(*) FROM public.venues
--   WHERE venue_code !~ '^([0-9]{4}|[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6})$';
