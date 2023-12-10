import { Container, Divider, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Layout = ({ children }) => {
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
