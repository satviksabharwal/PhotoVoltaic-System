import {
  Box,
  Fab,
  Modal,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { selectCurrentUser } from "../store/user/user.selector";
import { StyledTableCell, StyledTableRow } from "./TableContainer.styled";
import NoData from "./nodata.jpg";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #48B2E3",
  borderRadius: "2%",
  boxShadow: 24,
  p: 4,
};

const defaultFormFields = {
  latitude: "",
  longitude: "",
  productName: "",
  orientation: "",
  inclination: "",
  area: "",
};

const ProductTableContainer = (props) => {
  const { isProductUpdated, reportGenerated } = props;
  const params = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [productData, setProductData] = useState();
  const [open, setOpen] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const [productUpdateId, setProductUpdateId] = useState("");
  const [newCreatedProduct, setNewCreatedProduct] = useState(true);
  const [editData, setEditData] = useState({});
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFieldsModal = () => {
    setFormFields("");
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const url = `http://localhost:5500/api/product/update/${productUpdateId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      const { latitude, longitude, productName, orientation, inclination, area } = formFields;
      await axios
        .put(
          url,
          {
            latitude: +latitude,
            longitude: +longitude,
            name: productName,
            orientation,
            inclination: +inclination,
            area: +area,
          },
          config
        )
        .then(
          (response) => {
            toast.success(response.data.message);
            resetFormFieldsModal();
            setOpen(false);
            setProductUpdateId("");
            setEditData({});
            getAllProductData();
          },
          (error) => {
            toast.error(error.message);
          }
        );
    } catch (error) {
      toast.error(error);
    }
  };

  const getAllProductData = () => {
    try {
      const url = `http://localhost:5500/api/product?projectId=${params?.projectId}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
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

  const deletehandle = useCallback(async (id) => {
    try {
      const url = `http://localhost:5500/api/product/delete/${id}`;
      const config = {
        headers: { Authorization: currentUser?.tokenId },
      };
      await axios.delete(url, config).then(
        (response) => {
          console.log(response);
          toast.success(response.data.message);
          getAllProductData();
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  }, []);

  useEffect(() => {
    getAllProductData();
  }, []);

  if (isProductUpdated && newCreatedProduct) {
    getAllProductData();
    setNewCreatedProduct(false);
  }

  const productVisualizationHandle = useCallback(async (id, productName) => {
    navigate(`/dashboard/projects/${params?.projectId}/${id}`, { state: productName });
  }, []);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form
            onSubmit={handleRegister}
            style={{ marginRight: "0px", marginLeft: "auto", width: "100%", flex: "0.3" }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2" style={{ marginBottom: "10px" }}>
              Update Product Name
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="latitude"
                label="Latitude"
                type={"float"}
                required
                id="outlined-basic"
                variant="outlined"
                fullWidth
                defaultValue={editData.latitude}
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
                defaultValue={editData.longitude}
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
                defaultValue={editData.name}
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
                defaultValue={editData.orientation}
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
                defaultValue={editData.inclination}
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
                defaultValue={editData.area}
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
        </Box>
      </Modal>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700, border: "1px solid #48B2E3" }} maxWidth="l" aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Product Name</StyledTableCell>
              <StyledTableCell align="right">Latitude</StyledTableCell>
              <StyledTableCell align="right">Longitude</StyledTableCell>
              <StyledTableCell align="right">Power Peak</StyledTableCell>
              <StyledTableCell align="right">Orientation</StyledTableCell>
              <StyledTableCell align="right">Inclination</StyledTableCell>
              <StyledTableCell align="right">Area</StyledTableCell>
              <StyledTableCell align="right">PV Value (kWh)</StyledTableCell>
              <StyledTableCell align="right">Edit</StyledTableCell>
              <StyledTableCell align="right">Delete</StyledTableCell>
              <StyledTableCell align="center">Data Visualisation</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productData?.length > 0 ? (
              productData?.map((data, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell component="th" scope="row">
                    {data?.name}
                  </StyledTableCell>
                  <StyledTableCell align="right">{data?.latitude.toFixed(4)}</StyledTableCell>
                  <StyledTableCell align="right">{data?.longitude.toFixed(4)}</StyledTableCell>
                  <StyledTableCell align="right">{data?.powerPeak}</StyledTableCell>
                  <StyledTableCell align="right">{data?.orientation}</StyledTableCell>
                  <StyledTableCell align="right">{data?.inclination}</StyledTableCell>
                  <StyledTableCell align="right">{data?.area}</StyledTableCell>
                  <StyledTableCell align="right">{data?.pvValue}</StyledTableCell>
                  <StyledTableCell align="right" sx={{ m: 0 }}>
                    <Tooltip
                      title={`${
                        data?.isReportGeneratdProduct ?? reportGenerated
                          ? "Report has alreday been generated."
                          : "Click to update Product details."
                      }`}
                    >
                      <EditIcon
                        sx={{
                          color: `${data?.isReportGeneratdProduct ?? reportGenerated ? "gray" : "#48B2E3"}`,
                          mt: 1,
                          cursor: `${data?.isReportGeneratdProduct ?? reportGenerated ? "auto" : "pointer"}`,
                        }}
                        onClick={() => {
                          if (data?.isReportGeneratdProduct ?? reportGenerated) {
                            console.log("Test");
                          } else {
                            setEditData({
                              latitude: data?.latitude,
                              longitude: data?.longitude,
                              name: data?.name,
                              orientation: data?.orientation,
                              inclination: data?.inclination,
                              area: data?.area,
                            });
                            setFormFields({
                              latitude: data?.latitude,
                              longitude: data?.longitude,
                              name: data?.name,
                              orientation: data?.orientation,
                              inclination: data?.inclination,
                              area: data?.area,
                            });
                            setProductUpdateId(data?.id);
                            handleOpen();
                          }
                        }}
                      />
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell align="right" sx={{ m: 0 }}>
                    <Tooltip
                      title={`${
                        data?.isReportGeneratdProduct ?? reportGenerated
                          ? "Report has alreday been generated."
                          : "Click to delete the Product."
                      }`}
                    >
                      <DeleteIcon
                        onClick={() => (data?.isReportGeneratdProduct ?? reportGenerated ? "" : deletehandle(data?.id))}
                        sx={{
                          mt: 1,
                          cursor: `${data?.isReportGeneratdProduct ?? reportGenerated ? "auto" : "pointer"}`,
                          color: `${data?.isReportGeneratdProduct ?? reportGenerated ? "gray" : "#48B2E3"}`,
                        }}
                      />
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    style={{ cursor: `${data?.isReportGeneratdProduct ?? reportGenerated ? "auto" : "pointer"}` }}
                    onClick={() =>
                      data?.isReportGeneratdProduct ?? reportGenerated
                        ? ""
                        : productVisualizationHandle(data?.id, data?.name)
                    }
                  >
                    <Fab
                      variant="extended"
                      size="small"
                      style={{
                        backgroundColor: `${data?.isReportGeneratdProduct ?? reportGenerated ? "gray" : "#48B2E3"}`,
                        color: "#fff",
                        cursor: `${data?.isReportGeneratdProduct ?? reportGenerated ? "auto" : "pointer"}`,
                      }}
                      aria-label="add"
                    >
                      <span style={{ marginLeft: "1px" }}>Open</span>
                      <EqualizerIcon sx={{ ml: 1 }} />
                    </Fab>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <StyledTableCell colSpan={11} align="center" style={{ border: "1px solid #48B2E3" }}>
                <img
                  id="nodata"
                  src={NoData}
                  height="400px"
                  width="400px"
                  style={{ margin: "10px auto" }}
                  alt="No Data in Table"
                />
              </StyledTableCell>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default ProductTableContainer;
