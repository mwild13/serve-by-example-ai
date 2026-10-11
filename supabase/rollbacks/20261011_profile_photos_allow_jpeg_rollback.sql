-- Rollback for 20261011_profile_photos_allow_jpeg.sql.
-- Existing .jpg photos stay readable; new JPEG saves are refused again.

update storage.buckets
set allowed_mime_types = array['image/webp']
where id = 'profile-photos';
