import { useId } from 'react';
import { Box } from '@mui/material';
import { solar } from '../../../theme/solar';

// ----------------------------------------------------------------------
// Small "?" help icon with a popover, per the design's info-tooltip
// pattern. Rendered as a real button and shown on focus as well as hover,
// so it works with a keyboard and on touch screens. Highlight key words in
// the tip with <b> — they render in the accent colour.
// ----------------------------------------------------------------------

interface InfoTipProps {
  tip: React.ReactNode;
  ariaLabel?: string;
  /** Anchor the popover centred over the icon, or to its right edge (for icons near a card's right side). */
  align?: 'center' | 'right';
}

export default function InfoTip({ tip, ariaLabel = 'More information', align = 'center' }: InfoTipProps) {
  const tipId = useId();

  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel}
      aria-describedby={tipId}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 15,
        height: 15,
        p: 0,
        ml: '6px',
        verticalAlign: 'middle',
        flexShrink: 0,
        border: '1.5px solid #C9C1AD',
        borderRadius: '50%',
        background: 'none',
        color: '#9A9280',
        fontFamily: solar.fontBody,
        fontSize: '9.5px',
        fontWeight: 700,
        lineHeight: 1,
        cursor: 'help',
        outline: 'none',
        '&:hover, &:focus': { borderColor: solar.accentDeep, color: solar.accentDeep },
        '&:hover > [role="tooltip"], &:focus > [role="tooltip"]': { opacity: 1, visibility: 'visible' },
      }}
    >
      ?
      <Box
        id={tipId}
        role="tooltip"
        sx={{
          position: 'absolute',
          bottom: 'calc(100% + 9px)',
          ...(align === 'center'
            ? { left: '50%', transform: 'translateX(-50%)' }
            : { right: '-5px' }),
          width: 236,
          background: solar.ink,
          color: '#fff',
          fontFamily: solar.fontBody,
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 'normal',
          textTransform: 'none',
          textAlign: 'left',
          borderRadius: '10px',
          p: '10px 13px',
          boxShadow: '0 12px 30px rgba(10,8,2,.42)',
          zIndex: 600,
          pointerEvents: 'none',
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity .15s',
          '& b': { color: solar.accent, fontWeight: 600 },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '100%',
            ...(align === 'center'
              ? { left: '50%', transform: 'translateX(-50%)' }
              : { right: '7px' }),
            border: '6px solid transparent',
            borderTopColor: solar.ink,
          },
        }}
      >
        {tip}
      </Box>
    </Box>
  );
}
