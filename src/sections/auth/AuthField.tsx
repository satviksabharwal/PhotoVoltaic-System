import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Iconify from '../../components/iconify';
import { solar } from './tokens';

// ----------------------------------------------------------------------
// Reusable SolarSense form primitives: a labelled input (with an optional
// password show/hide toggle) and the primary CTA button.
// ----------------------------------------------------------------------

const FieldLabel = styled('label')({
  fontSize: '13px',
  fontWeight: 600,
  color: solar.fieldLabel,
  letterSpacing: '0.01em',
  fontFamily: solar.fontBody,
});

const Input = styled('input')({
  width: '100%',
  boxSizing: 'border-box',
  height: 48,
  border: `1.5px solid ${solar.line}`,
  borderRadius: 12,
  background: solar.inputBg,
  padding: '0 16px',
  fontSize: '15px',
  fontFamily: solar.fontBody,
  color: solar.ink,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
  '&::placeholder': { color: solar.muted },
  '&:focus': {
    borderColor: solar.accent,
    boxShadow: '0 0 0 3px rgba(255,193,7,.22)',
  },
});

interface AuthFieldProps {
  /** Label text, optionally with inline extras such as an info tooltip. */
  label: React.ReactNode;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  value?: string;
  step?: string;
  min?: string | number;
  max?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Render this field as a password whose visibility is driven by `visible`. */
  isPassword?: boolean;
  /** Current password visibility. */
  visible?: boolean;
  /** When provided, an eye toggle button is rendered inside the field. */
  onToggleVisible?: () => void;
}

export default function AuthField({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  minLength,
  autoComplete,
  value,
  step,
  min,
  max,
  onChange,
  isPassword = false,
  visible = false,
  onToggleVisible,
}: AuthFieldProps) {
  const inputType = isPassword ? (visible ? 'text' : 'password') : type;
  const showEye = Boolean(onToggleVisible);
  const fieldId = `field-${name}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <Box sx={{ position: 'relative' }}>
        <Input
          id={fieldId}
          name={name}
          type={inputType}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={onChange}
          style={showEye ? { paddingRight: 48 } : undefined}
        />
        {showEye && (
          <IconButton
            onClick={onToggleVisible}
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
            sx={{
              position: 'absolute',
              right: 6,
              top: 6,
              width: 36,
              height: 36,
              color: solar.muted,
              borderRadius: '8px',
              '&:hover': { background: solar.eyeHover },
            }}
          >
            <Iconify icon={visible ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

// Primary yellow CTA (Sign in / Create account).
export const SubmitButton = styled('button')({
  width: '100%',
  height: 52,
  border: 'none',
  borderRadius: 12,
  background: solar.accent,
  color: solar.ink,
  fontSize: '16px',
  fontWeight: 700,
  fontFamily: solar.fontDisplay,
  cursor: 'pointer',
  marginTop: 18,
  transition: 'filter .15s, transform .1s',
  boxShadow: '0 8px 20px rgba(255,193,7,.35)',
  '&:hover': { filter: 'brightness(.96)' },
  '&:active': { transform: 'translateY(1px)' },
});
