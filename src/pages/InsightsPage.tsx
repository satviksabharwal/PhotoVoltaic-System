import { Helmet } from 'react-helmet-async';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/api';
import InsightCards from '../sections/insights/InsightCards';
import SunshineFingerprintCard from '../sections/insights/SunshineFingerprintCard';
import CollectingPanel from '../sections/insights/CollectingPanel';
import {
  ApiReading,
  HourlyReading,
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

// ----------------------------------------------------------------------
// SolarSense Insights page for one site: period chips, four homeowner
// insight cards and the sunshine-fingerprint heatmap — or the cold-start
// collecting panel until the first full day of hourly data exists.
// ----------------------------------------------------------------------

export default function InsightsPage() {
  const { projectId = '', productId = '' } = useParams<{ projectId: string; productId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [readings, setReadings] = useState<HourlyReading[] | null>(null);
  const [period, setPeriod] = useState<PeriodKey>('week');

  const fetchAll = useCallback(async () => {
    try {
      const [projectResponse, productResponse, readingsResponse] = await Promise.all([
        api.get<Project | null>(`/project?projectId=${projectId}`),
        api.get<Product | null>(`/product/item?productId=${productId}`),
        api.get<ApiReading[]>(`/product/readings?productId=${productId}`),
      ]);
      setProject(projectResponse.data);
      setProduct(productResponse.data);
      setReadings(parseReadings(readingsResponse.data ?? []));
    } catch (error) {
      toast.error('Could not load the site insights');
    }
  }, [projectId, productId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

  return (
    <>
      <Helmet>
        <title>{`${product?.name ?? 'Insights'} | SolarSense`}</title>
      </Helmet>
      <ToastContainer />

      <Box sx={{ maxWidth: 1240, mx: 'auto', fontFamily: solar.fontBody }}>
        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, mb: '14px', flexWrap: 'wrap' }}>
          <Box
            component={RouterLink}
            to="/dashboard/projects"
            sx={{ color: solarApp.chipCount, textDecoration: 'none', '&:hover': { color: solar.accentDeep } }}
          >
            Projects
          </Box>
          <Box component="span" sx={{ color: '#CFC7B4' }}>
            /
          </Box>
          <Box
            component={RouterLink}
            to={`/dashboard/projects/${projectId}`}
            sx={{ color: solarApp.chipCount, textDecoration: 'none', '&:hover': { color: solar.accentDeep } }}
          >
            {project?.name ?? '…'}
          </Box>
          <Box component="span" sx={{ color: '#CFC7B4' }}>
            /
          </Box>
          <Box component="span" sx={{ color: solar.ink }}>
            {product?.name ?? '…'} · Insights
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
              {product?.name ?? '…'}
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
