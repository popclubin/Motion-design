-- Motion Library: profiles, animation metadata, categories, RLS, storage.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can update their own profile but never their own role; only a
-- service-role migration/admin tool (which bypasses RLS) can change role.
create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role <> old.role and auth.uid() = old.id then
    raise exception 'Cannot change your own role.';
  end if;
  return new;
end;
$$;

create trigger profiles_block_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- Insert a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  slug text primary key,
  name text not null,
  sort_order int not null default 0
);

alter table public.categories enable row level security;

create policy "categories_select_authenticated"
  on public.categories for select
  to authenticated
  using (true);

create policy "categories_admin_write"
  on public.categories for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- animation_meta
-- ---------------------------------------------------------------------------
create table public.animation_meta (
  slug text primary key,
  display_name text not null,
  category text references public.categories (slug),
  sort_order int not null default 0,
  thumbnail_video_path text,
  poster_path text,
  is_new boolean not null default false,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

alter table public.animation_meta enable row level security;

create policy "animation_meta_select_published"
  on public.animation_meta for select
  to authenticated
  using (is_published or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "animation_meta_admin_write"
  on public.animation_meta for all
  to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- storage: "thumbnails" bucket — public read, admin-only write
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'thumbnails',
  'thumbnails',
  true,
  8388608, -- 8 MB
  null
)
on conflict (id) do nothing;

create policy "thumbnails_public_read"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "thumbnails_admin_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'thumbnails'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "thumbnails_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'thumbnails'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "thumbnails_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'thumbnails'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
