-- Challenges go from 5 to 10 (lib/challenges.ts, lib/challenge-content.ts).
-- The original table capped challenge_index at 4 with an unnamed CHECK, so
-- this drops whatever check sits on that column and adds one for 0 to 9.
-- Safe to run more than once.

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
    WHERE con.conrelid = 'public.user_challenges'::regclass
      AND con.contype = 'c'
      AND att.attname = 'challenge_index'
  LOOP
    EXECUTE format('ALTER TABLE public.user_challenges DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.user_challenges
  ADD CONSTRAINT user_challenges_challenge_index_check CHECK (challenge_index >= 0 AND challenge_index <= 9);

COMMENT ON COLUMN public.user_challenges.challenge_index IS 'Index into CHALLENGE_LIST in lib/challenge-content.ts (0 to 9)';
