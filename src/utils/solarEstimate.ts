import { ModuleType, MountingType, PanelOrientation } from '../types/models';

// ----------------------------------------------------------------------
// Client-side rough output estimate, per the PROJECT_DETAIL design spec.
// This is a pre-submit ballpark; the authoritative numbers come from the
// backend's hourly weather-based simulation.
// ----------------------------------------------------------------------

export const WP_PER_M2: Record<ModuleType, number> = { mono: 205, poly: 175, thin: 120 };

const ORIENTATION_FACTOR: Record<PanelOrientation, number> = { S: 1, E: 0.84, W: 0.84, N: 0.62 };

const MOUNTING_FACTOR: Record<MountingType, number> = { track: 1.25, ground: 1.03, roof: 1 };

/** kWh per kWp per year at this latitude (very rough, latitude-adjusted). */
function baseYield(lat: number): number {
  return 1250 - Math.max(0, Math.abs(lat) - 40) * 12;
}

/** Recommended tilt for a latitude, clamped to 10–50°. */
export function optimalTilt(lat: number): number {
  return Math.min(50, Math.max(10, Math.round(Math.abs(lat) * 0.87)));
}

export interface EstimateInput {
  area: number;
  lat?: number;
  orientation: PanelOrientation;
  tilt: number;
  module: ModuleType;
  mounting: MountingType;
  /** System losses in percent (e.g. 14). */
  losses: number;
  /** Electricity price in €/kWh; savings are omitted when unset. */
  tariff?: number | null;
}

export interface Estimate {
  /** Installed capacity in kWp. */
  kwp: number;
  /** Estimated annual output in kWh. */
  annualKwh: number;
  /** Yearly savings in €, or null when no tariff is set. */
  savings: number | null;
  /** CO₂ avoided per year in tonnes (~0.38 kg/kWh grid factor). */
  co2Tonnes: number;
  optTilt: number;
}

/** Relative monthly yield weights for the northern hemisphere (Jan–Dec). */
const MONTH_WEIGHTS = [4, 5, 8, 10, 12, 13, 13, 11, 9, 6, 4, 3];

/**
 * Splits an annual estimate into 12 monthly values (Jan–Dec) using a seasonal
 * curve, shifted by six months in the southern hemisphere. A coarse
 * approximation — the estimate card swaps in real PVGIS monthly numbers once
 * they arrive.
 */
export function monthlyDistribution(annualKwh: number, lat?: number): number[] {
  const total = MONTH_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  const southern = (lat ?? 0) < 0;
  return MONTH_WEIGHTS.map((_, index) => {
    const weight = MONTH_WEIGHTS[southern ? (index + 6) % 12 : index];
    return (annualKwh * weight) / total;
  });
}

export function estimateOutput(input: EstimateInput): Estimate | null {
  if (!input.area || input.area <= 0) return null;

  const lat = Math.abs(input.lat ?? 0) || 50;
  const kwp = (input.area * WP_PER_M2[input.module]) / 1000;
  const optTilt = optimalTilt(lat);
  const tiltFactor = 1 - Math.abs(input.tilt - optTilt) / 130;
  const lossFactor = 1 - input.losses / 100;
  const annualKwh =
    kwp *
    baseYield(lat) *
    ORIENTATION_FACTOR[input.orientation] *
    tiltFactor *
    MOUNTING_FACTOR[input.mounting] *
    lossFactor;

  const tariff = input.tariff ?? 0;
  return {
    kwp,
    annualKwh,
    savings: tariff > 0 ? annualKwh * tariff : null,
    co2Tonnes: (annualKwh * 0.38) / 1000,
    optTilt,
  };
}
