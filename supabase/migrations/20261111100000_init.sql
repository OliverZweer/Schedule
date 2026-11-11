-- 岁序 · 个人日历 — 初始数据库结构
-- 在 Supabase Dashboard → SQL Editor 中整段执行。
-- 设计原则：所有私人数据由 RLS 按 auth.uid() 隔离；浏览器只使用 anon key。

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- updated_at / version helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.bump_event_version()
returns trigger
language plpgsql
as $$
begin
  new.version = old.version + 1;
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  timezone text not null default 'Asia/Shanghai',
  week_starts_on smallint not null default 1 check (week_starts_on in (0, 1)),
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created before this migration.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  start_time time,
  end_time time,
  all_day boolean not null default true,
  category text not null default 'other',
  color text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_title_not_blank
    check (char_length(btrim(title)) between 1 and 200),
  constraint events_date_order
    check (end_date >= start_date),
  constraint events_time_consistency
    check (
      (all_day and start_time is null and end_time is null)
      or (
        not all_day
        and start_time is not null
        and end_time is not null
        and end_date = start_date
        and end_time > start_time
      )
    ),
  constraint events_category_valid
    check (category in ('study', 'work', 'life', 'meeting', 'other')),
  constraint events_color_valid
    check (color is null or color ~ '^#[0-9a-fA-F]{6}$')
);

create index if not exists events_user_start_idx
  on public.events (user_id, start_date);
create index if not exists events_user_end_idx
  on public.events (user_id, end_date);

alter table public.events enable row level security;

drop policy if exists "events_select_own" on public.events;
create policy "events_select_own"
  on public.events for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own"
  on public.events for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own"
  on public.events for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own"
  on public.events for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists events_bump_version on public.events;
create trigger events_bump_version
  before update on public.events
  for each row execute function public.bump_event_version();

-- ---------------------------------------------------------------------------
-- grants (RLS still applies; anon has no table access at all)
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;
revoke all on table public.profiles from anon;
revoke all on table public.events from anon;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.events to authenticated;

-- ---------------------------------------------------------------------------
-- realtime (phase 4 consumes this; harmless now)
-- ---------------------------------------------------------------------------

alter table public.events replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'events'
  ) then
    alter publication supabase_realtime add table public.events;
  end if;
end;
$$;
