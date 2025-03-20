// src/components/Loading.js
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Layout from "../Layout";

const LoadingPage = () => {
  return (
    <Layout loading={true}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
      </Box>
    </Layout>
  );
};

export default LoadingPage;
