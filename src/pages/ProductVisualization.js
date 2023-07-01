import { Container, Fab, Grid, Typography } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useLocation } from "react-router-dom";
import EqualizerIcon from "@mui/icons-material/Equalizer";
// @mui
import { useTheme } from "@mui/material/styles";
import { AppCurrentSubject, AppCurrentVisits } from "../sections/@dashboard/app";

const ProductVisualization = () => {
  const params = useParams();
  const { state } = useLocation();
  const theme = useTheme();
  console.log(state, params);

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
          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Current Visits"
              chartData={[
                { label: "America", value: 4344 },
                { label: "Asia", value: 5435 },
                { label: "Europe", value: 1443 },
                { label: "Africa", value: 4443 },
              ]}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.warning.main,
                theme.palette.error.main,
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={["English", "History", "Physics", "Geography", "Chinese", "Math"]}
              chartData={[
                { name: "Series 1", data: [80, 50, 30, 40, 100, 20] },
                { name: "Series 2", data: [20, 30, 40, 80, 20, 80] },
                { name: "Series 3", data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ProductVisualization;
