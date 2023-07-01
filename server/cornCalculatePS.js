import cron from 'node-cron';
import axios from 'axios';
import {
  calculateElectricityProduced,
  getRandomNumber,
  weathertoken,
  convertToDoubleDigit,
} from './commonFunctions.js';
import { Product, Project, PvDetails, User } from './db/index.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment/moment.js';
import { generateAndSendPDF } from './genrateDocument.js';
// Define the cron schedule to run every hour
export const executeCorn = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const currentdate = new Date();
      const fromDate = moment().format('YYYY-MM-DD');
      const endDate = moment().add(1, 'days').format('YYYY-MM-DD');
      // Make a request to the weather API

      try {
        const data = await Product.find().lean();
        data?.map(async (productData) => {
          const weatherResponse = await axios.get(
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
          const pvData = await PvDetails.findOne({
            product: productData.id,
          }).lean();
          await autoGenrateReportFor30Days(productData);
          const dateWithHours = `${fromDate}:${convertToDoubleDigit(
            currentdate.getHours()
          )}`;
          const productPayload = {
            id: uuidv4(),
            product: productData.id,
            project: productData.project,
            user: productData.user,
            hourWiseData: [],
          };
          if (
            !weatherResponse.data.data ||
            !weatherResponse?.data?.data.length
          ) {
            console.error(
              'Issue with weather API',
              weatherResponse?.data?.data
            );
            return 'Issue with weather API';
          }

          const filteredData = await weatherResponse?.data?.data?.filter(
            (weather) => weather?.datetime === dateWithHours
          );
          if(filteredData?.length){
            const { powerPeak, area,inclination  } = productData
            const opitionalSolarVal = getRandomNumber()
            const pvValue = await calculateElectricityProduced(productData, filteredData[0], opitionalSolarVal);
            const finalObj = {
              dateAndTime: dateWithHours,
              pvValue: pvValue,
              powerPeak: powerPeak,
              area: area,
              inclination: inclination,
              solarRad: filteredData[0]?.solar_rad ?? opitionalSolarVal
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

const autoGenrateReportFor30Days = async (productData) => {
  const projectDetails = await Project.findOne({
    id: productData.project,
  }).lean();
  if (projectDetails.createdDate && !projectDetails?.isReportGeneratd) {
    //
    const after30Days = await moment(projectDetails.createdDate)
      .add(31, 'days')
      .format('YYYY-MM-DD');
    const today = await moment().format('YYYY-MM-DD');
    if (after30Days == today) {
      const pvDetails = await PvDetails.find({
        project: productData.project,
        user: productData.user,
      }).lean();
      const userDetails = await User.findOne({ _id: productData.user }).lean();
      generateAndSendPDF(pvDetails, userDetails.email, projectDetails)
        .then(async () => {
          console.log('PDF sent successfully!');
          await Project.updateOne(
            { id: productData.project },
            { $set: { isReportGeneratd: true } }
          );
        })
        .catch((error) => {
          console.error('Error sending PDF:', error);
        });
    }
  }
};

console.log('Cron job started');
