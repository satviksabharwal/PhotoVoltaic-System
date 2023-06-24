import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { faker } from "@faker-js/faker";
import { toast } from "react-toastify";
import axios from "axios";
// @mui
import { useTheme } from "@mui/material/styles";
import { Grid, Container, Typography } from "@mui/material";
// selector
import { selectCurrentUser } from "../store/user/user.selector";

// components
import Iconify from "../components/iconify";
// sections
import {
  AppCurrentVisits,
  AppWebsiteVisits,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
} from "../sections/@dashboard/app";
import VisualMap from "./VisualMap";

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [projectData, setProjectData] = useState();
  const [productData, setProductData] = useState();
  const [projectName, setProjectName] = useState([]);
  const [productLength, setProductLength] = useState([]);

  const fetchProjectApiCall = () => {
    try {
      const url = "http://localhost:5500/api/project";
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      axios.get(url, config).then(
        (response) => {
          setProjectName([]);
          setProductLength([]);
          setProjectData(response.data);
          response.data.map((projData) => {
            try {
              const url = `http://localhost:5500/api/product?projectId=${projData?.id}`;
              const config = {
                headers: { Authorization: currentUser?.tokenId },
              };
              axios.get(url, config).then(
                (response) => {
                  setProjectName((projectName) => [...projectName, projData?.name]);
                  setProductLength((productLength) => [...productLength, response.data.length]);
                },
                (error) => {
                  toast.error(error.data.message);
                }
              );
            } catch (error) {
              toast.error(error);
            }
            return null;
          });
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const getAllProductData = () => {
    try {
      const url = `http://localhost:5500/api/product`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      axios.get(url, config).then(
        (response) => {
          setProductData(response.data);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (currentUser === undefined && currentUser.email === undefined) {
      navigate("/login");
    }
    fetchProjectApiCall();
    getAllProductData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <Container maxWidth="l">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back, {currentUser && currentUser.displayName}!
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Total Projects"
              total={projectData?.length}
              color="info"
              icon={"ant-design:windows-filled"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Total Products"
              total={productData?.length}
              color="error"
              icon={"ant-design:bug-filled"}
            />
          </Grid>
          {/* <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Item Orders" total={1723315} color="warning" icon={"ant-design:windows-filled"} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Bug Reports" total={234} color="error" icon={"ant-design:bug-filled"} />
          </Grid> */}
          <Grid item xs={12} md={12} lg={12}>
            <VisualMap productData={productData} />
          </Grid>
          {projectName.length > 0 ? (
            <Grid item xs={12} md={6} lg={8}>
              <AppWebsiteVisits
                title="No. of Products as per Project"
                subheader=""
                chartLabels={projectName}
                chartData={[
                  {
                    name: "No. of Product",
                    type: "column",
                    fill: "solid",
                    data: productLength,
                  },
                  // {
                  //   name: "Team B",
                  //   type: "area",
                  //   fill: "gradient",
                  //   data: [44, 55, 41, 67, 22],
                  // },
                  // {
                  //   name: "Team C",
                  //   type: "line",
                  //   fill: "solid",
                  //   data: [30, 25, 36, 30],
                  // },
                ]}
              />
            </Grid>
          ) : (
            <Grid item xs={12} md={6} lg={8}>
              <AppWebsiteVisits
                title="No. of Products as per Project"
                subheader=""
                chartLabels={""}
                chartData={[]}
                // chartData={[
                //   {
                //     name: "No. of Product",
                //     type: "column",
                //     fill: "solid",
                //     data: productLength,
                //   },
                // {
                //   name: "Team B",
                //   type: "area",
                //   fill: "gradient",
                //   data: [44, 55, 41, 67, 22],
                // },
                // {
                //   name: "Team C",
                //   type: "line",
                //   fill: "solid",
                //   data: [30, 25, 36, 30],
                // },
                // ]}
              />
            </Grid>
          )}
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
          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Conversion Rates"
              subheader="(+43%) than last year"
              chartData={[
                { label: "Italy", value: 400 },
                { label: "Japan", value: 430 },
                { label: "China", value: 448 },
                { label: "Canada", value: 470 },
                { label: "France", value: 540 },
                { label: "Germany", value: 580 },
                { label: "South Korea", value: 690 },
                { label: "Netherlands", value: 1100 },
                { label: "United States", value: 1200 },
                { label: "United Kingdom", value: 1380 },
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
}
