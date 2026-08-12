create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'admin' check (role in ('admin', 'manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  room_type text not null,
  short_description text,
  description text,
  total_units integer not null check (total_units >= 0),
  capacity_adults integer check (capacity_adults is null or capacity_adults >= 0),
  capacity_children integer check (capacity_children is null or capacity_children >= 0),
  max_guests integer check (max_guests is null or max_guests > 0),
  bed_type text,
  room_size text,
  base_price numeric(12,2) check (base_price is null or base_price >= 0),
  weekend_price numeric(12,2) check (weekend_price is null or weekend_price >= 0),
  extra_person_price numeric(12,2) check (extra_person_price is null or extra_person_price >= 0),
  status text not null default 'Active' check (status in ('Active', 'Inactive', 'Maintenance', 'Coming Soon')),
  featured boolean not null default false,
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  image_url text not null,
  alt_text text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (room_id, image_url)
);

create table public.room_amenities (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  amenity_name text not null,
  icon text,
  created_at timestamptz not null default now(),
  unique (room_id, amenity_name)
);

create table public.room_blocks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  blocked_units integer not null check (blocked_units > 0),
  reason text not null check (reason in ('Maintenance', 'Owner Use', 'Renovation', 'Cleaning', 'Private Event', 'Operational Issue', 'Manual Block')),
  notes text,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  request_token uuid not null unique,
  booking_reference text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  whatsapp_number text,
  city text,
  visit_type text not null,
  check_in date not null,
  check_out date not null,
  adults integer not null default 1 check (adults > 0),
  children integer not null default 0 check (children >= 0),
  infants integer not null default 0 check (infants >= 0),
  total_guests integer not null check (total_guests > 0),
  room_id uuid references public.rooms(id) on delete set null,
  room_name_snapshot text,
  rooms_requested integer not null default 1 check (rooms_requested > 0),
  occasion text,
  interests text[] not null default '{}',
  special_request text,
  estimated_amount numeric(12,2) check (estimated_amount is null or estimated_amount >= 0),
  booking_status text not null default 'New Inquiry' check (booking_status in ('New Inquiry', 'WhatsApp Contacted', 'Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show')),
  payment_status text not null default 'Not Requested' check (payment_status in ('Not Requested', 'Pending', 'Advance Paid', 'Partially Paid', 'Fully Paid', 'Refunded')),
  source text not null default 'Website' check (source in ('Website', 'WhatsApp', 'Instagram', 'Call', 'Walk-in', 'Google', 'Admin')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in),
  check (total_guests = adults + children + infants)
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  image_url text not null,
  thumbnail_url text,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  description text,
  featured boolean not null default false,
  display_order integer not null default 0,
  status text not null default 'Published' check (status in ('Published', 'Hidden', 'Archived')),
  created_at timestamptz not null default now()
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) check (price is null or price >= 0),
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  image_url text,
  valid_from date,
  valid_until date,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until is null or valid_from is null or valid_until >= valid_from)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  image_url text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp_number text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (phone)
);

create table public.website_content (
  content_key text primary key,
  content_value jsonb not null,
  public_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  description text,
  created_at timestamptz not null default now()
);

create index bookings_room_dates_idx on public.bookings (room_id, check_in, check_out);
create index bookings_status_idx on public.bookings (booking_status);
create index bookings_created_idx on public.bookings (created_at desc);
create index room_blocks_room_dates_idx on public.room_blocks (room_id, start_date, end_date);
create index gallery_status_order_idx on public.gallery (status, category, display_order);
create index activity_logs_created_idx on public.activity_logs (created_at desc);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = (select auth.uid())
      and active = true
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_set_updated_at before update on public.rooms for each row execute function private.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute function private.set_updated_at();
create trigger packages_set_updated_at before update on public.packages for each row execute function private.set_updated_at();
create trigger activities_set_updated_at before update on public.activities for each row execute function private.set_updated_at();
create trigger customers_set_updated_at before update on public.customers for each row execute function private.set_updated_at();
create trigger website_content_set_updated_at before update on public.website_content for each row execute function private.set_updated_at();

alter table public.admins enable row level security;
alter table public.rooms enable row level security;
alter table public.room_images enable row level security;
alter table public.room_amenities enable row level security;
alter table public.room_blocks enable row level security;
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;
alter table public.packages enable row level security;
alter table public.activities enable row level security;
alter table public.customers enable row level security;
alter table public.website_content enable row level security;
alter table public.activity_logs enable row level security;

create policy rooms_public_read on public.rooms for select to anon, authenticated using (status in ('Active', 'Coming Soon'));
create policy room_images_public_read on public.room_images for select to anon, authenticated using (exists (select 1 from public.rooms where rooms.id = room_images.room_id and rooms.status in ('Active', 'Coming Soon')));
create policy room_amenities_public_read on public.room_amenities for select to anon, authenticated using (exists (select 1 from public.rooms where rooms.id = room_amenities.room_id and rooms.status in ('Active', 'Coming Soon')));
create policy gallery_public_read on public.gallery for select to anon, authenticated using (status = 'Published');
create policy packages_public_read on public.packages for select to anon, authenticated using (active = true);
create policy activities_public_read on public.activities for select to anon, authenticated using (active = true);
create policy content_public_read on public.website_content for select to anon, authenticated using (public_visible = true);

