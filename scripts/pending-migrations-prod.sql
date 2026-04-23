-- ============================================================
-- MIGRATIONS PENDENTES EM PROD (auditoria 2026-04-22)
-- ============================================================
-- Rodar isso no SQL editor do Supabase (dashboard -> SQL Editor).
-- Cada bloco e idempotente (`if not exists` + `on conflict do nothing`).
--
-- Origem:
--   1. supabase/migrations/20260419160000_brand_image_refs.sql
--   2. supabase/migrations/20260419190000_stripe_events_processed.sql
--   3. supabase/migrations/20260420120000_user_images.sql
--   4. supabase/migrations/20260422130000_carousel_images_bucket.sql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1) brand_image_refs em public.profiles (coluna jsonb)
-- ──────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists brand_image_refs jsonb default '[]'::jsonb;

-- ──────────────────────────────────────────────────────────────
-- 2) stripe_events_processed (dedup de webhook)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.stripe_events_processed (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz default now()
);

create index if not exists idx_stripe_events_received
  on public.stripe_events_processed(received_at desc);

alter table public.stripe_events_processed enable row level security;

-- ──────────────────────────────────────────────────────────────
-- 3) user_images (galeria pessoal por user)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.user_images (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  source text not null check (source in ('generated', 'uploaded', 'unsplash', 'search')),
  title text,
  description text,
  tags text[] default '{}',
  prompt text,
  carousel_id uuid references public.carousels(id) on delete set null,
  slide_index int,
  usage_count int default 0,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_user_images_user on public.user_images(user_id, created_at desc);
create index if not exists idx_user_images_source on public.user_images(user_id, source);

alter table public.user_images enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_images' and policyname='Users can view own images'
  ) then
    create policy "Users can view own images"
      on public.user_images for select
      using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_images' and policyname='Users can insert own images'
  ) then
    create policy "Users can insert own images"
      on public.user_images for insert
      with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_images' and policyname='Users can update own images'
  ) then
    create policy "Users can update own images"
      on public.user_images for update
      using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_images' and policyname='Users can delete own images'
  ) then
    create policy "Users can delete own images"
      on public.user_images for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- ──────────────────────────────────────────────────────────────
-- 4) carousel-images storage bucket
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'carousel-images',
  'carousel-images',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read carousel images" on storage.objects;
create policy "Public read carousel images"
  on storage.objects for select
  using (bucket_id = 'carousel-images');
