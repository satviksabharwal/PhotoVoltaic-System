import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import AuthField from '../auth/AuthField';
import { supabase } from '../../utils/supabase';
import { selectCurrentUser } from '../../store/user/user.selector';
import { solarApp } from '../../theme/solar';
import { cardFootSx, cardSubSx, cardTitleSx, primaryButtonSx, settingsCardSx } from './settingsStyles';

// ----------------------------------------------------------------------
// Password card: current + new + confirm with a live strength meter and
// match hint. Supabase has no "change password with old password" call, so
// the current password is verified by re-authenticating first. On success
// the user stays signed in here; other devices are signed out.
// ----------------------------------------------------------------------

interface StrengthMeta {
  pct: number;
  color: string;
  label: string;
}

/** 0–4 score: length ≥ 8 / ≥ 12, mixed case, digit, symbol (capped). */
function strengthLevel(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(4, score);
}

const STRENGTH_META: StrengthMeta[] = [
  { pct: 25, color: '#D9503B', label: 'Weak' },
  { pct: 25, color: '#D9503B', label: 'Weak' },
  { pct: 50, color: '#E0A400', label: 'Fair' },
  { pct: 78, color: '#3B9E6E', label: 'Good' },
  { pct: 100, color: '#1F8A5B', label: 'Strong' },
];

export default function PasswordCard() {
  const currentUser = useSelector(selectCurrentUser);
  const [current, setCurrent] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [showNew, setShowNew] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const strength = STRENGTH_META[strengthLevel(newPassword)];
  const matches = confirm.length > 0 && newPassword === confirm;
  const valid = current.length > 0 && newPassword.length >= 8 && matches;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = currentUser?.email;
    if (!email) {
      toast.error('No signed-in user found. Please sign in again.');
      return;
    }
    setSaving(true);
    try {
      // Verify the current password by re-authenticating before updating.
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: current });
      if (verifyError) {
        toast.error('Current password is incorrect.');
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        toast.error(updateError.message);
        return;
      }
      // Best-effort: end any sessions on other devices; this one stays valid.
      await supabase.auth.signOut({ scope: 'others' }).catch(() => undefined);
      setCurrent('');
      setNewPassword('');
      setConfirm('');
      setShowNew(false);
      toast.success('Password updated. Other devices have been signed out.');
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={settingsCardSx}>
      <Typography component="h2" sx={cardTitleSx}>
        Password
      </Typography>
      <Typography sx={cardSubSx}>Use a strong password you don&apos;t reuse elsewhere.</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AuthField
          label="Current password"
          name="currentPassword"
          type="password"
          placeholder="Enter current password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />

        <Box>
          <AuthField
            label="New password"
            name="newPassword"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            isPassword
            visible={showNew}
            onToggleVisible={() => setShowNew((previous) => !previous)}
          />
          {newPassword.length > 0 && (
            <Box sx={{ mt: '10px' }}>
              <Box sx={{ height: 6, borderRadius: '4px', background: '#EFEADD', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: '4px',
                    width: `${strength.pct}%`,
                    background: strength.color,
                    transition: 'width .2s, background .2s',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '7px' }}>
                <Box aria-live="polite" sx={{ fontSize: '12px', fontWeight: 600, color: strength.color }}>
                  {strength.label}
                </Box>
                <Box sx={{ fontSize: '11.5px', color: solarApp.label }}>Use 8+ chars with numbers &amp; symbols</Box>
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          <AuthField
            label="Confirm new password"
            name="confirmNewPassword"
            placeholder="Repeat new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            isPassword
            visible={showNew}
          />
          {confirm.length > 0 && (
            <Box
              aria-live="polite"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                mt: '7px',
                color: matches ? '#1F8A5B' : '#C0392B',
              }}
            >
              {matches ? '✓ Passwords match' : '✕ Passwords don’t match'}
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={cardFootSx}>
        <Box component="button" type="submit" disabled={!valid || saving} sx={primaryButtonSx}>
          {saving ? 'Updating…' : 'Update password'}
        </Box>
      </Box>
    </Box>
  );
}
