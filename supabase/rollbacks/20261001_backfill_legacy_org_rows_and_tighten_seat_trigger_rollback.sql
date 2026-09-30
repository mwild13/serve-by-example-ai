-- ROLLBACK for supabase/migrations/20261001_backfill_legacy_org_rows_and_tighten_seat_trigger.sql
--
-- Restores check_org_seat_limit() to treating NULL/0 seat_limit as
-- unlimited (its behaviour before 2026-10-01). For emergency use: this
-- re-opens the "any manager without an organizations row is unseat-capped"
-- gap the migration closed.
--
-- The 3 backfilled organizations rows are NOT removed by this rollback —
-- they only grant each owner the seat_limit their own real profiles.tier
-- already entitles them to (see the migration's comments), so leaving them
-- in place is harmless either way and avoids re-breaking anything that came
-- to depend on their presence. If you specifically need them gone, the
-- affected owner_user_id values (captured 2026-10-01, before the backfill)
-- are:
--   105829b5-e1ad-47d4-b79e-b4033db349b0
--   4b10e8d7-611b-47df-af08-53eb75fe82e6
--   8e0d40ef-bc58-437e-8f40-a9da391c5ba0
-- e.g. DELETE FROM public.organizations WHERE owner_user_id IN (...) —
-- only if you're certain nothing else has since come to rely on them.

CREATE OR REPLACE FUNCTION public.check_org_seat_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_seat_limit   INTEGER;
  v_active_count INTEGER;
BEGIN
  IF NOT (
    (TG_OP = 'INSERT' AND NEW.status IN ('invited', 'active') AND NEW.seat_counted = true)
    OR
    (TG_OP = 'UPDATE'
      AND NEW.status IN ('invited', 'active') AND NEW.seat_counted = true
      AND NOT (COALESCE(OLD.status, '') IN ('invited', 'active') AND OLD.seat_counted = true))
  ) THEN
    RETURN NEW;
  END IF;

  SELECT o.seat_limit INTO v_seat_limit
  FROM public.organizations o
  WHERE o.owner_user_id = NEW.manager_id;

  IF v_seat_limit IS NULL OR v_seat_limit = 0 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_active_count
  FROM public.organization_members om
  WHERE om.manager_id = NEW.manager_id
    AND om.status IN ('invited', 'active')
    AND om.seat_counted = true;

  IF v_active_count >= v_seat_limit THEN
    RAISE EXCEPTION 'Seat limit reached. Upgrade your venue plan to add more staff.';
  END IF;

  RETURN NEW;
END;
$function$;
