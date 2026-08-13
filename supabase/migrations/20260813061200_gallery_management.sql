-- Public gallery assets are readable by the website, while every write is
-- restricted to an active administrator through private.is_admin().
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists gallery_assets_public_read on storage.objects;
create policy gallery_assets_public_read
on storage.objects for select
to anon, authenticated
using (bucket_id = 'gallery');

drop policy if exists gallery_assets_admin_insert on storage.objects;
create policy gallery_assets_admin_insert
on storage.objects for insert
to authenticated
with check (bucket_id = 'gallery' and (select private.is_admin()));

drop policy if exists gallery_assets_admin_update on storage.objects;
create policy gallery_assets_admin_update
on storage.objects for update
to authenticated
using (bucket_id = 'gallery' and (select private.is_admin()))
with check (bucket_id = 'gallery' and (select private.is_admin()));

drop policy if exists gallery_assets_admin_delete on storage.objects;
create policy gallery_assets_admin_delete
on storage.objects for delete
to authenticated
using (bucket_id = 'gallery' and (select private.is_admin()));

-- Move the existing, non-repeating website gallery into the managed catalog.
-- Relative asset paths are resolved against the GitHub Pages base path by the app.
with gallery_seed (title, category, image_url, description, display_order) as (
  values
    ('The complete resort', 'resort-views', 'resort/resort-wide.webp', 'Pool, lawns and stays surrounded by farmland.', 10),
    ('Across the fields', 'resort-views', 'resort/aerial.webp', 'A wide countryside view around DS Agro Tourism & Resort.', 20),
    ('Country approach', 'resort-views', 'resort/country-aerial.webp', 'The resort and its road connection through the fields.', 30),
    ('Farm landscape', 'resort-views', 'resort/farm-fields.webp', 'A top-down view of the agricultural setting.', 40),
    ('Resort from above', 'resort-views', 'resort/resort-aerial-two.webp', 'The complete property framed by green fields.', 50),
    ('A wider perspective', 'resort-views', 'resort/resort-aerial-three.webp', 'Another distinct aerial angle across the resort grounds.', 60),
    ('Deluxe room', 'rooms-stays', 'resort/deluxe-room.webp', 'A comfortable room prepared for a relaxed stay.', 110),
    ('Premium room', 'rooms-stays', 'resort/premium-room.webp', 'King-size comfort with a spacious layout.', 120),
    ('Premium room view', 'rooms-stays', 'resort/premium-room-alt.webp', 'A second, distinct view of the premium accommodation.', 130),
    ('Bright bedroom', 'rooms-stays', 'resort/room-white.webp', 'A clean bedroom with natural light.', 140),
    ('Bedroom entrance', 'rooms-stays', 'resort/room-white-alt.webp', 'A different angle into the bright room.', 150),
    ('Suite living space', 'rooms-stays', 'resort/suite-living.webp', 'Extra seating and room for families to settle in.', 160),
    ('Dormitory', 'rooms-stays', 'resort/dormitory.webp', 'Group accommodation for guests travelling together.', 170),
    ('Dormitory wide view', 'rooms-stays', 'resort/dormitory-wide.webp', 'A complete view of the larger group room.', 180),
    ('Dormitory lounge', 'rooms-stays', 'resort/dormitory-lounge.webp', 'Beds and seating within the shared accommodation.', 190),
    ('2 BHK villa', 'rooms-stays', 'resort/villa-exterior.webp', 'The private villa surrounded by greenery.', 200),
    ('Villa living', 'rooms-stays', 'resort/villa-living.webp', 'A bright shared room inside the villa.', 210),
    ('Attached facilities', 'rooms-stays', 'resort/bathroom.webp', 'Clean facilities within the accommodation.', 220),
    ('Indoor lounge', 'rooms-stays', 'resort/lounge.webp', 'A quiet sitting corner for conversation.', 230),
    ('Horse riding', 'activities-outdoors', 'resort/horse-riding.webp', 'A real riding moment at the resort.', 310),
    ('Horse arena', 'activities-outdoors', 'resort/horse-arena-aerial.webp', 'The complete riding arena from above.', 320),
    ('On the track', 'activities-outdoors', 'resort/horse-track.webp', 'The horse moving through the outdoor arena.', 330),
    ('Training moment', 'activities-outdoors', 'resort/horse-action.webp', 'A supervised activity moment inside the arena.', 340),
    ('Meet the horse', 'activities-outdoors', 'resort/horse-portrait.webp', 'A closer look at the resort''s horse-riding experience.', 350),
    ('Turf and play zone', 'activities-outdoors', 'resort/turf-close.webp', 'The sports turf surrounded by resort greenery.', 360),
    ('Turf from above', 'activities-outdoors', 'resort/turf-top.webp', 'A clear top-down view of the full play area.', 370),
    ('Pool and lawn', 'amenities-spaces', 'resort/pool-lawn.webp', 'Open green space next to the pool and stay areas.', 410),
    ('Outdoor facilities', 'amenities-spaces', 'resort/turf-aerial.webp', 'The turf and activity zone within the resort.', 420),
    ('Dining corner', 'amenities-spaces', 'resort/dining-area.webp', 'A simple shared table for meals and conversation.', 430),
    ('Garden-side villa', 'amenities-spaces', 'resort/villa-garden-exterior.webp', 'Accommodation opening into the resort greenery.', 440)
)
insert into public.gallery (
  title,
  category,
  image_url,
  media_type,
  description,
  featured,
  display_order,
  status
)
select
  seed.title,
  seed.category,
  seed.image_url,
  'image',
  seed.description,
  false,
  seed.display_order,
  'Published'
from gallery_seed seed
where not exists (
  select 1 from public.gallery existing where existing.image_url = seed.image_url
);
