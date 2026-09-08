-- ============================================================
-- 006_demo_account.sql
-- Seeds a "ReThread Demo Brand" and links the demo account
-- (demo@rethread.app) to it, so the demo login can also open
-- the Brand Portal.
--
-- IMPORTANT — run this AFTER you've created the demo user.
-- See SETUP.md, section "Demo account", for how to create
-- demo@rethread.app in the Supabase dashboard (takes ~30 seconds).
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run.
-- ============================================================

-- ---- Demo brand ----
insert into public.brands (name)
  select 'ReThread Demo Brand'
  where not exists (select 1 from public.brands where name = 'ReThread Demo Brand');

-- ---- Link demo@rethread.app to it ----
-- This looks up the user by email in auth.users, so it only works
-- once the demo account actually exists (see SETUP.md).
do $$
declare v_user_id uuid;
declare v_brand_id bigint;
begin
  select id into v_user_id from auth.users where email = 'demo@rethread.app';
  select id into v_brand_id from public.brands where name = 'ReThread Demo Brand';

  if v_user_id is null then
    raise notice 'No user found with email demo@rethread.app yet — create it first (see SETUP.md), then re-run this file.';
  else
    insert into public.brand_members (brand_id, user_id)
    values (v_brand_id, v_user_id)
    on conflict (brand_id, user_id) do nothing;

    -- Make sure they also have a customers row (normally automatic via trigger)
    insert into public.customers (id, email, full_name)
    values (v_user_id, 'demo@rethread.app', 'Demo Shopper')
    on conflict (id) do nothing;
  end if;
end $$;
