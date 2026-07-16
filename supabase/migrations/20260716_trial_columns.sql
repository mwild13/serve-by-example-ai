-- Trial subscription state lives on the organization (the business entity).
-- A trial is a B2B subscription — it belongs to the venue, not the individual manager.
-- Staff access resolves via venue_memberships → org_id, so placing trial state here
-- allows resolveAccess to check trial status in a single join for both managers and staff.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS trial_tier         TEXT        NULL,
  ADD COLUMN IF NOT EXISTS trial_started_at   TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS trial_ends_at      TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS trial_converted    BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_activated_at TIMESTAMPTZ NULL;

-- UI dismissal state is per-user: only the responsible manager sees the grace-period modal.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_grace_modal_shown BOOLEAN NOT NULL DEFAULT FALSE;
