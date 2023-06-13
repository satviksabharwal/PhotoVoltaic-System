import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button, Checkbox } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/logo';
import Iconify from '../components/iconify';
// sections
import { LoginForm } from '../sections/auth/login';
import { signInWithGooglePopup } from '../utils/firebase/firebase.utils';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const mdUp = useResponsive('up', 'md');
  const handleSignInWithGoogle = async (event) => {
    event.preventDefault();
    const { user } = await signInWithGooglePopup();
    console.log('current logged in via google user is*******', user);
    navigate('/dashboard', { replace: true });
  };

  return (
    <>
      <Helmet>
        <title> Login | PV System </title>
      </Helmet>

      <StyledRoot>
        <Logo
          sx={{
            position: 'fixed',
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && (
          <StyledSection>
            <Typography variant="h4" sx={{ px: 5, mt: -5, mb: 2, ml: 2, color: '#48B2E3' }}>
              Hi, Welcome Back
            </Typography>
            <img src="/assets/illustrations/illustration_login.png" alt="login" />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom="true" sx={{ mt: 5 }}>
              Sign in to PV System
            </Typography>

            <Typography variant="body2" sx={{ mb: 5 }}>
              Don’t have an account? {''}
              <Link variant="subtitle2" component={RouterLink} to="/register">
                Get started
              </Link>
            </Typography>
            <LoginForm />
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                OR
              </Typography>
            </Divider>
            <Stack direction="row" marginLeft="auto" marginRight="auto" style={{ margin: 'auto' }} spacing={2}>
              <form onSubmit={handleSignInWithGoogle}>
                <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ my: 2 }}>
                  <Checkbox
                    name="remember"
                    label="Remember me"
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                    id="outlined-basic"
                    variant="outlined"
                    fullWidth
                    required
                  />
                  <Typography style={{ fontSize: 14, color: 'GrayText' }}>
                    By signing in, you agree with our{' '}
                    <Link variant="subtitle2" target="_blank" href="/tac">
                      privacy data statement.*
                    </Link>
                  </Typography>
                </Stack>
                <Button fullWidth size="large" color="inherit" variant="outlined" type="submit">
                  <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                    Sign in with Google
                  </Typography>
                </Button>
              </form>
            </Stack>
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
