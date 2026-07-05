import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
// Landing page for the password-recovery email link. Supabase redirects here
// with a recovery token in the URL; supabase-js picks it up automatically
// (detectSessionInUrl) and establishes a temporary session, which is all
// updateUser({ password }) needs.
// ----------------------------------------------------------------------

export default function ResetPassword() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    // The recovery hash may still be processing when the page mounts, so ask
    // once and also listen for the session to appear.
    supabase.auth.getSession().then(({ data }) => {
      setHasSession((current) => current ?? Boolean(data.session));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setHasSession(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      // Drop the temporary recovery session and start fresh at the login page.
      await supabase.auth.signOut();
      toast.success('Password updated — sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <>
      <Helmet>
        <title> Reset password | SolarSense </title>
      </Helmet>

      <AuthLayout
        taglineHeading={
          <>
            A fresh start,{' '}
            <Box component="span" sx={{ color: solar.accent }}>
              same sunshine.
            </Box>
          </>
        }
        taglineText="Choose a new password for your account. After saving it you'll be taken back to the sign-in page."
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
          Choose a new password
        </Typography>

        {hasSession === false && (
          <Typography sx={{ fontFamily: solar.fontBody, fontSize: '15px', color: solar.sub, mt: '16px', lineHeight: 1.6 }}>
            This reset link is invalid or has expired.{' '}
            <Link
              component={RouterLink}
              to="/forgotpassword"
              sx={{ color: solar.accentDeep, fontWeight: 600, textDecoration: 'none' }}
            >
              Request a new one
            </Link>
            .
          </Typography>
        )}

        {hasSession && (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', mt: '26px' }}>
              <AuthField
                label="New password"
                name="password"
                placeholder="8+ characters"
                autoComplete="new-password"
                required
                minLength={8}
                isPassword
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                visible={showPassword}
                onToggleVisible={() => setShowPassword((prev) => !prev)}
              />
              <AuthField
                label="Confirm new password"
                name="confirmPassword"
                placeholder="Repeat password"
                autoComplete="new-password"
                required
                minLength={8}
                isPassword
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                visible={showPassword}
              />
            </Box>
            <SubmitButton type="submit">Save new password</SubmitButton>
          </form>
        )}
      </AuthLayout>
    </>
  );
}
