-- ═══════════════════════════════════════════════════════════
-- Shahryar's Ice Cream Bar — Payment Pending / Site Lock
-- Run once in: Supabase Dashboard > SQL Editor
--
-- Adds the `payment_pending` flag to public.settings.
--   TRUE  → a red "payment pending, website locked" strip shows
--           on the top of every page.
--   FALSE → normal operation, no strip.
--
-- You can also flip this manually:
--   Supabase Dashboard > Table Editor > settings > row id=1
--   set `payment_pending` to true / false.
-- ═══════════════════════════════════════════════════════════

alter table public.settings
  add column if not exists payment_pending boolean default true;

-- Keep the single settings row in sync (defaults to true = locked
-- until the payment is completed, then user/admin sets it to false).
update public.settings
   set payment_pending = true
 where id = 1 and payment_pending is null;