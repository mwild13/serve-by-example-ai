-- Let the profile-photos bucket accept JPEG as well as WebP.
--
-- iOS browsers cannot encode WebP from a canvas, so the app now saves a JPEG
-- there (app/api/profile-photo/save/route.ts). The bucket only allowed
-- image/webp, so every iPhone save failed with "Failed to save your photo".
-- Safe to run more than once.

update storage.buckets
set allowed_mime_types = array['image/webp', 'image/jpeg']
where id = 'profile-photos';
