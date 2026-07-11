import cron from 'node-cron';
import { supabaseAdmin } from './supabaseAdmin.js';
import { fetchRecentGtiSeries, hourlyEnergyKwh } from './solar.js';
import type { PanelConfig } from './solar.js';
import type { ProductRow } from './types.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_PAST_DAYS = 92;

function toPanelConfig(product: ProductRow): PanelConfig {
  return {
    latitude: product.latitude,
    longitude: product.longitude,
    orientation: product.orientation,
    inclination: product.inclination,
    area: product.area,
    module: product.module_type ?? 'mono',
    mounting: product.mounting ?? 'roof',
    losses: product.losses_pct ?? 14,
  };
}


async function collectForSite(productData: ProductRow, nowMs: number): Promise<void> {
  try {
    const panel = toPanelConfig(productData);
    const createdMs = Date.parse(productData.created_at);
    const createdHourMs = Number.isNaN(createdMs) ? 0 : Math.floor(createdMs / HOUR_MS) * HOUR_MS;
    const pastDays = Number.isNaN(createdMs)
      ? 3
      : Math.min(MAX_PAST_DAYS, Math.max(1, Math.ceil((nowMs - createdMs) / DAY_MS)));

    const series = await fetchRecentGtiSeries(panel, pastDays);
    if (!series) {
      console.error(`No irradiance data for site ${productData.id}`);
      return;
    }

    // Upsert a reading for every PAST hour since the site existed; future
    // (forecast) hours are skipped and picked up once they happen.
    const rows = series.time.flatMap((hourIso, index) => {
      const gti = series.gti[index];
      if (gti == null) return [];
      const hourMs = Date.parse(`${hourIso}:00Z`);
      if (Number.isNaN(hourMs) || hourMs > nowMs || hourMs < createdHourMs) return [];
      const pvValue = hourlyEnergyKwh(panel, gti);
      return [
        {
          product_id: productData.id,
          project_id: productData.project_id,
          user_id: productData.user_id,
          recorded_at: new Date(hourMs).toISOString(),
          pv_value: pvValue,
          power_peak: pvValue * 1000,
          area: productData.area,
          inclination: productData.inclination,
          solar_rad: gti,
        },
      ];
    });
    if (rows.length === 0) return;

    const { data: inserted, error: upsertError } = await supabaseAdmin
      .from('pv_readings')
      .upsert(rows, { onConflict: 'product_id,recorded_at', ignoreDuplicates: true })
      .select('id');
    if (upsertError) {
      console.error('Error saving readings:', upsertError);
    } else if (inserted?.length) {
      console.log(`Recorded ${inserted.length} new reading(s) for site ${productData.id}`);
    }
  } catch (err) {
    console.error('Error processing site', productData.id, err);
  }
}

/** One collection pass. Exported so /cron/run (external trigger) can call it. */
export const collectHourlyReadings = async () => {
  try {
    // Inner join so only sites whose parent project is active are returned
    // (`active` is NOT NULL DEFAULT TRUE, so equality covers every row).
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*, projects!inner(active)')
      .eq('projects.active', true);
    if (error) throw error;

    const sites = (products ?? []) as ProductRow[];
    const nowMs = Date.now();

    for (let index = 0; index < sites.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop -- sequential on purpose: gentle on Open-Meteo
      await collectForSite(sites[index], nowMs);
    }

    console.log(`Collection pass finished at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error occurred during electricity calculation:', error);
  }
};

export const executeCorn = () => {
  cron.schedule('5 * * * *', () => {
    collectHourlyReadings();
  });

  // Immediate pass on boot: a restart backfills whatever was missed while down.
  collectHourlyReadings();

  console.log('Cron job started');
};
