import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { solar } from '../../theme/solar';

interface ActivateButtonProps {
  onClick: () => void;
  busy: boolean;
  children: ReactNode;
}

export function ActivateButton({ onClick, busy, children }: ActivateButtonProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={busy}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        height: 44,
        px: '20px',
        border: 'none',
        borderRadius: '12px',
        background: solar.ink,
        color: '#fff',
        fontFamily: solar.fontDisplay,
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'filter .15s',
        '&:hover': { filter: 'brightness(1.2)' },
        '&:disabled': { opacity: 0.7, cursor: 'wait' },
        '&:focus-visible': { outline: `2px solid ${solar.accent}`, outlineOffset: 2 },
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: solar.accent,
          boxShadow: '0 0 0 3px rgba(255,193,7,.3)',
        }}
      />
      {children}
    </Box>
  );
}

interface PausedBannerProps {
  lastRecordedLabel: string;
  onActivate: () => void;
  activating: boolean;
}

export default function PausedBanner({ lastRecordedLabel, onActivate, activating }: PausedBannerProps) {
  return (
    <>
      <Box
        role="status"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          p: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(120deg, #FDF3D6, #FFFDF6)',
          border: '1px solid #F0E1A8',
          mb: '22px',
          flexWrap: 'wrap',
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: '#FBEFC2',
            color: '#8A6A00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}
        >
          ⏸
        </Box>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography
            sx={{ fontFamily: solar.fontDisplay, fontSize: '15.5px', fontWeight: 700, color: solar.ink, m: 0 }}
          >
            Data collection is paused
          </Typography>
          <Typography sx={{ fontSize: '13px', lineHeight: 1.5, color: '#7A6E4A', m: '4px 0 0' }}>
            This project is inactive, so SolarSense stopped recording hourly production. You&apos;re viewing insights up
            to{' '}
            <Box component="b" sx={{ color: '#8A6A00', fontWeight: 600 }}>
              {lastRecordedLabel}
            </Box>
            . Reactivate the project to resume live data.
          </Typography>
        </Box>
        <ActivateButton onClick={onActivate} busy={activating}>
          {activating ? 'Reactivating…' : 'Activate project'}
        </ActivateButton>
      </Box>

      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#A39B87', m: '0 0 16px' }}
      >
        <Box aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', background: '#C6C0B0', flexShrink: 0 }} />
        Last recorded {lastRecordedLabel} — figures below won&apos;t change until collection resumes
      </Box>
    </>
  );
}
