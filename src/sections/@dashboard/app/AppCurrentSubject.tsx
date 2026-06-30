import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
// @mui
import { styled, Theme } from '@mui/material/styles';
import { Card, CardHeader, CardProps } from '@mui/material';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 392;

const LEGEND_HEIGHT = 72;

const StyledChartWrapper = styled('div')(({ theme }: { theme: Theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(2),
  '& .apexcharts-canvas svg': {
    height: CHART_HEIGHT,
  },
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

interface AppCurrentSubjectProps extends CardProps {
  title?: string;
  subheader?: string;
  chartData: ApexOptions['series'];
  chartColors: string[];
  chartLabels: string[];
}

export default function AppCurrentSubject({
  title,
  subheader,
  chartData,
  chartColors,
  chartLabels,
  ...other
}: AppCurrentSubjectProps) {
  const chartOptions = useChart({
    stroke: { width: 2 },
    fill: { opacity: 0.48 },
    legend: { floating: true, horizontalAlign: 'center' },
    xaxis: {
      categories: chartLabels,
      labels: {
        style: {
          colors: chartColors,
        },
      },
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <StyledChartWrapper dir="ltr">
        <ReactApexChart type="radar" series={chartData} options={chartOptions} height={340} />
      </StyledChartWrapper>
    </Card>
  );
}
