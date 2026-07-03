import cron from 'node-cron';
import moment from 'moment';
import { supabaseAdmin } from './supabaseAdmin.js';
import { fetchCurrentGti, hourlyEnergyKwh } from './solar.js';
import type { PanelConfig } from './solar.js';
import type { ProductRow } from './types.js';

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

// Hourly: fetch panel-plane irradiance for every site and record the energy
// produced this hour. unique(product_id, recorded_at) makes re-runs no-ops.
export const executeCorn = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      // The hour bucket this run writes.
      const recordedAt = moment().startOf('hour').toISOString(true);

      const { data: products, error } = await supabaseAdmin.from('products').select('*');
      if (error) throw error;

      (products as ProductRow[]).forEach(async (productData) => {
        try {
          const panel = toPanelConfig(productData);
          const gti = await fetchCurrentGti(panel);
          if (gti == null) {
            console.error(`No irradiance data for site ${productData.id} this hour`);
            return;
          }

          const pvValue = hourlyEnergyKwh(panel, gti);
          // Average power over the hour, in watts.
          const powerPeak = pvValue * 1000;

          const { data: inserted, error: upsertError } = await supabaseAdmin
            .from('pv_readings')
            .upsert(
              {
                product_id: productData.id,
                project_id: productData.project_id,
                user_id: productData.user_id,
                recorded_at: recordedAt,
                pv_value: pvValue,
                power_peak: powerPeak,
                area: productData.area,
                inclination: productData.inclination,
                solar_rad: gti,
              },
              { onConflict: 'product_id,recorded_at', ignoreDuplicates: true }
            )
            .select();
          if (upsertError) {
            console.error('Error saving reading:', upsertError);
          } else if (inserted?.length) {
            console.log(`Recorded ${pvValue.toFixed(3)} kWh for site ${productData.id}`);
          } else {
            console.log('Data already updated');
          }
        } catch (err) {
          console.error('Error processing site', productData.id, err);
        }
      });

      console.log('Electricity calculation completed for the hour');
    } catch (error) {
      console.error('Error occurred during electricity calculation:', error);
    }
  });
};

console.log('Cron job started');
