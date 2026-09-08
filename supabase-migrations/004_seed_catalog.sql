-- ============================================================
-- 004_seed_catalog.sql
-- Seeds an affordable, realistic catalog: brands, categories,
-- 12 products (with images/variants/specs/reviews), and the
-- ReThread Circle upcycled-items collection with images.
--
-- Safe to re-run: every insert is guarded so nothing is
-- duplicated if you run this more than once.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================

-- ---- Brands ----
insert into public.brands (name)
  select 'ReThread Label'
  where not exists (select 1 from public.brands where name = 'ReThread Label');
insert into public.brands (name)
  select 'Common Thread Co.'
  where not exists (select 1 from public.brands where name = 'Common Thread Co.');
insert into public.brands (name)
  select 'Loom & Co.'
  where not exists (select 1 from public.brands where name = 'Loom & Co.');

-- ---- Parent categories ----
insert into public.categories (name, parent_category_id)
  select 'Clothing', null
  where not exists (select 1 from public.categories where name = 'Clothing');
insert into public.categories (name, parent_category_id)
  select 'Footwear', null
  where not exists (select 1 from public.categories where name = 'Footwear');
insert into public.categories (name, parent_category_id)
  select 'Accessories', null
  where not exists (select 1 from public.categories where name = 'Accessories');

-- ---- Child categories ----
insert into public.categories (name, parent_category_id)
  select 'T-Shirts', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'T-Shirts');
insert into public.categories (name, parent_category_id)
  select 'Tops', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Tops');
insert into public.categories (name, parent_category_id)
  select 'Shirts', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Shirts');
insert into public.categories (name, parent_category_id)
  select 'Jeans', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Jeans');
insert into public.categories (name, parent_category_id)
  select 'Trousers', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Trousers');
insert into public.categories (name, parent_category_id)
  select 'Jackets', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Jackets');
insert into public.categories (name, parent_category_id)
  select 'Dresses', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Dresses');
insert into public.categories (name, parent_category_id)
  select 'Skirts', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Skirts');
insert into public.categories (name, parent_category_id)
  select 'Kurtas', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Kurtas');
