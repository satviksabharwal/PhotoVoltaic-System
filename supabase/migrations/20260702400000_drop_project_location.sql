-- The manual project location field is gone: the Projects card now always
-- shows the location rolled up from the project's sites (see product_geo
-- migration), so the free-text column has no readers or writers left.
alter table public.projects drop column if exists location;
