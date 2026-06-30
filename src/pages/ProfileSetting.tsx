// @mui
import { styled, Theme } from "@mui/material/styles";
import { Container } from "@mui/material";
// sections
import ProfileSettingForm from "../sections/auth/register/ProfileSettingForm";

// ----------------------------------------------------------------------

const StyledRoot = styled("div")(({ theme }: { theme: Theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
}));

const ProfileSetting = () => (
  <Container maxWidth="sm">
    <StyledRoot>
      <ProfileSettingForm />
    </StyledRoot>
  </Container>
);

export default ProfileSetting;