create policy admins_self_read on public.admins for select to authenticated using (user_id = (select auth.uid()));

create policy admins_manage_rooms on public.rooms for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_room_images on public.room_images for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_room_amenities on public.room_amenities for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_room_blocks on public.room_blocks for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_bookings on public.bookings for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_gallery on public.gallery for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_packages on public.packages for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_activities on public.activities for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_customers on public.customers for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_manage_content on public.website_content for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admins_read_activity_logs on public.activity_logs for select to authenticated using ((select private.is_admin()));
create policy admins_insert_activity_logs on public.activity_logs for insert to authenticated with check ((select private.is_admin()) and admin_id = (select auth.uid()));

create or replace function public.get_room_availability(
  p_check_in date,
  p_check_out date,
  p_rooms_requested integer default 1
)
returns table (
  room_id uuid,
  name text,
  slug text,
  category text,
  room_type text,
  short_description text,
  max_guests integer,
  bed_type text,
  base_price numeric,
  weekend_price numeric,
  cover_image text,
  total_units integer,
  available_units integer,
  is_available boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in or p_check_in < current_date then
    raise exception 'Please choose a valid future date range.';
  end if;
  if p_rooms_requested < 1 or p_rooms_requested > 20 then
    raise exception 'Rooms requested must be between 1 and 20.';
  end if;

  return query
  select
    r.id,
    r.name,
    r.slug,
    r.category,
    r.room_type,
    r.short_description,
    r.max_guests,
    r.bed_type,
    r.base_price,
    r.weekend_price,
    r.cover_image,
    r.total_units,
    greatest(0, r.total_units
      - coalesce((
          select sum(b.rooms_requested)::integer
          from public.bookings b
          where b.room_id = r.id
            and b.booking_status in ('Pending', 'Confirmed', 'Checked In')
            and b.check_in < p_check_out
            and b.check_out > p_check_in
        ), 0)
      - coalesce((
          select sum(rb.blocked_units)::integer
          from public.room_blocks rb
          where rb.room_id = r.id
            and rb.start_date < p_check_out
            and rb.end_date > p_check_in
        ), 0)
    )::integer as available_units,
    (greatest(0, r.total_units
      - coalesce((
          select sum(b.rooms_requested)::integer
          from public.bookings b
          where b.room_id = r.id
            and b.booking_status in ('Pending', 'Confirmed', 'Checked In')
            and b.check_in < p_check_out
            and b.check_out > p_check_in
        ), 0)
      - coalesce((
          select sum(rb.blocked_units)::integer
          from public.room_blocks rb
          where rb.room_id = r.id
            and rb.start_date < p_check_out
            and rb.end_date > p_check_in
        ), 0)
    ) >= p_rooms_requested) as is_available
  from public.rooms r
  where r.status = 'Active'
  order by r.featured desc, r.name;
end;
$$;

create or replace function public.submit_booking_inquiry(
  p_request_token uuid,
  p_customer_name text,
  p_phone text,
  p_email text,
  p_whatsapp_number text,
  p_city text,
  p_visit_type text,
  p_check_in date,
  p_check_out date,
  p_adults integer,
  p_children integer,
  p_infants integer,
  p_room_id uuid,
  p_rooms_requested integer,
  p_occasion text,
  p_interests text[],
  p_special_request text
)
returns table (booking_reference text, booking_id uuid)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_room public.rooms%rowtype;
  v_available integer;
  v_reference text;
  v_booking_id uuid;
begin
  if p_request_token is null then raise exception 'Missing inquiry token.'; end if;
  if length(trim(coalesce(p_customer_name, ''))) < 2 or length(p_customer_name) > 100 then raise exception 'Please enter a valid name.'; end if;
  if coalesce(p_phone, '') !~ '^[0-9+ -]{10,18}$' then raise exception 'Please enter a valid phone number.'; end if;
  if p_email is not null and p_email <> '' and p_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then raise exception 'Please enter a valid email.'; end if;
  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in or p_check_in < current_date then raise exception 'Please choose a valid future date range.'; end if;
  if p_adults < 1 or p_children < 0 or p_infants < 0 or p_rooms_requested < 1 or p_rooms_requested > 20 then raise exception 'Guest or room count is invalid.'; end if;

  select * into v_room from public.rooms where id = p_room_id and status = 'Active' for share;
  if not found then raise exception 'Selected room is not available.'; end if;
  if v_room.max_guests is not null and (p_adults + p_children) > (v_room.max_guests * p_rooms_requested) then raise exception 'Guest count exceeds the selected room capacity.'; end if;

  select a.available_units into v_available
  from public.get_room_availability(p_check_in, p_check_out, p_rooms_requested) a
  where a.room_id = p_room_id;
  if coalesce(v_available, 0) < p_rooms_requested then raise exception 'Selected room is no longer available for these dates.'; end if;

  v_reference := 'DS-' || to_char(current_date, 'YYYY') || '-' || upper(substr(replace(p_request_token::text, '-', ''), 1, 8));

  insert into public.bookings (
    request_token, booking_reference, customer_name, phone, email, whatsapp_number, city,
    visit_type, check_in, check_out, adults, children, infants, total_guests,
    room_id, room_name_snapshot, rooms_requested, occasion, interests, special_request
  ) values (
    p_request_token, v_reference, trim(p_customer_name), trim(p_phone), nullif(trim(p_email), ''),
    nullif(trim(p_whatsapp_number), ''), nullif(trim(p_city), ''), p_visit_type, p_check_in, p_check_out,
    p_adults, p_children, p_infants, p_adults + p_children + p_infants,
    v_room.id, v_room.name, p_rooms_requested, nullif(trim(p_occasion), ''), coalesce(p_interests, '{}'),
    nullif(trim(p_special_request), '')
  )
  on conflict (request_token) do update set request_token = excluded.request_token
  returning id, public.bookings.booking_reference into v_booking_id, v_reference;

  return query select v_reference, v_booking_id;
end;
$$;

revoke all on function public.get_room_availability(date, date, integer) from public;
revoke all on function public.submit_booking_inquiry(uuid, text, text, text, text, text, text, date, date, integer, integer, integer, uuid, integer, text, text[], text) from public;
grant execute on function public.get_room_availability(date, date, integer) to anon, authenticated;
grant execute on function public.submit_booking_inquiry(uuid, text, text, text, text, text, text, date, date, integer, integer, integer, uuid, integer, text, text[], text) to anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.rooms, public.room_images, public.room_amenities, public.gallery, public.packages, public.activities, public.website_content to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into public.rooms (name, slug, category, room_type, short_description, total_units, capacity_adults, capacity_children, max_guests, bed_type, base_price, weekend_price, status, featured, cover_image)
values
  ('Deluxe Room', 'deluxe-room', 'Rooms', 'Deluxe', 'A comfortable private room for a relaxed resort stay.', 6, 2, 0, 2, null, 2999, 3499, 'Active', true, '/resort/deluxe-room.webp'),
  ('Super Deluxe Room', 'super-deluxe-room', 'Rooms', 'Super Deluxe', 'An upgraded private stay for couples and small families.', 2, 2, 0, 2, null, 3999, 4499, 'Active', true, '/resort/room-white.webp'),
  ('Premium Room', 'premium-room', 'Rooms', 'Premium', 'A spacious premium room with a king-size bed.', 2, 4, 0, 4, 'King-size bed', 5999, 6999, 'Active', true, '/resort/premium-room.webp'),
  ('Dormitory', 'dormitory', 'Group Stay', 'Dormitory', 'Shared group accommodation with two bunk beds.', 1, null, null, null, '2 bunk beds', 7200, 8000, 'Active', false, '/resort/dormitory.webp'),
  ('Additional Dormitories', 'additional-dormitories', 'Group Stay', 'Dormitory', 'Two additional dormitory units planned for future availability.', 2, null, null, null, 'Bunk beds', null, null, 'Coming Soon', false, '/resort/dormitory-wide.webp'),
  ('2 BHK Villa / DS Bungalow', '2-bhk-villa', 'Villa', '2 BHK Villa', 'A private two-bedroom villa for families and groups.', 1, 10, 0, 10, null, 11999, 12999, 'Active', true, '/resort/villa-exterior.webp')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  room_type = excluded.room_type,
  short_description = excluded.short_description,
  total_units = excluded.total_units,
  capacity_adults = excluded.capacity_adults,
  capacity_children = excluded.capacity_children,
  max_guests = excluded.max_guests,
  bed_type = excluded.bed_type,
  base_price = excluded.base_price,
  weekend_price = excluded.weekend_price,
  status = excluded.status,
  featured = excluded.featured,
  cover_image = excluded.cover_image,
  updated_at = now();

insert into public.activities (name, description, display_order)
values
  ('Swimming Pool', 'Swimming pool access, subject to resort operating guidance.', 1),
  ('Rain Dance', 'Rain dance experience included in applicable day-outing packages.', 2),
  ('Horse Riding', 'Guided horse-riding experience, subject to availability and supervision.', 3),
  ('Turf', 'Outdoor turf for group games and activities.', 4),
  ('Boating', 'Boating activity, subject to operating conditions.', 5),
  ('Indoor Games', 'Indoor games for guests and groups.', 6),
  ('ATV Ride', 'ATV activity, subject to operating guidance.', 7),
  ('Tyre Climbing', 'Outdoor tyre-climbing activity.', 8)
on conflict (name) do update set description = excluded.description, display_order = excluded.display_order, active = true;

insert into public.website_content (content_key, content_value, public_visible)
values
  ('booking_notice', jsonb_build_object('text', 'Your inquiry is not confirmed until the resort team confirms availability and payment requirements.'), true),
  ('contact', jsonb_build_object('whatsapp', '918149428126', 'phone', '+91 81494 28126', 'maps', 'https://maps.app.goo.gl/4N9MusUsVUeHSG9E8'), true)
on conflict (content_key) do update set content_value = excluded.content_value, public_visible = excluded.public_visible, updated_at = now();
