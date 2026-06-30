import { forwardRef, ReactElement } from 'react';
// icons
import { Icon, IconifyIcon } from '@iconify/react';
// @mui
import { Box, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

interface IconifyProps extends BoxProps {
  icon: IconifyIcon | string | ReactElement;
  width?: number | string;
}

const Iconify = forwardRef<SVGElement, IconifyProps>(({ icon, width = 20, sx, ...other }, ref) => (
  <Box ref={ref} component={Icon} icon={icon} sx={{ width, height: width, ...sx }} {...other} />
));

export default Iconify;
