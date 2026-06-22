-- ============================================================
-- Step 2: DB-level seat limit enforcement
-- Fires BEFORE INSERT OR UPDATE on organization_members.
-- Only checks when a row enters active/invited from a non-active state,
-- so role changes and other edits on already-active rows are never blocked.
-- seat_limit = 0 means unlimited (enterprise custom plans).
-- ============================================================

CREATE OR REPLACE FUNCTION check_org_seat_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_seat_limit   INTEGER;
  v_active_count INTEGER;
BEGIN
  -- Skip the check unless a seat is actually being consumed:
  --   INSERT with active/invited, OR UPDATE transitioning INTO active/invited
  --   from a non-active state (blocks reactivation bypass, not role edits).
  IF NOT (
    (TG_OP = 'INSERT' AND NEW.status IN ('invited', 'active'))
    OR
    (TG_OP = 'UPDATE' AND NEW.status IN ('invited', 'active')
      AND COALESCE(OLD.status, '') NOT IN ('invited', 'active'))
  ) THEN
    RETURN NEW;
  END IF;

  SELECT seat_limit INTO v_seat_limit
  FROM organizations
  WHERE id = NEW.org_id;

  IF v_seat_limit IS NULL OR v_seat_limit = 0 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_active_count
  FROM organization_members
  WHERE org_id = NEW.org_id
    AND status IN ('invited', 'active');

  IF v_active_count >= v_seat_limit THEN
    RAISE EXCEPTION 'Seat limit reached. Upgrade your venue plan to add more staff.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_org_seat_limit ON organization_members;
CREATE TRIGGER enforce_org_seat_limit
  BEFORE INSERT OR UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION check_org_seat_limit();
