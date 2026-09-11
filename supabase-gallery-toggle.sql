-- ═══════════════════════════════════════════════════════════
-- Gallery Section Toggle
-- Adds a setting to enable/disable the gallery section on the website.
-- Run this once in: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ── Add gallery_enabled column (default true = visible) ──
alter table public.settings
  add column if not exists gallery_enabled boolean default true;

-- ── Set default value for existing row ──
update public.settings
set gallery_enabled = true
where id = 1 and gallery_enabled is null;
