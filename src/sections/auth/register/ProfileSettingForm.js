import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// @mui
import { Stack, IconButton, InputAdornment, TextField, Checkbox, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser } from "firebase/auth";
import axios from "axios";
// components
import Iconify from "../../../components/iconify";
import { setCurrentUserAction } from "../../../store/user/user.action";
import { selectCurrentUser } from "../../../store/user/user.selector";

const defaultFormFields = { displayName: "", email: "", oldPassword: "", newPassword: "", confirmNewPassword: "" };

export default function ProfileSettingForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { oldPassword, newPassword, confirmNewPassword } = formFields;
  const currentUser = useSelector(selectCurrentUser);

  // let providerId = "";
  // if (currentUser.providerData) providerId = currentUser.providerData[0]?.providerId;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  // const handleRegister = async (event) => {
  //   event.preventDefault();
  //   const auth = getAuth();
  //   const { currentUser } = auth;
  //   const user = auth.currentUser;
  //   const { email } = currentUser;
  //   if (currentUser && providerId === 'password') {
  //     const credential = await EmailAuthProvider.credential(email, oldPassword);
  //     if (credential) {
  //       if (event.nativeEvent.submitter.name === 'changePassword') {
  //         if (newPassword !== confirmNewPassword || newPassword.length < 6) {
  //           toast.error('New and Confirm Password do not match or password length is less then 6 character.');
  //         } else {
  //           await reauthenticateWithCredential(currentUser, credential)
  //             .then((res) => {
  //               if (res) {
  //                 updatePassword(user, newPassword)
  //                   .then(() => {
  //                     toast.success('Password has been changed successfully.');
  //                     resetFormFields();
  //                     navigate('/dashboard/app');
  //                   })
  //                   .catch((err) => toast.error(err.message));
  //               }
  //             })
  //             .catch((err) => {
  //               toast.error(err.message);
  //             });
  //         }
  //       } else if (event.nativeEvent.submitter.name === 'deleteAccount') {
  //         await reauthenticateWithCredential(currentUser, credential)
  //           .then((res) => {
  //             if (res) {
  //               deleteUser(user)
  //                 .then(async () => {
  //                   toast.success('User has been deleted successfully.');
  //                   navigate('/login');
  //                 })
  //                 .catch((error) => {
  //                   toast.error(error.message);
  //                 });
  //             }
  //           })
  //           .catch((err) => {
  //             toast.error(err.message);
  //           });
  //       }
  //     }
  //   } else {
  //     const user = getAuth().currentUser;
  //     user
  //       .delete()
  //       .then(async () => {
  //         toast.success('User has been deleted successfully.');
  //         navigate('/login');
  //       })
  //       .catch((error) => {
  //         console.error('Error deleting user account:', error);
  //       });
  //   }
  // };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const url = `http://localhost:5500/api/user/${currentUser.email}`;
      await axios.delete(url).then(
        (response) => {
          // localStorage.setItem("token", response);
          toast.success(response.data.message);
          dispatch(setCurrentUserAction({ undefined }));
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
      resetFormFields();
      window.localStorage.clear();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error);
    }
  };
  useEffect(() => {}, [currentUser]);
  return (
    <>
      <form onSubmit={handleRegister}>
        <Stack spacing={3}>
          <TextField
            name="displayName"
            label="Name"
            type={"text"}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            defaultValue={currentUser ? currentUser?.displayName : ""}
            disabled
          />
          <TextField
            name="email"
            label="Email address"
            type={"email"}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            defaultValue={currentUser ? currentUser?.email : ""}
            disabled
          />
          {/* {providerId === "password" ? (
            <>
              <TextField
                name="oldPassword"
                label="Old Password"
                type={"password"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
              <TextField
                name="newPassword"
                label="New Password"
                type={showPassword ? "text" : "password"}
                id="outlined-basic"
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
              <TextField
                name="confirmNewPassword"
                label="Confirm New Password"
                type={"password"}
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
            </>
          ) : null} */}
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ my: 2 }}>
          <Checkbox
            name="remember"
            label="Remember me"
            sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
            id="outlined-basic"
            variant="outlined"
            fullWidth
            required
          />
          <Typography style={{ fontSize: 14, color: "GrayText" }}>Are you sure? </Typography>
        </Stack>
        {/* {providerId === "password" ? (
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            style={{ backgroundColor: "#48B2E3" }}
            name="changePassword"
          >
            Change Password
          </LoadingButton>
        ) : null} */}
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          style={{ backgroundColor: "#DC143C", marginTop: "20px" }}
          name="deleteAccount"
        >
          Delete Account
        </LoadingButton>
      </form>
    </>
  );
}
