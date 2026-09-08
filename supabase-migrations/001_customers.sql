-- ============================================================
-- 001_customers.sql
-- Adds a `customers` table that stores customer names & details,
-- one row per signed-up user, plus a trigger that auto-creates
-- that row the moment someone signs up.
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================

create table if not exists public.customers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'India',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customers is 'One row per registered customer: contact + shipping details.';

-- Keep updated_at current on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute procedure public.set_updated_at();

-- Row Level Security: a customer can only see/edit their own row
alter table public.customers enable row level security;

drop policy if exists "Customers can view own profile" on public.customers;
create policy "Customers can view own profile"
  on public.customers for select
  using (auth.uid() = id);

drop policy if exists "Customers can update own profile" on public.customers;
create policy "Customers can update own profile"
  on public.customers for update
  using (auth.uid() = id);

drop policy if exists "Customers can insert own profile" on public.customers;
create policy "Customers can insert own profile"
  on public.customers for insert
  with check (auth.uid() = id);

-- Auto-create a customers row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.customers (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill: create a customers row for any existing users who signed up
-- before this migration ran.
insert into public.customers (id, email)
select u.id, u.email
from auth.users u
left join public.customers c on c.id = u.id
where c.id is null;
