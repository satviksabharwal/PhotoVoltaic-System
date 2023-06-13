import React, { useState } from 'react';
import { Stack, TextField, Checkbox, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../../utils/firebase/firebase.utils';

const defaultFormFields = { email: '' };

const ForgotPasswordForm = () => {
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email } = formFields;

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const forgotPasswordHandler = async (event) => {
    event.preventDefault();
    if (email) {
      forgotPassword(email)
        .then(() => toast.success('Password reset link has been sent to your email.'))
        .catch((err) => toast.error(err.message));
    } else {
      toast.error('Please enter email id to get password reset link');
    }
  };

  return (
    <form onSubmit={forgotPasswordHandler}>
      <Stack spacing={2}>
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
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ my: 2 }}>
        <Checkbox
          name="remember"
          label="Remember me"
          sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
          id="outlined-basic"
          variant="outlined"
          fullWidth
          required
        />
        <Typography style={{ fontSize: 14, color: 'GrayText' }}>Are you sure? </Typography>
      </Stack>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        style={{ backgroundColor: '#48B2E3' }}
        name="deleteAccount"
      >
        Forgot Password
      </LoadingButton>
    </form>
  );
};

export default ForgotPasswordForm;
