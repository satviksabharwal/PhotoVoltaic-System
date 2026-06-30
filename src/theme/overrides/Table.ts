import { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Table(theme: Theme): Components<Theme> {
  return {
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
        },
      },
    },
  };
}
