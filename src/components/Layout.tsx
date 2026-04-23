import React, { useEffect } from "react";
import { Container, Box, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import AppBar from "./appbar/AppBar";
import CompactAppBar from "./appbar/CompactAppBar";
import { AppDrawer } from "./app-drawer/AppDrawer";
import { APP_DRAWER_WIDTH } from "./app-drawer/constants";
import { useThemeStore } from "../store/themeStore";
import type { ThemeValue, StyleProfileValue } from "../store/themeStore";
import { globalConfirm } from "../utility/globalConfirm";
import { useTranslate } from "../translation/translate";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  unsavedChanges?: boolean;
  loading?: boolean;
}

// Define a custom type for our navigation state
interface NavigationState {
  from?: string;
  search?: string;
}

const DRAWER_WIDTH = APP_DRAWER_WIDTH;

const Layout: React.FC<LayoutProps> = ({
  children,
  fullWidth,
  unsavedChanges,
  loading,
}) => {
  const { t } = useTranslate();
  const {
    selectedTheme,
    selectedStyleProfile,
    isDarkMode,
    setTheme,
    setStyleProfile,
    toggleDarkMode,
    drawerOpen,
    toggleDrawer,
    setDrawerOpen,
  } = useThemeStore();

  const handleSelectTheme = (theme: ThemeValue) => {
    setTheme(theme);
  };
  const handleSelectStyleProfile = (profile: StyleProfileValue) => {
    setStyleProfile(profile);
  };

  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation state if it exists
  const navState = location.state as NavigationState | null;

  // Track navigation path for complex routing scenarios
  useEffect(() => {
    // Store previous route when navigating to specific detail pages
    const currentPath = location.pathname;
    const state = location.state as NavigationState | undefined;

    // We only want to update the state when navigating directly to the page
    // and not when this effect runs on initial load with a state already set
    if (state?.from) return;

    if (
      currentPath.match(/\/npc-gallery\/[^/]+$/) ||
      currentPath.match(/\/pc-gallery\/[^/]+$/) ||
      currentPath.match(/\/character-sheet\/[^/]+$/)
    ) {
      // Store current path before navigating to the detail page
      sessionStorage.setItem("previousPath", currentPath);
    }
  }, [location.pathname, location.state]);

  const handleNavigation = async () => {
    if (unsavedChanges) {
      const message = t(
        "You have unsaved changes. Are you sure you want to leave?",
      );
      const confirmation = await globalConfirm(message);
      if (!confirmation) return;
    }

    const currentPath = location.pathname;

    // Extract any potential IDs from the current path
    const npcIdMatch = currentPath.match(/\/npc-gallery\/([^/]+)$/);
    const playerIdMatch =
      currentPath.match(/\/pc-gallery\/([^/]+)$/) ||
      currentPath.match(/\/character-sheet\/([^/]+)$/);
    const combatIdMatch = currentPath.match(/\/combat-sim\/([^/]+)$/);

    // Handle navigation based on current route and state
    if (npcIdMatch) {
      // We're in /npc-gallery/:npcId
      if (navState?.from?.startsWith("/combat-sim/")) {
        // If we came from a combat simulator, go back there (From NPC edit button in combat sim)
        navigate(navState.from);
      } else if (navState?.from?.startsWith("/pc-gallery/")) {
        // If we came from a player gallery, go back there (From companion edit button)
        navigate(navState.from);
      } else {
        // Otherwise go back to npc gallery with preserved search params
        const params = location.search || navState?.search || "";
        navigate(`/npc-gallery${params}`);
      }
    } else if (playerIdMatch) {
      // We're in /pc-gallery/:playerId or /character-sheet/:playerId
      if (navState?.from) {
        // If we have a stored "from" path, navigate there
        navigate(navState.from);
      } else {
        // Default to pc-gallery
        navigate("/pc-gallery");
      }
    } else if (currentPath === "/npc-gallery") {
      // From NPC Gallery, always go home
      navigate("/");
    } else if (currentPath === "/combat-sim") {
      // From Combat Sim list, always go home
      navigate("/");
    } else if (currentPath === "/pc-gallery") {
      // From PC Gallery, always go home
      navigate("/");
    } else if (combatIdMatch) {
      // From specific combat sim, go to combat sim list
      navigate("/combat-sim");
    } else if (currentPath === "/") {
      // We're already home, do nothing or navigate to a default
      return;
    } else {
      // For any other page, use default back behavior
      navigate(-1);
    }
  };

  const npcRoutes = ["/npc-gallery/:npcId"];
  const isNpcEdit = npcRoutes.some((route) =>
    new RegExp(route.replace(/:\w+/, "[^/]+")).test(location.pathname),
  );

  const pcRoutes = ["/pc-gallery/:playerId", "/character-sheet/:playerId"];
  const isPcEdit = pcRoutes.some((route) =>
    new RegExp(route.replace(/:\w+/, "[^/]+")).test(location.pathname),
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
          selectedStyleProfile={selectedStyleProfile}
          handleSelectTheme={handleSelectTheme}
          handleSelectStyleProfile={handleSelectStyleProfile}
          isDarkMode={isDarkMode}
          handleToggleDarkMode={toggleDarkMode}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
          onOpenDrawer={toggleDrawer}
        />
      ) : (
        <AppBar
          isNpcEdit={isNpcEdit}
          selectedTheme={selectedTheme}
          selectedStyleProfile={selectedStyleProfile}
          handleSelectTheme={handleSelectTheme}
          handleSelectStyleProfile={handleSelectStyleProfile}
          isDarkMode={isDarkMode}
          handleToggleDarkMode={toggleDarkMode}
          showGoBackButton={!isHomepage}
          handleNavigation={handleNavigation}
          onOpenDrawer={toggleDrawer}
        />
      )}

      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Box
        sx={{
          marginRight: !isMobile && drawerOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: (theme) =>
            theme.transitions.create("marginRight", {
              easing: drawerOpen
                ? theme.transitions.easing.easeOut
                : theme.transitions.easing.sharp,
              duration: drawerOpen
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {fullWidth ? (
          <div style={{ marginTop: "5em" }}>{children}</div>
        ) : (
          <Container style={{ marginTop: "6em", alignItems: "center" }}>
            {children}
          </Container>
        )}
      </Box>
    </>
  );
};

export default Layout;
