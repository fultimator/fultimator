import { Container, Divider, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Container style={{ marginTop: "1em" }}>
      <RouterLink to="/" style={{ color: "inherit", textDecoration: "none" }}>
        <Typography variant="h1">Fultimator!</Typography>
      </RouterLink>
      <Typography>
        Fultimator is an Unofficial tool for TTRPG Fabula Ultima
      </Typography>
      <Divider sx={{ my: 2 }}></Divider>
      {children}
    </Container>
  );
};

export default Layout;
