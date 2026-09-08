-- ============================================================
-- 002_brand_portal.sql
-- Lets a brand's staff sign in and manage their own products —
-- without being able to touch any other brand's catalog.
--
-- HOW IT WORKS
-- 1. A brand user signs up normally (pages/auth.html), same as
--    any customer.
-- 2. You (the ReThread admin) link that account to a brand by
--    inserting one row into `brand_members` — see the example
--    at the bottom of this file.
-- 3. Once linked, that user sees the Brand Portal (pages/brand-
--    portal.html) and can add/edit products for that brand only.
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run.
-- Adjust column names below (brands.id, products.brand_id, etc.)
-- if yours differ.
-- ============================================================

create table if not exists public.brand_members (
  id bigint generated always as identity primary key,
  brand_id bigint not null references public.brands (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'editor',
  created_at timestamptz not null default now(),
  unique (brand_id, user_id)
);

comment on table public.brand_members is 'Links an auth user to the brand(s) they are allowed to manage in the Brand Portal.';

alter table public.brand_members enable row level security;

drop policy if exists "Members can view their own membership rows" on public.brand_members;
create policy "Members can view their own membership rows"
  on public.brand_members for select
  using (auth.uid() = user_id);

-- ---- Products: brand members can manage only their own brand's rows ----
alter table public.products enable row level security;

drop policy if exists "Anyone can view active products" on public.products;
create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

drop policy if exists "Brand members can view all their own products" on public.products;
create policy "Brand members can view all their own products"
  on public.products for select
  using (brand_id in (select brand_id from public.brand_members where user_id = auth.uid()));

drop policy if exists "Brand members can insert their own products" on public.products;
create policy "Brand members can insert their own products"
  on public.products for insert
  with check (brand_id in (select brand_id from public.brand_members where user_id = auth.uid()));

drop policy if exists "Brand members can update their own products" on public.products;
create policy "Brand members can update their own products"
  on public.products for update
  using (brand_id in (select brand_id from public.brand_members where user_id = auth.uid()));

-- ---- Product images / variants / specifications: gated via the parent product's brand ----
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_specifications enable row level security;

drop policy if exists "Anyone can view product images" on public.product_images;
create policy "Anyone can view product images"
  on public.product_images for select using (true);

drop policy if exists "Anyone can view product variants" on public.product_variants;
create policy "Anyone can view product variants"
  on public.product_variants for select using (true);

drop policy if exists "Anyone can view product specifications" on public.product_specifications;
create policy "Anyone can view product specifications"
  on public.product_specifications for select using (true);

drop policy if exists "Brand members can insert images for their products" on public.product_images;
create policy "Brand members can insert images for their products"
  on public.product_images for insert
  with check (
    product_id in (
      select p.id from public.products p
      join public.brand_members bm on bm.brand_id = p.brand_id
      where bm.user_id = auth.uid()
    )
  );

drop policy if exists "Brand members can insert variants for their products" on public.product_variants;
create policy "Brand members can insert variants for their products"
  on public.product_variants for insert
  with check (
    product_id in (
      select p.id from public.products p
      join public.brand_members bm on bm.brand_id = p.brand_id
      where bm.user_id = auth.uid()
    )
  );

drop policy if exists "Brand members can insert specs for their products" on public.product_specifications;
create policy "Brand members can insert specs for their products"
  on public.product_specifications for insert
  with check (
    product_id in (
      select p.id from public.products p
      join public.brand_members bm on bm.brand_id = p.brand_id
      where bm.user_id = auth.uid()
    )
  );

-- ---- Storage bucket for product photos uploaded from the Brand Portal ----
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to product images" on storage.objects;
create policy "Public read access to product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- ONE-TIME SETUP PER BRAND: link a user to a brand.
-- Find the brand's id in the `brands` table and the user's id
-- in Authentication → Users, then run something like:
--
--   insert into public.brand_members (brand_id, user_id)
--   values (3, '11111111-2222-3333-4444-555555555555');
-- ============================================================
