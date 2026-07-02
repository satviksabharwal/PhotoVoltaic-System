-- Reverse-geocoded place parts per site, stored once at create/update time.
-- They power the Projects page location rollup: same city -> "City · Country",
-- same state -> "State · Country", same country -> "Country", else "N countries".
alter table public.products
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists country text;
