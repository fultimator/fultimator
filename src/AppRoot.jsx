import React, { Suspense } from "react";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router";
import { IS_ELECTRON } from "./platform";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Home from "./routes/Home";
import { createThemeComponents } from "./themes/themeComponentFactory";
import { resolveThemePalette } from "./themes/resolveThemePalette";
import {
  THEMES_REGISTRY,
  THEME_DEFAULT_PROFILE_MAP,
  STYLE_PROFILE_MAP,
} from "./themes/themeRegistry";

import { useThemeStore } from "./store/themeStore";
import { useShallow } from "zustand/react/shallow";
import { DatabaseProvider } from "./context/DatabaseContext";
import ErrorBoundary from "./ErrorBoundary";
import LoadingPage from "./components/common/LoadingPage";

const NpcGallery = React.lazy(() => import("./routes/npc-gallery/npc-gallery"));
const NpcEdit = React.lazy(() => import("./routes/npc-edit/npc-edit"));
const NpcCompedium = React.lazy(
  () => import("./routes/npc-compedium/npc-compedium"),
);
const PlayerEdit = React.lazy(() => import("./routes/player-edit/player-edit"));
const PlayerGallery = React.lazy(
  () => import("./routes/player-gallery/player-gallery"),
);
const CharacterSheet = React.lazy(
  () => import("./routes/character-sheet/character-sheet"),
);
const CombatSimulator = React.lazy(
  () => import("./routes/combat/combatSimulator"),
);
const CombatSimulatorEncounters = React.lazy(
  () => import("./routes/combat/combatSimulatorEncounters"),
);
const Generator = React.lazy(() => import("./routes/generator/generator"));
const Roller = React.lazy(() => import("./routes/roller/roller"));
const RollerScoped = React.lazy(() => import("./routes/roller/roller-scoped"));
const Resources = React.lazy(() => import("./routes/resources/resources"));
const CompendiumViewer = React.lazy(
  () => import("./routes/compendium/compendium"),
);

const Router = IS_ELECTRON ? MemoryRouter : BrowserRouter;

export const App = () => {
  const { selectedTheme, selectedStyleProfile, isDarkMode, customization } =
    useThemeStore(
      useShallow((s) => ({
        selectedTheme: s.selectedTheme,
        selectedStyleProfile: s.selectedStyleProfile,
        isDarkMode: s.isDarkMode,
        customization: s.customization,
      })),
    );

  const currentTheme = React.useMemo(() => {
    const baseTheme = THEMES_REGISTRY[selectedTheme]
      ? isDarkMode
        ? THEMES_REGISTRY[selectedTheme].dark
        : THEMES_REGISTRY[selectedTheme].light
      : THEMES_REGISTRY.Fabula.light;

    const resolvedPalette = resolveThemePalette(baseTheme, customization);

    // Determine which style profile to use
    const profileKey =
      selectedStyleProfile === "ThemeDefault"
        ? THEME_DEFAULT_PROFILE_MAP[selectedTheme] || "flat"
        : STYLE_PROFILE_MAP[selectedStyleProfile] || "flat";

    return createTheme(baseTheme, {
      palette: {
        primary: { main: resolvedPalette.primary },
        secondary: { main: resolvedPalette.secondary },
        ternary: { main: resolvedPalette.ternary },
        quaternary: { main: resolvedPalette.quaternary },
      },
      components: createThemeComponents({
        mode: isDarkMode ? "dark" : "light",
        primary: resolvedPalette.primary,
        secondary: resolvedPalette.secondary,
        ternary: resolvedPalette.ternary,
        quaternary: resolvedPalette.quaternary,
        paper: resolvedPalette.paper,
        profile: profileKey,
        panelRadiusOverride: customization.panelRadius,
        controlRadiusOverride: customization.controlRadius,
        styleCustomization: customization,
      }),
    });
  }, [selectedTheme, selectedStyleProfile, isDarkMode, customization]);

  return (
    <React.StrictMode>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/pc-gallery/:playerId"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <PlayerEdit />
                  </Suspense>
                }
              />
              <Route
                path="/player-edit/:playerId"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <PlayerEdit />
                  </Suspense>
                }
              />
              <Route
                path="/pc-gallery"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <PlayerGallery />
                  </Suspense>
                }
              />
              <Route
                path="/player-edit"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <PlayerGallery />
                  </Suspense>
                }
              />
              <Route
                path="/player-gallery"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <PlayerGallery />
                  </Suspense>
                }
              />
              <Route
                path="/npc-gallery/:npcId"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <NpcEdit />
                  </Suspense>
                }
              />
              <Route
                path="/npc-gallery"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <NpcGallery />
                  </Suspense>
                }
              />
              <Route
                path="/npc-compedium"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <NpcCompedium />
                  </Suspense>
                }
              />
              <Route
                path="/generate"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <Generator />
                  </Suspense>
                }
              />
              <Route
                path="/roller"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <Roller />
                  </Suspense>
                }
              />
              <Route
                path="/roller/:scope"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <RollerScoped />
                  </Suspense>
                }
              />
              <Route
                path="/combat-sim"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CombatSimulatorEncounters />
                  </Suspense>
                }
              />
              <Route
                path="/combat-sim/:id"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CombatSimulator />
                  </Suspense>
                }
              />
              <Route
                path="/character-sheet/:playerId"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CharacterSheet />
                  </Suspense>
                }
              />
              <Route
                path="/resources"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <Resources />
                  </Suspense>
                }
              />
              <Route
                path="/compendium"
                element={
                  <Suspense fallback={<LoadingPage />}>
                    <CompendiumViewer />
                  </Suspense>
                }
              />
            </Routes>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export const Root = () => (
  <DatabaseProvider>
    <App />
  </DatabaseProvider>
);
