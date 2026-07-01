import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { Grid, Container, Typography } from '@mui/material';
import api from '../utils/api';
// selector
import { selectCurrentUser } from '../store/user/user.selector';
// sections
import { AppWebsiteVisits, AppWidgetSummary, AppConversionRates } from '../sections/@dashboard/app';
import VisualMap from './VisualMap';
import { Project, Product, CurrentUser } from '../types/models';

// ----------------------------------------------------------------------

interface ChartDataPoint {
  label: string;
  value: number;
}

export default function DashboardAppPage() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [productData, setProductData] = useState<Product[]>([]);
  const [projectName, setProjectName] = useState<string[]>([]);
  const [productLength, setProductLength] = useState<number[]>([]);

  const fetchProjectApiCall = () => {
    try {
      const url = '/project';
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      api.get<Project[]>(url, config).then(
        (response) => {
          setProjectName([]);
          setProductLength([]);
          setProjectData(response.data);
          response.data.map((projData) => {
            try {
              const productUrl = `/product?projectId=${projData?.id}`;
              const productConfig = {
                headers: { Authorization: currentUser?.tokenId },
              };
              api.get<Product[]>(productUrl, productConfig).then(
                (productResponse) => {
                  setProjectName((prevProjectName) => [...prevProjectName, projData?.name]);
                  setProductLength((prevProductLength) => [...prevProductLength, productResponse.data.length]);
                },
                (error) => {
                  toast.error(error.data.message);
                }
              );
            } catch (error) {
              toast.error(String(error));
            }
            return null;
          });
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  const getAllProductData = () => {
    try {
      const url = `/product`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      api.get<Product[]>(url, config).then(
        (response) => {
          setProductData(response.data);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(String(error));
    }
  };

  useEffect(() => {
    // Preserves the original guard: in the store currentUser is `null` (never `undefined`),
    // so this condition is effectively always false and never triggers navigation.
    if ((currentUser as CurrentUser | undefined) === undefined && currentUser?.email === undefined) {
      navigate('/login');
    }
    fetchProjectApiCall();
    getAllProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData: ChartDataPoint[] = productData?.map((product) => ({
    label: product.name,
    value: product.pvValue ?? 0,
  }));

  return (
    <>
      <Helmet>
        <title> Dashboard | PV System </title>
      </Helmet>

      <Container maxWidth={false}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back, {currentUser && currentUser.displayName}!
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Total Projects"
              total={projectData?.length || 0}
              color="info"
              icon={'ant-design:windows-filled'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <AppWidgetSummary
              title="Total Products"
              total={productData?.length || 0}
              color="error"
              icon={'ant-design:bug-filled'}
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
                    name: 'No. of Product',
                    type: 'column',
                    fill: 'solid',
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
            {(chartData?.length ?? 0) > 0 ? (
              <AppConversionRates title="PV Value Statistics" subheader="" chartData={chartData} />
            ) : (
              <AppConversionRates
                title="PV Value Statistics"
                subheader="No Product created so far"
                chartData={[{ label: '', value: 0 }]}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
