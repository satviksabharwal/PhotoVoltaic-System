import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Link, Typography } from '@mui/material';
// sections
import AuthLayout from '../sections/auth/AuthLayout';
import { solar } from '../sections/auth/tokens';
import { RegisterForm } from '../sections/auth/register';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> Create account | SolarSense </title>
      </Helmet>

      <AuthLayout
        taglineHeading={
          <>
            Every light out there{' '}
            <Box component="span" sx={{ color: solar.accent }}>
              could run on sunshine.
            </Box>
          </>
        }
        taglineText="Create a free account and start estimating hourly solar output for any location on Earth."
        ticks={['2-minute setup', 'No credit card']}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: solar.fontDisplay,
            fontWeight: 700,
            fontSize: '28px',
            letterSpacing: '-0.01em',
            m: 0,
            color: solar.ink,
          }}
        >
          Create your account
        </Typography>
        <Typography sx={{ fontFamily: solar.fontBody, fontSize: '14.5px', color: solar.sub, mt: '8px', mb: '26px' }}>
          Already have an account?{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{ color: solar.accentDeep, fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </Typography>

        <RegisterForm />
      </AuthLayout>
    </>
  );
}
