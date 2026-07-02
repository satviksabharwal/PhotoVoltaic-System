import axios from 'axios';
import type { PanelOrientation } from './types.js';

// ----------------------------------------------------------------------------
// Solar data + energy math. Two free, keyless data sources:
//   - Open-Meteo: hourly global tilted irradiance (GTI) on the panel plane,
//     used by the hourly cron and at site creation.
//   - PVGIS (EU JRC): authoritative annual production estimate, fetched once
//     per site create/update and stored on the product row.
// ----------------------------------------------------------------------------

export type ModuleType = 'mono' | 'poly' | 'thin';
export type MountingType = 'roof' | 'ground' | 'track';

/** Module Wp/m² — also the STC efficiency ×1000 (205 Wp/m² ⇒ 20.5%). */
export const WP_PER_M2: Record<ModuleType, number> = { mono: 205, poly: 175, thin: 120 };

/** Panel-plane azimuth in the Open-Meteo/PVGIS convention: 0°=S, -90°=E, 90°=W. */
const ORIENTATION_AZIMUTH: Record<PanelOrientation, number> = { S: 0, E: -90, W: 90, N: 180 };

const REQUEST_TIMEOUT_MS = 10_000;

export interface PanelConfig {
  latitude: number;
  longitude: number;
  orientation: PanelOrientation;
  /** Tilt from horizontal in degrees (0–90). */
  inclination: number;
  area: number;
  module: ModuleType;
  mounting: MountingType;
  /** System losses in percent (e.g. 14). */
  losses: number;
}

export function capacityKwp(area: number, module: ModuleType): number {
  return (area * WP_PER_M2[module]) / 1000;
}

/**
 * Energy produced in one hour (kWh) at the given panel-plane irradiance:
 * GTI (W/m²) × area × module efficiency × (1 − losses).
 */
export function hourlyEnergyKwh(panel: PanelConfig, gtiWm2: number): number {
  const efficiency = WP_PER_M2[panel.module] / 1000;
  const lossFactor = 1 - panel.losses / 100;
  return (gtiWm2 * panel.area * efficiency * lossFactor) / 1000;
}

interface OpenMeteoResponse {
  hourly?: {
    time?: string[];
    global_tilted_irradiance?: (number | null)[];
  };
}

/**
 * Fetches the panel-plane irradiance (W/m²) for the current UTC hour from
 * Open-Meteo. Returns null when the API is unreachable or has no value.
 */
export async function fetchCurrentGti(panel: PanelConfig): Promise<number | null> {
  try {
    const response = await axios.get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
      timeout: REQUEST_TIMEOUT_MS,
      params: {
        latitude: panel.latitude,
        longitude: panel.longitude,
        hourly: 'global_tilted_irradiance',
        tilt: panel.inclination,
        azimuth: ORIENTATION_AZIMUTH[panel.orientation],
        past_days: 1,
        forecast_days: 1,
        timezone: 'UTC',
      },
    });
    const { time, global_tilted_irradiance: gti } = response.data.hourly ?? {};
    if (!time || !gti) return null;
    const currentUtcHour = `${new Date().toISOString().slice(0, 13)}:00`;
    const index = time.indexOf(currentUtcHour);
    if (index === -1) return null;
    return gti[index] ?? null;
  } catch (error) {
    console.error('Open-Meteo request failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

interface PvgisResponse {
  outputs?: { totals?: { fixed?: { E_y?: number } } };
}

/**
 * Fetches the yearly production estimate (kWh) from PVGIS for this panel
 * configuration. Returns null when PVGIS is unreachable — callers store the
 * estimate best-effort.
 */
export async function fetchPvgisAnnualKwh(panel: PanelConfig): Promise<number | null> {
  const peakpower = capacityKwp(panel.area, panel.module);
  if (peakpower <= 0) return null;
  try {
    const response = await axios.get<PvgisResponse>('https://re.jrc.ec.europa.eu/api/v5_2/PVcalc', {
      timeout: REQUEST_TIMEOUT_MS,
      params: {
        lat: panel.latitude,
        lon: panel.longitude,
        peakpower,
        loss: panel.losses,
        angle: panel.inclination,
        aspect: ORIENTATION_AZIMUTH[panel.orientation],
        mountingplace: panel.mounting === 'roof' ? 'building' : 'free',
        outputformat: 'json',
      },
    });
    return response.data.outputs?.totals?.fixed?.E_y ?? null;
  } catch (error) {
    console.error('PVGIS request failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
