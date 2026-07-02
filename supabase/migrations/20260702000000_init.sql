-- ============================================================================
-- PhotoVoltaic System — initial Supabase schema.
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- or via the CLI: `supabase db push`.
--
-- Phase 2 (auth swap) only uses `profiles` + the signup trigger; the data
-- tables (projects / products / pv_readings) are created now so Phase 3 can
-- migrate application data out of MongoDB without another schema change.
-- ============================================================================

create type public.orientation as enum ('N', 'E', 'S', 'W');

-- ----------------------------------------------------------------------------
-- profiles: app-level user data. Supabase Auth owns auth.users (credentials,
-- email confirmation, password-reset tokens); one profile row mirrors each
-- auth user. `email` is mirrored so server-side jobs (cron reports) can look
-- it up without an auth session.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email        text not null unique,
  created_at   timestamptz not null default now()
);

create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  name             text not null,
  report_generated boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (user_id, name)
);

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  name             text not null,
  orientation      public.orientation not null,
  inclination      numeric not null,
  area             numeric not null,
  latitude         double precision not null,
  longitude        double precision not null,
  pv_value         double precision,
  power_peak       double precision,
  report_generated boolean not null default false,
  created_at       timestamptz not null default now(),
  unique (project_id, name)
);

-- One row per product per hour (replaces Mongo's hourWiseData array).
-- The unique constraint makes the hourly cron idempotent:
-- INSERT ... ON CONFLICT (product_id, recorded_at) DO NOTHING.
create table public.pv_readings (
  id          bigint generated always as identity primary key,
  product_id  uuid not null references public.products (id) on delete cascade,
  project_id  uuid not null references public.projects (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  recorded_at timestamptz not null,
  pv_value    double precision not null,
  power_peak  double precision,
  -- Snapshot of product config at reading time (products can be edited later).
  area        numeric,
  inclination numeric,
  solar_rad   double precision,
  unique (product_id, recorded_at)
);

create index pv_readings_project_idx on public.pv_readings (project_id);
create index pv_readings_user_idx on public.pv_readings (user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security. The Express server uses the service-role key and
-- bypasses RLS; these policies exist so the public anon key can never read or
-- write another user's rows if the client ever talks to Supabase directly.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.products enable row level security;
alter table public.pv_readings enable row level security;

create policy "own profile: select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile: update" on public.profiles
  for update using (auth.uid() = id);

create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own products" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own pv_readings" on public.pv_readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a user signs up. `display_name` arrives
-- via supabase.auth.signUp({ options: { data: { display_name } } }).
-- SECURITY DEFINER lets the trigger insert past RLS.
-- ----------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
