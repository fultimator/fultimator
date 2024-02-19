import React from "react";
import {
  AppBar as MuiAppBar,
  Container,
  Grid,
  IconButton,
  Typography,
  useScrollTrigger,
  Slide,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import MenuOption from "./MenuOption";

import logo from "./../logo.webp";
import logo929 from "./../logo_929.webp";
import logo1400 from "./../logo_1400.webp";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Midnight";

interface AppBarProps {
  isNpcEdit: boolean;
  handleGoBack: () => void;
  selectedLanguage: string;
  handleSelectLanguage: (language: string) => void;
  selectedTheme: ThemeValue;
  handleSelectTheme: (theme: ThemeValue) => void;
}

const HideOnScroll: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const AppBar: React.FC<AppBarProps> = ({
  isNpcEdit,
  handleGoBack,
  selectedLanguage,
  handleSelectLanguage,
  selectedTheme,
  handleSelectTheme,
}) => {
  const viewportWidth = window.innerWidth;
  const isSmallViewport = viewportWidth <= 600;
  return (
    <HideOnScroll>
      <MuiAppBar position="fixed">
        <Container>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid
              item
              xs={2}
              textAlign="left"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {!isNpcEdit && (
                <IconButton color="inherit" onClick={handleGoBack}>
                  <ArrowBack sx={{ width: "32px", height: "32px" }} />
                </IconButton>
              )}
            </Grid>

            {!isNpcEdit && (
              <Grid
                item
                xs={8}
                textAlign="center"
                sx={{
                  height: "100px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "2px 0",
                }}
              >
                <RouterLink
                  to="/"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h1" textAlign="center">
                    <img
                      style={{ height: '100%', maxHeight: '90px' }}
                      src={isSmallViewport ? logo : undefined}
                      srcSet={isSmallViewport ? undefined : `${logo} 600w, ${logo929} 929w, ${logo1400} 1400w`}
                      sizes={isSmallViewport ? undefined : '100vw'}
                      alt="Fultimator"
                    />
                  </Typography>
                </RouterLink>
              </Grid>
            )}

            <Grid
              item
              xs={2}
              sx={{ textAlign: "right" }}
            >
              <Grid
                container
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <MenuOption
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={handleSelectLanguage}
                  selectedTheme={selectedTheme}
                  onSelectTheme={handleSelectTheme}
                />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </MuiAppBar>
    </HideOnScroll>
  );
};

export default AppBar;
