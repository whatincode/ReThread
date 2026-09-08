-- ============================================================
-- 009_circle_admin.sql
-- Lets ReThread's own staff manage ReThread Circle pieces
-- (public.upcycled_items) — in particular, add/replace the
-- product photo — from a new internal page:
--   pages/circle-admin.html
--
-- HOW IT WORKS
-- Circle pieces aren't owned by any one brand (they're made by
-- ReThread itself from take-backs), so — same idea as the Brand
-- Portal, one step simpler — we reuse the existing
-- `brand_members` table and treat membership in the 'ReThread
-- Label' brand as "is ReThread staff".
--
-- 1. A staff account signs up normally (pages/auth.html).
-- 2. You (the ReThread admin) link that account to the
--    'ReThread Label' brand — see the example at the bottom.
-- 3. Once linked, that user can open pages/circle-admin.html
--    and upload/replace images for any Circle piece.
--
-- Also links the demo account (demo@rethread.app) to 'ReThread
-- Label', so the demo login can open circle-admin.html too,
-- the same way 006_demo_account.sql links it to the Brand
-- Portal.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run.
-- ============================================================

-- ---- upcycled_items: public read, ReThread-staff-only write ----
alter table public.upcycled_items enable row level security;

drop policy if exists "Anyone can view circle items" on public.upcycled_items;
create policy "Anyone can view circle items"
  on public.upcycled_items for select
  using (true);

drop policy if exists "ReThread staff can update circle items" on public.upcycled_items;
create policy "ReThread staff can update circle items"
  on public.upcycled_items for update
  using (
    exists (
      select 1 from public.brand_members bm
      join public.brands b on b.id = bm.brand_id
      where bm.user_id = auth.uid() and b.name = 'ReThread Label'
    )
  );

drop policy if exists "ReThread staff can add circle items" on public.upcycled_items;
create policy "ReThread staff can add circle items"
  on public.upcycled_items for insert
  with check (
    exists (
      select 1 from public.brand_members bm
      join public.brands b on b.id = bm.brand_id
      where bm.user_id = auth.uid() and b.name = 'ReThread Label'
    )
  );

-- Circle images reuse the existing 'product-images' storage bucket
-- and its policies (public read, any authenticated user can upload)
-- from supabase-migrations/002_brand_portal.sql — no bucket changes
-- needed here.

-- ---- Link demo@rethread.app to 'ReThread Label' too, so the demo
--      account can open circle-admin.html out of the box ----
do $$
declare v_user_id uuid;
declare v_brand_id bigint;
begin
  select id into v_user_id from auth.users where email = 'demo@rethread.app';
  select id into v_brand_id from public.brands where name = 'ReThread Label';

  if v_user_id is null then
    raise notice 'No user found with email demo@rethread.app yet — create it first (see SETUP.md), then re-run this file.';
  elsif v_brand_id is null then
    raise notice '''ReThread Label'' brand not found — run 004_seed_catalog.sql first, then re-run this file.';
  else
    insert into public.brand_members (brand_id, user_id)
    values (v_brand_id, v_user_id)
    on conflict (brand_id, user_id) do nothing;
  end if;
end $$;

-- ============================================================
-- ONE-TIME SETUP PER STAFF ACCOUNT: link a user to 'ReThread Label'.
-- Find the user's id in Authentication → Users, then run:
--
--   insert into public.brand_members (brand_id, user_id)
--   select id, '11111111-2222-3333-4444-555555555555'
--   from public.brands where name = 'ReThread Label';
-- ============================================================
