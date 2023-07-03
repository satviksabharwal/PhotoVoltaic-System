import { Container, Fab, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import EqualizerIcon from "@mui/icons-material/Equalizer";
// @mui
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../store/user/user.selector";
import { AppCurrentSubject, AppWebsiteVisits } from "../sections/@dashboard/app";

const ProductVisualization = () => {
  const params = useParams();
  const { state } = useLocation();
  const theme = useTheme();
  const currentUser = useSelector(selectCurrentUser);
  const [productPvData, setProductPvData] = useState([]);
  const [dateTime, setDateTime] = useState([]);
  const [powerPeakData, setPowerPeakData] = useState([]);
  const [pvValue, setPvValue] = useState([]);

  useEffect(() => {
    try {
      const url = `http://localhost:5500/api/project/getPVData?productId=${params?.productId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      axios.get(url, config).then(
        (response) => {
          setDateTime([]);
          setPowerPeakData([]);
          response.data.hourWiseData?.map((product) => setDateTime((dateTime) => [...dateTime, product?.dateAndTime]));
          response.data.hourWiseData?.map((product) =>
            setPowerPeakData((powerPeakData) => [...powerPeakData, product?.powerPeak])
          );
          response.data.hourWiseData?.map((product) => setPvValue((pvValue) => [...pvValue, product?.pvValue]));
          setProductPvData(response.data.hourWiseData);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  }, []);

  const chartData = productPvData?.map((product) => ({
    name: product.dateAndTime,
    data: [product.pvValue, product.powerPeak, product?.solarRad, product?.inclination, product?.area],
  }));

  return (
    <>
      <Helmet>
        <title>{`${state}`}</title>
      </Helmet>
      <Container maxWidth="l">
        <Typography variant="h4" sx={{ mb: 5 }}>
          <Fab
            variant="extended"
            size="small"
            style={{ backgroundColor: "#48B2E3", color: "#fff", cursor: "auto" }}
            aria-label="add"
          >
            <span style={{ marginLeft: "10px" }}>{state} : Data Visualization</span>
            <EqualizerIcon sx={{ ml: 1, mr: 2 }} />
          </Fab>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <AppWebsiteVisits
              title="Power Peak Every Hour"
              subheader=""
              chartLabels={dateTime}
              chartData={[
                {
                  name: "Power Peak value",
                  type: "area",
                  fill: "gradient",
                  data: powerPeakData,
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <AppWebsiteVisits
              title="PV Value every hour"
              subheader=""
              chartLabels={dateTime}
              chartData={[
                {
                  name: "PV Value",
                  type: "area",
                  fill: "solid",
                  data: pvValue,
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Statstics"
              chartLabels={["PV value", "Power Peak", "Solar Irradiance", "Inclination", "Area"]}
              chartData={chartData}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ProductVisualization;
