-- ============================================================
-- 003_orders.sql
-- Stores orders once a payment is confirmed by Razorpay.
-- Rows here are only ever written by the "verify-razorpay-payment"
-- Edge Function (using the service_role key), never directly by
-- the browser — that's what makes the payment trustworthy.
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  status text not null default 'created', -- created | paid | failed
  amount_total numeric(10, 2) not null,
  currency text not null default 'INR',
  shipping_name text,
  shipping_phone text,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text default 'India',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

comment on table public.orders is 'One row per checkout attempt. Written server-side only, by the verify-razorpay-payment Edge Function.';

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  product_id bigint not null references public.products (id),
  variant_id bigint references public.product_variants (id),
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null default 1
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers can see their own orders (and their line items), but can
-- never insert/update — only the Edge Function (service_role, which
-- bypasses RLS) is allowed to write.
drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Customers can view their own order items" on public.order_items;
create policy "Customers can view their own order items"
  on public.order_items for select
  using (order_id in (select id from public.orders where user_id = auth.uid()));
