import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import InsightCards from '../sections/insights/InsightCards';
import SunshineFingerprintCard from '../sections/insights/SunshineFingerprintCard';
import CollectingPanel from '../sections/insights/CollectingPanel';
import InsightsLoadingState from '../sections/insights/InsightsLoadingState';
import {
  ApiReading,
  PERIODS,
  PeriodKey,
  READY_THRESHOLD,
  bestDay,
  equivalents,
  heatmapCapped,
  heatmapDays,
  parseReadings,
  peakWindow,
  periodTotals,
} from '../sections/insights/insightsData';
import { solar, solarApp } from '../theme/solar';
import { Product, Project } from '../types/models';

export default function InsightsPage() {
  const { projectId = '', productId = '' } = useParams<{ projectId: string; productId: string }>();
  const { state } = useLocation();
  const { projectName: stateProjectName, productName: stateProductName } = (state ?? {}) as {
    projectName?: string;
    productName?: string;
  };

  const [period, setPeriod] = useState<PeriodKey>('week');

  const { data: project, isError: projectIsError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<Project | null>(`/project?projectId=${projectId}`);
      return response.data;
    },
    enabled: !stateProjectName,
  });

  const { data: product, isError: productIsError } = useQuery({
    queryKey: ['site', productId],
    queryFn: async () => {
      const response = await api.get<Product | null>(`/product/item?productId=${productId}`);
      return response.data;
    },
  });

  // Parsed once in the queryFn, so the cache holds ready-to-use readings.
  const {
    data: readings,
    isError: readingsIsError,
    isPending: readingsPending,
  } = useQuery({
    queryKey: ['readings', productId],
    queryFn: async () => {
      const response = await api.get<ApiReading[]>(`/product/readings?productId=${productId}`);
      return parseReadings(response.data ?? []);
    },
  });

  const anyError = projectIsError || productIsError || readingsIsError;
  useEffect(() => {
    if (anyError) toast.error('Could not load the site insights');
  }, [anyError]);

  const ready = (readings?.length ?? 0) >= READY_THRESHOLD;

  const insights = useMemo(() => {
    if (!readings || !ready) return null;
    const totals = periodTotals(readings, period);
    return {
      totals,
      best: bestDay(totals.inRange),
      days: heatmapDays(totals.inRange, period),
      capped: heatmapCapped(totals.inRange, period),
      peakLabel: peakWindow(totals.inRange),
      chips: equivalents(totals.kwh),
    };
  }, [readings, ready, period]);

  const readingsToday = useMemo(() => {
    if (!readings) return 0;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return readings.filter((reading) => reading.date >= startOfToday).length;
  }, [readings]);

  // Navigation state paints first; the API result backs it up on deep links.
  const projectName = stateProjectName ?? project?.name;
  const productName = stateProductName ?? product?.name;

  return (
    <>
      <Helmet>
        <title>{`${productName ?? 'Insights'} | SolarSense`}</title>
      </Helmet>
      <ToastContainer />

      <Box sx={{ maxWidth: 1240, mx: 'auto', fontFamily: solar.fontBody }}>
        {/* Breadcrumb */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            mb: '14px',
            flexWrap: 'wrap',
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            sx={{ color: solarApp.chipCount, textDecoration: 'none', '&:hover': { color: solar.accentDeep } }}
          >
            Projects
          </Box>
          <Box component="span" sx={{ color: '#CFC7B4' }}>
            /
          </Box>
          <Box
            component={RouterLink}
            to={`/projects/${projectId}`}
            sx={{ color: solarApp.chipCount, textDecoration: 'none', '&:hover': { color: solar.accentDeep } }}
          >
            {projectName ?? '…'}
          </Box>
          <Box component="span" sx={{ color: '#CFC7B4' }}>
            /
          </Box>
          <Box component="span" sx={{ color: solar.ink }}>
            {productName ?? '…'} · Insights
          </Box>
        </Box>

        {/* Header + period chips */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '20px',
            mb: '18px',
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{ fontFamily: solar.fontDisplay, fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em', m: 0 }}
            >
              {productName ?? '…'}
            </Typography>
            <Typography sx={{ fontSize: '15px', color: solar.sub, mt: '6px' }}>
              {ready
                ? 'What your solar is doing — and what it means for you.'
                : 'Your insights will appear here as data comes in.'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(ready ? PERIODS : PERIODS.filter((option) => option.key === 'week')).map((option) => {
              const on = option.key === period;
              return (
                <Box
                  key={option.key}
                  component="button"
                  type="button"
                  aria-pressed={on}
                  disabled={readingsPending}
                  onClick={() => setPeriod(option.key)}
                  sx={{
                    height: 34,
                    px: '14px',
                    borderRadius: '9px',
                    border: `1px solid ${on ? solar.ink : solarApp.chipBorder}`,
                    background: on ? solar.ink : '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: solar.fontBody,
                    color: on ? '#fff' : solarApp.chipText,
                    cursor: 'pointer',
                    transition: 'all .14s',
                  }}
                >
                  {option.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Skeletons while the first (uncached) load is in flight — same box
            metrics as the real cards, so nothing reflows when data lands. */}
        {readingsPending && <InsightsLoadingState />}

        {readings != null && insights && (
          <>
            <InsightCards totals={insights.totals} period={period} tariff={product?.tariff} best={insights.best} />
            <SunshineFingerprintCard
              days={insights.days}
              capped={insights.capped}
              peakLabel={insights.peakLabel}
              chips={insights.chips}
            />
          </>
        )}

        {readings != null && !insights && (
          <>
            <InsightCards locked />
            <CollectingPanel readingsToday={readingsToday} />
          </>
        )}
      </Box>
    </>
  );
}
