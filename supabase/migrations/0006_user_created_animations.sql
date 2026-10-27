-- Allow authenticated users to create and manage their own animations
-- Admin-created animations are visible to everyone; user-created animations are only visible to their creator (and admins).

drop policy if exists "animation_meta_admin_write" on public.animation_meta;
drop policy if exists "animation_meta_insert_authenticated" on public.animation_meta;
drop policy if exists "animation_meta_update_own_or_admin" on public.animation_meta;
drop policy if exists "animation_meta_delete_own_or_admin" on public.animation_meta;

create policy "animation_meta_insert_authenticated"
  on public.animation_meta for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or updated_by = auth.uid()
  );

create policy "animation_meta_update_own_or_admin"
  on public.animation_meta for update
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or updated_by = auth.uid()
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or updated_by = auth.uid()
  );

create policy "animation_meta_delete_own_or_admin"
  on public.animation_meta for delete
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or updated_by = auth.uid()
  );

-- Storage thumbnails policy: allow authenticated users to upload their wallpapers/thumbnails
drop policy if exists "thumbnails_admin_write" on storage.objects;
drop policy if exists "thumbnails_authenticated_write" on storage.objects;
create policy "thumbnails_authenticated_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'thumbnails');

drop policy if exists "thumbnails_admin_update" on storage.objects;
drop policy if exists "thumbnails_authenticated_update" on storage.objects;
create policy "thumbnails_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'thumbnails');

drop policy if exists "thumbnails_admin_delete" on storage.objects;
drop policy if exists "thumbnails_authenticated_delete" on storage.objects;
create policy "thumbnails_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'thumbnails'
    and (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      or owner = auth.uid()
    )
  );
