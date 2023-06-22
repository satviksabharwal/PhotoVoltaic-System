import { IconButton, Table, TableBody, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../store/user/user.selector";
import { StyledTableCell, StyledTableRow } from "./TableContainer.styled";

const ProductTableContainer = (productData) => {
  const currentUser = useSelector(selectCurrentUser);

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
        },
        (error) => {
          toast.error(error.data.message);
        }
      );
    } catch (error) {
      toast.error(error);
    }
  }, []);

  console.log(productData);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700, border: "1px solid #48B2E3" }} maxWidth="l" aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Product Name</StyledTableCell>
            <StyledTableCell align="right">Power Peak</StyledTableCell>
            <StyledTableCell align="right">Orientation</StyledTableCell>
            <StyledTableCell align="right">Inclination</StyledTableCell>
            <StyledTableCell align="right">Area</StyledTableCell>
            <StyledTableCell align="right">Longitude</StyledTableCell>
            <StyledTableCell align="right">Latitude</StyledTableCell>
            <StyledTableCell align="right">PV Data</StyledTableCell>
            <StyledTableCell align="right">Edit</StyledTableCell>
            <StyledTableCell align="right">Delete</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productData?.productData?.length > 0 ? (
            productData?.productData?.map((data, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell component="th" scope="row">
                  {data.name}
                </StyledTableCell>
                <StyledTableCell align="right">{data.powerPeak}</StyledTableCell>
                <StyledTableCell align="right">{data.orientation}</StyledTableCell>
                <StyledTableCell align="right">{data.inclination}</StyledTableCell>
                <StyledTableCell align="right">{data.area}</StyledTableCell>
                <StyledTableCell align="right">{data.longitude}</StyledTableCell>
                <StyledTableCell align="right">{data.latitude}</StyledTableCell>
                <StyledTableCell align="right">Dummy Data</StyledTableCell>
                <StyledTableCell align="right" sx={{ m: 0 }}>
                  <Tooltip title="Click to update Product details.">
                    <EditIcon sx={{ color: "#48B2E3", mt: 1, cursor: "pointer" }} />
                  </Tooltip>
                </StyledTableCell>
                <StyledTableCell align="right" sx={{ m: 0 }}>
                  <Tooltip title="Click to delete the Product.">
                    <DeleteIcon
                      onClick={() => deletehandle(data.id)}
                      sx={{ color: "#48B2E3", mt: 1, cursor: "pointer" }}
                    />
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))
          ) : (
            <>No Data</>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTableContainer;
