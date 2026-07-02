import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError, AxiosResponse } from 'axios';
import api from '../../../utils/api';
// sections
import AuthField, { SubmitButton } from '../AuthField';
import PrivacyModal from '../PrivacyModal';
import { solar } from '../tokens';

// ----------------------------------------------------------------------

interface RegisterFormFields {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  message?: string;
}

interface ErrorResponse {
  error?: string;
}

const defaultFormFields: RegisterFormFields = { displayName: '', email: '', password: '', confirmPassword: '' };

// Inline validation error color — a warm red that fits the SolarSense palette.
const ERROR_RED = '#D14343';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<RegisterFormFields>(defaultFormFields);
  const [consent, setConsent] = useState<boolean>(false);
  const [privacyOpen, setPrivacyOpen] = useState<boolean>(false);
  const [consentError, setConsentError] = useState<boolean>(false);
  const { displayName, email, password, confirmPassword } = formFields;

  const handleOpenPrivacy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setPrivacyOpen(true);
  };

  const handleAgreePrivacy = () => {
    setConsent(true);
    setConsentError(false);
    setPrivacyOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent) {
      setConsentError(true);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Password do not match');
      return;
    }
    try {
      const url = '/user';
      await api.post<RegisterResponse>(url, { displayName, email, password }).then(
        (response: AxiosResponse<RegisterResponse>) => {
          toast.success(response.data.message);
          resetFormFields();
          navigate('/login', { replace: true });
        },
        (error: AxiosError<ErrorResponse>) => {
          toast.error(error.response?.data?.error);
        }
      );
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <ToastContainer />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AuthField
          label="Display name"
          name="displayName"
          placeholder="Alex Sonnen"
          autoComplete="name"
          required
          value={displayName}
          onChange={handleChange}
        />

        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={handleChange}
        />

        <AuthField
          label="Password"
          name="password"
          placeholder="8+ characters"
          autoComplete="new-password"
          required
          minLength={8}
          isPassword
          value={password}
          onChange={handleChange}
          visible={showPassword}
          onToggleVisible={() => setShowPassword((prev) => !prev)}
        />

        <AuthField
          label="Confirm password"
          name="confirmPassword"
          placeholder="Repeat password"
          autoComplete="new-password"
          required
          minLength={8}
          isPassword
          value={confirmPassword}
          onChange={handleChange}
          visible={showPassword}
        />
      </Box>

      <Box
        component="label"
        sx={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          mt: '16px',
          fontSize: '13px',
          lineHeight: 1.5,
          color: solar.sub,
          fontFamily: solar.fontBody,
        }}
      >
        <Box
          component="input"
          type="checkbox"
          name="remember"
          aria-invalid={consentError}
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            if (event.target.checked) setConsentError(false);
          }}
          sx={{
            width: 18,
            height: 18,
            mt: '1px',
            accentColor: solar.accentDeep,
            flexShrink: 0,
            cursor: 'pointer',
            borderRadius: '3px',
            boxShadow: consentError ? '0 0 0 3px rgba(209,67,67,.35)' : 'none',
          }}
        />
        <span>
          I have read, understood and agree to the{' '}
          <Box
            component="button"
            type="button"
            onClick={handleOpenPrivacy}
            sx={{
              p: 0,
              border: 'none',
              background: 'none',
              font: 'inherit',
              color: solar.accentDeep,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            data privacy statement
          </Box>
          .
        </span>
      </Box>

      {consentError && (
        <Box
          role="alert"
          sx={{ mt: '6px', fontSize: '12.5px', lineHeight: 1.5, color: ERROR_RED, fontFamily: solar.fontBody }}
        >
          Please agree to the data privacy statement to continue.
        </Box>
      )}

      <SubmitButton type="submit">Create account</SubmitButton>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} onAgree={handleAgreePrivacy} />
    </form>
  );
}
