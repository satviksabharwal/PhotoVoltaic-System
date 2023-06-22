import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// @mui
import { Box, Button, Container, Modal, TextField, Typography } from "@mui/material";
// components
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import axios from "axios";
import { selectCurrentUser } from "../store/user/user.selector";
import FolderContainer from "./FolderContainer";

// ----------------------------------------------------------------------

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ProjectPage() {
  const [open, setOpen] = useState(false);
  const [formField, setFormField] = useState("");
  const [projectData, setProjectData] = useState([{}]);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event) => {
    setFormField(event.target.value);
  };
  const resetFormFields = () => {
    setFormField("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const url = "http://localhost:5500/api/project/create";
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await axios.post(url, { name: formField }, config).then(
        (response) => {
          // localStorage.setItem("token", response);
          console.log(response);
          toast.success(response.data.message);
          resetFormFields();
          setOpen(false);
          fetchApiCall();
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const fetchApiCall = () => {
    try {
      const url = "http://localhost:5500/api/project";
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      axios.get(url, config).then(
        (response) => {
          // localStorage.setItem("token", response);
          console.log(response.data);
          setProjectData(response.data);
        },
        (error) => {
          toast.error(error.response.data.error);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    fetchApiCall();
  }, []);

  return (
    <>
      <Helmet>
        <title> Dashboard: Projects </title>
      </Helmet>

      <Container maxWidth="l">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Projects
        </Typography>
        <Button variant="contained" style={{ backgroundColor: "#48B2E3" }} size="large" onClick={handleOpen}>
          Create New Project
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={handleRegister}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: "10px" }}>
                Enter Project Name
              </Typography>
              <TextField
                name="projectName"
                label="Project Name"
                type={"text"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                style={{ backgroundColor: "#48B2E3", margin: "10px 0" }}
              >
                Submit
              </LoadingButton>
            </form>
          </Box>
        </Modal>
        <Box
          sx={{
            minWidth: 150,
            maxHeight: "calc(100vh - 50px)",
            marginTop: "50px",
            display: "flex",
            columnGap: "50px",
            flexWrap: "wrap",
          }}
        >
          {projectData?.map((project) =>
            project?.name && project?.id ? (
              <FolderContainer folderName={project?.name} folderId={project?.id} key={project?.id} />
            ) : (
              <></>
            )
          )}
        </Box>
      </Container>
    </>
  );
}
