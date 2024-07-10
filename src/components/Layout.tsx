import { Container } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "./appbar/AppBar";
import CompactAppBar from "./appbar/CompactAppBar";
import { useThemeContext } from "../ThemeContext";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Midnight";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean; // New prop for controlling Container width
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth }) => {
  const { setTheme } = useThemeContext();
  const [selectedTheme, setSelectedTheme] = useState<ThemeValue>(() => {
    return (localStorage.getItem("selectedTheme") as ThemeValue) || "Fabula";
  });

  const handleSelectTheme = (theme: ThemeValue) => {
    setSelectedTheme(theme);
  };

  useEffect(() => {
    // Update the theme in localStorage and ThemeContext
    localStorage.setItem("selectedTheme", selectedTheme);
    setTheme(selectedTheme);
  }, [selectedTheme, setTheme]);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(-1);
  };

  const fultimatorRoutes = ["/npc-gallery/:npcId"];
  const isNpcEdit = fultimatorRoutes.some(route =>
    new RegExp(route.replace(/:\w+/, "\\w+")).test(location.pathname)
  );  

  // Determine if the current path is the homepage
  const isHomepage = location.pathname === "/";

  return (
    <>
      {isNpcEdit ? (
        <CompactAppBar
          isNpcEdit={isNpcEdit}
          selectedTheme={selectedTheme}
          handleSelectTheme={handleSelectTheme}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
        />
      ) : (
        <AppBar
          isNpcEdit={isNpcEdit}
          selectedTheme={selectedTheme}
          handleSelectTheme={handleSelectTheme}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
        />
      )}
      {fullWidth ? (
        <div style={{ marginTop: "4em" }}>{children}</div>
      ) : (
        <Container style={{ marginTop: "6em", alignItems: "center" }}>
          {children}
        </Container>
      )}
    </>
  );
};

export default Layout;
