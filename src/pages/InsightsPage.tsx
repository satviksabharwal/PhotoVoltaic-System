import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import api from '../utils/api';
import InsightCards from '../sections/insights/InsightCards';
import SunshineFingerprintCard from '../sections/insights/SunshineFingerprintCard';
import CollectingPanel from '../sections/insights/CollectingPanel';
import InsightsLoadingState from '../sections/insights/InsightsLoadingState';
import PausedBanner from '../sections/insights/PausedBanner';
import PausedEmptyPanel from '../sections/insights/PausedEmptyPanel';
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
  const queryClient = useQueryClient();

  const { data: project, isError: projectIsError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<Project | null>(`/project?projectId=${projectId}`);
      return response.data;
    },
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

  const activateProject = useMutation({
    mutationFn: () => api.put(`/project/update/${projectId}`, { active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => toast.error('Could not activate the project'),
  });

  const projectActive = project?.active ?? true;
  const ready = (readings?.length ?? 0) >= READY_THRESHOLD;

  const insights = useMemo(() => {
    if (!readings || readings.length === 0) return null;
    if (!ready && projectActive) return null;
    const totals = periodTotals(readings, period);
    return {
      totals,
      best: bestDay(totals.inRange),
      days: heatmapDays(totals.inRange, period),
      capped: heatmapCapped(totals.inRange, period),
      peakLabel: peakWindow(totals.inRange),
      chips: equivalents(totals.kwh),
    };
  }, [readings, ready, period, projectActive]);

  const readingsToday = useMemo(() => {
    if (!readings) return 0;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return readings.filter((reading) => reading.date >= startOfToday).length;
  }, [readings]);

  // Navigation state paints first; the API result backs it up on deep links.
  const projectName = stateProjectName ?? project?.name;
  const productName = stateProductName ?? product?.name;

  const paused = !projectActive;
  const showPausedData = paused && insights != null;
  const showPausedEmpty = paused && readings != null && readings.length === 0;
  const showLive = !paused && insights != null;
  const showCollecting = !paused && readings != null && insights == null;

  const lastRecordedLabel = useMemo(() => {
    if (!readings || readings.length === 0) return null;
    const latest = readings.reduce((max, reading) => (reading.date > max ? reading.date : max), readings[0].date);
    return format(latest, 'MMM d, yyyy · HH:mm');
  }, [readings]);

  let subtitle = 'Your insights will appear here as data comes in.';
  if (showLive) subtitle = 'What your solar is doing — and what it means for you.';
  if (showPausedData) subtitle = 'Showing your last recorded week — data collection is paused.';
  if (showPausedEmpty) subtitle = 'Data collection is paused for this project.';

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
              {paused && (
                <Box
                  component="span"
                  aria-label="Project status: inactive"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    height: 26,
                    px: '11px',
                    borderRadius: '999px',
                    background: '#EDEAE1',
                    color: '#7A7362',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: solar.fontBody,
                    ml: '12px',
                    verticalAlign: 'middle',
                  }}
                >
                  <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', background: '#B6AE9C' }} />
                  Inactive
                </Box>
              )}
            </Typography>
            <Typography sx={{ fontSize: '15px', color: solar.sub, mt: '6px' }}>{subtitle}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(insights ? PERIODS : PERIODS.filter((option) => option.key === 'week')).map((option) => {
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

        {showPausedData && lastRecordedLabel && (
          <PausedBanner
            lastRecordedLabel={lastRecordedLabel}
            onActivate={() => activateProject.mutate()}
            activating={activateProject.isPending}
          />
        )}
        {showPausedData && insights && (
          <>
            <InsightCards
              stale
              totals={insights.totals}
              period={period}
              tariff={product?.tariff}
              best={insights.best}
            />
            <SunshineFingerprintCard
              days={insights.days}
              capped={insights.capped}
              peakLabel={insights.peakLabel}
              chips={insights.chips}
            />
          </>
        )}

        {showPausedEmpty && (
          <>
            <InsightCards locked lockedLabel="Paused" />
            <PausedEmptyPanel onActivate={() => activateProject.mutate()} activating={activateProject.isPending} />
          </>
        )}

        {showLive && insights && (
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

        {showCollecting && (
          <>
            <InsightCards locked />
            <CollectingPanel readingsToday={readingsToday} />
          </>
        )}
      </Box>
    </>
  );
}
