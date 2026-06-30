import { ReactNode, useMemo } from 'react';
// @mui
import { CssBaseline } from '@mui/material';
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
  StyledEngineProvider,
  ThemeOptions,
} from '@mui/material/styles';
//
import palette from './palette';
import shadows from './shadows';
import typography from './typography';
import GlobalStyles from './globalStyles';
import customShadows from './customShadows';
import componentsOverride from './overrides';

// ----------------------------------------------------------------------

interface ThemeProviderProps {
  children?: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const themeOptions: ThemeOptions = useMemo(
    () => ({
      palette,
      shape: { borderRadius: 6 },
      typography,
      shadows: shadows(),
      customShadows: customShadows(),
    }),
    []
  );

  const theme = createTheme(themeOptions);
  // `theme.components` is typed against the non-augmented BaseTheme, while our
  // overrides are written against the augmented Theme; the runtime shape is the
  // same, so cast to the property's own type to satisfy the invariant generic.
  theme.components = componentsOverride(theme) as typeof theme.components;

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
