import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Link, Typography } from '@mui/material';
// sections
import AuthLayout from '../sections/auth/AuthLayout';
import { solar } from '../sections/auth/tokens';
import { LoginForm } from '../sections/auth/login';

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Sign in | SolarSense </title>
      </Helmet>

      <AuthLayout
        taglineHeading={
          <>
            Catch the sun by day.{' '}
            <Box component="span" sx={{ color: solar.accent }}>
              Light the city by night.
            </Box>
          </>
        }
        taglineText="Pick any spot on the map and see exactly how much solar energy your panels could generate — down to the hour."
        ticks={['Hourly forecasts', 'Any location', 'Free to use']}
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
          Welcome back
        </Typography>
        <Typography sx={{ fontFamily: solar.fontBody, fontSize: '14.5px', color: solar.sub, mt: '8px', mb: '26px' }}>
          Don’t have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            sx={{ color: solar.accentDeep, fontWeight: 600, textDecoration: 'none' }}
          >
            Get started
          </Link>
        </Typography>

        <LoginForm />
      </AuthLayout>
    </>
  );
}
