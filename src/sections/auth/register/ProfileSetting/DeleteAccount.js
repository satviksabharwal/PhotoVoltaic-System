import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { Checkbox, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
// components
import { setCurrentUserAction } from "../../../../store/user/user.action";
import { selectCurrentUser } from "../../../../store/user/user.selector";

const defaultFormFields = { displayName: "", email: "", oldPassword: "", newPassword: "", confirmNewPassword: "" };

const DeleteAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formFields, setFormFields] = useState(defaultFormFields);
  const currentUser = useSelector(selectCurrentUser);

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

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
};

export default DeleteAccount;
