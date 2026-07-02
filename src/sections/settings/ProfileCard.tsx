import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import AuthField from '../auth/AuthField';
import { supabase } from '../../utils/supabase';
import { setCurrentUserAction } from '../../store/user/user.action';
import { selectCurrentUser } from '../../store/user/user.selector';
import { AppDispatch } from '../../store/store';
import { solar, solarApp } from '../../theme/solar';
import { avatarInitials, cardFootSx, cardSubSx, cardTitleSx, primaryButtonSx, settingsCardSx } from './settingsStyles';

// ----------------------------------------------------------------------
// Profile card: identity row (avatar + name + email), editable display
// name and the read-only sign-in email. Saving updates the auth
// user_metadata (what future logins read) and the profiles row in one go.
// ----------------------------------------------------------------------

export default function ProfileCard() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);
  const [name, setName] = useState<string>(currentUser?.displayName ?? '');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    const displayName = name.trim();
    if (!displayName) {
      toast.error('Display name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const { data: userData, error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (authError) {
        toast.error(authError.message);
        return;
      }
      // Keep the profiles row in sync (RLS allows updating your own profile).
      const userId = userData.user?.id;
      if (userId) {
        await supabase.from('profiles').update({ display_name: displayName }).eq('id', userId);
      }
      dispatch(setCurrentUserAction({ ...currentUser, displayName }));
      toast.success('Profile updated');
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={settingsCardSx}>
      <Typography component="h2" sx={cardTitleSx}>
        Profile
      </Typography>
      <Typography sx={cardSubSx}>This information is tied to your SolarSense account.</Typography>

      {/* Identity row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          m: '0 0 24px',
          p: '0 0 24px',
          borderBottom: '1px solid #F1ECDF',
        }}
      >
        <Box
          sx={{
            width: 66,
            height: 66,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD54F, #F0A500)',
            color: '#3E2E00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: solar.fontDisplay,
            fontWeight: 700,
            fontSize: '24px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(240,165,0,.32)',
          }}
        >
          {avatarInitials(currentUser?.displayName, currentUser?.email)}
        </Box>
        <Box>
          <Box sx={{ fontFamily: solar.fontDisplay, fontSize: '17px', fontWeight: 600, color: solar.ink }}>
            {currentUser?.displayName}
          </Box>
          <Box sx={{ fontSize: '13.5px', color: solar.muted, mt: '2px' }}>{currentUser?.email}</Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AuthField
          label="Display name"
          name="displayName"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Box>
          <AuthField label="Email address" name="settingsEmail" type="email" value={currentUser?.email ?? ''} readOnly />
          <Typography sx={{ fontSize: '12px', color: solarApp.label, m: '5px 0 0' }}>
            Your email is used to sign in and can&apos;t be changed here.
          </Typography>
        </Box>
      </Box>

      <Box sx={cardFootSx}>
        <Box component="button" type="button" onClick={handleSave} disabled={saving} sx={primaryButtonSx}>
          {saving ? 'Saving…' : 'Save changes'}
        </Box>
      </Box>
    </Box>
  );
}
