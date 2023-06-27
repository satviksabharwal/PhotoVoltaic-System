import cron from "node-cron";
import axios from "axios";
import {calculateElectricityProduced} from "./commonFunctions.js";
import { Product, PvDetails } from "./db/index.js";
import { v4 as uuidv4 } from "uuid";

// Define the cron schedule to run every hour
export const executeCorn = () => {
  cron.schedule('5 6-20 * * *', async () => {
    try {
      function convertToDoubleDigit(number) {
        if (number < 10) {
          return "0" + number;
        } else {
          return number.toString();
        }
      }
      const currentdate = new Date();
      const fromDate = `${currentdate.getFullYear()}-${convertToDoubleDigit(currentdate.getMonth()+1)}-${convertToDoubleDigit(currentdate.getDate())}`;
      const endDate = `${currentdate.getFullYear()}-${convertToDoubleDigit(currentdate.getMonth()+1)}-${convertToDoubleDigit(currentdate.getDate()+1)}`;
      // Make a request to the weather API
      
      try {
        const data = await Product.find().lean();
        data?.map(async productData => {
          const weatherResponse = await axios.get('https://api.weatherbit.io/v2.0/history/hourly', {
            params: {
              lat: productData.latitude,
              lon: productData.longitude,
              start_date: fromDate,
              end_date: endDate,
              key: '2a70c306e8814c639c7a7f34521670aa'
            }
          });
          const pvData = await PvDetails.findOne({product: productData.id}).lean();
          
          const dateWithHours = `${fromDate}:${convertToDoubleDigit(currentdate.getHours())}`
          const productPayload = {
            id: uuidv4(),
            product: productData.id,
            project: productData.project,
            user: productData.user,
            hourWiseData: [],
          }
          if(!weatherResponse.data.data || !weatherResponse?.data?.data.length) {
            console.error("Issue with weather API", weatherResponse?.data?.data);
            return 'Issue with weather API';
          }
          const filteredData = await weatherResponse?.data?.data?.filter(weather => weather?.datetime === dateWithHours)
          if(filteredData?.length){
            const { powerPeak, area,inclination  } = productData
            const pvValue = await calculateElectricityProduced(productData, filteredData[0]);
            const finalObj = {
              dateAndTime: dateWithHours,
              pvValue: pvValue, 
              powerPeak: powerPeak, 
              area: area,
              inclination: inclination, 
              solarRad: filteredData[0]?.solar_rad ?? 4 
            }
            if(pvData) {
              //Update
              productPayload.hourWiseData = [...pvData.hourWiseData]
              const filteredInPvdetails = pvData.hourWiseData.filter(pv => pv.dateAndTime === dateWithHours)
              if(filteredInPvdetails.length){
                console.log("Data already updated")
                return
              }
              productPayload.hourWiseData.push(finalObj)
              const res = await PvDetails.updateOne({ id : pvData.id }, { $set: { hourWiseData : productPayload.hourWiseData } })
              if (res.n === 0) {
                console.log("calculation completed for the hour and it's updated")
              }
            } else {
              //Create
              await productPayload.hourWiseData.push(finalObj)
              const pvDetailData = new PvDetails(productPayload);
              const res = await pvDetailData.save();
              if (res) {
                console.log("calculation completed for the hour and it's created")
              }
            }
          }
        })
  
      } catch (err) {
        // Handle the error
        console.error(err);
      }
      
      console.log('Electricity calculation completed for the hour');
    } catch (error) {
      console.error('Error occurred during electricity calculation:', error);
    }
  });
  
}



console.log('Cron job started');