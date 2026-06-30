import { Components, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Paper(): Components<Theme> {
  return {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  };
}
