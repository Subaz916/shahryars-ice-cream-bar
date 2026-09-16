-- ═══════════════════════════════════════════════════════════
-- Shahryar's Ice Cream Bar — Add About Tag 3
-- Run once in: Supabase Dashboard > SQL Editor
-- Adds a third tag item to the About section (editable in the admin panel).
-- ═══════════════════════════════════════════════════════════

alter table public.settings add column if not exists about_tag3 text default null;