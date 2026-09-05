-- ═══════════════════════════════════════════════════════════
-- Shahryar's Ice Cream Bar — Supabase Schema
-- Run this once in: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────── SETTINGS (single row) ────────────────────────────
create table if not exists public.settings (
  id            int primary key default 1,
  brand_name    text not null default 'Shahryar''s Ice Cream Bar',
  tagline       text not null default '"A Taste You''ll Love"',
  hero_title_1  text not null default 'Shahryar''s',
  hero_title_2  text not null default 'Ice Cream Bar',
  hero_pill     text not null default 'Gojra''s Favorite Ice Cream Spot',
  hero_desc     text not null default '',
  phone         text not null default '+92 333 7254555',
  whatsapp      text not null default '923337254555',
  address       text not null default 'Mahdi Shah Bazar, Quaid-e-Azam Rd, Gojra, 56000, Pakistan',
  rating        numeric default 4.4,
  reviews       int default 705,
  hero_image    text default null,
  og_image      text default null,
  logo_url      text default null,
  favicon_url   text default null,
  updated_at    timestamptz default now(),
  constraint settings_single_row check (id = 1)
);

-- ──────────────────────────── CATEGORIES ────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text default '🍨',
  subtitle    text default '',
  sort_order  int default 0
);

-- ──────────────────────────── MENU ITEMS ────────────────────────────
create table if not exists public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  name        text not null,
  description text default '',
  icon        text default null,          -- emoji shown in "More" items (optional)
  tags        text default '',            -- comma separated e.g. "special,Popular"
  price_label text default '',            -- e.g. "Rs. 140" or "Ask in-store"
  is_ask_price boolean default false,     -- true renders the dashed "Ask in-store" pill
  sort_order  int default 0
);

-- ──────────────────────────── FLAVORS ────────────────────────────
create table if not exists public.flavors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  tag         text default '',
  image_url   text default '',
  sort_order  int default 0
);

-- ──────────────────────────── GALLERY ────────────────────────────
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  caption     text default '',
  tall        boolean default false,      -- true renders the taller "gi-tall" card
  sort_order  int default 0
);

-- ──────────────────────────── OPENING HOURS ────────────────────────────
-- day: 0 = Sunday, 1 = Monday ... 6 = Saturday
create table if not exists public.opening_hours (
  id       uuid primary key default gen_random_uuid(),
  day      int not null,
  label    text not null,                 -- "Mon", "Tue", ...
  open     text default '12:00 PM',
  close    text default '12:00 AM',
  is_open  boolean default true
);

-- ──────────────────────────── DOMAINS ────────────────────────────
create table if not exists public.domains (
  id             uuid primary key default gen_random_uuid(),
  domain_name    text not null,
  status         text default 'Active',      -- Active / Renewal Pending / Expired
  expiration_date date,
  auto_renewal   boolean default true,
  updated_at     timestamptz default now()
);

