-- ============================================================================
-- SolarSense redesign fields — run AFTER 20260702000000_init.sql.
--
-- Adds the columns the new Projects / Project Detail pages need:
--   projects: location, active status, updated_at
--   products: module type, mounting, system losses, tariff, kWp capacity
-- ============================================================================
alter table public.projects
add column location text,
  add column active boolean not null default true,
  add column updated_at timestamptz not null default now();
-- Keep updated_at fresh on any direct project update. (Site changes bump it
-- from application code, since they touch the products table instead.)
create function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now();
return new;
end;
$$;
create trigger projects_touch_updated_at before
update on public.projects for each row execute function public.touch_updated_at();
alter table public.products
add column module_type text not null default 'mono' check (module_type in ('mono', 'poly', 'thin')),
  add column mounting text not null default 'roof' check (mounting in ('roof', 'ground', 'track')),
  add column losses_pct numeric not null default 14,
  add column tariff numeric,
  -- Installed capacity: area (m²) × module Wp/m² (mono 205 / poly 175 / thin 120) / 1000.
  -- Computed and stored at write time so project cards can SUM() it cheaply.
add column kwp numeric;