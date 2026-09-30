-- Backfill missing organizations rows for legacy venue owners, then tighten
-- check_org_seat_limit() to actually enforce a seat cap for everyone else.
--
-- Background: venues/venue_staff predate the organizations/billing model
-- (added in 20260621_organizations_and_billing.sql), so a manager could own
-- a venue and invite staff without ever getting an organizations row. The
-- seat trigger's current behaviour (see phase1_fix_seat_limit_trigger) is
-- "NULL or 0 seat_limit = no limit", which was written to avoid locking out
-- exactly these legacy accounts — but it also means NO manager who lacks an
-- organizations row is ever seat-capped, including a brand-new free-tier
-- account, since server-side tier gating on venue/staff creation doesn't
-- exist yet either (audit 2026-09-30, H3 — still open, a separate fix).
--
-- This migration does two things, in one transaction so there's no window
-- where the tightened trigger runs against an un-backfilled account:
--
-- 1. Creates an organizations row for every venue owner who doesn't have
--    one (3 accounts in production as of 2026-10-01, all pre-existing
--    dev/test accounts on real paid tiers — confirmed live, not guessed).
--    The seat_limit and subscription_tier are taken from each owner's own
--    profiles.tier via the same TIER_SEATS mapping the app already uses
--    (lib/session.ts) — this grants nothing beyond what they're already
--    entitled to. It deliberately does NOT set tier to 'enterprise' and
--    does NOT touch trial_tier/trial_ends_at: enterprise is documented
--    sales-assisted-only (lib/trial.ts TRIAL_ELIGIBLE_TIERS excludes it),
--    and trial_tier is for real time-boxed trials, not permanent grants.
--
-- 2. Flips check_org_seat_limit() so NULL/0 seat_limit means zero allowed
--    seats instead of unlimited. After step 1, no existing account is
--    affected by this — it only changes behaviour for an account that (a)
--    has no organizations row and (b) tries to add an organization_members
--    seat going forward. app/api/management/join-venue/route.ts and
--    memberships/route.ts already surface this exception as a friendly
--    "no free staff seats" message (see the join-venue seat-limit handling
--    added in the 2026-09-30 audit's Phase 1 hotfix).
--
-- Idempotent: organizations.owner_user_id has no unique constraint (see
-- live schema check, 2026-10-01), so step 1 guards with NOT EXISTS instead
-- of ON CONFLICT. Safe to re-run.
--
-- Verified before writing this: no organization_members.manager_id exists
-- without a matching venues.owner_user_id (the venues-based query below is
-- exhaustive, confirmed against organization_members directly).

-- ── 1. Backfill ──────────────────────────────────────────────────────────

INSERT INTO public.organizations (name, owner_user_id, subscription_tier, seat_limit)
SELECT
  COALESCE(NULLIF(trim(p.display_name), ''), NULLIF(split_part(p.email, '@', 1), ''), 'Legacy') || ' Organization',
  v.owner_user_id,
  COALESCE(p.tier, 'free'),
  CASE p.tier
    WHEN 'boutique' THEN 15
    WHEN 'venue_single' THEN 15
    WHEN 'commercial' THEN 35
    WHEN 'venue_multi' THEN 35
    WHEN 'enterprise' THEN 9999
    ELSE 0  -- free / pro / unrecognised — matches TIER_SEATS in lib/session.ts
  END
FROM (SELECT DISTINCT owner_user_id FROM public.venues) v
JOIN public.profiles p ON p.id = v.owner_user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.organizations o WHERE o.owner_user_id = v.owner_user_id
);

-- ── 2. Tighten the trigger ───────────────────────────────────────────────

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
  -- Only enforce when a seat is being newly consumed
  IF NOT (
    (TG_OP = 'INSERT' AND NEW.status IN ('invited', 'active') AND NEW.seat_counted = true)
    OR
    (TG_OP = 'UPDATE'
      AND NEW.status IN ('invited', 'active') AND NEW.seat_counted = true
      AND NOT (COALESCE(OLD.status, '') IN ('invited', 'active') AND OLD.seat_counted = true))
  ) THEN
    RETURN NEW;
  END IF;

  -- Get seat limit from org owned by this manager
  SELECT o.seat_limit INTO v_seat_limit
  FROM public.organizations o
  WHERE o.owner_user_id = NEW.manager_id;

  -- Changed 2026-10-01 (audit follow-up): a missing or zero seat_limit used
  -- to mean "no limit" — now it means zero allowed seats. Every account
  -- that legitimately needs seats has an organizations row after step 1
  -- above; anyone else genuinely has none.
  IF v_seat_limit IS NULL OR v_seat_limit = 0 THEN
    RAISE EXCEPTION 'Seat limit reached. Upgrade your venue plan to add more staff.';
  END IF;

  -- Count active/invited seat-counted members under this manager
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
