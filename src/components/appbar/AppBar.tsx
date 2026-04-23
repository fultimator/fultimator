import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Container,
  Grid,
  IconButton,
  Typography,
  useScrollTrigger,
  Slide,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router";
import { ArrowBack, Search, Tune as TuneIcon } from "@mui/icons-material";
import MenuOption from "./MenuOption";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import type { ThemeValue, StyleProfileValue } from "../../store/themeStore";

import logo929 from "./../logo_929.webp";
import logo1400 from "./../logo_1400.webp";

interface AppBarProps {
  isNpcEdit: boolean;
  selectedTheme: ThemeValue;
  selectedStyleProfile: StyleProfileValue;
  handleSelectTheme: (theme: ThemeValue) => void;
  handleSelectStyleProfile: (profile: StyleProfileValue) => void;
  isDarkMode: boolean;
  handleToggleDarkMode: () => void;
  showGoBackButton: boolean;
  handleNavigation: () => void;
  onOpenDrawer?: () => void;
}

const HideOnScroll: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const AppBar: React.FC<AppBarProps> = ({
  isNpcEdit,
  selectedTheme,
  selectedStyleProfile,
  handleSelectTheme,
  handleSelectStyleProfile,
  isDarkMode,
  handleToggleDarkMode,
  showGoBackButton,
  handleNavigation,
  onOpenDrawer,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const viewportWidth = window.innerWidth;
  const isSmallViewport = viewportWidth <= 600;

  const openCompendiumModal = () => setModalOpen(true);
  const closeCompendiumModal = () => setModalOpen(false);
  return (
    <>
      <HideOnScroll>
        <MuiAppBar
          position="fixed"
          sx={(theme) => ({
            background: isDarkMode
              ? `linear-gradient(to bottom, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`
              : theme.palette.primary.main,
          })}
        >
          <Container>
            <Grid
              container
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Grid
                size={2}
                sx={{
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                {showGoBackButton && (
                  <IconButton color="inherit" onClick={handleNavigation}>
                    <ArrowBack />
                  </IconButton>
                )}
              </Grid>

              {!isNpcEdit && (
                <Grid
                  size={8}
                  sx={{
                    textAlign: "center",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "4px 0 0",
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
                    <Typography sx={{ textAlign: "center" }}>
                      <img
                        style={{
                          height: "100%",
                          maxHeight: "60px",
                          filter: isDarkMode
                            ? "brightness(0.9) drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))"
                            : "brightness(1.05) drop-shadow(0 0 1px rgba(0, 0, 0, 0.2))",
                        }}
                        src={isSmallViewport ? logo929 : undefined}
                        srcSet={
                          isSmallViewport
                            ? undefined
                            : `${logo929} 600w, ${logo929} 929w, ${logo1400} 1400w`
                        }
                        sizes={isSmallViewport ? undefined : "100vw"}
                        alt="Fultimator"
                      />
                    </Typography>
                  </RouterLink>
                </Grid>
              )}

              <Grid sx={{ textAlign: "right" }} size={2}>
                <Grid
                  container
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Tooltip title="Open Compendium">
                    <IconButton color="inherit" onClick={openCompendiumModal}>
                      <Search />
                    </IconButton>
                  </Tooltip>
                  {onOpenDrawer && (
                    <Tooltip title="Open Drawer">
                      <IconButton color="inherit" onClick={onOpenDrawer}>
                        <TuneIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <MenuOption
                    selectedTheme={selectedTheme}
                    selectedStyleProfile={selectedStyleProfile}
                    onSelectTheme={handleSelectTheme}
                    onSelectStyleProfile={handleSelectStyleProfile}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={handleToggleDarkMode}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </MuiAppBar>
      </HideOnScroll>
      <CompendiumViewerModal
        open={modalOpen}
        onClose={closeCompendiumModal}
        onAddItem={() => {}}
        context="appbar"
        restrictToTypes={[]}
        viewOnly
      />
    </>
  );
};

export default AppBar;
