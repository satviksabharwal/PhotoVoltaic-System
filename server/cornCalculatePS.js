import cron from "node-cron";
import axios from "axios";

// Define the cron schedule to run every hour
export const executeCorn = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      // Make a request to the weather API
      const response = await axios.get('https://api.weatherbit.io/v2.0/history/subhourly', {
        params: {
          lat: 12.97,
          lon: 77.59,
          start_date: '2023-06-22',
          end_date: '2023-06-22',
          key: '2a70c306e8814c639c7a7f34521670aa'
        }
      });
  
      // Process the response and calculate electricity produced
      // TODO: Caluclation part
      await calculateElectricityProduced(response)
      
      console.log('Electricity calculation completed for the hour');
    } catch (error) {
      console.error('Error occurred during electricity calculation:', error);
    }
  });
  
  async function calculateElectricityProduced(product, weatherData) {
    // Extract relevant information from the product and weather data
    const { powerPeak, area } = product;
    const { data } = weatherData;
  
    // Calculate the total electricity produced for the given product
    let totalElectricityProduced = 0;
    for (const hourData of data) {
      // Assuming power output is proportional to solar radiation (replace with actual calculation)
      const solarRadiation = hourData.solar_radiation;
      const electricityProduced = (powerPeak * area) * solarRadiation;
      totalElectricityProduced += electricityProduced;
    }
  
    // Return the total electricity produced
    return totalElectricityProduced;
  }
}



console.log('Cron job started');