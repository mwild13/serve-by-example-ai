-- Profile Photos storage bucket — replaces the face-swap pipeline's static
-- base-plate URLs (public/mobile/{men,women}/ai-style-*.png, deleted) and
-- fal.media result URLs with an actual per-user uploaded file. Public
-- bucket: matches the old feature's behaviour (a staff avatar, not
-- sensitive) and avoids signed-URL refresh complexity for no real privacy
-- benefit. See app/api/profile-photo/save/route.ts for the only writer
-- (server-side, via the service-role admin client, which bypasses RLS —
-- these policies are defense-in-depth only, in case a client-side Storage
-- call is ever added later).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

create policy "profile_photos_own_folder_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "profile_photos_own_folder_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