insert into public.categories (name, parent_category_id)
  select 'Sarees', (select id from public.categories where name = 'Clothing' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Sarees');
insert into public.categories (name, parent_category_id)
  select 'Sneakers', (select id from public.categories where name = 'Footwear' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Sneakers');
insert into public.categories (name, parent_category_id)
  select 'Sandals', (select id from public.categories where name = 'Footwear' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Sandals');
insert into public.categories (name, parent_category_id)
  select 'Formal Shoes', (select id from public.categories where name = 'Footwear' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Formal Shoes');
insert into public.categories (name, parent_category_id)
  select 'Boots', (select id from public.categories where name = 'Footwear' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Boots');
insert into public.categories (name, parent_category_id)
  select 'Belts', (select id from public.categories where name = 'Accessories' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Belts');
insert into public.categories (name, parent_category_id)
  select 'Bags', (select id from public.categories where name = 'Accessories' and parent_category_id is null)
  where not exists (select 1 from public.categories where name = 'Bags');

-- ============================================================
-- Products
-- ============================================================
do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'ReThread Label';
  select id into v_category_id from public.categories where name = 'T-Shirts';
  select id into v_product_id from public.products where name = 'Organic Cotton Crew T-Shirt';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Organic Cotton Crew T-Shirt', 'A wardrobe staple cut from breathable, GOTS-certified organic cotton. Pre-shrunk and built to hold its shape wash after wash.', '100% organic cotton, 180 GSM
Pre-shrunk fabric
Reinforced crew neckline
Fair-trade certified factory', v_category_id, v_brand_id, 'new', 899, 399, 56, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMCw3MCBMOTUsOTAgTDcwLDExNSBMOTIsMTM4IEwxMTAsMTIyIEwxMTAsMjM1IEwxOTAsMjM1IEwxOTAsMTIyIEwyMDgsMTM4IEwyMzAsMTE1IEwyMDUsOTAgTDE4MCw3MCBRMTUwLDkwIDEyMCw3MCBaIiBmaWxsPSIjYjY1YTM0IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMjgsNzIgUTE1MCw5NSAxNzIsNzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIi8+Cjwvc3ZnPg==', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMCw3MCBMOTUsOTAgTDcwLDExNSBMOTIsMTM4IEwxMTAsMTIyIEwxMTAsMjM1IEwxOTAsMjM1IEwxOTAsMTIyIEwyMDgsMTM4IEwyMzAsMTE1IEwyMDUsOTAgTDE4MCw3MCBRMTUwLDkwIDEyMCw3MCBaIiBmaWxsPSIjMmIzYTU1IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMjgsNzIgUTE1MCw5NSAxNzIsNzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIi8+Cjwvc3ZnPg==', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S', 'Rust', 14),
      (v_product_id, 'M', 'Rust', 6),
      (v_product_id, 'L', 'Rust', 22),
      (v_product_id, 'XL', 'Rust', 3),
      (v_product_id, 'S', 'Indigo', 18),
      (v_product_id, 'M', 'Indigo', 9),
      (v_product_id, 'L', 'Indigo', 14),
      (v_product_id, 'XL', 'Indigo', 6),
      (v_product_id, 'S', 'Cotton', 22),
      (v_product_id, 'M', 'Cotton', 3),
      (v_product_id, 'L', 'Cotton', 18),
      (v_product_id, 'XL', 'Cotton', 9);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', '100% Organic Cotton'),
      (v_product_id, 'Fit', 'Regular'),
      (v_product_id, 'Care', 'Machine wash cold'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Aditi R.', 5, 'Soft and true to size', 'Great everyday tee, holds up well after washing.', now()),
      (v_product_id, 'Karan M.', 4, 'Good quality for the price', 'Fabric feels sturdy, colour hasn''t faded after a month.', now());

    update public.products set rating_avg = 4.5, rating_count = 2 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Common Thread Co.';
  select id into v_category_id from public.categories where name = 'Jeans';
  select id into v_product_id from public.products where name = 'Everyday Denim Jeans';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Everyday Denim Jeans', 'A relaxed straight-fit jean in mid-wash denim with just enough stretch for all-day comfort.', '98% cotton, 2% elastane
Mid-rise, straight fit
Five-pocket styling
Stone-washed finish', v_category_id, v_brand_id, 'new', 1999, 899, 55, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEwOCw2MCBMMTkyLDYwIEwxOTgsMjM1IEwxNjIsMjM1IEwxNTQsMTQwIEwxNDYsMjM1IEwxMTAsMjM1IFoiIGZpbGw9IiM3YTVhOGEiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxyZWN0IHg9IjEwOCIgeT0iNjAiIHdpZHRoPSI4NCIgaGVpZ2h0PSIyMiIgZmlsbD0iIzdhNWE4YSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiLz4KPGxpbmUgeDE9IjE1MCIgeTE9IjYwIiB4Mj0iMTUwIiB5Mj0iMTQwIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMyA0Ii8+CjxwYXRoIGQ9Ik0xMDgsNjAgUTE1MCw3NSAxOTIsNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxyZWN0IHg9IjExOCIgeT0iOTAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMiIgcng9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEwOCw2MCBMMTkyLDYwIEwxOTgsMjM1IEwxNjIsMjM1IEwxNTQsMTQwIEwxNDYsMjM1IEwxMTAsMjM1IFoiIGZpbGw9IiNjOThhNGIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxyZWN0IHg9IjEwOCIgeT0iNjAiIHdpZHRoPSI4NCIgaGVpZ2h0PSIyMiIgZmlsbD0iI2M5OGE0YiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiLz4KPGxpbmUgeDE9IjE1MCIgeTE9IjYwIiB4Mj0iMTUwIiB5Mj0iMTQwIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMyA0Ii8+CjxwYXRoIGQ9Ik0xMDgsNjAgUTE1MCw3NSAxOTIsNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxyZWN0IHg9IjExOCIgeT0iOTAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMiIgcng9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, '28', 'Indigo', 14),
      (v_product_id, '30', 'Indigo', 6),
      (v_product_id, '32', 'Indigo', 22),
      (v_product_id, '34', 'Indigo', 3),
      (v_product_id, '36', 'Indigo', 18),
      (v_product_id, '28', 'Black', 9),
      (v_product_id, '30', 'Black', 14),
      (v_product_id, '32', 'Black', 6),
      (v_product_id, '34', 'Black', 22),
      (v_product_id, '36', 'Black', 3);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', 'Cotton-elastane denim'),
      (v_product_id, 'Fit', 'Straight'),
      (v_product_id, 'Wash', 'Mid-blue stonewash'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Priya S.', 5, 'My new go-to jeans', 'Comfortable stretch, doesn''t sag by evening.', now()),
      (v_product_id, 'Rohan V.', 4, 'Solid basics', 'Good fit, wish there were more colour options.', now());

    update public.products set rating_avg = 4.5, rating_count = 2 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Loom & Co.';
  select id into v_category_id from public.categories where name = 'Shirts';
  select id into v_product_id from public.products where name = 'Classic Cotton Shirt';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Classic Cotton Shirt', 'A crisp, breathable cotton shirt that moves easily from desk to dinner. Cut with a slightly relaxed body.', '100% cotton poplin
Mother-of-pearl buttons
Curved hem
Easy-iron finish', v_category_id, v_brand_id, 'new', 1499, 699, 53, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTExNSw2OCBMODgsODYgTDY0LDExMiBMODYsMTM2IEwxMDYsMTIwIEwxMDYsMjM4IEwxOTQsMjM4IEwxOTQsMTIwIEwyMTQsMTM2IEwyMzYsMTEyIEwyMTIsODYgTDE4NSw2OCBMMTUwLDkyIFoiIGZpbGw9IiM1YzZlNGEiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE1MCw5MiBMMTM4LDE0MCBMMTUwLDE1MCBMMTYyLDE0MCBaIiBmaWxsPSIjZmRmYmY2IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNTAiIHkxPSIxNTAiIHgyPSIxNTAiIHkyPSIyMzIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI0IDUiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNjgiIHI9IjIuNCIgZmlsbD0iIzFlMWExNiIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE4OCIgcj0iMi40IiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMjA4IiByPSIyLjQiIGZpbGw9IiMxZTFhMTYiLz4KPC9zdmc+', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTExNSw2OCBMODgsODYgTDY0LDExMiBMODYsMTM2IEwxMDYsMTIwIEwxMDYsMjM4IEwxOTQsMjM4IEwxOTQsMTIwIEwyMTQsMTM2IEwyMzYsMTEyIEwyMTIsODYgTDE4NSw2OCBMMTUwLDkyIFoiIGZpbGw9IiM4YTZhNGYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE1MCw5MiBMMTM4LDE0MCBMMTUwLDE1MCBMMTYyLDE0MCBaIiBmaWxsPSIjZmRmYmY2IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNTAiIHkxPSIxNTAiIHgyPSIxNTAiIHkyPSIyMzIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI0IDUiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNjgiIHI9IjIuNCIgZmlsbD0iIzFlMWExNiIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE4OCIgcj0iMi40IiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMjA4IiByPSIyLjQiIGZpbGw9IiMxZTFhMTYiLz4KPC9zdmc+', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S', 'Cotton', 14),
      (v_product_id, 'M', 'Cotton', 6),
      (v_product_id, 'L', 'Cotton', 22),
      (v_product_id, 'XL', 'Cotton', 3),
      (v_product_id, 'XXL', 'Cotton', 18),
      (v_product_id, 'S', 'Indigo', 9),
      (v_product_id, 'M', 'Indigo', 14),
      (v_product_id, 'L', 'Indigo', 6),
      (v_product_id, 'XL', 'Indigo', 22),
      (v_product_id, 'XXL', 'Indigo', 3);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', '100% Cotton Poplin'),
      (v_product_id, 'Fit', 'Relaxed'),
      (v_product_id, 'Sleeve', 'Full sleeve'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Meera K.', 5, 'Great office shirt', 'Fits well and the fabric breathes even in summer.', now());

    update public.products set rating_avg = 5.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'ReThread Label';
  select id into v_category_id from public.categories where name = 'Jackets';
  select id into v_product_id from public.products where name = 'Reworked Denim Jacket';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Reworked Denim Jacket', 'A one-of-a-kind jacket, refurbished from take-back denim, cleaned, patched, and pressed like new. Every piece is slightly different.', 'Made from reclaimed denim
Inspected & refurbished by hand
Diverts ~1.2kg of textile waste
Unique, low-stock piece', v_category_id, v_brand_id, 'like_new', 2499, 1299, 48, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTExMiw2NiBMODIsODggTDYwLDExOCBMODQsMTQyIEwxMDQsMTI0IEwxMDAsMjM2IEwyMDAsMjM2IEwxOTYsMTI0IEwyMTYsMTQyIEwyNDAsMTE4IEwyMTgsODggTDE4OCw2NiBMMTUwLDg4IFoiIGZpbGw9IiNiNjVhMzQiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGxpbmUgeDE9IjE1MCIgeTE9Ijg4IiB4Mj0iMTUwIiB5Mj0iMjM0IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMiA1Ii8+PHBhdGggZD0iTTE1MCw4OCBMMTMyLDExMCBMMTUwLDEyNCBMMTY4LDExMCBaIiBmaWxsPSIjZmRmYmY2IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTExMiw2NiBMODIsODggTDYwLDExOCBMODQsMTQyIEwxMDQsMTI0IEwxMDAsMjM2IEwyMDAsMjM2IEwxOTYsMTI0IEwyMTYsMTQyIEwyNDAsMTE4IEwyMTgsODggTDE4OCw2NiBMMTUwLDg4IFoiIGZpbGw9IiMyYjNhNTUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGxpbmUgeDE9IjE1MCIgeTE9Ijg4IiB4Mj0iMTUwIiB5Mj0iMjM0IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMiA1Ii8+PHBhdGggZD0iTTE1MCw4OCBMMTMyLDExMCBMMTUwLDEyNCBMMTY4LDExMCBaIiBmaWxsPSIjZmRmYmY2IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S', 'Indigo', 14),
      (v_product_id, 'M', 'Indigo', 6),
      (v_product_id, 'L', 'Indigo', 22),
      (v_product_id, 'XL', 'Indigo', 3);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', 'Reclaimed Denim'),
      (v_product_id, 'Condition', 'Refurbished — good as new'),
      (v_product_id, 'Fit', 'Regular'),
      (v_product_id, 'Origin', 'ReThread Circle Program');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Sana T.', 5, 'Love the story behind it', 'Great condition, barely any signs of wear, love that it''s reclaimed.', now());

    update public.products set rating_avg = 5.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Loom & Co.';
  select id into v_category_id from public.categories where name = 'Kurtas';
  select id into v_product_id from public.products where name = 'Handloom Cotton Kurta';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Handloom Cotton Kurta', 'Hand-loomed cotton kurta with a straight cut and side slits, finished with subtle contrast stitching.', 'Hand-loomed cotton
Straight fit with side slits
Contrast top-stitching
Supports weaver collectives', v_category_id, v_brand_id, 'new', 1299, 599, 54, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMCw2MiBMOTQsODQgTDcyLDExMCBMOTIsMTMyIEwxMDgsMTE4IEw5OCwxNTAgTDkyLDIzNiBMMTE4LDIzNiBMMTI0LDE4MCBMMTUwLDE4MCBMMTc2LDE4MCBMMTgyLDIzNiBMMjA4LDIzNiBMMjAyLDE1MCBMMTkyLDExOCBMMjA4LDEzMiBMMjI4LDExMCBMMjA2LDg0IEwxODAsNjIgUTE1MCw4NiAxMjAsNjIgWiIgZmlsbD0iIzdhNWE4YSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48bGluZSB4MT0iMTUwIiB5MT0iNzAiIHgyPSIxNTAiIHkyPSIxNzYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIyIDUiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSI5MCIgcj0iMi4yIiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTA2IiByPSIyLjIiIGZpbGw9IiMxZTFhMTYiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMjIiIHI9IjIuMiIgZmlsbD0iIzFlMWExNiIvPgo8L3N2Zz4=', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMCw2MiBMOTQsODQgTDcyLDExMCBMOTIsMTMyIEwxMDgsMTE4IEw5OCwxNTAgTDkyLDIzNiBMMTE4LDIzNiBMMTI0LDE4MCBMMTUwLDE4MCBMMTc2LDE4MCBMMTgyLDIzNiBMMjA4LDIzNiBMMjAyLDE1MCBMMTkyLDExOCBMMjA4LDEzMiBMMjI4LDExMCBMMjA2LDg0IEwxODAsNjIgUTE1MCw4NiAxMjAsNjIgWiIgZmlsbD0iI2M5OGE0YiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48bGluZSB4MT0iMTUwIiB5MT0iNzAiIHgyPSIxNTAiIHkyPSIxNzYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIyIDUiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSI5MCIgcj0iMi4yIiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTA2IiByPSIyLjIiIGZpbGw9IiMxZTFhMTYiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMjIiIHI9IjIuMiIgZmlsbD0iIzFlMWExNiIvPgo8L3N2Zz4=', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S', 'Cotton', 14),
      (v_product_id, 'M', 'Cotton', 6),
      (v_product_id, 'L', 'Cotton', 22),
      (v_product_id, 'XL', 'Cotton', 3),
      (v_product_id, 'S', 'Moss', 18),
      (v_product_id, 'M', 'Moss', 9),
      (v_product_id, 'L', 'Moss', 14),
      (v_product_id, 'XL', 'Moss', 6);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', 'Handloom Cotton'),
      (v_product_id, 'Fit', 'Straight'),
      (v_product_id, 'Length', 'Knee length'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Anita D.', 5, 'Beautiful fabric', 'The handloom texture feels premium, great for daily wear.', now());

    update public.products set rating_avg = 5.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Common Thread Co.';
  select id into v_category_id from public.categories where name = 'Trousers';
  select id into v_product_id from public.products where name = 'Relaxed Fit Trousers';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Relaxed Fit Trousers', 'Easy-fit cotton-blend trousers with a drawstring waist — dress up or down without a second thought.', 'Cotton-linen blend
Elasticated drawstring waist
Tapered ankle
Wrinkle-resistant weave', v_category_id, v_brand_id, 'new', 1699, 799, 53, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTExMiw1OCBMMTg4LDU4IEwxOTQsMjM2IEwxNjAsMjM2IEwxNTIsMTMyIEwxNDYsMjM2IEwxMDgsMjM2IFoiIGZpbGw9IiM1YzZlNGEiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxsaW5lIHgxPSIxNTAiIHkxPSI1OCIgeDI9IjE1MCIgeTI9IjEzMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjMgNCIvPgo8cGF0aCBkPSJNMTEyLDU4IFExNTAsNzAgMTg4LDU4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTExMiw1OCBMMTg4LDU4IEwxOTQsMjM2IEwxNjAsMjM2IEwxNTIsMTMyIEwxNDYsMjM2IEwxMDgsMjM2IFoiIGZpbGw9IiM4YTZhNGYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxsaW5lIHgxPSIxNTAiIHkxPSI1OCIgeDI9IjE1MCIgeTI9IjEzMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjMgNCIvPgo8cGF0aCBkPSJNMTEyLDU4IFExNTAsNzAgMTg4LDU4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S', 'Cotton', 14),
      (v_product_id, 'M', 'Cotton', 6),
      (v_product_id, 'L', 'Cotton', 22),
      (v_product_id, 'XL', 'Cotton', 3),
      (v_product_id, 'S', 'Ink', 18),
      (v_product_id, 'M', 'Ink', 9),
      (v_product_id, 'L', 'Ink', 14),
      (v_product_id, 'XL', 'Ink', 6);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', 'Cotton-Linen Blend'),
      (v_product_id, 'Fit', 'Relaxed Tapered'),
      (v_product_id, 'Waist', 'Drawstring + elastic'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Vikram J.', 4, 'Comfortable for travel', 'Great for long flights, breathable fabric.', now());

    update public.products set rating_avg = 4.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'ReThread Label';
  select id into v_category_id from public.categories where name = 'Dresses';
  select id into v_product_id from public.products where name = 'Floral Wrap Dress';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Floral Wrap Dress', 'A flowing wrap dress in a small-scale floral print, finished with a self-tie waist for a flattering fit.', 'Rayon crepe fabric
Adjustable wrap tie
Midi length
Lined bodice', v_category_id, v_brand_id, 'new', 1899, 899, 53, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyNCw2NCBMMTA4LDg0IEw5NiwxMDQgTDExMiwxMjAgTDEyMiwxMTAgTDExMiwxNjAgTDg0LDIzNiBMMjE2LDIzNiBMMTg4LDE2MCBMMTc4LDExMCBMMTg4LDEyMCBMMjA0LDEwNCBMMTkyLDg0IEwxNzYsNjQgUTE1MCw4NCAxMjQsNjQgWiIgZmlsbD0iIzVjNmU0YSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTMyLDY2IFExNTAsODggMTY4LDY2IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0xMTgsMTYwIEwxODIsMTYwIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMyA1Ii8+Cjwvc3ZnPg==', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyNCw2NCBMMTA4LDg0IEw5NiwxMDQgTDExMiwxMjAgTDEyMiwxMTAgTDExMiwxNjAgTDg0LDIzNiBMMjE2LDIzNiBMMTg4LDE2MCBMMTc4LDExMCBMMTg4LDEyMCBMMjA0LDEwNCBMMTkyLDg0IEwxNzYsNjQgUTE1MCw4NCAxMjQsNjQgWiIgZmlsbD0iIzhhNmE0ZiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTMyLDY2IFExNTAsODggMTY4LDY2IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIvPjxwYXRoIGQ9Ik0xMTgsMTYwIEwxODIsMTYwIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMyA1Ii8+Cjwvc3ZnPg==', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'XS', 'Rust', 14),
      (v_product_id, 'S', 'Rust', 6),
      (v_product_id, 'M', 'Rust', 22),
      (v_product_id, 'L', 'Rust', 3),
      (v_product_id, 'XS', 'Moss', 18),
      (v_product_id, 'S', 'Moss', 9),
      (v_product_id, 'M', 'Moss', 14),
      (v_product_id, 'L', 'Moss', 6);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', 'Rayon Crepe'),
      (v_product_id, 'Fit', 'Wrap, Regular'),
      (v_product_id, 'Length', 'Midi'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Neha P.', 5, 'Perfect for summer', 'Flattering fit, fabric doesn''t crease easily.', now());

    update public.products set rating_avg = 5.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Loom & Co.';
  select id into v_category_id from public.categories where name = 'Tops';
  select id into v_product_id from public.products where name = 'Everyday Cotton Top';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Everyday Cotton Top', 'A boxy, cropped cotton top that layers well or stands alone — soft-washed for a broken-in feel from day one.', 'Soft-washed cotton
Boxy, cropped fit
Ribbed neckline
Pre-shrunk', v_category_id, v_brand_id, 'new', 799, 349, 56, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMiw3OCBMOTgsOTYgTDc2LDExOCBMOTYsMTQwIEwxMTIsMTI2IEwxMDgsMjA1IEwxOTIsMjA1IEwxODgsMTI2IEwyMDQsMTQwIEwyMjQsMTE4IEwyMDIsOTYgTDE3OCw3OCBRMTUwLDk2IDEyMiw3OCBaIiBmaWxsPSIjNWM2ZTRhIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMzAsODAgUTE1MCwxMDAgMTcwLDgwIiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIvPjxsaW5lIHgxPSIxMDgiIHkxPSIyMDUiIHgyPSIxOTIiIHkyPSIyMDUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIzIDQiLz4KPC9zdmc+', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMiw3OCBMOTgsOTYgTDc2LDExOCBMOTYsMTQwIEwxMTIsMTI2IEwxMDgsMjA1IEwxOTIsMjA1IEwxODgsMTI2IEwyMDQsMTQwIEwyMjQsMTE4IEwyMDIsOTYgTDE3OCw3OCBRMTUwLDk2IDEyMiw3OCBaIiBmaWxsPSIjOGE2YTRmIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMzAsODAgUTE1MCwxMDAgMTcwLDgwIiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIvPjxsaW5lIHgxPSIxMDgiIHkxPSIyMDUiIHgyPSIxOTIiIHkyPSIyMDUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIzIDQiLz4KPC9zdmc+', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S', 'Cotton', 14),
      (v_product_id, 'M', 'Cotton', 6),
      (v_product_id, 'L', 'Cotton', 22),
      (v_product_id, 'S', 'Rust', 3),
      (v_product_id, 'M', 'Rust', 18),
      (v_product_id, 'L', 'Rust', 9);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', '100% Cotton'),
      (v_product_id, 'Fit', 'Boxy'),
      (v_product_id, 'Care', 'Machine wash cold'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Ishita B.', 4, 'Cute and comfy', 'Great for layering, true to size.', now());

    update public.products set rating_avg = 4.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Common Thread Co.';
  select id into v_category_id from public.categories where name = 'Skirts';
  select id into v_product_id from public.products where name = 'Pleated Midi Skirt';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Pleated Midi Skirt', 'A sun-pleated midi skirt with a comfortable elastic waistband that moves beautifully with every step.', 'Sun-pleated construction
Elastic waistband
Fully lined
Midi length', v_category_id, v_brand_id, 'new', 1399, 649, 54, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMCw4MCBMMTgwLDgwIEwyMTIsMjI0IEw4OCwyMjQgWiIgZmlsbD0iIzdhNWE4YSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEyMCw4MCBRMTUwLDk0IDE4MCw4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz4KPGxpbmUgeDE9IjE1MCIgeTE9IjkwIiB4Mj0iMTQ1IiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtZGFzaGFycmF5PSIyIDYiIG9wYWNpdHk9IjAuNiIvPgo8bGluZSB4MT0iMTMwIiB5MT0iODYiIHgyPSIxMTgiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIxLjYiIHN0cm9rZS1kYXNoYXJyYXk9IjIgNiIgb3BhY2l0eT0iMC42Ii8+CjxsaW5lIHgxPSIxNzAiIHkxPSI4NiIgeDI9IjE4MiIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWRhc2hhcnJheT0iMiA2IiBvcGFjaXR5PSIwLjYiLz4KPC9zdmc+', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTEyMCw4MCBMMTgwLDgwIEwyMTIsMjI0IEw4OCwyMjQgWiIgZmlsbD0iI2M5OGE0YiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEyMCw4MCBRMTUwLDk0IDE4MCw4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz4KPGxpbmUgeDE9IjE1MCIgeTE9IjkwIiB4Mj0iMTQ1IiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtZGFzaGFycmF5PSIyIDYiIG9wYWNpdHk9IjAuNiIvPgo8bGluZSB4MT0iMTMwIiB5MT0iODYiIHgyPSIxMTgiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIxLjYiIHN0cm9rZS1kYXNoYXJyYXk9IjIgNiIgb3BhY2l0eT0iMC42Ii8+CjxsaW5lIHgxPSIxNzAiIHkxPSI4NiIgeDI9IjE4MiIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWRhc2hhcnJheT0iMiA2IiBvcGFjaXR5PSIwLjYiLz4KPC9zdmc+', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S', 'Indigo', 14),
      (v_product_id, 'M', 'Indigo', 6),
      (v_product_id, 'L', 'Indigo', 22),
      (v_product_id, 'S', 'Cotton', 3),
      (v_product_id, 'M', 'Cotton', 18),
      (v_product_id, 'L', 'Cotton', 9);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', 'Polyester Crepe'),
      (v_product_id, 'Fit', 'A-line'),
      (v_product_id, 'Length', 'Midi'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Divya R.', 5, 'Flowy and flattering', 'Great quality pleats, hasn''t lost shape.', now());

    update public.products set rating_avg = 5.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'ReThread Label';
  select id into v_category_id from public.categories where name = 'Sneakers';
  select id into v_product_id from public.products where name = 'Canvas Sneakers';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Canvas Sneakers', 'Low-top canvas sneakers with a cushioned footbed, built for everyday miles.', 'Breathable canvas upper
Cushioned EVA footbed
Rubber outsole
Reinforced toe cap', v_category_id, v_brand_id, 'new', 1999, 999, 50, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTU1LDE5MCBRNjAsMTUwIDEwMCwxNDAgTDE1MCwxMjAgUTE2OCwxMTIgMTgyLDEyNCBMMjI4LDE1MCBRMjQ2LDE1OCAyNDYsMTc4IEwyNDYsMTk2IFEyNDYsMjA2IDIzNiwyMDYgTDY0LDIwNiBRNTUsMjA2IDU1LDE5NiBaIiBmaWxsPSIjYjY1YTM0IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwLDE0MCBRMTMwLDE1MCAxNTAsMTUwIEwxODIsMTI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMi41Ii8+CjxwYXRoIGQ9Ik02NCwyMDYgTDIzNiwyMDYgTDIzNiwyMTggUTIzNiwyMjQgMjI4LDIyNCBMNzIsMjI0IFE2NCwyMjQgNjQsMjE4IFoiIGZpbGw9IiNmZGZiZjYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyLjUiLz4KPGNpcmNsZSBjeD0iMTIwIiBjeT0iMTUwIiByPSIyIiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTM1IiBjeT0iMTQ1IiByPSIyIiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQxIiByPSIyIiBmaWxsPSIjMWUxYTE2Ii8+Cjwvc3ZnPg==', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTU1LDE5MCBRNjAsMTUwIDEwMCwxNDAgTDE1MCwxMjAgUTE2OCwxMTIgMTgyLDEyNCBMMjI4LDE1MCBRMjQ2LDE1OCAyNDYsMTc4IEwyNDYsMTk2IFEyNDYsMjA2IDIzNiwyMDYgTDY0LDIwNiBRNTUsMjA2IDU1LDE5NiBaIiBmaWxsPSIjMmIzYTU1IiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTAwLDE0MCBRMTMwLDE1MCAxNTAsMTUwIEwxODIsMTI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMi41Ii8+CjxwYXRoIGQ9Ik02NCwyMDYgTDIzNiwyMDYgTDIzNiwyMTggUTIzNiwyMjQgMjI4LDIyNCBMNzIsMjI0IFE2NCwyMjQgNjQsMjE4IFoiIGZpbGw9IiNmZGZiZjYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyLjUiLz4KPGNpcmNsZSBjeD0iMTIwIiBjeT0iMTUwIiByPSIyIiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTM1IiBjeT0iMTQ1IiByPSIyIiBmaWxsPSIjMWUxYTE2Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQxIiByPSIyIiBmaWxsPSIjMWUxYTE2Ii8+Cjwvc3ZnPg==', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, '6', 'Cotton', 14),
      (v_product_id, '7', 'Cotton', 6),
      (v_product_id, '8', 'Cotton', 22),
      (v_product_id, '9', 'Cotton', 3),
      (v_product_id, '10', 'Cotton', 18),
      (v_product_id, '6', 'Ink', 9),
      (v_product_id, '7', 'Ink', 14),
      (v_product_id, '8', 'Ink', 6),
      (v_product_id, '9', 'Ink', 22),
      (v_product_id, '10', 'Ink', 3);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Upper', 'Canvas'),
      (v_product_id, 'Sole', 'Rubber'),
      (v_product_id, 'Closure', 'Lace-up'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Arjun N.', 4, 'Comfortable daily wear', 'Good grip, breaks in quickly.', now());

    update public.products set rating_avg = 4.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Loom & Co.';
  select id into v_category_id from public.categories where name = 'Belts';
  select id into v_product_id from public.products where name = 'Leather-Look Belt';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Leather-Look Belt', 'A vegan leather belt with a matte buckle — a simple finishing piece for any outfit.', 'Vegan leather
Matte metal buckle
Adjustable, trim to fit
Reversible stitching detail', v_category_id, v_brand_id, 'new', 699, 299, 57, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHJlY3QgeD0iNTUiIHk9IjEzMiIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIzNiIgcng9IjYiIGZpbGw9IiNiNjVhMzQiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxyZWN0IHg9IjIwNSIgeT0iMTIyIiB3aWR0aD0iNDYiIGhlaWdodD0iNTYiIHJ4PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iNCIvPgo8cmVjdCB4PSIyMTUiIHk9IjE0MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMWUxYTE2Ii8+CjxjaXJjbGUgY3g9IjkwIiBjeT0iMTUwIiByPSIzIiBmaWxsPSIjZmRmYmY2Ii8+PGNpcmNsZSBjeD0iMTE1IiBjeT0iMTUwIiByPSIzIiBmaWxsPSIjZmRmYmY2Ii8+PGNpcmNsZSBjeD0iMTQwIiBjeT0iMTUwIiByPSIzIiBmaWxsPSIjZmRmYmY2Ii8+Cjwvc3ZnPg==', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHJlY3QgeD0iNTUiIHk9IjEzMiIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIzNiIgcng9IjYiIGZpbGw9IiMyYjNhNTUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxyZWN0IHg9IjIwNSIgeT0iMTIyIiB3aWR0aD0iNDYiIGhlaWdodD0iNTYiIHJ4PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iNCIvPgo8cmVjdCB4PSIyMTUiIHk9IjE0MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMWUxYTE2Ii8+CjxjaXJjbGUgY3g9IjkwIiBjeT0iMTUwIiByPSIzIiBmaWxsPSIjZmRmYmY2Ii8+PGNpcmNsZSBjeD0iMTE1IiBjeT0iMTUwIiByPSIzIiBmaWxsPSIjZmRmYmY2Ii8+PGNpcmNsZSBjeD0iMTQwIiBjeT0iMTUwIiByPSIzIiBmaWxsPSIjZmRmYmY2Ii8+Cjwvc3ZnPg==', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'S/M', 'Ink', 14),
      (v_product_id, 'L/XL', 'Ink', 6),
      (v_product_id, 'S/M', 'Rust', 22),
      (v_product_id, 'L/XL', 'Rust', 3);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Material', 'Vegan Leather'),
      (v_product_id, 'Buckle', 'Matte alloy'),
      (v_product_id, 'Width', '3.5 cm'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Farhan A.', 5, 'Sturdy and simple', 'Good quality buckle, doesn''t feel cheap.', now());

    update public.products set rating_avg = 5.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

do $$
declare v_product_id bigint; v_brand_id bigint; v_category_id bigint;
begin
  select id into v_brand_id from public.brands where name = 'Common Thread Co.';
  select id into v_category_id from public.categories where name = 'Bags';
  select id into v_product_id from public.products where name = 'Cotton Everyday Tote';
  if v_product_id is null then
    insert into public.products (name, description, highlights, category_id, brand_id, condition, mrp, selling_price, discount_percent, is_active)
    values ('Cotton Everyday Tote', 'A sturdy canvas tote built for daily errands, with reinforced handles and an internal slip pocket.', 'Heavy canvas construction
Reinforced stitched handles
Internal slip pocket
Machine washable', v_category_id, v_brand_id, 'new', 599, 299, 50, true)
    returning id into v_product_id;

    insert into public.product_images (product_id, image_url, is_primary, display_order) values
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTkwLDEyMCBMMjEwLDEyMCBMMjIyLDIzNiBMNzgsMjM2IFoiIGZpbGw9IiM1YzZlNGEiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMTIsMTIwIFExMTIsODAgMTUwLDgwIFExODgsODAgMTg4LDEyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNzAiIHI9IjE0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZGZiZjYiIHN0cm9rZS13aWR0aD0iMyIvPgo8L3N2Zz4=', true, 0),
      (v_product_id, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTkwLDEyMCBMMjEwLDEyMCBMMjIyLDIzNiBMNzgsMjM2IFoiIGZpbGw9IiM4YTZhNGYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMTIsMTIwIFExMTIsODAgMTUwLDgwIFExODgsODAgMTg4LDEyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNzAiIHI9IjE0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZGZiZjYiIHN0cm9rZS13aWR0aD0iMyIvPgo8L3N2Zz4=', false, 1);

    insert into public.product_variants (product_id, size, color, stock_quantity) values
      (v_product_id, 'One Size', 'Cotton', 14),
      (v_product_id, 'One Size', 'Moss', 6);

    insert into public.product_specifications (product_id, spec_key, spec_value) values
      (v_product_id, 'Fabric', 'Heavy Canvas'),
      (v_product_id, 'Capacity', '~15L'),
      (v_product_id, 'Handle Drop', '28 cm'),
      (v_product_id, 'Country of Origin', 'India');

    insert into public.product_reviews (product_id, customer_name, rating, review_title, review_text, created_at) values
      (v_product_id, 'Kavya L.', 5, 'Fits everything', 'Sturdy handles, great for groceries and books.', now());

    update public.products set rating_avg = 5.0, rating_count = 1 where id = v_product_id;
  end if;
end $$;

-- ============================================================
-- ReThread Circle: upcycled items made from take-backs
-- ============================================================
insert into public.upcycled_items (name, description, image_url, source_category, price)
  select 'Denim Patchwork Tote', 'Hand-stitched from reclaimed denim off-cuts collected through our take-back program. No two totes are alike.', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTkwLDEyMCBMMjEwLDEyMCBMMjIyLDIzNiBMNzgsMjM2IFoiIGZpbGw9IiM1YzZlNGEiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMTIsMTIwIFExMTIsODAgMTUwLDgwIFExODgsODAgMTg4LDEyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNzAiIHI9IjE0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZGZiZjYiIHN0cm9rZS13aWR0aD0iMyIvPgo8L3N2Zz4=', 'Jeans', 349
  where not exists (select 1 from public.upcycled_items where name = 'Denim Patchwork Tote');
insert into public.upcycled_items (name, description, image_url, source_category, price)
  select 'Denim Sling Pouch', 'A compact sling pouch made from take-back denim, lined with recycled cotton scrap.', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHBhdGggZD0iTTk2LDEyMCBROTYsMTAwIDExNiwxMDAgTDE4NCwxMDAgUTIwNCwxMDAgMjA0LDEyMCBMMjA0LDE5NiBRMjA0LDIyMCAxODAsMjIwIEwxMjAsMjIwIFE5NiwyMjAgOTYsMTk2IFoiIGZpbGw9IiNiNjVhMzQiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxsaW5lIHgxPSIxMDAiIHkxPSIxMjAiIHgyPSIyMDAiIHkyPSIxMjAiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjQgMyIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMjAiIHI9IjUiIGZpbGw9IiNmZGZiZjYiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==', 'Jeans', 299
  where not exists (select 1 from public.upcycled_items where name = 'Denim Sling Pouch');
insert into public.upcycled_items (name, description, image_url, source_category, price)
  select 'Shirt-to-Cushion Cover (Set of 2)', 'Cotton shirt fabric reborn as a set of two cushion covers, buttons and all.', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHJlY3QgeD0iODAiIHk9IjgwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgcng9IjEwIiBmaWxsPSIjN2E1YThhIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIvPgo8cGF0aCBkPSJNODAsODAgTDYwLDYwIE0yMjAsODAgTDI0MCw2MCBNODAsMjIwIEw2MCwyNDAgTTIyMCwyMjAgTDI0MCwyNDAiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHJlY3QgeD0iMTA4IiB5PSIxMDgiIHdpZHRoPSI4NCIgaGVpZ2h0PSI4NCIgcng9IjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZkZmJmNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtZGFzaGFycmF5PSI0IDUiLz4KPC9zdmc+', 'Shirts', 399
  where not exists (select 1 from public.upcycled_items where name = 'Shirt-to-Cushion Cover (Set of 2)');
insert into public.upcycled_items (name, description, image_url, source_category, price)
  select 'Old-Tee Braided Rug', 'A hand-braided floor rug made entirely from take-back cotton tees — soft underfoot, zero waste.', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMGQ2YzIiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPHJlY3QgeD0iNzAiIHk9IjEwMCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMTAiIHJ4PSI0IiBmaWxsPSIjNWM2ZTRhIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIvPgo8cmVjdCB4PSI5MCIgeT0iMTIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjcwIiByeD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmRmYmY2IiBzdHJva2Utd2lkdGg9IjMiLz4KPGxpbmUgeDE9IjcwIiB5MT0iMjEwIiB4Mj0iNzAiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9Ijc4IiB5MT0iMjEwIiB4Mj0iNzgiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9Ijg2IiB5MT0iMjEwIiB4Mj0iODYiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9Ijk0IiB5MT0iMjEwIiB4Mj0iOTQiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjEwMiIgeTE9IjIxMCIgeDI9IjEwMiIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTEwIiB5MT0iMjEwIiB4Mj0iMTEwIiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxMTgiIHkxPSIyMTAiIHgyPSIxMTgiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjEyNiIgeTE9IjIxMCIgeDI9IjEyNiIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTM0IiB5MT0iMjEwIiB4Mj0iMTM0IiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNDIiIHkxPSIyMTAiIHgyPSIxNDIiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjE1MCIgeTE9IjIxMCIgeDI9IjE1MCIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTU4IiB5MT0iMjEwIiB4Mj0iMTU4IiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNjYiIHkxPSIyMTAiIHgyPSIxNjYiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjE3NCIgeTE9IjIxMCIgeDI9IjE3NCIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTgyIiB5MT0iMjEwIiB4Mj0iMTgyIiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxOTAiIHkxPSIyMTAiIHgyPSIxOTAiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjE5OCIgeTE9IjIxMCIgeDI9IjE5OCIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMjA2IiB5MT0iMjEwIiB4Mj0iMjA2IiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIyMTQiIHkxPSIyMTAiIHgyPSIyMTQiIHkyPSIyMjIiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjIyMiIgeTE9IjIxMCIgeDI9IjIyMiIgeTI9IjIyMiIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMjMwIiB5MT0iMjEwIiB4Mj0iMjMwIiB5Mj0iMjIyIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=', 'T-Shirts', 599
  where not exists (select 1 from public.upcycled_items where name = 'Old-Tee Braided Rug');
insert into public.upcycled_items (name, description, image_url, source_category, price)
  select 'Kurta Fabric Coasters (Set of 4)', 'Quilted coasters cut from retired handloom kurtas, backed with scrap cotton batting.', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlN2RmY2UiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTg1IiByPSI0NiIgZmlsbD0iIzdhNWE4YSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiLz4KPGNpcmNsZSBjeD0iMTQwIiBjeT0iMTY1IiByPSI0NiIgZmlsbD0iIzdhNWE4YSIgc3Ryb2tlPSIjMWUxYTE2IiBzdHJva2Utd2lkdGg9IjMiIG9wYWNpdHk9IjAuOSIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSIxNDUiIHI9IjQ2IiBmaWxsPSIjN2E1YThhIiBzdHJva2U9IiMxZTFhMTYiIHN0cm9rZS13aWR0aD0iMyIgb3BhY2l0eT0iMC44NSIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSIxNDUiIHI9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZGZiZjYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iMyA0Ii8+Cjwvc3ZnPg==', 'Kurtas', 249
  where not exists (select 1 from public.upcycled_items where name = 'Kurta Fabric Coasters (Set of 4)');
insert into public.upcycled_items (name, description, image_url, source_category, price)
  select 'Saree Silk Scrunchie Set', 'A set of three scrunchies made from saree silk off-cuts that were too small to reuse any other way.', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMzAwIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlMmRhYzgiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTQ1IiByPSIxMDgiIGZpbGw9IiNmZGZiZjYiIG9wYWNpdHk9IjAuNTUiLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTUwIiByPSI3MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYjY1YTM0IiBzdHJva2Utd2lkdGg9IjI4Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjE1MCIgcj0iNzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFlMWExNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIyIDYiLz4KPC9zdmc+', 'Sarees', 149
  where not exists (select 1 from public.upcycled_items where name = 'Saree Silk Scrunchie Set');

-- ---- Link some products to what they could become via ReThread Circle ----
insert into public.product_upcycle_links (product_id, upcycled_item_id)
  select p.id, u.id from public.products p, public.upcycled_items u
  where p.name = 'Everyday Denim Jeans' and u.name = 'Denim Patchwork Tote'
  and not exists (
    select 1 from public.product_upcycle_links l
    where l.product_id = p.id and l.upcycled_item_id = u.id
  );
insert into public.product_upcycle_links (product_id, upcycled_item_id)
  select p.id, u.id from public.products p, public.upcycled_items u
  where p.name = 'Everyday Denim Jeans' and u.name = 'Denim Sling Pouch'
  and not exists (
    select 1 from public.product_upcycle_links l
    where l.product_id = p.id and l.upcycled_item_id = u.id
  );
insert into public.product_upcycle_links (product_id, upcycled_item_id)
  select p.id, u.id from public.products p, public.upcycled_items u
  where p.name = 'Classic Cotton Shirt' and u.name = 'Shirt-to-Cushion Cover (Set of 2)'
  and not exists (
    select 1 from public.product_upcycle_links l
    where l.product_id = p.id and l.upcycled_item_id = u.id
  );
insert into public.product_upcycle_links (product_id, upcycled_item_id)
  select p.id, u.id from public.products p, public.upcycled_items u
  where p.name = 'Handloom Cotton Kurta' and u.name = 'Kurta Fabric Coasters (Set of 4)'
  and not exists (
    select 1 from public.product_upcycle_links l
    where l.product_id = p.id and l.upcycled_item_id = u.id
  );
insert into public.product_upcycle_links (product_id, upcycled_item_id)
  select p.id, u.id from public.products p, public.upcycled_items u
  where p.name = 'Organic Cotton Crew T-Shirt' and u.name = 'Old-Tee Braided Rug'
  and not exists (
    select 1 from public.product_upcycle_links l
    where l.product_id = p.id and l.upcycled_item_id = u.id
  );
