import ReactApexChart from 'react-apexcharts';
// @mui
import { Box, Card, CardHeader, CardProps } from '@mui/material';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

interface ConversionRateItem {
  label: string;
  value: number;
}

interface AppConversionRatesProps extends CardProps {
  title?: string;
  subheader?: string;
  chartData: ConversionRateItem[];
}

export default function AppConversionRates({ title, subheader, chartData, ...other }: AppConversionRatesProps) {
  const chartLabels = chartData.map((i) => i.label);

  const chartSeries = chartData.map((i) => i.value);

  const chartOptions = useChart({
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (seriesName: number) => fNumber(seriesName),
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: { horizontal: true, barHeight: '28%', borderRadius: 2 },
    },
    xaxis: {
      categories: chartLabels,
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ mx: 3 }} dir="ltr">
        <ReactApexChart type="bar" series={[{ data: chartSeries }]} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
