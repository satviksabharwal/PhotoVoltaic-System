import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Iconify from '../../../../components/iconify';
import { setCurrentUserAction } from '../../../../store/user/user.action';
import { selectCurrentUser } from '../../../../store/user/user.selector';
import { AppDispatch } from '../../../../store/store';

// ----------------------------------------------------------------------

interface UpdatePasswordFormFields {
  displayName: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface UpdatePasswordResponse {
  message?: string;
}

interface ErrorResponse {
  error?: string;
}

const defaultFormFields: UpdatePasswordFormFields = {
  displayName: '',
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

const UpdatePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<UpdatePasswordFormFields>(defaultFormFields);
  const { newPassword, confirmNewPassword } = formFields;
  const currentUser = useSelector(selectCurrentUser);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New and Confirm Password do not match.');
    } else {
      try {
        const url = `http://localhost:5500/api/user/change-password`;
        const email = currentUser?.email;
        const { oldPassword, newPassword } = formFields;
        await axios.post<UpdatePasswordResponse>(url, { email, oldPassword, newPassword }).then(
          (response: AxiosResponse<UpdatePasswordResponse>) => {
            // localStorage.setItem("token", response);
            toast.success(response.data.message);
            dispatch(setCurrentUserAction(null));
            resetFormFields();
            window.localStorage.clear();
            navigate('/login', { replace: true });
          },
          (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.error);
          }
        );
      } catch (error) {
        toast.error(`${error}`);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleRegister}>
        <Stack spacing={3}>
          <TextField
            name="displayName"
            label="Name"
            type={'text'}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            defaultValue={currentUser ? currentUser?.displayName : ''}
            disabled
          />
          <TextField
            name="email"
            label="Email address"
            type={'email'}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            defaultValue={currentUser ? currentUser?.email : ''}
            disabled
          />
          <TextField
            name="oldPassword"
            label="Old Password"
            type={'password'}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />
          <TextField
            name="newPassword"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            id="outlined-basic"
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
          <TextField
            name="confirmNewPassword"
            label="Confirm New Password"
            type={'password'}
            id="outlined-basic"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ my: 2 }}>
          <Checkbox name="remember" sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} id="outlined-basic" required />
          <Typography style={{ fontSize: 14, color: 'GrayText' }}>Are you sure? </Typography>
        </Stack>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          style={{ backgroundColor: '#48B2E3', marginTop: '20px' }}
          name="updateAccount"
        >
          Update Password
        </LoadingButton>
      </form>
    </>
  );
};

export default UpdatePassword;
