import { Container, Typography } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet-async";

const VisualMap = () => (
  <>
    <Helmet>
      <title> Dashboard: Visual Map </title>
    </Helmet>
    <Container maxWidth="l">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Visual Map
      </Typography>
    </Container>
  </>
);

export default VisualMap;
