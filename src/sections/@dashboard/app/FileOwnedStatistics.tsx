import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box, CardProps } from '@mui/material';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

interface FileOwnedSeries {
  name: string;
  type: string;
  fill: string;
  data: number[];
}

interface FileOwnedStatisticsProps extends CardProps {
  title?: string;
  subheader?: string;
  chartData: FileOwnedSeries[];
  chartLabels: string[];
}

export default function FileOwnedStatistics({
  title,
  subheader,
  chartLabels,
  chartData,
  ...other
}: FileOwnedStatisticsProps) {
  const chartOptions = useChart({
    plotOptions: { bar: { columnWidth: '25%' } },
    fill: { type: chartData.map((i) => i.fill) },
    labels: chartLabels,
    xaxis: { type: 'category' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y: number) => {
          if (typeof y !== 'undefined') {
            return `${parseFloat(`${y}`)}`;
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
        <ReactApexChart type="line" series={chartData} options={chartOptions} height={400} />
      </Box>
    </Card>
  );
}
