import { Box, Typography } from '@mui/material';
import { solar } from '../../theme/solar';
import { EmptySitesIllustration } from './detail/EmptySitesState';

interface ProjectsEmptyStateProps {
  onCreate: () => void;
}

const STEPS = ['Create a project', 'Pin your solar sites', 'See hourly estimates'];

export default function ProjectsEmptyState({ onCreate }: ProjectsEmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: '60px 24px 70px',
        border: '1.5px dashed #E4DDCB',
        borderRadius: '22px',
        background: 'linear-gradient(180deg, #FFFDF8, rgba(251,248,241,0))',
      }}
    >
      <Box aria-hidden sx={{ transform: 'scale(1.12)', mb: '32px' }}>
        <EmptySitesIllustration />
      </Box>

      <Typography component="h3" sx={{ fontFamily: solar.fontDisplay, fontSize: '23px', fontWeight: 700, color: solar.ink, m: 0 }}>
        No projects yet
      </Typography>
      <Typography sx={{ fontSize: '14.5px', lineHeight: 1.55, color: solar.muted, maxWidth: 430, m: '11px 0 0' }}>
        A project groups your solar sites by location and tracks their combined output. Create your first one to
        start estimating how much energy your panels could produce.
      </Typography>

      <Box
        component="button"
        type="button"
        onClick={onCreate}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '9px',
          height: 50,
          px: '26px',
          border: 'none',
          borderRadius: '12px',
          background: solar.accent,
          color: solar.ink,
          fontFamily: solar.fontDisplay,
          fontSize: '15.5px',
          fontWeight: 700,
          cursor: 'pointer',
          mt: '26px',
          boxShadow: '0 10px 24px rgba(255,193,7,.38)',
          transition: 'filter .15s, transform .1s',
          '&:hover': { filter: 'brightness(.96)' },
          '&:active': { transform: 'translateY(1px)' },
        }}
      >
        <Box component="span" sx={{ fontSize: '18px', mt: '-1px' }}>
          ＋
        </Box>
        Create your first project
      </Box>

      <Box sx={{ display: 'flex', gap: '14px 30px', mt: '34px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {STEPS.map((step, index) => (
          <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', color: '#7A7362' }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#FFF3D0',
                color: solar.accentDeep,
                fontFamily: solar.fontDisplay,
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>
            {step}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
