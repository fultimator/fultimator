import { Container, Divider, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <Container>
      <RouterLink to="/" style={{ color: "inherit", textDecoration: "none" }}>
        <Typography variant="h1" textAlign="center">
          💎Fultimator!💎
        </Typography>
      </RouterLink>
      <Typography textAlign="center">
        Fultimator è un tool NON UFFICIALE per gestire Fabula Ultima
      </Typography>
      <Divider sx={{ my: 2 }}></Divider>
      {children}
    </Container>
  );
};

export default Layout;
