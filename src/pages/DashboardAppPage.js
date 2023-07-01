import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import axios from "axios";
import { Grid, Container, Typography } from "@mui/material";
// selector
import { selectCurrentUser } from "../store/user/user.selector";
// sections
import { AppWebsiteVisits, AppWidgetSummary, AppConversionRates } from "../sections/@dashboard/app";
import VisualMap from "./VisualMap";

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
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

  const chartData = productData?.map((product) => ({
    label: product.name,
    value: product.pvValue,
  }));

  return (
    <>
      <Helmet>
        <title> Dashboard | PV System </title>
      </Helmet>

      <Container maxWidth="l">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back, {currentUser && currentUser.displayName}!
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Total Projects"
              total={projectData?.length || "0"}
              color="info"
              icon={"ant-design:windows-filled"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Total Products"
              total={productData?.length || "0"}
              color="error"
              icon={"ant-design:bug-filled"}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <VisualMap productData={productData} />
          </Grid>
          {projectName?.length > 0 ? (
            <Grid item xs={12} md={6} lg={6}>
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
                ]}
              />
            </Grid>
          ) : (
            <Grid item xs={12} md={6} lg={6}>
              <AppWebsiteVisits
                title="No. of Products as per Project"
                subheader="No Project Created so far"
                chartLabels={[]}
                chartData={[]}
              />
            </Grid>
          )}
          <Grid item xs={12} md={6} lg={6}>
            {chartData?.length > 0 ? (
              <AppConversionRates title="PV Value Statistics" subheader="" chartData={chartData} />
            ) : (
              <AppConversionRates
                title="PV Value Statistics"
                subheader="No Product created so far"
                chartData={[{ label: "", value: 0 }]}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
