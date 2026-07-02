import { Box, Typography } from '@mui/material';
import { solar, solarApp } from '../../../theme/solar';

// ----------------------------------------------------------------------
// Empty state for the sites table: glowing-sun-over-panel illustration,
// copy and the two calls to action, per the PROJECT_DETAIL empty-state spec.
// ----------------------------------------------------------------------

interface EmptySitesStateProps {
  /** Focus the add-site form. */
  onAddFirst: () => void;
  onUseMyLocation: () => void;
}

/** Sun with fanned rays above a small solar-panel card on a stub post. Also reused by the Insights cold-start panel. */
export function EmptySitesIllustration() {
  const rayAngles = [-157.5, -135, -112.5, -90, -67.5, -45, -22.5];
  const cellColumns = [41, 59, 77];
  const cellRows = [63, 77];
  return (
    <svg width={132} height={104} viewBox="0 0 132 104" aria-hidden focusable="false">
      <defs>
        <radialGradient id="empty-sun" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFB300" />
        </radialGradient>
        <linearGradient id="empty-cell" x1="0%" y1="0%" x2="86%" y2="50%">
          <stop offset="0%" stopColor="#FFF3D0" />
          <stop offset="100%" stopColor="#FCE8A6" />
        </linearGradient>
      </defs>

      {/* Soft glow rings */}
      <circle cx={66} cy={38} r={34} fill="rgba(255,193,7,.07)" />
      <circle cx={66} cy={38} r={26} fill="rgba(255,193,7,.14)" />

      {/* Rays fanned over the top */}
      {rayAngles.map((angle) => {
        const radians = (angle * Math.PI) / 180;
        const x1 = 66 + Math.cos(radians) * 20;
        const y1 = 38 + Math.sin(radians) * 20;
        const x2 = 66 + Math.cos(radians) * 26;
        const y2 = 38 + Math.sin(radians) * 26;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={solar.accent}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}

      {/* Sun disc */}
      <circle cx={66} cy={38} r={16} fill="url(#empty-sun)" />

      {/* Stub post + panel card */}
      <rect x={63} y={90} width={6} height={10} rx={2} fill="#E0D8C4" />
      <rect x={36} y={58} width={60} height={34} rx={8} fill="#fff" stroke="#E7E0CF" strokeWidth={1.5} />
      {cellRows.map((y) =>
        cellColumns.map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={16} height={12} rx={2.5} fill="url(#empty-cell)" />
        ))
      )}
    </svg>
  );
}

export default function EmptySitesState({ onAddFirst, onUseMyLocation }: EmptySitesStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: '56px 24px 60px',
      }}
    >
      <EmptySitesIllustration />
      <Typography
        sx={{ fontFamily: solar.fontDisplay, fontSize: '19px', fontWeight: 700, color: solar.ink, mt: '18px' }}
      >
        No sites yet
      </Typography>
      <Typography sx={{ maxWidth: 360, fontSize: '14px', color: solar.muted, lineHeight: 1.6, mt: '8px' }}>
        Add your first site to start estimating solar output. Pin a location on the map above, or search for a place —
        we&apos;ll fill in the coordinates for you.
      </Typography>
      <Box sx={{ display: 'flex', gap: '12px', mt: '22px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Box
          component="button"
          type="button"
          onClick={onAddFirst}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: 46,
            px: '20px',
            border: 'none',
            borderRadius: '12px',
            background: solar.accent,
            color: solar.ink,
            fontFamily: solar.fontDisplay,
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(255,193,7,.35)',
            transition: 'filter .15s, transform .1s',
            '&:hover': { filter: 'brightness(.96)' },
            '&:active': { transform: 'translateY(1px)' },
          }}
        >
          ＋ Add your first site
        </Box>
        <Box
          component="button"
          type="button"
          onClick={onUseMyLocation}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: 46,
            px: '20px',
            border: `1.5px solid ${solar.line}`,
            borderRadius: '12px',
            background: '#fff',
            color: solar.fieldLabel,
            fontFamily: solar.fontDisplay,
            fontSize: '14.5px',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { background: solarApp.chipHover },
          }}
        >
          ◎ Use my location
        </Box>
      </Box>
      <Typography sx={{ fontSize: '12.5px', color: solarApp.label, mt: '16px' }}>
        Tip: click anywhere on the map to drop a pin
      </Typography>
    </Box>
  );
}
