import { Box, Container, Modal, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { LoadingButton } from "@mui/lab";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { selectCurrentUser } from "../store/user/user.selector";
import ProductTableContainer from "./ProductTableContainer";

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

const defaultFormFields = {
  latitude: "",
  longitude: "",
  productName: "",
  powerPeak: "",
  orientation: "",
  inclination: "",
  area: "",
};

const ProductPage = () => {
  const params = useParams();
  const [productData, setProductData] = useState();
  const [projectName, setProjectName] = useState("");
  const [open, setOpen] = useState(false);
  const [isProductUpdated, setIsProductUpdated] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const [formFieldModal, setFormFieldModal] = useState("");
  const [buttonType, setButtonType] = useState("");
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };
  const handleChangeModal = (event) => {
    setFormFieldModal(event.target.value);
  };
  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };
  const resetFormFieldsModal = () => {
    setFormFieldModal("");
  };
  const editHandle = () => {
    setButtonType("edit");
    handleOpen();
  };

  const deletehandle = () => {
    setButtonType("delete");
    handleOpen();
  };

  const fetchNewProjectName = async () => {
    try {
      const url = `http://localhost:5500/api/project?projectId=${params.id}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await axios.get(url, config).then(
        (response) => {
          setProjectName(response.data.name);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const deleteModalHandle = async (event) => {
    event.preventDefault();
    try {
      const url = `http://localhost:5500/api/project/delete/${params.id}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await axios.delete(url, config).then(
        (response) => {
          toast.success(response.data.message);
          setOpen(false);
          navigate("/dashboard/projects");
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const url = `http://localhost:5500/api/project/update/${params.id}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await axios.put(url, { name: formFieldModal }, config).then(
        (response) => {
          toast.success(response.data.message);
          resetFormFieldsModal();
          fetchNewProjectName(event);
          setOpen(false);
        },
        (error) => {
          toast.error(error.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    try {
      const url = `http://localhost:5500/api/product/create`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      const { latitude, longitude, productName, powerPeak, orientation, inclination, area } = formFields;
      await axios
        .post(
          url,
          {
            latitude: +latitude,
            longitude: +longitude,
            name: productName,
            powerPeak: +powerPeak,
            orientation,
            inclination: +inclination,
            area: +area,
            project: params?.id,
          },
          config
        )
        .then(
          (response) => {
            toast.success(response.data.message);
            resetFormFields();
            setIsProductUpdated(true);
          },
          (error) => {
            toast.error(error.message);
          }
        );
    } catch (error) {
      toast.error(error);
    }
  };

  const getAllProductLocation = () => {
    try {
      const url = `http://localhost:5500/api/product?projectId=${params?.id}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      fetchNewProjectName();
      axios.get(url, config).then(
        (response) => {
          setProductData(response.data);
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getAllProductLocation();
    fetchNewProjectName();
  }, []);

  return (
    <>
      <Helmet>
        <title>{`Dashboard: ${projectName}`}</title>
      </Helmet>
      <Container maxWidth="l">
        <Container maxWidth="l" sx={{ display: "flex" }}>
          <Typography variant="h4" sx={{ mb: 5 }}>
            {projectName}
          </Typography>
          <Tooltip title="Click To Update Project name.">
            <IconButton sx={{ mt: 0, mb: 5, ml: 1 }} onClick={editHandle}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Click To delete the Project. Caution: Deleting project will delete all the products inside.">
            <IconButton sx={{ mt: 0, mb: 5, ml: 1 }} onClick={deletehandle}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Container>
        <Container maxWidth="l" style={{ marginBottom: "50px", display: "flex" }}>
          <MapContainer
            center={[50.8282, 12.9209]}
            zoom={7}
            scrollWheelZoom={false}
            style={{ maxHeight: "560px", marginLeft: "0px", marginRight: "30px", flex: "0.7" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {productData?.map((product) => (
              <Marker position={[product?.latitude, product?.longitude]} key={product?.id} />
            ))}
          </MapContainer>
          <form
            onSubmit={handleCreateProduct}
            style={{ marginRight: "0px", marginLeft: "auto", width: "100%", flex: "0.3" }}
          >
            <Stack spacing={2}>
              <TextField
                name="latitude"
                label="Latitude"
                type={"float"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />

              <TextField
                name="longitude"
                label="Longitude"
                type={"float"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />

              <TextField
                name="productName"
                label="Product Name"
                type={"text"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />

              <TextField
                name="powerPeak"
                label="Power Peak"
                type={"number"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
              <TextField
                name="orientation"
                label="Orientation(N/E/S/W)"
                type={"text"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
              <TextField
                name="inclination"
                label="Inclination"
                type={"number"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
              <TextField
                name="area"
                label="Area(m²)"
                type={"number"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                onChange={handleChange}
              />
            </Stack>
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              style={{ backgroundColor: "#48B2E3", marginTop: "20px" }}
            >
              Submit
            </LoadingButton>
          </form>
        </Container>
        {buttonType === "edit" ? (
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <form onSubmit={handleRegister}>
                <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: "10px" }}>
                  Enter New Project Name
                </Typography>
                <TextField
                  name="projectName"
                  label="Project Name"
                  type={"text"}
                  required
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  onChange={handleChangeModal}
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
        ) : (
          <></>
        )}
        {buttonType === "delete" ? (
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: "10px" }}>
                Are you sure?
              </Typography>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  style={{ backgroundColor: "#48B2E3", margin: "10px 30px 10px 0px" }}
                  onClick={handleClose}
                >
                  No
                </LoadingButton>
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  style={{ backgroundColor: "#48B2E3", margin: "10px 0px" }}
                  onClick={deleteModalHandle}
                >
                  Yes
                </LoadingButton>
              </div>
            </Box>
          </Modal>
        ) : (
          <></>
        )}
        <ProductTableContainer isProductUpdated={isProductUpdated} />
      </Container>
    </>
  );
};

export default ProductPage;
