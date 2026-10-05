-- Admin edit drawer lets an admin override an animation's manifest description.
alter table public.animation_meta
  add column description_override text;
