import { Box, Typography } from '@mui/material';
import { solar } from '../../theme/solar';
import { HeatDay, MAX_HEATMAP_DAYS, heatColor } from './insightsData';

// ----------------------------------------------------------------------
// The signature "sunshine fingerprint" heatmap: one row per day, 24 hour
// cells, colored by that hour's production relative to the brightest hour
// in view. Below it: the peak-window takeaway and CO₂-equivalence chips.
// ----------------------------------------------------------------------

interface SunshineFingerprintCardProps {
  days: HeatDay[];
  /** True when the "All" period shows only the most recent days. */
  capped: boolean;
  /** e.g. "12–2pm"; null when nothing was produced in the period. */
  peakLabel: string | null;
  chips: string[];
}

const AXIS_LABELS = ['00:00', '06:00', '12:00', '18:00', '23:00'];

export default function SunshineFingerprintCard({ days, capped, peakLabel, chips }: SunshineFingerprintCardProps) {
  const maxKwh = Math.max(...days.flatMap((day) => day.cells), 0.0001);

  return (
    <Box sx={{ background: '#fff', border: '1px solid #EEE8DA', borderRadius: '18px', p: '22px 24px 20px' }}>
      {/* Head + legend */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', mb: '6px' }}>
        <Box>
          <Typography sx={{ fontFamily: solar.fontDisplay, fontSize: '18px', fontWeight: 600, m: 0 }}>
            Your sunshine fingerprint
          </Typography>
          <Typography sx={{ fontSize: '13px', color: solar.muted, m: '4px 0 0', maxWidth: 520 }}>
            Every square is one hour. Brighter = more energy. You can see the daily sun arc and how days compare at a
            glance.{capped ? ` Showing the last ${MAX_HEATMAP_DAYS} days.` : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#A39B87', flexShrink: 0 }}>
          <span>Less</span>
          <Box
            sx={{
              width: 120,
              height: 8,
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #F2EEE2, #FFE9A8, #E58A00, #D2660A)',
            }}
          />
          <span>More</span>
        </Box>
      </Box>

      {/* Day rows */}
      <Box sx={{ mt: '18px' }}>
        {days.map((day) => (
          <Box
            key={day.label}
            sx={{
              display: 'grid',
              gridTemplateColumns: '58px repeat(24, 1fr)',
              gap: '3px',
              alignItems: 'center',
              mb: '3px',
            }}
          >
            <Box sx={{ fontSize: '10.5px', color: '#A39B87', textAlign: 'right', pr: '8px', whiteSpace: 'nowrap' }}>
              {day.label}
            </Box>
            {day.cells.map((kwh, hour) => (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={hour}
                title={`${day.label}, ${String(hour).padStart(2, '0')}:00 — ${kwh.toFixed(2)} kWh`}
                sx={{ height: 16, borderRadius: '3px', background: heatColor(kwh / maxKwh) }}
              />
            ))}
          </Box>
        ))}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pl: '61px',
            mt: '7px',
            fontSize: '10.5px',
            color: '#A39B87',
          }}
        >
          {AXIS_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </Box>
      </Box>

      {/* Takeaway */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: solar.muted, mt: '14px' }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: solar.accent, flexShrink: 0 }} />
        {peakLabel ? (
          <span>
            Peak production lands around{' '}
            <Box component="b" sx={{ color: solar.ink, fontWeight: 600 }}>
              {peakLabel}
            </Box>{' '}
            — running dishwashers or charging then uses the most of your own free power.
          </span>
        ) : (
          <span>No production recorded in this period yet — the fingerprint brightens as sunny hours come in.</span>
        )}
      </Box>

      {/* CO₂ equivalence chips */}
      {chips.length > 0 && (
        <Box sx={{ display: 'flex', gap: '10px', mt: '16px', flexWrap: 'wrap' }}>
          {chips.map((chip) => (
            <Box
              key={chip}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: 34,
                px: '14px',
                borderRadius: '999px',
                background: '#F4F8F1',
                border: '1px solid #DCEAD6',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#3B7A4E',
              }}
            >
              {chip}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
