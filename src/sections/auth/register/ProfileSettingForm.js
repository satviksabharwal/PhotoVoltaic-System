import { Typography } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import UpdatePassword from "./ProfileSetting/UpdatePassword";
import DeleteAccount from "./ProfileSetting/DeleteAccount";

export default function ProfileSettingForm() {
  return (
    <>
      <UpdatePassword />
      <Typography style={{ fontSize: 16, color: "GrayText", margin: "25px auto" }}>OR</Typography>
      <DeleteAccount />
    </>
  );
}
