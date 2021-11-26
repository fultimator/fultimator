import { Container, Divider, Typography } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <Container>
      <Typography variant="h1" textAlign="center">
        💎Fultimator!💎
      </Typography>
      <Typography textAlign="center">
        Fultimator è un tool NON UFFICIALE per gestire Fabula Ultima
      </Typography>
      <Divider sx={{ my: 2 }}></Divider>
      {children}
    </Container>
  );
};

export default Layout;
