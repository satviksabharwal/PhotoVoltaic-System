import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
// @mui
import { styled } from "@mui/material/styles";
import { Link, Container, Typography } from "@mui/material";
// hooks
import useResponsive from "../hooks/useResponsive";
// components
import Logo from "../components/logo";
// sections
import { LoginForm } from "../sections/auth/login";

// ----------------------------------------------------------------------

const StyledRoot = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const StyledSection = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: 480,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  const mdUp = useResponsive("up", "md");

  return (
    <>
      <Helmet>
        <title> Login | PV System </title>
      </Helmet>

      <StyledRoot>
        <Logo
          sx={{
            position: "fixed",
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && (
          <StyledSection>
            <Typography variant="h4" sx={{ px: 5, mt: -5, mb: 2, ml: 2, color: "#48B2E3" }}>
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
              Don’t have an account? {""}
              <Link variant="subtitle2" component={RouterLink} to="/register">
                Get started
              </Link>
            </Typography>
            <LoginForm />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
