-- ============================================================
-- 008_order_fulfillment.sql
-- Adds a fulfillment stage to each order line item (ordered →
-- shipped → out_for_delivery → delivered) and lets a brand's
-- staff (via brand_members) see and update the stage for their
-- own products only — powers the tracker on the Brand Portal.
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to run on an existing database — only adds a column +
-- policies, doesn't touch existing data.
-- ============================================================

-- ---- New column on order_items ----
alter table public.order_items
  add column if not exists fulfillment_status text not null default 'ordered';

alter table public.order_items
  drop constraint if exists order_items_fulfillment_status_check;

alter table public.order_items
  add constraint order_items_fulfillment_status_check
  check (fulfillment_status in ('ordered', 'shipped', 'out_for_delivery', 'delivered'));

alter table public.order_items
  add column if not exists fulfillment_updated_at timestamptz;

comment on column public.order_items.fulfillment_status is 'Where this line item is in the shipping journey. Set by brand staff from the Brand Portal.';

-- ---- Brand staff can see (and update) the items that belong to their own brand ----
drop policy if exists "Brand members can view order items for their products" on public.order_items;
create policy "Brand members can view order items for their products"
  on public.order_items for select
  using (
    product_id in (
      select p.id from public.products p
      join public.brand_members bm on bm.brand_id = p.brand_id
      where bm.user_id = auth.uid()
    )
  );

drop policy if exists "Brand members can update fulfillment status for their products" on public.order_items;
create policy "Brand members can update fulfillment status for their products"
  on public.order_items for update
  using (
    product_id in (
      select p.id from public.products p
      join public.brand_members bm on bm.brand_id = p.brand_id
      where bm.user_id = auth.uid()
    )
  )
  with check (
    product_id in (
      select p.id from public.products p
      join public.brand_members bm on bm.brand_id = p.brand_id
      where bm.user_id = auth.uid()
    )
  );

-- ---- Brand staff can also see the parent order (for date / order id / status) ----
-- of any order that contains at least one of their own products.
drop policy if exists "Brand members can view orders containing their products" on public.orders;
create policy "Brand members can view orders containing their products"
  on public.orders for select
  using (
    id in (
      select oi.order_id from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.brand_members bm on bm.brand_id = p.brand_id
      where bm.user_id = auth.uid()
    )
  );
