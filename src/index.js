import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import reportWebVitals from "./reportWebVitals";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import Home from "./routes/Home";
import Generator from "./routes/generator/generator";
import NpcGallery from "./routes/npc-gallery/npc-gallery";
import NpcCompedium from "./routes/npc-compedium/npc-compedium";
import NpcEdit from "./routes/npc-edit/npc-edit";
import Roller from "./routes/roller/roller";
import RollerScoped from "./routes/roller/roller-scoped";
import Combat from "./routes/combat/combat";
import CharacterSheet from "./routes/character-sheet/character-sheet";
import { lightFabula, darkFabula } from "./themes/Fabula";
import { lightHigh, darkHigh } from "./themes/High";
import { lightTechno, darkTechno } from "./themes/Techno";
import { lightNatural, darkNatural } from "./themes/Natural";
import { lightBravely, darkBravely } from "./themes/Bravely";
import { lightObscura, darkObscura } from "./themes/Obscura";

import {
  ThemeProvider as AppThemeProvider,
  useThemeContext,
} from "./ThemeContext";
import PlayerGallery from "./routes/player-gallery/player-gallery";
import PlayerEdit from "./routes/player-edit/player-edit";
import ErrorBoundary from "./ErrorBoundary";

const themes = {
  Fabula: { light: lightFabula, dark: darkFabula },
  High: { light: lightHigh, dark: darkHigh },
  Techno: { light: lightTechno, dark: darkTechno },
  Natural: { light: lightNatural, dark: darkNatural },
  Bravely: { light: lightBravely, dark: darkBravely },
  Obscura: { light: lightObscura, dark: darkObscura },
};

const App = () => {
  const { selectedTheme, isDarkMode } = useThemeContext();
  const currentTheme = themes[selectedTheme] 
    ? (isDarkMode ? themes[selectedTheme].dark : themes[selectedTheme].light)
    : themes.Fabula.light;


  return (
    <React.StrictMode>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pc-gallery/:playerId" element={<PlayerEdit />} />
              <Route path="/pc-gallery" element={<PlayerGallery />} />
              <Route path="/npc-gallery/:npcId" element={<NpcEdit />} />
              <Route path="/npc-gallery" element={<NpcGallery />} />
              <Route path="/npc-compedium" element={<NpcCompedium />} />
              <Route path="/generate" element={<Generator />} />
              <Route path="/roller" element={<Roller />} />
              <Route path="/roller/:scope" element={<RollerScoped />} />
              <Route path="/combat" element={<Combat />} />
              <Route
                path="/character-sheet/:playerId"
                element={<CharacterSheet />}
              />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const Root = () => (
  <AppThemeProvider>
    <App />
  </AppThemeProvider>
);

const root = document.getElementById("root");
const rootElement = ReactDOM.createRoot(root);
rootElement.render(<Root />);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
