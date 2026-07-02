import { useEffect, useState } from 'react';
import api from '../utils/api';
import { ModuleType, MountingType, PanelOrientation } from '../types/models';

// ----------------------------------------------------------------------
// Debounced live estimate from the backend's PVGIS proxy. The instant
// (client-side) approximation renders immediately; once the inputs settle
// this hook fetches the real annual + monthly numbers, which the estimate
// card swaps in. Results are cached per input combination, so toggling a
// segmented control back and forth never refetches.
// ----------------------------------------------------------------------

export interface PvgisEstimateInput {
  lat: number;
  lng: number;
  orientation: PanelOrientation;
  tilt: number;
  area: number;
  module: ModuleType;
  mounting: MountingType;
  losses: number;
}

export interface PvgisEstimateResult {
  kwp: number;
  annualKwh: number;
  /** Real per-month production (Jan–Dec) in kWh. */
  monthlyKwh: number[];
}

const DEBOUNCE_MS = 700;

const cache = new Map<string, PvgisEstimateResult>();

export default function usePvgisEstimate(input: PvgisEstimateInput | null): {
  pvgis: PvgisEstimateResult | null;
  loading: boolean;
} {
  const [pvgis, setPvgis] = useState<PvgisEstimateResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // The effect keys off the serialized input, so an object recreated with the
  // same values on every render doesn't retrigger it.
  const key = input ? JSON.stringify(input) : null;

  useEffect(() => {
    if (!key) {
      setPvgis(null);
      setLoading(false);
      return undefined;
    }

    const cached = cache.get(key);
    if (cached) {
      setPvgis(cached);
      setLoading(false);
      return undefined;
    }

    // New input combination: drop the stale result and wait for it to settle.
    setPvgis(null);
    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const params = JSON.parse(key) as PvgisEstimateInput;
        const response = await api.get<PvgisEstimateResult>('/solar/estimate', { params });
        if (!cancelled) {
          cache.set(key, response.data);
          setPvgis(response.data);
        }
      } catch (error) {
        // Best-effort: the card keeps showing the client-side approximation.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key]);

  return { pvgis, loading };
}
