import express from 'express';
import type { Request, Response } from 'express';
import { verifyToken } from '../commonFunctions.js';
import { capacityKwp, fetchPvgisEstimate } from '../solar.js';
import type { ModuleType, MountingType, PanelConfig } from '../solar.js';
import type { PanelOrientation } from '../types.js';

const router = express.Router();

const ORIENTATIONS: PanelOrientation[] = ['N', 'E', 'S', 'W'];
const MODULE_TYPES: ModuleType[] = ['mono', 'poly', 'thin'];
const MOUNTING_TYPES: MountingType[] = ['roof', 'ground', 'track'];

/** Parses and validates the estimate query params; null when anything is off. */
function parsePanel(query: Request['query']): PanelConfig | null {
  const latitude = Number(query.lat);
  const longitude = Number(query.lng);
  const inclination = Number(query.tilt);
  const area = Number(query.area);
  const losses = Number(query.losses ?? 14);
  const orientation = String(query.orientation ?? '') as PanelOrientation;
  const moduleType = String(query.module ?? 'mono') as ModuleType;
  const mounting = String(query.mounting ?? 'roof') as MountingType;

  const valid =
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180 &&
    Number.isFinite(inclination) &&
    inclination >= 0 &&
    inclination <= 90 &&
    Number.isFinite(area) &&
    area > 0 &&
    Number.isFinite(losses) &&
    losses >= 0 &&
    losses < 100 &&
    ORIENTATIONS.includes(orientation) &&
    MODULE_TYPES.includes(moduleType) &&
    MOUNTING_TYPES.includes(mounting);
  if (!valid) return null;

  return { latitude, longitude, orientation, inclination, area, module: moduleType, mounting, losses };
}

// Live pre-submit estimate for the Instant Estimate card: proxies PVGIS so
// the browser gets the real annual + monthly numbers without CORS issues.
// The client debounces and caches calls, so PVGIS is not hit per keystroke.
router.get('/estimate', verifyToken, async (req: Request, res: Response) => {
  const panel = parsePanel(req.query);
  if (!panel) {
    res.status(400).json({ error: 'Invalid or missing estimate parameters' });
    return;
  }

  const estimate = await fetchPvgisEstimate(panel);
  if (!estimate) {
    res.status(502).json({ error: 'The estimate service is unavailable right now' });
    return;
  }

  res.json({
    kwp: capacityKwp(panel.area, panel.module),
    annualKwh: estimate.annualKwh,
    monthlyKwh: estimate.monthlyKwh,
  });
});

export default router;
