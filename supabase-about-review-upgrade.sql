-- ═══════════════════════════════════════════════════════════
-- Shahryar's Ice Cream Bar — About & Reviews upgrade
-- Run once in: Supabase Dashboard > SQL Editor
-- Adds hero-logo upload support, editable About section, and a Reviews table.
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────── SETTINGS: new columns ────────────────────────────
alter table public.settings add column if not exists hero_logo_url    text default null;
alter table public.settings add column if not exists about_overline   text default 'Our Story';
alter table public.settings add column if not exists about_title      text default 'About Us';
alter table public.settings add column if not exists about_subtitle   text default 'Your favorite local ice cream spot in Gojra';
alter table public.settings add column if not exists about_heading    text default 'Shahryar''s Ice Cream Bar';
alter table public.settings add column if not exists about_desc       text default 'A local ice cream destination in Gojra offering a variety of delicious flavors, scoops, special desserts, and family packs. From single scoops to family-size packs, we bring joy to every occasion with our handcrafted, premium quality ice cream.';
alter table public.settings add column if not exists about_tag1       text default '⭐ Dine-in';
alter table public.settings add column if not exists about_tag2       text default '🚗 Drive-through';
alter table public.settings add column if not exists about_card_title text default 'A Taste You''ll Love';
alter table public.settings add column if not exists about_card_desc  text default 'Fresh scoops. Delicious moments — made with love in the heart of Gojra.';
alter table public.settings add column if not exists reviews_overline text default 'Loved by Gojra';
alter table public.settings add column if not exists reviews_title    text default 'What Customers Say';
alter table public.settings add column if not exists reviews_subtitle text default '';

-- ──────────────────────────── REVIEWS table ────────────────────────────
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  stars         int default 5,               -- 1..5
  text          text default '',
  author_name   text default '',
  author_source text default 'Google Review',
  sort_order    int default 0
);

-- ──────────────────────────── Image storage bucket ────────────────────────────
-- Public bucket used for admin file uploads (hero logo, etc.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, '{"image/png","image/jpeg","image/webp"}')
on conflict (id) do update set public = true;

drop policy if exists "public images read"   on storage.objects;
drop policy if exists "public images insert" on storage.objects;
drop policy if exists "public images update" on storage.objects;
drop policy if exists "public images delete" on storage.objects;

create policy "public images read"   on storage.objects for select using (bucket_id = 'images');
create policy "public images insert" on storage.objects for insert with check (bucket_id = 'images');
create policy "public images update" on storage.objects for update using (bucket_id = 'images');
create policy "public images delete" on storage.objects for delete using (bucket_id = 'images');

-- ──────────────────────────── RLS (reviews) ────────────────────────────
alter table public.reviews enable row level security;

drop policy if exists "open access reviews" on public.reviews;
create policy "open access reviews" on public.reviews for all using (true) with check (true);

-- ──────────────────────────── SEED: default reviews ────────────────────────────
insert into public.reviews (stars, text, author_name, author_source, sort_order) values
  (4, 'Best ice cream in Gojra! The Pista flavor is my all-time favourite — fresh, creamy, and so rich. Highly recommended.', 'Ahmed R.',  'Google Review', 1),
  (5, 'Their family pack is perfect for get-togethers. Great value and delicious flavors. The staff is really friendly too.',         'Fatima S.', 'Google Review', 2),
  (5, 'A gem in the heart of Gojra. Clean place, amazing falooda, and the best shakes in town. A must-visit!',                        'Bilal K.',  'Google Review', 3),
  (5, 'Took my kids here for a treat — they loved the chocolate and mango scoops. Very affordable and always fresh.',                 'Sana M.',   'Google Review', 4),
  (4, 'The Kashmiri chai in winter is unbeatable. Cozy place with a warm, welcoming vibe. Highly recommended!',                        'Usman A.',  'Google Review', 5),
  (5, 'Love the green tea and ice cream combo after dinner. Great service and a lovely spot in the bazar.',                            'Zainab T.', 'Google Review', 6);