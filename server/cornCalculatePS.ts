import cron from 'node-cron';
import axios from 'axios';
import moment from 'moment';
import {
  calculateElectricityProduced,
  getRandomNumber,
  weathertoken,
  convertToDoubleDigit,
} from './commonFunctions.js';
import type { WeatherHistoryResponse } from './commonFunctions.js';
import { supabaseAdmin } from './supabaseAdmin.js';
import { generateAndSendPDF } from './genrateDocument.js';
import { readingsToLegacyPvDetails } from './mappers.js';
import type { ProductRow, ProfileRow, ProjectRow, PvReadingRow } from './types.js';

// Define the cron schedule to run every hour
export const executeCorn = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const currentdate = new Date();
      const fromDate = moment().format('YYYY-MM-DD');
      const endDate = moment().add(1, 'days').format('YYYY-MM-DD');
      // The hour bucket this run writes; unique(product_id, recorded_at)
      // makes re-runs within the same hour no-ops.
      const recordedAt = moment().startOf('hour').toISOString(true);

      try {
        const { data: products, error } = await supabaseAdmin
          .from('products')
          .select('*');
        if (error) throw error;

        (products as ProductRow[]).forEach(async (productData) => {
          const weatherResponse = await axios.get<WeatherHistoryResponse>(
            'https://api.weatherbit.io/v2.0/history/hourly',
            {
              params: {
                lat: productData.latitude,
                lon: productData.longitude,
                start_date: fromDate,
                end_date: endDate,
                key: weathertoken,
              },
            }
          );
          await autoGenrateReportFor30Days(productData);
          const dateWithHours = `${fromDate}:${convertToDoubleDigit(
            currentdate.getHours()
          )}`;
          if (
            !weatherResponse.data.data ||
            !weatherResponse.data.data.length
          ) {
            console.error(
              'Issue with weather API',
              weatherResponse?.data?.data
            );
            return;
          }

          const filteredData = weatherResponse.data.data.filter(
            (weather) => weather?.datetime === dateWithHours
          );
          if (filteredData?.length) {
            const { area, inclination } = productData;
            const opitionalSolarVal = getRandomNumber();
            const pvValue = await calculateElectricityProduced(
              productData,
              filteredData[0],
              opitionalSolarVal
            );
            const unixTimestamp = filteredData[0]?.ts;
            const dateTs = new Date((unixTimestamp ?? NaN) * 1000);
            // Hours part from the timestamp
            const hoursTs = dateTs.getHours();
            const powerPeak = (pvValue * 1000) / (hoursTs ?? opitionalSolarVal);

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
                  area,
                  inclination,
                  solar_rad: filteredData[0]?.dni ?? opitionalSolarVal,
                },
                { onConflict: 'product_id,recorded_at', ignoreDuplicates: true }
              )
              .select();
            if (upsertError) {
              console.error('Error saving reading:', upsertError);
            } else if (inserted?.length) {
              console.log("calculation completed for the hour and it's created");
            } else {
              console.log('Data already updated');
            }
          }
        });
      } catch (err) {
        // Handle the error
        console.error(err);
      }

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
