import React, { useEffect } from "react";
import { Container } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "./appbar/AppBar";
import CompactAppBar from "./appbar/CompactAppBar";
import { useThemeContext } from "../ThemeContext";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Bravely" | "Obscura";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean; // New prop for controlling Container width
  loading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth, loading }) => {
  const { selectedTheme, isDarkMode, setTheme, toggleDarkMode } = useThemeContext();

  const handleSelectTheme = (theme: ThemeValue) => {
    setTheme(theme);
  };

  useEffect(() => {
    // Ensure theme and mode are in sync with localStorage
    localStorage.setItem("selectedTheme", selectedTheme);
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [selectedTheme, isDarkMode]);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate(-1);
  };

  const npcRoutes = ["/npc-gallery/:npcId"];
  const isNpcEdit = npcRoutes.some(route =>
    new RegExp(route.replace(/:\w+/, "\\w+")).test(location.pathname)
  );

  const pcRoutes = ["/pc-gallery/:playerId", "/character-sheet/:playerId"];
  const isPcEdit = pcRoutes.some(route =>
    new RegExp(route.replace(/:\w+/, "\\w+")).test(location.pathname)
  );

  // Determine if the current path is the homepage
  const isHomepage = location.pathname === "/";

  return (
    <>
      {!loading && (isNpcEdit || isPcEdit) ? (
        <CompactAppBar
          isNpcEdit={isNpcEdit}
          isPcEdit={isPcEdit}
          selectedTheme={selectedTheme}
          handleSelectTheme={handleSelectTheme}
          isDarkMode={isDarkMode}
          handleToggleDarkMode={toggleDarkMode}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
        />
      ) : (
        <AppBar
          isNpcEdit={isNpcEdit}
          selectedTheme={selectedTheme}
          handleSelectTheme={handleSelectTheme}
          isDarkMode={isDarkMode}
          handleToggleDarkMode={toggleDarkMode}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
        />
      )}
      {fullWidth ? (
        <div style={{ marginTop: "5em" }}>{children}</div>
      ) : (
        <Container style={{ marginTop: "6em", alignItems: "center" }}>
          {children}
        </Container>
      )}
    </>
  );
};

export default Layout;
