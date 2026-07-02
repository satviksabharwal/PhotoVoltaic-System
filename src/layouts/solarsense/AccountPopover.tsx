import { useState, MouseEvent } from 'react';
// selector
import { useDispatch, useSelector } from 'react-redux';

// @mui
import { Box, Divider, Typography, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from '../../components/iconify';
import { AppDispatch } from '../../store/store';
import { setCurrentUserAction } from '../../store/user/user.action';
import { selectCurrentUser } from '../../store/user/user.selector';
import { supabase } from '../../utils/supabase';
import { solar } from '../../theme/solar';
import { avatarInitials } from '../../sections/settings/settingsStyles';

// ----------------------------------------------------------------------
// Top-right profile avatar dropdown, per the SETTINGS_PAGE design handoff:
// brand-yellow gradient avatar with a focus ring on hover/open, and a menu
// panel with an identity header, nav items and a visually distinct Logout.
// Used on every signed-in screen.
// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  { label: 'Home', icon: 'eva:home-outline', path: '/' },
  { label: 'Account settings', icon: 'eva:settings-2-outline', path: '/account-settings' },
];

const AVATAR_RING = '0 0 0 2px #fff, 0 0 0 4px rgba(255,193,7,.55)';

const itemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  p: '10px',
  borderRadius: '10px',
  fontFamily: solar.fontBody,
  fontSize: '14px',
  fontWeight: 500,
  color: '#3E3828',
  '&:hover': { background: '#FAF6EC' },
} as const;

export default function AccountPopover() {
  const [open, setOpen] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => setOpen(null);

  const handleNavigate = (path: string) => {
    handleClose();
    navigate(path);
  };

  const handleLogOut = async () => {
    handleClose();
    // End the Supabase session before wiping local state.
    await supabase.auth.signOut();
    dispatch(setCurrentUserAction(null));
    // clear values after logout!
    window.localStorage.clear();
    navigate('/login', { replace: true });
  };

  const initials = avatarInitials(currentUser?.displayName, currentUser?.email);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="Account menu"
        sx={{ p: 0, '&:hover .MuiAvatar-root': { boxShadow: AVATAR_RING } }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #FFD54F, #F0A500)',
            color: '#3E2E00',
            fontFamily: solar.fontDisplay,
            fontWeight: 700,
            fontSize: 14,
            transition: 'box-shadow .15s',
            boxShadow: open ? AVATAR_RING : '0 2px 6px rgba(240,165,0,.35)',
          }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: '8px',
            mt: 1,
            width: 252,
            background: '#fff',
            border: '1px solid #EEE8DA',
            borderRadius: '15px',
            boxShadow: '0 20px 48px rgba(29,26,20,.18)',
          },
        }}
      >
        {/* Identity header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', p: '8px 10px 12px' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #FFD54F, #F0A500)',
              color: '#3E2E00',
              fontFamily: solar.fontDisplay,
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontFamily: solar.fontDisplay, fontSize: '14px', fontWeight: 600, color: solar.ink }}>
              {currentUser?.displayName}
            </Typography>
            <Typography noWrap sx={{ fontSize: '12.5px', color: solar.muted }}>
              {currentUser?.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#F1ECDF', mb: '6px' }} />

        {MENU_OPTIONS.map((option) => (
          <MenuItem key={option.label} onClick={() => handleNavigate(option.path)} sx={itemSx}>
            <Iconify icon={option.icon} width={18} sx={{ color: '#9A9280', flexShrink: 0 }} />
            {option.label}
          </MenuItem>
        ))}

        <Divider sx={{ borderColor: '#F1ECDF', my: '6px' }} />

        <MenuItem
          onClick={handleLogOut}
          sx={{ ...itemSx, color: '#B23A2A', '&:hover': { background: '#FDF0EC' } }}
        >
          <Iconify icon="eva:log-out-outline" width={18} sx={{ color: '#C0392B', flexShrink: 0 }} />
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
