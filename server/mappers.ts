import moment from 'moment';
import type { ProjectRow, ProductRow, PvReadingRow } from './types.js';

// ----------------------------------------------------------------------------
// Postgres rows → the legacy JSON shapes the React client already consumes
// (src/types/models.ts). This keeps the API contract stable while the data
// layer moves off MongoDB; the shapes can be modernised together with the
// SolarSense page rebuilds.
// ----------------------------------------------------------------------------

export function toLegacyProject(row: ProjectRow) {
  return {
    id: row.id,
    name: row.name,
    isReportGeneratd: row.report_generated,
    createdDate: row.created_at,
    location: row.location ?? null,
    active: row.active ?? true,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export function toLegacyProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    orientation: row.orientation,
    inclination: row.inclination,
    area: row.area,
    longitude: row.longitude,
    latitude: row.latitude,
    project: row.project_id,
    powerPeak: row.power_peak ?? undefined,
    pvValue: row.pv_value ?? undefined,
    isReportGeneratdProduct: row.report_generated,
    // SolarSense fields (defaults for rows saved before the migration).
    module: row.module_type ?? 'mono',
    mounting: row.mounting ?? 'roof',
    losses: row.losses_pct ?? 14,
    tariff: row.tariff ?? null,
    kwp: row.kwp ?? null,
    estAnnualKwh: row.est_annual_kwh ?? null,
  };
}

export interface LegacyPvDetails {
  id: string;
  product: string;
  project: string;
  user: string;
  hourWiseData: LegacyPvHourEntry[];
}

export interface LegacyPvHourEntry {
  dateAndTime: string;
  pvValue: number;
  powerPeak: number;
  area: number;
  inclination: number;
  solarRad: number;
}

/** The "YYYY-MM-DD:HH" stamp format used across readings and the cron. */
export function toHourStamp(recordedAt: string | Date): string {
  return moment(recordedAt).format('YYYY-MM-DD:HH');
}

/**
 * Groups pv_readings rows (one per product per hour) back into the legacy
 * one-object-per-product `hourWiseData` shape.
 */
export function readingsToLegacyPvDetails(rows: PvReadingRow[]): LegacyPvDetails[] {
  const byProduct = new Map<string, LegacyPvDetails>();
  rows.forEach((row) => {
    let details = byProduct.get(row.product_id);
    if (!details) {
      details = {
        id: row.product_id,
        product: row.product_id,
        project: row.project_id,
        user: row.user_id,
        hourWiseData: [],
      };
      byProduct.set(row.product_id, details);
    }
    details.hourWiseData.push({
      dateAndTime: toHourStamp(row.recorded_at),
      pvValue: row.pv_value,
      powerPeak: row.power_peak ?? 0,
      area: row.area ?? 0,
      inclination: row.inclination ?? 0,
      solarRad: row.solar_rad ?? 0,
    });
  });
  const allDetails = [...byProduct.values()];
  allDetails.forEach((details) => {
    details.hourWiseData.sort((a, b) => a.dateAndTime.localeCompare(b.dateAndTime));
  });
  return allDetails;
}
