import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import SolarMark from '../../sections/auth/SolarMark';
import { solar, solarApp } from '../../theme/solar';
import AccountPopover from '../dashboard/header/AccountPopover';

// ----------------------------------------------------------------------
// SolarSense app shell: slim white top bar (wordmark left, avatar right)
// over the warm page background — no sidebar. Redesigned pages render into
// the Outlet; content sets its own max-width.
// ----------------------------------------------------------------------

export default function SolarSenseLayout() {
  return (
    <Box sx={{ minHeight: '100vh', background: solarApp.pageBg, fontFamily: solar.fontBody }}>
      <Box
        component="header"
        sx={{
          height: 76,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: '20px', md: '40px' },
          background: '#fff',
          borderBottom: `1px solid ${solarApp.topBarBorder}`,
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <SolarMark size={38} />
          <Typography
            component="span"
            sx={{
              fontFamily: solar.fontDisplay,
              fontWeight: 700,
              fontSize: '20px',
              letterSpacing: '-0.01em',
              color: solar.ink,
            }}
          >
            Solar
            <Box component="span" sx={{ color: solar.accentDeep }}>
              Sense
            </Box>
          </Typography>
        </Box>

        <AccountPopover />
      </Box>

      <Box component="main" sx={{ p: { xs: '28px 20px 48px', md: '36px 56px 56px' } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
