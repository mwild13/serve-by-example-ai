-- AI Portrait — durable 2-per-day generation cap. lib/rate-limit.ts is an
-- in-memory map per Cloudflare edge node (resets on deploy/node rotation),
-- fine as a burst-abuse throttle but not a hard per-user daily guarantee —
-- see app/api/profile-photo/generate/route.ts for the enforcement logic.
-- profile_photo_generations_reset_at tracks the UTC calendar day the count
-- last applied to; the route compares it against "today" on each request
-- rather than relying on a cron job to zero the counter.
alter table public.profiles
  add column if not exists profile_photo_generations_today int not null default 0,
  add column if not exists profile_photo_generations_reset_at timestamptz;
