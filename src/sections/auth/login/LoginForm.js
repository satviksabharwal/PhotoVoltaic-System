import { useState } from "react";
import { useNavigate } from "react-router-dom";
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCurrentUserAction } from "../../../store/user/user.action";
// components
import Iconify from "../../../components/iconify";

// ----------------------------------------------------------------------
const defaultFormFields = { email: "", password: "" };
export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password } = formFields;

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const url = "http://localhost:5500/api/user/login";
      await axios.post(url, { email, password }).then(
        (response) => {
          toast.success("Login Successful!!");
          resetFormFields();
          const tokenId = response?.data?.token;
          const displayName = response?.data?.displayName;
          dispatch(setCurrentUserAction({ tokenId, displayName, email }));
          navigate("/dashboard", { replace: true });
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const forgotPasswordHandler = () => {
    navigate("/forgotpassword");
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        <ToastContainer />
        <Stack spacing={3}>
          <TextField
            name="email"
            label="Email address"
            type={"email"}
            required
            id="email_textfield"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            id="password_textfield"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"} />
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
            style={{ cursor: "pointer" }}
          >
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" style={{ backgroundColor: "#48B2E3" }}>
          Login
        </LoadingButton>
      </form>
    </>
  );
}
