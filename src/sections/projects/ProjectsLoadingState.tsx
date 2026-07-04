import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { solar } from '../../theme/solar';

const sk: SxProps<Theme> = {
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
};

function SkeletonCard() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        background: '#fff',
        border: '1px solid #EEE8DA',
        borderRadius: '18px',
        p: '22px 22px 20px',
        overflow: 'hidden',
        minHeight: 238,
      }}
    >
      {/* icon + status pill */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ ...sk, width: 44, height: 44, borderRadius: '12px' }} />
        <Box sx={{ ...sk, width: 74, height: 22, borderRadius: '999px' }} />
      </Box>
      {/* name + location bars */}
      <Box sx={{ ...sk, height: 20, width: '62%', mt: '20px' }} />
      <Box sx={{ ...sk, height: 13, width: '44%', mt: '12px' }} />
      {/* divider */}
      <Box sx={{ height: '1px', background: '#F1ECDF', m: '20px 0 16px' }} />
      {/* stat blocks */}
      <Box sx={{ display: 'flex', gap: '34px' }}>
        <Box sx={{ ...sk, height: 30, width: 52 }} />
        <Box sx={{ ...sk, height: 30, width: 52 }} />
      </Box>
      {/* footer row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '22px' }}>
        <Box sx={{ ...sk, height: 12, width: '38%' }} />
        <Box sx={{ ...sk, height: 12, width: 46 }} />
      </Box>
    </Box>
  );
}

export default function ProjectsLoadingState() {
  // Delay the skeleton slightly so a fast response never flickers one in.
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <SkeletonCard />
      <SkeletonCard />

      {/* Full-width loading label under the cards */}
      <Box
        role="status"
        sx={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          mt: '6px',
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
        Loading your projects
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
