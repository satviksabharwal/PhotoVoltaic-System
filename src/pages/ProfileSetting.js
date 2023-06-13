// @mui
import { styled } from '@mui/material/styles';
import { Container } from '@mui/material';
// sections
import ProfileSettingForm from '../sections/auth/register/ProfileSettingForm';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));

const ProfileSetting = () => (
  <Container maxHeight="sm">
    <StyledRoot>
      <ProfileSettingForm />
    </StyledRoot>
  </Container>
);

export default ProfileSetting;
