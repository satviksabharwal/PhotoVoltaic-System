import { solar, solarApp } from '../../theme/solar';

// ----------------------------------------------------------------------
// Shared styles for the Account Settings cards, per the SETTINGS_PAGE
// design handoff.
// ----------------------------------------------------------------------

export const settingsCardSx = {
  background: '#fff',
  border: `1px solid ${solarApp.cardBorder}`,
  borderRadius: '18px',
  p: '26px 28px',
  mb: '22px',
} as const;

export const cardTitleSx = {
  fontFamily: solar.fontDisplay,
  fontSize: '18px',
  fontWeight: 600,
  color: solar.ink,
  m: 0,
} as const;

export const cardSubSx = {
  fontSize: '13.5px',
  color: solar.muted,
  m: '5px 0 22px',
} as const;

/** Right-aligned card footer holding the primary action. */
export const cardFootSx = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  mt: '24px',
} as const;

/** 46px primary button (accent), with the design's disabled state. */
export const primaryButtonSx = {
  height: 46,
  px: '22px',
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
  '&:disabled': {
    background: '#EDE8DB',
    color: '#B7AF9C',
    boxShadow: 'none',
    cursor: 'not-allowed',
    filter: 'none',
    transform: 'none',
  },
} as const;

/** Returns up to two initials for the avatar, e.g. "Satvik Sabharwal" → "SS". */
export function avatarInitials(name?: string, email?: string): string {
  const source = name?.trim() || email || 'S';
  return source
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
