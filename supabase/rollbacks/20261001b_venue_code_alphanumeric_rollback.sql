-- ROLLBACK for supabase/migrations/20261001b_venue_code_alphanumeric.sql
--
-- Only works while every venue still has a numeric code. Once any venue has
-- a letter code, the type change below fails (deliberately, rather than
-- silently destroying codes staff are using). Revert the app code first.

ALTER TABLE public.venues DROP CONSTRAINT IF EXISTS venues_venue_code_format;

ALTER TABLE public.venues ALTER COLUMN venue_code TYPE integer USING venue_code::integer;

ALTER TABLE public.venues ALTER COLUMN venue_code SET DEFAULT nextval('venue_code_seq'::regclass);
