import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { solar } from '../../theme/solar';

// Shimmer primitive — every grey placeholder block runs a left-to-right sweep.
const sk = {
  position: 'relative',
  overflow: 'hidden',
  background: '#F0EBDE',
  borderRadius: '8px',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    transform: 'translateX(-100%)',
    background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))',
    animation: 'skshimmer 1.35s ease-in-out infinite',
  },
  '@keyframes skshimmer': { '100%': { transform: 'translateX(100%)' } },
  '@media (prefers-reduced-motion: reduce)': { '&::after': { animation: 'none' } },
} as const;

const HEATMAP_ROWS = [0, 1, 2, 3, 4];

export default function InsightsLoadingState() {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Four insight-card skeletons — same grid and box metrics as InsightCards */}
      <Box
        aria-hidden
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: '18px', mb: '22px' }}
      >
        {[0, 1, 2, 3].map((index) => (
          <Box key={index} sx={{ background: '#fff', border: '1px solid #EEE8DA', borderRadius: '16px', p: '20px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
              <Box sx={{ ...sk, width: 40, height: 40, borderRadius: '11px' }} />
              <Box sx={{ ...sk, width: 44, height: 20, borderRadius: '999px' }} />
            </Box>
            <Box sx={{ ...sk, height: 28, width: '70%' }} />
            <Box sx={{ ...sk, height: 11, width: '55%', mt: '10px' }} />
          </Box>
        ))}
      </Box>

      {/* Sunshine-fingerprint skeleton — title, day rows, peak line */}
      <Box
        aria-hidden
        sx={{ background: '#fff', border: '1px solid #EEE8DA', borderRadius: '18px', p: '22px 24px 20px' }}
      >
        <Box sx={{ ...sk, height: 16, width: 210, maxWidth: '60%' }} />
        <Box sx={{ ...sk, height: 11, width: 150, maxWidth: '45%', mt: '8px' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '18px' }}>
          {HEATMAP_ROWS.map((row) => (
            <Box key={row} sx={{ display: 'grid', gridTemplateColumns: '58px 1fr', gap: '3px', alignItems: 'center' }}>
              <Box sx={{ ...sk, height: 12, width: 44, borderRadius: '4px' }} />
              <Box sx={{ ...sk, height: 16, borderRadius: '3px' }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ ...sk, height: 12, width: '45%', mt: '16px' }} />
      </Box>

      {/* Loading label */}
      <Box
        role="status"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          mt: '18px',
          fontFamily: solar.fontBody,
          fontSize: '13px',
          color: '#9A9280',
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 15,
            height: 15,
            borderRadius: '50%',
            border: '2px solid #E7E0CF',
            borderTopColor: solar.accentDeep,
            animation: 'lspin .7s linear infinite',
            '@keyframes lspin': { '100%': { transform: 'rotate(360deg)' } },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
        Loading your insights
        <Box
          component="span"
          aria-hidden
          sx={{
            '&::after': { content: '""', animation: 'ldots 1.4s steps(4, end) infinite' },
            '@keyframes ldots': {
              '0%': { content: '""' },
              '25%': { content: '"·"' },
              '50%': { content: '"··"' },
              '75%': { content: '"···"' },
            },
            '@media (prefers-reduced-motion: reduce)': { '&::after': { animation: 'none' } },
          }}
        />
      </Box>
    </>
  );
}
