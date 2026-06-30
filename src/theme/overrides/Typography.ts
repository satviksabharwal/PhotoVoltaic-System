import { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Typography(theme: Theme): Components<Theme> {
  return {
    MuiTypography: {
      styleOverrides: {
        paragraph: {
          marginBottom: theme.spacing(2),
        },
        gutterBottom: {
          marginBottom: theme.spacing(1),
        },
      },
    },
  };
}
