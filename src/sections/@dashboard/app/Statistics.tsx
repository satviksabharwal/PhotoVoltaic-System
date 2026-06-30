import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme, styled, Theme } from '@mui/material/styles';
import { Card, CardHeader, CardProps } from '@mui/material';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const StyledChartWrapper = styled('div')(({ theme }: { theme: Theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

interface StatisticsItem {
  label: string;
  value: number;
}

interface StatisticsProps extends CardProps {
  title?: string;
  subheader?: string;
  chartColors?: string[];
  chartData?: StatisticsItem[];
}

export default function Statistics({ title, subheader, chartColors, chartData = [], ...other }: StatisticsProps) {
  const theme = useTheme();

  const chartLabels = chartData.map((i) => `${i.label} (Megabytes)`);

  const chartSeries = chartData.map((i) => i.value);

  const chartOptions = useChart({
    colors: chartColors,
    labels: chartLabels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, horizontalAlign: 'center' },
    dataLabels: { enabled: true, dropShadow: { enabled: true } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (seriesName: number) => fNumber(seriesName),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: { donut: { labels: { show: false } } },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <StyledChartWrapper dir="ltr">
        <ReactApexChart type="pie" series={chartSeries} options={chartOptions} height={280} />
      </StyledChartWrapper>
    </Card>
  );
}
