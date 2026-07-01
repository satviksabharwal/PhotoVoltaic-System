import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError, AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentUserAction } from '../../../store/user/user.action';
import { AppDispatch } from '../../../store/store';
import api from '../../../utils/api';
// components
import Iconify from '../../../components/iconify';

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
    event.preventDefault();
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
    <>
      <form onSubmit={handleLogin}>
        <ToastContainer />
        <Stack spacing={3}>
          <TextField
            name="email"
            label="Email address"
            type={'email'}
            required
            id="email_textfield"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            id="password_textfield"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ my: 2 }}>
          <Link
            variant="subtitle2"
            underline="hover"
            sx={{ ml: 19, marginLeft: `auto` }}
            onClick={forgotPasswordHandler}
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" style={{ backgroundColor: '#48B2E3' }}>
          Login
        </LoadingButton>
      </form>
    </>
  );
}
