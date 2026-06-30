// @mui
import { alpha, styled, Theme } from '@mui/material/styles';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export type LabelColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type LabelVariant = 'filled' | 'outlined' | 'ghost' | 'soft';

export interface LabelOwnerState {
  color: LabelColor;
  variant: LabelVariant;
}

type PaletteColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export const StyledLabel = styled(Box)<{ ownerState: LabelOwnerState }>(
  ({ theme, ownerState }: { theme: Theme; ownerState: LabelOwnerState }) => {
    const isLight = theme.palette.mode === 'light';

    const filledVariant = ownerState.variant === 'filled';

    const outlinedVariant = ownerState.variant === 'outlined';

    const softVariant = ownerState.variant === 'soft';

    const color = ownerState.color as PaletteColor;

    const defaultStyle = {
      ...(ownerState.color === 'default' && {
        // OUTLINED
        ...(outlinedVariant && {
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
        }),
        // SOFT
        ...(softVariant && {
          color: isLight ? theme.palette.text.primary : theme.palette.common.white,
          backgroundColor: alpha(theme.palette.grey[500], 0.16),
        }),
      }),
    };

    const colorStyle = {
      ...(ownerState.color !== 'default' && {
        // FILLED
        ...(filledVariant && {
          color: theme.palette[color].contrastText,
          backgroundColor: theme.palette[color].main,
        }),
        // OUTLINED
        ...(outlinedVariant && {
          backgroundColor: 'transparent',
          color: theme.palette[color].main,
          border: `1px solid ${theme.palette[color].main}`,
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette[color][isLight ? 'dark' : 'light'],
          backgroundColor: alpha(theme.palette[color].main, 0.16),
        }),
      }),
    };

    return {
      height: 24,
      minWidth: 22,
      lineHeight: 0,
      borderRadius: 6,
      cursor: 'default',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      justifyContent: 'center',
      textTransform: 'capitalize',
      padding: theme.spacing(0, 1),
      color: theme.palette.grey[800],
      fontSize: theme.typography.pxToRem(12),
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.palette.grey[300],
      fontWeight: theme.typography.fontWeightBold,
      ...colorStyle,
      ...defaultStyle,
    };
  }
);
