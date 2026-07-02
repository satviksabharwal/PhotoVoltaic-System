import { Box, Typography } from '@mui/material';
import { solar, solarApp } from '../../../theme/solar';
import { estimateOutput, monthlyDistribution } from '../../../utils/solarEstimate';
import usePvgisEstimate from '../../../hooks/usePvgisEstimate';
import InfoTip from './InfoTip';
import { SiteFormState } from './siteFormState';

// ----------------------------------------------------------------------
// Instant Estimate card: lives in the left column directly below the map and
// stretches to match the form column's height. Shows four metric tiles and a
// 12-month output bar chart. Numbers render instantly from the client-side
// approximation, then refine to real PVGIS data once the inputs settle.
// ----------------------------------------------------------------------

interface InstantEstimateCardProps {
  lat: string;
  lng: string;
  form: SiteFormState;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Bar heights are a share of the tallest month, with a small visible floor. */
const MIN_BAR_PERCENT = 4;

export default function InstantEstimateCard({ lat, lng, form }: InstantEstimateCardProps) {
  const latNumber = parseFloat(lat);
  const lngNumber = parseFloat(lng);
  const area = parseFloat(form.area) || 0;
  const losses = parseFloat(form.losses) || 0;
  const tariff = form.tariff.trim() ? parseFloat(form.tariff) : null;

  const approx = estimateOutput({
    area,
    lat: Number.isNaN(latNumber) ? undefined : latNumber,
    orientation: form.orientation,
    tilt: form.tilt,
    module: form.module,
    mounting: form.mounting,
    losses,
    tariff,
  });

  // Only ask PVGIS once there is something worth simulating: a real pin plus
  // an area. Until then the hook stays idle.
  const canQueryPvgis = approx != null && !Number.isNaN(latNumber) && !Number.isNaN(lngNumber);
  const { pvgis, loading } = usePvgisEstimate(
    canQueryPvgis
      ? {
          lat: latNumber,
          lng: lngNumber,
          orientation: form.orientation,
          tilt: form.tilt,
          area,
          module: form.module,
          mounting: form.mounting,
          losses,
        }
      : null
  );

  if (!approx) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF8F3',
          border: `1px dashed ${solarApp.cardBorder}`,
          borderRadius: '18px',
          p: '24px',
        }}
      >
        <Typography sx={{ fontSize: '13.5px', color: solarApp.chipCount, lineHeight: 1.5, m: 0, textAlign: 'center', maxWidth: 420 }}>
          Pin a <b>location</b> and enter an <b>area</b> to see an instant output estimate here — before you even
          submit.
        </Typography>
      </Box>
    );
  }

  // Tiles + chart prefer the real PVGIS numbers; the seasonal approximation
  // covers the debounce window and any PVGIS outage.
  const annualKwh = pvgis?.annualKwh ?? approx.annualKwh;
  const monthlyKwh = pvgis?.monthlyKwh ?? monthlyDistribution(approx.annualKwh, latNumber);
  const savings = tariff && tariff > 0 ? annualKwh * tariff : null;
  const co2Tonnes = (annualKwh * 0.38) / 1000;
  const tallestMonth = Math.max(...monthlyKwh, 1);

  const tiles = [
    { value: approx.kwp.toFixed(1), unit: 'kWp', label: 'System size' },
    { value: Math.round(annualKwh).toLocaleString('en-US'), unit: 'kWh/yr', label: 'Est. output' },
    {
      value: savings != null ? `€${Math.round(savings).toLocaleString('en-US')}` : '—',
      unit: '',
      label: 'Yearly savings',
    },
    { value: co2Tonnes.toFixed(1), unit: 't', label: 'CO₂ avoided / yr' },
  ];

  let sourceHint = 'Approximation';
  if (loading) sourceHint = 'Refining with PVGIS…';
  else if (pvgis) sourceHint = 'Source: PVGIS';

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #FFF6DC, #FFFDF7)',
        border: '1px solid #F4E4A6',
        borderRadius: '18px',
        p: '22px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', mb: '14px' }}>
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: solar.accentDeep,
            m: 0,
          }}
        >
          ⚡ Instant estimate
        </Typography>
        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: pvgis ? solar.accentDeep : '#B0A88F', m: 0 }}>
          {sourceHint}
        </Typography>
      </Box>

      {/* Metric tiles */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: '14px' }}>
        {tiles.map((tile) => (
          <Box key={tile.label}>
            <Box sx={{ fontFamily: solar.fontDisplay, fontSize: '24px', fontWeight: 700, color: solar.ink, lineHeight: 1.05 }}>
              {tile.value}{' '}
              {tile.unit && (
                <Box component="small" sx={{ fontSize: '13px', fontWeight: 600, color: solar.muted }}>
                  {tile.unit}
                </Box>
              )}
            </Box>
            <Box
              sx={{
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: solarApp.label,
                mt: '3px',
              }}
            >
              {tile.label}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Monthly output chart — absorbs whatever height the form column adds */}
      <Box sx={{ mt: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', mb: '10px' }}>
          <Box
            sx={{
              fontSize: '11.5px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: solarApp.label,
            }}
          >
            Est. monthly output
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: '#C2BAA0' }}>
            Typical year · Jan–Dec avg
            <InfoTip
              ariaLabel="What the monthly chart shows"
              align="right"
              tip={
                <>
                  Each bar is the <b>long-term average</b> for that calendar month at this location — a typical
                  January, February, and so on. It&apos;s a seasonal profile for sizing your system,{' '}
                  <b>not a forecast</b> for a specific year, so it doesn&apos;t shift with today&apos;s date.
                </>
              }
            />
          </Box>
        </Box>
        {/* Relative wrapper + absolute row keeps the bars' percentage heights
            resolvable whatever height flexbox hands this section. */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: 110 }}>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
            {monthlyKwh.map((kwh, index) => (
              <Box
                key={MONTH_NAMES[index]}
                title={`${MONTH_NAMES[index]}: ${Math.round(kwh).toLocaleString('en-US')} kWh`}
                sx={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', cursor: 'default' }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: `${Math.max((kwh / tallestMonth) * 100, MIN_BAR_PERCENT)}%`,
                    background: 'linear-gradient(180deg, #FFD23E, #FFB300)',
                    borderRadius: '5px 5px 2px 2px',
                    transition: 'height .25s ease',
                    '&:hover': { filter: 'brightness(1.07)' },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: '5px', mt: '6px' }}>
          {MONTH_NAMES.map((month) => (
            <Box
              key={month}
              sx={{ flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: 600, color: solarApp.label }}
            >
              {month.charAt(0)}
            </Box>
          ))}
        </Box>
      </Box>

      <Typography sx={{ fontSize: '11.5px', color: '#B0A88F', m: '14px 0 0', lineHeight: 1.4 }}>
        {pvgis
          ? 'Simulated with PVGIS solar data for this exact location. Submit to start the hourly tracking.'
          : 'Rough estimate from location, tilt & orientation. Submit to run the full hourly simulation.'}
      </Typography>
    </Box>
  );
}
