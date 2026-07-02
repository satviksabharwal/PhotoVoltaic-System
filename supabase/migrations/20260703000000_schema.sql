-- ============================================================================
-- SolarSense — complete Supabase schema (baseline, 2026-07-03).
--
-- One file that stands up the entire database on a fresh Supabase project:
-- paste into Dashboard → SQL Editor → Run. It consolidates the five
-- incremental migrations applied to the original project (see git history);
-- the live database already matches this state exactly.
--
-- Everything is idempotent (if not exists / or replace / drop+create), so
-- accidentally running it against an existing database is a no-op.
-- ============================================================================

-- Panel orientation (no `create type if not exists` in Postgres, hence the DO).
do $$ begin
  create type public.orientation as enum ('N', 'E', 'S', 'W');
exception
  when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- profiles: app-level user data. Supabase Auth owns auth.users (credentials,
-- email confirmation, password-reset tokens); one profile row mirrors each
-- auth user. `email` is mirrored so server-side jobs (cron reports) can look
-- it up without an auth session.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email        text not null unique,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- projects: a group of PV sites. `active` toggles from the UI; a project
-- auto-activates when its first site is added. `updated_at` powers the
-- "Updated X ago" label on the Projects cards.
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  name             text not null,
  report_generated boolean not null default false,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, name)
);

-- ----------------------------------------------------------------------------
-- products: one PV site (panel array) with its geometry and panel config.
-- kwp / est_annual_kwh / city / state / country are computed and stored at
-- write time by the server (capacity math, PVGIS estimate, reverse geocoding)
-- so list pages never need external calls.
-- ----------------------------------------------------------------------------
create table if not exists public.products (
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
  module_type      text not null default 'mono' check (module_type in ('mono', 'poly', 'thin')),
  mounting         text not null default 'roof' check (mounting in ('roof', 'ground', 'track')),
  losses_pct       numeric not null default 14,
  tariff           numeric,
  -- Installed capacity: area (m²) × module Wp/m² (mono 205 / poly 175 / thin 120) / 1000.
  kwp              numeric,
  -- PVGIS yearly production estimate (kWh).
  est_annual_kwh   numeric,
  -- Reverse-geocoded place parts (Nominatim) for the Projects location rollup.
  city             text,
  state            text,
  country          text,
  unique (project_id, name)
);

-- ----------------------------------------------------------------------------
-- pv_readings: one row per product per hour, written by the hourly cron.
-- The unique constraint makes the cron idempotent:
-- INSERT ... ON CONFLICT (product_id, recorded_at) DO NOTHING.
-- ----------------------------------------------------------------------------
create table if not exists public.pv_readings (
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

create index if not exists pv_readings_project_idx on public.pv_readings (project_id);
create index if not exists pv_readings_user_idx on public.pv_readings (user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security. The Express server uses the service-role key and
-- bypasses RLS; these policies exist so the public anon key can never read or
-- write another user's rows when the client talks to Supabase directly
-- (e.g. the profile display-name update on the Account Settings page).
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.products enable row level security;
alter table public.pv_readings enable row level security;

drop policy if exists "own profile: select" on public.profiles;
create policy "own profile: select" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "own profile: update" on public.profiles;
create policy "own profile: update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own products" on public.products;
create policy "own products" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own pv_readings" on public.pv_readings;
create policy "own pv_readings" on public.pv_readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a user signs up. `display_name` arrives
-- via supabase.auth.signUp({ options: { data: { display_name } } }).
-- SECURITY DEFINER lets the trigger insert past RLS.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Keep projects.updated_at fresh on any direct project update. (Site changes
-- bump it from application code, since they touch the products table.)
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();
