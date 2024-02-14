import { Container } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "./appbar/AppBar";

import { useThemeContext } from "../ThemeContext";
import { useLanguageContext } from "../LanguageContext";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Midnight";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { selectedLanguage, setLanguage } = useLanguageContext();
  const { setTheme } = useThemeContext();

  const [selectedTheme, setSelectedTheme] = useState<ThemeValue>(() => {
    return (localStorage.getItem("selectedTheme") as ThemeValue) || "Fabula";
  });

  const handleSelectLanguage = (language: string) => {
    setLanguage(language);
  };

  const handleSelectTheme = (theme: ThemeValue) => {
    setSelectedTheme(theme);
  };

  useEffect(() => {
    // Update the theme and language in localStorage and ThemeContext
    localStorage.setItem("selectedTheme", selectedTheme);
    localStorage.setItem("selectedLanguage", selectedLanguage);
    setTheme(selectedTheme);
  }, [selectedTheme, selectedLanguage, setTheme]);

  const location = useLocation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const fultimatorRoutes = ["/npc-gallery/:npcId"];
  const isNpcEdit = fultimatorRoutes.includes(location.pathname);

  return (
    <>
      <AppBar
        isNpcEdit={isNpcEdit}
        handleGoBack={handleGoBack}
        selectedLanguage={selectedLanguage}
        handleSelectLanguage={handleSelectLanguage}
        selectedTheme={selectedTheme}
        handleSelectTheme={handleSelectTheme}
      />
      <Container
        style={{ marginTop: "7em", alignItems: "center" }}
        key={selectedLanguage}
      >
        {children}
      </Container>
    </>
  );
};

export default Layout;
