import { Box, Typography } from '@mui/material';
import { solar } from '../../theme/solar';
import { EmptySitesIllustration } from '../projects/detail/EmptySitesState';
import { READY_THRESHOLD } from './insightsData';

// ----------------------------------------------------------------------
// Cold-start panel (design 5b): shown while a new site has fewer than 24
// hourly readings. Explains that data records hourly since creation, with
// a live progress bar and the 3-step tracker.
// ----------------------------------------------------------------------

interface CollectingPanelProps {
  /** Hourly readings recorded so far today. */
  readingsToday: number;
}

interface StepProps {
  number: string;
  label: string;
  state: 'done' | 'active' | 'upcoming';
}

function Step({ number, label, state }: StepProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: state === 'active' ? '#FFFCF3' : '#FBF8F1',
        border: `1px solid ${state === 'active' ? solar.accent : '#F1ECDF'}`,
        borderRadius: '12px',
        p: '12px 16px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#5B5648',
      }}
    >
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: state === 'done' ? '#1F8A5B' : solar.accent,
          color: state === 'done' ? '#fff' : solar.ink,
          fontFamily: solar.fontDisplay,
          fontSize: '12px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {state === 'done' ? '✓' : number}
      </Box>
      {label}
    </Box>
  );
}

export default function CollectingPanel({ readingsToday }: CollectingPanelProps) {
  const progress = Math.min(100, Math.round((readingsToday / READY_THRESHOLD) * 100));

  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #EEE8DA',
        borderRadius: '18px',
        p: '52px 32px 56px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <EmptySitesIllustration />
      <Typography sx={{ fontFamily: solar.fontDisplay, fontSize: '22px', fontWeight: 700, color: solar.ink, m: '22px 0 0' }}>
        We&apos;re gathering your data
      </Typography>
      <Typography sx={{ fontSize: '14.5px', lineHeight: 1.6, color: solar.muted, maxWidth: 440, m: '10px 0 0' }}>
        SolarSense started recording{' '}
        <Box component="b" sx={{ color: solar.accentDeep, fontWeight: 600 }}>
          hourly production
        </Box>{' '}
        for this site when you created it. Your first insights unlock after{' '}
        <Box component="b" sx={{ color: solar.accentDeep, fontWeight: 600 }}>
          24 hours
        </Box>
        , and the sunshine fingerprint fills in over your first week.
      </Typography>

      <Box sx={{ width: 280, height: 8, borderRadius: '5px', background: '#EFEADD', overflow: 'hidden', mt: '24px' }}>
        <Box
          sx={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: '5px',
            background: `linear-gradient(90deg, ${solar.accent}, #FFD54F)`,
            transition: 'width .3s',
          }}
        />
      </Box>
      <Typography aria-live="polite" sx={{ fontSize: '12.5px', color: '#A39B87', mt: '9px' }}>
        {readingsToday} of {READY_THRESHOLD} hourly readings collected today
      </Typography>

      <Box sx={{ display: 'flex', gap: '14px', mt: '26px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Step number="1" label="Site created" state="done" />
        <Step number="2" label="Collecting hourly data" state="active" />
        <Step number="3" label="Insights unlock" state="upcoming" />
      </Box>
    </Box>
  );
}
