import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Modal, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { supabase } from '../../utils/supabase';
import { setCurrentUserAction } from '../../store/user/user.action';
import { selectCurrentUser } from '../../store/user/user.selector';
import { AppDispatch } from '../../store/store';
import { solar } from '../../theme/solar';

// ----------------------------------------------------------------------
// Danger zone card + delete-account modal. Deleting re-authenticates with
// the account password (a password proves ownership; typing DELETE only
// proves intent), then calls the backend, which removes the Supabase auth
// user — projects, sites and readings cascade via foreign keys.
// ----------------------------------------------------------------------

const inputSx = {
  width: '100%',
  boxSizing: 'border-box',
  height: 48,
  border: `1.5px solid ${solar.line}`,
  borderRadius: '12px',
  background: '#fff',
  p: '0 16px',
  fontSize: '15px',
  fontFamily: solar.fontBody,
  color: solar.ink,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
  '&::placeholder': { color: solar.muted },
  '&:focus': { borderColor: solar.accent, boxShadow: '0 0 0 3px rgba(255,193,7,.22)' },
} as const;

export default function DangerZoneCard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectCurrentUser);
  const [open, setOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [deleting, setDeleting] = useState<boolean>(false);

  const closeModal = () => {
    setOpen(false);
    setPassword('');
    setPasswordError('');
  };

  const handleDelete = async () => {
    const email = currentUser?.email;
    if (!email) {
      toast.error('No signed-in user found. Please sign in again.');
      return;
    }
    setDeleting(true);
    try {
      // Re-authenticate: only the account owner can delete the account.
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password });
      if (verifyError) {
        setPasswordError('Incorrect password — please try again.');
        return;
      }
      await api.delete(`/user/${email}`);
      await supabase.auth.signOut();
      dispatch(setCurrentUserAction(null));
      window.localStorage.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? String(error);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Box sx={{ background: '#FDF6F4', border: '1px solid #F2D6CF', borderRadius: '18px', p: '24px 28px', mt: '6px' }}>
        <Typography
          component="h2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            fontFamily: solar.fontDisplay,
            fontSize: '16px',
            fontWeight: 700,
            color: '#B23A2A',
            m: 0,
          }}
        >
          <Box sx={{ width: 9, height: 9, borderRadius: '50%', background: '#D9503B' }} />
          Danger zone
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            mt: '14px',
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontSize: '13.5px', lineHeight: 1.55, color: '#8A6459', maxWidth: 400, m: 0 }}>
            Deleting your account is{' '}
            <Box component="b" sx={{ color: '#B23A2A', fontWeight: 600 }}>
              permanent
            </Box>
            . All your projects, sites, and saved estimates will be removed and cannot be recovered.
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={() => setOpen(true)}
            sx={{
              height: 46,
              px: '22px',
              border: '1.5px solid #E6B3A8',
              borderRadius: '12px',
              background: '#fff',
              color: '#B23A2A',
              fontFamily: solar.fontDisplay,
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all .14s',
              '&:hover': { background: '#B23A2A', color: '#fff', borderColor: '#B23A2A' },
            }}
          >
            Delete account
          </Box>
        </Box>
      </Box>

      {/* Delete confirmation modal (password re-auth) */}
      <Modal open={open} onClose={closeModal} aria-labelledby="delete-account-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 'calc(100% - 40px)', sm: 440 },
            background: solar.paper,
            borderRadius: '22px',
            boxShadow: '0 40px 100px rgba(10,8,2,.55)',
            p: '32px 34px 34px',
            fontFamily: solar.fontBody,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: 5,
              width: '100%',
              background: 'linear-gradient(90deg, #D9503B, #F0876F)',
            }}
          />
          <Box
            component="button"
            type="button"
            onClick={closeModal}
            title="Close"
            aria-label="Close"
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 38,
              height: 38,
              border: 'none',
              borderRadius: '10px',
              background: '#F1ECE0',
              color: '#6B6455',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'background .15s',
              '&:hover': { background: '#E7E0D0' },
            }}
          >
            ✕
          </Box>

          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: '#FBE4DF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              m: '6px 0 16px',
            }}
          >
            🗑
          </Box>
          <Typography
            id="delete-account-title"
            component="h3"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '23px', fontWeight: 700, letterSpacing: '-0.01em', m: 0 }}
          >
            Delete your account?
          </Typography>
          <Typography sx={{ fontSize: '14.5px', lineHeight: 1.55, color: '#6B6455', m: '8px 0 0' }}>
            This will{' '}
            <Box component="b" sx={{ color: '#B23A2A', fontWeight: 600 }}>
              permanently delete
            </Box>{' '}
            your SolarSense account and every project, site, and estimate in it. This action cannot be undone.
          </Typography>

          <Box sx={{ background: '#FDF0EC', border: '1px solid #F2D6CF', borderRadius: '12px', p: '13px 15px', m: '16px 0 14px' }}>
            <Typography sx={{ fontSize: '13px', lineHeight: 1.5, color: '#9A5949', m: 0 }}>
              For your security, enter your{' '}
              <Box component="b" sx={{ color: '#B23A2A', fontWeight: 600 }}>
                account password
              </Box>{' '}
              to confirm.
            </Typography>
          </Box>

          <Box
            component="input"
            type="password"
            placeholder="Enter your password"
            aria-label="Account password"
            autoFocus
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value);
              setPasswordError('');
            }}
            sx={{
              ...inputSx,
              ...(passwordError
                ? { borderColor: '#D9503B', '&:focus': { borderColor: '#D9503B', boxShadow: '0 0 0 3px rgba(217,80,59,.18)' } }
                : {}),
            }}
          />
          {passwordError && (
            <Typography aria-live="polite" sx={{ fontSize: '12.5px', fontWeight: 600, color: '#C0392B', m: '7px 0 0' }}>
              {passwordError}
            </Typography>
          )}

          <Box
            component="button"
            type="button"
            onClick={handleDelete}
            disabled={password.trim().length === 0 || deleting}
            sx={{
              width: '100%',
              height: 50,
              border: 'none',
              borderRadius: '12px',
              background: '#C0392B',
              color: '#fff',
              fontFamily: solar.fontDisplay,
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              mt: '18px',
              transition: 'filter .15s',
              '&:hover': { filter: 'brightness(1.06)' },
              '&:disabled': { background: '#E6C4BE', cursor: 'not-allowed', filter: 'none' },
            }}
          >
            {deleting ? 'Deleting…' : 'Permanently delete account'}
          </Box>
          <Box
            component="button"
            type="button"
            onClick={closeModal}
            sx={{
              width: '100%',
              height: 46,
              border: `1.5px solid ${solar.line}`,
              borderRadius: '12px',
              background: '#fff',
              color: '#3E3828',
              fontFamily: solar.fontDisplay,
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              mt: '10px',
              transition: 'background .15s',
              '&:hover': { background: '#F7F3EA' },
            }}
          >
            Cancel, keep my account
          </Box>
        </Box>
      </Modal>
    </>
  );
}
