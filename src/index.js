import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import reportWebVitals from "./reportWebVitals";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import Fabula from "./themes/Fabula";

import Home from "./routes/Home";
import Generator from "./routes/generator/generator";
import NpcGallery from "./routes/npc-gallery/npc-gallery";
import NpcCompedium from "./routes/npc-compedium/npc-compedium";
import NpcEdit from "./routes/npc-edit/npc-edit";
import Roller from "./routes/roller/roller";
import RollerScoped from "./routes/roller/roller-scoped";
import Probs from "./routes/probs/probs";
import Combat from "./routes/combat/combat";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={Fabula}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/npc-gallery/:npcId" element={<NpcEdit />} />
          <Route path="/npc-gallery" element={<NpcGallery />} />
          <Route path="/npc-compedium" element={<NpcCompedium />} />
          <Route path="/generate" element={<Generator />} />
          <Route path="/roller" element={<Roller />} />
          <Route path="/roller/:scope" element={<RollerScoped />} />
          <Route path="/probs" element={<Probs />} />
          <Route path="/combat" element={<Combat />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
