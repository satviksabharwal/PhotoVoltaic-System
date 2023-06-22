import { Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import { StyledTableCell, StyledTableRow } from "./TableContainer.styled";

const ProductTableContainer = (productData) => {
  // const [tableData, setTableData] = useState(productData.productData);
  console.log(productData?.productData?.length);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} maxWidth="l" aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Product Name</StyledTableCell>
            <StyledTableCell align="right">Power Peak</StyledTableCell>
            <StyledTableCell align="right">Orientation</StyledTableCell>
            <StyledTableCell align="right">Inclination</StyledTableCell>
            <StyledTableCell align="right">Area</StyledTableCell>
            <StyledTableCell align="right">Longitude</StyledTableCell>
            <StyledTableCell align="right">Latitude</StyledTableCell>
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
