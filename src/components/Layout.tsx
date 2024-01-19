import { Container, Divider, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

import logo200 from "./logo_200.webp";
import logo929 from "./logo_929.webp";
import logo1400 from "./logo_1400.webp";

import sublogo200 from "./sublogo_200.webp";
import sublogo834 from "./sublogo_834.webp";
import sublogo1262 from "./sublogo_1262.webp";
import sublogo1400 from "./sublogo_1400.webp";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Container style={{ marginTop: "1em" }}>
      <RouterLink
        to="/"
        style={{
          color: "inherit",
          textDecoration: "none",
          textAlign: "center",
        }}
      >
        <Typography variant="h1" textAlign="center" sx={{p: 0, m:0}}>
          <img
            width="60%"
            sizes="(max-width: 1400px) 100vw, 1400px"
            srcSet={`${logo200} 200w,${logo929} 929w,${logo1400} 1400w`}
            src={logo1400}
            alt="Fultimator"/>
        </Typography>
      </RouterLink>
      <Typography variant="h2" textAlign="center" sx={{p: 0, m:0}}>
        <img
          width="20%"
          sizes="(max-width: 1400px) 100vw, 1400px"
          srcSet={`${sublogo200} 200w, ${sublogo834} 814w, ${sublogo1262} 1227w,${sublogo1400} 1400w`}
          src={sublogo1400}
          alt="An Unofficial tool for TTRPG Fabula Ultima"/>
      </Typography>
      <Divider sx={{my: 2}}></Divider>
      {children}
    </Container>
  );
};

export default Layout;
