import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Link } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError, AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentUserAction } from '../../../store/user/user.action';
import { AppDispatch } from '../../../store/store';
import api from '../../../utils/api';
// sections
import AuthField, { SubmitButton } from '../AuthField';
import { solar } from '../tokens';

// ----------------------------------------------------------------------

interface LoginFormFields {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  displayName?: string;
}

interface ErrorResponse {
  error?: string;
}

const defaultFormFields: LoginFormFields = { email: '', password: '' };

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<LoginFormFields>(defaultFormFields);
  const { email, password } = formFields;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const url = '/user/login';
      await api.post<LoginResponse>(url, { email, password }).then(
        (response: AxiosResponse<LoginResponse>) => {
          toast.success('Login Successful!!');
          resetFormFields();
          const tokenId = response?.data?.token;
          const displayName = response?.data?.displayName;
          dispatch(setCurrentUserAction({ tokenId, displayName, email }));
          navigate('/dashboard', { replace: true });
        },
        (error: AxiosError<ErrorResponse>) => {
          toast.error(error.response?.data?.error);
        }
      );
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const forgotPasswordHandler = () => {
    navigate('/forgotpassword');
  };

  return (
    <form onSubmit={handleLogin}>
      <ToastContainer />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          placeholder="••••••••"
          autoComplete="current-password"
          required
          isPassword
          value={password}
          onChange={handleChange}
          visible={showPassword}
          onToggleVisible={() => setShowPassword((prev) => !prev)}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '10px' }}>
        <Link
          onClick={forgotPasswordHandler}
          sx={{
            fontSize: '13.5px',
            fontWeight: 600,
            color: solar.accentDeep,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Forgot password?
        </Link>
      </Box>

      <SubmitButton type="submit">Sign in</SubmitButton>
    </form>
  );
}
