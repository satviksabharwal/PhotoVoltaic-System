import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ProfileCard from '../sections/settings/ProfileCard';
import PasswordCard from '../sections/settings/PasswordCard';
import DangerZoneCard from '../sections/settings/DangerZoneCard';
import { solar, solarApp } from '../theme/solar';

// ----------------------------------------------------------------------
// SolarSense Account Settings page: a single centered column of cards —
// profile (display name), password change, and the danger zone (delete
// account with password confirmation).
// ----------------------------------------------------------------------

export default function AccountSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Account settings | SolarSense</title>
      </Helmet>

      <Box sx={{ maxWidth: 680, mx: 'auto', fontFamily: solar.fontBody }}>
        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, mb: '14px' }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ color: solarApp.chipCount, textDecoration: 'none', '&:hover': { color: solar.accentDeep } }}
          >
            Projects
          </Box>
          <Box component="span" sx={{ color: '#CFC7B4' }}>
            /
          </Box>
          <Box component="span" sx={{ color: solar.ink }}>
            Account settings
          </Box>
        </Box>

        {/* Page head */}
        <Box sx={{ m: '0 0 26px' }}>
          <Typography
            component="h1"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em', m: 0 }}
          >
            Account settings
          </Typography>
          <Typography sx={{ fontSize: '15px', color: solar.sub, mt: '6px' }}>
            Manage your profile, password, and account.
          </Typography>
        </Box>

        <ProfileCard />
        <PasswordCard />
        <DangerZoneCard />
      </Box>
    </>
  );
}
