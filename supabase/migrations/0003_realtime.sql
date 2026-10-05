-- Let clients subscribe to live changes so admin edits (publish, thumbnails,
-- categories) show up on the user side instantly, without a refetch/poll.
alter publication supabase_realtime add table public.animation_meta;
alter publication supabase_realtime add table public.categories;
