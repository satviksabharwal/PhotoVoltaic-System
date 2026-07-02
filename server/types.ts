// Row shapes for the Supabase (Postgres) tables, as returned by supabase-js.
// Keep in sync with supabase/migrations/*.sql.

export type PanelOrientation = 'N' | 'E' | 'S' | 'W';

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  report_generated: boolean;
  created_at: string;
  // Added by the solarsense_fields migration.
  location?: string | null;
  active?: boolean;
  updated_at?: string;
}

export interface ProductRow {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  orientation: PanelOrientation;
  inclination: number;
  area: number;
  latitude: number;
  longitude: number;
  pv_value: number | null;
  power_peak: number | null;
  report_generated: boolean;
  created_at: string;
  // Added by the solarsense_fields migration.
  module_type?: 'mono' | 'poly' | 'thin';
  mounting?: 'roof' | 'ground' | 'track';
  losses_pct?: number;
  tariff?: number | null;
  kwp?: number | null;
  // Added by the product_annual_estimate migration (PVGIS yearly kWh).
  est_annual_kwh?: number | null;
}

export interface PvReadingRow {
  id: number;
  product_id: string;
  project_id: string;
  user_id: string;
  recorded_at: string;
  pv_value: number;
  power_peak: number | null;
  area: number | null;
  inclination: number | null;
  solar_rad: number | null;
}
