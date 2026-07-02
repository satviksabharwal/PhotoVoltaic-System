import { Box } from '@mui/material';
import { solar } from './tokens';

// ----------------------------------------------------------------------
// SolarSense "sunrise" logo mark: a yellow half-sun disc rising over a white
// horizon line, on a rounded-square background. The default brand mark.
//
//   - solid : ink rounded-square background (use on light surfaces).
//   - glass : translucent, blurred background with a hairline border — used
//             over the photographic/gradient hero in the top chrome.
// ----------------------------------------------------------------------

interface SolarMarkProps {
  size?: number;
  glass?: boolean;
}

export default function SolarMark({ size = 44, glass = false }: SolarMarkProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${Math.round(size * 0.27)}px`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...(glass
          ? {
              background: 'rgba(255,255,255,.14)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,.25)',
            }
          : { background: solar.ink }),
      }}
    >
      <svg viewBox="0 0 44 44" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={22} cy={34} r={12} fill={solar.accent} />
        <rect x={8} y={33} width={28} height={4} rx={2} fill="#fff" opacity={0.9} />
      </svg>
    </Box>
  );
}
