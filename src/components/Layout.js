import { Container, Divider, Typography } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <Container>
      <Typography variant="h1" textAlign="center">
        💎Fultimator!💎
      </Typography>
      <Typography textAlign="center">
        Fultimator is an UNOFFICIAL tool to manage your Fabula Ultima campaigns
      </Typography>
      <Divider sx={{ my: 2 }}></Divider>
      {children}
    </Container>
  );
};

export default Layout;
