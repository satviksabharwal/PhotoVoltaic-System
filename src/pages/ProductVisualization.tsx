import { Button, Container, Fab, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EqualizerIcon from "@mui/icons-material/Equalizer";
// @mui
import { useTheme } from "@mui/material/styles";
import { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../store/user/user.selector";
import api from "../utils/api";
import { AppCurrentSubject, AppWebsiteVisits } from "../sections/@dashboard/app";
import { PvDetails, PvDataPoint } from "../types/models";

// ----------------------------------------------------------------------

/** Route params for this page (/dashboard/projects/:projectId/.../:productId). */
type ProductVisualizationParams = {
  projectId?: string;
  productId?: string;
};

/**
 * Shape of the rejection value this page reads. The original code accesses
 * `error.data.message` (rather than the standard `error.response.data`), so the
 * type mirrors that exact access path to preserve runtime behavior.
 */
interface ApiError {
  data: { message?: string };
}

/** Subset of the product item response consumed here. */
interface ProductReportStatusResponse {
  isReportGeneratdProduct?: boolean;
}

/** Radar-chart series entry derived from a PvDataPoint. */
interface SubjectChartSeries {
  name: string;
  data: number[];
}

const ProductVisualization = () => {
  const params = useParams<ProductVisualizationParams>();
  const { state } = useLocation();
  const theme = useTheme();
  const currentUser = useSelector(selectCurrentUser);
  const [productPvData, setProductPvData] = useState<PvDataPoint[]>([]);
  const [dateTime, setDateTime] = useState<string[]>([]);
  const [powerPeakData, setPowerPeakData] = useState<number[]>([]);
  const [pvValue, setPvValue] = useState<number[]>([]);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchProductData = () => {
    try {
      const url = `/project/getPVData?productId=${params?.productId}`;
      const config: AxiosRequestConfig = {
        headers: { Authorization: currentUser?.tokenId },
      };
      api.get<PvDetails>(url, config).then(
        (response) => {
          setDateTime([]);
          setPowerPeakData([]);
          response?.data?.hourWiseData?.map((product) =>
            setDateTime((dateTimeState) => [...dateTimeState, product?.dateAndTime])
          );
          response?.data?.hourWiseData?.map((product) =>
            setPowerPeakData((powerPeakState) => [...powerPeakState, product?.powerPeak])
          );
          response?.data?.hourWiseData?.map((product) =>
            setPvValue((pvValueState) => [...pvValueState, product?.pvValue])
          );
          setProductPvData(response?.data?.hourWiseData);
        },
        (error: ApiError) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const fetchProductReportStatus = () => {
    try {
      const url = `/product/item/?productId=${params?.productId}`;
      const config: AxiosRequestConfig = {
        headers: { Authorization: currentUser?.tokenId },
      };
      api.get<ProductReportStatusResponse>(url, config).then(
        (response) => {
          setReportGenerated(response?.data?.isReportGeneratdProduct ?? false);
        },
        (error: ApiError) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const chartData: SubjectChartSeries[] = productPvData?.map((product) => ({
    name: product.dateAndTime,
    data: [product.pvValue, product.powerPeak, product?.solarRad, product?.inclination, product?.area],
  }));

  const generateReportHandle = () => {
    try {
      const url = `/project/generateApi/product/${params?.productId}`;
      const config: AxiosRequestConfig = {
        headers: { Authorization: currentUser?.tokenId },
      };
      api.get(url, config).then(
        () => {
          toast.success("Report genrated Successfully");
          fetchProductData();
          setReportGenerated(true);
          navigate(`/dashboard/projects/${params?.projectId}`, { replace: true });
        },
        (error: ApiError) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchProductReportStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{`${state}`}</title>
      </Helmet>
      <Container maxWidth={false}>
        <div style={{ display: "flex" }}>
          <Typography variant="h4" sx={{ mb: 5 }}>
            <Fab
              variant="extended"
              size="small"
              style={{ backgroundColor: "#48B2E3", color: "#fff", cursor: "auto" }}
              aria-label="add"
            >
              <span style={{ marginLeft: "10px" }}>{`${state}`} : Data Visualization</span>
              <EqualizerIcon sx={{ ml: 1, mr: 2 }} />
            </Fab>
          </Typography>
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="contained"
              style={{
                backgroundColor: `${reportGenerated ? "orange" : "#5ac85a"} `,
                color: "white",
                marginRight: "20px",
              }}
              disabled
            >
              {reportGenerated ? "Inactive" : "Active"}
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: `${reportGenerated ? "grey" : "#48B2E3"}`, color: "white" }}
              disabled={reportGenerated}
              onClick={generateReportHandle}
            >
              {reportGenerated ? "Report Generated" : "Generate Report"}
            </Button>
          </div>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <AppWebsiteVisits
              title="Power Peak every hour"
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
