import { Helmet } from "react-helmet-async";
import { useState } from "react";
// @mui
import { Box, Button, Container, Modal, TextField, Typography } from "@mui/material";
// components
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";

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
  const [projectData, setProjectData] = useState([]);
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
    setProjectData([...projectData, formField]);
    toast.success(formField);
    setOpen(false);
    resetFormFields();
  };

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
      </Container>
    </>
  );
}
