import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box, CardProps } from '@mui/material';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

interface WebsiteVisitsSeries {
  name: string;
  type: string;
  fill: string;
  data: number[];
}

interface AppWebsiteVisitsProps extends CardProps {
  title?: string;
  subheader?: string;
  chartData: WebsiteVisitsSeries[];
  chartLabels: string[];
}

export default function AppWebsiteVisits({ title, subheader, chartLabels, chartData, ...other }: AppWebsiteVisitsProps) {
  const chartOptions = useChart({
    plotOptions: { bar: { columnWidth: '16%' } },
    fill: { type: chartData.map((i) => i.fill) },
    labels: chartLabels,
    xaxis: { type: 'category' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y: number) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)}`;
          }
          return `${y}`;
        },
      },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={chartData} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
