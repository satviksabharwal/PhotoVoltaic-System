// MUI theme module augmentation.
// This template extends the default MUI theme with:
//   - extra palette color shades (`lighter` / `darker`) on every PaletteColor
//   - a custom `background.neutral` background color
//   - a `customShadows` object on the Theme (see src/theme/customShadows.ts)
// Augmenting these here makes the whole app typecheck against the custom theme.
// ----------------------------------------------------------------------

import '@mui/material/styles';

// Shape produced by src/theme/customShadows.ts
export interface CustomShadows {
  z1: string;
  z4: string;
  z8: string;
  z12: string;
  z16: string;
  z20: string;
  z24: string;
  //
  primary: string;
  info: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  //
  card: string;
  dialog: string;
  dropdown: string;
}

declare module '@mui/material/styles' {
  // ----- Custom palette color shades (used as theme.palette.primary.lighter, etc.) -----
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }

  // ----- Custom background color (theme.palette.background.neutral) -----
  interface TypeBackground {
    neutral: string;
  }

  // ----- Custom shadows (theme.customShadows.*) -----
  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
}
