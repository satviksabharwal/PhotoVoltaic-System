-- ============================================================================
-- PVGIS annual production estimate — run AFTER 20260702100000_solarsense_fields.sql.
--
-- Stores the authoritative yearly output estimate (kWh) fetched from the
-- EU JRC PVGIS API when a site is created or updated. Null for sites saved
-- while PVGIS was unreachable; the client falls back to its rough formula.
-- ============================================================================

alter table public.products
  add column est_annual_kwh numeric;
