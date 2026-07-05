import { Box, Typography } from '@mui/material';
import { solar } from '../../theme/solar';
import { EmptySitesIllustration } from '../projects/detail/EmptySitesState';
import { ActivateButton } from './PausedBanner';

interface PausedEmptyPanelProps {
  onActivate: () => void;
  activating: boolean;
}

export default function PausedEmptyPanel({ onActivate, activating }: PausedEmptyPanelProps) {
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
      <Typography
        sx={{ fontFamily: solar.fontDisplay, fontSize: '22px', fontWeight: 700, color: solar.ink, m: '22px 0 0' }}
      >
        No insights to show yet
      </Typography>
      <Typography sx={{ fontSize: '14.5px', lineHeight: 1.6, color: solar.muted, maxWidth: 440, m: '10px 0 0' }}>
        This project is{' '}
        <Box component="b" sx={{ color: solar.accentDeep, fontWeight: 600 }}>
          inactive
        </Box>
        , so SolarSense isn&apos;t collecting hourly data.{' '}
        <Box component="b" sx={{ color: solar.accentDeep, fontWeight: 600 }}>
          Activate the project
        </Box>{' '}
        to start building your solar insights — your first ones unlock about 24 hours after collection resumes.
      </Typography>
      <Box sx={{ mt: '26px' }}>
        <ActivateButton onClick={onActivate} busy={activating}>
          {activating ? 'Reactivating…' : 'Activate project to collect data'}
        </ActivateButton>
      </Box>
    </Box>
  );
}