-- ──────────────────────────── SITE REQUESTS (support) ────────────────────────────
-- Admin can request any website change, adding a new page, or a domain renewal.
create table if not exists public.site_requests (
  id           uuid primary key default gen_random_uuid(),
  request_type text default 'Website change', -- Website change / Add new page / Domain renewal / Other
  title        text not null,
  description  text default '',
  status       text default 'Pending',       -- Pending / In progress / Done / Rejected
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ──────────────────────────── RLS (open anon access for this project) ────────────────────────────
alter table public.settings     enable row level security;
alter table public.categories   enable row level security;
alter table public.menu_items   enable row level security;
alter table public.flavors      enable row level security;
alter table public.gallery      enable row level security;
alter table public.opening_hours enable row level security;
alter table public.domains      enable row level security;
alter table public.site_requests enable row level security;

-- Allow full read + write for anon & authenticated (simple open setup)
drop policy if exists "open access settings"      on public.settings;
drop policy if exists "open access categories"    on public.categories;
drop policy if exists "open access menu"          on public.menu_items;
drop policy if exists "open access flavors"       on public.flavors;
drop policy if exists "open access gallery"       on public.gallery;
drop policy if exists "open access hours"         on public.opening_hours;
drop policy if exists "open access domains"       on public.domains;
drop policy if exists "open access requests"      on public.site_requests;

create policy "open access settings"      on public.settings      for all using (true) with check (true);
create policy "open access categories"    on public.categories    for all using (true) with check (true);
create policy "open access menu"          on public.menu_items    for all using (true) with check (true);
create policy "open access flavors"       on public.flavors       for all using (true) with check (true);
create policy "open access gallery"       on public.gallery       for all using (true) with check (true);
create policy "open access hours"         on public.opening_hours for all using (true) with check (true);
create policy "open access domains"       on public.domains       for all using (true) with check (true);
create policy "open access requests"      on public.site_requests for all using (true) with check (true);

-- ──────────────────────────── SEED: settings row ────────────────────────────
insert into public.settings (id, brand_name, tagline, hero_pill, hero_desc, phone, whatsapp, address, rating, reviews)
values (1, 'Shahryar''s Ice Cream Bar', '"A Taste You''ll Love"', 'Gojra''s Favorite Ice Cream Spot',
        'A local ice cream destination in Gojra offering a variety of delicious flavors, scoops, special desserts, and family packs.',
        '+92 333 7254555', '923337254555', 'Mahdi Shah Bazar, Quaid-e-Azam Rd, Gojra, 56000, Pakistan', 4.4, 705)
on conflict (id) do nothing;

-- ──────────────────────────── SEED: categories ────────────────────────────
insert into public.categories (name, slug, icon, subtitle, sort_order) values
  ('Scoops',        'cat-scoops',   '🍨', 'Single scoops to five scoops', 1),
  ('Specials',      'cat-specials', '⭐', 'Our signature Tutti Fruity',   2),
  ('Packs',         'cat-packs',    '📦', 'Half packs, family & large packs', 3),
  ('More to Enjoy', 'cat-more',     '🥤', 'Shakes, falooda, and hot beverages', 4)
on conflict (slug) do nothing;

-- ──────────────────────────── SEED: menu items ────────────────────────────
-- NOTE: category ids are looked up by slug so this is idempotent.
insert into public.menu_items (category_id, name, description, icon, tags, price_label, is_ask_price, sort_order)
select c.id, m.name, m.description, m.icon, m.tags, m.price_label, m.is_ask, m.sort
from (
  values
    ('cat-scoops', 'Single Scoop Cup',     '', null, 'Classic',      'Rs. 70',   false, 1),
    ('cat-scoops', 'Double Scoop Cup',     '', null, 'Popular',      'Rs. 140',  false, 2),
    ('cat-scoops', 'Three Scoop Cup',      '', null, 'Classic',      'Rs. 210',  false, 3),
    ('cat-scoops', 'Four Scoop Cup',       '', null, 'Party',        'Rs. 280',  false, 4),
    ('cat-scoops', 'Five Scoop Cup',       '', null, 'special',      'Rs. 350',  false, 5),
    ('cat-specials', 'Special Tutti Fruity (Small)', '', null, 'special', 'Rs. 280', false, 1),
    ('cat-specials', 'Special Tutti Fruity (Large)', '', null, 'special', 'Rs. 340', false, 2),
    ('cat-packs', 'Half Pack 7 Scoop',     '', null, 'Everyday',     'Rs. 490',  false, 1),
    ('cat-packs', 'Half Pack 9 Scoop',     '', null, 'Value',        'Rs. 630',  false, 2),
    ('cat-packs', 'Family Pack 12 Scoop',  '', null, 'special',      'Rs. 840',  false, 3),
    ('cat-packs', 'Large Pack 18 Scoop',   '', null, 'Big Family',   'Rs. 1,250', false, 4),
    ('cat-more', 'Ice Cream Shakes', 'Thick, creamy milkshakes blended with premium ice cream', '🥤', '', 'Ask in-store', true, 1),
    ('cat-more', 'Falooda', 'Layered falooda with ice cream, vermicelli, and rose syrup', '🍧', '', 'Ask in-store', true, 2),
    ('cat-more', 'Green Tea', 'Refreshing green tea to complement your ice cream', '🍵', 'winter', 'Ask in-store', true, 3),
    ('cat-more', 'Kashmiri Chai', 'Rich, traditional pink chai with a creamy texture', '🫖', 'winter', 'Ask in-store', true, 4)
) as m(slug, name, description, icon, tags, price_label, is_ask, sort)
join public.categories c on c.slug = m.slug;

-- ──────────────────────────── SEED: flavors ────────────────────────────
insert into public.flavors (name, tag, image_url, sort_order) values
  ('Pista',           'Rich & nutty green pistachio',    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&q=70', 1),
  ('Kulfa',           'Traditional creamy kulfi flavor', 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=400&h=300&fit=crop&q=70', 2),
  ('Mango',           'Sweet tropical Alphonso mango',   'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop&q=70', 3),
  ('Chocolate Chip',  'Creamy chocolate with real chips','https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&q=70', 4),
  ('Strawberry',      'Fresh berry burst in every bite', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop&q=70', 5),
  ('Vanilla Oreo',    'Classic vanilla with Oreo crunch','https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop&q=70', 6),
  ('Banana',          'Smooth & creamy ripe banana',     'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop&q=70', 7),
  ('Coffee',          'Bold espresso with a creamy finish','https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop&q=70', 8)
on conflict do nothing;

-- ──────────────────────────── SEED: gallery ────────────────────────────
insert into public.gallery (image_url, caption, tall, sort_order) values
  ('https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=900&fit=crop&q=80', 'Flavor Display', true, 1),
  ('https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop&q=80', 'Signature Shakes', false, 2),
  ('https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=600&h=400&fit=crop&q=80', 'Sundae Specials', false, 3),
  ('https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&h=400&fit=crop&q=80', 'Our Shop', false, 4),
  ('https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=400&fit=crop&q=80', 'Fresh Cones Daily', false, 5),
  ('https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600&h=400&fit=crop&q=80', 'Behind the Counter', false, 6)
on conflict do nothing;

-- ──────────────────────────── SEED: opening hours ────────────────────────────
insert into public.opening_hours (day, label, open, close, is_open) values
  (1, 'Mon', '12:00 PM', '12:00 AM', true),
  (2, 'Tue', '12:00 PM', '12:00 AM', true),
  (3, 'Wed', '12:00 PM', '12:00 AM', true),
  (4, 'Thu', '12:00 PM', '12:00 AM', true),
  (5, 'Fri', '12:00 PM', '12:00 AM', true),
  (6, 'Sat', '12:00 PM', '12:00 AM', true),
  (0, 'Sun', '12:00 PM', '12:00 AM', true)
on conflict do nothing;

-- ──────────────────────────── SEED: domain ────────────────────────────
insert into public.domains (domain_name, status, expiration_date, auto_renewal)
values ('shahryaricecream.com', 'Active', '2027-09-04', true)
on conflict do nothing;
