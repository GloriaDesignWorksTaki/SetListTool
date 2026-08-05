-- セットリスト永続化用テーブル
-- Supabase SQL Editor で実行してください

create table if not exists public.setlists (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  event_date text,
  venue text,
  event_title text,
  updated_at timestamptz not null default now(),
  unique (band_id)
);

create index if not exists setlists_user_id_idx on public.setlists (user_id);
create index if not exists setlists_band_id_idx on public.setlists (band_id);

alter table public.setlists enable row level security;

-- 本人のみ読み書き（anon/authenticated 用）
drop policy if exists "setlists_select_own" on public.setlists;
create policy "setlists_select_own"
  on public.setlists for select
  using (auth.uid() = user_id);

drop policy if exists "setlists_insert_own" on public.setlists;
create policy "setlists_insert_own"
  on public.setlists for insert
  with check (auth.uid() = user_id);

drop policy if exists "setlists_update_own" on public.setlists;
create policy "setlists_update_own"
  on public.setlists for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "setlists_delete_own" on public.setlists;
create policy "setlists_delete_own"
  on public.setlists for delete
  using (auth.uid() = user_id);
