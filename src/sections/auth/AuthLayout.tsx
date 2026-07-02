import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import SolarMark from './SolarMark';
import { solar, solarBg } from './tokens';

// Full-bleed hero photo (served from /public). Preloaded from index.html so
// it arrives together with the app bundle — keep both paths in sync.
const HERO_BG = '/assets/images/hero-background.jpg';

interface AuthLayoutProps {
  taglineHeading: ReactNode;
  taglineText: string;
  ticks: string[];
  children: ReactNode;
}

export default function AuthLayout({ taglineHeading, taglineText, ticks, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        background: solar.ink,
        fontFamily: solar.fontBody,
      }}
    >
      {/* Background layers: sky + horizon are the gradient fallback, the hero
          photo sits on top of them, and the scrim tints the photo into the brand. */}
      <Box sx={{ position: 'absolute', inset: 0, background: solarBg.sky }} />
      <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '24%', background: solarBg.horizon }} />
      <Box
        component="img"
        src={HERO_BG}
        alt=""
        aria-hidden
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Box sx={{ position: 'absolute', inset: 0, background: solarBg.scrim, pointerEvents: 'none' }} />

      {/* Top chrome: wordmark */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: '24px', md: '48px' },
          py: { xs: '24px', md: '32px' },
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <SolarMark glass />
          <Typography
            component="span"
            sx={{
              fontFamily: solar.fontDisplay,
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '-0.01em',
              color: '#fff',
            }}
          >
            Solar
            <Box component="span" sx={{ color: solar.accent }}>
              Sense
            </Box>
          </Typography>
        </Box>
      </Box>

      {/* Bottom-left tagline (desktop only) */}
      <Box
        sx={{
          position: 'absolute',
          left: '48px',
          bottom: '56px',
          maxWidth: 520,
          pr: 3,
          color: '#fff',
          display: { xs: 'none', md: 'block' },
          zIndex: 3,
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: solar.fontDisplay,
            fontWeight: 700,
            fontSize: '52px',
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            m: 0,
          }}
        >
          {taglineHeading}
        </Typography>
        <Typography
          sx={{
            fontFamily: solar.fontBody,
            fontSize: '17px',
            lineHeight: 1.55,
            color: 'rgba(255,255,255,.82)',
            mt: '16px',
            maxWidth: 420,
          }}
        >
          {taglineText}
        </Typography>
        <Box sx={{ display: 'flex', gap: '22px', mt: '28px', flexWrap: 'wrap' }}>
          {ticks.map((tick) => (
            <Box
              key={tick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255,255,255,.92)',
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: solar.accent }} />
              {tick}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Floating form card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-end' },
          px: { xs: '20px', md: 0 },
          pr: { md: '72px' },
          py: { xs: '96px', md: 0 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 440,
            background: solar.paper,
            borderRadius: '20px',
            p: { xs: '28px 24px', md: '40px 40px 36px' },
            boxShadow: '0 30px 80px rgba(10,8,2,.45)',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
