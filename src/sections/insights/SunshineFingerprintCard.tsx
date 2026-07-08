import { Box, Tooltip, Typography } from '@mui/material';
import { solar } from '../../theme/solar';
import { HeatDay, MAX_HEATMAP_DAYS, heatColor } from './insightsData';

interface SunshineFingerprintCardProps {
  days: HeatDay[];
  capped: boolean;
  peakLabel: string | null;
  chips: string[];
}

const AXIS_LABELS = ['00:00', '06:00', '12:00', '18:00', '23:00'];

export default function SunshineFingerprintCard({ days, capped, peakLabel, chips }: SunshineFingerprintCardProps) {
  const maxKwh = Math.max(...days.flatMap((day) => day.cells), 0.0001);

  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #EEE8DA',
        borderRadius: '18px',
        p: { xs: '18px 15px 16px', sm: '22px 24px 20px' },
      }}
    >
      {/* Head + legend — stacked on narrow screens */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: { xs: '12px', sm: '16px' },
          mb: '6px',
        }}
      >
        <Box>
          <Typography sx={{ fontFamily: solar.fontDisplay, fontSize: '18px', fontWeight: 600, m: 0 }}>
            Your sunshine fingerprint
          </Typography>
          <Typography sx={{ fontSize: '13px', color: solar.muted, m: '4px 0 0', maxWidth: 520 }}>
            Every square is one hour. Brighter = more energy. You can see the daily sun arc and how days compare at a
            glance.{capped ? ` Showing the last ${MAX_HEATMAP_DAYS} days.` : ''}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#A39B87',
            flexShrink: 0,
          }}
        >
          <span>Less</span>
          <Box
            sx={{
              width: { xs: 96, sm: 120 },
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
              gridTemplateColumns: { xs: '30px repeat(24, 1fr)', sm: '58px repeat(24, 1fr)' },
              gap: { xs: '2px', sm: '3px' },
              alignItems: 'center',
              mb: '3px',
            }}
          >
            <Box
              sx={{
                fontSize: { xs: '9px', sm: '10.5px' },
                color: '#A39B87',
                textAlign: 'right',
                pr: { xs: '5px', sm: '8px' },
                whiteSpace: 'nowrap',
              }}
            >
              {day.label}
            </Box>
            {day.cells.map((kwh, hour) => (
              <Tooltip
                key={hour}
                title={`${day.label}, ${String(hour).padStart(2, '0')}:00 — ${kwh.toFixed(2)} kWh`}
                placement="top"
                arrow
                disableInteractive
                enterTouchDelay={0}
                leaveTouchDelay={2500}
              >
                <Box
                  sx={{
                    height: { xs: 12, sm: 16 },
                    borderRadius: '3px',
                    background: heatColor(kwh / maxKwh),
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ))}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pl: { xs: '32px', sm: '61px' },
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: { xs: '9px', sm: '8px' },
          fontSize: '12px',
          lineHeight: 1.5,
          color: solar.muted,
          mt: { xs: '16px', sm: '14px' },
          background: { xs: '#FBF7EC', sm: 'none' },
          border: { xs: '1px solid #F3E9CF', sm: 'none' },
          borderRadius: { xs: '12px', sm: 0 },
          p: { xs: '12px 14px', sm: 0 },
        }}
      >
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: solar.accent, flexShrink: 0, mt: '5px' }} />
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

      {chips.length > 0 && (
        <Box sx={{ display: 'flex', gap: { xs: '8px', sm: '10px' }, mt: { xs: '14px', sm: '16px' }, flexWrap: 'wrap' }}>
          {chips.map((chip) => (
            <Box
              key={chip}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: { xs: 'auto', sm: 34 },
                p: { xs: '8px 12px', sm: '0 14px' },
                borderRadius: '999px',
                background: '#F4F8F1',
                border: '1px solid #DCEAD6',
                fontSize: { xs: '12px', sm: '12.5px' },
                lineHeight: 1.3,
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
