-- ============================================================
-- 005_takeback_upgrades.sql
-- Adds real photo uploads (required) to the take-back form, plus
-- a few fields the redesigned take-back page needs: multiple
-- photos, a pickup date, an instant payout estimate, and a
-- terms-accepted checkbox.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run.
-- ============================================================

-- ---- New columns on take_back_requests ----
alter table public.take_back_requests add column if not exists photo_urls text[] not null default '{}';
alter table public.take_back_requests add column if not exists pickup_date date;
alter table public.take_back_requests add column if not exists pickup_address text;
alter table public.take_back_requests add column if not exists estimated_payout_min numeric(10, 2);
alter table public.take_back_requests add column if not exists estimated_payout_max numeric(10, 2);
alter table public.take_back_requests add column if not exists terms_accepted boolean not null default false;

comment on column public.take_back_requests.photo_urls is 'One or more photo URLs uploaded to the take-back-photos storage bucket. Required by the frontend (min 1).';
comment on column public.take_back_requests.estimated_payout_min is 'Instant estimate shown to the customer before grading; final payout is confirmed after physical grading.';

-- ---- Storage bucket for take-back photos ----
insert into storage.buckets (id, name, public)
values ('takeback-photos', 'takeback-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to takeback photos" on storage.objects;
create policy "Public read access to takeback photos"
  on storage.objects for select
  using (bucket_id = 'takeback-photos');

-- Anyone (signed in or not) can upload a take-back photo — this is a
-- public intake form, so we don't require an account to submit one.
drop policy if exists "Anyone can upload takeback photos" on storage.objects;
create policy "Anyone can upload takeback photos"
  on storage.objects for insert
  with check (bucket_id = 'takeback-photos');
