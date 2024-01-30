import { Container } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "./appbar/AppBar";

import { useThemeContext } from "../ThemeContext";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Midnight";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    // Fetch language from localStorage
    return localStorage.getItem("selectedLanguage") || "en";
  });

  const [selectedTheme, setSelectedTheme] = useState<ThemeValue>(() => {
    // Fetch theme from localStorage
    return (
      (localStorage.getItem("selectedTheme") as ThemeValue) || "Fabula"
    );
  });

  const location = useLocation();
  const navigate = useNavigate();

  const { setTheme } = useThemeContext();

  const handleSelectLanguage = (language: string) => {
    console.log(`Theme changed to: ${language}`);
    setSelectedLanguage(language);
  };

  const handleSelectTheme = (theme: ThemeValue) => {
    console.log(`Theme changed to: ${theme}`);
    setSelectedTheme(theme);
  };

  useEffect(() => {
    // Update the theme and language in localStorage and ThemeContext
    localStorage.setItem("selectedTheme", selectedTheme);
    localStorage.setItem("selectedLanguage", selectedLanguage);
    setTheme(selectedTheme);
  }, [selectedTheme, selectedLanguage, setTheme]);

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
      <Container style={{ marginTop: "8em", alignItems: "center" }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;
