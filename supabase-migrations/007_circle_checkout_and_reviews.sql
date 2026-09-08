-- ============================================================
-- 007_circle_checkout_and_reviews.sql
--
-- This migration supports three fixes to the frontend:
--   1. ReThread Circle pieces are now clickable, have their own
--      detail page, and can be added to the bag + checked out
--      just like a regular product. order_items and
--      product_reviews previously assumed every line item was a
--      catalog product (a NOT NULL, FK-constrained product_id) —
--      this adds an alternative upcycled_item_id column so a
--      row can point at *either* table.
--   2. Clicking a color swatch on a product page now swaps the
--      main photo to match, if that color has a tagged photo.
--      This adds a `color` column to product_images and backfills
--      it for the seeded catalog.
--   3. Customers can now write reviews (previously nothing had
--      permission to insert into product_reviews at all). A
--      trigger keeps rating_avg/rating_count in sync automatically
--      whenever a review is added.
--
-- Safe to re-run — every statement is guarded.
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Run it AFTER 001-006.
-- ============================================================

-- ============================================================
-- 1. Per-color gallery photos
-- ============================================================
alter table public.product_images add column if not exists color text;

-- Backfill: match the seeded catalog's images to the color that was
-- inserted alongside them (first color -> first image, second color
-- -> second image). Harmless no-op if 004_seed_catalog.sql was never
-- run, or if you've since replaced these products/images.
do $$
declare
  rec record;
  v_product_id bigint;
  v_img_ids bigint[];
begin
  for rec in
    select * from (values
      ('Organic Cotton Crew T-Shirt', 'Rust', 'Indigo'),
      ('Everyday Denim Jeans', 'Indigo', 'Black'),
      ('Classic Cotton Shirt', 'Cotton', 'Indigo'),
      ('Reworked Denim Jacket', 'Indigo', 'Indigo'),
      ('Handloom Cotton Kurta', 'Cotton', 'Moss'),
      ('Relaxed Fit Trousers', 'Cotton', 'Ink'),
      ('Floral Wrap Dress', 'Rust', 'Moss'),
      ('Everyday Cotton Top', 'Cotton', 'Rust'),
      ('Pleated Midi Skirt', 'Indigo', 'Cotton'),
      ('Canvas Sneakers', 'Cotton', 'Ink'),
      ('Leather-Look Belt', 'Ink', 'Rust'),
      ('Cotton Everyday Tote', 'Cotton', 'Moss')
    ) as t(product_name, color1, color2)
  loop
    select id into v_product_id from public.products where name = rec.product_name;
    if v_product_id is not null then
      select array_agg(id order by display_order) into v_img_ids
        from public.product_images where product_id = v_product_id;

      if v_img_ids is not null and array_length(v_img_ids, 1) >= 1 then
        update public.product_images set color = rec.color1 where id = v_img_ids[1];
      end if;
      if v_img_ids is not null and array_length(v_img_ids, 1) >= 2 then
        update public.product_images set color = rec.color2 where id = v_img_ids[2];
      end if;
    end if;
  end loop;
end $$;

-- ============================================================
-- 2. Let order_items point at either a product OR an upcycled item
-- ============================================================
alter table public.order_items alter column product_id drop not null;
alter table public.order_items add column if not exists upcycled_item_id bigint references public.upcycled_items (id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'order_items_product_or_upcycled_chk') then
    alter table public.order_items
      add constraint order_items_product_or_upcycled_chk
      check (
        (product_id is not null and upcycled_item_id is null)
        or (product_id is null and upcycled_item_id is not null)
      );
  end if;
end $$;

-- ============================================================
-- 3. Ratings on upcycled_items (so Circle pieces can show a
--    star rating on their card + detail page, same as products)
-- ============================================================
alter table public.upcycled_items add column if not exists rating_avg numeric(2, 1);
alter table public.upcycled_items add column if not exists rating_count integer not null default 0;

-- ============================================================
-- 4. Let product_reviews point at either a product OR an
--    upcycled item, and let customers actually write one
-- ============================================================
alter table public.product_reviews alter column product_id drop not null;
alter table public.product_reviews add column if not exists upcycled_item_id bigint references public.upcycled_items (id) on delete cascade;
alter table public.product_reviews add column if not exists customer_id uuid references auth.users (id) on delete set null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_product_or_upcycled_chk') then
    alter table public.product_reviews
      add constraint product_reviews_product_or_upcycled_chk
      check (
        (product_id is not null and upcycled_item_id is null)
        or (product_id is null and upcycled_item_id is not null)
      );
  end if;
end $$;

alter table public.product_reviews enable row level security;

drop policy if exists "Anyone can view product reviews" on public.product_reviews;
create policy "Anyone can view product reviews"
  on public.product_reviews for select
  using (true);

drop policy if exists "Signed-in customers can add their own review" on public.product_reviews;
create policy "Signed-in customers can add their own review"
  on public.product_reviews for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and rating between 1 and 5
    and ((product_id is not null) <> (upcycled_item_id is not null))
  );

-- ---- Keep rating_avg / rating_count in sync automatically ----
create or replace function public.refresh_review_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.product_id is not null then
    update public.products
    set rating_count = (select count(*) from public.product_reviews where product_id = new.product_id),
        rating_avg = (select round(avg(rating)::numeric, 1) from public.product_reviews where product_id = new.product_id)
    where id = new.product_id;
  elsif new.upcycled_item_id is not null then
    update public.upcycled_items
    set rating_count = (select count(*) from public.product_reviews where upcycled_item_id = new.upcycled_item_id),
        rating_avg = (select round(avg(rating)::numeric, 1) from public.product_reviews where upcycled_item_id = new.upcycled_item_id)
    where id = new.upcycled_item_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_refresh_review_rating on public.product_reviews;
create trigger trg_refresh_review_rating
  after insert on public.product_reviews
  for each row execute function public.refresh_review_rating();
