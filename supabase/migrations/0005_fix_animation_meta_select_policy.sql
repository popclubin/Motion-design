-- Fix animation_meta select policy so all users can read metadata (including is_published = false)
-- This allows the client catalog to know which bundled animations are unpublished.

drop policy if exists "animation_meta_select_published" on public.animation_meta;
drop policy if exists "animation_meta_select_all" on public.animation_meta;

create policy "animation_meta_select_all"
  on public.animation_meta for select
  to authenticated
  using (true);
