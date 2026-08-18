-- V4 migration file 08 (AI Profile Photo). Single latest-generated-portrait
-- URL per user — no history/versioning table, since regenerating is a
-- deliberate overwrite (matches the "one active portrait" UX in
-- AiProfilePhotoScreen.tsx). See v4-migration-plan/08-onboarding-diagnostic-and-profile.md.
alter table public.profiles
  add column if not exists profile_photo_url text;
