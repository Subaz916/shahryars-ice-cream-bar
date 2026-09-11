-- ═══════════════════════════════════════════════════════════
-- Popup / Announcement Modals
-- Popups appear on the website when it opens (once per visit),
-- cycling through active popups every 12 seconds.
-- Run this once in: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────── POPUPS ────────────────────────────
create table if not exists public.popups (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,                 -- popup image (wide images look best)
  caption     text default '',               -- short title shown over the image
  link        text default '',               -- optional "Learn more" URL
  enabled     boolean default true,          -- show/hide this popup on the website
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ──────────────────────────── RLS ────────────────────────────
alter table public.popups enable row level security;

drop policy if exists "open access popups" on public.popups;

create policy "open access popups" on public.popups for all using (true) with check (true);

-- ──────────────────────────── SEED: sample popup ────────────────────────────
insert into public.popups (image_url, caption, link, enabled, sort_order) values
  ('https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1400&h=600&fit=crop&q=80', 'Welcome to Shahryar''s Ice Cream Bar', '', true, 1)
on conflict do nothing;