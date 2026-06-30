import { forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";
// selector
import { useSelector } from "react-redux";
// @mui
import { Box, Link, BoxProps } from "@mui/material";
import { selectCurrentUser } from "../../store/user/user.selector";

// ----------------------------------------------------------------------

interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(({ disabledLink = false, sx, ...other }, ref) => {
  const currentUser = useSelector(selectCurrentUser);

  const logo = (
    <Box
      ref={ref}
      component="img"
      src="/assets/logo.svg"
      sx={{ width: 60, height: 60, borderRadius: "50% 50%", cursor: "pointer", ...sx }}
      {...other}
    />
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <Link
      to={`${currentUser?.displayName ? "/dashboard/app" : "/login"}`}
      component={RouterLink}
      sx={{ display: "contents" }}
    >
      {logo}
    </Link>
  );
});

export default Logo;
