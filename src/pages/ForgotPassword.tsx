import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Link, Typography } from '@mui/material';
import { toast } from 'react-toastify';
// sections
import AuthLayout from '../sections/auth/AuthLayout';
import AuthField, { SubmitButton } from '../sections/auth/AuthField';
import { solar } from '../sections/auth/tokens';
import { supabase } from '../utils/supabase';

// ----------------------------------------------------------------------

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      // Same message whether or not the account exists, so the form can't be
      // used to probe which emails are registered.
      setSent(true);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <>
      <Helmet>
        <title> Forgot password | SolarSense </title>
      </Helmet>

      <AuthLayout
        taglineHeading={
          <>
            Locked out?{' '}
            <Box component="span" sx={{ color: solar.accent }}>
              The sun still rises.
            </Box>
          </>
        }
        taglineText="Enter the email you signed up with and we'll send you a link to set a new password."
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
          Reset your password
        </Typography>
        <Typography sx={{ fontFamily: solar.fontBody, fontSize: '14.5px', color: solar.sub, mt: '8px', mb: '26px' }}>
          Remembered it after all?{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{ color: solar.accentDeep, fontWeight: 600, textDecoration: 'none' }}
          >
            Back to sign in
          </Link>
        </Typography>

        {sent ? (
          <Typography sx={{ fontFamily: solar.fontBody, fontSize: '15px', color: solar.ink, lineHeight: 1.6 }}>
            If an account exists for <strong>{email}</strong>, a password-reset link is on its way. Check your inbox
            (and the spam folder) and follow the link to choose a new password.
          </Typography>
        ) : (
          <form onSubmit={handleSubmit}>
            <AuthField
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <SubmitButton type="submit">Send reset link</SubmitButton>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
