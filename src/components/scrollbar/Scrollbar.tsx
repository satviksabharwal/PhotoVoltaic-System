import { memo, ReactNode } from 'react';
import { Props as SimpleBarProps } from 'simplebar-react';
// @mui
import { Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
//
import { StyledRootScrollbar, StyledScrollbar } from './styles';

// ----------------------------------------------------------------------

interface ScrollbarProps extends SimpleBarProps {
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

function Scrollbar({ children, sx, ...other }: ScrollbarProps) {
  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    return (
      <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <StyledRootScrollbar>
      <StyledScrollbar
        // `timeout` is forwarded to SimpleBar but is not part of its current type defs.
        {...({ timeout: 500 } as { timeout: number })}
        clickOnTrack={false}
        sx={sx}
        {...other}
      >
        {children}
      </StyledScrollbar>
    </StyledRootScrollbar>
  );
}

export default memo(Scrollbar);
