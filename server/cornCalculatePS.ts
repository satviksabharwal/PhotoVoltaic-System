import cron from 'node-cron';
import moment from 'moment';
import { supabaseAdmin } from './supabaseAdmin.js';
import { generateAndSendPDF } from './genrateDocument.js';
import { readingsToLegacyPvDetails } from './mappers.js';
import { fetchCurrentGti, hourlyEnergyKwh } from './solar.js';
import type { PanelConfig } from './solar.js';
import type { ProductRow, ProfileRow, ProjectRow, PvReadingRow } from './types.js';

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
          await autoGenrateReportFor30Days(productData);

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

const autoGenrateReportFor30Days = async (productData: ProductRow) => {
  const { data: projectDetails, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', productData.project_id)
    .maybeSingle();
  if (error) {
    console.error('Error loading project for 30-day report:', error);
    return;
  }
  const project = projectDetails as ProjectRow | null;
  if (project?.created_at && !project.report_generated) {
    const after30Days = moment(project.created_at).add(31, 'days').format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');
    if (after30Days === today) {
      const { data: readings, error: readingsError } = await supabaseAdmin
        .from('pv_readings')
        .select('*')
        .eq('project_id', productData.project_id)
        .eq('user_id', productData.user_id)
        .order('recorded_at', { ascending: true });
      if (readingsError) {
        console.error('Error loading readings for 30-day report:', readingsError);
        return;
      }
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', productData.user_id)
        .maybeSingle();
      if (!profile) {
        console.error('User profile not found for 30-day report:', productData.user_id);
        return;
      }
      const pvDetails = readingsToLegacyPvDetails(readings as PvReadingRow[]);
      generateAndSendPDF(pvDetails, (profile as ProfileRow).email, project)
        .then(async () => {
          console.log('PDF sent successfully!');
          await supabaseAdmin
            .from('projects')
            .update({ report_generated: true })
            .eq('id', productData.project_id);
        })
        .catch((error) => {
          console.error('Error sending PDF:', error);
        });
    }
  }
};

console.log('Cron job started');
